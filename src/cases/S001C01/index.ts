import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { volunteerEssentials } from "@/series/volunteer";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, texts, timeline } from "./story";

/*
 * S01 C01, The Ledger. Carroway, Pennsylvania, November 2018. The first case
 * of series S001, The Judas Principle.
 * Design: docs/S001C01-timeline.md (canonical), with the project docs
 * "S001 Series Bible - The Judas Principle" and "S001 Brief - S01 C01 The Ledger".
 *
 * Hub: C003's Pittsburgh field office. Mobile phone with texts; one lab test.
 * RE06 (the series board) is run by the series system after the report is
 * accepted, not by this definition.
 */
export const S001C01: CaseDefinition = {
  id: "S001C01",
  title: "The Ledger",
  year: 2018,
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
  phone: "mobile",
  texts,
  status: [{ label: "Active homicide" }],
  mapTitle: "Carroway and Pittsburgh",
  reportDate: "November 2018",
  reportHeader: [
    { label: "Classification", value: "Homicide" },
    { label: "Location", value: "Carroway, Pennsylvania" },
    { label: "Victim", value: "Martin Keller" },
  ],
};

volunteerEssentials(S001C01);
