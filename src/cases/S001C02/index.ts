import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { KNOWLEDGE, PERSONA, SPEECH } from "./knowledge";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, chapters, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, texts, timeline } from "./story";

/*
 * S01 C02, Room 614. Washington, D.C., and Maryland, November 19 to 21, 2018.
 * The second case of series S001, The Judas Principle.
 * Design: docs/S001C02-timeline.md (canonical), with the project docs
 * "S001 Series Bible - The Judas Principle" and "S001 Brief - S01 C02 Room 614".
 *
 * Hub: C003's Pittsburgh field office, with the series' rolling board standing
 * in it from the start. Four chapters, a mobile phone with texts, three lab
 * tests. E033 arrives by Capital Courier when D10 is made (the series' leak
 * channel); nothing in the case explains it.
 */

/** Each person's knowledge and persona (characters.ts attaches them, as in S01 C01; this fills any it left out). */
const people = characters.map((c) => ({ ...c, knowledge: c.knowledge ?? KNOWLEDGE[c.id], persona: c.persona ?? PERSONA[c.id] }));

export const S001C02: CaseDefinition = {
  id: "S001C02",
  title: "Room 614",
  year: 2018,
  draft: true,
  assets,
  startLocation: "office",
  intro,
  characters: people,
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
  status: [
    { label: "Missing person" },
    { label: "Suspected abduction", when: { deduction: "D04" } },
    { label: "Kidnapping: victim recovered", when: { event: "RE07" } },
  ],
  boardSections: [
    { id: "hotel", label: "The Ashcroft" },
    { id: "jonathan", label: "Jonathan's affairs", when: { chapter: 3 } },
    { id: "meridian", label: "Meridian", when: { chapter: 3 } },
  ],
  mapTitle: "Washington, D.C., and Maryland",
  reportDate: "November 2018",
  reportHeader: [
    { label: "Classification", value: "Kidnapping" },
    { label: "Location", value: "Washington, D.C., and Frederick County, Maryland" },
    { label: "Subject", value: "Jonathan Ellery" },
  ],
  speech: SPEECH,
  chapters,
};
