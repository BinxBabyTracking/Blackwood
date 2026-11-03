import { newState, normalizeState, reduce } from "@/game/engine/engine";
import type { CaseDefinition, InvestigationState } from "@/game/engine/types";
import { interpretQuestion } from "@/lib/interview/understand";

/**
 * Testing Zone: ask someone a question in a throwaway copy of the case, never the player's save.
 * The copy starts at the person's location with the briefing done; it is handed back to the
 * browser and sent again with the next question, so a conversation can build up.
 */
export function sandboxState(def: CaseDefinition, characterId: string, prev: InvestigationState | null): InvestigationState {
  if (prev && prev.caseId === def.id) return normalizeState(def, prev);
  const s = newState(def);
  const where = def.characters.find((c) => c.id === characterId)?.locationId;
  s.introSeen = true;
  // Everything the briefing would have opened, plus the person's own location.
  for (const l of def.locations) if (!s.unlocked.includes(l.id)) s.unlocked.push(l.id);
  if (where) {
    s.location = where;
    if (!s.visited.includes(where)) s.visited.push(where);
  }
  // The case file has been read, which is what opens the map in C001.
  if (!s.flags.includes("casefile_read")) s.flags.push("casefile_read");
  return s;
}

export async function sandboxAsk(def: CaseDefinition, characterId: string, text: string, prev: InvestigationState | null, ctx: { userId: string; sessionId: string }) {
  let s = sandboxState(def, characterId, prev);
  const before = (s.conversations[characterId] ?? []).length;
  const r = await interpretQuestion(def, s, characterId, text, ctx);
  s = reduce(def, s, { type: "askFree", characterId, text, match: r.match, composed: r.composed, facts: r.facts }, Date.now()).state;
  const lines = (s.conversations[characterId] ?? []).slice(before).filter((l) => l.speaker !== "you").map((l) => l.text);
  return { state: s, lines };
}
