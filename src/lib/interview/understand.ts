import "server-only";
import { characterKnowledge, interviewCandidates } from "@/game/engine/engine";
import { bestMatch } from "@/game/engine/matcher";
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

export const interviewAIConfigured = Boolean(API_KEY);

export interface Interpretation {
  match: string | null;
  composed: string | null;
}

export async function interpretQuestion(def: CaseDefinition, s: InvestigationState, characterId: string, question: string): Promise<Interpretation> {
  const text = question.replace(/\s+/g, " ").trim().slice(0, 300);
  // Entries not yet asked come first, so an equally good match prefers new information.
  const all = interviewCandidates(def, s, characterId);
  const candidates = [...all.filter((q) => q.repeatable || !s.asked.includes(q.id)), ...all.filter((q) => !q.repeatable && s.asked.includes(q.id))];
  const local = candidates.length ? bestMatch(text, candidates) : null;
  const person = def.characters.find((c) => c.id === characterId);
  if (!API_KEY || !person) return { match: local, composed: null };

  const facts = characterKnowledge(def, s, characterId);
  const recent = (s.conversations[characterId] ?? [])
    .filter((l) => l.speaker !== "cue")
    .slice(-8)
    .map((l) => `${l.speaker === "you" ? "Investigator" : person.name}: ${l.text}`)
    .join("\n");
  const entries = candidates.map((q) => `${q.id}: ${q.prompt}${q.keywords?.length ? ` (also: ${q.keywords.join(" ")})` : ""}`).join("\n");

  const system = [
    "You are the interview engine of a 1985 Los Angeles detective game. An investigator asks a question in their own words.",
    "First, if one of the AUTHORED ENTRIES covers the question (same subject, any wording, even if the question is vague or uses 'him' or 'it' for someone just mentioned), reply exactly: ENTRY <id>",
    "Asking for, or to see, an object the character has is covered by the entry that hands it over; prefer that entry.",
    `Otherwise, answer as ${person.name}, in character, using ONLY the FACTS listed. Reply exactly: ANSWER <reply>`,
    "Rules for ANSWER:",
    "- Use only the FACTS. Never invent names, times, places, events, evidence, motives or opinions about guilt that the facts do not state.",
    "- If the facts do not cover the question, say in character that you don't know or can't say. Do not guess.",
    "- Never accuse anyone and never confess. Some facts are the character's own claims; state them as the character would.",
    "- One to three short spoken sentences, natural American English of 1985. No stage directions, no quotation marks, no em dashes.",
    "- Stay consistent with the conversation so far.",
    "- Never offer, promise or pretend to hand over, fetch or show any object or document. Objects only change hands through authored entries. If asked for one, say plainly you can't help with that.",
    `Character: ${person.persona ?? person.name}`,
  ].join("\n");
  const user = [
    `AUTHORED ENTRIES:\n${entries || "(none)"}`,
    `FACTS ${person.name} knows:\n${facts.map((x) => `- ${x}`).join("\n") || "(none)"}`,
    recent ? `CONVERSATION SO FAR:\n${recent}` : "",
    `INVESTIGATOR ASKS: ${text}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const res = await fetch(`${API_BASE}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 220, temperature: 0.3, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) throw new Error(`status ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`);
    const body = (await res.json()) as { content?: { type: string; text?: string }[] };
    const out = (body.content?.find((c) => c.type === "text")?.text ?? "").trim();
    const entry = /^ENTRY\s+([a-z0-9_]+)/i.exec(out);
    if (entry) return { match: candidates.some((q) => q.id === entry[1]) ? entry[1] : local, composed: null };
    const answer = /^ANSWER\s*:?\s*([\s\S]+)/i.exec(out);
    if (answer) return { match: null, composed: answer[1].trim() };
    return { match: local, composed: null };
  } catch (e) {
    console.error("interview: falling back to the built-in matcher:", (e as Error).message);
    return { match: local, composed: null };
  }
}
