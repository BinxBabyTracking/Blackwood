import "server-only";
import { SERIES_DEFS } from "@/series/defs";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for S01 C01, The Ledger. Server-only. Nothing here
 * reaches the browser until the player earns it (a confirmed deduction) or
 * closes the case. Deductions follow the table in docs/S001C01-timeline.md.
 *
 * The closing says nothing about Dr. Lockhart beyond "the lead from New York
 * was genuine". Her part in the series is author-only.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "The Burglary Was Targeted",
    text: "The wallet, the phone, the laptop and the petty cash were all left behind. Whoever came into Martin's office went straight to one drawer of the filing cabinet and took one folder: FUND 2018 - WORKING. They came for Martin's records.",
    connections: [["E002", "E005"], ["E001", "E005"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "Martin Was Investigating the Fund",
    text: "Martin was tracing more than $400,000 the Recovery Fund paid to three outside firms, money that went on to a consulting firm in Pittsburgh. He had booked an independent auditor, Walter Ames, for 9:00 on Friday morning. He died the night before.",
    connections: [["E010", "E013"], ["E013", "E011"], ["E010", "E014"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "Martin Hid His Records",
    text: "Martin kept his own ledger of the payments hidden inside his grandfather's old auditing textbook, the one book nobody would borrow. Whoever searched the office emptied the working folder and pulled books off the lower shelf, but never found it.",
    connections: [["E009", "E011"], ["E005", "E011"], ["E014", "E011"]],
  },
  {
    id: "D04",
    code: "D04",
    title: "The Fund's Payments Were Irregular",
    text: "Since July the fund paid $412,600 for program services to three firms, on the fund administrator's approval alone, every payment under the $50,000 board limit. Work can be found behind only a small part of it.",
    connections: [["E012", "E015"], ["E011", "E015"], ["E012", "E018"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "Meridian Received the Money",
    text: "Each of the three firms passed most of what the fund paid it straight on to the same place: Meridian Advisory Group, in Pittsburgh. Martin traced $329,000 of it there.",
    connections: [["E016", "E029"], ["E011", "E016"]],
  },
  {
    id: "D06",
    code: "D06",
    title: "Reddick Could Get In After Hours",
    text: "Card 0447, issued to Reddick Maintenance in April with around-the-clock access on Adrian Holt's recommendation, opened the rear service door at 8:31 PM on Thursday. Nobody used the front door after 6:00. The rear door was opened from inside at 8:57 PM.",
    connections: [["E006", "E022"]],
  },
  {
    id: "D07",
    code: "D07",
    title: "Reddick's Account Is False",
    text: "Paul Reddick says he finished the boiler at 4:30 and went home, and his job sheet says HOME in heavier pen than the rest. But his van was behind the Mercantile Building on Thursday evening, after dark, by the dumpsters.",
    connections: [["E021", "E026"], ["E021", "E008"], ["E021", "E023"]],
  },
  {
    id: "D08",
    code: "D08",
    title: "Reddick's Movements Fit the Scene",
    text: "The boot print in the spilled toner could have been made by Reddick's right boot. His card let someone in at 8:31 PM and the door opened from inside at 8:57, inside the medical examiner's window. The print alone names nobody; with the door and the van, it fits.",
    connections: [["E007", "E023"], ["E007", "E006"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "Holt Controlled the Payments",
    text: "Every program services payment was approved by Adrian Holt alone, under a 2014 clause that let him hire subcontractors without the board. And Tri-County Facility Partners, one of the firms he paid, is registered at his own suite and run by his own office manager.",
    connections: [["E017", "E018"], ["E018", "E020"], ["E017", "E030"]],
  },
  {
    id: "D10",
    code: "D10",
    title: "Holt and Reddick Were Working Together",
    text: "At 10:14 the morning after Martin died, Tri-County, paid from Holt's own login, sent Reddick Maintenance $9,500 for an HVAC retrofit that appears on none of Reddick's job sheets. Holt's number called Reddick's in the days before, and the two talked within minutes of the rear door opening at 8:57 PM.",
    connections: [["E019", "E025"], ["E024", "E025"], ["E019", "E024"]],
  },
  {
    id: "D11",
    code: "D11",
    title: "Reddick Killed Martin Keller",
    text: "The intruder came for the records, came in on Reddick's card at 8:31 PM and left at 8:57, in Reddick's van, in Reddick's boots, and lied about it. Martin died in that window of a single blow from a heavy object with a hard, angular edge. The brass eagle that sat on his desk for two years left the building with his killer.",
    connections: [["reddick", "E004"], ["reddick", "E003"], ["E003", "E004"]],
    requires: {
      all: [{ deduction: "D01" }, { deduction: "D06" }, { deduction: "D07" }, { deduction: "D08" }, { hasEvidence: "E003" }, { hasEvidence: "E004" }],
    },
  },
  {
    id: "D12",
    code: "D12",
    title: "Holt Sent Reddick and Covered for Him",
    text: "Martin was about to take the fund's records to an auditor. The man who controlled those payments called the contractor he had placed in the building three times in the two days before, took his call five minutes after the rear door opened, and paid him through a shell company the next morning. He sent him for the records, and protected him after.",
    connections: [["holt", "reddick"], ["holt", "E019"]],
    requires: { all: [{ deduction: "D02" }, { deduction: "D09" }, { deduction: "D10" }] },
  },
];

const knowsReddick: Condition = { any: [{ hasEvidence: "E022" }, { hasEvidence: "E026" }, { talkedTo: "avery" }, { hasEvidence: "E021" }] };
const knowsFoster: Condition = { hasEvidence: "E028" };
const knowsLockhart: Condition = { event: "RE02" };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "The Killer",
    question: "Who killed Martin Keller?",
    options: [
      { id: "reddick", label: "Paul Reddick", requires: knowsReddick },
      { id: "holt", label: "Adrian Holt" },
      { id: "foster", label: "Warren Foster", requires: knowsFoster },
      { id: "whitfield", label: "Susan Whitfield" },
      { id: "burglar", label: "An unknown burglar" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "B",
    title: "The Weapon",
    question: "What was the weapon?",
    options: [
      { id: "eagle", label: "The brass eagle from his desk" },
      { id: "pry_bar", label: "A pry bar" },
      { id: "toner", label: "A toner cartridge" },
      { id: "hammer", label: "A hammer from a toolbox" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "purpose",
    section: "C",
    title: "The Purpose",
    question: "Why did the killer go to Martin's office?",
    options: [
      { id: "records", label: "To take Martin's financial records" },
      { id: "valuables", label: "To steal money and valuables" },
      { id: "grant_dispute", label: "To settle a grant dispute" },
      { id: "boiler", label: "To service the boiler" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "sender",
    section: "D",
    title: "Who Sent Him",
    question: "Who sent him?",
    options: [
      { id: "holt", label: "Adrian Holt" },
      { id: "whitfield", label: "Susan Whitfield" },
      { id: "lockhart", label: "Dr. Evelyn Lockhart", requires: knowsLockhart },
      { id: "nobody", label: "Nobody: he acted alone" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "ordered",
    section: "E",
    title: "The Order",
    question: "Did the person who sent him order the killing?",
    options: [
      { id: "no", label: "No: he sent him to take the records; the killing was the killer's own act" },
      { id: "yes", label: "Yes: he ordered it" },
      { id: "nobody_sent", label: "Nobody sent him" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "coverup",
    section: "F",
    title: "The Payment",
    question: "Why did Holt pay Reddick and hide his part?",
    options: [
      { id: "protect", label: "To protect himself and the payments scheme" },
      { id: "hvac", label: "To pay for real HVAC work" },
      { id: "loyalty", label: "Out of loyalty to a friend" },
      { id: "no_payment", label: "He did not pay him" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "investigating",
    section: "G",
    title: "Martin's Investigation",
    question: "What was Martin investigating?",
    options: [
      { id: "meridian", label: "Fund payments routed through three firms to Meridian Advisory Group" },
      { id: "foster_reports", label: "Warren Foster's missing grant reports" },
      { id: "expenses", label: "Susan Whitfield's expenses" },
      { id: "maintenance", label: "The building's maintenance contract" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Paul Reddick killed Martin Keller with the brass desk
 * eagle, in Martin's office, while stealing his financial records. Adrian Holt
 * sent him to take the records, did not order the killing, and paid Reddick
 * and hid his involvement afterward to protect himself and the scheme. Martin
 * was investigating fund payments routed through intermediary firms to
 * Meridian Advisory Group.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    culprit: "reddick",
    weapon: "eagle",
    purpose: "records",
    sender: "holt",
    ordered: "no",
    coverup: "protect",
    investigating: "meridian",
  },
  standard: {
    // 30 items: at least 5 key, at most 7 attached (Final Report Standard).
    minItems: 5,
    maxItems: 7,
    minKey: 5,
    claims: [
      {
        id: "scene",
        label: "Places the person you name at the scene that night",
        anyOf: ["E006", "E007", "E008", "E021", "E022", "E023", "E026"],
        hint: "Find out who could open the building's doors after hours, and who was seen behind it that evening.",
      },
      {
        id: "why",
        label: "Shows why the records were worth killing over",
        anyOf: ["E010", "E011", "E012", "E013", "E015", "E016", "E018", "E029"],
        hint: "Follow what Martin was working on, and where he kept what he didn't want found.",
      },
      {
        id: "how",
        label: "Shows how it was done and dressed up",
        anyOf: ["E001", "E002", "E003", "E004", "E005"],
        hint: "Go back over the office itself, and what the police and the medical examiner recorded.",
      },
      {
        id: "sent",
        label: "Shows who sent him, and the money afterward",
        anyOf: ["E017", "E019", "E020", "E024", "E025"],
        hint: "Look at who controlled the fund's payments, and who paid whom after Thursday night.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical and forensic", anyOf: ["E001", "E002", "E003", "E004", "E005", "E007"] },
      { id: "movement", label: "Access, witnesses and movements", anyOf: ["E006", "E008", "E021", "E022", "E023", "E025", "E026"] },
      { id: "money", label: "Records and money", anyOf: ["E010", "E011", "E012", "E013", "E015", "E016", "E017", "E018", "E019", "E020", "E024", "E029"] },
    ],
    minLines: 3,
    linkToSuspect: ["E006", "E007", "E021", "E023", "E026"],
    linkNote: "Nothing attached ties the person you name to the Mercantile Building on the night of November 8.",
    supporting: ["E009", "E014", "E027", "E028", "E030"],
    maxUnrelated: 1,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Curtis Bowman, Carroway Police, and through him to the Carroway County District Attorney.",
    reconstruction: [
      {
        heading: "The ledger",
        body: "In July, Martin Keller noticed that the Small Business Recovery Fund was paying large sums for program services to three firms he had never seen do any work. He began a ledger in pencil, then in ink as he grew more certain, and hid it inside his grandfather's 1957 Montgomery's Auditing on his office shelf. By November 7 it showed $412,600 paid to the three and $329,000 traced on to Meridian Advisory Group. Every payment was under $50,000. Every approval was Adrian Holt's.",
      },
      {
        heading: "October 22",
        body: "Martin took his concerns to Susan Whitfield. She asked him to wait until after the Lockhart donor dinner on December 6, so as not to alarm the fund's founding donor over paperwork. He couldn't. He called Walter Ames, an independent auditor, and on November 6 asked to meet him on Friday the 9th at nine. He copied the payment files twice: one set for the office cabinet, one for home.",
      },
      {
        heading: "November 6 and 7",
        body: "Word that Martin had booked an outside auditor reached Holt. That afternoon, for the first time in months, Holt called Paul Reddick, the maintenance contractor he had placed in the Mercantile Building in April with a card that opened its doors at any hour. He called him again that evening, and again the next night for six minutes. Holt wanted the records out of Martin's office before Friday morning. He did not tell Reddick to hurt anyone.",
      },
      {
        heading: "Thursday night",
        body: "Reddick serviced the boiler that afternoon as booked and left at 4:30. He came back after dark and waited in the rear lot, and when Angela Morris came out at 7:48 he drove off to circle the block. At 8:24 he pulled in again with his lights off. At 8:31 his card opened the rear service door. He found the lights still on in the corner office. At about 8:44 Martin came in and found him at the filing cabinet. Reddick demanded the records. Martin refused. Reddick picked up the brass eagle from the corner of the desk and struck him once.",
      },
      {
        heading: "The folder and the eagle",
        body: "Reddick took the red folder of copies from the cabinet. Then he made the room look like a burglary: he forced the desk drawer, scattered the papers, and pulled books off the lower shelf. He never reached the upper shelves, where the ledger was, and never looked in the back printer, where Martin's memo sat in the tray. He stepped in spilled toner by the cabinet. He put the eagle in his tool bag and left by the rear door at 8:57.",
      },
      {
        heading: "The call at 9:02",
        body: "Five minutes later, from the van, Reddick called Holt and told him he had the folder, and that Martin was dead. They spoke again at 9:20. Holt's concern from then on was keeping his own name out of it.",
      },
      {
        heading: "The next morning",
        body: "At 6:40 on Friday the cleaner found Martin. At 9:00 Walter Ames waited for him. At 10:14, logged in as himself, Holt paid Reddick $9,500 from Tri-County Facility Partners, a company registered at his own suite, as an HVAC retrofit at the Mercantile Building that never happened. He wrote \"done. shred.\" on the confirmation and left it in his out tray.",
      },
      {
        heading: "The lead from New York",
        body: "The copied Tri-County invoice that Dr. Evelyn Lockhart passed on was genuine: a real invoice to the fund, approved by Holt, for storefront work nobody did. It pointed the investigation at the right company.",
      },
    ],
    bennett: [
      "Bowman here. Your report's on my desk and the DA's, and it holds.",
      "Paul Reddick is charged with the murder of Martin Keller. Adrian Holt is charged with conspiracy to commit burglary, hindering prosecution, and theft by deception. Both were picked up this morning. Holt's lawyer was at the station before he was.",
      "Reddick wouldn't say where the eagle went. He didn't have to. We pulled it out of the storm drain behind his shop this afternoon.",
      "Hannah came by. She asked me to tell you her dad would have liked you. I think he would have. Thank you.",
    ],
    caller: { characterId: "bowman", name: "Det. Curtis Bowman", tag: "Carroway PD" },
    series: {
      seriesId: "S001",
      title: SERIES_DEFS.S001.notebook.S001C01.title,
      text: SERIES_DEFS.S001.notebook.S001C01.text,
      board: "A second cork board, on wheels, has been brought into the office. Nothing is on it yet: it carries whatever you choose to keep from this case into the next.",
    },
  },
};
