import type { CaseDefinition, Condition } from "@/game/engine/types";

/*
 * CHR001 story scaffold. The opening is the case design's loop 1 briefing in
 * brief; calls, events, the clock and the time loop are written once the
 * timeline and build contract are approved.
 */

const never: Condition = { not: { always: true } };

export const intro: CaseDefinition["intro"] = [
  { heading: "Silver Bell Bureau | Jingle Division", text: "Christmas Eve at the North Pole. The workshops are running at full capacity and Santa is preparing for his journey." },
  { text: "At 12:02 PM an emergency summons reaches the Bureau. Aldric, the Keeper of Time, has been found dead in his workshop at the foot of the clock tower. The Christmas Chronometer is missing." },
  { text: "Beside his body, glowing words have appeared on the floor: 4 HOURS REMAIN. Nobody knows what they mean." },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "save_aldric", text: "Save Aldric.", visible: { always: true }, done: never },
  { id: "catch_killer", text: "Identify and capture the murderer.", visible: { always: true }, done: never },
  { id: "find_chronometer", text: "Recover the Christmas Chronometer.", visible: { always: true }, done: never },
  { id: "evergreen", text: "Complete Aldric's replacement.", visible: { hasEvidence: "CE022" }, done: never },
];

export const reportAvailable: Condition = never;

export const timeline: CaseDefinition["timeline"] = [
  { time: "8:00 AM", text: "First winding of the day. Every reset returns here.", source: "Case design" },
  { time: "11:15 AM", text: "Garrick goes into the stables' boiler room.", source: "Dasha Rime" },
  { time: "11:30 AM", text: "Aldric sends Pip to the glassworks.", source: "Pip Larkspur" },
  { time: "11:47 AM", text: "Aldric dies; the countdown begins.", source: "Case design" },
  { time: "12:02 PM", text: "Pip finds the body.", source: "Pip Larkspur" },
  { time: "3:47 PM", text: "The reset, four hours after the death.", source: "Case design" },
];
