import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, captivity, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, timeline } from "./story";

/*
 * C004, The Last Broadcast. Chicago, October 1927: a Historical Case File.
 * Design: the project doc "C004 Case Design - The Last Broadcast".
 * Timeline: docs/C004-timeline.md. Reference playthrough: scripts/check-case-C004.ts.
 *
 * Uses the captivity added for this case: the investigator is lured to a
 * warehouse and held. Alone it is an escape; in a joint investigation it is a
 * rescue, the captive playing their own scenes while the others find them.
 */
export const C004: CaseDefinition = {
  id: "C004",
  title: "The Last Broadcast",
  year: 1927,
  draft: true,
  assets,
  startLocation: "office",
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
  boardHint: { evidenceCount: 4, callId: "call_keene_board" },
  labs,
  captivity,
  mapTitle: "Street map of Chicago, 1927",
  reportDate: "October 1927",
  reportHeader: [
    { label: "Classification", value: "Homicide (Historical Case File)" },
    { label: "Location", value: "WCRB, 412 North Michigan Avenue, Chicago" },
    { label: "Victim", value: "Arthur Vale" },
  ],
};
