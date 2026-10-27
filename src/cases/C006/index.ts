import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { chapters, objectives } from "./chapters";
import { characters, contradictions, questions, reactions } from "./characters";
import { deductions } from "./deductions";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { SPEECH } from "./knowledge";
import { locations } from "./locations";
import { comparisons, sequences } from "./mechanics";
import { conclusionChoices, solution } from "./solution";
import { SOUNDTRACK } from "./soundtrack";
import { calls, deliveries, documents, events, intro, labs, outgoingCalls, reportAvailable, statements, texts, timeline } from "./story";

/*
 * C006, The Hollow Creek Murders. Hollow Creek, Pennsylvania, October 2018,
 * and the summer of 1996. Blackwood's first long-form case: six chapters,
 * about eight hours. Design: project doc "C006 Case Design - The Hollow Creek
 * Murders"; evidence and deductions: "C006 Evidence Manifest and Deduction
 * Matrix". Canonical story: docs/C006-timeline.md (author-only). Reference
 * playthrough: scripts/check-case-C006.ts.
 *
 * Uses the chapter system (added for this case), the mobile phone, two
 * timelines (1996 and 2018), the page 41 comparison, two lab tests and a
 * report with eleven questions across five separate crimes.
 */
export const C006: CaseDefinition = {
  id: "C006",
  title: "The Hollow Creek Murders",
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
  boardHint: { evidenceCount: 5, callId: "call_board" },
  labs,
  phone: "mobile",
  texts,
  mapTitle: "Hollow Creek and the Riverside Works",
  reportHeader: [
    { label: "Classification", value: "Homicide (1996), homicide and kidnapping (2018), industrial deaths (1996)" },
    { label: "Location", value: "Hollow Creek, Pennsylvania" },
    { label: "Victims", value: "Emily Lasko; Glenn Sutter; Leonard Greer (survived); Carl Brennan, Tony Mazur, Eddie Sokol" },
  ],
  status: [
    { label: "Cold case: suspicious death" },
    { label: "Cold case and active homicide", when: { event: "RE06" } },
    { label: "Active homicide; missing person", when: { all: [{ event: "RE11" }, { not: { event: "RE15" } }] } },
    { label: "Active homicide and kidnapping", when: { event: "RE15" } },
  ],
  boardSections: [
    { id: "s1996", label: "1996" },
    { id: "s2018", label: "2018", when: { chapter: 3 } },
  ],
  reportDate: "November 2018",
  speech: SPEECH,
  sequences,
  comparisons,
  chapters,
};
