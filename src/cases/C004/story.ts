import type {
  CallDef,
  CaptivityDef,
  CaseDefinition,
  Condition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
} from "@/game/engine/types";
import { LAB_WEIGHT_RECT } from "./desk";

/*
 * C004 story content: The Last Broadcast, Chicago, October 1927. A Historical
 * Case File: Blackwood holds the 1927 file and the player is that bureau's
 * investigator. Times follow docs/C004-timeline.md. Nothing in this file names
 * the killer before the investigator has the evidence that does.
 */

export const intro: CaseDefinition["intro"] = [
  {
    heading: "Historical Case File",
    text: "In 1981 Blackwood Investigations acquired the closed files of the Ashby and Lowe Detective Bureau of Chicago, 1911 to 1952. This case is reconstructed from one of them. You are the bureau's investigator, in October 1927.",
  },
  {
    heading: "Saturday, October 22, 1927",
    text: "Room 714, the Haverford Building, West Monroe Street. Nine in the morning. The rain stopped an hour ago, and nobody has told the gutters.",
  },
  {
    text: "The woman across your desk is still in her black coat. Louise Vale, a piano teacher from Hyde Park. Her brother was Arthur Vale. You have heard him; everyone in Chicago has. Last night he was found dead in his own studio at WCRB, with the door barred from the inside, twenty-five minutes after half the city heard him say good evening.",
  },
  {
    text: "'The police think it was Henry, his partner, because they shouted at each other over money. Henry is a fool, but he's not that. On Wednesday Arthur told me he was going to make an announcement on the air that would cost some people their jobs. He never made it. Somebody at that station knows why.' She puts an envelope of bills on the desk. 'Officer Keene sent you the file. He says he isn't sure either.'",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "10:15 PM (Fri)", text: "Friday, October 21. Arthur Vale opens Vale After Dark on WCRB, as listeners hear it.", source: "Case file" },
  { time: "10:40 PM (Fri)", text: "Arthur Vale is found dead in Studio A, the door barred from inside.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Chicago Police file 27-10-2117: Vale, Arthur (copy)",
    dossier: [
      { label: "Case ID", value: "C004" },
      { label: "Case title", value: "The Last Broadcast" },
      { label: "File", value: "Historical Case File, reconstructed by Blackwood" },
      { label: "Classification", value: "Homicide" },
      { label: "Location", value: "WCRB, 412 North Michigan Avenue, Chicago" },
      { label: "Year", value: "1927" },
      { label: "Victim", value: "Arthur Vale, 41" },
      { label: "Client", value: "Louise Vale, the victim's sister" },
      { label: "Police", value: "Officer Thomas Keene, Detective Bureau" },
    ],
    people: ["arthur", "louise", "victor", "henry", "samuel", "clara", "keene"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (Officer Keene)",
        spoken:
          "Chicago Police Department, Detective Bureau. File twenty-seven, ten, twenty-one seventeen. Summary, by Officer Thomas Keene. On Friday night, October the twenty-first, nineteen twenty-seven, at about twenty to eleven, Arthur Vale, forty-one, radio announcer, was found dead in Studio A of station W C R B, on the nineteenth floor of four twelve North Michigan Avenue. The studio door was barred from the inside and had to be forced. Mister Vale had opened his program on the air at a quarter past ten. Death was caused by a blow to the head. No weapon was found in the room.",
        body: "At approx. 10:40 P.M. Fri. Oct. 21, 1927, Arthur Vale, 41, radio announcer, was found dead in Studio A of station WCRB, 19th floor, 412 N. Michigan Ave. The studio door was barred on the inside and was forced by the engineer and the station manager. Vale opened his program, Vale After Dark, on the air at 10:15 P.M. Cause of death: a blow to the head. No weapon found in the room. Police called 10:52 P.M.",
      },
      {
        heading: "The station",
        spoken:
          "The station. W C R B occupies the nineteenth floor. Studio A is where Mister Vale broadcast; Studio B is for the orchestra. Between them is the control room, where the engineer, Samuel Finch, works the board. The station manager is Victor Harlan. His secretary is Miss Clara Whitcomb. All three were on the floor last night.",
        body: "WCRB occupies the 19th floor: Studio A (Vale's), Studio B (orchestra), the control room between them (engineer Samuel Finch), the station office (manager Victor Harlan; secretary Miss Clara Whitcomb), a recording workshop and an equipment storage room. All three staff were on the floor that evening.",
      },
      {
        heading: "Henry Mercer",
        spoken:
          "Henry Mercer, forty-three, Mister Vale's partner in Vale and Mercer Productions, which makes the program and sells it to sponsors. Mercer and Vale argued loudly in the station lobby at about a quarter past eight, over money. Mercer left at twenty to nine. He says he went home. His home has been padlocked by his landlord for a week. He is presently staying at Doyle's, a rooming house on South Halsted Street. He is the Bureau's principal interest.",
        body: "Henry Mercer, 43, Vale's partner in Vale and Mercer Productions (produces the program and sells it to sponsors). Argued loudly with Vale in the lobby approx. 8:15 P.M., over money. Left 8:40 P.M. Says he went 'home'; his apartment at 1140 N. Dearborn has been padlocked by the landlord since Oct. 15. Now rooming at Doyle's, 2214 S. Halsted. Principal interest of the Bureau.",
      },
      {
        heading: "Note (Officer Keene)",
        spoken:
          "A note from Officer Keene. Miss Vale tells me you are working for her. Fine by me. The captain likes Mercer for it, and Mercer lied about where he went, but I've got a dead man behind a barred door and a voice on the radio, and I don't like either of them. I'm at the Detective Bureau, and you can ring me from your office any time. I have the photographs, the coroner's report and the statements. Ask. T. K.",
        body: "Miss Vale says you're working for her. Fine by me. The captain likes Mercer for it, and Mercer lied about where he went. But I've got a dead man behind a barred door and a voice on the radio, and I don't like either of them. I'm at the Detective Bureau on South State Street; ring me from your office any time. I have the photographs, the coroner's report and the statements. Ask. T.K.",
      },
    ],
  },
];

const K = (text: string) => ({ speakerId: "keene", speaker: "Officer Keene", text });
const V = (text: string) => ({ speakerId: "victor", speaker: "Victor Harlan", text });
const S = (text: string) => ({ speakerId: "samuel", speaker: "Samuel Finch", text });
const officer = "Officer Thomas Keene, Chicago Police Detective Bureau";

/* The police stenographer's dictating-machine cylinders from the night: Victor Harlan, then Samuel Finch. */
export const statements: StatementDef[] = [
  {
    characterId: "victor",
    recordedAt: "Fri 10/21/27, 11:40 PM",
    officer,
    tape: "27-10-2117 / Cylinder 1",
    audio: "rec.victor",
    transcript: [
      K("Officer Keene, Detective Bureau, twenty to midnight, WCRB. Mr. Harlan, where were you this evening from half past nine?"),
      V("In my office, Officer, with the month's accounts and the door shut. Until ten past ten. Then I went to the lobby to meet our sponsor, Mr. Hollister."),
      K("And at a quarter past ten?"),
      V("We stood under the lobby loudspeaker and heard Arthur open his program. 'Good evening, Chicago.' He was in fine voice. Mr. Hollister said so."),
      K("When did you know something was wrong?"),
      V("At twenty-five to eleven Finch came for me. Arthur hadn't answered his cue. The door was barred. We put our shoulders to it and it gave at about twenty to."),
      K("Anyone with a reason to hurt him?"),
      V("I hate to say it. Henry Mercer was in the lobby at a quarter past eight, shouting about money. I heard him tell Arthur he'd be sorry."),
    ],
  },
  {
    characterId: "samuel",
    recordedAt: "Fri 10/21/27, 11:55 PM",
    officer,
    tape: "27-10-2117 / Cylinder 2",
    audio: "rec.samuel",
    transcript: [
      K("Mr. Finch, you're the engineer. You were at the board all night?"),
      S("Yes, sir. I didn't leave it. Not once."),
      K("Mr. Vale went on the air at a quarter past ten?"),
      S("Yes, sir. Live. From Studio A. Like every night."),
      K("Then why was the curtain drawn between you?"),
      S("He wanted to rest his voice. For the announcement after. He does that, sometimes. Did that."),
      K("And at twenty-five to eleven?"),
      S("I gave him the cue light for the announcement and nothing happened. I knocked. The door was barred. I went for Mr. Harlan."),
    ],
  },
];

/** People the case refers to by role, never by name, before they are met. */
const stranger = "stranger";

export const calls: CallDef[] = [
  {
    id: "call_keene_board",
    from: "keene",
    title: "Call from Officer Keene",
    lines: [
      "Keene. You've got a stack of paper on this by now and nothing on your wall.",
      "Pin it up. Every piece. Then run string between any two that belong together: a schedule and the card that changed it, a record and the record that contradicts it.",
      "The captain made up his mind with one piece of paper. Don't you do that. When two of them fit, you'll know it.",
    ],
    effects: [
      {
        note: {
          id: "call:keene_board",
          kind: "call",
          title: "Officer Keene: use the board",
          text: "Pin the evidence on the murder board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "keene",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_louise",
    from: "louise",
    title: "Call from Louise Vale",
    lines: [
      "It's Louise Vale. I'm sorry to ring you, but I've just found something and I don't know what to do with it.",
      "A letter came from Arthur on Thursday. I put it on the piano to read with my tea, and then the telephone rang about him, and I never opened it. I've opened it now.",
      "It's about the station's books, and it says Friday night. Please come to the house. I don't want to read it out over a party line.",
    ],
    effects: [
      { setFlag: "letter_found" },
      { timeline: { time: "Wed Oct 19", text: "Arthur writes to Louise about the station's books and an announcement on Friday night.", source: "Louise Vale (telephone)" } },
    ],
  },
  {
    id: "call_rose",
    from: "rose",
    title: "Call from Rose Marlowe",
    lines: [
      "It's Rose Marlowe. I haven't slept, and I think it's because of something you asked me.",
      "When I stopped at his door on Friday, at twenty-five to ten, Arthur read me his opening. He'd changed a line. He said it was raining now, so he'd better tell them so. He'd crossed out 'clear as a bell.'",
      "And my landlady heard the program at a quarter past ten, and she says he said the sky was clear as a bell. That's not what he read me. I'm writing it all down for you. A boy will bring it round.",
    ],
    effects: [
      { delivery: "rose_note" },
      { timeline: { time: "9:35 PM (Fri)", text: "Rose Marlowe talks with Arthur Vale at the Studio A door. He has rewritten his opening: 'it's raining on the Loop.'", source: "Rose Marlowe (telephone)" } },
    ],
  },
  {
    id: "call_warning",
    from: stranger,
    title: "Call from a man who doesn't give his name",
    lines: [
      "You the one asking about the Blue Lantern? Don't hang up. Listen.",
      "Radio's a dangerous business. A man can get hurt in a radio station, and there's a lot of cold water between here and the lake.",
      "Stay off the river. Go back to finding husbands for the wives who pay you. That's free advice. The next kind isn't.",
    ],
    effects: [
      { setFlag: "warned" },
      { timeline: { time: "Mon Oct 24", text: "An anonymous caller warns the investigator to 'stay off the river.'", source: "Telephone" } },
    ],
  },
  {
    id: "call_clara",
    from: "clara",
    title: "Call from Clara Whitcomb",
    lines: [
      "Miss Whitcomb, from WCRB. I heard what happened to you last night. I'm so glad you're all right.",
      "There's something I should have told you. On Saturday morning Mr. Harlan had a locksmith change the lock on the equipment storage room, first thing, and kept the only key.",
      "And when I took the locksmith in, the little brass buttons on that panel by the cables had been oiled. Shining wet. Nobody oils anything in that room. I thought you should know.",
    ],
    effects: [
      { setFlag: "clara_panel" },
      { timeline: { time: "9:00 AM (Sat)", text: "Victor Harlan has the lock on the equipment storage room changed and keeps the only key.", source: "Clara Whitcomb (telephone)" } },
    ],
  },
  {
    id: "call_keene_safe",
    from: "keene",
    title: "Call from Officer Keene",
    lines: [
      "Keene. I read the book you brought out of that warehouse, twice. It was enough for a judge.",
      "We opened Victor Harlan's office safe at WCRB this morning. Under the station's bonds there was one sheet of paper in his own hand, squaring the Blue Lantern money month by month. I'm sending you a copy.",
      "Harlan is downtown in a room with a lawyer. Russo's place was closed when we got there. Come and see me.",
    ],
    effects: [
      { setFlag: "victor_arrested" },
      { delivery: "safe" },
      { timeline: { time: "Tue Oct 25", text: "Police open Victor Harlan's office safe at WCRB and take him into custody.", source: "Officer Keene (telephone)" } },
    ],
  },
  // Overheard at Riverside Shipping, through the storeroom door.
  {
    id: "overheard_1",
    from: "sal",
    title: "Voices outside the storeroom door",
    overheard: true,
    speakers: ["sal", "augie", "sal", "augie", "sal", "augie", "sal", "augie", "sal"],
    lines: [
      "He's awake. I heard him.",
      "So he's awake. Door's locked. What's he gonna do, fly out the window into the river?",
      "Harlan's coming himself. Midnight. Nobody touches him till then. Harlan's orders.",
      "What's Harlan want with him?",
      "Ask Harlan. I don't ask Harlan nothing.",
      "And the book? We moving the book?",
      "The book stays up here, in the office. D.R. says. Nobody touches the book either.",
      "I got the dock rounds at the half hour.",
      "Then do your rounds. I'll be down at the gate waiting on the car.",
    ],
    effects: [{ setFlag: "overheard" }],
  },
  {
    id: "overheard_2",
    from: "augie",
    title: "Voices outside the storeroom door, later",
    overheard: true,
    speakers: ["augie", "sal", "augie"],
    lines: [
      "Half past. I'm going down to do the bays.",
      "Take the lamp. And check the chain on nine, it's loose again.",
      "Nine. Yeah, yeah. Back in twenty minutes.",
    ],
    effects: [{ setFlag: "guard_away" }],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

/* The City Chemist's test: real time from the moment Officer Keene sends it; the report arrives on the office desk. */
export const labs: LabDef[] = [
  {
    id: "weight",
    label: "City Chemist: the brass counterweight",
    seconds: 180,
    rect: LAB_WEIGHT_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_weight" }, { message: "The City Chemist's report on the brass counterweight is on your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "samuel_card",
    title: "Envelope from Samuel Finch",
    exterior: "A WCRB envelope, hand-addressed in a cramped, careful hand and brought up by a messenger boy, who did not wait.",
    text: "Inside, a program card from the control room clipboard, with a note clipped to it.",
    evidence: ["E05"],
  },
  {
    id: "rose_note",
    title: "Note from Rose Marlowe",
    exterior: "An envelope of the Starlight Orchestra's lavender notepaper, addressed in green ink.",
    text: "Two pages in green ink, written fast.",
    evidence: ["E21"],
  },
  {
    id: "lab_weight",
    title: "City Chemist's report",
    exterior: "A police department envelope stamped OFFICE OF THE CITY CHEMIST.",
    text: "Officer Keene's note on the envelope: 'Marchetti ran your brass weight. Read what it says and what it doesn't. T.K.'",
    evidence: ["E19"],
  },
  {
    id: "safe",
    title: "Copy from Victor Harlan's safe",
    exterior: "A Detective Bureau envelope, sealed, marked 'Copy. Harlan, V. Safe.'",
    text: "Officer Keene's note: 'Photostat of the one sheet that matters. The original is in our property room. T.K.'",
    evidence: ["E28"],
  },
];

/* Someone has gone to the meeting and is being held right now. */
const held: Condition = { flag: "held" };

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "C004",
    title: "Arthur's letter",
    characterId: "louise",
    requires: { all: [{ talkedTo: "louise" }, { any: [{ hasEvidence: "E13" }, { asked: "louise_announcement" }] }] },
    activate: { all: [{ at: "office" }, { not: held }] },
    onActivate: [{ incomingCall: "call_louise" }, { message: "Telephone ringing at the office." }],
    complete: { callAnswered: "call_louise" },
    notebook: {
      call: "call_louise",
      learned: [
        { text: "Arthur Vale posted a letter to his sister on Thursday morning. She has only now opened it.", requires: { callAnswered: "call_louise" } },
        { text: "Arthur had found that the station's books didn't match what went out on the air, and meant to say so on Friday night.", requires: { hasEvidence: "E12" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C004",
    title: "Rose remembers the weather",
    characterId: "rose",
    requires: { all: [{ talkedTo: "rose" }, { any: [{ hasEvidence: "E06" }, { hasEvidence: "E07" }] }] },
    activate: { all: [{ at: "office" }, { not: held }] },
    onActivate: [{ incomingCall: "call_rose" }, { message: "Telephone ringing at the office." }],
    complete: { hasEvidence: "E21" },
    evidence: ["E21"],
    notebook: {
      call: "call_rose",
      delivery: "rose_note",
      learned: [
        { text: "At 9:35 PM Arthur read Rose his rewritten opening: 'it's raining on the Loop.' He had crossed out 'clear as a bell.'", requires: { callAnswered: "call_rose" } },
        { text: "Listeners heard 'clear as a bell' at 10:15.", requires: { hasEvidence: "E21" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "C004",
    title: "The engineer's card",
    characterId: "samuel",
    // Samuel cracks once the investigator holds the log or the chart he knows will give him away.
    requires: { all: [{ talkedTo: "samuel" }, { hasEvidence: "E04" }, { any: [{ hasEvidence: "E08" }, { hasEvidence: "E09" }] }] },
    activate: { all: [{ at: "office" }, { not: held }] },
    onActivate: [{ delivery: "samuel_card" }, { message: "A messenger has left an envelope from WCRB on your desk." }],
    complete: { hasEvidence: "E05" },
    evidence: ["E05"],
    notebook: {
      delivery: "samuel_card",
      learned: [
        { text: "Samuel Finch sent the 10:15 program card from his clipboard, rewritten by hand at 9:05 PM.", requires: { deliveryOpened: "samuel_card" } },
        { text: "Samuel says he played disc A-114 at 10:15 on those instructions, and lied to the police to keep his license.", requires: { hasEvidence: "E05" } },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "C004",
    title: "A warning",
    characterId: stranger,
    requires: { any: [{ hasEvidence: "E15" }, { deduction: "D09" }] },
    activate: { all: [{ at: "office" }, { not: held }] },
    onActivate: [{ incomingCall: "call_warning" }, { message: "Telephone ringing at the office." }],
    complete: { callAnswered: "call_warning" },
    notebook: {
      call: "call_warning",
      learned: [{ text: "A man who would not give his name telephoned to warn you away from the river.", requires: { callAnswered: "call_warning" } }],
    },
  },
  {
    id: "RE05",
    caseId: "C004",
    title: "The invitation",
    characterId: "frankie",
    requires: { all: [{ callAnswered: "call_warning" }, { hasEvidence: "E23" }, { hasEvidence: "E25" }] },
    activate: { all: [{ at: "office" }, { not: held }] },
    onActivate: [{ setFlag: "invitation" }, { message: "Monday, October 24, evening. Someone has pushed an envelope under the office door." }],
    complete: { any: [held, { flag: "captivity_over" }] },
    notebook: {
      learned: [
        { text: "An envelope under the office door, signed F.M.: 'I have the shipment books. Riverside Shipping, 11 tonight. Come alone.'" },
        { text: "The meeting was a trap.", requires: { any: [held, { flag: "captivity_over" }] } },
        { text: "Frankie Moretti did not write the note. His initials were used to bring you there.", requires: { asked: "frankie_note" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "C004",
    title: "The storage room lock",
    characterId: "clara",
    requires: { flag: "captivity_over" },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_clara" }, { message: "Telephone ringing at the office." }],
    complete: { callAnswered: "call_clara" },
    unlocksQuestions: ["clara_panel"],
    notebook: {
      call: "call_clara",
      learned: [
        { text: "On Saturday morning Victor Harlan had the storage room lock changed and kept the only key.", requires: { callAnswered: "call_clara" } },
        { text: "The turn-buttons on the crawlway panel had been oiled.", requires: { callAnswered: "call_clara" } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "C004",
    title: "The safe at WCRB",
    characterId: "keene",
    requires: { all: [{ flag: "captivity_over" }, { hasEvidence: "E24" }] },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_keene_safe" }, { message: "Tuesday, October 25. Telephone ringing at the office." }],
    complete: { hasEvidence: "E28" },
    evidence: ["E28"],
    notebook: {
      call: "call_keene_safe",
      delivery: "safe",
      learned: [
        { text: "With the warehouse ledger, Officer Keene got a warrant for Victor Harlan's office at WCRB." },
        { text: "The safe held a sheet in Harlan's own hand squaring the Blue Lantern money. Harlan is in custody.", requires: { flag: "victor_arrested" } },
      ],
    },
  },
];

/*
 * The meeting at Riverside Shipping. Whoever takes the envelope goes; with
 * nobody else at the table it is an escape, otherwise a rescue (see the
 * captivity scenes in locations.ts). The flags `held` and `captivity_over`
 * and the environment `captivity` are set by the engine.
 */
export const captivity: CaptivityDef = {
  invitation: { all: [{ flag: "invitation" }, { not: held }, { not: { flag: "captivity_over" } }] },
  start: "wh_storeroom",
  captiveScenes: ["wh_storeroom", "wh_tally", "wh_riverdoor"],
  privateEvidence: ["E24", "E26"],
  end: { any: [{ flag: "escaped" }, { flag: "rescued" }] },
  returnTo: "office",
  capture: {
    title: "Riverside Shipping, 11:00 PM",
    text: "The cab leaves you at the Kinzie Street gate. The yard is dark and smells of river. Nobody at the watchman's shed. You call 'F.M.?' once, quietly. Then there is a man close behind you, a hand on your collar, a sack over your head that smells of coffee beans, and stairs, a great many stairs, and a door locking. When the sack comes off you are sitting on a crate in a dark storeroom with your wrists tied in front of you and the river slapping somewhere below.",
  },
  effectsOnCapture: [
    { timeline: { time: "11:00 PM (Mon)", text: "Monday, October 24. The investigator goes to the meeting at Riverside Shipping and does not come back.", source: "Notebook" } },
  ],
  leftMessage: "{name} has taken the envelope and gone to the meeting at Riverside Shipping, alone, as the note asked.",
  endMessage: {
    solo: "You are back at the office, soaked to the knees, with the river still in your ears. Tuesday, October 25, a little after midnight.",
    rescue: "Everyone is back at the office, soaked to the knees. Tuesday, October 25, a little after midnight.",
  },
  effectsOnEnd: [
    { timeline: { time: "11:40 PM (Mon)", text: "A black Packard arrives at Riverside Shipping. Victor Harlan asks for the investigator.", source: "Notebook" } },
  ],
  aloneMessage: "Nobody is coming. You'll have to get yourself out.",
};

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read the police file Officer Keene sent over", visible: { always: true }, done: { flag: "casefile_read" } },
  { id: "o_studio", text: "Examine Studio A at WCRB", visible: { flag: "casefile_read" }, done: { visited: "studio_a" } },
  { id: "o_keene", text: "Ask Officer Keene for the photographs and the coroner's report", visible: { flag: "casefile_read" }, done: { all: [{ hasEvidence: "E01" }, { hasEvidence: "E02" }] } },
  { id: "o_henry", text: "Find Henry Mercer and hear his side", visible: { flag: "casefile_read" }, done: { talkedTo: "henry" } },
  { id: "o_voice", text: "Find out what listeners actually heard at 10:15", visible: { any: [{ hasEvidence: "E04" }, { hasEvidence: "E22" }] }, done: { deduction: "D03" } },
  { id: "o_board", text: "Connect evidence on the murder board", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },
  { id: "o_lab", text: "Get the brass weight to the City Chemist", visible: { hasEvidence: "E18" }, done: { labStarted: "weight" } },
  { id: "o_money", text: "Follow the Blue Lantern money", visible: { any: [{ hasEvidence: "E12" }, { hasEvidence: "E13" }] }, done: { hasEvidence: "E15" } },
  { id: "o_meeting", text: "Decide who goes to the meeting at Riverside Shipping", visible: { flag: "invitation" }, done: { any: [held, { flag: "captivity_over" }] } },
  { id: "o_out", text: "Get out of Riverside Shipping", visible: held, done: { flag: "captivity_over" } },
  { id: "o_conclude", text: "File your final report from the office desk", visible: { flag: "captivity_over" }, done: { flag: "case_closed" } },
];

/* The report can be opened once the voice on the radio is understood and the night at the warehouse is over. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [{ flag: "casefile_read" }, { deduction: "D03" }, { flag: "captivity_over" }],
};
