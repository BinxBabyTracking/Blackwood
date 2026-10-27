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
import { LAB_BOOTS_RECT, LAB_HAND_RECT } from "./desk";

/*
 * C006 story content: the case file, the 1996 tapes, calls, texts, deliveries,
 * lab tests and the twenty reactive events. Dates follow docs/C006-timeline.md.
 * Every event moves on what the player has done, never on the clock. Chapter
 * gates (the `chapter` condition) keep later developments behind the
 * checkpoints, so nothing from Chapter 3 can happen in Chapter 1.
 */

export const glennDead: Condition = { event: "RE06" };
export const trentArrested: Condition = { flag: "trent_arrested" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Monday, October 22, 2018", text: "Hollow Creek, Pennsylvania. Blackwood's field office, two rooms above a hardware store on Second Street. Rain since dawn." },
  {
    text: "The woman across your desk teaches third grade. She has come straight from school, a canvas tote of papers at her feet. Sarah Lasko. In August 1996 her sister Emily, nineteen, drove away from their house on Fourth Street and was never seen again. The police called her a runaway.",
  },
  {
    text: "Ten days ago three teenagers broke into a welded-shut tool room at the old steel mill. Emily was inside. 'My father said the company did it. He died saying it. I need somebody to find out what really happened to her. Not what's convenient. What happened.'",
  },
  { heading: "Chapter 1: The Girl in the Mill", text: "She leaves you the police report and her phone number. Detective Mitchell, she says, will talk to you." },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "8:30 PM (Sat 8/17/96)", text: "Emily Lasko, 19, leaves home in her car. She is reported missing on Monday.", source: "Case file" },
  { time: "7:52 PM (Fri 10/12/18)", text: "Three teenagers report human remains in a welded-shut tool room at the East Mill.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "The Lasko file: Sarah's request and the discovery report",
    dossier: [
      { label: "Case ID", value: "C006" },
      { label: "Case title", value: "The Hollow Creek Murders" },
      { label: "Classification", value: "Cold case: suspicious death" },
      { label: "Location", value: "Hollow Creek, Pennsylvania" },
      { label: "Year", value: "2018 (missing since 1996)" },
      { label: "Subject", value: "Emily Lasko, 19 in 1996" },
      { label: "Client", value: "Sarah Lasko, her sister" },
      { label: "Police", value: "Det. Dana Mitchell, Hollow Creek PD" },
    ],
    people: ["emily", "sarah", "mitchell", "brooks"],
    peopleHeading: "Persons named in the file",
    evidence: ["E012"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Sarah's request",
        spoken:
          "From Sarah Lasko, four eighteen Fourth Street, Hollow Creek. My sister Emily disappeared on Saturday, August seventeenth, nineteen ninety-six. She was nineteen. The police decided she ran away. On October twelfth her remains were found in a locked room at the East Mill, a mile from our house. I want to know who put her there and why. My father believed the steel company was responsible, because Emily was asking questions about the men who died at the plant that June. I have kept everything of hers. Please start with me.",
        body: "From Sarah Lasko, 418 Fourth Street, Hollow Creek. My sister Emily disappeared on Saturday, August 17, 1996. She was nineteen. The police decided she ran away. On October 12 her remains were found in a locked room at the East Mill, a mile from our house. I want to know who put her there and why. My father believed the steel company was responsible, because Emily was asking questions about the men who died at the plant that June. I have kept everything of hers. Please start with me.",
      },
      {
        heading: "The discovery",
        spoken:
          "Hollow Creek Police report eighteen, ten twelve, oh seven. On Friday, October twelfth, twenty eighteen, at seven fifty-two in the evening, three teenagers exploring the closed East Mill of the old Riverside Works called nine one one. They had broken into a welded-shut tool room in the Maintenance Building and found human remains. The remains were identified on October eighteenth as Emily Lasko. The full report is attached.",
        body: "Hollow Creek Police report 18-1012-07. On Friday, October 12, 2018, at 7:52 PM, three teenagers exploring the closed East Mill of the old Riverside Works called 911. They had broken into a welded-shut tool room in the Maintenance Building and found human remains. The remains were identified on October 18 as Emily Lasko. The full report is attached.",
      },
      {
        heading: "People",
        spoken:
          "People. Sarah Lasko, Emily's sister, and our client. Detective Dana Mitchell of the Hollow Creek Police, who has the case and the nineteen ninety-six file. Doctor Nathan Brooks, the forensic anthropologist at the county medical examiner's office, who examined the remains.",
        body: "Sarah Lasko, Emily's sister, client. Det. Dana Mitchell, Hollow Creek PD: has the case and the 1996 file. Dr. Nathan Brooks, forensic anthropologist, County Medical Examiner: examined the remains.",
      },
      {
        heading: "Note from the agency",
        spoken:
          "A note from the agency. This is the longest file we have opened. Take it a day at a time. Everything you find stays on the board and in your notebook; nothing is lost when you stop for the night. Mitchell's number is in your phone. She'll take your calls.",
        body: "This is the longest file we have opened. Take it a day at a time. Everything you find stays on the board and in your notebook; nothing is lost when you stop for the night. Mitchell's number is in your phone. She'll take your calls.",
      },
    ],
  },
];

const G = (text: string) => ({ speakerId: "granger", speaker: "Det. Sgt. Granger", text });
const W = (text: string) => ({ speakerId: "wade", speaker: "Wade Reeves", text });
const R = (text: string) => ({ speakerId: "rebecca", speaker: "Rebecca Sloan", text });
const officer = "Det. Sgt. Philip Granger, Hollow Creek PD";

/* Two 1996 interview tapes from the Lasko file, digitized by Det. Mitchell and sent to the field office laptop. */
export const statements: StatementDef[] = [
  {
    characterId: "wade",
    recordedAt: "Tue 8/20/96, 2:10 PM",
    officer,
    tape: "HCPD 96-1142 / Tape 1",
    audio: "rec.wade96",
    transcript: [
      G("Tuesday, August twentieth, two ten. Wade Reeves, about Emily Lasko. When did you last see her?"),
      W("Friday night. At the Corner Mart. We had a fight."),
      G("About what?"),
      W("About everything. She's been on this kick all summer about the plant, her dad's stuff. She said she was sick of this town. She was going to Pittsburgh."),
      G("And Saturday?"),
      W("I worked for Gus till six. Then I went home. Watched a movie. Went to bed."),
      G("Your truck?"),
      W("Home. All night. Ask my mom."),
      G("You don't seem worried about her, son."),
      W("She'll call her mom when she cools off. That's what she does."),
    ],
  },
  {
    characterId: "rebecca",
    recordedAt: "Wed 8/21/96, 4:40 PM",
    officer,
    tape: "HCPD 96-1142 / Tape 2",
    audio: "rec.rebecca96",
    transcript: [
      G("Wednesday, August twenty-first, four forty. Rebecca Sloan. You're Emily's friend."),
      R("Her best friend. Since fourth grade."),
      G("Was she supposed to stay with you Saturday night?"),
      R("I didn't know she was coming. I was home all night. By myself."),
      G("She didn't call, didn't page you?"),
      R("No. Nothing. I swear."),
      G("You're shaking a little, Rebecca."),
      R("Because she's missing. Because she wouldn't just go."),
    ],
  },
];

export const calls: CallDef[] = [
  {
    id: "call_board",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. A piece of advice from somebody who's had a corkboard on her wall for twenty years.",
      "Pin what you've got on the board in your office. When two things belong together, run string between them. You'll know when they click.",
      "It costs nothing to be wrong. It costs a lot to keep it all in your head.",
    ],
    effects: [
      { note: { id: "call:board", kind: "call", title: "Mitchell: use the board", text: "Pin evidence on the board in the office and run string between pieces that belong together. When two pieces fit, a deduction follows.", characterId: "mitchell", important: true } },
    ],
  },
  {
    id: "call_ray",
    from: "ray",
    title: "Call from Ray Dalton",
    lines: [
      "This is Ray Dalton. Earl Hayes said you were asking around about the plant. About the Lasko girl.",
      "I was in Gallery B in ninety-six. I'm the one that came out. She came to my house that summer and asked me about it. Nobody else ever did.",
      "I'm at the union hall most afternoons. Seventh Street. Come by.",
    ],
    effects: [
      { setFlag: "ray_called" },
      { timeline: { time: "About 2:40 AM (Fri 6/14/96)", text: "Three men die of gas in Gallery B under Reheat Furnace No. 2. Ray Dalton is pulled out alive.", source: "Ray Dalton (phone)" } },
    ],
  },
  {
    id: "call_karen_borough",
    from: "karen",
    title: "Call from Karen Novak",
    lines: [
      "Karen Novak at the courthouse. You asked me about the plant in ninety-six.",
      "The borough kept its own file on the Riverside Works, separate from ours. It's in the municipal building's basement, and I've got the key to the records room. I pulled it for you. It's thin. Thinner than it ought to be, if you ask me.",
      "It's on the table down there when you want it.",
    ],
    effects: [{ unlockLocation: "borough" }, { setFlag: "borough_open" }],
  },
  {
    id: "call_glenn",
    from: "glenn",
    title: "Voicemail from Glenn Sutter",
    lines: [
      "This is Glenn Sutter. I was maintenance director at the Riverside Works for a long time. I've been reading about the Lasko girl in the paper. I don't know anything about that, I want to be clear about that.",
      "But there are things about ninety-six, about Gallery B, that somebody ought to hear before I'm gone. I'm sixty-nine years old and I'm tired of carrying it.",
      "I'm at home today. 31 Orchard Lane. Don't call Richard Stroud about this. I mean that.",
    ],
    effects: [
      { giveEvidence: "E041" },
      { unlockLocation: "sutter_home" },
      { timeline: { time: "10:09 AM (Wed 10/24/18)", text: "Glenn Sutter leaves a message at the field office: he wants to talk about Gallery B.", source: "E041" } },
    ],
  },
  {
    id: "call_mitchell_glenn",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "It's Mitchell. I'm sorry to do this by phone. Glenn Sutter is dead.",
      "The manager at Creekside Self Storage on 837 found him in his unit at seven thirty this morning. He was beaten. His wallet's gone, so somebody's going to call it a robbery.",
      "He had a ten o'clock with you today, didn't he? Come out to Creekside. I'll hold the scene for you.",
    ],
    effects: [
      { setFlag: "glenn_dead" },
      { unlockLocation: "storage" },
      { timeline: { time: "7:31 AM (Fri 10/26/18)", text: "Glenn Sutter is found dead in Unit 14 at Creekside Self Storage.", source: "Det. Mitchell (phone)" } },
    ],
  },
  {
    id: "call_threat",
    from: "caller",
    title: "Call from an unknown number",
    lines: [
      "That mill is a construction site. It isn't a museum and it isn't your business.",
      "The girl's been found. Her sister can bury her. Leave the rest of it alone.",
    ],
    effects: [
      { setFlag: "threatened" },
      { note: { id: "threat_call", kind: "call", title: "The threatening call", text: "An unknown caller told you to leave the mill alone. The number was blocked. The voice was a man's, low and even.", important: true } },
    ],
  },
  {
    id: "call_len",
    from: "len",
    title: "Voicemail from Len Greer",
    lines: [
      "My name is Leonard Greer. I was the code officer for the borough back in ninety-six. After what happened to Glenn I've been... I have papers. Not at the house.",
      "I'll come to your office tomorrow at ten o'clock. Don't call me back on this line. And don't tell the police yet, I want to talk to you first. Ten o'clock.",
    ],
    effects: [
      { giveEvidence: "E061" },
      { setFlag: "len_called" },
      { timeline: { time: "4:05 PM (Sun 10/28/18)", text: "Len Greer leaves a message: he has papers and will come to the field office Monday at ten.", source: "E061" } },
    ],
  },
  {
    id: "call_mitchell_len",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. I sent a car to Hilltop Road like you asked. Greer's not there.",
      "Front door unlocked, TV on, his car in the driveway. His glasses are on the hall floor. That's not a man who went for a walk.",
      "I've made it a missing person, endangered. I'm at the house. Come now.",
    ],
    effects: [
      { setFlag: "len_missing" },
      { setEnv: "greer_home", to: "B" },
      { timeline: { time: "12:50 PM (Mon 10/29/18)", text: "Police find Len Greer's house open, his car home, his glasses on the floor. He is reported missing, endangered.", source: "Det. Mitchell (phone)" } },
    ],
  },
  {
    id: "call_mitchell_raid",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. Your camp on Laurel Hollow Road got me a warrant. State police are meeting us at the bottom of the road before first light.",
      "You can come. You stay behind me and you don't touch anything until I say so.",
    ],
    effects: [
      { unlockLocation: "laurel_road" },
      { setFlag: "raid_set" },
    ],
  },
  {
    id: "call_jessica_lawyer",
    from: "jessica",
    title: "Call from Jessica Kemp",
    lines: [
      "Jessica Kemp. Heads up. Richard Stroud's lawyer just called my editor, the police chief and the county commissioners in the space of an hour.",
      "You're a 'tabloid outfit exploiting a family's grief to smear a man who has given this town twenty years.' His words. He wants us to stop printing your name.",
      "My editor told him to pound sand. But you should know they're scared.",
    ],
    effects: [
      { setFlag: "stroud_lawyered" },
      { note: { id: "stroud_smear", kind: "call", title: "Stroud's lawyer", text: "Stroud's lawyer called the paper, the police chief and the commissioners to discredit the investigation.", characterId: "stroud", important: true } },
    ],
  },
  {
    id: "call_mitchell_box",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. You saw what came out of Greer's box this morning. I've had copies made of all of it.",
      "It's all paper from ninety-six, and some of it is in Stroud's own hand. They're on your desk.",
    ],
    effects: [{ delivery: "safe_deposit" }],
  },
  {
    id: "call_mitchell_wade",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. I had Wade Reeves in this morning after what you got out of him. On tape, this time.",
      "He's moved the day. Now he says he last saw Emily Saturday afternoon at the garage, and she gave him his ring back. You and I both know where that ring was.",
      "The summary's on your desk.",
    ],
    effects: [{ giveEvidence: "E087" }],
  },
  {
    id: "call_mitchell_mill",
    from: "mitchell",
    title: "Call from Det. Mitchell",
    lines: [
      "Mitchell. The DA wants the East Mill walked through properly before anything goes to a grand jury. Work lights, tape measures, the loft, all of it.",
      "I'd like you there. You've read that building better than anyone. Meet me at the shop floor.",
    ],
    effects: [{ unlockLocation: "mill_reconstruction" }],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

export const texts: TextDef[] = [
  { id: "t_sarah_photo", from: "sarah", body: "I found something in Mom's photo envelopes. I left it at your office. It's Emily in her car." },
  { id: "t_karen_laurel", from: "karen", body: "Trent's company pays taxes on a piece of land I didn't expect. Come see me before four thirty." },
  { id: "t_mitchell_len_found", from: "mitchell", body: "We have him. Alive. Cold and dehydrated but alive. Trent's in custody. Come to the cabin." },
  { id: "t_brooks_bench", from: "brooks", body: "Mitchell sent me the bench measurements. Come by if you want my opinion in writing." },
  { id: "t_evelyn_copies", from: "evelyn", body: "I put something in the mail slot at your office. I should have done it twenty years ago. E.D." },
  { id: "t_evelyn_expense", from: "evelyn", body: "You asked where Mr. Stroud was that August. I booked his trips. It's at your office. E.D." },
  { id: "t_rebecca_denise", from: "rebecca", body: "I called her. Denise. She's sending you something. Please don't tell her I gave you her number." },
];

/* Lab tests, through Det. Mitchell. Real time from the moment she sends them; results arrive on the desk and the phone. */
export const labs: LabDef[] = [
  {
    id: "boots",
    label: "State lab: the Unit 14 boot print",
    seconds: 180,
    rect: LAB_BOOTS_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_boots" }, { message: "The state lab's footwear report is in. It's on your phone and your desk." }],
  },
  {
    id: "handwriting",
    label: "State lab: the handwriting",
    seconds: 180,
    rect: LAB_HAND_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_hand" }, { message: "The questioned documents report is in. It's on your phone and your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "sarah_photo",
    title: "An envelope from Sarah",
    exterior: "A drugstore photo envelope with \"For the investigator, S.L.\" written across it, pushed under the office door.",
    text: "Sarah's note: \"I don't know if this matters. Look at how she's sitting. That's how she always drove.\"",
    evidence: ["E002"],
  },
  {
    id: "evelyn_copies",
    title: "A manila envelope, no return address",
    exterior: "A manila envelope through the mail slot, the flap taped twice. Inside, three office papers from 1996.",
    text: "Evelyn's note on the flap: \"I typed these. I should have done something. E.D.\"",
    evidence: ["E026"],
  },
  {
    id: "evelyn_expense",
    title: "A second envelope from Evelyn",
    exterior: "Another manila envelope, the same handwriting.",
    text: "\"I booked this. He was in Pittsburgh that whole night. I'm sending it because you should know. E.D.\"",
    evidence: ["E089"],
  },
  {
    id: "denise_letters",
    title: "An email from Columbus, Ohio",
    exterior: "An email to the field office from an address you don't know, with three scanned attachments. You print them.",
    text: "\"Rebecca Sloan called me. These are copies. My lawyer has the originals. Please don't call me. D.H.\"",
    evidence: ["E081"],
  },
  {
    id: "safe_deposit",
    title: "Copies from safe deposit box 2214",
    exterior: "A police evidence envelope with a copy log stapled to it, signed by Det. Mitchell.",
    text: "Mitchell's note: \"Box 2214, opened 10/31 with Greer's written consent. Originals logged. Three items. D.M.\"",
    evidence: ["E078", "E094", "E098"],
  },
  {
    id: "lab_boots",
    title: "Lab report: the Unit 14 boot print",
    exterior: "A state police lab report, emailed through Det. Mitchell, and a printed copy on your desk.",
    text: "Mitchell's note: \"Read the conclusion twice. It's good, not perfect. D.M.\"",
    evidence: ["E060"],
  },
  {
    id: "lab_hand",
    title: "Lab report: the handwriting",
    exterior: "A questioned documents report from the state police, emailed through Det. Mitchell.",
    text: "Mitchell's note: \"Two of three are as strong as these people ever say. D.M.\"",
    evidence: ["E099"],
  },
];

/* Chapter 3 begins with Glenn's call; he dies once the player has been to his house and left it, or has asked Stroud about him. */
const metGlennOrMovedOn: Condition = {
  any: [
    { all: [{ visited: "sutter_home" }, { not: { at: "sutter_home" } }] },
    // Calling Stroud instead, against Glenn's wishes, is enough to set it in motion too.
    { all: [{ eventState: "RE05", is: "completed" }, { asked: "stroud_glenn" }, { not: { at: "sutter_home" } }] },
  ],
};

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "C006",
    title: "An overlooked photograph",
    characterId: "sarah",
    requires: { all: [{ talkedTo: "sarah" }, { hasEvidence: "E008" }] },
    onActivate: [{ text: "t_sarah_photo" }, { delivery: "sarah_photo" }],
    complete: { hasEvidence: "E002" },
    evidence: ["E002"],
    notebook: {
      learned: [
        { text: "Sarah found a July 1996 snapshot of Emily in her Cavalier and left it at the office." },
        { text: "Emily drove with the seat pulled all the way forward.", requires: { hasEvidence: "E002" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C006",
    title: "A former worker calls",
    characterId: "ray",
    requires: { chapter: 2 },
    onActivate: [{ incomingCall: "call_ray" }],
    complete: { callAnswered: "call_ray" },
    notebook: {
      call: "call_ray",
      learned: [{ text: "Ray Dalton, the only survivor of Gallery B, says Emily came to his house in the summer of 1996 to ask about it.", requires: { callAnswered: "call_ray" } }],
    },
  },
  {
    id: "RE03",
    caseId: "C006",
    title: "The borough's file",
    characterId: "karen",
    requires: { all: [{ chapter: 2 }, { any: [{ hasEvidence: "E022" }, { hasEvidence: "E024" }, { hasEvidence: "E027" }] }] },
    onActivate: [{ incomingCall: "call_karen_borough" }],
    complete: { callAnswered: "call_karen_borough" },
    evidence: ["E036", "E038"],
    notebook: {
      call: "call_karen_borough",
      learned: [{ text: "Karen Novak found the Borough of Hollow Creek's own file on the Riverside Works for 1996, in the municipal building's basement.", requires: { callAnswered: "call_karen_borough" } }],
    },
  },
  {
    id: "RE04",
    caseId: "C006",
    title: "A witness changes her account",
    characterId: "rebecca",
    requires: { all: [{ chapter: 5 }, { hasEvidence: "E020" }, { hasEvidence: "E085" }] },
    onActivate: [{ message: "The number on Emily's pager was the Valley View Motor Inn. Rebecca Sloan said she was home that night." }],
    complete: { hasEvidence: "E086" },
    unlocksQuestions: ["rebecca_denise"],
    evidence: ["E086"],
    notebook: {
      learned: [
        { text: "The last page on Emily's pager came from the Valley View Motor Inn, room 12, at 7:14 PM." },
        { text: "Rebecca admitted she was at the motel and that Emily called her at 7:40 PM: she was ending it with Wade at nine at the East Gate.", requires: { hasEvidence: "E086" } },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "C006",
    title: "Glenn Sutter asks to talk",
    characterId: "glenn",
    requires: { chapter: 3 },
    onActivate: [{ incomingCall: "call_glenn" }],
    complete: { callAnswered: "call_glenn" },
    evidence: ["E041"],
    notebook: {
      call: "call_glenn",
      learned: [{ text: "Glenn Sutter, the retired maintenance director, wants to talk about Gallery B. He asked you not to call Richard Stroud.", requires: { callAnswered: "call_glenn" } }],
    },
  },
  {
    id: "RE06",
    caseId: "C006",
    title: "Glenn Sutter is found dead",
    characterId: "glenn",
    requires: { all: [{ eventState: "RE05", is: "completed" }, metGlennOrMovedOn] },
    activate: { not: { at: "sutter_home" } },
    onActivate: [{ incomingCall: "call_mitchell_glenn" }, { message: "Friday, October 26. Your phone is ringing: Det. Mitchell." }],
    complete: { callAnswered: "call_mitchell_glenn" },
    notebook: {
      call: "call_mitchell_glenn",
      learned: [
        { text: "Glenn Sutter was found beaten to death in his storage unit at Creekside Self Storage on Friday morning, the day he was to come to the office.", requires: { callAnswered: "call_mitchell_glenn" } },
        { text: "Whoever killed him took his wallet and watch, and left his cash and his car.", requires: { hasEvidence: "E049" } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "C006",
    title: "Police seal Glenn's house",
    characterId: "mitchell",
    requires: glennDead,
    onActivate: [{ setEnv: "sutter_home", to: "B" }, { message: "Police have sealed the Sutter house on Orchard Lane." }],
    complete: { flag: "sutter_released" },
    onComplete: [{ setEnv: "sutter_home", to: "C" }],
    notebook: {
      learned: [
        { text: "After Glenn's death the police sealed his house on Orchard Lane." },
        { text: "Det. Mitchell let you into the house once the storage scene had been worked.", requires: { flag: "sutter_released" } },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "C006",
    title: "A threatening call",
    requires: { all: [{ chapter: 3 }, { any: [{ deduction: "D23" }, { talkedTo: "trent" }] }, glennDead] },
    onActivate: [{ incomingCall: "call_threat" }],
    complete: { callAnswered: "call_threat" },
    notebook: {
      call: "call_threat",
      learned: [{ text: "A blocked caller told you to leave the mill alone. \"The girl's been found. Her sister can bury her.\"", requires: { callAnswered: "call_threat" } }],
    },
  },
  {
    id: "RE09",
    caseId: "C006",
    title: "A truck outside the office",
    requires: { eventState: "RE08", is: "completed" },
    activate: { at: "office" },
    onActivate: [{ setEnv: "office", to: "B" }, { message: "There's a pickup idling across Second Street." }],
    complete: { inspected: "of_window" },
    onComplete: [{ setEnv: "office", to: "A" }],
    notebook: {
      learned: [
        { text: "A black full-size pickup with a roof light bar sat idling across from the office, then pulled away when you came to the window.", requires: { inspected: "of_window" } },
      ],
    },
  },
  {
    id: "RE10",
    caseId: "C006",
    title: "Len Greer calls",
    characterId: "len",
    requires: { chapter: 4 },
    onActivate: [{ incomingCall: "call_len" }],
    complete: { callAnswered: "call_len" },
    onComplete: [{ message: "Len Greer said he'll come to the office Monday at ten. Be there." }],
    evidence: ["E061"],
    notebook: {
      call: "call_len",
      learned: [{ text: "Len Greer, the borough's former code officer, has papers about 1996 and will come to the office Monday at ten.", requires: { callAnswered: "call_len" } }],
    },
  },
  {
    id: "RE11",
    caseId: "C006",
    title: "Len Greer doesn't come",
    characterId: "len",
    requires: { eventState: "RE10", is: "completed" },
    activate: { at: "office" },
    onActivate: [
      { message: "Monday, October 29, 10:40 AM. Len Greer hasn't come, and he doesn't answer his phone." },
      { timeline: { time: "10:00 AM (Mon 10/29/18)", text: "Len Greer misses his appointment at the field office.", source: "You" } },
    ],
    complete: { always: true },
    notebook: { learned: [{ text: "Len Greer missed his ten o'clock and does not answer his phone. You asked Det. Mitchell for a welfare check." }] },
  },
  {
    id: "RE12",
    caseId: "C006",
    title: "The Greer house",
    characterId: "mitchell",
    requires: { eventState: "RE11", is: "completed" },
    onActivate: [{ incomingCall: "call_mitchell_len" }],
    complete: { callAnswered: "call_mitchell_len" },
    evidence: ["E063", "E064", "E065", "E066"],
    notebook: {
      call: "call_mitchell_len",
      learned: [{ text: "Len's house was open, his car in the driveway, his glasses on the hall floor. He is missing, endangered.", requires: { callAnswered: "call_mitchell_len" } }],
    },
  },
  {
    id: "RE13",
    caseId: "C006",
    title: "A property lead",
    characterId: "karen",
    requires: { deduction: "D27" },
    onActivate: [{ text: "t_karen_laurel" }, { unlockQuestion: "karen_trent_land" }],
    complete: { hasEvidence: "E070" },
    evidence: ["E069", "E070"],
    notebook: {
      learned: [
        { text: "Karen Novak found land that Trent's company pays taxes on." },
        { text: "Laurel Hollow Holdings LLC, Michael Trent's, owns a cabin with a cellar at the end of Laurel Hollow Road.", requires: { hasEvidence: "E070" } },
      ],
    },
  },
  {
    id: "RE14",
    caseId: "C006",
    title: "Police go to Laurel Hollow Road",
    characterId: "mitchell",
    requires: { deduction: "D28" },
    onActivate: [{ incomingCall: "call_mitchell_raid" }],
    complete: { visited: "laurel_road" },
    notebook: {
      call: "call_mitchell_raid",
      learned: [
        { text: "On the strength of the property records and the plate reader, Det. Mitchell got a warrant for the camp on Laurel Hollow Road.", requires: { callAnswered: "call_mitchell_raid" } },
      ],
    },
  },
  {
    id: "RE15",
    caseId: "C006",
    title: "Len Greer is found alive",
    characterId: "len",
    requires: { all: [{ eventState: "RE14", is: "completed" }, { hasEvidence: "E071" }] },
    onActivate: [
      { setFlag: "trent_arrested" },
      { unlockLocation: "camp" },
      { text: "t_mitchell_len_found" },
      { setEnv: "trent_office", to: "B" },
      { timeline: { time: "5:55 AM (Tue 10/30/18)", text: "Police find Len Greer alive in the cellar of the Trent camp on Laurel Hollow Road.", source: "Det. Mitchell" } },
      { timeline: { time: "7:45 AM (Tue 10/30/18)", text: "Michael Trent is arrested at his office.", source: "Det. Mitchell" } },
    ],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Before dawn on Tuesday police found Len Greer alive in the cellar of the cabin on Laurel Hollow Road, tied with zip ties. He named Michael Trent." },
        { text: "Michael Trent was arrested at his office that morning and his truck seized." },
      ],
    },
  },
  {
    id: "RE16",
    caseId: "C006",
    title: "Len Greer's statement",
    characterId: "len",
    requires: { eventState: "RE15", is: "completed" },
    onActivate: [{ message: "Len Greer is at Mon Valley Hospital and asking for you. You can call him." }],
    complete: { hasEvidence: "E077" },
    evidence: ["E077"],
    notebook: {
      learned: [
        { text: "Len Greer is in Mon Valley Hospital and wants to make a statement." },
        { text: "Len told how he buried the union's complaint in 1996 for money and a lot, on Stroud's word, and how Trent took him.", requires: { hasEvidence: "E077" } },
      ],
    },
  },
  {
    id: "RE17",
    caseId: "C006",
    title: "Stroud fights back",
    characterId: "stroud",
    requires: { all: [{ chapter: 5 }, { hasEvidence: "E077" }] },
    onActivate: [{ incomingCall: "call_jessica_lawyer" }],
    complete: { callAnswered: "call_jessica_lawyer" },
    notebook: {
      call: "call_jessica_lawyer",
      learned: [{ text: "Stroud's lawyer tried to discredit Blackwood with the paper, the police chief and the commissioners.", requires: { callAnswered: "call_jessica_lawyer" } }],
    },
  },
  {
    id: "RE18",
    caseId: "C006",
    title: "The safe deposit box",
    characterId: "mitchell",
    requires: { all: [{ chapter: 5 }, { hasEvidence: "E077" }] },
    onActivate: [{ incomingCall: "call_mitchell_box" }],
    complete: { hasEvidence: "E078" },
    evidence: ["E078", "E094", "E098"],
    notebook: {
      call: "call_mitchell_box",
      learned: [
        { text: "Len's safe deposit box held his own copy of the 1996 grievance, his passbook and a note from Stroud.", requires: { callAnswered: "call_mitchell_box" } },
        { text: "Len's routing slip says the complaint was filed without referral \"per R.S.\" The company's report of 1996 never mentions any of it.", requires: { hasEvidence: "E078" } },
      ],
    },
  },
  {
    id: "RE19",
    caseId: "C006",
    title: "Wade's account changes",
    characterId: "wade",
    requires: { all: [{ chapter: 5 }, { hasEvidence: "E086" }, { any: [{ hasEvidence: "E082" }, { hasEvidence: "E084" }] }] },
    onActivate: [{ unlockQuestion: "wade_saturday" }],
    complete: { asked: "wade_saturday" },
    onComplete: [{ incomingCall: "call_mitchell_wade" }],
    evidence: ["E087"],
    notebook: {
      call: "call_mitchell_wade",
      learned: [
        { text: "With the motel call and the scrap trail in hand, you have reason to take Wade back through that Saturday." },
        { text: "Wade now says he last saw Emily on Saturday afternoon at the garage, when she gave back his ring. In 1996 he said Friday.", requires: { asked: "wade_saturday" } },
      ],
    },
  },
  {
    id: "RE20",
    caseId: "C006",
    title: "The East Mill, one more time",
    characterId: "mitchell",
    requires: { chapter: 6 },
    onActivate: [{ incomingCall: "call_mitchell_mill" }],
    complete: { visited: "mill_reconstruction" },
    evidence: ["E096", "E097"],
    notebook: {
      call: "call_mitchell_mill",
      learned: [
        { text: "Det. Mitchell asked you to walk the East Mill Maintenance Building with her under work lights, loft included.", requires: { callAnswered: "call_mitchell_mill" } },
      ],
    },
  },
];

/* The final report opens in the last chapter. */
export const reportAvailable: CaseDefinition["reportAvailable"] = { all: [{ chapter: 6 }, { flag: "casefile_read" }, { evidenceCount: 50 }] };
