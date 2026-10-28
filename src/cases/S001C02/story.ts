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
import { LAB_CARRIER_RECT, LAB_DRIVE_RECT, LAB_HURST_PHONE_RECT } from "./desk";

/*
 * S01 C02 story content. Times follow docs/S001C02-timeline.md exactly.
 *
 * Eight engine events (RE01 to RE08), four chapters, three lab tests. E033
 * (the Capital Courier envelope) is sent by D10's effects, not by an event.
 * Nothing here comments on the courier's account number or the copier footer,
 * and nothing says who "A" is or how the card reached Rourke.
 */

export const briefed: Condition = { flag: "casefile_read" };

/** Shared gates from the build contract (characters.ts keeps its own copies). */
export const lyonsKnown: Condition = { any: [{ hasEvidence: "E027" }, { hasEvidence: "E028" }, { hasEvidence: "E034" }] };
export const hurstKnown: Condition = { any: [{ hasEvidence: "E009" }, { hasEvidence: "E015" }, { hasEvidence: "E016" }] };
export const chenKnown: Condition = { any: [{ hasEvidence: "E021" }, { hasEvidence: "E020" }, { hasEvidence: "E003" }] };
export const rourkeKnown: Condition = { any: [{ hasEvidence: "E026" }, { hasEvidence: "E025" }, { event: "RE04" }] };
/** The Montgomery County Police warrant on Kestrel's office: the outgoing call and Collins's fact share this gate. */
export const kestrelWarrant: Condition = { all: [{ deduction: "D11" }, { chapter: 3 }] };

export const intro: CaseDefinition["intro"] = [
  { heading: "Monday, November 19, 2018", text: "Blackwood Investigations, Pittsburgh field office. 12:10 PM. Three days before Thanksgiving, sleet against the tall window." },
  {
    text: "The woman in your doorway is still in her clinic fleece, car keys in her hand. Natalie Ellery, thirty-seven, a physical therapist. Bennett called ahead: \"She fixed my knee. Listen to her.\"",
  },
  {
    text: "Her brother Jonathan didn't turn up for a 9:30 appointment in Washington this morning. Hotel security found his room empty, his phone on the bedside table. \"The police say grown men walk away. Jon doesn't walk away. He had his suit hanging up for Monday.\"",
  },
  {
    text: "She writes his phone code on the back of a business card and slides it across the desk: 0411, their mother's birthday. You drive down to Washington together. By 5:15 PM the file Bennett pulled from MPD is on your desk.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "3:44 PM (Sun 11/18)", text: "Jonathan Ellery checks into Room 614 of the Ashcroft Hotel, 1214 Fifteenth Street NW, Washington, D.C.", source: "Case file" },
  { time: "6:12 PM (Sun 11/18)", text: "Jonathan's last text to his sister, Natalie.", source: "Case file" },
  { time: "9:30 AM (Mon 11/19)", text: "Jonathan fails to appear for an appointment with a federal task force.", source: "Case file" },
  { time: "10:21 AM (Mon 11/19)", text: "Hotel security opens Room 614: empty, his phone on the bedside table.", source: "Case file" },
  { time: "11:20 AM (Mon 11/19)", text: "Natalie reports him missing to the Metropolitan Police by phone.", source: "Case file" },
  { time: "12:10 PM (Mon 11/19)", text: "Natalie Ellery hires Blackwood Investigations.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Jonathan Ellery, Washington, D.C.",
    dossier: [
      { label: "Case ID", value: "S01 C02" },
      { label: "Case title", value: "Room 614" },
      { label: "Classification", value: "Missing person" },
      { label: "Location", value: "Washington, D.C." },
      { label: "Year", value: "2018" },
      { label: "Missing", value: "Jonathan Ellery, 41" },
      { label: "Client", value: "Natalie Ellery, his sister" },
      { label: "Police", value: "Det. Nadia Collins, MPD Missing Persons Unit, CCN 18197742" },
      { label: "Contact", value: "Bennett, Blackwood records, by phone" },
    ],
    people: ["jonathan", "natalie", "collins", "wallace", "monroe", "grant"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (from the MPD report)",
        spoken:
          "Metropolitan Police Department, Missing Persons Unit, report number one eight one nine seven seven four two. Jonathan Ellery, forty-one, checked into Room six fourteen of the Ashcroft Hotel in Washington at three forty-four on Sunday afternoon, November eighteenth. His last contact was a text to his sister at twelve minutes past six that evening. On Monday morning he did not appear for a nine thirty appointment, and a caller from a federal task force contacted the hotel at two minutes to ten. Hotel security opened the room at ten twenty-one. It was empty. His phone, his wallet, his car keys and his coat were still in it, and his car was still in the hotel garage. No sign of forced entry. The police have classified it as a missing adult, non-critical, and say a voluntary absence is possible. Detective Nadia Collins was assigned at two thirty this afternoon.",
        body: "METROPOLITAN POLICE DEPARTMENT, Missing Persons Unit. CCN 18197742. Jonathan Ellery, 41, checked into Room 614 of the Ashcroft Hotel, Washington, D.C., at 3:44 PM on Sunday, November 18, 2018. Last contact: a text to his sister at 6:12 PM that evening. On Monday he failed to appear for a 9:30 AM appointment; a caller from a federal task force contacted the hotel at 9:58 AM. Hotel security entered the room at 10:21 AM: unoccupied. Phone, wallet, car keys and coat left in the room; his car still in the hotel's valet garage. No sign of forced entry. Classification: missing adult, non-critical. Voluntary absence possible. Assigned: Det. Nadia Collins, 2:30 PM.",
      },
      {
        heading: "The missing man",
        spoken:
          "The missing man. Jonathan Ellery, forty-one, of Clarendon, Arlington, Virginia. A senior procurement analyst at Eastbridge Systems, a defense contractor in Reston, Virginia. His sister Natalie lives in Pittsburgh, near their mother's memory-care home in Cranberry Township, and is our client. She says he would never walk away, and that he had seemed frightened for about three weeks. She has given us his phone code: oh four one one.",
        body: "Jonathan Ellery, 41, Clarendon, Arlington, Virginia. Senior procurement analyst, Eastbridge Systems, 11900 Sunrise Valley Drive, Reston, Virginia, a defense contractor. Sister: Natalie Ellery, 37, physical therapist, Pittsburgh, near their mother's memory-care home in Cranberry Township; client. She says he would never walk away, and that he had seemed frightened for about three weeks. His phone passcode, from Natalie: 0411.",
      },
      {
        heading: "The Ashcroft",
        spoken:
          "The Ashcroft Hotel, twelve fourteen Fifteenth Street Northwest, near Thomas Circle. Twelve floors, two hundred and eighty-eight rooms, almost fully booked for Thanksgiving week. Guests come and go by the Fifteenth Street lobby doors or the valet garage ramp. Room six fourteen is at the far north end of the sixth-floor corridor, a long way from the elevators. The hotel has cameras on the lobby, both entrances, the garage ramp, the guest elevators and every floor's elevator landing.",
        body: "The Ashcroft Hotel, 1214 Fifteenth Street NW, near Thomas Circle. 12 floors, 288 rooms, 94% booked for Thanksgiving week. Guest entrances: the Fifteenth Street lobby doors and the valet garage ramp. Room 614: the far north end of the sixth-floor corridor, about 140 feet from the elevator landing. Guest-facing cameras: the lobby, both entrances, the garage ramp, the guest elevators and each floor's elevator landing.",
      },
      {
        heading: "People",
        spoken:
          "People. Natalie Ellery, Jonathan's sister, and our client. Detective Nadia Collins, of the Metropolitan Police Missing Persons Unit. Douglas Wallace, the hotel's director of security, twenty-two years with the Metropolitan Police before that. Tessa Monroe, the front desk supervisor who checked Jonathan in. And Celia Grant, the hotel's general manager.",
        body: "Natalie Ellery, Jonathan's sister, client. Det. Nadia Collins, MPD Missing Persons Unit. Douglas Wallace, Director of Security, the Ashcroft; 22 years MPD before that. Tessa Monroe, front desk supervisor (3 to 11 PM); checked Jonathan in. Celia Grant, General Manager, the Ashcroft.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. Collins is good. She thinks he ran; she also wrote down that he left his shoes. Ask her for what she has. My number's in your phone. B.",
        body: "Collins is good. She thinks he ran; she also wrote down that he left his shoes. Ask her for what she has. My number's in your phone. B.",
      },
    ],
  },
];

/* No recorded police interviews in this case: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_natalie_garage",
    from: "natalie",
    title: "Call from Natalie Ellery",
    lines: [
      "It's Natalie. I can't stop going over it. There are two things I didn't tell you, because I didn't think they meant anything.",
      "On Saturday Jon called and asked me not to talk to anyone who called me from his work. Anyone. I laughed at him. I thought he meant his boss.",
      "And at the start of November he told me a man from the consulting people had been waiting by his car in the garage at his office. That's all he'd say. \"The consulting people.\" He sounded like he hadn't slept.",
    ],
    effects: [{ setFlag: "natalie_garage" }],
  },
  {
    id: "call_wallace_bypass",
    from: "wallace",
    title: "Call from Douglas Wallace",
    lines: [
      "Wallace. I went back over the service side tonight, the way I should have this morning.",
      "Somebody put the alarm on S6-2 into bypass on Sunday night. Forty-five minutes. Under one of my engineers' codes, against a work order that isn't due until Tuesday. Nobody asked me.",
      "I've written it up. It's on its way to you. I was wrong about him walking out.",
    ],
    effects: [
      {
        note: {
          id: "call:wallace_bypass",
          kind: "call",
          title: "Wallace: the service door alarm was bypassed",
          text: "Douglas Wallace found that the alarm on service door S6-2, near Room 614, was put into bypass for 45 minutes on Sunday night under an engineer's code, with no approval. His updated report is on its way.",
          characterId: "wallace",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_rourke",
    from: "rourke",
    title: "Call from Julian Rourke, Meridian Advisory Group",
    lines: [
      "Good afternoon. Julian Rourke, Meridian Advisory Group, here in Washington. I understand Blackwood has been asking about Jonathan Ellery.",
      "Jonathan has done some advisory work for us. I'd much rather you heard about it from me than pieced it together from someone else, and I'm genuinely concerned for him.",
      "Come by K Street. Sixteen twenty, the eighth floor. Ask for me at reception.",
    ],
    effects: [
      {
        note: {
          id: "call:rourke_intro",
          kind: "call",
          title: "Julian Rourke: come to K Street",
          text: "Julian Rourke, Director of Corporate Intelligence at Meridian Advisory Group, called. He says Jonathan has done advisory work for Meridian and has invited you to his office at 1620 K Street NW.",
          characterId: "rourke",
        },
      },
    ],
  },
  {
    id: "call_chen_release",
    from: "chen",
    title: "Call from Irene Chen",
    lines: [
      "This is Irene Chen. I've been thinking about Rule 1.6 since this morning, and I've stopped thinking about it.",
      "A lawyer may reveal what she must to prevent a crime likely to result in death or substantial bodily harm. I believe that is where Jonathan is.",
      "He left something with me on Sunday. I'll release it, at my office, in front of you, with Det. Collins on the line. Come now.",
    ],
    effects: [{ setFlag: "chen_release" }],
  },
  {
    id: "call_collins_move",
    from: "collins",
    title: "Call from Det. Collins",
    lines: [
      "Collins. Sorry about the hour.",
      "The Maryland State Police have had eyes on Sawmill Hollow Road since four. Twenty minutes ago the gray van backed up to the farmhouse porch. Someone's carrying things out of the house.",
      "We're going now, with the FBI. Meet us at the end of the lane.",
    ],
    effects: [
      {
        note: {
          id: "call:collins_move",
          kind: "call",
          title: "Collins: the van is at the farmhouse",
          text: "Before dawn on Wednesday, the Maryland State Police watching 4 Sawmill Hollow Road saw the gray van back up to the porch and someone carry things out. Det. Collins and the FBI are going in, and want you at the end of the lane.",
          characterId: "collins",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_quinlan_safe",
    from: "quinlan",
    title: "Call from Special Agent Quinlan",
    lines: [
      "Quinlan. We executed a federal warrant on Julian Rourke's office at two thirty this afternoon. He's in custody.",
      "There was a safe in his office. Passport, nine thousand in cash, a pistol in a locked case, and a typed card in a plain envelope, dated Monday. I'm sending you a copy.",
      "It's signed with a single letter. A letter is not a name. I'd like you to keep that in mind, and I'd like to keep your number.",
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "It's Bennett. You've got a desk full of paper and an empty board. I know what that looks like, I used to have one.",
      "Pin what you've got on the case board. When two things belong together, run string between them. The board will tell you when you're onto something.",
      "Costs you nothing to be wrong.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Bennett: use the board",
          text: "Pin the evidence on the case board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [
  {
    id: "out_collins_kestrel",
    to: "collins",
    label: "Ask Det. Collins for a warrant on Kestrel's office",
    available: kestrelWarrant,
    done: { flag: "kestrel_search" },
    lines: [
      "Collins. The van, the hotel man's texts, the phone that kept calling Meridian. That's enough for a judge in Montgomery County.",
      "I'll get Montgomery County Police to take a warrant for Kestrel's office tonight. They'll go in about nine, and you can walk it with them after.",
    ],
    effects: [
      { setFlag: "kestrel_search" },
      { setEnv: "kestrel", to: "searched" },
      { message: "Montgomery County Police have searched Kestrel Protective Group's office in Rockville. You can walk it now." },
    ],
  },
];

export const texts: TextDef[] = [
  { id: "t_natalie_call", from: "natalie", body: "Call me when you can. I remembered something Jon said. N." },
  { id: "t_bennett_courier", from: "bennett", body: "A courier envelope came here for you this morning. No sender. It's on your desk, and I've scanned it to your phone. B." },
  { id: "t_collins_carrier", from: "collins", body: "The carrier came back on Jonathan's phone. Copy on your phone and your desk. Worth lining up against his own phone records. N.C." },
  { id: "t_collins_phone", from: "collins", body: "Digital Evidence pulled the deleted texts off Hurst's phone. Copy on your phone and your desk. Read them in order. N.C." },
  { id: "t_quinlan_drive", from: "quinlan", body: "The drive opened on his code. Summary on your phone and your desk. T.Q." },
  { id: "t_collins_move", from: "collins", body: "Van at the farmhouse. We're going in. End of the lane, Sawmill Hollow Road. Now. N.C." },
];

/* Three lab tests, real time from the moment each is sent off. */
export const labs: LabDef[] = [
  {
    id: "carrier_records",
    label: "Exigent carrier records: Jonathan's phone",
    seconds: 180,
    rect: LAB_CARRIER_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_carrier" },
      { text: "t_collins_carrier" },
      { message: "The carrier's exigent records for Jonathan's phone are back. They're on your phone and your desk." },
    ],
  },
  {
    id: "hurst_phone",
    label: "Digital extraction: Kevin Hurst's phone",
    seconds: 180,
    rect: LAB_HURST_PHONE_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_hurst_phone" },
      { text: "t_collins_phone" },
      { message: "MPD's Digital Evidence Unit has finished with Kevin Hurst's phone. The report is on your phone and your desk." },
    ],
  },
  {
    id: "drive_image",
    label: "Forensic image: the encrypted drive",
    seconds: 180,
    rect: LAB_DRIVE_RECT,
    image: "obj.fbi_folder",
    onReady: [
      { delivery: "lab_drive" },
      { text: "t_quinlan_drive" },
      { message: "The FBI has imaged Jonathan's drive. The summary is on your phone and your desk." },
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "wallace_update",
    title: "Updated security report from the Ashcroft",
    exterior: "A manila envelope from the Ashcroft Hotel's security office, hand-addressed to you in block capitals: \"Updated report. D.W.\"",
    text: "Douglas Wallace's cover note: \"Panel history attached. I should have pulled it this morning. D.W.\"",
    evidence: ["E009"],
  },
  {
    id: "courier_client_list",
    title: "Capital Courier envelope",
    exterior:
      "A Capital Courier Service envelope. The waybill on it: \"Acct 20417. Picked up 11/19/2018 6:40 PM, Washington, DC. Delivered 11/20/2018 10:42 AM. To: Blackwood Investigations, Pittsburgh field office, attn: Investigator, re: J. Ellery. From: (blank).\" Bennett has signed for it.",
    text: "No letter inside. Four photocopied pages.",
    evidence: ["E033"],
  },
  {
    id: "lab_carrier",
    title: "Exigent carrier records",
    exterior: "A Metropolitan Police folder, sent on by Det. Collins, and the same pages in your email.",
    text: "Det. Collins's note: \"Exigent request, missing person, possible abduction. The carrier was quick for once. N.C.\"",
    evidence: ["E026"],
  },
  {
    id: "lab_hurst_phone",
    title: "Extraction report: Kevin Hurst's phone",
    exterior: "An MPD Digital Evidence Unit folder, sent on by Det. Collins, and the same report in your email.",
    text: "Det. Collins's note: \"He deleted them on Monday afternoon. Deleted isn't gone. N.C.\"",
    evidence: ["E030"],
  },
  {
    id: "lab_drive",
    title: "FBI summary: the encrypted drive",
    exterior: "An FBI Washington Field Office folder marked for MPD and counsel, and the same summary in your email.",
    text: "Agent Quinlan's note: \"Imaged write-blocked, opened on the owner's code, first try. T.Q.\"",
    evidence: ["E023"],
  },
  {
    id: "fbi_safe",
    title: "FBI evidence copy: Rourke's safe",
    exterior: "An FBI evidence envelope, a photocopy inside, sent on by Special Agent Quinlan. Evidence tag WFO-1B-0057.",
    text: "Agent Quinlan's note: \"Copy of the card from the safe. The original stays with us. T.Q.\"",
    evidence: ["E036"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C02",
    title: "Natalie remembers",
    characterId: "natalie",
    requires: { hasEvidence: "E003" },
    onActivate: [{ incomingCall: "call_natalie_garage" }, { text: "t_natalie_call" }, { message: "Your phone is ringing: Natalie Ellery." }],
    complete: { callAnswered: "call_natalie_garage" },
    notebook: {
      call: "call_natalie_garage",
      learned: [
        { text: "On Saturday, November 17, Jonathan asked Natalie not to talk to anyone who called her from his work.", requires: { flag: "natalie_garage" } },
        { text: "In early November he told her \"a man from the consulting people\" had been waiting by his car in his office garage.", requires: { flag: "natalie_garage" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C02",
    title: "Wallace finds the bypass",
    characterId: "wallace",
    requires: { hasEvidence: "E008" },
    onActivate: [{ incomingCall: "call_wallace_bypass" }, { message: "Your phone is ringing: Douglas Wallace." }],
    complete: { callAnswered: "call_wallace_bypass" },
    onComplete: [{ delivery: "wallace_update" }],
    evidence: ["E009"],
    notebook: {
      call: "call_wallace_bypass",
      delivery: "wallace_update",
      learned: [
        { text: "Douglas Wallace went back over the hotel's service side and found the alarm on service door S6-2 had been bypassed on Sunday night under an engineer's code.", requires: { callAnswered: "call_wallace_bypass" } },
        { text: "His updated report gives the panel history for S6-2.", requires: { hasEvidence: "E009" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C02",
    title: "Hurst changes his story",
    characterId: "hurst",
    requires: { deduction: "D05" },
    onActivate: [{ setFlag: "hurst_admits" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "With the alarm bypass established, Kevin Hurst admits he set it on S6-2 \"for a contractor guy\" who told him the job was approved for overnight." },
        { text: "He denies seeing anyone or moving anyone." },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C02",
    title: "Rourke calls",
    characterId: "rourke",
    requires: { all: [{ chapter: 3 }, { any: [{ hasEvidence: "E018" }, { hasEvidence: "E026" }, { asked: "bennett_meridian" }] }] },
    onActivate: [{ incomingCall: "call_rourke" }, { unlockLocation: "meridian_hq" }, { message: "Your phone is ringing: a Washington number." }],
    complete: { callAnswered: "call_rourke" },
    evidence: ["E025"],
    notebook: {
      call: "call_rourke",
      learned: [
        { text: "Julian Rourke of Meridian Advisory Group called: Jonathan did advisory work for Meridian, and Rourke would rather Blackwood heard it from him.", requires: { callAnswered: "call_rourke" } },
        { text: "Rourke handed over Jonathan's independent advisor agreement, with section 6 flagged.", requires: { hasEvidence: "E025" } },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C02",
    title: "Chen releases the envelope",
    characterId: "chen",
    requires: { deduction: "D09" },
    onActivate: [{ incomingCall: "call_chen_release" }, { message: "Your phone is ringing: the Law Office of Irene Chen." }],
    complete: { hasEvidence: "E022" },
    evidence: ["E022"],
    notebook: {
      call: "call_chen_release",
      learned: [
        { text: "Irene Chen now believes Jonathan is in danger, and under D.C. Rule 1.6 will release what he left with her, at her office, with Det. Collins on the line.", requires: { flag: "chen_release" } },
        { text: "Inside the sealed envelope: a PIN-locked drive and a note. Nobody has the code.", requires: { hasEvidence: "E022" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "S001C02",
    title: "Lyons moves",
    characterId: "collins",
    requires: { deduction: "D12" },
    onActivate: [
      { incomingCall: "call_collins_move" },
      { text: "t_collins_move" },
      { setEnv: "holding", to: "watch" },
      { unlockLocation: "holding_property" },
      { message: "Your phone is ringing: Det. Collins." },
    ],
    complete: { visited: "holding_property" },
    notebook: {
      call: "call_collins_move",
      learned: [
        { text: "The Maryland State Police watching 4 Sawmill Hollow Road saw the gray van back up to the farmhouse porch before dawn, and someone carrying things out." },
        { text: "You met Det. Collins and the FBI at the end of the lane.", requires: { visited: "holding_property" } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "S001C02",
    title: "Jonathan is recovered",
    characterId: "jonathan",
    requires: { flag: "entry_go" },
    onActivate: [{ setEnv: "holding", to: "cleared" }, { message: "MSP, MPD and the FBI are in. Jonathan Ellery is alive." }],
    complete: { visited: "holding_room" },
    evidence: ["E032", "E035"],
    notebook: {
      learned: [
        { text: "The Maryland State Police, MPD and the FBI went into the farmhouse on Sawmill Hollow Road. Garrett Lyons was arrested in the driveway." },
        { text: "Jonathan Ellery was found alive in a locked room upstairs." },
        { text: "Special Agent Teresa Quinlan of the FBI's Washington Field Office has the case with MPD: Jonathan was carried across a state line." },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "S001C02",
    title: "The unknown superior",
    characterId: "quinlan",
    requires: { all: [{ deduction: "D15" }, { event: "RE07" }] },
    onActivate: [{ incomingCall: "call_quinlan_safe" }, { message: "Your phone is ringing: Special Agent Quinlan." }],
    complete: { callAnswered: "call_quinlan_safe" },
    onComplete: [
      { delivery: "fbi_safe" },
      {
        note: {
          id: "event:a_card",
          kind: "event",
          title: "Above Rourke",
          text: "A typed card in Rourke's safe, dated November 19, tells him to contain the Ellery exposure and report when it's resolved. It is signed only with the letter A. Someone above Rourke gives him instructions.",
          important: true,
        },
      },
    ],
    evidence: ["E036"],
    notebook: {
      call: "call_quinlan_safe",
      delivery: "fbi_safe",
      learned: [
        { text: "The FBI searched Julian Rourke's office under a federal warrant and arrested him.", requires: { callAnswered: "call_quinlan_safe" } },
        { text: "In his safe: a typed card dated November 19, signed only \"A.\"", requires: { hasEvidence: "E036" } },
      ],
    },
  },
];

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Empty Room
  { id: "o1_file", text: "Read the case file on your desk.", visible: { always: true }, done: briefed },
  { id: "o1_room", text: "Examine Room 614.", visible: briefed, done: { visited: "room_614" } },
  { id: "o1_staff", text: "Talk to the front desk and hotel security.", visible: briefed, done: { all: [{ talkedTo: "monroe" }, { talkedTo: "wallace" }] } },
  { id: "o1_packed", text: "Decide whether Jonathan meant to leave.", visible: briefed, done: { deduction: "D01" } },
  { id: "o1_routine", text: "Find out what Jonathan was afraid of.", visible: briefed, done: { deduction: "D02" } },
  { id: "o1_entered", text: "Find out what happened at Room 614's door.", visible: briefed, done: { deduction: "D03" } },
  { id: "o1_opt_natalie", text: "Optional: hear what Natalie remembers.", visible: { event: "RE01" }, done: { eventState: "RE01", is: "completed" } },

  // Chapter 2: The Service Exit
  { id: "o2_access", text: "Find out how someone reached the sixth floor unseen.", visible: { chapter: 2 }, done: { deduction: "D04" } },
  { id: "o2_alarm", text: "Find out what happened to the service door's alarm.", visible: { chapter: 2 }, done: { deduction: "D05" } },
  { id: "o2_hurst", text: "Test the hotel engineer's account of Sunday night.", visible: { chapter: 2 }, done: { deduction: "D06" } },
  { id: "o2_route", text: "Find the way out of the hotel.", visible: { chapter: 2 }, done: { deduction: "D07" } },
  { id: "o2_vehicle", text: "Trace the van.", visible: { chapter: 2 }, done: { hasEvidence: "E027" } },
  { id: "o2_opt_payment", text: "Optional: find out what the engineer was paid.", visible: { chapter: 2 }, done: { hasEvidence: "E029" } },

  // Chapter 3: The Price of Silence
  { id: "o3_pressure", text: "Find out what pressure Jonathan was under.", visible: { chapter: 3 }, done: { deduction: "D08" } },
  { id: "o3_testimony", text: "Find out what Jonathan meant to do on Monday.", visible: { chapter: 3 }, done: { deduction: "D09" } },
  { id: "o3_motive", text: "Find out who had reason to stop him.", visible: { chapter: 3 }, done: { deduction: "D10" } },
  { id: "o3_lyons", text: "Find out who arranged Sunday night.", visible: { chapter: 3 }, done: { deduction: "D11" } },
  { id: "o3_property", text: "Find where Jonathan is being held.", visible: { chapter: 3 }, done: { deduction: "D12" } },
  { id: "o3_opt_envelope", text: "Recover what Jonathan left with his lawyer.", visible: { chapter: 3 }, done: { hasEvidence: "E022" } },
  { id: "o3_opt_courier", text: "Optional: open the envelope that came to the office.", visible: { chapter: 3 }, done: { hasEvidence: "E033" } },

  // Chapter 4: Room Without a Number
  { id: "o4_rescue", text: "Get Jonathan out.", visible: { chapter: 4 }, done: { event: "RE07" } },
  { id: "o4_room", text: "Establish what was done to him.", visible: { chapter: 4 }, done: { deduction: "D13" } },
  { id: "o4_jonathan", text: "Take Jonathan's statement.", visible: { chapter: 4 }, done: { talkedTo: "jonathan" } },
  { id: "o4_drive", text: "Open what Jonathan left behind.", visible: { chapter: 4 }, done: { hasEvidence: "E023" } },
  { id: "o4_direction", text: "Find out who directed it.", visible: { chapter: 4 }, done: { deduction: "D14" } },
  { id: "o4_meridian", text: "Find out what Meridian's intelligence division does.", visible: { chapter: 4 }, done: { deduction: "D15" } },
  { id: "o4_report", text: "File your final report from the office.", visible: { chapter: 4 }, done: { flag: "case_closed" } },
];

export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Empty Room",
    intro: "A man who was about to keep an appointment he'd planned all weekend is gone from a locked hotel room. His sister says he would never walk away. The police aren't sure.",
    objectives: ["o1_file", "o1_room", "o1_staff", "o1_packed", "o1_routine", "o1_entered"],
    optional: ["o1_opt_natalie"],
    conclusion: "Somebody came to Room 614's door on Sunday night, and Jonathan opened it. But nobody walked him past a single camera. How did he leave?",
    summary: "Jonathan didn't leave of his own accord. Someone came to his door from the end of the corridor the camera can't see.",
  },
  {
    number: 2,
    title: "The Service Exit",
    intro: "Every hotel has a second building inside it: the corridors guests never see. Douglas Wallace is ready to walk you through his.",
    objectives: ["o2_access", "o2_alarm", "o2_hurst", "o2_route", "o2_vehicle"],
    optional: ["o2_opt_payment"],
    conclusion: "Jonathan was taken out through the back of the hotel, with help from inside it. The van has an owner now. Who wanted him gone?",
    summary: "The service door's alarm was turned off from inside the hotel, a temporary badge let a stranger in at the dock, and a van was waiting.",
  },
  {
    number: 3,
    title: "The Price of Silence",
    intro: "Jonathan's employer, his lawyer and a consulting firm on K Street each know a piece of why he was in that room. None of them wants to be first to say it.",
    objectives: ["o3_pressure", "o3_testimony", "o3_motive", "o3_lyons", "o3_property", "o3_opt_envelope"],
    optional: ["o3_opt_courier"],
    conclusion: "You know where he is. So, now, does the man who took him.",
    summary: "Jonathan had been selling secrets and was about to confess it. The people he sold them to had reason to stop him, and a place to keep him.",
  },
  {
    number: 4,
    title: "Room Without a Number",
    intro: "A farmhouse at the end of a gravel lane, in the dark before the sun comes up. Det. Collins wants a reason before anyone goes through the door.",
    objectives: ["o4_rescue", "o4_room", "o4_jonathan", "o4_drive", "o4_direction", "o4_meridian", "o4_report"],
    conclusion: "Case closed.",
    summary: "Jonathan is alive. The men who took him are identified. The one who gave the orders answers to someone else.",
  },
];

/* The report opens once Jonathan is recovered, the kidnapping is established, the card from Rourke's safe (E036, RE08) is in hand for section J, and the investigation has substance. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [{ event: "RE07" }, { event: "RE08" }, { hasEvidence: "E036" }, { deduction: "D13" }, { evidenceCount: 24 }],
};
