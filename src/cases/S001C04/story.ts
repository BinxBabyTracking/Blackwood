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
import { LAB_DECRYPT_RECT } from "./desk";

/*
 * S01 C04 story content. Times follow docs/S001C04-timeline.md exactly.
 *
 * The case opens at the Wren in Alexandria at 10:50 AM on Wednesday, December
 * 12, 2018 (startLocation "cafe"); the hub is still C003's Pittsburgh office,
 * with the series' rolling board in it. Nine engine events (RE01 to RE09). The
 * series notebook entry is written by solution.resolution.series when the
 * report is accepted, not by RE09.
 *
 * Nothing here names the source, the 6:15 AM caller, EO-01 or "A". Dr.
 * Lockhart appears only as Clearwater's patron and a concerned caller.
 */

export const briefed: Condition = { flag: "casefile_read" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Wednesday, December 12, 2018", text: "The Wren Coffeehouse, 1108 King Street, Old Town Alexandria, Virginia. 10:50 AM. Wet brick, a low gray sky, the smell of the river at the bottom of the street." },
  {
    text: "Last night a woman named Claire Donovan wrote to the Pittsburgh office. Until Friday she was a records analyst at Meridian Advisory Group's Records Center in Chantilly. She said the agency's autumn cases were connected, and that someone had been choosing what you saw. She asked to meet you here at ten, in the back booth.",
  },
  {
    text: "You left Pittsburgh at five. You have been in the back booth since 9:52. Your coffee went cold an hour ago. Her phone goes straight to voicemail.",
  },
  {
    text: "Bennett has reported her missing to the Alexandria police. A Det. Ross Harris took the call, without much enthusiasm. Bennett's file is on your phone. You are reaching for your coat.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "9:14 PM (Tue 12/11)", text: "Claire Donovan emails Blackwood's Pittsburgh office asking to meet at the Wren Coffeehouse, Alexandria, at 10:00 the next morning.", source: "Case file" },
  { time: "9:40 PM (Tue 12/11)", text: "Bennett forwards the email and books the investigator the 5 AM drive.", source: "Case file" },
  { time: "9:52 AM (Wed 12/12)", text: "The investigator arrives at the Wren and waits in the back booth.", source: "Case file" },
  { time: "10:00 AM (Wed 12/12)", text: "The meeting time. Claire Donovan does not arrive. Her phone goes to voicemail.", source: "Case file" },
  { time: "Before 10:50 AM (Wed 12/12)", text: "Bennett reports Claire missing to the Alexandria Police Department (Det. Ross Harris, case 18-034417).", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Claire Donovan, Alexandria, Virginia",
    dossier: [
      { label: "Case ID", value: "S01 C04" },
      { label: "Case title", value: "The Informant" },
      { label: "Classification", value: "Missing person" },
      { label: "Location", value: "Alexandria, Virginia" },
      { label: "Year", value: "2018" },
      { label: "Subject", value: "Claire Donovan, 34" },
      { label: "Police", value: "Det. Ross Harris, Alexandria PD, case 18-034417" },
      { label: "Contacts", value: "Det. Nadia Collins, MPD, by phone; Bennett, Blackwood records, by phone" },
    ],
    people: ["donovan", "harris", "collins"],
    peopleHeading: "Persons named in the file",
    evidence: ["E001"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (Bennett)",
        spoken:
          "Claire Donovan, thirty-four, of Cameron Mews, ten fifteen Cameron Street, Alexandria, apartment three C. Until Friday, December seventh, a records analyst at Meridian Advisory Group's Records Center in Chantilly, Virginia. On Tuesday night at nine fourteen she wrote to our general inbox asking to meet at the Wren Coffeehouse, eleven oh eight King Street, at ten on Wednesday morning. She did not come. Her cell, seven oh three, five five five, oh one two nine, goes straight to voicemail. I reported her missing to the Alexandria police this morning. Detective Ross Harris has the file, case eighteen, oh three four four one seven.",
        body: "Claire Donovan, 34, Cameron Mews, 1015 Cameron Street, Apt 3C, Alexandria. Until Friday, December 7, a records analyst at Meridian Advisory Group's Records Center, 3900 Brookfield Corporate Drive, Chantilly, Virginia. Tuesday, December 11, 9:14 PM: she wrote to our general inbox asking to meet at the Wren Coffeehouse, 1108 King Street, Alexandria, at 10:00 Wednesday. She did not come. Cell (703) 555-0129: straight to voicemail. Reported missing to the Alexandria Police Department Wednesday morning. Det. Ross Harris, case 18-034417.",
      },
      {
        heading: "Her message",
        spoken:
          "Her message is attached. She says the things this agency uncovered this autumn in Carroway, in Washington and in Baltimore are connected, and that some of what reached us did not reach us by accident. She asked us not to write back to that address.",
        body: "Her email is attached (collect it from this file). She says the things this agency uncovered this autumn in Carroway, in Washington and in Baltimore are connected, and that \"some of what reached you did not reach you by accident.\" She asked us not to write back to that address, and not to use her cell.",
      },
      {
        heading: "Police",
        spoken:
          "Detective Ross Harris, Alexandria Police Department, Wheeler Avenue. His view this morning: an adult who quit her job on Friday and switched her phone off is allowed to leave. He opened a file anyway. He's at the station and on your phone.",
        body: "Det. Ross Harris, Alexandria Police Department, Wheeler Avenue. His view this morning: an adult who quit her job on Friday and switched her phone off is allowed to leave. He opened a file anyway. At the station, and on your phone.",
      },
      {
        heading: "Washington",
        spoken:
          "Detective Nadia Collins, Metropolitan Police, worked the Ellery case with us last month. She's now the department's liaison to the federal task force on Julian Rourke. If any of this touches Meridian's Washington side, she'll want to hear it. Her number's in your phone.",
        body: "Det. Nadia Collins, MPD, worked the Ellery case with us in November. She is now MPD's liaison to the federal task force on the Rourke case. If this touches Meridian's Washington side, she'll want to hear it. By phone.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. I'd never heard of her before last night. People who write to an investigator at nine at night and ask for a booth at ten the next morning usually turn up. If she didn't, something changed between nine fourteen and ten. Start with the café. B.",
        body: "I'd never heard of her before last night. People who write to an investigator at nine at night and book a booth for ten the next morning usually turn up. If she didn't, something changed between 9:14 and 10:00. Start with the café. B.",
      },
    ],
  },
];

/* No recorded police interviews: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_patel_screwdriver",
    from: "patel",
    title: "Call from Gwen Patel",
    lines: [
      "It's Gwen, from next door. Det. Harris told me about the fob and I haven't stopped thinking.",
      "Saturday afternoon Claire knocked and borrowed my little screwdriver, the one with the bits in the handle. She said the bottom board of her bookcase was loose. She brought it back in ten minutes.",
      "I've known her three years. She's never fixed anything in her life.",
    ],
    effects: [{ setFlag: "screwdriver_known" }],
  },
  {
    id: "call_corbett_withdraws",
    from: "corbett",
    title: "Call from Alan Corbett",
    lines: [
      "Alan Corbett. I'm sorry to do this by phone.",
      "I signed a severance agreement in October with a paragraph about Meridian records in it, and I've been reading the Baltimore papers.",
      "I can't be part of this. Please don't come back unless you have something that makes it worth what it'll cost me.",
    ],
    effects: [
      {
        note: {
          id: "call:corbett_withdraws",
          kind: "call",
          title: "Alan Corbett withdraws",
          text: "Alan Corbett has asked not to be contacted again unless there is something that makes it worth the risk to him. He signed a severance agreement with Meridian in October.",
          characterId: "corbett",
        },
      },
    ],
  },
  {
    id: "call_lockhart",
    from: "lockhart",
    title: "Call from Dr. Evelyn Lockhart, New York",
    lines: [
      "Good afternoon. This is Evelyn Lockhart, in New York. Forgive me for calling without warning.",
      "Miriam Castell telephoned me an hour ago, very upset. She tells me one of the people Clearwater has been helping is missing, and that you're looking for her. Is she safe? Is there anything at all the foundation can do?",
      "Miriam also tells me the envelope I passed to your colleague in November came from her own office. She never told me so at the time. I would rather have known. If I can help, please call me. My office will put you through.",
    ],
    effects: [
      {
        note: {
          id: "call:lockhart_clearwater",
          kind: "call",
          title: "Dr. Lockhart calls from New York",
          text: "Dr. Evelyn Lockhart, Clearwater's founding patron, called after Miriam Castell told her Claire is missing. She offered the foundation's help and can be telephoned directly.",
          characterId: "lockhart",
        },
      },
    ],
  },
  {
    id: "call_bennett_pattern",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "Bennett. That gray line along the bottom of the copies. I went to our files.",
      "The two courier packets that came into this office this autumn, November 20 and December 4. Both have it. Twenty-two, oh one eight seven, oh oh nine. Thirty-one, oh oh five six, oh four four. And the invoice copy Dr. Lockhart sent us in the Keller case: fourteen, oh four one two, one one seven.",
      "All three came by Capital Courier, and the same account number is on every waybill: two oh four one seven. Somebody's been sending us Meridian's archive one page at a time. If you don't already know who pays for that account, find out.",
    ],
    effects: [
      { setFlag: "courier_known" },
      {
        note: {
          id: "call:bennett_pattern",
          kind: "call",
          title: "Bennett: the same footer, the same courier account",
          text: "The agency's own packets from this autumn carry the Records Center's copier footer (MAG-RM 14-0412-117, 22-0187-009, 31-0056-044) and Capital Courier waybills on account 20417.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_tate_story",
    from: "tate",
    title: "Call from Brandon Tate",
    lines: [
      "Brandon Tate. I'm told you were out in Fauquier County today. Let me save us both some time.",
      "Ms. Donovan contacted my firm on Wednesday evening. She believed she was in danger and asked to be moved somewhere nobody knew about. We did that. She's safe.",
      "She asked that nobody be told where, and that includes you and the police. I'm respecting a client's wishes. If she wants to talk to you, she'll call you.",
    ],
    effects: [{ setFlag: "tate_story2" }],
  },
  {
    id: "call_harris_moved",
    from: "harris",
    title: "Call from Det. Harris",
    lines: [
      "Harris. That Tahoe. Plate readers have it on 66 eastbound at Route 29, Gainesville, at 1:27 Thursday morning, and nowhere after. It never went back to Arlington.",
      "Whatever left that cottage at one in the morning went somewhere in western Prince William County and stayed there.",
      "A judge signed a warrant for Tate's office and vehicles twenty minutes ago. Tate's not answering and he's not at the office. Meet me there.",
    ],
    effects: [{ setFlag: "tate_warrant" }],
  },
  {
    id: "call_collins_note",
    from: "collins",
    title: "Call from Det. Collins",
    lines: [
      "Nadia Collins. Det. Harris sent me a photograph of the note from Tate's desk.",
      "I know that handwriting. I spent a month reading his handwriting in the files we took from his office.",
      "Agent Quinlan is pulling the legal visit log at the detention center now. I'll send you both together.",
    ],
    effects: [{ delivery: "rourke_packet" }, { text: "t_collins_packet" }],
  },
  {
    id: "call_harris_rescue",
    from: "harris",
    title: "Call from Det. Harris",
    lines: [
      "Harris. We went in at 6:10. She's alive.",
      "Basement room, padlocked from the outside. Tate was in the kitchen making coffee. He didn't run.",
      "She's at the hospital in Manassas getting looked at, then she's coming to us. She asked for you by name.",
      "One more thing. There was a document wallet in a duffel in the kitchen. Her papers. She wants you to have copies.",
    ],
  },
  {
    id: "call_bennett_revelation",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "Bennett. I've got the Keller file, the Ellery file and the Navarro file open on the desk.",
      "Every one of them holds. Holt did what we said he did. So did Rourke. So did Kane. Nobody made any of it up.",
      "But somebody picked them, and picked the order, and kept back the one page each time that would have pointed past them. We weren't wrong. We were used. I'd like to know by whom.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_revelation",
          kind: "call",
          title: "Bennett: we weren't wrong, we were used",
          text: "Bennett has gone back over the Keller, Ellery and Navarro files. Every conclusion holds. But the leads were picked, and so was their order, and each time the page that pointed past the man exposed was kept back.",
          characterId: "bennett",
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
      "It's Bennett. I know what an empty board looks like.",
      "The cork board on the wall is for this case. Pin what you've got, and when two things belong together, run string between them. The board will tell you when you're onto something.",
      "The one on wheels is for the whole business, case to case. That one's yours to keep however you like. Costs you nothing to be wrong on either.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Bennett: use the board",
          text: "Pin the evidence on the murder board in the office and connect pieces that belong together. When two pieces fit, a deduction follows. The rolling board is for the series.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [
  {
    id: "out_harris_entry",
    to: "harris",
    label: "Tell Det. Harris where Claire is.",
    available: { all: [{ hasEvidence: "E033" }, { hasEvidence: "E034" }] },
    done: { flag: "entry_requested" },
    lines: [
      "Twelve Saddle Ridge Lane, Bristow. Tate's lease, his alarm code, and the doorbell camera across the road.",
      "Harris: \"That's enough for a judge and for Prince William's tactical team. We go at first light. Keep your phone on.\"",
    ],
    effects: [{ setFlag: "entry_requested" }],
  },
];

export const texts: TextDef[] = [
  { id: "t_patel_call", from: "patel", body: "It's Gwen next door. Can you call me? I remembered something about Saturday." },
  { id: "t_harris_moved", from: "harris", body: "Tate Protective, 2900 Clarendon Blvd. Warrant's signed. R.H." },
  { id: "t_collins_packet", from: "collins", body: "Rourke's note and the visit log are on your desk. N.C." },
  { id: "t_harris_rescue", from: "harris", body: "She's alive. Call me. R.H." },
  { id: "t_bennett_archive", from: "bennett", body: "Claire's drive is open. Index on your desk. B." },
];

/*
 * The one lab test: Claire's encrypted drive, opened once Tyler's keyfile,
 * Claire's passphrase and the carton are together. Started by whichever of
 * the three facts comes last (characters own them), or by Bennett's fallback.
 */
export const labs: LabDef[] = [
  {
    id: "decrypt",
    label: "Decryption: Claire's drive (Tyler's key, Claire's passphrase)",
    seconds: 180,
    rect: LAB_DECRYPT_RECT,
    image: "obj.archive_folder",
    onReady: [
      { delivery: "lab_archive" },
      { text: "t_bennett_archive" },
      { message: "Claire's drive is open. Bennett's printout of her archive is on your desk and in your email." },
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "rourke_packet",
    title: "Packet from Det. Collins",
    exterior: "An MPD interoffice envelope, hand-addressed \"Blackwood, via APD.\"",
    text: "Copies only; the originals are in evidence. N.C.",
    evidence: ["E032"],
  },
  {
    id: "claire_wallet",
    title: "Copies from Claire's document wallet",
    exterior: "An Alexandria Police Department property envelope, case 18-034417.",
    text: "Recovered from a duffel bag in the kitchen at Saddle Ridge Lane. Originals in our property room. Ms. Donovan asked that you have copies of everything in it. R.H.",
    evidence: ["E039", "E040", "E041", "E042"],
  },
  {
    id: "lab_archive",
    title: "Claire's archive, printed",
    exterior: "A Blackwood interoffice folder from Pittsburgh, and the same printout in your email.",
    text: "Her half and his half. Opened on the first try. B.",
    evidence: ["E037"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C04",
    title: "The warning appears",
    characterId: "halvorsen",
    requires: { any: [{ talkedTo: "halvorsen" }, { inspected: "cafe_booth" }] },
    onActivate: [
      { setFlag: "note_given" },
      { message: "Nina Halvorsen comes over with an envelope: \"Are you who Claire was meeting? She left this for you this morning. I'm so sorry, I was in the back.\" She sets it on the booth table." },
    ],
    complete: { hasEvidence: "E003" },
    evidence: ["E003"],
    notebook: {
      learned: [
        { text: "Claire Donovan came into the Wren at 8:14 on Wednesday morning and left a sealed envelope with the manager for \"whoever asks for the Donovan booth.\"" },
        { text: "Nina Halvorsen was in the back with a delivery from about 9:45 and only saw you at the booth at 10:50." },
        { text: "The note says she was told that morning it wasn't safe to come, and: \"You're looking at the wrong people.\"", requires: { hasEvidence: "E003" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C04",
    title: "Claire's apartment is revisited",
    characterId: "patel",
    requires: { any: [{ deduction: "D04" }, { all: [{ hasEvidence: "E006" }, { hasEvidence: "E007" }] }] },
    onActivate: [{ incomingCall: "call_patel_screwdriver" }, { text: "t_patel_call" }, { message: "Your phone is ringing: Gwen Patel." }],
    complete: { flag: "screwdriver_known" },
    evidence: ["E012"],
    notebook: {
      call: "call_patel_screwdriver",
      learned: [
        { text: "On Saturday afternoon Claire borrowed Gwen Patel's screwdriver for ten minutes, saying the bottom board of her bookcase was loose.", requires: { flag: "screwdriver_known" } },
        { text: "Behind the kick plate of Claire's bookcase: a Dominion Secure Records receipt for carton P-0388, deposited Saturday at 10:12 AM.", requires: { hasEvidence: "E012" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C04",
    title: "Corbett becomes nervous",
    characterId: "corbett",
    requires: { all: [{ hasEvidence: "E014" }, { any: [{ deduction: "D05" }, { hasEvidence: "E017" }] }] },
    onActivate: [{ setFlag: "corbett_withdraws" }, { incomingCall: "call_corbett_withdraws" }, { message: "Your phone is ringing: Alan Corbett." }],
    complete: { callAnswered: "call_corbett_withdraws" },
    notebook: {
      call: "call_corbett_withdraws",
      learned: [
        { text: "Alan Corbett has withdrawn. He signed a severance agreement with Meridian in October and is afraid of what helping will cost him." },
        { text: "He may talk again if you bring him something worth the risk.", requires: { callAnswered: "call_corbett_withdraws" } },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C04",
    title: "Castell provides correspondence",
    characterId: "castell",
    requires: {
      all: [
        { talkedTo: "castell" },
        {
          any: [
            { deduction: "D04" },
            { presented: "castell:E004" },
            { presented: "castell:E005" },
            { presented: "castell:E006" },
            { presented: "castell:E007" },
          ],
        },
      ],
    },
    onActivate: [{ setFlag: "castell_cooperates" }],
    complete: { hasEvidence: "E025" },
    onComplete: [{ incomingCall: "call_lockhart" }, { message: "Your phone is ringing: a New York number." }],
    evidence: ["E025", "E027", "E018"],
    notebook: {
      call: "call_lockhart",
      learned: [
        { text: "Miriam Castell has realized Claire may be in danger, and has agreed to tell you what she knows." },
        { text: "She has printed her messages with Claire.", requires: { hasEvidence: "E025" } },
        { text: "She booked a cottage in Fauquier County for Claire at 6:32 on Wednesday morning.", requires: { hasEvidence: "E027" } },
        { text: "The pages went out on Clearwater's Capital Courier account.", requires: { hasEvidence: "E018" } },
        { text: "Dr. Evelyn Lockhart, Clearwater's patron, called to ask whether Claire is safe.", requires: { callAnswered: "call_lockhart" } },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C04",
    title: "A familiar document pattern",
    characterId: "bennett",
    requires: {
      all: [
        { hasEvidence: "E015" },
        { any: [{ hasEvidence: "E017" }, { hasEvidence: "E018" }, { hasEvidence: "E019" }, { hasEvidence: "E020" }, { hasEvidence: "E021" }] },
      ],
    },
    onActivate: [{ incomingCall: "call_bennett_pattern" }, { message: "Your phone is ringing: Bennett." }],
    complete: { callAnswered: "call_bennett_pattern" },
    notebook: {
      call: "call_bennett_pattern",
      learned: [
        { text: "Bennett checked the agency's own packets from this autumn: they carry the same Records Center copier footer.", requires: { callAnswered: "call_bennett_pattern" } },
        { text: "All three came by Capital Courier on account 20417.", requires: { callAnswered: "call_bennett_pattern" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "S001C04",
    title: "Tate changes his story",
    characterId: "tate",
    requires: {
      all: [{ talkedTo: "tate" }, { any: [{ deduction: "D10" }, { hasEvidence: "E028" }] }, { not: { flag: "tate_warrant" } }],
    },
    onActivate: [{ incomingCall: "call_tate_story" }, { message: "Your phone is ringing: Brandon Tate." }],
    complete: { callAnswered: "call_tate_story" },
    notebook: {
      call: "call_tate_story",
      learned: [
        { text: "Brandon Tate now says Claire contacted his firm on Wednesday evening and asked to be moved somewhere nobody knew; that she is safe; and that she asked for nobody to be told where.", requires: { flag: "tate_story2" } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "S001C04",
    title: "Claire was moved",
    characterId: "harris",
    requires: { any: [{ deduction: "D11" }, { all: [{ hasEvidence: "E029" }, { hasEvidence: "E030" }] }] },
    onActivate: [{ incomingCall: "call_harris_moved" }, { message: "Your phone is ringing: Det. Harris." }],
    complete: { callAnswered: "call_harris_moved" },
    onComplete: [{ text: "t_harris_moved" }],
    notebook: {
      call: "call_harris_moved",
      learned: [
        { text: "Tate's Tahoe was last seen by a plate reader on I-66 eastbound at Gainesville at 1:27 AM Thursday. It never went back to Arlington.", requires: { callAnswered: "call_harris_moved" } },
        { text: "Det. Harris has a warrant for Tate Protective Services' office and vehicles. Tate is not answering.", requires: { flag: "tate_warrant" } },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "S001C04",
    title: "Claire is rescued",
    characterId: "donovan",
    requires: { flag: "entry_requested" },
    onActivate: [
      { message: "Prince William County Police are going in at first light." },
      { setFlag: "claire_rescued" },
      { unlockLocation: "holding_house" },
      { incomingCall: "call_harris_rescue" },
      { text: "t_harris_rescue" },
    ],
    complete: { callAnswered: "call_harris_rescue" },
    onComplete: [{ delivery: "claire_wallet" }, { message: "An Alexandria police envelope is on its way to your desk: copies of Claire's papers." }],
    evidence: ["E035", "E036", "E039", "E040", "E041", "E042"],
    notebook: {
      call: "call_harris_rescue",
      delivery: "claire_wallet",
      learned: [
        { text: "At 6:10 AM on Friday, December 14, Alexandria and Prince William County police entered 12 Saddle Ridge Lane, Bristow. Claire Donovan was found alive in a padlocked basement room." },
        { text: "Brandon Tate was arrested in the kitchen.", requires: { callAnswered: "call_harris_rescue" } },
        { text: "A document wallet was recovered from a duffel bag in the kitchen. Claire asked that you have copies.", requires: { callAnswered: "call_harris_rescue" } },
        { text: "Claire is at the Alexandria Police Department and will talk to you.", requires: { callAnswered: "call_harris_rescue" } },
      ],
    },
  },
  {
    id: "RE09",
    caseId: "S001C04",
    title: "Someone else's investigation",
    characterId: "bennett",
    requires: { all: [{ deduction: "D16" }, { deduction: "D17" }] },
    onActivate: [{ incomingCall: "call_bennett_revelation" }, { message: "Your phone is ringing: Bennett." }],
    complete: { callAnswered: "call_bennett_revelation" },
    notebook: {
      call: "call_bennett_revelation",
      learned: [
        { text: "The leads that reached Blackwood this autumn were genuine, and they were chosen: one page per man, in the order of an internal memo, stopping short of whoever authorized them." },
        { text: "Blackwood's earlier conclusions hold. But the agency has been working someone else's investigation.", requires: { callAnswered: "call_bennett_revelation" } },
      ],
    },
  },
];

const ch = (n: number): Condition => (n === 1 ? { always: true } : { chapter: n });

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Missed Meeting
  { id: "o1_file", text: "Read Bennett's case file.", visible: ch(1), done: briefed },
  { id: "o1_note", text: "Find out what Claire left at the café.", visible: ch(1), done: { hasEvidence: "E003" } },
  { id: "o1_apartment", text: "Go through Claire's apartment.", visible: ch(1), done: { visited: "claire_apt" } },
  { id: "o1_neighbor", text: "Talk to Claire's neighbor.", visible: ch(1), done: { hasEvidence: "E007" } },
  { id: "o1_meeting", text: "Establish that Claire meant to come.", visible: ch(1), done: { deduction: "D01" } },
  { id: "o1_searched", text: "Find out who has been in the apartment.", visible: ch(1), done: { deduction: "D04" } },
  { id: "o1_left", text: "Decide whether Claire left of her own accord.", visible: ch(1), done: { deduction: "D03" } },
  { id: "o1_phone", text: "Optional: get Claire's phone records.", visible: ch(1), done: { hasEvidence: "E008" } },

  // Chapter 2: The Selected Truth
  { id: "o2_job", text: "Find out what Claire could reach at Meridian.", visible: ch(2), done: { deduction: "D05" } },
  { id: "o2_code", text: "Learn to read the footer on the copies.", visible: ch(2), done: { hasEvidence: "E015" } },
  { id: "o2_carton", text: "Open what Claire left in Lorton.", visible: ch(2), done: { hasEvidence: "E019" } },
  { id: "o2_contact", text: "Find out who was asking Claire for documents.", visible: ch(2), done: { deduction: "D09" } },
  { id: "o2_selective", text: "Find out what was left out.", visible: ch(2), done: { deduction: "D06" } },
  { id: "o2_targets", text: "Find out who the pages exposed.", visible: ch(2), done: { deduction: "D07" } },
  { id: "o2_channel", text: "Trace how the pages reached Blackwood.", visible: ch(2), done: { deduction: "D08" } },
  { id: "o2_memo", text: "Optional: find out what Alan Corbett warned about.", visible: ch(2), done: { hasEvidence: "E023" } },

  // Chapter 3: The False Safe House
  { id: "o3_prepared", text: "Find out what Claire prepared before she went.", visible: ch(3), done: { deduction: "D02" } },
  { id: "o3_hide", text: "Reconstruct how Claire went into hiding.", visible: ch(3), done: { deduction: "D10" } },
  { id: "o3_broke", text: "Find out who came to the cottage.", visible: ch(3), done: { deduction: "D11" } },
  { id: "o3_moved", text: "Find out where she went from there.", visible: ch(3), done: { eventState: "RE07", is: "completed" } },
  { id: "o3_orders", text: "Find out who sent him.", visible: ch(3), done: { deduction: "D14" } },
  { id: "o3_where", text: "Find the second property.", visible: ch(3), done: { deduction: "D12" } },
  { id: "o3_story", text: "Optional: hear Tate's second account.", visible: ch(3), done: { flag: "tate_story2" } },

  // Chapter 4: Someone Else's Investigation
  { id: "o4_rescue", text: "Get the police to Claire.", visible: ch(4), done: { eventState: "RE08", is: "completed" } },
  { id: "o4_held", text: "Examine where she was held.", visible: ch(4), done: { hasEvidence: "E035" } },
  { id: "o4_claire", text: "Hear Claire's account.", visible: ch(4), done: { hasEvidence: "E036" } },
  { id: "o4_kidnap", text: "Establish what happened to her.", visible: ch(4), done: { deduction: "D13" } },
  { id: "o4_archive", text: "Open Claire's archive.", visible: ch(4), done: { hasEvidence: "E037" } },
  { id: "o4_filtered", text: "Show the records were filtered.", visible: ch(4), done: { deduction: "D15" } },
  { id: "o4_directed", text: "Show Blackwood was steered.", visible: ch(4), done: { deduction: "D16" } },
  { id: "o4_authority", text: "Find out how far up it went.", visible: ch(4), done: { deduction: "D17" } },
  { id: "o4_report", text: "File the final report from the office.", visible: ch(4), done: { flag: "case_closed" } },
];

/* Lenient chapter conditions: a player who skips one board deduction is never held in a chapter. */
export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Missed Meeting",
    intro: "A woman who used to keep Meridian's records asked to meet you. You drove four hours. She never came.",
    objectives: ["o1_file", "o1_note", "o1_apartment", "o1_neighbor", "o1_meeting", "o1_searched", "o1_left"],
    optional: ["o1_phone"],
    complete: { all: [{ hasEvidence: "E003" }, { any: [{ deduction: "D04" }, { event: "RE02" }] }] },
    conclusion: "Claire Donovan left home on her own, and somebody went through her life the moment she did. But who told her to go, and where?",
    summary: "Claire meant to meet Blackwood, packed a bag and left willingly. Her apartment was searched behind her.",
  },
  {
    number: 2,
    title: "The Selected Truth",
    intro: "Claire's job was to know where every page in Meridian's archive was. Some of those pages have been to Pittsburgh.",
    objectives: ["o2_job", "o2_code", "o2_carton", "o2_contact", "o2_selective", "o2_targets", "o2_channel"],
    optional: ["o2_memo"],
    complete: { all: [{ flag: "carton_warrant" }, { flag: "castell_cooperates" }, { any: [{ deduction: "D06" }, { deduction: "D07" }, { deduction: "D08" }] }] },
    conclusion: "Every page was real, and every page was chosen. Somebody decided which Meridian men Blackwood would find. And Claire knew it.",
    summary: "The leads that reached Blackwood came out of Meridian's archive one page at a time, through one channel, and none of them pointed higher.",
  },
  {
    number: 3,
    title: "The False Safe House",
    intro: "Claire went into hiding because someone she trusted told her to. Someone else knew where.",
    objectives: ["o3_prepared", "o3_hide", "o3_broke", "o3_moved", "o3_orders", "o3_where"],
    optional: ["o3_story"],
    complete: { all: [{ event: "RE07" }, { hasEvidence: "E033" }, { hasEvidence: "E034" }] },
    conclusion: "Claire is being held, and the man holding her takes his orders from a cell. There is a house in Bristow with its alarm set and someone inside.",
    summary: "Claire's hiding place became a trap. Tate moved her in the night on orders carried out of a detention center.",
  },
  {
    number: 4,
    title: "Someone Else's Investigation",
    intro: "First light, Saddle Ridge Lane.",
    objectives: ["o4_rescue", "o4_held", "o4_claire", "o4_kidnap", "o4_archive", "o4_filtered", "o4_directed", "o4_authority", "o4_report"],
    conclusion: "Case closed.",
    summary: "Claire is safe. The earlier cases hold. But Blackwood has been working someone else's investigation.",
  },
];

/* The report never needs D15 to D17, E037 or the wallet: the contents point can be proved with the carton and Corbett. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [briefed, { flag: "claire_rescued" }, { deduction: "D11" }, { evidenceCount: 24 }],
};
