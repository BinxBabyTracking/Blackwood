import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
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
 * S01 C06, The Architect. Arlington, Chantilly, Washington, Maryland, Fulton
 * County, Wilmington and New York, December 27 to 30, 2018. The finale of
 * series S001, The Judas Principle.
 * Design: docs/S001C06-timeline.md (canonical), with docs/s001/bible.md and
 * the project doc "S001 Brief - S01 C06 The Architect".
 *
 * Hub: C003's Pittsburgh field office, with the series rolling board. Mobile
 * phone with texts; four lab tests; six chapters (C006's system). Sixty case
 * items (E001 to E060) and seventeen recovered records (R01 to R17), each an
 * earlier case's own entry with its canonical id, offered only when the
 * original is not already held. The case is solved on its own board; the
 * series deductions S001-D011 to S001-D016 are made on the rolling board, and
 * the accepted report's finale pans across it.
 */
export const S001C06: CaseDefinition = {
  id: "S001C06",
  title: "The Architect",
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
  boardHint: { evidenceCount: 6, callId: "call_bennett_board" },
  labs,
  phone: "mobile",
  texts,
  status: [{ label: "Missing witness" }, { label: "Missing witness and arson", when: { deduction: "D04" } }, { label: "Series conspiracy", when: { deduction: "D16" } }],
  mapTitle: "The East Coast and Pennsylvania",
  reportDate: "December 2018",
  reportHeader: [
    { label: "Classification", value: "Conspiracy; obstruction; witness tampering" },
    { label: "Subject", value: "Meridian Advisory Group: the Sayer disappearance and the Records Center fire" },
    { label: "Location", value: "New York, Washington, Virginia, Pennsylvania" },
  ],
  speech: SPEECH,
  chapters,
};
