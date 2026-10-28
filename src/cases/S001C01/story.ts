import type {
  CallDef,
  CaseDefinition,
  Condition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
  TextDef,
} from "@/game/engine/types";
import { LAB_FOOTWEAR_RECT } from "./desk";

/*
 * S01 C01 story content. Times follow docs/S001C01-timeline.md exactly.
 *
 * Five engine events (RE01 to RE05). RE06, the series board, is not an engine
 * event: the series system runs it after the report is accepted.
 *
 * Dr. Lockhart's lead (RE02) is presented exactly as she presents it: a
 * helpful donor passing on something that reached her office. Nothing here
 * comments on the copier footer or the courier waybill.
 */

export const briefed: Condition = { flag: "casefile_read" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Monday, November 12, 2018", text: "Blackwood Investigations, Pittsburgh field office. 9:30 AM. Low gray sky over the rivers, the radiators knocking." },
  {
    text: "The young woman in your doorway still has a Pitt lanyard around her neck and a key ring clenched in one hand. Hannah Keller, twenty-four. On Friday morning a cleaner found her father, Martin, dead in his office at the Carroway Community Foundation, an hour east of here.",
  },
  {
    text: "'The police say a burglar. Dad was the controller. He balanced the coffee fund to the penny. Nobody breaks into a charity at night for nothing.' She sets the key ring on your desk. 'That's his house on Orchard Street. I can't go in there yet. You can.'",
  },
  {
    text: "Det. Bowman of the Carroway police gave her a summary of what they have. Bennett has already added his own notes. The file is on your desk.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "Evening (Thu 11/8)", text: "Martin Keller works late in his office at the Carroway Community Foundation, Mercantile Building, 118 Market Street.", source: "Case file" },
  { time: "6:40 AM (Fri 11/9)", text: "A contract cleaner finds Martin Keller dead in his office. 911 is called at 6:43 AM.", source: "Case file" },
  { time: "Sun 11/11", text: "Carroway police release the scene. Working theory: a burglary interrupted by the victim.", source: "Case file" },
  { time: "9:30 AM (Mon 11/12)", text: "Hannah Keller hires Blackwood Investigations.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Martin Keller, Carroway, Pennsylvania",
    dossier: [
      { label: "Case ID", value: "S01 C01" },
      { label: "Case title", value: "The Ledger" },
      { label: "Classification", value: "Homicide" },
      { label: "Location", value: "Carroway, Pennsylvania" },
      { label: "Year", value: "2018" },
      { label: "Victim", value: "Martin Keller, 46" },
      { label: "Client", value: "Hannah Keller, his daughter" },
      { label: "Police", value: "Det. Curtis Bowman, Carroway PD, case 18-1108-022" },
      { label: "Contact", value: "Bennett, Blackwood records, by phone" },
    ],
    people: ["martin", "hannah", "whitfield", "holt", "morris", "avery", "bowman"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (from Det. Bowman's notes)",
        spoken:
          "Carroway Police Department, case eighteen, eleven oh eight, oh twenty-two. On Friday, November ninth, twenty eighteen, at about twenty to seven in the morning, a contract cleaner found Martin Keller, forty-six, controller of the Carroway Community Foundation, dead in his office on the second floor of the Mercantile Building, one eighteen Market Street, Carroway. The nine one one call came in at six forty-three. He had been working late the evening before. The office had been searched: a desk drawer forced, a filing cabinet open, books pulled off a shelf. The police are treating it as a burglary interrupted by the victim. The scene was released on Sunday. Lead investigator: Detective Curtis Bowman.",
        body: "CARROWAY POLICE DEPARTMENT. Case 18-1108-022. On Friday, November 9, 2018, at about 6:40 AM, a contract cleaner found Martin Keller, 46, controller of the Carroway Community Foundation, dead in his office on the second floor of the Mercantile Building, 118 Market Street, Carroway. 911 call at 6:43 AM. He had been working late the evening before. The office had been searched: a desk drawer forced, a filing cabinet open, books pulled off a shelf. Working theory: burglary interrupted by the victim. Scene released Sunday, November 11. Lead investigator: Det. Curtis Bowman.",
      },
      {
        heading: "The victim",
        spoken:
          "The victim. Martin Keller, forty-six, of twenty-three Orchard Street, Carroway. Controller of the Carroway Community Foundation, which means he kept its books and signed off on its payments. His daughter Hannah is a graduate student in public policy at Pitt and lives in Squirrel Hill. She says her father had been anxious since October, and told her something at work didn't add up. She has the key to his house.",
        body: "Martin Keller, 46, 23 Orchard Street, Carroway. Controller of the Carroway Community Foundation: he kept its books and signed off on its payments. Daughter: Hannah Keller, 24, graduate student in public policy at Pitt, 5612 Darlington Road, Squirrel Hill. Hannah says he had been anxious since October and told her that \"something at work doesn't add up.\" She has the key to his house.",
      },
      {
        heading: "The foundation and the building",
        spoken:
          "The foundation. The Carroway Community Foundation is a small local charity on the second floor of the Mercantile Building, a four-story brick office building from nineteen twelve. Its main program is the Small Business Recovery Fund, set up in twenty fourteen to give grants to local businesses. The fund's founding donor is the Lockhart Foundation, in New York. Its day-to-day administration is handled by an outside firm in Pittsburgh, Holt Advisory. The building's front doors on Market Street lock at six in the evening. There is a rear service door on Mulberry Alley, onto the rear parking lot. After hours both doors take an access card.",
        body: "The Carroway Community Foundation: a small local charity on the second floor of the Mercantile Building, a four-story 1912 brick office building. Its main program is the Small Business Recovery Fund, established 2014, which makes grants to local businesses. Founding donor: the Lockhart Foundation, New York. Fund administrator: Holt Advisory LLC, Pittsburgh. The building's front doors on Market Street lock at 6:00 PM. A rear service door opens on Mulberry Alley and the rear parking lot. After hours, both doors take an access card.",
      },
      {
        heading: "People",
        spoken:
          "People. Hannah Keller, Martin's daughter, and our client. Susan Whitfield, executive director of the foundation. Angela Morris, the foundation's administrative assistant, who worked late on Thursday. Adrian Holt, of Holt Advisory, the fund's outside administrator, in Suite twenty-two ten at six hundred Grant Street, Pittsburgh. Stanley Avery, security supervisor for the building's owner, who runs the card system from a desk inside the rear service door. And Detective Curtis Bowman, Carroway police.",
        body: "Hannah Keller, Martin's daughter, client. Susan Whitfield, executive director of the foundation. Angela Morris, administrative assistant at the foundation; worked late Thursday. Adrian Holt, Holt Advisory LLC, the fund's outside administrator, Suite 2210, 600 Grant Street, Pittsburgh. Stanley Avery, security supervisor for the building's owner; runs the card system from a desk inside the rear service door. Det. Curtis Bowman, Carroway PD, 40 Court Street.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. Bowman's own report says the wallet, the phone and the laptop were all still on the desk. Burglars don't leave those. He's a careful cop who's been handed an easy answer, and I don't think he likes it. His number is in your phone, and so is mine. If you need a company looked up, ask. B.",
        body: "Bowman's own report says the wallet, the phone and the laptop were still on the desk. Burglars don't leave those. He's a careful cop who's been handed an easy answer, and I don't think he likes it. His number is in your phone, and so is mine. If you need a company looked up, ask. B.",
      },
    ],
  },
];

/* No recorded police interviews in this case: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_hannah_book",
    from: "hannah",
    title: "Call from Hannah Keller",
    lines: [
      "It's Hannah. I keep going over the things Dad used to say.",
      "He had a joke about the one book in his office nobody would ever borrow. Grandpa's Montgomery's Auditing, from the fifties. It's on his office shelf. The jacket's falling apart.",
      "If he hid anything, that's where. 'You know where I keep the things I don't want borrowed.' That's what he meant. I'm sure of it.",
    ],
    effects: [{ setFlag: "book_known" }],
  },
  {
    id: "call_lockhart",
    from: "lockhart",
    title: "Call from Dr. Evelyn Lockhart, New York",
    lines: [
      "Good afternoon. This is Evelyn Lockhart, calling from New York. Forgive me for telephoning out of the blue.",
      "My office sent you an envelope by courier. It should be on your desk by now. I'd rather it be in your hands than in my drawer.",
      "Martin Keller was a decent man. If I can be of any help at all, please call me. My office knows to put you straight through.",
    ],
    effects: [
      {
        note: {
          id: "call:lockhart_intro",
          kind: "call",
          title: "Dr. Lockhart: an envelope from New York",
          text: "Dr. Evelyn Lockhart, founder of the Lockhart Foundation and the fund's founding donor, has sent an envelope by courier and offered to help. She can be telephoned directly.",
          characterId: "lockhart",
        },
      },
    ],
  },
  {
    id: "call_bowman_bank",
    from: "bowman",
    title: "Call from Det. Bowman",
    lines: [
      "Bowman. What you turned up on that $9,500 got me in front of a judge this morning.",
      "Subpoenas went out to the banks for Tri-County, Penn Valley and Monongah. The records came back fast. I sent them straight to Walter Kiley, and he's turned them into a schedule a jury could read.",
      "He's sending you a copy. Read his note at the bottom.",
    ],
    effects: [{ setFlag: "bank_records" }],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "It's Bennett. I'm retired, I'm not dead, and I know what an empty board looks like.",
      "Pin what you've got on that board in the office. When two things belong together, run string between them. The board will tell you when you're onto something.",
      "Costs you nothing to be wrong.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Bennett: use the board",
          text: "Pin the evidence on the murder board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

export const texts: TextDef[] = [
  { id: "t_hannah_book", from: "hannah", body: "Call me back when you can. I remembered something about Dad's office. H." },
  { id: "t_bowman_lab", from: "bowman", body: "Wexford's footwear report is back. Copy on your desk. Read the conclusion twice. C.B." },
  { id: "t_ames_schedule", from: "ames", body: "Det. Bowman asked me to send you a copy of the schedule. It's on your desk. W.A." },
];

/* The one lab test: Det. Bowman sends the toner print and Reddick's boots to the county lab. Real time from the moment he does. */
export const labs: LabDef[] = [
  {
    id: "footwear",
    label: "Footwear: the toner print and Paul Reddick's boots",
    seconds: 180,
    rect: LAB_FOOTWEAR_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_footwear" },
      { text: "t_bowman_lab" },
      { message: "The county lab's footwear comparison is back. It's on your phone and your desk." },
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lockhart_note",
    title: "Courier envelope from New York",
    exterior:
      "A stiff white courier envelope, hand-delivered, addressed in a neat typed label to \"The investigator retained by Ms. Keller, Blackwood Investigations, Pittsburgh.\" The return address is printed in the corner: The Lockhart Foundation, 1140 Fifth Avenue, New York.",
    text: "A letter on heavy cream letterhead, signed Evelyn Lockhart, and behind it a photocopied invoice with a courier waybill stapled to its corner.",
    evidence: ["E030"],
  },
  {
    id: "ames_schedule",
    title: "Schedule from Kiley and Strand",
    exterior: "A manila envelope from Kiley and Strand, CPAs, 310 Grant Street, Pittsburgh, addressed to you by hand: \"Copy, at Det. Bowman's request.\"",
    text: "Walter Kiley's cover note: \"Prepared from the subpoenaed bank records. I have kept it to what the banks show and nothing more. W.A.\"",
    evidence: ["E029"],
  },
  {
    id: "lab_footwear",
    title: "Lab report: footwear comparison",
    exterior: "A Carroway County Crime Laboratory folder, sent on by Det. Bowman, and the same report in your email.",
    text: "Det. Bowman's note: \"Could have, not did. Wexford won't go further than that, and neither will a jury on this alone. C.B.\"",
    evidence: ["E007"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C01",
    title: "Hannah remembers the book",
    characterId: "hannah",
    requires: { any: [{ deduction: "D01" }, { hasEvidence: "E014" }] },
    onActivate: [{ incomingCall: "call_hannah_book" }, { text: "t_hannah_book" }, { message: "Your phone is ringing: Hannah Keller." }],
    complete: { flag: "book_known" },
    evidence: ["E011"],
    notebook: {
      call: "call_hannah_book",
      learned: [
        { text: "Martin kept his grandfather's 1950s copy of Montgomery's Auditing on his office shelf: \"the only book nobody would ever borrow.\"", requires: { flag: "book_known" } },
        { text: "Inside it, behind the old dust jacket, was Martin's own ledger of the fund's payments.", requires: { hasEvidence: "E011" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C01",
    title: "A lead from New York",
    characterId: "lockhart",
    requires: { any: [{ deduction: "D04" }, { hasEvidence: "E012" }, { hasEvidence: "E015" }] },
    onActivate: [{ delivery: "lockhart_note" }, { incomingCall: "call_lockhart" }, { message: "A courier envelope from New York has arrived at the office." }],
    complete: { all: [{ hasEvidence: "E030" }, { callAnswered: "call_lockhart" }] },
    evidence: ["E030"],
    notebook: {
      call: "call_lockhart",
      delivery: "lockhart_note",
      learned: [
        { text: "A courier envelope arrived at the office from the Lockhart Foundation, New York, the fund's founding donor." },
        {
          text: "Inside: a note from Dr. Evelyn Lockhart and a copied Tri-County Facility Partners invoice that reached her office weeks ago with no name and no letter.",
          requires: { hasEvidence: "E030" },
        },
        { text: "Dr. Lockhart has offered to help and can be telephoned directly.", requires: { callAnswered: "call_lockhart" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C01",
    title: "Holt changes his story",
    characterId: "holt",
    requires: { any: [{ presented: "holt:E018" }, { all: [{ asked: "holt_authorizations" }, { hasEvidence: "E018" }] }] },
    onActivate: [{ setFlag: "holt_admits" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Faced with his own signatures, Adrian Holt admitted the engagements were kept under the $50,000 threshold and that some payments were \"not documented to the standard I'd want.\"" },
        { text: "He denies any wrongdoing." },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C01",
    title: "Reddick shuts down",
    characterId: "reddick",
    requires: { deduction: "D07" },
    onActivate: [{ setFlag: "reddick_refuses" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Paul Reddick's account of Thursday night does not hold, and he has stopped answering questions." },
        { text: "He may talk again if you find something new he has to explain." },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C01",
    title: "The bank records",
    characterId: "bowman",
    requires: { deduction: "D10" },
    onActivate: [{ incomingCall: "call_bowman_bank" }, { message: "Your phone is ringing: Det. Bowman." }],
    complete: { callAnswered: "call_bowman_bank" },
    onComplete: [{ delivery: "ames_schedule" }, { text: "t_ames_schedule" }],
    evidence: ["E029"],
    notebook: {
      call: "call_bowman_bank",
      delivery: "ames_schedule",
      learned: [
        { text: "Det. Bowman served subpoenas on the banks of Tri-County Facility Partners, Penn Valley Business Services and Monongah Strategy Group.", requires: { callAnswered: "call_bowman_bank" } },
        { text: "Walter Kiley turned the bank records into a schedule of where the fund's money went next.", requires: { hasEvidence: "E029" } },
      ],
    },
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read the case file on your desk", visible: { always: true }, done: briefed },
  { id: "o_scene", text: "Go to Martin's office at the foundation", visible: briefed, done: { visited: "martin_office" } },
  { id: "o_people", text: "Talk to Hannah, Det. Bowman and Susan Whitfield", visible: briefed, done: { all: [{ talkedTo: "hannah" }, { talkedTo: "bowman" }, { talkedTo: "whitfield" }] } },
  { id: "o_home", text: "Go through Martin's house on Orchard Street", visible: briefed, done: { visited: "keller_home" } },
  { id: "o_target", text: "Find out what the intruder came for", visible: briefed, done: { deduction: "D01" } },
  { id: "o_board", text: "Connect evidence on the murder board", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },
  { id: "o_book", text: "Find the book Martin kept on his office shelf", visible: { flag: "book_known" }, done: { hasEvidence: "E011" } },
  { id: "o_martin", text: "Find out what Martin was looking into", visible: briefed, done: { deduction: "D02" } },
  { id: "o_access", text: "Find out who could get into the building that night", visible: briefed, done: { deduction: "D06" } },
  { id: "o_money", text: "Follow the fund's money", visible: { any: [{ deduction: "D04" }, { hasEvidence: "E011" }, { hasEvidence: "E015" }] }, done: { deduction: "D05" } },
  { id: "o_control", text: "Find out who controlled the payments", visible: { deduction: "D04" }, done: { deduction: "D09" } },
  { id: "o_report", text: "File your final report from the office", visible: { deduction: "D06" }, done: { flag: "case_closed" } },
];

/* The report can be opened once the file is read, the investigation has substance, and after-hours access is established. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [briefed, { evidenceCount: 10 }, { deduction: "D06" }],
};
