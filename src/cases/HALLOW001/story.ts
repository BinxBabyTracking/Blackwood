import type {
  CallDef,
  CaseDefinition,
  Condition,
  DeliveryDef,
  DocumentDef,
  Effect,
  LabDef,
  ObjectiveDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
  TextDef,
} from "@/game/engine/types";
import { LAB_PRINT_RECT, REPORT_RECT } from "./desk";
import { alive, craneFree, guarded } from "./rules";

/*
 * HALLOW001 story content. Times follow docs/HALLOW001-timeline.md exactly.
 *
 * The clock starts at 10:32 PM and moves with what the investigators do
 * (index.ts). Lucian Marsh acts on his own (adversary.ts); these events are
 * how the house reacts to what he does and to what the investigators ask the
 * police to do. Lt. Mahoney's two officers can each be posted once.
 */

export const briefed: Condition = { flag: "casefile_read" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Wednesday, October 31, 2018", text: "Blackthorn Estate, Hollins Road, Harrow Falls, Massachusetts. Halloween. Rain since dusk, and fog on the lawns." },
  {
    text: "At 10:24 PM your phone rang at the Harrow Falls Inn, half a mile down the road, where Everett Byrne, attorney to the Blackthorn Foundation, had asked you to wait. Ambrose Blackthorn had wanted investigators close tonight. He had said he was not a brave man.",
  },
  {
    text: "At 10:13 PM, during a masked dinner for twelve guests, every light in the house went out. A scream came from upstairs. When the lights came back seven minutes later, Ambrose Blackthorn was found dead in his study, behind a door bolted from the inside.",
  },
  {
    text: "The table was set for thirteen. Only twelve guests were invited. Some of them remember a woman in a black mourning veil at the foot of the table. Nobody will say who she was. The gate camera says nobody has left. Whoever killed Ambrose is still in the house.",
  },
  {
    text: "The Harrow Falls police are here, two officers. Det. Lt. Joan Mahoney of the State Police is on the phone and on her way, and she has given you the Morning Room. The clock in the top bar is the time in the house: it moves as you work. At midnight there is meant to be a procession.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "9:00 PM", text: "Dinner begins in the dining room. Thirteen places are set.", source: "Case file" },
  { time: "9:45 PM", text: "Ambrose Blackthorn announces he will tell the guests at 10:30 why they are there: something that happened in the house twenty years ago tonight.", source: "Case file" },
  { time: "10:13 PM", text: "The power fails across the house. A scream is heard from upstairs.", source: "Case file" },
  { time: "10:20 PM", text: "The lights come back.", source: "Case file" },
  { time: "10:23 PM", text: "Ambrose Blackthorn is found dead in his study after the bolted door is forced.", source: "Case file" },
  { time: "10:32 PM", text: "Blackwood arrives at the house.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Ambrose Blackthorn, Harrow Falls, Massachusetts",
    dossier: [
      { label: "Case ID", value: "HALLOW001" },
      { label: "Case title", value: "The Thirteenth Guest" },
      { label: "Classification", value: "Locked-room homicide" },
      { label: "Location", value: "Blackthorn Estate, Harrow Falls, Massachusetts" },
      { label: "Date", value: "Wednesday, October 31, 2018" },
      { label: "Victim", value: "Ambrose Blackthorn, 67" },
      { label: "Client", value: "Everett Byrne, for the Blackthorn Foundation" },
      { label: "Police", value: "Det. Lt. Joan Mahoney, Massachusetts State Police" },
    ],
    people: ["ambrose", "crane", "constance", "felix", "harriet", "amos", "bridget", "penrose", "beatrice", "byrne", "iris", "wren", "mahoney"],
    peopleHeading: "Persons in the house",
    evidence: ["HE010"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (Everett Byrne, by phone, 10:24 PM, and Officer Reyes)",
        spoken:
          "Summary. At about ten thirteen tonight, the power failed across Blackthorn Estate during a private Halloween dinner. Guests heard a scream from upstairs. When the lights came back at ten twenty, Felix Blackthorn and the event organizer, Oscar Wren, found the door of Ambrose Blackthorn's study bolted from the inside. They forced it at ten twenty-one and found Mr. Blackthorn on the floor by his desk. Doctor Isaac Penrose, a guest, found no pulse at ten twenty-four. Everett Byrne called nine one one, and then us. Officers Dana Reyes and Tom Kwan of the Harrow Falls police arrived at ten twenty-seven and are holding the guests. The gate camera shows nobody has left.",
        body: "At about 10:13 PM the power failed across Blackthorn Estate during a private Halloween dinner. Guests heard a scream from upstairs. When the lights came back at 10:20 PM, Felix Blackthorn and the event organizer, Oscar Wren, found the study door bolted from the inside. They forced it at 10:21 and found Ambrose Blackthorn on the floor by his desk. Dr. Isaac Penrose, a guest, found no pulse at 10:24. Everett Byrne called 911, then Blackwood. Officers Dana Reyes and Tom Kwan, Harrow Falls Police, arrived at 10:27 and are holding the guests. The gate camera shows nobody has left.",
      },
      {
        heading: "The victim",
        spoken:
          "The victim. Ambrose Blackthorn, sixty-seven, antiquarian, of Blackthorn Estate. Chairman of the Blackthorn Foundation, which gives grants for historic buildings in the Berkshires and keeps its archive in this house. Married to Constance Blackthorn, separated for six years. One son, Felix. On October twenty-fifth he asked Mr. Byrne to have investigators near the house tonight.",
        body: "Ambrose Blackthorn, 67, antiquarian, of Blackthorn Estate. Chairman of the Blackthorn Foundation (grants for historic buildings in the Berkshires; archive kept in the house library). Married to Constance Blackthorn, separated since 2012. One son, Felix. On October 25 he asked Everett Byrne to have Blackwood investigators near the house tonight.",
      },
      {
        heading: "The dinner",
        spoken:
          "The dinner. A masked dinner for twelve invited guests, at nine o'clock, organized by Oscar Wren of Wren Events. At nine forty-five Mr. Blackthorn told the table that at half past ten he would tell them why they were there: something that had happened in the house twenty years ago tonight. A thirteenth place was set, and a woman in a black veil sat in it. Nobody will say who she was. A masked lantern procession through the maze was planned for midnight, as Mr. Blackthorn's father used to hold it.",
        body: "A masked dinner for twelve invited guests at 9:00 PM, organized by Oscar Wren, Wren Events. At 9:45 Mr. Blackthorn told the table that at 10:30 he would explain why they were there: \"something that happened in this house twenty years ago tonight.\" A thirteenth place was set, and a veiled woman in black sat in it; nobody will say who she was. A masked lantern procession through the maze is planned for midnight.",
      },
      {
        heading: "The house",
        spoken:
          "The house. A stone house of nineteen oh three. On the main floor, the entrance hall, dining room, library, conservatory, and the Morning Room, which is ours tonight. Upstairs, the corridor, Mr. Blackthorn's study at its end, and the guest wing. Below, the wine cellar and the old service corridor. On the grounds, a greenhouse, a yew maze, the carriage house, which is being renovated, and the gatehouse, where the estate office and the cameras are.",
        body: "A stone house of 1903. Main floor: entrance hall, dining room, library (the foundation's archive), conservatory, and the Morning Room (Blackwood's tonight). Upstairs: the corridor, Mr. Blackthorn's study at its end, the guest wing, the attic. Below: the wine cellar and the old service corridor. Grounds: greenhouse, yew maze, carriage house (under renovation), and the gatehouse (estate office, cameras, guard).",
      },
      {
        heading: "Note (Lt. Mahoney)",
        spoken:
          "A note from Lieutenant Mahoney. I'm forty minutes out in this weather. Until I'm there, you're my eyes. Reyes and Kwan are good officers, and there are two of them. Tell me where you want them and I'll tell them. I can get the lab working tonight, and I can open anything you can give me a reason to open. Nobody leaves that house. J.M.",
        body: "I'm forty minutes out in this weather. Until I'm there, you're my eyes. Reyes and Kwan are good officers, and there are two of them: tell me where you want them and I'll tell them. I can get the lab working tonight, and I can open anything you can give me a reason to open. Nobody leaves that house. J.M.",
      },
    ],
  },
];

/** Officer Reyes's first statements, short ones, recorded on her phone between 10:28 and 10:31 PM. */
export const statements: StatementDef[] = [
  {
    characterId: "wren",
    recordedAt: "Wednesday, October 31, 2018, 10:28 PM",
    officer: "Officer Dana Reyes, Harrow Falls Police",
    tape: "HFPD 18-1031-07 / Recording 1",
    audio: "tape.wren",
    transcript: [
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Mr. Wren, you were first up the stairs?" },
      { speakerId: "wren", speaker: "Oscar Wren", text: "Felix and I, together. We heard the scream at about a quarter past, from upstairs. We went up with our phones for light." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Did you see anyone up there?" },
      { speakerId: "wren", speaker: "Oscar Wren", text: "A woman, at the far end of the corridor. In black, with a veil. She went around the corner into the guest wing. Felix shouted at her. Then we were at the study door and it wouldn't open." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Locked?" },
      { speakerId: "wren", speaker: "Oscar Wren", text: "Bolted. You could feel it. When the lights came back we put our shoulders to it. It took two tries." },
    ],
  },
  {
    characterId: "felix",
    recordedAt: "Wednesday, October 31, 2018, 10:29 PM",
    officer: "Officer Dana Reyes, Harrow Falls Police",
    tape: "HFPD 18-1031-07 / Recording 2",
    audio: "tape.felix",
    transcript: [
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Mr. Blackthorn, I'm sorry about your father. Where were you when the lights went out?" },
      { speakerId: "felix", speaker: "Felix Blackthorn", text: "At the table. Everybody was. Well, nearly. Lucian had gone to take a call, my mother had gone somewhere, Dr. Penrose too. Dad had gone up." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "And the woman in the corridor?" },
      { speakerId: "felix", speaker: "Felix Blackthorn", text: "I don't know who she is. She was at dinner, at the bottom of the table, and nobody would say who she was. I thought she was some kind of Halloween act Dad had hired." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Did you and your father argue tonight?" },
      { speakerId: "felix", speaker: "Felix Blackthorn", text: "In the hall, after the soup. About money. Ask anyone, they all heard. That's all it was." },
    ],
  },
  {
    characterId: "amos",
    recordedAt: "Wednesday, October 31, 2018, 10:31 PM",
    officer: "Officer Dana Reyes, Harrow Falls Police",
    tape: "HFPD 18-1031-07 / Recording 3",
    audio: "tape.amos",
    transcript: [
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Mr. Duffy, you got the lights back on?" },
      { speakerId: "amos", speaker: "Amos Duffy", text: "I was caretaker here thirty years. I know where the main is. I went down the kitchen stair with my phone." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Had it tripped?" },
      { speakerId: "amos", speaker: "Amos Duffy", text: "It's a new switch. It doesn't trip. It was down. I put it up, and the lights came on." },
      { speakerId: "reyes", speaker: "Officer Reyes", text: "Did you see anyone in the cellar?" },
      { speakerId: "amos", speaker: "Amos Duffy", text: "No. I heard a door go, down the old passage, and the outside cellar door banging. I took it for one of the caterers." },
    ],
  },
];

const note = (id: string, title: string, text: string, characterId?: string, important = false): Effect => ({ note: { id, kind: "event", title, text, characterId, important } });

export const calls: CallDef[] = [
  {
    id: "call_mahoney_board",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. I'm stuck behind a tree down on Route 7, so tell me what you've got.",
      "Here's how I work a room like that. Pin what you've found to the board in the Morning Room, and run string between the pieces that belong together. Where two things make sense of each other, you've got something.",
      "And keep an eye on the time. A house full of people at midnight is a hard house to watch.",
    ],
  },
  {
    id: "call_mahoney_attack_killed",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. There's been another one. One of your witnesses, at the back stairs, while you were elsewhere in the house.",
      "Struck from behind. Whoever did it was gone down the back stairs before my officer got there.",
      "I'm sending you what we found. Don't let this be for nothing.",
    ],
  },
  {
    id: "call_mahoney_attack_stopped",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. Your instinct was right. The officer you had me put on that witness was there when it happened.",
      "Lucian Marsh came at them on the back stairs with a brass stair rod. The officer had him on the floor before he could swing twice. The witness is shaken and bruised. Alive.",
      "Marsh's in cuffs at the gatehouse and he's asked for a lawyer. I'm sending you the report. Finish the file. I want it airtight.",
    ],
  },
  {
    id: "call_mahoney_escaped",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. Lucian Marsh is gone. Nobody saw him go.",
      "I've got a description out to every cruiser in the county, but in this fog he's got a head start.",
      "If he's the one, I need you to be able to prove it without him. Finish it.",
    ],
  },
  {
    id: "call_mahoney_caught",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. The officer you put on the back lane just earned her pay.",
      "Lucian Marsh came through the maze and out the lane gate in the rain, toward a car with its lights off. He's in cuffs. The driver says he was hired for midnight and doesn't know anything else.",
      "A man doesn't run through a hedge maze in October for nothing. Make the case.",
    ],
  },
  {
    id: "call_mahoney_lab",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: ["Mahoney. The lab's done with the print on that shelf catch. It's in the Morning Room. It won't hand you anybody on a plate, but it narrows things."],
  },
  {
    id: "call_mahoney_officers",
    from: "mahoney",
    title: "Call from Det. Lt. Mahoney",
    lines: [
      "Mahoney. I've still got two officers standing in a hallway waiting for somebody to tell them what to do.",
      "A house this size has more ways out than doors. I'd put one where the house can see her and keep one up my sleeve. But it's your call. You know who's talking to you.",
    ],
  },
  {
    id: "call_crane_overheard",
    from: "crane",
    title: "Overheard in the conservatory",
    overheard: true,
    lines: [
      "Gil. It's me. Listen, don't talk.",
      "Midnight. The lane gate past the maze, not the house. They walk the lanterns out at midnight; nobody will be looking at the lane.",
      "Lights off. Engine on. If I'm not there by a quarter past, go home and forget I called.",
    ],
    effects: [{ setFlag: "heard_crane_call" }],
  },
];

/* ---------------------------------------------------------------------- */
/* The police: two officers, the lab, the chamber, the arrest              */
/* ---------------------------------------------------------------------- */

/** One officer fewer: A (two free), B (one), C (none). */
const useOfficer: Effect[] = [
  { when: { env: "officers", is: "B" }, then: [{ setEnv: "officers", to: "C" }] },
  { when: { env: "officers", is: "A" }, then: [{ setEnv: "officers", to: "B" }] },
];
export const officerFree: Condition = { not: { env: "officers", is: "C" } };

const guardCall = (id: string, who: string, name: string, known: Condition): OutgoingCallDef => ({
  id: `call_guard_${who}`,
  to: "mahoney",
  label: `Ask for an officer to keep a quiet eye on ${name}`,
  available: { all: [briefed, officerFree, known, alive(who), craneFree, { not: guarded(who) }] },
  done: guarded(who),
  lines: [
    `You want an officer on ${name}, without making a show of it? All right. My officer will keep out of sight and keep an eye on them.`,
    "That's one officer you don't have anymore. Spend the other one carefully.",
  ],
  effects: [{ setFlag: `guard_${who}` }, ...useOfficer, note(`guard_${who}`, `An officer keeps watch on ${name}`, `At your request, an officer is quietly keeping watch on ${name}.`, "mahoney")],
});

export const outgoingCalls: OutgoingCallDef[] = [
  {
    id: "call_gate",
    to: "mahoney",
    label: "Ask for an officer at the front gate",
    available: { all: [briefed, officerFree, craneFree, { not: { flag: "police_gate" } }] },
    done: { flag: "police_gate" },
    lines: [
      "At the gate, in the open, with the cruiser's lights on? Done. Reyes will stand there in the rain and look official.",
      "Anybody watching from the house will see her. That's the point, I suppose.",
    ],
    effects: [{ setFlag: "police_gate" }, ...useOfficer, note("police_gate", "An officer at the front gate", "Officer Reyes is posted at the front gate with the cruiser's lights on, in plain view of the house.", "mahoney")],
  },
  {
    id: "call_lane",
    to: "mahoney",
    label: "Ask for an officer to watch the back lane, out of sight",
    available: { all: [briefed, officerFree, craneFree, { not: { flag: "police_lane" } }, { any: [{ inspected: "gm_gate" }, { hasEvidence: "HE015" }, { flag: "heard_crane_call" }] }] },
    done: { flag: "police_lane" },
    lines: [
      "The lane past the maze? Brody says that gate's been padlocked for years. Then nobody will expect anyone to be watching it.",
      "I'll put an officer in the trees with the lights off. Nobody in the house will know.",
    ],
    effects: [{ setFlag: "police_lane" }, ...useOfficer, note("police_lane", "An officer on the back lane", "An officer is watching the back lane past the maze from the trees, lights off. Nobody in the house has been told.", "mahoney")],
  },
  guardCall("harriet", "harriet", "Harriet Lowell", { talkedTo: "harriet" }),
  guardCall("amos", "amos", "Amos Duffy", { talkedTo: "amos" }),
  guardCall("bridget", "bridget", "Bridget Duffy", { talkedTo: "bridget" }),
  guardCall("josie", "josie", "Josie Lisle", { flag: "josie_found" }),
  {
    id: "call_lab",
    to: "mahoney",
    label: "Ask the lab to lift the print from the shelf catch",
    available: { all: [{ inspected: "ss_catch" }, { not: { labStarted: "print_catch" } }] },
    done: { labStarted: "print_catch" },
    lines: [
      "A catch inside a hidden bookcase. I like it. I'll have Reyes lift it and get elimination prints from everyone in the house while she's at it.",
      "The lab's in Springfield. Give them a few minutes.",
    ],
    effects: [{ startLab: "print_catch" }, note("lab_sent", "The print on the shelf catch goes to the lab", "Lt. Mahoney has the partial print from the shelf catch lifted and sent to the State Police lab, with elimination prints from everyone in the house.", "mahoney")],
  },
  {
    id: "call_chamber",
    to: "mahoney",
    label: "Ask Lt. Mahoney to open the bricked chamber under the carriage house",
    available: { all: [{ hasEvidence: "HE024" }, { any: [{ hasEvidence: "HE022" }, { hasEvidence: "HE026" }, { hasEvidence: "HE035" }] }, { not: { flag: "chamber_opened" } }] },
    done: { flag: "chamber_opened" },
    lines: [
      "A chamber bricked over the week a girl went missing, by the man who ran the books. That's enough for me.",
      "The crime scene van just came through the gate. We'll have that floor open in no time. Go and look when you can.",
    ],
    effects: [{ setFlag: "chamber_opened" }, { message: "The State Police crime scene unit is opening the chamber under the carriage house." }],
  },
  {
    id: "call_detain",
    to: "mahoney",
    label: "Ask Lt. Mahoney to detain Lucian Marsh",
    available: { all: [{ deduction: "HD09" }, { deduction: "HD10" }, craneFree] },
    done: { flag: "crane_arrested" },
    lines: [
      "A motive in writing and a key in his name to a stair he says he hasn't set foot in for twenty-five years. And a man who wasn't where he said he was. That's enough to hold him.",
      "Kwan's taking him to the gatehouse now. He's asked for his lawyer, which is his right. You keep building it.",
    ],
    effects: [
      { setFlag: "crane_arrested" },
      { when: { not: { clockAt: "00:00" } }, then: [{ setFlag: "arrested_before_midnight" }] },
      { setEnv: "crane", to: "gatehouse" },
      note("crane_detained", "Lucian Marsh is detained", "At your request Lt. Mahoney has had Lucian Marsh detained and taken to the gatehouse.", "mahoney", true),
    ],
  },
  {
    id: "call_cancel",
    to: "mahoney",
    label: "Ask Lt. Mahoney to call off the midnight procession",
    available: { all: [briefed, { not: { clockAt: "00:00" } }, { not: { flag: "procession_canceled" } }] },
    done: { flag: "procession_canceled" },
    lines: ["A lantern walk through a hedge maze in the dark, tonight? No. I'll tell Mr. Wren. Everybody stays inside, where we can count them."],
    effects: [{ setFlag: "procession_canceled" }, note("procession_canceled", "The procession is called off", "At your request Lt. Mahoney has called off the midnight procession. The guests stay inside.", "mahoney")],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lab_print",
    title: "Lab report: the print on the shelf catch",
    exterior: "A State Police laboratory envelope, faxed through to the gatehouse and brought up by one of the officers.",
    text: "The State Police lab's report on the partial print from the catch inside the hidden shelf, compared with elimination prints from everyone in the house.",
    evidence: ["HE009"],
  },
  {
    id: "mahoney_attack",
    title: "Lt. Mahoney's report of the second attack",
    exterior: "A State Police supplementary report, still warm from the gatehouse printer.",
    text: "Lt. Mahoney's report on the attack on a witness at the back stairs.",
    evidence: ["HE037"],
  },
];

export const labs: LabDef[] = [
  {
    id: "print_catch",
    label: "Latent print: the shelf catch",
    seconds: 180,
    rect: LAB_PRINT_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_print" }, { incomingCall: "call_mahoney_lab" }, { message: "The lab report on the shelf catch is in the Morning Room." }],
  },
];

export const texts: TextDef[] = [];

/* ---------------------------------------------------------------------- */
/* Events: the house reacts                                                */
/* ---------------------------------------------------------------------- */

const ev = (e: Omit<ReactiveEventDef, "caseId">): ReactiveEventDef => ({ caseId: "HALLOW001", ...e });

export const events: ReactiveEventDef[] = [
  ev({
    id: "RE01",
    title: "The veiled woman",
    characterId: "josie",
    requires: { flag: "josie_found" },
    complete: { talkedTo: "josie" },
    onAvailable: [{ message: "The woman in the Rose Room unlocks the door. She will come down to the Morning Room with you." }],
    notebook: {
      learned: [
        { text: "The veiled woman was hiding in the Rose Room, in the guest wing. She has agreed to wait in the Morning Room." },
        { text: "She is Josephine Lisle, Annabel Lisle's younger sister.", requires: { talkedTo: "josie" } },
      ],
    },
  }),
  ev({
    id: "RE02",
    title: "The chamber under the carriage house",
    requires: { flag: "chamber_opened" },
    complete: { hasEvidence: "HE025" },
    notebook: {
      learned: [
        { text: "At your request, the State Police are breaking open the bricked chamber under the carriage house inspection pit." },
        { text: "The remains of a young woman were found in it.", requires: { hasEvidence: "HE025" } },
      ],
    },
    evidence: ["HE025"],
  }),
  ev({
    id: "RE03",
    title: "A second attack",
    requires: { flag: "second_murder" },
    complete: { deliveryOpened: "mahoney_attack" },
    onAvailable: [
      { incomingCall: "call_mahoney_attack_killed" },
      { delivery: "mahoney_attack" },
      { message: "Something has happened at the back stairs." },
    ],
    notebook: {
      learned: [
        { text: "One of the witnesses has been killed at the back stairs, struck from behind, while the house was held." },
        { text: "Lt. Mahoney's report is in the Morning Room.", requires: { deliveryPending: "mahoney_attack" } },
      ],
      call: "call_mahoney_attack_killed",
      delivery: "mahoney_attack",
    },
    evidence: ["HE037"],
  }),
  ev({
    id: "RE04",
    title: "An attack stopped",
    characterId: "crane",
    requires: { flag: "attack_interrupted" },
    complete: { deliveryOpened: "mahoney_attack" },
    onAvailable: [
      { incomingCall: "call_mahoney_attack_stopped" },
      { delivery: "mahoney_attack" },
      { message: "Something has happened at the back stairs." },
    ],
    notebook: {
      learned: [
        { text: "Lucian Marsh attacked a witness on the back stairs. The officer you had posted with them stopped him, and he is under arrest." },
      ],
      call: "call_mahoney_attack_stopped",
      delivery: "mahoney_attack",
    },
    evidence: ["HE037"],
  }),
  ev({
    id: "RE05",
    title: "Lucian Marsh is gone",
    characterId: "crane",
    requires: { flag: "crane_escaped" },
    complete: { callAnswered: "call_mahoney_escaped" },
    onAvailable: [{ incomingCall: "call_mahoney_escaped" }, { message: "Lt. Mahoney is calling. Lucian Marsh cannot be found." }],
    notebook: { learned: [{ text: "Lucian Marsh has left the estate. Nobody saw him go." }], call: "call_mahoney_escaped" },
  }),
  ev({
    id: "RE06",
    title: "Caught on the lane",
    characterId: "crane",
    requires: { flag: "crane_caught_fleeing" },
    complete: { callAnswered: "call_mahoney_caught" },
    onAvailable: [{ incomingCall: "call_mahoney_caught" }, { message: "Lt. Mahoney is calling about the back lane." }],
    notebook: { learned: [{ text: "Lucian Marsh was caught by the officer watching the back lane, running for a waiting car. He is under arrest." }], call: "call_mahoney_caught" },
  }),
  ev({
    id: "RE07",
    title: "The midnight procession",
    requires: { all: [{ clockAt: "00:00" }, { not: { flag: "procession_canceled" } }] },
    complete: { clockAt: "00:25" },
    onAvailable: [{ setFlag: "procession_on" }, { message: "Midnight. Oscar Wren's people are handing out lanterns. Some of the guests are going out to walk the maze, as Ambrose wanted; others refuse." }],
    onComplete: [{ clearFlag: "procession_on" }, { setFlag: "procession_over" }, { message: "The lanterns are coming back in from the maze." }],
    notebook: {
      learned: [
        { text: "At midnight the lantern procession went ahead: some of the guests walked the maze with Oscar Wren's lanterns, in the rain." },
        { text: "The procession is over and the guests are back inside.", requires: { flag: "procession_over" } },
      ],
    },
  }),
  ev({
    id: "RE09",
    title: "Lt. Mahoney's officers",
    characterId: "mahoney",
    requires: { all: [{ clockAt: "23:00" }, { env: "officers", is: "A" }, craneFree] },
    complete: { callAnswered: "call_mahoney_officers" },
    onAvailable: [{ incomingCall: "call_mahoney_officers" }],
    notebook: { learned: [{ text: "Lt. Mahoney's two officers are still waiting to be told where to go." }], call: "call_mahoney_officers" },
  }),
  ev({
    id: "RE08",
    title: "A note for Bridget",
    characterId: "bridget",
    requires: { flag: "bridget_threatened" },
    activate: { talkedTo: "bridget" },
    complete: { hasEvidence: "HE036" },
    notebook: {
      learned: [
        { text: "Someone has left Bridget Duffy an unsigned note telling her to remember what she didn't see." },
      ],
    },
  }),
];

/* ---------------------------------------------------------------------- */
/* Objectives and the report                                               */
/* ---------------------------------------------------------------------- */

export const objectives: ObjectiveDef[] = [
  { id: "obj_file", text: "Read the case file in the Morning Room.", visible: { always: true }, done: briefed },
  { id: "obj_study", text: "Examine the study where Ambrose Blackthorn died.", visible: briefed, done: { visited: "study" } },
  { id: "obj_locked", text: "Find out how the killer left a room bolted from the inside.", visible: { visited: "study" }, done: { deduction: "HD03" } },
  { id: "obj_blackout", text: "Find out why the lights went out.", visible: briefed, done: { deduction: "HD01" } },
  { id: "obj_veil", text: "Find the woman in the black veil.", visible: briefed, done: { flag: "josie_found" } },
  { id: "obj_1998", text: "Learn what happened in this house on Halloween 1998.", visible: { any: [{ hasEvidence: "HE008" }, { talkedTo: "josie" }, { talkedTo: "beatrice" }] }, done: { deduction: "HD07" } },
  { id: "obj_safe", text: "Keep the witnesses safe. You have two officers to place.", visible: { talkedTo: "harriet" }, done: { env: "officers", is: "C" } },
  { id: "obj_midnight", text: "Decide what to do about the midnight procession.", visible: briefed, done: { any: [{ flag: "procession_canceled" }, { clockAt: "00:00" }] } },
  { id: "obj_report", text: "File your report with Lt. Mahoney.", visible: { any: [{ deduction: "HD10" }, { flag: "crane_arrested" }, { flag: "crane_escaped" }] }, done: { flag: "case_closed" } },
];

export const reportAvailable: Condition = { any: [{ deduction: "HD10" }, { deduction: "HD11" }, { flag: "crane_arrested" }, { flag: "crane_escaped" }] };

/** The office desk spots, re-exported for locations.ts. */
export { REPORT_RECT };
