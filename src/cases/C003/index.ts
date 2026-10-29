import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, deliveries, documents, events, intro, labs, objectives, outgoingCalls, reportAvailable, statements, texts, timeline } from "./story";

/*
 * C003, The Witness on Alder Street. Bellwether, Pennsylvania, 2018.
 * Design: the project doc "C003 Case Design - The Witness on Alder Street".
 * Timeline: docs/C003-timeline.md. Reference playthrough: scripts/check-case-C003.ts.
 *
 * Uses the optional engine settings added for this case: a mobile phone with
 * texts and contacts, people who die mid-case (deceased), a case status line,
 * a second board section, and six report questions, one of them multi-select.
 */
export const C003: CaseDefinition = {
  id: "C003",
  title: "The Witness on Alder Street",
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
  // A 2018 phone: about 33 call questions or 50 texts on a charge; full at the office, a quarter more on every drive.
  battery: { perCall: 3, perText: 2, perDrive: 25 },
  texts,
  status: [{ label: "Active homicide" }, { label: "Active multiple homicide", when: { flag: "marshes_found" } }],
  boardSections: [
    { id: "sep14", label: "September 14" },
    { id: "oct29", label: "October 29", when: { flag: "marshes_found" } },
  ],
  mapTitle: "Street map of Bellwether, Pennsylvania",
  reportDate: "October 2018",
  reportHeader: [
    { label: "Classification", value: "Multiple homicide" },
    { label: "Location", value: "Bellwether, Pennsylvania" },
    { label: "Victims", value: "Jenna Kowalski, Ethan Cole, Vivian Marsh, Graham Marsh" },
  ],
};
