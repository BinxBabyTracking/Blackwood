import type { CharacterDef, Condition, ContradictionDef, DemeanorDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { plantContradictions, plantQuestions, plantReactions } from "./dialogue/plant";
import { townContradictions, townQuestions, townReactions } from "./dialogue/town";
import { PATIENCE, UNLIMITED } from "./interviews";
import { buildKnowledge, NO_ANSWER, PERSONA } from "./knowledge";
import { people } from "./people";
import { events } from "./story";

/*
 * C006's people, with their questions, knowledge and manners. The manners
 * follow the brief's long-form arcs: Wade calm, then defensive, then caught
 * out, then refusing; Stroud gracious, concerned, defensive about Trent,
 * contradicted, then speaking only through his lawyer; Len guarded, then
 * frank after his rescue.
 */

const ch = (n: number): Condition => ({ chapter: n });
const has = (id: string): Condition => ({ hasEvidence: id });

const DEMEANOR: Record<string, DemeanorDef[]> = {
  sarah: [
    { id: "sarah_hopeful", label: "Determined", requires: { always: true } },
    { id: "sarah_shaken", label: "Shaken", requires: { deduction: "D31" }, cue: "Sarah sits down hard at the kitchen table." },
    { id: "sarah_resolved", label: "Resolved", requires: { deduction: "D32" }, cue: "Sarah's hands are steady now." },
  ],
  wade: [
    { id: "wade_easy", label: "Easygoing", requires: { always: true } },
    { id: "wade_guarded", label: "Guarded", requires: { any: [ch(2), has("E015")] }, cue: "Wade wipes his hands on a rag and doesn't look up." },
    { id: "wade_defensive", label: "Defensive", requires: { all: [ch(5), { any: [has("E082"), has("E086"), has("E081")] }] }, cue: "Wade puts the rag down. \"What is this?\"" },
    {
      id: "wade_refusing",
      label: "Declining to answer",
      requires: { deduction: "D32" },
      refuses: "I'm done. You want to talk to me, you talk to my lawyer.",
      idleLine: "Get out of my shop.",
      cue: "Wade walks to the office and picks up the phone.",
    },
  ],
  stroud: [
    { id: "stroud_gracious", label: "Gracious", requires: { always: true } },
    { id: "stroud_concerned", label: "Concerned", requires: { event: "RE06" }, cue: "Stroud's smile is slower than before." },
    { id: "stroud_defensive", label: "Defensive", requires: ch(4), cue: "Stroud doesn't offer you a chair." },
    { id: "stroud_cold", label: "Cold", requires: { all: [ch(5), { any: [has("E057"), has("E078"), has("E098")] }] }, cue: "Stroud's lawyer is in the room now, taking notes." },
    {
      id: "stroud_refusing",
      label: "Speaking through counsel",
      requires: { deduction: "D33" },
      refuses: "Mr. Stroud won't be answering any more questions. Anything further goes through my office.",
      idleLine: "My lawyer will see you out.",
      cue: "The lawyer closes his folder. \"We're finished here.\"",
    },
  ],
  trent: [
    { id: "trent_flat", label: "Flat", requires: { always: true } },
    { id: "trent_hostile", label: "Hostile", requires: { any: [has("E052"), { deduction: "D23" }] }, cue: "Trent stands up so he's looking down at you." },
    { id: "trent_custody", label: "In custody", requires: { flag: "trent_arrested" }, cue: "Trent sits in the interview room in a county jumpsuit, his hands flat on the table." },
    {
      id: "trent_lawyered",
      label: "Represented by counsel",
      requires: { all: [{ flag: "trent_arrested" }, { any: [has("E060"), has("E080")] }] },
      refuses: "Talk to my lawyer.",
      idleLine: "Talk to my lawyer.",
      cue: "Trent stares at the wall.",
    },
  ],
  glenn: [{ id: "glenn_tired", label: "Ashamed", requires: { always: true } }],
  len: [
    { id: "len_guarded", label: "Guarded", requires: { always: true } },
    { id: "len_frightened", label: "Frightened", requires: { event: "RE06" }, cue: "Len keeps glancing at the window." },
    { id: "len_relieved", label: "Relieved", requires: { event: "RE15" }, cue: "Len's voice is hoarse, but he sounds like a man who has put something down." },
  ],
  rebecca: [
    { id: "rebecca_nervous", label: "Nervous", requires: { always: true } },
    { id: "rebecca_honest", label: "Honest", requires: has("E086"), cue: "Rebecca looks you in the eye for the first time." },
  ],
};

const questions: DialogueQuestion[] = [...townQuestions, ...plantQuestions];
const KNOWLEDGE = buildKnowledge(questions, events);

export const characters: CharacterDef[] = people.map((p) => ({
  ...p,
  persona: PERSONA[p.id],
  knowledge: KNOWLEDGE[p.id],
  noAnswer: NO_ANSWER[p.id] ?? p.noAnswer,
  patience: PATIENCE[p.id],
  demeanor: DEMEANOR[p.id],
  ...(UNLIMITED.includes(p.id) ? { questionLimit: null } : {}),
}));

export { questions };
export const reactions: EvidenceReaction[] = [...townReactions, ...plantReactions];
export const contradictions: ContradictionDef[] = [...townContradictions, ...plantContradictions];
