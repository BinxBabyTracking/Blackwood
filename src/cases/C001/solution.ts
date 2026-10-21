import "server-only";
import type { CaseDefinition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C001. Server-only: importing this file from a
 * client component fails the build. Nothing here is sent to the browser
 * until the player earns it (a confirmed deduction) or closes the case.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D_STAGED",
    code: "D02",
    title: "Possible Staged Entry",
    text: "The screen was cut from the inside and the back door was opened from within, with nothing disturbed outside. No one broke into this house.",
    connections: [["E01", "E10"]],
  },
  {
    id: "D_STRUGGLE",
    code: "D01",
    title: "Signs of a Struggle",
    text: "The struggle and the knife from the cake on the sideboard both place the attack in the living room. The kitchen was never part of it.",
    connections: [["E06", "E07"], ["E06", "E02"]],
  },
  {
    id: "D_INJURED",
    title: "An Injured Assailant",
    text: "The laboratory's typing of the blood on the broken glass does not match Eleanor alone. Whoever struggled with her may have been cut.",
    connections: [["E02", "E11"]],
  },
  {
    id: "D_HAND",
    code: "D05",
    title: "Possible Injury Connection",
    text: "Daniel Mercer had a freshly bandaged right palm the morning after, and his blood type is consistent with the laboratory's typing of the glass. Guests who sat with him at supper saw no injury.",
    connections: [["E14", "E11"], ["E14", "E02"], ["daniel", "E11"]],
    requires: { all: [{ hasEvidence: "E11" }, { hasEvidence: "E14" }] },
  },
  {
    id: "D_MOTIVE",
    code: "D03",
    title: "Financial Irregularities",
    text: "Eleanor's own ledger and the bank's statements disagree by thousands. Cheques payable to Mercer's business were not authorised, and the file on his reports has vanished from her desk.",
    connections: [["E03", "E15"], ["E15", "E08"], ["E03", "E08"]],
  },
  {
    id: "D_LAWYER",
    code: "D06",
    title: "Financial Motive",
    text: "Eleanor had an appointment with an attorney on Monday morning to take her ledger and the bank statements to him.",
    connections: [["E09", "E03"], ["E09", "E15"], ["E09", "E08"]],
  },
  {
    id: "D_ALIBI",
    code: "D04",
    title: "Timeline Inconsistency",
    text: "The waitress Daniel Mercer named went home at eleven. The night waitress saw a man in a tan jacket leave the diner at about 11:05, nearly two hours before Mercer says he left.",
    connections: [["E04", "E13"], ["E12", "E13"], ["E12", "E04"]],
    requires: { any: [{ flag: "daniel_alibi_given" }, { inspected: "office_recorder" }] },
  },
  {
    id: "D_JACKET",
    code: "D07",
    title: "Recovered Physical Evidence",
    text: "The windbreaker thrown out behind Mercer's building matches the one Margaret saw him wear at supper, and its stained right cuff ties it to the blood evidence from the living room.",
    connections: [["E05", "E11"], ["E05", "E14"]],
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    question: "Who killed Eleanor Whitmore?",
    options: [
      { id: "margaret", label: "Margaret Ellis" },
      { id: "daniel", label: "Daniel Mercer" },
      { id: "robert", label: "Robert Hale" },
      { id: "patricia", label: "Patricia Wells" },
      { id: "intruder", label: "An intruder" },
    ],
  },
  {
    id: "motive",
    question: "Why?",
    options: [
      { id: "robbery", label: "A burglary that went wrong" },
      { id: "inheritance", label: "To inherit her estate sooner" },
      { id: "embezzlement", label: "To stop her exposing stolen money" },
      { id: "debt", label: "A dispute over an unpaid debt" },
      { id: "grievance", label: "A personal grievance" },
    ],
  },
  {
    id: "weapon",
    question: "What was the weapon?",
    options: [
      { id: "knife", label: "The carving knife" },
      { id: "glass", label: "The broken glass" },
      { id: "poker", label: "The fireplace poker" },
      { id: "bottle", label: "The wine bottle" },
    ],
  },
  {
    id: "location",
    question: "Where did the attack take place?",
    options: [
      { id: "living_room", label: "The living room" },
      { id: "kitchen", label: "The kitchen" },
      { id: "rear_door", label: "At the rear door" },
      { id: "front_hall", label: "The front hall" },
    ],
  },
];

export const solution: CaseDefinition["solution"] = {
  culprit: "daniel",
  motive: "embezzlement",
  weapon: "knife",
  location: "living_room",
  evidenceGroups: [
    { id: "injury", label: "Physical and blood evidence", anyOf: ["E11", "E05", "E14"] },
    { id: "motive", label: "Financial motive", anyOf: ["E03", "E08", "E15", "E09"] },
    { id: "alibi", label: "False account of his movements", anyOf: ["E04", "E13"] },
    { id: "staging", label: "Staged entry", anyOf: ["E01", "E10"] },
  ],
  minGroups: 3,
  closure: [
    {
      heading: "Friday, 11:05 PM",
      body: "Daniel Mercer did not stay at the Maple Street Diner until one. Linda went home at eleven, and five minutes later he left too, in the tan windbreaker he had worn all evening, without paying for his refill. By twenty past eleven he was back on Hollister Avenue, his green Buick under the jacaranda with the lights off.",
    },
    {
      heading: "Friday, 11:35 PM",
      body: "Eleanor let him in. At a quarter past nine she had shown him her ledger. On Monday she was taking it, with Patricia's copies of the bank statements, to Mr. Albright, and she told him so. The cheques to D. Mercer Management had never been authorised.",
    },
    {
      heading: "The living room",
      body: "The argument turned into a struggle. A chair went over. A crystal glass broke in Mercer's hand and opened his palm. The carving knife was still on the sideboard where Eleanor had left it after cutting the cake.",
    },
    {
      heading: "Saturday, 12:15 AM",
      body: "He took the folder of his own reports from her desk. In the kitchen he cut the window screen from the inside and drew back the bolt on the rear door, so it would look as though someone had broken in. At ten past twelve Margaret Ellis saw his car still at the kerb. Five minutes later he drove away. In the morning he bought gauze at the Rexall on Sunset, and when an investigator started asking questions, he threw the jacket away.",
    },
    {
      heading: "Case closed",
      body: "Detective Bennett arrested Daniel Mercer on the strength of your report. The agency's file on Eleanor Whitmore is closed.",
    },
  ],
};
