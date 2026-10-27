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
import { LAB_CHAIN_RECT, LAB_IMAGING_RECT, LAB_PHONES_RECT, LAB_SIGNATURES_RECT } from "./desk";
import { CLAIMS } from "./solution";

/*
 * S01 C06 story content. Times follow docs/S001C06-timeline.md exactly.
 *
 * Twelve engine events (RE01 to RE12), each fired by what the player has done,
 * never by the clock. Six chapters (C006's system); nothing resets between
 * them. Labs are started by the people who run them (SA Quinlan's and
 * Benjamin Sayer's knowledge facts, in characters.ts / knowledge.ts); this
 * file defines the labs and what arrives when each is back.
 *
 * Nothing before the closing states the solution. The fire is described only
 * by the fire marshal's conclusion. Evelyn Lockhart's final interview (RE12)
 * changes nothing by itself: the outcome is the filed report.
 */

export const briefed: Condition = { flag: "casefile_read" };

/** Every point the report must show has at least one proof in hand (RE12 waits for this). */
export const claimsReady: Condition = { all: CLAIMS.map((c) => ({ any: c.anyOf.map((id) => ({ hasEvidence: id })) })) };

export const intro: CaseDefinition["intro"] = [
  { heading: "Thursday, December 27, 2018", text: "Blackwood Investigations, Pittsburgh field office. 9:10 AM. Snow that will not quite settle, the radiators knocking, the rivers the color of slate." },
  {
    text: "The email came in at 6:12 this morning, from an address nobody has seen before, signed only \"The former Records Administrator.\" It has one page attached: a register of approvals, three entries long, every one of them a case you have closed this autumn.",
  },
  {
    text: "You forwarded it to SA Teresa Quinlan at the FBI's Washington Field Office at nine. She called back inside five minutes. She knows who held that job until last Friday, and she has asked Arlington County to knock on his door.",
  },
  {
    text: "\"Please do not call my house,\" the email says. Somewhere in northern Virginia, overnight, a building full of records burned. The file is on your desk.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "Mon 11/26", text: "The U.S. Attorney's Office for the District of Columbia serves a preservation letter (legal hold) on Meridian Advisory Group through its outside counsel.", source: "Case file" },
  { time: "Fri 12/21", text: "Benjamin Sayer resigns as Meridian's Records Administrator.", source: "Case file" },
  { time: "Sat 12/22", text: "Elena Marchetti, Meridian's outside counsel, is arrested in New York. She is released on bail on Monday, December 24.", source: "Case file" },
  { time: "Night (Wed 12/26)", text: "Fire at the Meridian Records Center, Chantilly, Virginia.", source: "Case file" },
  { time: "6:12 AM (Thu 12/27)", text: "An email signed \"The former Records Administrator\" reaches Blackwood, with one page of a register attached.", source: "Case file" },
  { time: "9:10 AM (Thu 12/27)", text: "Blackwood forwards the email to SA Quinlan, who asks Arlington County Police for a welfare check.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: the former Records Administrator",
    dossier: [
      { label: "Case ID", value: "S01 C06" },
      { label: "Case title", value: "The Architect" },
      { label: "Classification", value: "Missing witness; records destruction" },
      { label: "Location", value: "Arlington and Chantilly, Virginia; Washington, D.C." },
      { label: "Year", value: "2018" },
      { label: "Missing", value: "Benjamin Sayer, 58, former Records Administrator, Meridian Advisory Group" },
      { label: "Federal contact", value: "SA Teresa Quinlan, FBI Washington Field Office" },
      { label: "Contact", value: "Bennett, Blackwood records, by phone" },
    ],
    people: ["sayer", "quinlan", "donovan", "lockhart", "marchetti", "holt", "rourke", "kane", "chen", "ames", "wexler", "caruso"],
    peopleHeading: "Persons named in the file",
    evidence: ["E001", "E002"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "The message",
        spoken:
          "The message. At twelve minutes past six this morning, Thursday, December twenty-seventh, an email reached the field office from a free webmail account nobody here has seen before. It is signed only: the former Records Administrator. It says the building in Chantilly where Meridian's restricted records were kept caught fire last night, and that the writer does not believe it caught fire by itself. One page of a register is attached. The writer asks us not to call his house, and promises to write again from somewhere safer.",
        body: "Thursday, December 27, 2018, 6:12 AM. An email to the field office from a free webmail account, signed only \"The former Records Administrator.\" The writer says the building in Chantilly where Meridian Advisory Group's restricted records were kept caught fire last night, \"and I do not believe it caught fire by itself.\" One page of a register is attached. He asks us not to call his house and says he will write again from somewhere safer. The email and its attachment are in this file.",
      },
      {
        heading: "Who he is (SA Quinlan)",
        spoken:
          "A page from Special Agent Teresa Quinlan, FBI Washington Field Office. Meridian's Records Administrator until last Friday, December twenty-first, was Benjamin Sayer, fifty-eight. His signature is on the archive transfers in the Donovan matter. He resigned that afternoon. He lives alone at forty-four seventeen North Nineteenth Street, Arlington, Virginia. Home phone seven oh three, five five five, oh one two nine. Cell seven oh three, five five five, oh one five one: switched off since Friday. No car registered to him. I have asked Arlington County Police for a welfare check this morning. Do not call the house. He asked you not to, and if someone else is listening, I would rather they did not hear us.",
        body: "From SA Teresa Quinlan, FBI Washington Field Office: \"Meridian's Records Administrator until Friday, December 21 was Benjamin Sayer, 58. His signature is on the archive transfers in the Donovan matter. He resigned that afternoon. He lives alone at 4417 North 19th Street, Arlington, Virginia. Home (703) 555-0129. Cell (703) 555-0151, off since Friday. No car registered to him. I have asked Arlington County Police for a welfare check this morning. Don't call the house: he asked you not to, and if anyone else is listening, I'd rather they didn't hear us. T.Q.\"",
      },
      {
        heading: "The legal hold",
        spoken:
          "The legal hold. On Monday, November twenty-sixth, the United States Attorney's Office for the District of Columbia served a preservation letter on Meridian Advisory Group, through its outside counsel, Elena Marchetti. It requires Meridian to keep every record touching the federal investigations that followed our cases in Carroway, Washington and Baltimore. Destroying those records while the hold is in force is a federal crime.",
        body: "Monday, November 26, 2018: the U.S. Attorney's Office for the District of Columbia served a preservation letter (a legal hold) on Meridian Advisory Group through its outside counsel, Elena Marchetti. Meridian must keep every record touching the federal investigations that followed the Carroway, Washington and Baltimore cases. Destroying records under the hold is a federal crime.",
      },
      {
        heading: "Where things stand",
        spoken:
          "Where things stand. Adrian Holt is held without bail in Carroway County. Julian Rourke and Gideon Kane are in federal detention. Elena Marchetti was arrested in New York on Saturday and released on bail on Monday: passport surrendered, an ankle monitor, and no contact with Lockhart Foundation or Meridian personnel. Claire Donovan is cooperating with the FBI in Washington. Malcolm Pryor, Meridian's managing director, has been abroad since Saturday and is represented. Irene Chen, Walter Ames, Simon Wexler and Detective Anthony Caruso of the NYPD all know these cases. Dr. Evelyn Lockhart, who founded Meridian in two thousand seven and left it in two thousand nine, heads the Lockhart Foundation in New York, which is announcing a restructuring this morning.",
        body: "Adrian Holt: held without bail, Carroway County. Julian Rourke and Gideon Kane: federal detention. Elena Marchetti: arrested in New York Saturday, December 22; on bail since Monday, December 24 (passport surrendered, ankle monitor, no contact with Lockhart Foundation or Meridian personnel). Claire Donovan: cooperating with the FBI, Washington. Malcolm Pryor, Meridian's managing director: abroad since December 22, represented. Also on these cases: Irene Chen (attorney, Washington), Walter Ames (forensic accountant to the federal prosecutors), Simon Wexler (New York), Det. Anthony Caruso (NYPD). Dr. Evelyn Lockhart, who founded Meridian in 2007 and left it in 2009, heads the Lockhart Foundation, New York, which announces a restructuring at 10:00 this morning.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. A man who keeps records for a living doesn't write \"find the people who kept the records\" by accident. Start where he lived and where the records burned. Everyone who worked these cases with us is a phone call away, and so am I. B.",
        body: "A man who keeps records for a living doesn't write \"find the people who kept the records\" by accident. Start where he lived and where the records burned. Everyone who worked these cases with us is a phone call away, and so am I. B.",
      },
    ],
  },
];

/* No recorded police interviews in this case: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_quinlan_fire",
    from: "quinlan",
    title: "Call from SA Quinlan: the fire at Chantilly",
    lines: [
      "Quinlan. You've read his email. Here's the rest of it.",
      "The Meridian Records Center in Chantilly burned last night. Bay C, the caged storage. Fairfax County Fire and Rescue had it under control by 1:40 this morning. Those records were under our hold, so the scene is ours now, and the fire marshal is still on site.",
      "Arlington is going to his house this morning. I'll send you what they find.",
      "Go and look at the Records Center. Bring me facts, not adjectives.",
    ],
    effects: [
      {
        note: {
          id: "call:quinlan_fire",
          kind: "call",
          title: "SA Quinlan: the Records Center burned",
          text: "The Meridian Records Center in Chantilly, where Meridian's restricted records were kept, burned overnight. The records were under a federal legal hold; the FBI has the scene and the fire marshal is on site. Arlington County Police are doing a welfare check at Benjamin Sayer's house.",
          characterId: "quinlan",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_donovan_warning",
    from: "donovan",
    title: "Call from Claire Donovan",
    lines: [
      "It's Claire. Claire Donovan. I'm sorry, I didn't know who else to call.",
      "A text came to my phone at 2:15. No name, no number I know. Three words. \"Some records burn.\"",
      "I heard about Chantilly. I used to pull files from that building. I'm at the field office in Washington. Agent Quinlan says I can talk to you, here or on the phone.",
    ],
    effects: [
      {
        note: {
          id: "call:donovan_warning",
          kind: "call",
          title: "Claire Donovan: \"Some records burn\"",
          text: "Claire Donovan, the former Meridian records analyst cooperating with the FBI, received an anonymous text at 2:15 PM: \"Some records burn.\" She can be interviewed at the FBI Washington Field Office or by phone.",
          characterId: "donovan",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_marchetti_contact",
    from: "marchetti",
    title: "Call from Elena Marchetti",
    lines: [
      "This is Elena Marchetti. My attorney is on the line, and he would like me to say as little as possible on a telephone.",
      "I understand you are looking at what happened in Chantilly. I may be able to help you with part of it. Not all of it.",
      "Come to my office in Midtown. My counsel will be present, and the conditions of my bail will be observed. I won't discuss anything else on this line.",
    ],
    effects: [
      {
        note: {
          id: "call:marchetti_contact",
          kind: "call",
          title: "Elena Marchetti will meet, with limits",
          text: "Elena Marchetti, Meridian's outside counsel, now on bail, will meet at her Midtown law office with her defense counsel present.",
          characterId: "marchetti",
        },
      },
    ],
  },
  {
    id: "call_bennett_ridge",
    from: "bennett",
    title: "Call from Bennett: Juniper Gap Road",
    lines: [
      "Bennett. Burkholder's tenant house, up on Juniper Gap Road. That's the place. A quiet winter, cash for six months, no phone and no signal.",
      "And Burkholder's trail camera caught a truck on his lane this morning that isn't anybody's he knows. Somebody got there before us.",
      "Go. Look before you knock. And when you know what you're looking at, call Quinlan. She'll want a reason she can put in writing.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_ridge",
          kind: "call",
          title: "Bennett: the place in Fulton County",
          text: "The tenant house on the Burkholder farm, Juniper Gap Road, Fulton County, Pennsylvania, fits Benjamin's route. Someone else may be watching it. SA Quinlan can send help once there is a reason to.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_recovery",
    from: "quinlan",
    title: "Call from SA Quinlan: the recovery",
    lines: [
      "Quinlan. We have him.",
      "State Police and our people went up the lane at 1:52. Two men at a Tahoe registered to Pike Risk Services, detained without a shot fired. Benjamin was in the root cellar. He'd barricaded himself in. He's cold and he's tired and he's not hurt.",
      "The drive came out with him. Irene Chen watched us seal it. Nobody opens it until it's at a laboratory with one of our examiners in the room.",
      "The two men's phones are with me. Ask, and I'll send them to CART. Then come to the field office. He'll talk to you.",
    ],
    effects: [
      {
        note: {
          id: "call:recovery",
          kind: "call",
          title: "SA Quinlan: Benjamin is safe",
          text: "The FBI and Pennsylvania State Police brought Benjamin Sayer out of the tenant house unharmed. Two men were detained at a Tahoe registered to Pike Risk Services. The drive was sealed into evidence in front of his counsel. Benjamin can be interviewed at the FBI Washington Field Office; the men's phones can go to the FBI's examiners.",
          characterId: "quinlan",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_quinlan_authenticated",
    from: "quinlan",
    title: "Call from SA Quinlan: the archive",
    lines: [
      "Quinlan, from Baltimore. It's genuine.",
      "Every digest on that drive matches his handwritten ledger, and they match Meridian's own November backup, and the scraps that came out of Bay C match the scans. Dr. Solvang won't use the word proof. She'll use the word consistent, all day long.",
      "The printouts are on the light table here. And the subpoena returns came in this morning: the foundation's courier account and its phone records. I've sent them to your desk.",
      "Read it all before anybody tells you what it means.",
    ],
    effects: [
      {
        note: {
          id: "call:quinlan_authenticated",
          kind: "call",
          title: "SA Quinlan: the archive is genuine",
          text: "The imaged archive matches Benjamin's custody ledger, Meridian's last backup and the fragments recovered from Bay C. The printed exhibits are on the light table at the Solvang Document Laboratory. Subpoena returns have arrived at the office.",
          characterId: "quinlan",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_caruso_storage",
    from: "caruso",
    title: "Call from Det. Caruso: Long Island City",
    lines: [
      "Caruso. You'll want to hear this one.",
      "Building super in Long Island City called the precinct this morning. Meridian kept an office on the fourth floor of an old printing plant on Skillman Avenue. Closed it last year, still pays the lease. Overnight Thursday, men and boxes went up in the freight elevator. And there's a shredding truck booked for Monday.",
      "We're holding the floor for your federal friends. Nobody's touching a box. Come see.",
    ],
    effects: [
      {
        note: {
          id: "call:caruso_storage",
          kind: "call",
          title: "Det. Caruso: boxes in Long Island City",
          text: "Meridian's former New York office in Long Island City, closed in 2017 but still leased: men moved boxes in overnight, and a shredding truck is booked for Monday, December 31. The NYPD is holding the floor.",
          characterId: "caruso",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_quinlan_interview",
    from: "quinlan",
    title: "Call from SA Quinlan: 26 Federal Plaza",
    lines: [
      "Quinlan. Dr. Lockhart's attorneys called the U.S. Attorney an hour ago. She has offered a voluntary interview. Four o'clock, at our New York office, 26 Federal Plaza.",
      "Voluntary means she can stand up and leave whenever she likes. Her counsel will be next to her. I'll be in the room.",
      "Bring what you can show her, one page at a time. Don't expect a confession. Don't need one.",
    ],
    effects: [
      {
        note: {
          id: "call:quinlan_interview",
          kind: "call",
          title: "SA Quinlan: a voluntary interview",
          text: "Dr. Evelyn Lockhart has agreed to a voluntary interview with counsel at the FBI New York Field Office, 26 Federal Plaza, at 4:00 PM on Sunday. SA Quinlan will be present.",
          characterId: "quinlan",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_bennett_copies",
    from: "bennett",
    title: "Call from Bennett: the old files",
    lines: [
      "Bennett. One thing before you go any further.",
      "This case leans on the ones before it. Anything you didn't keep from the earlier files, the people who were there still have copies. Ask them.",
      "I don't pin things for people. But I'll pull a file if you ask me for one.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_copies",
          kind: "call",
          title: "Bennett: the people who were there have copies",
          text: "Anything from the earlier cases that wasn't kept, the people who worked them still have copies: ask them.",
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
      "It's Bennett. Six things on your desk and not one piece of string. I know that look; I wore it for forty years.",
      "Pin what you've got on the case board. When two things belong together, run string between them. The board will tell you when you're onto something.",
      "And another thing. This case leans on the old ones. Anything you didn't keep from the earlier files, the people who were there still have copies. Ask them.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Bennett: use the board, and ask for the old copies",
          text: "Pin the evidence on the case board and connect pieces that belong together. Anything not kept from the earlier cases, the people who were there still have copies.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

export const texts: TextDef[] = [
  { id: "t_quinlan_welfare", from: "quinlan", body: "Arlington's doing the welfare check. I'll send you what they find. T.Q." },
  { id: "t_donovan_warning", from: "donovan", body: "Someone texted me. 'Some records burn.' I'm scared. Call me." },
  { id: "t_recovery", from: "quinlan", body: "We have him. He's safe. Drive's sealed. Come to the field office. T.Q." },
  { id: "t_lab_phones", from: "quinlan", body: "CART's done with the two phones. Extraction report is on your desk. Read who 'CP' is. T.Q." },
  { id: "t_lab_imaging", from: "quinlan", body: "The drive is imaged and the integrity report is on your desk. Dr. Solvang says 'consistent.' T.Q." },
  { id: "t_lab_signatures", from: "quinlan", body: "Dr. Solvang's signature comparison is back. On your desk. She chose her words carefully; read them the same way. T.Q." },
  { id: "t_lab_chain", from: "quinlan", body: "The certified reconstruction of authority is on your desk. Read the limits paragraph first. T.Q." },
  { id: "t_caruso_storage", from: "caruso", body: "LIC super called. Boxes moved in overnight, shredder booked Monday. We're holding the floor." },
];

/* Four lab tests, real time from the moment they are sent. Started in conversation (Quinlan; Benjamin for the imaging). */
export const labs: LabDef[] = [
  {
    id: "phones",
    label: "CART extraction: the contractors' phones",
    seconds: 240,
    rect: LAB_PHONES_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "phones_report" }, { text: "t_lab_phones" }, { message: "The FBI's extraction of the two contractors' phones is back. It's on your phone and your desk." }],
  },
  {
    id: "imaging",
    label: "Imaging the encrypted drive",
    seconds: 300,
    rect: LAB_IMAGING_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "imaging_report" }, { text: "t_lab_imaging" }, { message: "The laboratory's imaging and integrity report on the drive is back. It's on your phone and your desk." }],
  },
  {
    id: "signatures",
    label: "Signature comparison: the A-1 approvals",
    seconds: 240,
    rect: LAB_SIGNATURES_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "signatures_report" }, { text: "t_lab_signatures" }, { message: "Dr. Solvang's signature comparison is back. It's on your phone and your desk." }],
  },
  {
    id: "chain",
    label: "Certified reconstruction of authority",
    seconds: 300,
    rect: LAB_CHAIN_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "chain_report" }, { text: "t_lab_chain" }, { message: "The certified reconstruction of authority is back. It's on your phone and your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "benjamin_letter",
    title: "A letter postmarked Silver Spring",
    exterior: "A plain white envelope, hand-addressed in small upright handwriting to \"Blackwood Investigations, Pittsburgh field office.\" Postmarked Silver Spring, MD, December 27, 2018. No return address.",
    text: "Three handwritten pages, folded once, signed \"B. S.\"",
    evidence: ["E010"],
  },
  {
    id: "recovery_report",
    title: "Operation summary: Juniper Gap Road",
    exterior: "An FBI Washington Field Office envelope, sent on by SA Quinlan: \"For the retained investigators. T.Q.\"",
    text: "SA Quinlan's note: \"Everybody walked out. That's the only line in here I care about tonight. T.Q.\"",
    evidence: ["E027"],
  },
  {
    id: "subpoena_return",
    title: "Subpoena returns: courier and telephone",
    exterior: "A banker's box of FBI subpoena returns with a summary sheet clipped to the lid: \"Capital Courier acct 18850; Lockhart Foundation telephone. Compiled for the investigators.\"",
    text: "SA Quinlan's note: \"Dates and numbers only. What they mean is your department. T.Q.\"",
    evidence: ["E042"],
  },
  {
    id: "phones_report",
    title: "CART extraction report: two prepaid phones",
    exterior: "An FBI Computer Analysis Response Team folder, sent on by SA Quinlan, and the same report in your email.",
    text: "SA Quinlan's note: \"Seven messages and a phone number. A jury can count to seven. T.Q.\"",
    evidence: ["E020"],
  },
  {
    id: "imaging_report",
    title: "Laboratory report: imaging and integrity",
    exterior: "A Solvang Document Laboratory folder from Baltimore, countersigned by the FBI's examiner.",
    text: "Dr. Solvang's covering line: \"Authenticity is a chain. These are its links. I. S.\"",
    evidence: ["E030"],
  },
  {
    id: "signatures_report",
    title: "Laboratory report: signature comparison",
    exterior: "A Solvang Document Laboratory folder, sealed, marked \"Forensic document examination.\"",
    text: "Dr. Solvang's covering line: \"Support, not certainty. Please quote me exactly. I. S.\"",
    evidence: ["E041"],
  },
  {
    id: "chain_report",
    title: "Certified reconstruction of authority",
    exterior: "A thick Solvang Document Laboratory binder with the FBI's certification sheet on top.",
    text: "SA Quinlan's note: \"This is what the records show, and the last paragraph is what they don't. Both halves go to the U.S. Attorney. T.Q.\"",
    evidence: ["E057"],
  },
  {
    id: "final_reconstruction",
    title: "Final evidentiary reconstruction",
    exterior: "A bound Blackwood Investigations report, Series S001, with the agency's seal and a routing slip to the United States Attorney.",
    text: "Bennett's note on the routing slip: \"You built this. Read it once more before it goes. B.\"",
    evidence: ["E060"],
  },
];

const call = (id: string): Condition => ({ callAnswered: id });

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C06",
    title: "The archive fire",
    characterId: "quinlan",
    requires: briefed,
    onActivate: [
      { incomingCall: "call_quinlan_fire" },
      { text: "t_quinlan_welfare" },
      { unlockLocation: "records_center" },
      { message: "Your phone is ringing: SA Quinlan. The Meridian Records Center in Chantilly is now on your map." },
    ],
    complete: call("call_quinlan_fire"),
    notebook: {
      call: "call_quinlan_fire",
      learned: [
        { text: "The Meridian Records Center in Chantilly, Virginia, where Meridian's restricted records were kept, burned overnight. The FBI has the scene." },
        { text: "Arlington County Police are doing a welfare check at Benjamin Sayer's house." },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C06",
    title: "Claire receives a warning",
    characterId: "donovan",
    requires: { any: [{ hasEvidence: "E012" }, { hasEvidence: "E013" }] },
    onActivate: [{ incomingCall: "call_donovan_warning" }, { text: "t_donovan_warning" }, { message: "Your phone is ringing: Claire Donovan." }],
    complete: call("call_donovan_warning"),
    notebook: {
      call: "call_donovan_warning",
      learned: [
        { text: "Claire Donovan received an anonymous text at 2:15 PM: \"Some records burn.\"" },
        { text: "She can be interviewed at the FBI Washington Field Office or by phone.", requires: call("call_donovan_warning") },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C06",
    title: "Pike changes his story",
    characterId: "pike",
    requires: { any: [{ deduction: "D06" }, { all: [{ asked: "pike_assignment" }, { hasEvidence: "E017" }] }] },
    onActivate: [{ setFlag: "pike_admits" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Faced with his own engagement, Conrad Pike no longer says he was \"just reviewing security.\" He now says he was lawfully retained on December 22 to recover company records a former employee took, and to locate him discreetly." },
        { text: "He calls the December 26 disposal a scheduled records action under counsel's instruction." },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C06",
    title: "The safe apartment was compromised",
    characterId: "sayer",
    requires: { any: [{ deduction: "D07" }, { hasEvidence: "E023" }] },
    onActivate: [
      {
        note: {
          id: "event:glenmore_concierge",
          kind: "event",
          title: "A note from the Glenmore concierge",
          text: "Ahmed Siddiqui, night concierge at Glenmore Court, adds a line for the investigator: the two men who came through at 2:10 AM on Friday used the guest's own code, 4471, and went straight to 3C. Whoever sent them knew the address and the code.",
        },
      },
      { message: "A note from the Glenmore Court concierge has been added to your notebook." },
    ],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Two men entered Glenmore Court Unit 3C at 2:10 AM on Friday, December 28, on Benjamin's guest code, thirty-five minutes after he left by the garage ramp." },
        { text: "The pursuit followed Benjamin to Silver Spring." },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C06",
    title: "Elena requests contact",
    characterId: "marchetti",
    requires: { deduction: "D04" },
    onActivate: [{ incomingCall: "call_marchetti_contact" }, { unlockLocation: "marchetti_office" }, { message: "Your phone is ringing: Elena Marchetti." }],
    complete: call("call_marchetti_contact"),
    notebook: {
      call: "call_marchetti_contact",
      learned: [{ text: "Elena Marchetti will meet at her Midtown law office, with her defense counsel present and within the conditions of her bail." }],
    },
  },
  {
    id: "RE06",
    caseId: "S001C06",
    title: "The Records Center closes to walk-in",
    characterId: "quinlan",
    requires: { deduction: "D05" },
    onActivate: [
      { setFlag: "records_sealed" },
      { message: "The FBI has sealed the Meridian Records Center as a crime scene. You can still reach everything there under the evidence tent." },
    ],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "The FBI has sealed the Records Center as a crime scene. The dock office, the security office and the salvage tables are reached under the FBI's evidence tent." },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "S001C06",
    title: "Benjamin is located",
    characterId: "bennett",
    requires: { all: [{ deduction: "D07" }, { any: [{ hasEvidence: "E025" }, { hasEvidence: "E026" }] }] },
    onActivate: [{ incomingCall: "call_bennett_ridge" }, { unlockLocation: "ridge_property" }, { message: "Your phone is ringing: Bennett. The Burkholder farm in Fulton County is now on your map." }],
    complete: call("call_bennett_ridge"),
    notebook: {
      call: "call_bennett_ridge",
      learned: [
        { text: "Benjamin's route ends at the tenant house on the Burkholder farm, Juniper Gap Road, Fulton County, Pennsylvania." },
        { text: "Someone else may already be watching it.", requires: call("call_bennett_ridge") },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "S001C06",
    title: "Benjamin is recovered",
    characterId: "sayer",
    requires: { all: [{ at: "ridge_property" }, { hasEvidence: "E026" }, { asked: "quinlan_recover" }] },
    onActivate: [
      { incomingCall: "call_recovery" },
      { text: "t_recovery" },
      { delivery: "recovery_report" },
      { message: "Your phone is ringing: SA Quinlan." },
    ],
    complete: call("call_recovery"),
    evidence: ["E027", "E029"],
    notebook: {
      call: "call_recovery",
      delivery: "recovery_report",
      learned: [
        { text: "The FBI and Pennsylvania State Police brought Benjamin Sayer out of the tenant house alive and unharmed. Kurt Sobczak and Travis Dunleavy were detained at Pike's Tahoe." },
        { text: "The drive and Benjamin's custody ledger came out of the root cellar with him.", requires: { hasEvidence: "E029" } },
        { text: "Benjamin can be interviewed at the FBI Washington Field Office, with his counsel present.", requires: call("call_recovery") },
      ],
    },
  },
  {
    id: "RE09",
    caseId: "S001C06",
    title: "The archive is authenticated",
    characterId: "quinlan",
    requires: { all: [{ labReady: "imaging" }, { deduction: "D10" }] },
    onActivate: [
      { incomingCall: "call_quinlan_authenticated" },
      { setFlag: "archive_open" },
      { delivery: "subpoena_return" },
      { message: "Your phone is ringing: SA Quinlan, from the laboratory." },
    ],
    complete: call("call_quinlan_authenticated"),
    evidence: ["E042"],
    notebook: {
      call: "call_quinlan_authenticated",
      delivery: "subpoena_return",
      learned: [
        { text: "The archive is genuine and corroborated: it matches Benjamin's ledger, Meridian's last backup and the fragments from Bay C." },
        { text: "The printed exhibits from the archive are on the light table at the Solvang Document Laboratory, Baltimore." },
        { text: "Subpoena returns for the Lockhart Foundation's courier account and telephones have arrived.", requires: { hasEvidence: "E042" } },
      ],
    },
  },
  {
    id: "RE10",
    caseId: "S001C06",
    title: "Evelyn's identity is confirmed",
    characterId: "lockhart",
    requires: { deduction: "D16" },
    onActivate: [
      {
        note: {
          id: "event:architect_identity",
          kind: "event",
          title: "A-1",
          text: "The Chair, code A-1, whom the operators knew only as the Architect, is Dr. Evelyn Lockhart.",
          characterId: "lockhart",
          important: true,
        },
      },
    ],
    complete: { always: true },
    notebook: {
      learned: [{ text: "A-1, the Architect, is Dr. Evelyn Lockhart. What she will say to it is another matter." }],
    },
  },
  {
    id: "RE11",
    caseId: "S001C06",
    title: "Evelyn attempts final concealment",
    characterId: "caruso",
    requires: { deduction: "D21" },
    onActivate: [
      { incomingCall: "call_caruso_storage" },
      { text: "t_caruso_storage" },
      { setFlag: "final_concealment" },
      { unlockLocation: "storage_office" },
      { message: "Your phone is ringing: Det. Caruso. Meridian's former New York office is now on your map." },
    ],
    complete: call("call_caruso_storage"),
    evidence: ["E053", "E054", "E059"],
    notebook: {
      call: "call_caruso_storage",
      learned: [
        { text: "Boxes were moved overnight into Meridian's former New York office in Long Island City, and a shredding truck was booked for Monday, December 31. The NYPD is holding the floor." },
        { text: "Among the cartons: the Chair's own files.", requires: { any: [{ hasEvidence: "E053" }, { hasEvidence: "E054" }, { hasEvidence: "E059" }] } },
      ],
    },
  },
  {
    id: "RE12",
    caseId: "S001C06",
    title: "The final confrontation",
    characterId: "lockhart",
    requires: { all: [{ deduction: "D22" }, { hasEvidence: "E059" }, claimsReady] },
    onActivate: [
      { incomingCall: "call_quinlan_interview" },
      { setFlag: "confront_ready" },
      { unlockLocation: "interview_room" },
      { message: "Your phone is ringing: SA Quinlan. 26 Federal Plaza is now on your map." },
    ],
    // The interview has taken place once something specific has been put in front of her across the table.
    complete: {
      all: [
        { at: "interview_room" },
        { any: ["E038", "E041", "E031", "E057", "E059", "E052", "E037", "E053", "E054"].map((e) => ({ presented: `lockhart:${e}` })) },
      ],
    },
    onComplete: [{ delivery: "final_reconstruction" }, { message: "The final evidentiary reconstruction has been assembled. It's on your desk." }],
    evidence: ["E060"],
    notebook: {
      call: "call_quinlan_interview",
      delivery: "final_reconstruction",
      learned: [
        { text: "Dr. Evelyn Lockhart agreed to a voluntary interview with counsel at 26 Federal Plaza, New York." },
        { text: "She was shown the records. She did not confess, and nothing she said changes what they show.", requires: { eventState: "RE12", is: "completed" } },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Objectives and chapters (C006's system). Primary objectives follow the
// design's chapter table; a chapter closes when the next one "opens" in it.
// ---------------------------------------------------------------------------

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Last Record
  { id: "o1_casefile", text: "Read the case file on your desk.", visible: { always: true }, done: briefed },
  { id: "o1_home", text: "Search Benjamin Sayer's house in Arlington.", visible: briefed, done: { visited: "sayer_home" } },
  { id: "o1_kept", text: "Establish what Benjamin kept.", visible: briefed, done: { deduction: "D03" } },
  { id: "o1_fire", text: "Look into the fire at the Records Center.", visible: { event: "RE01" }, done: { visited: "records_center" } },
  { id: "o1_destroyed", text: "Establish whether the records were destroyed on purpose.", visible: { event: "RE01" }, done: { deduction: "D04" } },
  { id: "o1_opt_left", text: "Optional: work out whether Benjamin left or was taken.", visible: briefed, done: { deduction: "D01" } },
  { id: "o1_opt_board", text: "Optional: connect evidence on the case board.", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },

  // Chapter 2: The People Who Know
  { id: "o2_process", text: "Reconstruct how the records were kept and approved.", visible: { chapter: 2 }, done: { all: [{ deduction: "D03" }, { any: [{ talkedTo: "corbett" }, { talkedTo: "oduya" }] }] } },
  { id: "o2_people", text: "Interview the people who worked with Benjamin.", visible: { chapter: 2 }, done: { all: [{ talkedTo: "donovan" }, { any: [{ talkedTo: "corbett" }, { talkedTo: "oduya" }] }] } },
  { id: "o2_pike", text: "Find out who was sent after the records, and on whose authority.", visible: { chapter: 2 }, done: { deduction: "D06" } },
  { id: "o2_coordinated", text: "Establish whether the shredding and the fire were connected.", visible: { chapter: 2 }, done: { deduction: "D05" } },
  { id: "o2_opt_watched", text: "Optional: find out who was watching the house.", visible: { chapter: 2 }, done: { deduction: "D02" } },

  // Chapter 3: The Hunt
  { id: "o3_route", text: "Reconstruct Benjamin's route.", visible: { chapter: 3 }, done: { deduction: "D07" } },
  { id: "o3_followed", text: "Follow the people following him.", visible: { chapter: 3 }, done: { deduction: "D08" } },
  { id: "o3_located", text: "Find where he has gone.", visible: { chapter: 3 }, done: { event: "RE07" } },
  { id: "o3_recover", text: "Get him out safely.", visible: { chapter: 3 }, done: { event: "RE08" } },
  { id: "o3_archive", text: "Secure the archive.", visible: { chapter: 3 }, done: { hasEvidence: "E029" } },
  { id: "o3_opt_danger", text: "Optional: show the danger he was in.", visible: { chapter: 3 }, done: { deduction: "D09" } },

  // Chapter 4: The Original Orders
  { id: "o4_authentic", text: "Authenticate the archive.", visible: { chapter: 4 }, done: { all: [{ deduction: "D10" }, { event: "RE09" }] } },
  { id: "o4_structure", text: "Reconstruct the authorization structure.", visible: { chapter: 4 }, done: { deduction: "D11" } },
  { id: "o4_funding", text: "Follow the money that paid for the reserved programs.", visible: { chapter: 4 }, done: { deduction: "D12" } },
  { id: "o4_directives", text: "Connect the approvals to the operations they authorized.", visible: { chapter: 4 }, done: { all: [{ deduction: "D13" }, { deduction: "D14" }, { deduction: "D15" }] } },
  { id: "o4_identity", text: "Establish who held the highest code.", visible: { chapter: 4 }, done: { all: [{ deduction: "D16" }, { event: "RE10" }] } },

  // Chapter 5: The Betrayal
  { id: "o5_disclosures", text: "Reconstruct how the earlier records reached Blackwood.", visible: { chapter: 5 }, done: { deduction: "D17" } },
  { id: "o5_watched", text: "Find out whether Blackwood was being watched.", visible: { chapter: 5 }, done: { deduction: "D19" } },
  { id: "o5_targets", text: "Find out why those three were chosen.", visible: { chapter: 5 }, done: { deduction: "D18" } },
  { id: "o5_command", text: "Establish what the records prove about command.", visible: { chapter: 5 }, done: { deduction: "D21" } },
  { id: "o5_concealment", text: "Recover what was hidden last.", visible: { chapter: 5 }, done: { all: [{ event: "RE11" }, { hasEvidence: "E059" }] } },
  { id: "o5_destruction", text: "Establish who ordered the destruction.", visible: { chapter: 5 }, done: { deduction: "D20" } },

  // Chapter 6: The Judas Principle
  { id: "o6_case", text: "Complete the case board.", visible: { chapter: 6 }, done: { deduction: "D22" } },
  { id: "o6_confront", text: "Confront Dr. Lockhart with the records.", visible: { chapter: 6 }, done: { eventState: "RE12", is: "completed" } },
  { id: "o6_report", text: "File the final report from the office.", visible: { chapter: 6 }, done: { flag: "case_closed" } },
];

export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Last Record",
    intro: "A records keeper has written to the agency and then gone silent. Overnight, the building where his records were kept caught fire.",
    objectives: ["o1_casefile", "o1_home", "o1_kept", "o1_fire", "o1_destroyed"],
    optional: ["o1_opt_left", "o1_opt_board"],
    conclusion: "Benjamin Sayer kept something nobody else was meant to keep, and someone wanted the originals gone. But who decided that, and who is looking for him now?",
    summary: "A records keeper has vanished and the archive he guarded has burned. Someone wanted it gone.",
  },
  {
    number: 2,
    title: "The People Who Know",
    intro: "The records are ash, but the people who handled them are not. Former colleagues, contractors and counsel all know a piece of how the system worked.",
    objectives: ["o2_process", "o2_people", "o2_pike", "o2_coordinated"],
    optional: ["o2_opt_watched"],
    complete: { deduction: "D06" },
    conclusion: "Someone was paid to recover what Benjamin took and to find the man who took it. He has a head start. Not much of one.",
    summary: "The destruction was organized, and the man who organized it is still looking for the keeper.",
    onComplete: [{ delivery: "benjamin_letter" }, { message: "A letter postmarked Silver Spring has arrived at the office." }],
  },
  {
    number: 3,
    title: "The Hunt",
    intro: "Benjamin said he would find a way to be found: from the records. So will the people behind him.",
    objectives: ["o3_route", "o3_followed", "o3_located", "o3_recover", "o3_archive"],
    optional: ["o3_opt_danger"],
    complete: { all: [{ event: "RE08" }, { hasEvidence: "E029" }] },
    conclusion: "He is safe, and so is the drive. Now it has to be opened in a way nobody can say was a trick.",
    summary: "The keeper is found alive, and the archive is in hand at last.",
  },
  {
    number: 4,
    title: "The Original Orders",
    intro: "Ten years of approvals, every one in ink, every one logged. The drive has to prove itself before it can prove anything else.",
    objectives: ["o4_authentic", "o4_structure", "o4_funding", "o4_directives", "o4_identity"],
    complete: { deduction: "D16" },
    conclusion: "The code at the top of the register has a name. The question now is what that name did with it, and why the autumn went the way it did.",
    summary: "The register has a name at the top, and it is not the name on any of the earlier cases.",
  },
  {
    number: 5,
    title: "The Betrayal",
    intro: "Every case this autumn began with a record that reached the agency at the right moment. Time to ask who chose the moment.",
    objectives: ["o5_disclosures", "o5_watched", "o5_targets", "o5_command", "o5_concealment", "o5_destruction"],
    complete: { deduction: "D21" },
    conclusion: "The truth was handed over in an order, by a hand, for a reason. What is left is to put it in front of her.",
    summary: "She gave us the truth, in the order that served her, and watched us carry it.",
  },
  {
    number: 6,
    title: "The Judas Principle",
    intro: "Everything the agency has found this year, on two boards. One of them is the case. The other is the series.",
    objectives: ["o6_case", "o6_confront", "o6_report"],
    conclusion: "Series S001 is closed.",
    summary: "The report is filed, and the records have said what they say.",
  },
];

/* The report opens once identity and command are established, the final concealment recovered, and Evelyn confronted (RE12). */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [briefed, { deduction: "D16" }, { deduction: "D21" }, { event: "RE12" }],
};
