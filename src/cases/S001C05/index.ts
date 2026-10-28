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
import { calls, chapters, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, texts, timeline } from "./story";

/*
 * S01 C05, The Benefactor. Manhattan, New York, December 2018, with one stop
 * in Long Island City, Queens. Case 5 of 6 of series S001, The Judas Principle.
 * Design: docs/S001C05-timeline.md (canonical), with docs/s001/bible.md and
 * docs/s001/brief-c05.md.
 *
 * Hub: C003's Pittsburgh field office, with the series' rolling board. Mobile
 * phone with texts; two lab tests; five chapters (C006's chapter system). The
 * series notebook entry is written by `solution.resolution.series` when the
 * report is accepted.
 */
export const S001C05: CaseDefinition = {
  id: "S001C05",
  title: "The Benefactor",
  year: 2018,
  draft: true,
  assets,
  startLocation: "ballroom",
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
  boardHint: { evidenceCount: 5, callId: "call_bennett_board" },
  labs,
  phone: "mobile",
  texts,
  status: [{ label: "Active homicide" }, { label: "Active homicide; wider inquiry", when: { event: "RE10" } }],
  boardSections: [
    { id: "gala", label: "The gala" },
    { id: "structure", label: "The structure", when: { chapter: 3 } },
  ],
  mapTitle: "Manhattan and Queens (and the office in Pittsburgh)",
  reportDate: "December 2018",
  reportHeader: [
    { label: "Classification", value: "Homicide" },
    { label: "Location", value: "Manhattan, New York" },
    { label: "Victim", value: "Nathaniel Ogden" },
  ],
  speech: SPEECH,
  chapters,
};

volunteerEssentials(S001C05);
