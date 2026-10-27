import "server-only";
import { after } from "next/server";
import { acceptedOffer, interviewCandidates, knownFacts } from "@/game/engine/engine";
import { bestMatch } from "@/game/engine/matcher";
import { recordUsage } from "@/lib/usage";
import { findCached, knowledgeKey, saveCached } from "./answer-cache";
import type { CaseDefinition, InvestigationState } from "@/game/engine/types";

/*
 * Answering a question asked in the player's own words.
 *
 * 1. If an authored answer fits, the character gives it. Authored answers carry
 *    the story's effects (timeline entries, follow-ups, evidence), so they win.
 * 2. Otherwise the character answers in their own words from their knowledge:
 *    only the facts unlocked so far, in their own version of events. If those
 *    facts don't cover the question, they say they don't know.
 *
 * Step 2, and better routing in step 1, need ANTHROPIC_API_KEY. The model is
 * shown the allowed entries' neutral wording, the unlocked facts and the recent
 * conversation. Never locked entries, never the solution. Without a key, or if
 * the call fails, the built-in matcher routes the question and anything it
 * can't place gets the character's "I don't know" line.
 */

const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const MODEL = process.env.INTERVIEW_MODEL ?? "claude-haiku-5-5";
const API_BASE = (process.env.ANTHROPIC_API_BASE ?? "https://api.anthropic.com").replace(/\/$/, "");
/** For a key that isn't scoped to one workspace, the workspace to use (Anthropic Console, Settings, Workspaces). */
const WORKSPACE = (process.env.ANTHROPIC_WORKSPACE_ID ?? "").trim();
const headers = () => ({
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01",
  "content-type": "application/json",
  ...(WORKSPACE ? { "anthropic-workspace-id": WORKSPACE } : {}),
});

export const interviewAIConfigured = Boolean(API_KEY);

/** Words that point back at something already said ("what did HE look like?"). */
const BACK_REFERENCE = /\b(he|him|his|she|her|hers|they|them|their|it|its|that|this|those|these|there|then|the man|the woman|the guy)\b/i;

/** The authored entry this character last answered with, if any. */
function lastEntry(s: InvestigationState, characterId: string) {
  const lines = s.conversations[characterId] ?? [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (l.speaker === characterId && l.q && l.q !== "none") return l.q;
  }
  return null;
}

/** The last failure talking to the interview model, kept so the Admin page can show it. */
async function noteFailure(message: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const db = createAdminClient();
  if (!db) return;
  await db.from("site_settings").upsert({ key: "interview_ai_last_error", value: { at: new Date().toISOString(), message: message.slice(0, 300) }, updated_at: new Date().toISOString() });
}

export interface Interpretation {
  match: string | null;
  composed: string | null;
  /** For a composed answer: which of the character's facts it used, so their effects apply. */
  facts?: number[];
}

/** Who is asking, for the spending ledger. */
export interface AskContext {
  userId: string;
  sessionId: string;
}

export async function interpretQuestion(
  def: CaseDefinition,
  s: InvestigationState,
  characterId: string,
  question: string,
  ctx?: AskContext,
): Promise<Interpretation> {
  const text = question.replace(/\s+/g, " ").trim().slice(0, 300);
  // A short yes to something just offered needs no interpreting.
  const offered = acceptedOffer(def, s, characterId, text);
  if (offered) return { match: offered, composed: null };
  // Entries not yet asked come first, so an equally good match prefers new information.
  const all = interviewCandidates(def, s, characterId);
  const candidates = [...all.filter((q) => q.repeatable || !s.asked.includes(q.id)), ...all.filter((q) => !q.repeatable && s.asked.includes(q.id))];
  // A follow-up ("what did he look like?") is about whatever was just discussed.
  const followUp = BACK_REFERENCE.test(text) && (s.conversations[characterId] ?? []).length > 0;
  const previous = followUp ? lastEntry(s, characterId) : null;
  const previousPrompt = previous ? def.questions.find((q) => q.id === previous)?.prompt ?? "" : "";
  const local = candidates.length ? bestMatch(text, candidates) ?? (previousPrompt ? bestMatch(`${text} ${previousPrompt}`, candidates) : null) : null;
  const person = def.characters.find((c) => c.id === characterId);
  if (!person) return { match: local, composed: null };

  // Someone may already have asked this, or something with the same subject, at the same point in the case.
  const facts = knownFacts(def, s, characterId);
  const knowledge = knowledgeKey(characterId, facts.map((f) => f.index));
  // A follow-up depends on the conversation, so it is never answered from, or saved to, the shared cache.
  const cached = followUp ? null : await findCached(def.id, characterId, text, knowledge, (id) => candidates.some((q) => q.id === id));
  if (cached) {
    if (ctx) recordUsage({ userId: ctx.userId, sessionId: ctx.sessionId, caseId: def.id, characterId, service: "claude", purpose: "interview", model: MODEL, saved: true });
    return cached;
  }
  if (!API_KEY) {
    after(() => noteFailure("ANTHROPIC_API_KEY is not set on the server.").catch(() => undefined));
    return { match: local, composed: null };
  }

  const recent = (s.conversations[characterId] ?? [])
    .filter((l) => l.speaker !== "cue")
    .slice(-8)
    .map((l) => `${l.speaker === "you" ? "Investigator" : person.name}: ${l.text}`)
    .join("\n");
  // Each entry with the gist of its answer, so the model can tell which one a differently worded question is after.
  const gist = (q: (typeof candidates)[number]) => {
    const r = q.reply.join(" ");
    return r.length > 180 ? `${r.slice(0, 180)}...` : r;
  };
  const entries = candidates
    .map((q) => `${q.id}: ${q.prompt}${q.keywords?.length ? ` (also: ${q.keywords.join(" ")})` : ""}${s.asked.includes(q.id) ? " [already answered]" : ""}\n   answer: ${gist(q)}`)
    .join("\n");

  const system = [
    "You are the interview engine of a 1985 Los Angeles detective game. An investigator asks a question in their own words.",
    "First, if one of the AUTHORED ENTRIES answers the question (same subject, any wording, even if the question is vague or uses 'him' or 'it' for someone just mentioned), reply exactly: ENTRY <id>",
    "Judge an entry by its answer, not only its wording: 'What car does Mercer drive?' is answered by an entry whose answer describes his car, even if that entry is worded 'Does Mercer bring his car here?'.",
    "Prefer an entry not yet answered. An [already answered] entry only fits if the question really asks the same thing again.",
    "Asking for, or to see, an object the character has is covered by the entry that hands it over; prefer that entry.",
    `Otherwise, answer as ${person.name}, in character, using ONLY the FACTS listed. Reply exactly: ANSWER <reply>`,
    "Then, on a new line, list the numbers of the facts your answer states or relies on: USED <numbers separated by commas>, or USED none.",
    "Rules for ANSWER:",
    "- Use only the FACTS. Never invent names, times, places, events, evidence, motives or opinions about guilt that the facts do not state.",
    "- Treat the question as part of the conversation: a follow-up ('what did he look like?', 'what else?') is about what was just discussed.",
    "- If the facts do not give the exact detail asked, say so briefly in character, then share what you DO know that is closest to it, the way a real witness would. Example: asked what a customer looked like when the facts only mention his jacket, say you didn't get a good look, all you remember is the jacket. Do not guess or invent the missing detail.",
    "- Only if nothing in the facts relates at all, say plainly in character that you don't know. Never say you can't answer 'right now'.",
    "- Never accuse anyone and never confess. Some facts are the character's own claims; state them as the character would.",
    "- One to three short spoken sentences, natural American English of 1985 with American spelling (check, color, neighbor, jewelry). No stage directions, no quotation marks, no em dashes.",
    "- Stay consistent with the conversation so far.",
    "- Hand over, show or offer an object or document only when a fact you use says you do (then list that fact in USED). Otherwise never offer, promise or pretend to hand anything over; if asked for something you don't have, say so plainly.",
    `Character: ${person.persona ?? person.name}`,
  ].join("\n");
  const user = [
    `AUTHORED ENTRIES:\n${entries || "(none)"}`,
    `FACTS ${person.name} knows:\n${facts.map((x) => `[${x.index}] ${x.text}`).join("\n") || "(none)"}`,
    recent ? `CONVERSATION SO FAR:\n${recent}` : "",
    `INVESTIGATOR ASKS: ${text}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const res = await fetch(`${API_BASE}/v1/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model: MODEL, max_tokens: 220, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).replace(/sk-ant-[A-Za-z0-9_-]+/g, "[key]").slice(0, 200);
      throw new Error(`Anthropic returned ${res.status}: ${detail}`);
    }
    const body = (await res.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; model?: string };
    if (ctx) {
      recordUsage({
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        caseId: def.id,
        characterId,
        service: "claude",
        purpose: "interview",
        model: body.model ?? MODEL,
        inputTokens: body.usage?.input_tokens,
        outputTokens: body.usage?.output_tokens,
      });
    }
    const out = (body.content?.find((c) => c.type === "text")?.text ?? "").trim();
    const entry = /^ENTRY\s+([a-z0-9_]+)/i.exec(out);
    if (entry) {
      if (!candidates.some((q) => q.id === entry[1])) return { match: local, composed: null };
      if (!followUp) after(() => saveCached(def.id, characterId, text, knowledge, { match: entry[1], composed: null }));
      return { match: entry[1], composed: null };
    }
    const answer = /^ANSWER\s*:?\s*([\s\S]+?)\s*(?:\n\s*USED\b\s*:?\s*([^\n]*))?\s*$/i.exec(out);
    if (answer) {
      const allowed = new Set(facts.map((x) => x.index));
      const used = [...(answer[2] ?? "").matchAll(/\d+/g)].map((m) => Number(m[0])).filter((n) => allowed.has(n));
      const result = { match: null, composed: answer[1].trim(), facts: used };
      if (!followUp) after(() => saveCached(def.id, characterId, text, knowledge, result));
      return result;
    }
    return { match: local, composed: null };
  } catch (e) {
    console.error("interview: falling back to the built-in matcher:", (e as Error).message);
    after(() => noteFailure((e as Error).message).catch(() => undefined));
    return { match: local, composed: null };
  }
}

/** Admin check: one tiny call to the interview model, reporting exactly what comes back. Never returns the key. */
export async function testInterviewModel(): Promise<{ ok: boolean; model: string; keyType: string; workspace: string; status: number | null; message: string }> {
  const workspace = WORKSPACE ? `set (${WORKSPACE.slice(0, 12)}...)` : "not set";
  const keyType = !API_KEY ? "none" : API_KEY.startsWith("sk-ant-api") ? "API key (sk-ant-api...)" : API_KEY.startsWith("sk-ant-usr") ? "user key (sk-ant-usr...)" : API_KEY.startsWith("sk-ant-oat") ? "OAuth token (sk-ant-oat...)" : "unrecognized format";
  if (!API_KEY) return { ok: false, model: MODEL, keyType, workspace, status: null, message: "ANTHROPIC_API_KEY is not set in the server's environment variables." };
  try {
    const res = await fetch(`${API_BASE}/v1/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model: MODEL, max_tokens: 10, messages: [{ role: "user", content: "Reply with the single word OK." }] }),
      signal: AbortSignal.timeout(15000),
    });
    const text = (await res.text().catch(() => "")).replace(/sk-ant-[A-Za-z0-9_-]+/g, "[key]");
    let message = text.slice(0, 300);
    try {
      const j = JSON.parse(text) as { error?: { type?: string; message?: string }; content?: { text?: string }[] };
      message = j.error ? `${j.error.type ?? "error"}: ${j.error.message ?? ""}` : `Model replied: ${j.content?.[0]?.text ?? "(empty)"}`;
    } catch {}
    return { ok: res.ok, model: MODEL, keyType, workspace, status: res.status, message };
  } catch (e) {
    return { ok: false, model: MODEL, keyType, workspace, status: null, message: (e as Error).message };
  }
}
