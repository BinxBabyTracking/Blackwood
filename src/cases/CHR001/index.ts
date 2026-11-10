import "server-only";
import type { CaseDefinition } from "@/game/engine/types";
import { assets } from "./assets";
import { characters } from "./characters";
import { evidence } from "./evidence";
import { locations } from "./locations";
import { SOUNDTRACK } from "./soundtrack";
import { conclusionChoices, deductions, solution } from "./solution";
import { intro, objectives, reportAvailable, timeline } from "./story";

/*
 * CHR001, The Christmas That Never Happened. Santa's North Pole, Christmas
 * Eve. December only (cases.available_month 12). Aiming for Christmas 2027 in
 * the Godot client: one walkable North Pole with no map, 4 to 10 elf
 * investigators of the Silver Bell Bureau's Jingle Division, a four-hour time
 * loop and a killer who acts on his own.
 *
 * Design: the project docs "CHR001 Design Handoff" (v1.0, the brief) and
 * "CHR001 Case Design" (v0.1, a draft for approval).
 *
 * This is the PRODUCTION SCAFFOLD: people (with voices), places (with their
 * walkable rooms in art/manifest.json), evidence, music, room sound and sound
 * effects, so the art, models, voices and audio can be made on Admin. It is
 * not playable: nobody can be questioned and the report never opens. The
 * time loop, the Time Bag, Garrick's planner and interviews come with the
 * approved timeline and build contract.
 */
export const CHR001: CaseDefinition = {
  id: "CHR001",
  title: "The Christmas That Never Happened",
  year: 2027,
  draft: true,
  assets,
  startLocation: "jingle_office",
  intro,
  characters,
  locations,
  evidence,
  questions: [],
  reactions: [],
  contradictions: [],
  documents: [],
  statements: [],
  calls: [],
  outgoingCalls: [],
  deliveries: [],
  events: [],
  deductions,
  objectives,
  conclusionChoices,
  reportAvailable,
  solution,
  timeline,
  questionLimit: 20,
  soundtrack: SOUNDTRACK,
  caseFileInHud: true,
  status: [{ label: "The Keeper of Time is dead; 4 hours remain" }],
  reportDate: "December 24",
  reportHeader: [
    { label: "Agency", value: "Silver Bell Bureau | Jingle Division" },
    { label: "Classification", value: "Homicide; theft of the Christmas Chronometer" },
    { label: "Location", value: "The clock tower, the North Pole" },
    { label: "Victim", value: "Aldric, Keeper of Time" },
  ],
  speech: {
    setting:
      "Santa's North Pole on Christmas Eve, in the polar night: a timeless, old-fashioned elf village of timber, stone and clockwork, with no modern technology. The Keeper of Time, Aldric, has been found dead in his clock tower workshop and the Christmas Chronometer is gone. The investigators are elves of the Silver Bell Bureau's Jingle Division. People speak warm, old-fashioned American English.",
    style:
      "Answer in one to four short spoken sentences, in character, in American English. No em dashes or en dashes. Never state anything the character does not know. Never confess to a crime. Never say who killed Aldric. Nobody remembers an earlier loop of the day, even when told about it.",
  },
};
