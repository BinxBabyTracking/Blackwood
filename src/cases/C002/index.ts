import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, timeline } from "./story";

export const C002: CaseDefinition = {
  id: "C002",
  title: "A Short Trip",
  year: 1988,
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
  boardHint: { evidenceCount: 4, callId: "call_bennett_board" },
  labs,
  mapTitle: "Road map of Southern California",
  reportHeader: [
    { label: "Classification", value: "Reported kidnapping" },
    { label: "Location", value: "Mariposa Bay, California" },
    { label: "Subject", value: "Laura Kessler" },
  ],
};
