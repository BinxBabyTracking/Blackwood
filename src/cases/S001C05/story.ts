import type {
  CallDef,
  CaseDefinition,
  ChapterDef,
  Condition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  ObjectiveDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
  TextDef,
} from "@/game/engine/types";
import { LAB_BOOKEND_RECT, LAB_GLASS_RECT } from "./desk";

/*
 * S01 C05 story content. Times follow docs/S001C05-timeline.md exactly.
 *
 * Ten engine events (RE01 to RE10), five chapters (C006's chapter system),
 * two lab tests. Dialogue never names a clock time for "now"; the fiction's
 * clock runs on what the player has done, as C01's does.
 *
 * Dr. Lockhart is presented only as the records and her own words show her.
 * Nothing here says who "A." or the Architect is, and nothing is pinned or
 * connected for the player (RE10 writes a notebook line and nothing else).
 */

export const briefed: Condition = { flag: "casefile_read" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Thursday, December 20, 2018", text: "The Grand Ballroom of the Belgrave Grand Hotel, Park Avenue at East 53rd Street, Manhattan. The Lockhart Foundation's Winter Gala. Late in the evening." },
  {
    text: "You are here as Dr. Evelyn Lockhart's guest. Her invitation came to the Pittsburgh office after the Carroway case, in her own hand. The auction never finished: at twenty past ten it was stopped, the police came in, and the doors were shut.",
  },
  {
    text: "A man named Nathaniel Ogden, an adviser to the foundation, has been found dead in a conference suite on the mezzanine. Hotel security is calling it a fall, or a robbery. Dr. Lockhart crosses the room to you with her hands held together, very still. 'You found out what happened to Martin Keller. Please find out what happened to Nathaniel. Whatever you need.'",
  },
  {
    text: "Det. Anthony Caruso of Manhattan South Homicide has agreed to share his file. His notes and Bennett's are already on your phone.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "6:30 PM (Thu 12/20)", text: "Reception for the Lockhart Foundation Winter Gala, Belgrave Grand Hotel.", source: "Case file" },
  { time: "7:30 PM (Thu 12/20)", text: "Dinner in the Grand Ballroom. Nathaniel and Claudia Ogden at table 4.", source: "Case file" },
  { time: "9:30 PM (Thu 12/20)", text: "Dr. Lockhart begins her remarks on stage.", source: "Case file" },
  { time: "10:12 PM (Thu 12/20)", text: "Victoria Lane finds Nathaniel Ogden in Conference Suite C, on the mezzanine. 911 is called at 10:14 PM.", source: "Case file" },
  { time: "10:20 PM (Thu 12/20)", text: "The auction is stopped and the guests are held in the ballroom.", source: "Case file" },
  { time: "11:05 PM (Thu 12/20)", text: "Dr. Lockhart asks Blackwood Investigations to find out what happened. Det. Caruso agrees to share his file.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Nathaniel Ogden, Manhattan, New York",
    dossier: [
      { label: "Case ID", value: "S01 C05" },
      { label: "Case title", value: "The Benefactor" },
      { label: "Classification", value: "Homicide" },
      { label: "Location", value: "Manhattan, New York" },
      { label: "Year", value: "2018" },
      { label: "Victim", value: "Nathaniel Ogden, 57" },
      { label: "Client", value: "Dr. Evelyn Lockhart, the Lockhart Foundation" },
      { label: "Police", value: "Det. Anthony Caruso, NYPD Manhattan South Homicide" },
      { label: "Contact", value: "Bennett, by phone" },
    ],
    people: ["nathaniel", "lockhart", "claudia", "marchetti", "bellamy", "lane", "porter", "caruso"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (from Det. Caruso's notes)",
        spoken:
          "New York City Police Department, Midtown North Precinct, complaint twenty eighteen, oh one eight, oh four four one seven. Assigned to Detective Anthony Caruso, Manhattan South Homicide. On Thursday, December twentieth, twenty eighteen, at ten fourteen at night, the Belgrave Grand Hotel called nine one one: a man unconscious in Conference Suite C, on the mezzanine level, during the Lockhart Foundation's Winter Gala. He was Nathaniel Ogden, fifty-seven, a guest at the gala. Victoria Lane, the foundation's director of events, found him at twelve minutes past ten. Emergency medical services pronounced him dead at ten twenty-nine. Hotel security's first view is a fall, or a robbery: his wallet was found open and empty by the door. Detective Caruso arrived at ten forty-five, and he is not satisfied with either.",
        body: "NYPD, Midtown North Precinct. Complaint 2018-018-04417. Assigned: Det. Anthony Caruso, Manhattan South Homicide. Thursday, December 20, 2018, 10:14 PM: 911 from the Belgrave Grand Hotel, a man unconscious in Conference Suite C, mezzanine level, during the Lockhart Foundation Winter Gala. Victim: Nathaniel Ogden, 57, a guest. Found by Victoria Lane, the foundation's director of events, at 10:12 PM. Pronounced dead by EMS at 10:29 PM. Hotel security's first view: a fall or a robbery (wallet found open and empty by the door). Det. Caruso on scene 10:45 PM, satisfied with neither.",
      },
      {
        heading: "The victim",
        spoken:
          "The victim. Nathaniel Ogden, fifty-seven, of three twelve West eighty-seventh Street, on the Upper West Side. An independent investment adviser, of Ogden Fiduciary Partners on Sixth Avenue. Since twenty sixteen he advised the Lockhart Foundation's investment committee. He came to the gala with his wife, Claudia, and sat at table four. She says he carried his briefcase all evening.",
        body: "Nathaniel Ogden, 57, 312 West 87th Street, Apt. 4, Upper West Side. Independent investment adviser, Ogden Fiduciary Partners LLC, 1185 Sixth Avenue. Adviser to the Lockhart Foundation's investment committee since 2016. At the gala with his wife, Claudia Ogden, table 4. She says he carried his briefcase all evening.",
      },
      {
        heading: "The gala and the hotel",
        spoken:
          "The gala. The Lockhart Foundation's Winter Gala, at the Belgrave Grand, Park Avenue at East fifty-third Street. Reception at six thirty, dinner at seven thirty, Doctor Lockhart's remarks at nine thirty, then an auction, which was stopped at ten twenty. The Grand Ballroom is on the main floor. Above it is a mezzanine, with Conference Suites A to D along a corridor, and a staff door at the far end into the back of the house. Event security for the night was a contract firm hired through the foundation's counsel.",
        body: "The Lockhart Foundation Winter Gala, Belgrave Grand Hotel, Park Avenue at East 53rd Street. Reception 6:30 PM, dinner 7:30, Dr. Lockhart's remarks 9:30, auction after (stopped at 10:20). The Grand Ballroom is on the main floor; above it, a mezzanine with Conference Suites A to D along the conference corridor, and a staff door at the far end into the back of house. Event security: a contract firm engaged through the foundation's counsel.",
      },
      {
        heading: "People",
        spoken:
          "People. Doctor Evelyn Lockhart, founder and chair of the Lockhart Foundation, our host and our client. Claudia Ogden, Nathaniel's wife. Elena Marchetti, the foundation's outside counsel. Lionel Bellamy, the foundation's chief financial officer. Victoria Lane, its director of events. James Porter, security supervisor at the Belgrave Grand. And Detective Anthony Caruso, Manhattan South Homicide.",
        body: "Dr. Evelyn Lockhart, founder and chair, the Lockhart Foundation, 1140 Fifth Avenue; host and client. Claudia Ogden, the victim's wife. Elena Marchetti, Marchetti Law Group PLLC, the foundation's outside counsel. Lionel Bellamy, Chief Financial Officer, the Lockhart Foundation. Victoria Lane, Director of Events, the Lockhart Foundation. James Porter, Security Supervisor, Belgrave Grand Hotel. Det. Anthony Caruso, NYPD Manhattan South Homicide.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. Caruso's a good one. Twenty years in, still reads every page himself. He wrote in the margin of his own file that he's never seen a robber leave a gold watch on a man's wrist. Neither have I. You're in a room full of people with lawyers, so mind your manners and take your time. My number's in your phone. B.",
        body: "Caruso's a good one. Twenty years in, still reads every page himself. He wrote in the margin of his own file that he's never seen a robber leave a gold watch on a man's wrist. Neither have I. You're in a room full of people with lawyers, so mind your manners and take your time. My number's in your phone. B.",
      },
    ],
  },
];

/* No recorded police interviews: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_lockhart_records",
    from: "lockhart",
    title: "Call from Dr. Evelyn Lockhart",
    lines: [
      "It's Evelyn Lockhart. Lionel tells me you've been asking about our investments. Good. I would rather you asked us than wondered.",
      "I'm having our investment register sent over to you, everything we hold as of our last valuation. And I've told Lionel to open the records archive downstairs for you. Take whatever time you need.",
      "Nathaniel was a careful man. If he had questions, they deserve answers. I'd like you to have them.",
    ],
    effects: [
      {
        note: {
          id: "call:lockhart_records",
          kind: "call",
          title: "Dr. Lockhart opens the foundation's records",
          text: "Dr. Lockhart is sending the foundation's investment register, and has told Lionel Bellamy to open the records archive on the lower level at 1140 Fifth Avenue.",
          characterId: "lockhart",
        },
      },
    ],
  },
  {
    id: "call_wexler",
    from: "wexler",
    title: "Call from Simon Wexler",
    lines: [
      "This is Simon Wexler, from Nathaniel's office. I'm sorry. I should have said more when you came by.",
      "I've been sitting on what I know because I didn't know who I could trust. The foundation is a third of our business. But he'd want me to tell you.",
      "I can meet you at the office, or you can call me. I've written down what he was working on. And he kept copies of everything. I can open them.",
    ],
    effects: [
      {
        note: {
          id: "call:wexler",
          kind: "call",
          title: "Simon Wexler decides to talk",
          text: "Simon Wexler, Nathaniel's junior analyst, has written up what Nathaniel was working on, knows he kept copies of everything, and can open them. He can be met at the office or telephoned.",
          characterId: "wexler",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_bennett_lawyer",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "Bennett. I've read the letter Marchetti sent you. It's a good letter. It's supposed to make you go away.",
      "You want a trusts lawyer who isn't on anybody's payroll. Lawrence Abernathy, midtown, teaches at NYU on the side. Nathaniel Ogden bought him lunch last Monday, if the man's calendar is anything to go by.",
      "Call him. Ask him what a limited partner is allowed to see.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_lawyer",
          kind: "call",
          title: "Bennett: a trusts lawyer",
          text: "Bennett suggests Lawrence Abernathy, a partner in trusts and private funds at a midtown firm and an adjunct at NYU Law, whom Nathaniel consulted on December 17. He can be telephoned.",
          characterId: "bennett",
        },
      },
    ],
  },
  {
    id: "call_caruso_jfk",
    from: "caruso",
    title: "Call from Det. Caruso",
    lines: [
      "Caruso. Your security lead booked himself a one-way ticket last night. JFK to Panama City, eight in the morning.",
      "Port Authority's holding him at the gate for me. Nobody's charging him with anything yet. He can call it a vacation if he likes.",
      "His phone goes to our lab. And I've pulled his truck's plate reads and his tolls for Thursday night. I'll send you a copy.",
    ],
    effects: [
      {
        note: {
          id: "call:caruso_jfk",
          kind: "call",
          title: "Det. Caruso: Knox held at JFK",
          text: "Gabriel Knox booked a one-way flight to Panama City. Port Authority police held him at the gate at Det. Caruso's request, and his phone has gone to the NYPD lab. Det. Caruso is sending the vehicle and toll records for Thursday night.",
          characterId: "caruso",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_caruso_briefcase",
    from: "caruso",
    title: "Call from Det. Caruso",
    lines: [
      "Caruso. A judge signed for the storage unit in Long Island City. Bridgeview, unit 3C-27. Knox Protective's had it since 2016.",
      "The briefcase was there. Brass corners, his initials on the plate. And something wrapped in a hotel napkin inside it.",
      "The property invoice is on its way to you, with copies of the papers he was carrying. If you want the lab on the rest, ask me.",
    ],
    effects: [
      {
        note: {
          id: "call:caruso_briefcase",
          kind: "call",
          title: "Det. Caruso: the briefcase is recovered",
          text: "Under a warrant, Det. Caruso recovered Nathaniel's briefcase from Bridgeview Self Storage unit 3C-27, rented by Knox Protective Services. Something wrapped in a hotel napkin was inside. He is sending the property invoice and copies of the papers.",
          characterId: "caruso",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_donovan",
    from: "donovan",
    title: "Call from Claire Donovan, Alexandria",
    lines: [
      "This is Claire Donovan. Your colleague Bennett gave me this number. He told me what Mr. Ogden found.",
      "I kept my own register of everything I copied for Miriam, and when. I've been staring at it since he called.",
      "If you have Mr. Ogden's dates, I'd like to lay mine beside them. I can only speak to my own part. But I think you should hear it.",
    ],
    effects: [
      {
        note: {
          id: "call:donovan",
          kind: "call",
          title: "Claire Donovan calls from Alexandria",
          text: "Claire Donovan, the former Meridian records analyst, wants to compare her own copy register with Nathaniel's dates. She can be telephoned.",
          characterId: "donovan",
        },
      },
    ],
  },
  {
    id: "call_caruso_warrant",
    from: "caruso",
    title: "Call from Det. Caruso",
    lines: [
      "Caruso. The shell company, the sheet that changed at twenty to midnight, the money the next morning. The judge read it the way you did.",
      "I've got a warrant for Marchetti Law Group. We're going in this afternoon. Her own desk, her own files.",
      "Meet us there if you want to see what's in the drawers before her lawyers do.",
    ],
    effects: [
      {
        note: {
          id: "call:caruso_warrant",
          kind: "call",
          title: "Det. Caruso: a warrant for Marchetti Law Group",
          text: "Det. Caruso has a search warrant for Marchetti Law Group, 600 Lexington Avenue, and invites you to be there when it is executed.",
          characterId: "caruso",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "It's Bennett. You've got a pocketful of paper and an empty board. I can hear it from here.",
      "Pin what you've got on the murder board. When two things belong together, run string between them. The board will tell you when you're onto something.",
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
  { id: "t_claudia_briefcase", from: "claudia", body: "Please find me before they take me home. It's about N's briefcase. Claudia Ogden" },
  { id: "t_porter_assignment", from: "porter", body: "Our camera and our sheet don't agree. I'm going through the emails. J. Porter" },
  {
    id: "t_marchetti_letter",
    from: "marchetti",
    body: "By email, on Marchetti Law Group letterhead: \"The governance files of Fifth Avenue Endowment GP LLC, Halvard Holdings LLC and Cardinal Point Trust are privileged and confidential and are held at my direction. The Foundation's officers have been instructed not to discuss them. Please direct any request to me. E. Marchetti\"",
  },
  { id: "t_bellamy_sorry", from: "bellamy", body: "I'm sorry. I've been told not to release anything on Halvard, or talk about it. I don't like it. L. Bellamy" },
  { id: "t_caruso_glass", from: "caruso", body: "Lab's back on the glass. Copy on your desk. A.C." },
  { id: "t_caruso_bookend", from: "caruso", body: "Lab's back on the bookend and the briefcase. Copy on your desk. Read the conclusion. A.C." },
];

/* Two lab tests, both sent by Det. Caruso. Real time from the moment he does. */
export const labs: LabDef[] = [
  {
    id: "glass",
    label: "Toxicology and prints: the whiskey glass",
    seconds: 180,
    rect: LAB_GLASS_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_glass" },
      { text: "t_caruso_glass" },
      { message: "The lab's report on the whiskey glass is back. It's on your phone and your desk." },
    ],
  },
  {
    id: "bookend",
    label: "Blood, DNA and prints: the bookend and the briefcase",
    seconds: 180,
    rect: LAB_BOOKEND_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_bookend" },
      { text: "t_caruso_bookend" },
      { message: "The lab's report on the bookend and the briefcase is back. It's on your phone and your desk." },
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lockhart_register",
    title: "Envelope from the Lockhart Foundation",
    exterior: "A heavy cream envelope, hand-delivered, addressed in a neat typed label to the investigator, Blackwood Investigations. The return address is engraved: The Lockhart Foundation, 1140 Fifth Avenue, New York.",
    text: "The foundation's investment register, prepared by the Office of the CFO, with a card in Dr. Lockhart's hand clipped to the first page.",
    evidence: ["E033"],
  },
  {
    id: "knox_vehicle",
    title: "Vehicle records from Det. Caruso",
    exterior: "A plain NYPD interoffice envelope, Manhattan South Homicide, addressed to you by hand: \"Copy. A.C.\"",
    text: "Det. Caruso's note: \"Plate reads, E-ZPass and a storage gate. Thursday night. A.C.\"",
    evidence: ["E024"],
  },
  {
    id: "briefcase",
    title: "Property invoice and copies, unit 3C-27",
    exterior: "A thick NYPD envelope from the Property Clerk, sent on by Det. Caruso, with a voucher number on the flap.",
    text: "Det. Caruso's note: \"The warrant return, and copies of what was in his blue folder. The originals are vouchered. A.C.\"",
    evidence: ["E031", "E040", "E048"],
  },
  {
    id: "lab_glass",
    title: "Lab report: the whiskey glass",
    exterior: "An OCME laboratory folder, sent on by Det. Caruso, and the same report in your email.",
    text: "Det. Caruso's note: \"Clean drink. His prints, nobody else's. Doesn't mean he was alone. A.C.\"",
    evidence: ["E005"],
  },
  {
    id: "lab_bookend",
    title: "Lab report: the bookend and the briefcase",
    exterior: "An NYPD Police Laboratory folder, sent on by Det. Caruso, and the same report in your email.",
    text: "Det. Caruso's note: \"We have the weapon. We don't have a hand on it. A.C.\"",
    evidence: ["E032"],
  },
];

const held = (...ids: string[]): Condition => ({ all: ids.map((id) => ({ hasEvidence: id })) });

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C05",
    title: "The gala is interrupted",
    characterId: "lockhart",
    requires: { always: true },
    complete: { chapterDone: 1 },
    notebook: {
      learned: [
        { text: "The auction was stopped at 10:20 PM and the guests were held in the ballroom to give statements. Some had already gone." },
        { text: "The people who stayed are in the ballroom and the lobby for now: Dr. Lockhart, Claudia Ogden and Victoria Lane in the ballroom; Elena Marchetti, Lionel Bellamy and the event security lead in the lobby." },
        {
          text: "The night is over. Dr. Lockhart and Lionel Bellamy are at the foundation, Claudia Ogden is at home, Ms. Marchetti is at her office, the security firm at its own, and Victoria Lane is working from the hotel's event office. The ballroom is being cleared.",
          requires: { chapterDone: 1 },
        },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C05",
    title: "The missing briefcase",
    characterId: "claudia",
    requires: { visited: "suite" },
    onActivate: [{ text: "t_claudia_briefcase" }, { message: "A text from Claudia Ogden." }],
    complete: { hasEvidence: "E010" },
    evidence: ["E010"],
    notebook: {
      learned: [
        { text: "Claudia Ogden wants to talk about her husband's briefcase before she is taken home." },
        { text: "She has given Det. Caruso a statement about the briefcase and what was in it.", requires: { hasEvidence: "E010" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C05",
    title: "Knox's assignment changes",
    characterId: "porter",
    requires: held("E021", "E008"),
    onActivate: [{ text: "t_porter_assignment" }, { setFlag: "assignment_changed" }, { message: "A text from James Porter." }],
    complete: { hasEvidence: "E030" },
    evidence: ["E030"],
    notebook: {
      learned: [
        { text: "James Porter has noticed that the hotel's corridor camera and the security post sheet on file do not agree, and is going through the hotel's email." },
        { text: "He has written up what he found for the general manager and Det. Caruso.", requires: { hasEvidence: "E030" } },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C05",
    title: "Dr. Lockhart offers cooperation",
    characterId: "lockhart",
    requires: { any: [{ hasEvidence: "E011" }, { hasEvidence: "E019" }, { hasEvidence: "E015" }] },
    onActivate: [
      { incomingCall: "call_lockhart_records" },
      { delivery: "lockhart_register" },
      { setFlag: "archive_open" },
      { message: "Your phone is ringing: Dr. Evelyn Lockhart." },
    ],
    complete: { all: [{ hasEvidence: "E033" }, { callAnswered: "call_lockhart_records" }] },
    evidence: ["E033"],
    notebook: {
      call: "call_lockhart_records",
      delivery: "lockhart_register",
      learned: [
        { text: "Dr. Lockhart heard that Blackwood is looking at the foundation's investments, and offered to help." },
        { text: "The foundation's records archive, on the lower level at 1140 Fifth Avenue, is open to you." },
        { text: "She sent the foundation's investment register, with a card in her own hand.", requires: { hasEvidence: "E033" } },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C05",
    title: "Simon decides to talk",
    characterId: "wexler",
    requires: { deduction: "D10" },
    onActivate: [{ incomingCall: "call_wexler" }, { setFlag: "backup_known" }, { message: "Your phone is ringing: Simon Wexler." }],
    complete: { hasEvidence: "E038" },
    evidence: ["E038", "E043", "E047"],
    notebook: {
      call: "call_wexler",
      learned: [
        { text: "Simon Wexler, Nathaniel's junior analyst, has decided to tell what he knows. He can be met at Ogden Fiduciary Partners or telephoned." },
        { text: "Nathaniel kept copies of everything, and Simon knows the passphrase." },
        { text: "Simon wrote up what Nathaniel was working on.", requires: { hasEvidence: "E038" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "S001C05",
    title: "Marchetti restricts access",
    characterId: "marchetti",
    requires: { deduction: "D11" },
    onActivate: [
      { text: "t_marchetti_letter" },
      { text: "t_bellamy_sorry" },
      { incomingCall: "call_bennett_lawyer" },
      { setFlag: "halvard_restricted" },
      { message: "A letter from Elena Marchetti, by email." },
    ],
    complete: { any: [{ flag: "lp_demand" }, { flag: "subpoena_halvard" }] },
    evidence: ["E018", "E035", "E039"],
    notebook: {
      call: "call_bennett_lawyer",
      learned: [
        { text: "Elena Marchetti has written that the governance files of the general partner, Halvard and Cardinal Point Trust are privileged and held at her direction, and that the foundation's officers may not discuss them." },
        { text: "Lionel Bellamy has been told not to release anything on Halvard." },
        { text: "Bennett suggests a trusts lawyer, Lawrence Abernathy.", requires: { callAnswered: "call_bennett_lawyer" } },
        { text: "A limited partner may inspect the partnership's own books and records on a written demand, and counsel's privilege does not cover them.", requires: { flag: "lp_route" } },
        { text: "Halvard's office at Larchmont Corporate Services, 410 Madison Avenue, is open to you.", requires: { any: [{ flag: "lp_demand" }, { flag: "subpoena_halvard" }] } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "S001C05",
    title: "Knox tries to leave",
    characterId: "knox",
    requires: { deduction: "D05" },
    onActivate: [{ incomingCall: "call_caruso_jfk" }, { setFlag: "knox_held" }, { message: "Your phone is ringing: Det. Caruso." }],
    complete: { callAnswered: "call_caruso_jfk" },
    onComplete: [{ delivery: "knox_vehicle" }, { message: "Det. Caruso's vehicle records are on your phone and your desk." }],
    evidence: ["E024", "E026"],
    notebook: {
      call: "call_caruso_jfk",
      delivery: "knox_vehicle",
      learned: [
        { text: "Gabriel Knox booked a one-way flight from JFK to Panama City for the morning. Port Authority police held him at the gate at Det. Caruso's request." },
        { text: "Knox is at Manhattan South Homicide. His phone has gone to the NYPD lab." },
        { text: "Det. Caruso sent the vehicle and toll records for Knox's Tahoe on Thursday night.", requires: { hasEvidence: "E024" } },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "S001C05",
    title: "The briefcase is recovered",
    characterId: "caruso",
    requires: { all: [{ deduction: "D06" }, { hasEvidence: "E024" }, { eventState: "RE07", is: "completed" }] },
    onActivate: [
      { incomingCall: "call_caruso_briefcase" },
      { delivery: "briefcase" },
      { setFlag: "briefcase_recovered" },
      { message: "Your phone is ringing: Det. Caruso." },
    ],
    complete: { hasEvidence: "E031" },
    evidence: ["E031", "E040", "E048"],
    notebook: {
      call: "call_caruso_briefcase",
      delivery: "briefcase",
      learned: [
        { text: "Under a warrant, Det. Caruso searched Bridgeview Self Storage unit 3C-27 in Long Island City, rented by Knox Protective Services since 2016." },
        { text: "Nathaniel's briefcase was there, with something wrapped in a hotel napkin inside.", requires: { hasEvidence: "E031" } },
        { text: "Copies of the papers in Nathaniel's blue folder came with the property invoice.", requires: { all: [{ hasEvidence: "E040" }, { hasEvidence: "E048" }] } },
      ],
    },
  },
  {
    id: "RE09",
    caseId: "S001C05",
    title: "Claire recognizes the pattern",
    characterId: "donovan",
    requires: { hasEvidence: "E043" },
    onActivate: [{ incomingCall: "call_donovan" }, { message: "Your phone is ringing: a number in Alexandria, Virginia." }],
    complete: { hasEvidence: "E044" },
    evidence: ["E044"],
    notebook: {
      call: "call_donovan",
      learned: [
        { text: "Claire Donovan, the former Meridian records analyst, heard from Bennett what Nathaniel found, and wants to compare her own copy register with his dates." },
        { text: "She sent her notes.", requires: { hasEvidence: "E044" } },
      ],
    },
  },
  {
    id: "RE10",
    caseId: "S001C05",
    title: "The benefactor",
    characterId: "lockhart",
    requires: { deduction: "D18" },
    onActivate: [
      {
        note: {
          id: "event:RE10",
          kind: "event",
          title: "The benefactor",
          text: "Dr. Evelyn Lockhart is a credible candidate for the Architect. A working theory. Nothing in hand shows her ordering anything.",
          characterId: "lockhart",
          important: true,
        },
      },
    ],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Dr. Evelyn Lockhart is a credible candidate for the Architect. A working theory. Nothing in hand shows her ordering anything." },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Chapters and objectives
// ---------------------------------------------------------------------------

const ch = (n: number): Condition => ({ chapter: n });

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Gala
  { id: "o1_file", text: "Read the case file on your phone.", visible: { always: true }, done: briefed },
  { id: "o1_scene", text: "Examine Conference Suite C.", visible: { always: true }, done: { visited: "suite" } },
  { id: "o1_people", text: "Talk to Dr. Lockhart and Claudia Ogden, and to Det. Caruso by phone.", visible: { always: true }, done: { all: [{ talkedTo: "lockhart" }, { talkedTo: "claudia" }, { talkedTo: "caruso" }] } },
  { id: "o1_cause", text: "Establish how Nathaniel died.", visible: { always: true }, done: { deduction: "D01" } },
  { id: "o1_robbery", text: "Decide whether this was a robbery.", visible: { always: true }, done: { deduction: "D02" } },
  { id: "o1_meeting", text: "Find out why he went upstairs.", visible: { always: true }, done: { deduction: "D03" } },
  { id: "o1_opt_glass", text: "Optional: have the whiskey glass examined.", visible: { always: true }, done: { hasEvidence: "E005" } },

  // Chapter 2: The Private Meeting
  { id: "o2_access", text: "Find out who could reach the suite.", visible: ch(2), done: { deduction: "D04" } },
  { id: "o2_alibi", text: "Test the security lead's account.", visible: ch(2), done: { deduction: "D05" } },
  { id: "o2_briefcase", text: "Find out where the briefcase went.", visible: ch(2), done: { deduction: "D06" } },
  { id: "o2_knox", text: "Question Gabriel Knox.", visible: ch(2), done: { talkedTo: "knox" } },
  { id: "o2_back", text: "Walk the back-of-house route.", visible: ch(2), done: { visited: "service_corridor" } },

  // Chapter 3: The Hidden Accounts
  { id: "o3_research", text: "Find out what Nathaniel was investigating.", visible: ch(3), done: { deduction: "D10" } },
  { id: "o3_layers", text: "Work out the ownership.", visible: ch(3), done: { deduction: "D11" } },
  { id: "o3_meridian", text: "Find where Meridian fits.", visible: ch(3), done: { deduction: "D12" } },
  { id: "o3_foundation", text: "Find what the foundation holds.", visible: ch(3), done: { deduction: "D13" } },
  { id: "o3_shared", text: "Put the ownership together.", visible: ch(3), done: { deduction: "D16" } },
  { id: "o3_opt_simon", text: "Optional: hear what Simon Wexler knows.", visible: ch(3), done: { hasEvidence: "E038" } },

  // Chapter 4: The Benefactor
  { id: "o4_arranged", text: "Find out who arranged the meeting.", visible: ch(4), done: { deduction: "D08" } },
  { id: "o4_after", text: "Find out what was done after.", visible: ch(4), done: { deduction: "D09" } },
  { id: "o4_control", text: "Find out who directs the structure.", visible: ch(4), done: { deduction: "D14" } },
  { id: "o4_claire", text: "Compare the research with Claire Donovan's records.", visible: ch(4), done: { hasEvidence: "E044" } },
  { id: "o4_candidate", text: "Weigh what the records say about the Architect.", visible: ch(4), done: { deduction: "D18" } },
  { id: "o4_opt_records", text: "Optional: read the lawyer's own files.", visible: ch(4), done: { any: [{ hasEvidence: "E045" }, { hasEvidence: "E046" }] } },

  // Chapter 5: The Unproven Truth
  { id: "o5_weapon", text: "Establish the weapon.", visible: ch(5), done: { deduction: "D07" } },
  { id: "o5_target", text: "Show why he was targeted.", visible: ch(5), done: { deduction: "D15" } },
  { id: "o5_history", text: "Show how long the structure has existed.", visible: ch(5), done: { deduction: "D17" } },
  { id: "o5_whole", text: "Put the murder and the cover-up together.", visible: ch(5), done: { deduction: "D19" } },
  { id: "o5_report", text: "File the final report from the office.", visible: ch(5), done: { flag: "case_closed" } },
];

export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Gala",
    intro: "Thursday, December 20. Four hundred guests, a string quartet, and at 10:12 PM a man dead on the carpet of a conference room upstairs. The host wants to know how, and she has asked you.",
    objectives: ["o1_file", "o1_scene", "o1_people", "o1_cause", "o1_robbery", "o1_meeting"],
    optional: ["o1_opt_glass"],
    conclusion: "Nathaniel Ogden was not robbed by chance and did not fall. He went upstairs to meet someone. Who was waiting?",
    summary: "Nathaniel Ogden died of a single blow in Conference Suite C. The robbery was dressed up, and he went upstairs to a private meeting arranged in Dr. Lockhart's name.",
    onComplete: [{ setEnv: "ballroom", to: "B" }],
  },
  {
    number: 2,
    title: "The Private Meeting",
    intro: "Friday, December 21. The hotel's cameras, its doors and its staff remember more than its guests do.",
    objectives: ["o2_access", "o2_alibi", "o2_briefcase", "o2_knox", "o2_back"],
    conclusion: "The security lead was not where he said he was, and someone left the mezzanine with Nathaniel's briefcase. But a contractor does not choose his own targets.",
    summary: "The hotel's doors, cameras and staff put the evening's security lead on the mezzanine, not at the stage, and a briefcase like Nathaniel's went out by the staff door.",
  },
  {
    number: 3,
    title: "The Hidden Accounts",
    intro: "Nathaniel was not a gambler or a thief. He was an investment adviser, and he had found something in the foundation's books.",
    objectives: ["o3_research", "o3_layers", "o3_meridian", "o3_foundation", "o3_shared"],
    optional: ["o3_opt_simon"],
    conclusion: "The foundation's money and Meridian's votes are the same chain. Who holds the top of it?",
    summary: "Nathaniel traced the foundation's largest private holding through a partnership and a holding company to Meridian Advisory Group's votes.",
  },
  {
    number: 4,
    title: "The Benefactor",
    intro: "The structure has a lawyer at every level. One of them arranged a meeting.",
    objectives: ["o4_arranged", "o4_after", "o4_control", "o4_claire", "o4_candidate"],
    optional: ["o4_opt_records"],
    conclusion: "There is a name at the top of the structure. There is no record of an order with that name on it.",
    summary: "The meeting was arranged, and what followed it was covered up. The structure has one person at the top of it, and the records stop short of what she ordered.",
  },
  {
    number: 5,
    title: "The Unproven Truth",
    intro: "Saturday, December 22. The briefcase is in police custody, two people are about to be charged, and one question will not be answered this week.",
    objectives: ["o5_weapon", "o5_target", "o5_history", "o5_whole", "o5_report"],
    conclusion: "Case closed.",
    summary: "The murder is solved and the cover-up is laid out. The question above it stays open.",
  },
];

/* The report can be opened once the file is read and the last chapter has opened. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [briefed, { chapter: 5 }],
};
