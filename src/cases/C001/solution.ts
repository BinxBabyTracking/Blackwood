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
    title: "The break-in was staged",
    text: "The screen was cut from the inside and the back door was opened from within, with nothing disturbed outside. No one broke into this house.",
    connections: [["E01", "E10"]],
  },
  {
    id: "D_STRUGGLE",
    title: "It happened in the living room",
    text: "The struggle and the knife from the cake on the sideboard both place the attack in the living room. The kitchen was never part of it.",
    connections: [["E06", "E07"], ["E06", "E02"]],
  },
  {
    id: "D_INJURED",
    title: "The killer was cut",
    text: "The blood on the broken glass is type B. Eleanor was type A. Whoever struggled with her was hurt.",
    connections: [["E02", "E11"]],
  },
  {
    id: "D_HAND",
    title: "A matching injury",
    text: "Daniel Mercer's blood is type B, and he had a fresh cut on his right palm the morning after. Neither guest who sat with him at supper saw any injury.",
    connections: [["E14", "E11"], ["E14", "E02"], ["daniel", "E11"]],
    requires: { all: [{ hasEvidence: "E11" }, { hasEvidence: "E14" }] },
  },
  {
    id: "D_MOTIVE",
    title: "Money was missing",
    text: "Eleanor's own ledger and the bank's statements disagree by thousands. Cheques payable to Mercer's business were not authorised, and the file on his reports has vanished from her desk.",
    connections: [["E03", "E15"], ["E15", "E08"], ["E03", "E08"]],
  },
  {
    id: "D_LAWYER",
    title: "She was about to act",
    text: "Eleanor had an appointment with an attorney on Monday morning to take her ledger and the bank statements to him.",
    connections: [["E09", "E03"], ["E09", "E15"], ["E09", "E08"]],
  },
  {
    id: "D_ALIBI",
    title: "A false account of the night",
    text: "The waitress Daniel Mercer named went home at eleven. The night waitress saw a man in a tan jacket leave the diner at 11:20, hours before he says he left.",
    connections: [["E04", "E13"], ["E12", "E13"], ["E12", "E04"]],
    requires: { flag: "daniel_alibi_given" },
  },
  {
    id: "D_JACKET",
    title: "The jacket",
    text: "The windbreaker thrown out behind Mercer's building carries both Eleanor's blood type and type B on the right cuff.",
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
      heading: "Saturday, 11:20 PM",
      body: "Daniel Mercer did not stay at the Maple Street Diner until one. He left at twenty past eleven, in the tan windbreaker he had worn all evening, and drove back to Hollister Avenue. He parked his green Buick under the jacaranda with the lights off.",
    },
    {
      heading: "Saturday, close to midnight",
      body: "Eleanor let him in. She had seen the bank's statements. On Monday she was taking her ledger and Patricia's copies to Mr. Albright, and she told him so. The cheques to 'D. Mercer Mgmt' had never been authorised.",
    },
    {
      heading: "The living room",
      body: "The argument turned into a struggle. A chair went over. A crystal glass broke in Mercer's hand and opened his palm. The carving knife was still on the sideboard where Eleanor had left it after cutting the cake.",
    },
    {
      heading: "Afterwards",
      body: "He took the folder of his own reports from her desk. In the kitchen he cut the window screen from the inside and drew back the bolt on the rear door, so it would look as though someone had broken in. He left by the back door. On Sunday morning he bought gauze and tape, and when an investigator started asking questions, he threw the jacket away.",
    },
    {
      heading: "Case closed",
      body: "Detective Bennett arrested Daniel Mercer on the strength of your report. The agency's file on Eleanor Whitmore is closed.",
    },
  ],
};
