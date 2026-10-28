import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { volunteerEssentials } from "@/series/volunteer";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { SPEECH } from "./knowledge";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import {
  calls,
  chapters,
  deliveries,
  documents,
  events,
  intro,
  labs,
  objectives,
  outgoingCalls,
  reportAvailable,
  statements,
  texts,
  timeline,
} from "./story";

/*
 * S01 C03, Dead Freight. Baltimore, Maryland, December 2018. The third case
 * of series S001, The Judas Principle.
 * Design: docs/S001C03-timeline.md (canonical), with docs/s001/bible.md and
 * docs/s001/brief-c03.md.
 *
 * Hub: C003's Pittsburgh field office, with the series' rolling board in the
 * room. Mobile phone with texts; four chapters (C006's chapter system); one
 * lab test. Delivery 3 (the courier copy of the Kane agreement) arrives on
 * deduction D06. The series notebook entry is written as the report is accepted.
 * KNOWLEDGE and PERSONA from ./knowledge reach the case through ./characters.
 */
export const S001C03: CaseDefinition = {
  id: "S001C03",
  title: "Dead Freight",
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
  mapTitle: "Baltimore Harbor",
  reportDate: "December 2018",
  reportHeader: [
    { label: "Classification", value: "Homicide" },
    { label: "Location", value: "Baltimore, Maryland" },
    { label: "Victim", value: "Hector Navarro" },
  ],
  speech: SPEECH,
  chapters,
};

volunteerEssentials(S001C03);
