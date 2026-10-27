import type { Condition, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";

/** An authored question for one person. `extra` carries gates, effects and reveals. */
export const asker =
  (characterId: string) =>
  (id: string, topic: string, prompt: string, keywords: string[], reply: string[], extra: Partial<DialogueQuestion> = {}): DialogueQuestion => ({
    id,
    characterId,
    topic,
    prompt,
    keywords,
    reply,
    ...extra,
  });

/** A reaction to being shown a piece of evidence. */
export const shown =
  (characterId: string) =>
  (evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({ characterId, evidenceId, reply, ...extra });

export const ch = (n: number): Condition => ({ chapter: n });
export const has = (id: string): Condition => ({ hasEvidence: id });
export const ded = (id: string): Condition => ({ deduction: id });
