import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { reinterviews } from "./interviews";
import { locations } from "./locations";
import { comparisons, sequences } from "./mechanics";
import { SOUNDTRACK } from "./soundtrack";
import { evidence } from "./evidence";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, deliveries, documents, events, intro, objectives, outgoingCalls, peterMissing, reportAvailable, statements, timeline } from "./story";

/*
 * C005, The Abbey of Silent Bells. Saint Aldwyn's Abbey, Wendale, northern
 * England, October 1327. A Historical Case File reconstructed by Blackwood;
 * the player is the archdeacon's examiner, not a modern detective.
 * Design: the project doc "C005 Case Design - The Abbey of Silent Bells".
 * Timeline: docs/C005-timeline.md. Reference playthrough: scripts/check-case-C005.ts.
 *
 * Uses the settings added for this case: a medieval theme and words (no
 * photographs, telephones or laboratories), the bell timeline and the
 * manuscript comparison, and the deduce effect. Calls are letters and visits
 * that come only to the investigator's chamber. The archdeacon, by letter,
 * stands in for Bennett.
 */
export const C005: CaseDefinition = {
  id: "C005",
  title: "The Abbey of Silent Bells",
  year: 1327,
  draft: true,
  assets,
  startLocation: "chamber",
  intro,
  characters,
  locations,
  evidence,
  questions,
  reactions,
  contradictions,
  documents,
  statements,
  calls,
  outgoingCalls,
  deliveries,
  events,
  deductions,
  objectives,
  conclusionChoices,
  reportAvailable,
  solution,
  timeline,
  questionLimit: 20,
  reinterviews,
  soundtrack: SOUNDTRACK,
  boardHint: { evidenceCount: 4, callId: "letter_board" },
  theme: "medieval",
  words: {
    photo: "Sketch",
    photoAction: "Make a sketch",
    photoTaken: "Sketched. It is filed with your evidence.",
    photoNote: "Sketched",
    photoPrefix: "S",
    photoStamp: ["Sketched", "And filed"],
    collectedStamp: ["Entered", "In the journal"],
    notebook: "Journal",
    evidence: "Evidence",
    map: "Map",
    board: "Deduction table",
    home: "your chamber",
    phone: "Letters and messengers",
    callWaiting: "Someone waits at your chamber",
    callRinging: "Someone is at your door",
    callNotice: "Someone is at your door.",
    callAnswer: "Open the door",
    callDefer: "Let them wait",
    callClose: "Close",
    callLog: "Letters and visits",
    byPhone: "By letter from your chamber",
    callContact: "Write to",
    outgoing: "Send for someone",
    boardHintWaiting: "A messenger from the archdeacon waits at your chamber.",
    leave: "Return to the agency",
    reviewer: "the archdeacon",
    form: "THE FINDING",
    observed: "Observed",
    claimed: "Claimed",
  },
  speech: {
    setting: "a murder investigation at a Benedictine abbey in northern England in October 1327",
    style:
      "Plain modern English that a modern player reads easily, with a few period words (brother, the lord abbot, the cellarer, the steward, Vespers, Compline, the night office). Never modern words or ideas: no police, alibi, forensics, laboratory, DNA, fingerprints, minutes, hours of the clock, o'clock or okay. Times are given only by the abbey's services and the days of the week.",
  },
  sequences,
  comparisons,
  status: [
    { label: "The death of Brother Edmund" },
    { label: "The death of Brother Edmund. Novice Peter missing", when: peterMissing },
  ],
  mapTitle: "Saint Aldwyn's and the Wendale",
  reportDate: "Friday, October 23, 1327",
  reportHeader: [
    { label: "To", value: "Master Hugh Selwood, Archdeacon of Wendale" },
    { label: "Touching", value: "The death of Brother Edmund of Saint Aldwyn's" },
    { label: "Given at", value: "Saint Aldwyn's Abbey" },
  ],
};
