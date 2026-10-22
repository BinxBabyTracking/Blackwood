import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { concepts } from "@/game/engine/matcher";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Saved interview answers, shared across players (table interview_answer_cache).
 *
 * A question is looked up by character and by subject: its normalised text
 * first, then the set of subject words the built-in matcher reads from it, so
 * "Did you see anyone that night?" and "Did you notice anybody that evening?"
 * share an answer. Answers in a character's own words are filed under a
 * fingerprint of exactly what that character knew, and only reused for a
 * player at the same point. Anything that fails here simply falls through to
 * the interview model; the cache never blocks a question.
 */

const TABLE = "interview_answer_cache";
/** Questions with fewer subject words than this lean on context ("and then?") and are never cached. */
const MIN_CONCEPTS = 2;

export interface CachedResult {
  match: string | null;
  composed: string | null;
  facts?: number[];
}

export function normalise(question: string) {
  return question
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The question's subject, as a sorted set of the matcher's concepts. */
export function subject(question: string) {
  return [...new Set(concepts(question))].sort();
}

/** A fingerprint of what a character knows right now (the facts available to them). */
export function knowledgeKey(characterId: string, knownFactIndices: number[]) {
  return createHash("sha256").update(`${characterId}|${[...knownFactIndices].sort((a, b) => a - b).join(",")}`).digest("hex").slice(0, 32);
}

type Row = { id: number; kind: "entry" | "answer"; question_norm: string; concepts: string[]; entry_id: string | null; answer: string | null; facts: number[] | null; hits: number };

/**
 * A saved result for this question, if one fits. `entryOk` says whether an
 * authored answer is open to this player right now; a saved routing to an
 * answer that isn't open is ignored.
 */
export async function findCached(
  caseId: string,
  characterId: string,
  question: string,
  knowledge: string,
  entryOk: (id: string) => boolean,
): Promise<CachedResult | null> {
  const db = createAdminClient();
  const subj = subject(question);
  if (!db || subj.length < MIN_CONCEPTS) return null;
  const norm = normalise(question);
  const fields = "id, kind, question_norm, concepts, entry_id, answer, facts, hits";
  try {
    const [entries, answers] = await Promise.all([
      db.from(TABLE).select(fields).eq("case_id", caseId).eq("character_id", characterId).eq("kind", "entry").limit(500),
      db.from(TABLE).select(fields).eq("case_id", caseId).eq("character_id", characterId).eq("kind", "answer").eq("knowledge_key", knowledge).limit(500),
    ]);
    if (entries.error || answers.error) return null;
    const rows = [...((entries.data ?? []) as Row[]).filter((r) => r.entry_id && entryOk(r.entry_id)), ...((answers.data ?? []) as Row[])];
    const key = subj.join(" ");
    const same = (r: Row) => r.question_norm === norm;
    const similar = (r: Row) => (r.concepts ?? []).join(" ") === key;
    // The same words first; otherwise the same subject, preferring the answer reused most.
    const hit = rows.find(same) ?? rows.filter(similar).sort((a, b) => (b.hits ?? 0) - (a.hits ?? 0))[0];
    if (!hit) return null;
    // Count the reuse once the answer is on its way.
    after(async () => {
      await db.from(TABLE).update({ hits: (hit.hits ?? 0) + 1, last_used_at: new Date().toISOString() }).eq("id", hit.id);
    });
    return hit.kind === "entry" ? { match: hit.entry_id, composed: null } : { match: null, composed: hit.answer, facts: hit.facts ?? [] };
  } catch {
    return null;
  }
}

/** Saves what the interview model made of a question, for the next player who asks the same thing. */
export async function saveCached(
  caseId: string,
  characterId: string,
  question: string,
  knowledge: string,
  result: CachedResult,
) {
  const db = createAdminClient();
  const subj = subject(question);
  if (!db || subj.length < MIN_CONCEPTS) return;
  const row =
    result.match !== null
      ? { kind: "entry", knowledge_key: "", entry_id: result.match, answer: null, facts: [] as number[] }
      : result.composed
        ? { kind: "answer", knowledge_key: knowledge, entry_id: null, answer: result.composed, facts: result.facts ?? [] }
        : null;
  if (!row) return;
  try {
    // A clash with the same question saved a moment ago by someone else is fine: theirs stands.
    await db.from(TABLE).insert({ case_id: caseId, character_id: characterId, question: question.slice(0, 300), question_norm: normalise(question), concepts: subj, ...row });
  } catch {
    /* saving is best-effort */
  }
}
