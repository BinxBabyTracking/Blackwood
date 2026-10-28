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
 * S01 C04, The Informant. Alexandria and Arlington, Virginia, with Washington,
 * Chantilly, Lorton, Falls Church, Delaplane and Bristow, December 12 to 14,
 * 2018. The fourth case of series S001, The Judas Principle.
 * Design: docs/S001C04-timeline.md (canonical), with docs/s001/bible.md and
 * docs/s001/brief-c04.md.
 *
 * Starts at the Wren in Alexandria (the meeting Claire never made); the hub is
 * C003's Pittsburgh field office with the series' rolling board already in it.
 * Four chapters (C006's chapter system), a mobile phone with texts, one lab
 * test (the drive), nine reactive events, a police-led rescue.
 */
export const S001C04: CaseDefinition = {
  id: "S001C04",
  title: "The Informant",
  year: 2018,
  draft: true,
  assets,
  startLocation: "cafe",
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
  status: [
    { label: "Missing person" },
    { label: "Abduction", when: { event: "RE07" } },
    { label: "Subject recovered", when: { flag: "claire_rescued" } },
  ],
  boardSections: [
    { id: "disappearance", label: "The disappearance" },
    { id: "leaks", label: "The leaks", when: { any: [{ hasEvidence: "E015" }, { hasEvidence: "E018" }] } },
  ],
  mapTitle: "Northern Virginia and Washington",
  reportDate: "December 2018",
  reportHeader: [
    { label: "Classification", value: "Missing person; abduction" },
    { label: "Location", value: "Alexandria, Virginia" },
    { label: "Subject", value: "Claire Donovan" },
  ],
  speech: SPEECH,
  chapters,
};

volunteerEssentials(S001C04);
