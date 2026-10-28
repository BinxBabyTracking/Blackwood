import type { CaseDefinition, DialogueQuestion, Effect } from "@/game/engine/types";

/**
 * In a series case, nothing the story needs is left to the exact question. An
 * authored entry that moves the case on (hands over evidence, sends off a lab,
 * sets a story flag, opens a place, a call, a delivery, a text or a follow-up
 * question, or is one the story waits on) and has no `volunteer` of its own is
 * brought up by the character once its gate is open: as soon as the player's
 * question touches its subject (its prompt and keywords), or after a few
 * questions to that person. The older standalone cases keep their own.
 */
export const VOLUNTEER_AFTER = 4;

const MOVES = ["giveEvidence", "startLab", "setFlag", "unlockLocation", "incomingCall", "delivery", "unlockQuestion", "text", "deduce", "setEnv"];

function moves(effects: Effect[] | undefined): boolean {
  return (effects ?? []).some((e) => MOVES.some((k) => k in e) || ("when" in e && moves(e.then)));
}

export function volunteerEssentials(def: CaseDefinition) {
  // Entries the story waits on: any condition that asks whether one has been asked.
  const json = JSON.stringify({ ...def, questions: [], assets: {} });
  const waited = new Set([...json.matchAll(/"asked":"([^"]+)"/g)].map((m) => m[1]));
  for (const q of def.questions as DialogueQuestion[]) {
    if (q.repeatable) continue;
    const essential = moves(q.effects) || (q.variants ?? []).some((v) => moves(v.effects)) || Boolean(q.unlocks?.length) || waited.has(q.id);
    if (!essential) continue;
    // One the builder gave only a subject still comes up after a few questions.
    if (q.volunteer) q.volunteer.after ??= VOLUNTEER_AFTER;
    else q.volunteer = { near: [q.prompt, ...(q.keywords ?? [])].join(" "), after: VOLUNTEER_AFTER };
  }
  return def;
}
