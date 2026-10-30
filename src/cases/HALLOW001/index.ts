import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { volunteerEssentials } from "@/series/volunteer";
import { adversary } from "./adversary";
import { assets } from "./assets";
import { characters, contradictions, questions, reactions } from "./characters";
import { evidence } from "./evidence";
import { reinterviews } from "./interviews";
import { SPEECH } from "./knowledge";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { calls, deliveries, documents, events, intro, labs, objectives, outgoingCalls, postings, reportAvailable, statements, texts, timeline } from "./story";

/*
 * HALLOW001, The Thirteenth Guest. Blackthorn Estate, Harrow Falls,
 * Massachusetts, Halloween night 2018. October only (cases.available_month).
 * Design: docs/HALLOW001-timeline.md (canonical), from the project doc
 * "HALLOW001 Case Design - The Thirteenth Guest".
 *
 * New for this case, and opt-in for any later one: a clock that the
 * investigators' actions move on (`clock`), a killer who acts on his own by
 * rules (`adversary`), and endings that depend on what happened (`endings`).
 * Base: the Morning Room. Mobile phones. One lab test.
 */
export const HALLOW001: CaseDefinition = {
  id: "HALLOW001",
  title: "The Thirteenth Guest",
  year: 2018,
  draft: true,
  assets,
  startLocation: "morning_room",
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
  postings,
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
  boardHint: { evidenceCount: 5, callId: "call_mahoney_board" },
  labs,
  phone: "mobile",
  caseFileInHud: true,
  texts,
  status: [
    { label: "Active homicide" },
    { label: "Active homicide; suspect detained", when: { flag: "crane_arrested" } },
    { label: "Active homicide; suspect at large", when: { flag: "crane_escaped" } },
    { label: "Two homicides", when: { flag: "second_murder" } },
  ],
  boardSections: [
    { id: "tonight", label: "Tonight" },
    { id: "1998", label: "Halloween 1998", when: { any: [{ hasEvidence: "HE018" }, { hasEvidence: "HE022" }, { hasEvidence: "HE023" }, { hasEvidence: "HE017" }] } },
  ],
  mapTitle: "Blackthorn Estate, Harrow Falls",
  reportDate: "November 2018",
  reportHeader: [
    { label: "Classification", value: "Locked-room homicide" },
    { label: "Location", value: "Blackthorn Estate, Harrow Falls, Massachusetts" },
    { label: "Victim", value: "Ambrose Blackthorn" },
  ],
  speech: SPEECH,
  clock: { start: "22:32", costs: { travel: 3, inspect: 1, question: 1, call: 1 } },
  adversary,
};

volunteerEssentials(HALLOW001);
