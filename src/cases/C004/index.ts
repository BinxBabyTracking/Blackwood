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
  speech: {
    setting: "a murder investigation at a Chicago radio station in October 1927, during Prohibition",
    style:
      "Plain American English of 1927 that a modern player reads easily, with period touches where they fit (the wireless or the radio, a telephone call, a speakeasy, a flivver, swell, applesauce, on the level). Never modern words or ideas: no cell phones, computers, DNA, fingerprint matches, forensics, security cameras, okay, or anything invented after 1927. Times are told the way people said them then: a quarter past ten, twenty to eleven.",
  },
  mapTitle: "Street map of Chicago, 1927",
  reportDate: "October 1927",
  reportHeader: [
    { label: "Classification", value: "Homicide (Historical Case File)" },
    { label: "Location", value: "WCRB, 412 North Michigan Avenue, Chicago" },
    { label: "Victim", value: "Arthur Vale" },
  ],
};
