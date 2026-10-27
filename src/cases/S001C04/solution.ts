import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for S01 C04, The Informant. Server-only. Nothing
 * here reaches the browser until the player earns it (a confirmed deduction)
 * or closes the case. Deductions follow the table in docs/S001C04-timeline.md.
 *
 * Never in this case, the closing included: who the source is, who made the
 * 6:15 AM call, who EO-01 and "A" are. Dr. Lockhart is offered only on the
 * "who directed the detention" question, where she is canonically wrong; she
 * is deliberately not offered on "who chose the leads".
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "Claire Intended to Meet Blackwood",
    text: "Claire wrote to Blackwood on Tuesday night and booked the back booth at the Wren half an hour later. She meant to be there.",
    connections: [["E001", "E002"], ["E001", "E003"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "Claire Prepared for Disclosure",
    text: "In the week before she vanished Claire resigned, locked a drive with a split key, put a carton in private storage in Lorton, and left a sealed list with Tyler Prentiss of what existed and where. She was getting ready to hand it over.",
    connections: [["E011", "E013"], ["E011", "E012"], ["E012", "E013"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "Claire Left Her Apartment Voluntarily",
    text: "Claire packed a small bag and left a little before eight on Wednesday, alone. At 8:14 she walked into the Wren on her own and wrote the note herself, in the same small upright hand as her resignation letter. Whatever happened to her later, she left home by choice.",
    connections: [["E007", "E027"], ["E004", "E007"], ["E003", "E010"]],
    requires: { any: [{ hasEvidence: "E004" }, { hasEvidence: "E007" }] },
  },
  {
    id: "D04",
    code: "D04",
    title: "The Apartment Was Searched",
    text: "Twice a fob for 3C let someone into the lobby while Claire's car was out, the second time an hour after her phone went dark miles away. That afternoon the apartment had been taken apart. Someone with a copy of her key searched it.",
    connections: [["E005", "E006"], ["E006", "E007"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "Claire Accessed Sensitive Meridian Records",
    text: "Claire's badge took her into Meridian's restricted finance, client services and logistics stacks on three days this autumn, each time as a \"retention audit,\" each approved by the Records Administrator.",
    connections: [["E009", "E016"], ["E015", "E016"], ["E009", "E017"]],
  },
  {
    id: "D06",
    code: "D06",
    title: "The Earlier Disclosures Were Selective",
    text: "Claire had whole boxes in her hands, and only one page from each left the building. The page filed behind each one, the Executive Office item that showed who authorized it, was never released.",
    connections: [["E017", "E022"], ["E022", "E038"]],
  },
  {
    id: "D07",
    code: "D07",
    title: "The Disclosures Targeted Specific Executives",
    text: "Three pages went out: one naming Adrian Holt's program, one Julian Rourke's clients, one Gideon Kane's contract. One page, one man, one division, each time.",
    connections: [["E019", "E020"], ["E020", "E021"], ["E019", "E021"]],
    requires: { all: [{ hasEvidence: "E019" }, { hasEvidence: "E020" }, { hasEvidence: "E021" }] },
  },
  {
    id: "D08",
    code: "D08",
    title: "A Common Channel Distributed the Leads",
    text: "Each page was copied at the Records Center, handed to Miriam Castell, and sent by Capital Courier on Clearwater's account 20417 with the sender left blank. Two of the three went to Blackwood's own office.",
    connections: [["E018", "E038"], ["E018", "E025"], ["E017", "E018"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "Claire Received External Guidance",
    text: "Claire did not choose what to copy. Each request came through Miriam Castell of Clearwater, who passed on what an unnamed source said the investigators needed.",
    connections: [["E024", "E025"], ["E024", "E026"]],
  },
  {
    id: "D10",
    code: "D10",
    title: "Claire Initially Agreed to Hide",
    text: "Claire let herself into Laurel Run Cottage at 9:46 on Wednesday morning with the code Castell sent her. She went into hiding willingly.",
    connections: [["E027", "E028"], ["E025", "E028"]],
  },
  {
    id: "D11",
    code: "D11",
    title: "The Safe House Became Dangerous",
    text: "Brandon Tate's Tahoe followed Claire to Delaplane in the morning and was back at the exit for the cottage at 8:49 that night. At 9:02 she opened the door from inside. The kitchen shows she later tried to get out the back.",
    connections: [["E029", "E030"], ["E028", "E030"]],
    requires: { hasEvidence: "E029" },
  },
  {
    id: "D12",
    code: "D12",
    title: "Tate Moved Claire to a Second Property",
    text: "At 1:06 AM the cottage was locked from outside; at 1:27 Tate's Tahoe passed Gainesville; at 1:41 it backed into the drive of a house in Bristow that Tate had leased three days before, with two people, one held by the arm.",
    connections: [["E033", "E034"], ["E030", "E033"], ["E030", "E034"]],
    requires: { all: [{ hasEvidence: "E030" }, { hasEvidence: "E033" }, { hasEvidence: "E034" }] },
  },
  {
    id: "D13",
    code: "D13",
    title: "Claire Was Kidnapped",
    text: "Claire went to the cottage willingly. She did not go to Bristow willingly. She was held in a padlocked basement room from Thursday morning until the police came. Agreeing to hide was never agreeing to be held.",
    connections: [["E035", "E036"], ["donovan", "E035"], ["E028", "E035"]],
    requires: { all: [{ deduction: "D10" }, { deduction: "D11" }, { deduction: "D12" }, { hasEvidence: "E035" }] },
  },
  {
    id: "D14",
    code: "D14",
    title: "Rourke Directed the Detention",
    text: "Julian Rourke, in federal detention, wrote the order in his own hand and his \"defense investigator\" carried it out. Tate's phone took the investigator's calls after every visit.",
    connections: [["E031", "E032"], ["rourke", "E032"], ["tate", "E032"]],
    requires: { hasEvidence: "E031" },
  },
  {
    id: "D15",
    code: "D15",
    title: "Claire's Records Were Deliberately Filtered",
    text: "Claire had forty-seven pages from three boxes. Three were asked for. Every one of the rest, including every page that pointed past the three men, stayed behind. The records Blackwood received were genuine and incomplete by design.",
    connections: [["E022", "E037"], ["E026", "E037"]],
    requires: { all: [{ hasEvidence: "E022" }, { hasEvidence: "E026" }] },
  },
  {
    id: "D16",
    code: "D16",
    title: "Blackwood Was Being Directed Toward Specific Targets",
    text: "The leads that reached Blackwood this autumn were genuine, they came through one channel, and they were chosen: one page per man, in the order of an internal memo, stopping short of whoever authorized them. Blackwood's earlier investigations were being steered.",
    connections: [["E018", "E037"], ["E038", "E039"], ["E018", "E039"]],
    requires: { all: [{ deduction: "D06" }, { deduction: "D07" }, { deduction: "D08" }, { deduction: "D15" }] },
  },
  {
    id: "D17",
    code: "D17",
    title: "An Unidentified Authority Controlled the Disclosures",
    text: "The same Executive Office reference, EO-01, authorized programs in two divisions, and an Executive Office slip signed \"A\" told Rourke the day after Holt's arrest that \"Pittsburgh is closed.\" The person who chose what Blackwood saw protected exactly that level. Someone above the exposed executives controlled the disclosures. Who, the evidence does not say.",
    connections: [["E040", "E041"], ["E039", "E040"], ["E039", "E041"]],
    requires: { all: [{ hasEvidence: "E039" }, { hasEvidence: "E040" }, { hasEvidence: "E041" }] },
  },
];

const knowsTate: Condition = { flag: "tate_known" };
const knowsRourke: Condition = { any: [{ talkedTo: "collins" }, { hasEvidence: "E031" }, { hasEvidence: "E032" }] };
const knowsLockhart: Condition = { any: [{ hasEvidence: "E018" }, { hasEvidence: "E024" }, { event: "RE04" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "why_contact",
    section: "A",
    title: "The Message",
    question: "Why did Claire Donovan contact Blackwood?",
    options: [
      { id: "selected", label: "To show that the records behind Blackwood's earlier leads had been selected" },
      { id: "sell", label: "To sell Meridian's records" },
      { id: "accuse", label: "To accuse Miriam Castell" },
      { id: "protect", label: "To ask for protection from her former partner" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why_left",
    section: "B",
    title: "Wednesday Morning",
    question: "Why did Claire leave home on Wednesday morning?",
    options: [
      { id: "protective", label: "She believed she was going into a protective hiding arrangement" },
      { id: "forced", label: "She was taken from her apartment by force" },
      { id: "fled", label: "She fled after stealing records to sell" },
      { id: "never", label: "She never left Alexandria" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "held",
    section: "C",
    title: "Against Her Will",
    question: "Was she held against her will?",
    options: [
      { id: "yes", label: "Yes: she was detained when she tried to leave the safe house, and moved" },
      { id: "asked", label: "No: she asked to be moved and stayed willingly" },
      { id: "never_there", label: "No: she was never at the safe house" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "detainer",
    section: "D",
    title: "The Detainer",
    question: "Who physically detained her?",
    options: [
      { id: "tate", label: "Brandon Tate", requires: knowsTate },
      { id: "prentiss", label: "Tyler Prentiss", requires: { talkedTo: "prentiss" } },
      { id: "castell", label: "Miriam Castell" },
      { id: "rourke", label: "Julian Rourke", requires: knowsRourke },
      { id: "lang", label: "Gerald Lang", requires: { talkedTo: "lang" } },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "director",
    section: "E",
    title: "Who Directed It",
    question: "Who directed the detention?",
    options: [
      { id: "rourke", label: "Julian Rourke, from detention", requires: knowsRourke },
      { id: "tate_alone", label: "Brandon Tate, on his own" },
      { id: "castell", label: "Miriam Castell" },
      { id: "lockhart", label: "Dr. Evelyn Lockhart", requires: knowsLockhart },
      { id: "nobody", label: "Nobody: there was no detention" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why_held",
    section: "F",
    title: "The Purpose",
    question: "Why was she detained?",
    options: [
      { id: "records", label: "To recover her records and learn what she had given Blackwood, and who asked her for them" },
      { id: "ransom", label: "For ransom" },
      { id: "testimony", label: "To stop her testifying in the Ellery case" },
      { id: "safety", label: "For her own safety" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "claire_role",
    section: "G",
    title: "Claire's Part",
    question: "What was Claire's part in the earlier leads?",
    options: [
      { id: "copied", label: "She copied genuine Meridian records chosen by someone else and passed them through an intermediary" },
      { id: "forged", label: "She forged them" },
      { id: "none", label: "She had no part" },
      { id: "chose", label: "She chose and sent them herself to settle scores" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "conclusions",
    section: "H",
    title: "The Earlier Cases",
    question: "Were the earlier cases' conclusions false?",
    options: [
      { id: "genuine", label: "No: the records were genuine and the people exposed did what Blackwood found" },
      { id: "forged", label: "Yes: the documents were forged" },
      { id: "wrong_men", label: "Yes: the wrong men were charged" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "steered",
    section: "I",
    title: "The Leads",
    question: "Were Blackwood's earlier investigations steered?",
    options: [
      { id: "yes", label: "Yes: the leads were chosen to expose particular executives and to stop short of whoever authorized them" },
      { id: "random", label: "No: the leaks were random" },
      { id: "independent", label: "No: Blackwood found everything on its own" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    // Dr. Lockhart is deliberately not offered here (design, Contradictions 3).
    id: "selector",
    section: "J",
    title: "Who Chose",
    question: "Who chose what Blackwood was sent?",
    options: [
      { id: "above", label: "An authority above the exposed executives, working through intermediaries, not yet identified" },
      { id: "claire", label: "Claire Donovan alone" },
      { id: "castell", label: "Miriam Castell" },
      { id: "rourke", label: "Julian Rourke", requires: knowsRourke },
      { id: "tate", label: "Brandon Tate", requires: knowsTate },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Claire Donovan contacted Blackwood to show that the
 * records behind its earlier leads had been selected. She left home willingly,
 * believing she was going into a protective hiding arrangement relayed by
 * Miriam Castell. When she tried to leave the cottage, Brandon Tate detained
 * her and moved her to Bristow. Julian Rourke directed him from detention,
 * through Dean Whitlock, to recover her records and learn what she had
 * disclosed and who had asked her for it. Claire copied genuine records chosen
 * by someone else and passed them through Castell. The earlier conclusions
 * stand; the leads were chosen to stop short of whoever authorized them, an
 * authority above them, not yet identified.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    why_contact: "selected",
    why_left: "protective",
    held: "yes",
    detainer: "tate",
    director: "rourke",
    why_held: "records",
    claire_role: "copied",
    conclusions: "genuine",
    steered: "yes",
    selector: "above",
  },
  standard: {
    // 42 items: at least 8 key, at most 12 attached (Final Report Standard).
    minItems: 8,
    maxItems: 12,
    minKey: 8,
    claims: [
      {
        id: "left",
        label: "Shows how she left home, and why",
        anyOf: ["E003", "E004", "E007", "E025", "E027", "E028"],
        hint: "Ask the people who saw her that morning, and the person she trusted.",
      },
      {
        id: "after",
        label: "Shows what happened to her after that",
        anyOf: ["E029", "E034", "E035", "E036"],
        hint: "Go back to where she was staying, and to where she was found.",
      },
      {
        id: "tie",
        label: "Ties the person you name to what happened to her",
        anyOf: ["E004", "E030", "E031", "E033", "E034", "E036"],
        hint: "Det. Harris can follow a vehicle. Look at what was in the office it belonged to.",
      },
      {
        id: "behind",
        label: "Shows who was behind it, and why",
        anyOf: ["E017", "E031", "E032"],
        hint: "Someone outside wanted her papers. Look at who could send orders, and how they traveled.",
      },
      {
        id: "channel",
        label: "Shows how the earlier leads reached Blackwood",
        anyOf: ["E011", "E016", "E017", "E018", "E025", "E038"],
        hint: "Follow a page from the archive to the courier.",
      },
      {
        id: "contents",
        label: "Shows what the earlier leads did and did not include",
        anyOf: ["E019", "E020", "E021", "E022", "E023", "E026", "E037", "E039", "E040", "E041"],
        hint: "Claire kept copies of more than she sent. So did a man who used to check her work.",
      },
    ],
    lines: [
      { id: "disappearance", label: "The disappearance", anyOf: ["E003", "E004", "E005", "E006", "E007", "E008", "E027", "E028"] },
      { id: "detention", label: "The detention", anyOf: ["E029", "E030", "E031", "E032", "E033", "E034", "E035", "E036"] },
      {
        id: "leaks",
        label: "The leaks",
        anyOf: ["E016", "E017", "E018", "E019", "E020", "E021", "E022", "E023", "E025", "E026", "E037", "E038", "E039", "E040", "E041"],
      },
    ],
    minLines: 3,
    linkToSuspect: ["E004", "E030", "E031", "E033", "E034", "E036"],
    linkNote: "Nothing attached ties the person you name to what happened to Claire Donovan after she reached the cottage.",
    supporting: ["E001", "E002", "E005", "E006", "E008", "E009", "E010", "E012", "E013", "E014", "E015", "E024", "E042"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Ross Harris, Alexandria Police, to the Commonwealth's Attorney for the City of Alexandria, and to Special Agent Teresa Quinlan, FBI.",
    reconstruction: [
      {
        heading: "Six years in the archive",
        body: "Claire Donovan joined Meridian's Records Center in Chantilly in April 2012 and was promoted in 2016 to Records Analyst II, with badge 2214 and access to the restricted collections on the Records Administrator's approval. The Records Center holds about forty thousand boxes. Its one copier, RM-C2, runs only on a badge, logs every job, and prints along the bottom of every copy exactly where the original lives: collection, box and item.",
      },
      {
        heading: "September",
        body: "On Friday, September 14, Miriam Castell of the Clearwater Accountability Initiative asked Claire to coffee near Dupont Circle. Castell had been sent Claire's name in an unsigned typed note, delivered by bike messenger, from \"someone senior at Meridian who wants it cleaned up.\" Every later instruction came the same way, a different messenger each time, and Castell burned each one as the first note asked. Claire never met the source. Late in September she agreed to help.",
      },
      {
        heading: "One page at a time",
        body: "Three times Castell passed on what the investigators needed next. Each time Claire signed into the stack register for a \"retention audit,\" checked out one box, copied one item on RM-C2, and handed the copy to Castell, who sent it by Capital Courier on Clearwater's account 20417 with the sender left blank. The Tri-County invoice went to the Lockhart Foundation in New York on October 29. The intelligence client schedule reached Blackwood's Pittsburgh office on November 20, and the Kane contractor agreement on December 4. Every page was genuine.",
      },
      {
        heading: "What nobody asked for",
        body: "Filed directly behind each released page was an Executive Office item: a program authorization cover sheet, a routing slip, a contract authorization. Those were the pages that showed who stood above the man at the bottom of the chain, and nobody ever asked for them. After Martin Keller died in Carroway, Claire began copying them for herself, and kept them.",
      },
      {
        heading: "Three names",
        body: "In July, Claire's mentor Alan Corbett had sent the Executive Office a compliance memo naming three programs: the Pittsburgh affiliate, Client Services intelligence, and Baltimore logistics. It came back stamped \"No further action by Compliance,\" and in September his position was eliminated. Holt was arrested on November 15, Rourke on November 21, Kane on December 5: the memo's three names, in its order, and nobody else. On December 6 Claire wrote it all down, and on Friday, December 7, she left her resignation and her badge on the Records Administrator's desk.",
      },
      {
        heading: "The other side of the archive",
        body: "At Julian Rourke's detention hearing on November 26 the government's proffer included the client list page, footer and all. On November 28 Meridian Security's shared records account ran the history of that box, and on December 6 the history of the Kane box and of Claire's badge. From November 29 a \"defense investigator,\" Dean Whitlock, paid in cash by a Rourke loyalist inside Meridian Security, carried notes in and out of legal visits nobody monitors. Brandon Tate, a security contractor who had worked for Rourke's division, began watching Claire. In a grocery line late in November he copied her building fob with a long-range reader. On December 8 Rourke's note came out of the detention center, and on December 9 Tate leased a house in Bristow.",
      },
      {
        heading: "Wednesday morning",
        body: "On Tuesday night Claire wrote to Blackwood and booked the back booth at the Wren for ten. At 6:15 on Wednesday morning a man who said he spoke for the source told Castell that Meridian security knew about the meeting, that Claire must not go, and that a cottage had been chosen where she could wait. Castell booked it and called Claire, and Claire believed her. She left home a little before eight, alone, with a small bag. At 8:14 she wrote you a note at the Wren with a gray Tahoe idling at the hydrant across the street, and at 8:52 her phone went dark on I-66. Tate followed her to Delaplane, then drove back to Alexandria and searched her apartment with the cloned fob.",
      },
      {
        heading: "Laurel Run Lane",
        body: "At 9:02 that night Tate knocked at the cottage and said, \"Miriam sent me.\" That was the only reason Claire opened the door. When she asked to call Miriam first he took her phone. She ran for the back door; he caught her in the kitchen and bound her wrists with zip ties. For three hours he went through her document wallet and asked who had asked her to copy the records and what she had told the Pittsburgh people. At 1:04 AM he took her out of the cottage, and at 1:06 he locked it from outside. On Thursday afternoon he drove past the cottage, saw the deputies, and telephoned with his second story.",
      },
      {
        heading: "Saddle Ridge Lane",
        body: "With a sleep mask over her eyes Tate drove Claire to 12 Saddle Ridge Lane and locked her in a storage room under the basement stairs with a padlock on the outside. He questioned her again on Thursday night and spoke on the phone to someone he called \"W.\" She never told him about Lorton. At 6:10 AM on Friday, December 14, Alexandria and Prince William County police went in. Claire was alive. Tate was in the kitchen.",
      },
      {
        heading: "The source",
        body: "The instructions reached Castell unsigned, by hand, and once by a stranger's voice on the telephone. Every page that would have pointed above Holt, Rourke and Kane stayed in the building. The earlier cases hold: the records were real, and the three men did what Blackwood found. But the leads were chosen to expose them and to stop short of whoever authorized them. Who stands behind EO-01 and signs as \"A,\" the evidence does not yet say.",
      },
    ],
    bennett: [
      "Harris. The Commonwealth's Attorney has your report, and so does Agent Quinlan.",
      "Brandon Tate is charged with abduction and assault. Dean Whitlock was picked up at his apartment in Springfield this morning; he's very interested in telling us who pays him. Quinlan says the U.S. Attorney will be adding to Julian Rourke's charges.",
      "Claire isn't charged with anything. She's a witness, and a good one. She asked for a copy of every page in her file, and she got them. Miriam Castell gave us a full statement. She's not charged either.",
      "Claire asked me to say thank you. And to tell you she still doesn't know who she was working for. Neither do I.",
    ],
    caller: { characterId: "harris", name: "Det. Ross Harris", tag: "Alexandria PD" },
    series: {
      seriesId: "S001",
      title: "The Judas Principle",
      text: "We thought we were following the evidence.\n\nThe evidence was real. The crimes were real.\n\nBut someone chose which truths we would see.\n\nSomeone wanted Adrian Holt exposed. Someone wanted Julian Rourke exposed. Someone wanted Gideon Kane exposed.\n\nAnd we helped them.\n\nThe question is no longer just who runs Meridian. It's why they wanted us to find everyone else.",
    },
  },
};
