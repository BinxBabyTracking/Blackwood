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
    connections: [["E14", "E16"], ["daniel", "E16"], ["E14", "E02"]],
    requires: { all: [{ hasEvidence: "E16" }, { hasEvidence: "E14" }] },
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
    connections: [["E05", "E11"], ["E05", "E14"], ["E05", "E16"]],
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "Primary Suspect",
    question: "Who do you believe was responsible for Eleanor Whitmore's death?",
    options: [
      { id: "margaret", label: "Margaret Ellis" },
      { id: "daniel", label: "Daniel Mercer" },
      { id: "robert", label: "Robert Hale" },
      { id: "patricia", label: "Patricia Wells" },
      { id: "unknown", label: "Unknown / Insufficient Evidence" },
    ],
  },
  {
    id: "motive",
    section: "B",
    title: "Motive",
    question: "What was the primary motive behind the murder?",
    options: [
      { id: "financial", label: "Financial dispute" },
      { id: "jealousy", label: "Personal jealousy" },
      { id: "revenge", label: "Revenge" },
      { id: "accident", label: "Accidental confrontation" },
      { id: "robbery", label: "Robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "C",
    title: "Murder Weapon",
    question: "What weapon was used in the fatal attack?",
    options: [
      { id: "knife", label: "Kitchen knife" },
      { id: "glass", label: "Broken glass" },
      { id: "blunt", label: "Blunt object" },
      { id: "firearm", label: "Firearm" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "location",
    section: "D",
    title: "Location of Murder",
    question: "Where did the fatal confrontation occur?",
    options: [
      { id: "living_room", label: "Eleanor's living room" },
      { id: "kitchen", label: "Eleanor's kitchen" },
      { id: "rear_entrance", label: "Rear entrance" },
      { id: "outside", label: "Outside the property" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Daniel Mercer, a financial dispute over irregularities
 * Eleanor had discovered, the kitchen knife (E06), in her living room. The
 * cut screen and drawn bolt were staged to misdirect the investigation.
 */
export const solution: CaseDefinition["solution"] = {
  culprit: "daniel",
  motive: "financial",
  weapon: "knife",
  location: "living_room",
  standard: {
    // Four key items carry the report; up to two more may be anything the investigator thinks supports it.
    minItems: 4,
    maxItems: 6,
    minKey: 4,
    lines: [
      { id: "physical", label: "Physical and blood evidence", anyOf: ["E02", "E05", "E06", "E11", "E14", "E16"] },
      { id: "timeline", label: "Timeline and movements", anyOf: ["E04", "E13", "E12"] },
      { id: "financial", label: "Financial motive", anyOf: ["E03", "E15", "E08", "E09"] },
      { id: "staging", label: "Staged entry", anyOf: ["E01", "E10"] },
    ],
    minLines: 2,
    linkToSuspect: ["E04", "E13", "E14", "E05", "E16"],
    supporting: ["E07"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your investigative findings have been accepted. The agency has forwarded your report to Detective Frank Bennett, LAPD Northeast Division.",
    reconstruction: [
      {
        heading: "The money",
        body: "Cheques drawn on Harold Whitmore's estate account had been made out to D. Mercer Management without Eleanor's authorisation. She kept her own ledger beside Daniel Mercer's quarterly reports, asked Patricia for the bank's statements, and found that the figures did not agree. She made an appointment with Harold's attorney for Monday the 19th.",
      },
      {
        heading: "Friday, 9:15 PM",
        body: "At supper Eleanor took Mercer to her writing desk with the ledger open. He would later call it a routine question about a bank statement. She came back to the table pale.",
      },
      {
        heading: "Friday, 10:25 to 11:20 PM",
        body: "Mercer left last, at twenty-five past ten, and drove to the Maple Street Diner. Linda, the waitress he named, went home at eleven. Five minutes later he left too, in the tan windbreaker he had worn all evening, without paying for his refill. By twenty past eleven his green Buick was parked under the jacaranda on Hollister Avenue, lights off.",
      },
      {
        heading: "Friday, 11:35 PM",
        body: "Eleanor let him in. In the living room the argument became a struggle. A chair went over, and a crystal glass broke in his hand and cut his palm. The kitchen knife she had used to cut the cake was still on the sideboard. It was the weapon, and it was found beside her.",
      },
      {
        heading: "The break-in that never happened",
        body: "He took the folder of his own reports from her desk. In the kitchen he cut the window screen from the inside, so the mesh bent outward, and drew back the bolt that could only be opened from within. At ten past twelve Margaret Ellis saw his car still at the kerb. At a quarter past, he drove away.",
      },
      {
        heading: "What he left behind",
        body: "On Saturday morning he bought gauze at the Rexall on Sunset and bandaged his right hand. When the investigation reached his apartment, the tan windbreaker disappeared from his coat rack. The police recovered it from the dumpster behind his building, its right cuff stained and scrubbed.",
      },
    ],
    bennett: [
      "I read your report twice. It holds up. The diner, the cheques, the screen cut from the inside, the jacket in his trash.",
      "This afternoon it goes to the District Attorney's office with my request for a warrant for Daniel Mercer's arrest. After that it's up to the D.A., and in the end a jury. Nothing on paper is a conviction.",
      "But Eleanor Whitmore's file is not going in the drawer marked burglary. That's your doing. Thank you.",
    ],
  },
};
