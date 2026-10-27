import "server-only";
import type { CaseDefinition, DeductionDef } from "@/game/engine/types";
import { hurstKnown, lyonsKnown, rourkeKnown } from "./story";

/*
 * RESTRICTED STORY LOGIC for S01 C02, Room 614. Server-only. Nothing here
 * reaches the browser until the player earns it (a confirmed deduction) or
 * closes the case. Deductions follow the table in docs/S001C02-timeline.md.
 *
 * Deductions are pairs; three-item deductions and the ones built on other
 * deductions use `requires`. The card signed "A" is in no deduction, and the
 * closing never says who sent it, how it reached Rourke, or where the courier
 * envelope came from.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "Jonathan Did Not Pack to Leave",
    text: "His phone, his wallet, his car keys, his coat, his dress shoes and the suit he had pressed for Monday were all left in Room 614, and his car stayed in the valet garage. Only his Eastbridge laptop and its bag are gone. He did not plan to leave.",
    connections: [["E002", "E004"], ["E003", "E004"], ["E002", "E017"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "The Disappearance Was Not Routine",
    text: "Jonathan was afraid of what speaking would cost him. He told his sister who to call if she didn't hear from him and not to talk to anyone from his work, and then he missed the appointment he had built his whole weekend around.",
    connections: [["E003", "E020"], ["E020", "E024"], ["E017", "E020"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "Someone Came to Room 614",
    text: "Nobody keyed into Room 614 after Jonathan's own key at 6:39 PM, and nobody passed the sixth-floor camera after 8:55 PM. Yet the door was opened from inside at 10:32 PM and again at 10:58 PM. Someone came to his door from the far end of the corridor, where the camera can't see.",
    connections: [["E006", "E007"], ["E005", "E006"]],
  },
  {
    id: "D04",
    code: "D04",
    title: "The Service Corridor Was Used",
    text: "A temporary badge came in at the dock door at 10:24 PM, rode the service elevator to six and opened service door S6-2 at 10:29. At 10:59 S6-2 opened from inside, the service elevator went down to B1, and the dock door opened from inside at 11:04.",
    connections: [["E008", "E014"], ["E007", "E008"], ["E009", "E014"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "The Alarm Was Deliberately Disabled",
    text: "The alarm on S6-2 was put into bypass at 10:19 PM for 45 minutes, citing a work order not scheduled until Tuesday morning, under the code of an engineer who had clocked out at 10:02, with no approval from the Director of Security.",
    connections: [["E009", "E010"], ["E009", "E016"]],
  },
  {
    id: "D06",
    code: "D06",
    title: "Hurst Had Access and Misstated His Movements",
    text: "Kevin Hurst issued vendor badge T-07 at 9:41 PM. His own badge opened the B1 service corridor at 10:16 PM and went out through the employee entrance at 11:09 PM, long after he says he clocked out and caught the bus home.",
    connections: [["E015", "E016"], ["E008", "E016"]],
    requires: { talkedTo: "hurst" },
  },
  {
    id: "D07",
    code: "D07",
    title: "The Loading Dock Was the Way Out",
    text: "The dock was secured at 8:05 PM with no delivery due until morning. Yet a gray van with Maryland plates sat in bay 2 with its lights off from 10:21 to 11:06 PM, and at 11:04 three people came out of the dock door to it. One of them was put in its side door.",
    connections: [["E011", "E012"], ["E011", "E013"], ["E012", "E013"]],
    requires: { all: [{ hasEvidence: "E011" }, { hasEvidence: "E012" }, { hasEvidence: "E013" }] },
  },
  {
    id: "D08",
    code: "D08",
    title: "Jonathan Was Being Pressured",
    text: "In 2017 a lender in Rockville, Northgate Bridge Lending, cleared Jonathan's debts with a forgivable loan and went on paying him $2,500 a month that he never reported. This autumn a man waited by his car to say his sister's name. Money, and fear.",
    connections: [["E019", "E024"], ["E019", "E020"], ["E018", "E024"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "Jonathan Intended to Disclose",
    text: "His employer had traced the disclosed pricing to his own export. The task force had him booked for 9:30 on Monday, and he had written \"All of it. Including me.\" His lawyer was holding something for him to collect that morning. He meant to tell them everything.",
    connections: [["E017", "E018"], ["E017", "E021"], ["E018", "E021"]],
    requires: { all: [{ hasEvidence: "E017" }, { hasEvidence: "E018" }, { hasEvidence: "E021" }] },
  },
  {
    id: "D10",
    code: "D10",
    title: "Rourke Had Reason to Silence Him",
    text: "Jonathan was Julian Rourke's paid source, and he was about to tell a federal task force everything. The phone that called him at 9:12 on Sunday night called Rourke's Meridian cell three times that night and the next morning.",
    connections: [["E025", "E026"], ["E024", "E026"], ["E018", "E025"]],
    requires: { deduction: "D09" },
    effects: [{ delivery: "courier_client_list" }, { text: "t_bennett_courier" }, { message: "A courier envelope has arrived at the Pittsburgh office. Bennett has signed for it." }],
  },
  {
    id: "D11",
    code: "D11",
    title: "Lyons Coordinated the Movement",
    text: "The van in bay 2 belongs to Kestrel Protective Group, Garrett Lyons's firm. The man the hotel engineer knew as \"G\" bought him, got the room number, the badge, the alarm and the elevator, and texted \"Here\" as the van backed in. The same number reported to Rourke's phone that night.",
    connections: [["E027", "E030"], ["E026", "E030"]],
  },
  {
    id: "D12",
    code: "D12",
    title: "Jonathan Was Taken to the Farmhouse",
    text: "Briarfield Holdings, a Lyons company, rents a farmhouse at 4 Sawmill Hollow Road in Frederick County. Its alarm was disarmed at 12:16 AM on Monday, 35 minutes after the van passed Germantown northbound, and every time Lyons has left since, he has set it for someone inside.",
    connections: [["E028", "E031"], ["E027", "E031"]],
    requires: { hasEvidence: "E028" },
  },
  {
    id: "D13",
    code: "D13",
    title: "Jonathan Was Kidnapped",
    text: "Jonathan was walked out of the hotel by a route built for the purpose, through a door whose alarm had been turned off for it, to a van that came for him, and locked in a room made ready for him the day before.",
    connections: [["E032", "jonathan"], ["E032", "E002"], ["E032", "E011"]],
    requires: { all: [{ deduction: "D01" }, { deduction: "D04" }, { deduction: "D05" }, { deduction: "D07" }, { hasEvidence: "E032" }] },
  },
  {
    id: "D14",
    code: "D14",
    title: "Rourke Directed the Kidnapping",
    text: "Rourke's source was about to talk. Rourke's field man took him, and reported to Rourke's phone through the night and the next morning. Rourke's own division paid for both of them.",
    connections: [["rourke", "lyons"], ["rourke", "E026"], ["rourke", "E034"]],
    requires: { all: [{ deduction: "D08" }, { deduction: "D09" }, { deduction: "D10" }, { deduction: "D11" }, { deduction: "D13" }] },
  },
  {
    id: "D15",
    code: "D15",
    title: "Meridian Collects Secrets for Leverage",
    text: "Meridian's Corporate Intelligence clients pay for their competitors' secrets, and the division keeps files on people, their debts, their families, their health, to make them comply. Jonathan was one of the files.",
    connections: [["E023", "E035"], ["E033", "E035"], ["E023", "E033"]],
    requires: { all: [{ hasEvidence: "E023" }, { hasEvidence: "E033" }, { hasEvidence: "E035" }] },
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "happened",
    section: "A",
    title: "What Happened",
    question: "What happened to Jonathan Ellery?",
    options: [
      { id: "kidnapped", label: "He was kidnapped from his room and held against his will" },
      { id: "voluntary", label: "He left voluntarily to avoid testifying" },
      { id: "staged", label: "He hid himself and staged it" },
      { id: "fled", label: "He fled the country" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "coordinator",
    section: "B",
    title: "The Kidnapper",
    question: "Who coordinated and carried out the kidnapping?",
    options: [
      { id: "lyons", label: "Garrett Lyons", requires: lyonsKnown },
      { id: "rourke", label: "Julian Rourke", requires: rourkeKnown },
      { id: "hurst", label: "Kevin Hurst", requires: hurstKnown },
      { id: "wallace", label: "Douglas Wallace" },
      { id: "okoye", label: "David Okoye" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "accomplice",
    section: "C",
    title: "Inside the Hotel",
    question: "Who helped move him through the hotel?",
    options: [
      { id: "hurst", label: "Kevin Hurst", requires: hurstKnown },
      { id: "wallace", label: "Douglas Wallace" },
      { id: "monroe", label: "Tessa Monroe" },
      { id: "grant", label: "Celia Grant" },
      { id: "nobody", label: "Nobody: he was not moved" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "director",
    section: "D",
    title: "The Order",
    question: "Who directed the operation?",
    options: [
      { id: "rourke", label: "Julian Rourke", requires: rourkeKnown },
      { id: "lyons", label: "Garrett Lyons", requires: lyonsKnown },
      { id: "holt", label: "Adrian Holt" },
      { id: "okoye", label: "David Okoye" },
      { id: "grant", label: "Celia Grant" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why",
    section: "E",
    title: "The Motive",
    question: "Why was he taken?",
    options: [
      { id: "silence", label: "To stop him disclosing Meridian's intelligence operation and to recover his copies" },
      { id: "debt", label: "To collect a debt" },
      { id: "ransom", label: "For ransom" },
      { id: "eastbridge", label: "To stop him testifying against Eastbridge" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "route",
    section: "F",
    title: "The Way Out",
    question: "How was he taken out of the hotel?",
    options: [
      { id: "service", label: "Through the sixth-floor service door, the service elevator and the loading dock" },
      { id: "lobby", label: "Through the lobby" },
      { id: "garage", label: "Down the guest stairs and out the garage" },
      { id: "laundry", label: "In a laundry cart through the kitchen" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "held",
    section: "G",
    title: "Where He Was Held",
    question: "Where was he held?",
    options: [
      { id: "farmhouse", label: "A farmhouse in Frederick County, Maryland, leased by a Lyons company", requires: { hasEvidence: "E028" } },
      { id: "kestrel", label: "Kestrel's office in Rockville", requires: lyonsKnown },
      { id: "meridian", label: "Meridian's offices on K Street" },
      { id: "hotel", label: "Another room in the hotel" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "meridian",
    section: "H",
    title: "Meridian's Business",
    question: "What was Meridian's Corporate Intelligence division doing?",
    options: [
      { id: "leverage", label: "Collecting confidential and compromising information to influence and pressure people" },
      { id: "compliance", label: "Ordinary compliance consulting" },
      { id: "money", label: "Moving foundation money and nothing more" },
      { id: "lobbying", label: "Lobbying Congress" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "innocent",
    section: "I",
    title: "Jonathan's Part",
    question: "Was Jonathan an entirely innocent participant?",
    options: [
      { id: "sold", label: "No: he sold his employer's information for money, then tried to come clean" },
      { id: "innocent", label: "Yes, entirely innocent" },
      { id: "organizer", label: "No, he organized the scheme" },
      { id: "staged", label: "No, he staged his own disappearance" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "superior",
    section: "J",
    title: "The Card",
    question: "Does the evidence identify who signed as \"A\"?",
    options: [
      { id: "no", label: "No: \"A\" is not identified" },
      { id: "holt", label: "Yes, Adrian Holt" },
      { id: "rourke", label: "Yes, Julian Rourke himself" },
      { id: "lyons", label: "Yes, Garrett Lyons" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Jonathan Ellery was kidnapped from Room 614. Garrett
 * Lyons coordinated it and carried it out; Kevin Hurst moved him through the
 * hotel; Julian Rourke directed it, to stop Jonathan disclosing Meridian's
 * intelligence operation and to recover his copies. Out through S6-2, service
 * elevator S1 and the loading dock; held at a Frederick County farmhouse
 * leased by Lyons's company. Meridian collects secrets for leverage. Jonathan
 * sold his employer's information, then tried to come clean. "A" is not
 * identified.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    happened: "kidnapped",
    coordinator: "lyons",
    accomplice: "hurst",
    director: "rourke",
    why: "silence",
    route: "service",
    held: "farmhouse",
    meridian: "leverage",
    innocent: "sold",
    superior: "no",
  },
  standard: {
    // 36 items: at least 6 key, at most 9 attached (Final Report Standard).
    minItems: 6,
    maxItems: 9,
    minKey: 6,
    claims: [
      {
        id: "night",
        label: "Ties the people you name to the night he disappeared",
        anyOf: ["E008", "E009", "E011", "E013", "E014", "E015", "E016", "E027", "E029", "E030"],
        hint: "Go back over the hotel's own systems for Sunday night, and the dock.",
      },
      {
        id: "why",
        label: "Shows why he was taken",
        anyOf: ["E017", "E018", "E019", "E021", "E023", "E024", "E025", "E026"],
        hint: "Find out what Jonathan was about to do on Monday morning, and who had paid him.",
      },
      {
        id: "how",
        label: "Shows how he was taken out of the hotel",
        anyOf: ["E002", "E004", "E006", "E007", "E008", "E009", "E010", "E011", "E012", "E014"],
        hint: "Walk the corridor past the camera's reach, and the floors guests never see.",
      },
      {
        id: "held",
        label: "Shows where he was held",
        anyOf: ["E028", "E031", "E032"],
        hint: "The man who owns the van keeps careful records. So does his alarm company.",
      },
      {
        id: "orders",
        label: "Shows who gave the orders",
        anyOf: ["E023", "E026", "E034"],
        hint: "Look at whose phone the night's caller reported to, and whose budget paid for it all.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical", anyOf: ["E002", "E004", "E032"] },
      {
        id: "movement",
        label: "Access and movement",
        anyOf: ["E005", "E006", "E007", "E008", "E009", "E010", "E011", "E012", "E013", "E014", "E015", "E016", "E027", "E030", "E031"],
      },
      {
        id: "money",
        label: "Records and money",
        anyOf: ["E017", "E018", "E019", "E021", "E023", "E024", "E025", "E026", "E028", "E029", "E034"],
      },
    ],
    minLines: 3,
    linkToSuspect: ["E015", "E016", "E027", "E028", "E029", "E030", "E031"],
    linkNote: "Nothing attached ties the people you name to the night of November 18 or to where Jonathan was held.",
    supporting: ["E001", "E003", "E005", "E020", "E022", "E033", "E035", "E036"],
    maxUnrelated: 1,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Nadia Collins, Metropolitan Police Department, and through her to the U.S. Attorney's Office for the District of Columbia and the FBI's Washington Field Office.",
    reconstruction: [
      {
        heading: "Eighteen months",
        body: "By early 2017 Jonathan Ellery, a senior procurement analyst at Eastbridge Systems, owed about $94,000, most of it his mother's memory-care bills and a business loan he had guaranteed for a friend. In June 2017 Julian Rourke, Director of Corporate Intelligence at Meridian Advisory Group, signed him as a paid \"independent advisor.\" Northgate Bridge Lending, run from the office of Rourke's operations coordinator, Garrett Lyons, cleared his debts with a $60,000 \"forgivable\" loan and paid him $2,500 a month. At first Meridian wanted trends. Then it wanted pricing. On May 14, 2018 Jonathan exported Eastbridge's unreleased rate tables for the recompete, and they reached Corvane Systems, a Meridian client, in a Meridian \"market brief.\" He knew it was wrong from the first file.",
      },
      {
        heading: "Everyone has a file",
        body: "On October 30 Rourke asked for more: the names, home addresses and \"anything personal\" of the government evaluators on the contract award. Jonathan refused. Rourke told him that everyone has a file, and Jonathan's phone recorded it. Lyons began following him that day. On November 1 he was waiting by Jonathan's car in the Eastbridge garage: \"Think about Natalie.\"",
      },
      {
        heading: "The confession he planned",
        body: "Eastbridge had already traced the pricing to Jonathan's export, and a federal task force was calling everyone with access. Jonathan went to Irene Chen on October 31. On November 14 she advised him to tell the task force everything, his own part included, and he agreed: a voluntary interview on Monday, November 19, at 9:30 AM. That day he booked the Ashcroft by phone, so as not to sleep at home. The confirmation went to the mailbox Meridian had given him in 2017, and Meridian still read it.",
      },
      {
        heading: "Thursday to Saturday",
        body: "Rourke sent Lyons to bring Jonathan and his copies in. Kestrel had run the hotel's engineering staff through its databases, and Kevin Hurst's debts to an offshore sportsbook stood out. On Thursday, November 15, Lyons met him at a sports bar near the hotel and offered $7,500 to make the debt go away. On Friday he paid a third of it at a diner and printed an extract of Meridian's Compromising Information Index. On Saturday he bought a hasp, a padlock, 2x4s and cable ties in Frederick, and spent the afternoon at the farmhouse on Sawmill Hollow Road that his company Briarfield Holdings had leased in August, bypassing the motion sensor in the upstairs back bedroom.",
      },
      {
        heading: "Sunday night",
        body: "At 1:00 PM Jonathan left a sealed envelope with Irene Chen: a PIN-locked drive with his copies, the tasking emails and the October 30 recording. Lyons, following him, saw him go in. At 3:44 he checked into Room 614. At about 7:50 PM the man in the cap who asked the front desk for his room number was Lyons. Refused, he texted Hurst, and at 8:20 Hurst gave him 614 from the hotel's room-status screen. At 9:12 Lyons called Jonathan (\"We should talk before tomorrow\") and Jonathan hung up. Hurst issued badge T-07 at 9:41, clocked out at 10:02, and at 10:19 bypassed the alarm on S6-2 against a work order not due until Tuesday. At 10:31 Lyons knocked and said \"five minutes, and you never see us again,\" and Jonathan, who had met him a dozen times, opened the door. Inside, Lyons threatened his sister, took his Eastbridge laptop, and, when Jonathan would not say where his copies were, tied his hands.",
      },
      {
        heading: "The second building",
        body: "At 10:58 PM they came out of 614 and turned north, away from the camera, through S6-2 at 10:59. Hurst held service elevator S1 on six on independent service with his key, took it down to B1, and held dock door D-B1-3 at 11:04 with his face to the wall. Jonathan, coatless, his hands tied, was put through the side door of Kestrel's gray van in bay 2, and it left at 11:06. Every guest-facing camera in the hotel saw nothing. The one camera that saw it all, DOCK-1, was on page 3 of the monitor wall, and nobody looked at it on Monday. At 11:12 Lyons reported to Rourke's cell.",
      },
      {
        heading: "Sawmill Hollow Road",
        body: "At 12:16 AM Lyons disarmed the farmhouse and locked Jonathan in the upstairs room. From then on he set the alarm to ARMED STAY, for someone inside, every time he left. At 7:05 on Monday morning, through the door, Jonathan heard him on the phone: \"He says there are no copies, Julian.\" Jonathan scratched the dates into the paint on the door. Before dawn on Wednesday, the night after the police searched Kestrel's office, Lyons backed the van to the porch to move what he could. The Maryland State Police were already on the lane. He was arrested in the driveway, and Jonathan was found alive upstairs. Hurst was arrested at his apartment that afternoon.",
      },
      {
        heading: "Report only when resolved",
        body: "On Monday morning Rourke received a typed card: \"Contain the Ellery exposure. Preserve the client structure. Report only when resolved. A.\" He kept it in his office safe with his passport, cash and a pistol, where the FBI found it at 2:30 on Wednesday afternoon; he was arrested at 3:10. Adrian Holt had been in a cell in Carroway since the Thursday before. The card shows that someone above Rourke gives him instructions. It does not say who.",
      },
    ],
    bennett: [
      "Collins. Your report's with my lieutenant, the U.S. Attorney's office and Agent Quinlan, and it holds.",
      "Garrett Lyons is charged federally with kidnapping. Kevin Hurst is charged with conspiracy; he's talking, mostly about how sorry he is. Julian Rourke was arrested at his desk yesterday afternoon on a federal warrant, conspiracy to commit kidnapping, and he's being held without bond. Agent Teresa Quinlan at the Washington Field Office has the federal case.",
      "Jonathan's home with his sister. He'll testify, and he'll answer for what he sold. Irene Chen says that was always his plan.",
      "Quinlan asked me to tell you she'd like to keep your number. Something about that card in Rourke's safe. Thank you.",
    ],
    caller: { characterId: "collins", name: "Det. Nadia Collins", tag: "MPD" },
    series: {
      seriesId: "S001",
      title: "The Judas Principle",
      text: "The money trail from Carroway has led to something more troubling.\n\nMeridian Advisory Group is not simply moving funds. Someone is collecting secrets.\n\nAnd someone above the people we've identified is giving instructions.",
      board: "The rolling board is where you left it. Whatever you choose to keep from Room 614 goes on it beside Carroway.",
    },
  },
};
