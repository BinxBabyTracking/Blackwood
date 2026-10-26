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
import { LAB_BLOOD_RECT, LAB_GLOVES_RECT, LAB_GPS_RECT, LAB_PAINT_RECT } from "./desk";

/*
 * C003 story content. Times follow docs/C003-timeline.md. Nothing in this file
 * mentions the second crime before it happens in play: the midpoint (MID1 to
 * MID4) is a chain of one-time events, and everything about the Marshes' deaths
 * sits behind them.
 */

/** The Marshes have been found (MID4 answered). The case is a multiple homicide from here. */
export const found: Condition = { flag: "marshes_found" };

export const intro: CaseDefinition["intro"] = [
  { heading: "Friday, October 26, 2018", text: "Blackwood Investigations, Pittsburgh field office. Rain since dawn." },
  {
    text: "The woman across your desk is in a librarian's cardigan, a folder held flat on her knees. Rachel Kowalski. Six weeks ago her sister Jenna and Jenna's ex, Ethan Cole, were shot on Alder Street in Bellwether, forty miles down the river. Their daughter Sophie was asleep in the back seat. She's five. She lives with Rachel now.",
  },
  {
    text: "'The police say robbery. Nothing was taken but a bag. Ethan was scared of something the week before, and nobody will tell me what. I can pay. I just need someone to look.'",
  },
  {
    text: "She slides the folder across: the police summary, two photographs, a list of names. 'Detective Cross gave me copies. She's not a bad person. She's just stuck.'",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "~10:06 PM (Fri 9/14)", text: "Jenna Kowalski and Ethan Cole are shot on Alder Street, Bellwether. Their car hits a tree. Sophie, 5, survives.", source: "Case file" },
  { time: "10:12 PM (Fri 9/14)", text: "First 911 call, from a resident of Alder Street.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Bellwether Police case 18-09-1147: Kowalski and Cole (copy)",
    dossier: [
      { label: "Case ID", value: "C003" },
      { label: "Case title", value: "The Witness on Alder Street" },
      { label: "Classification", value: "Double homicide" },
      { label: "Location", value: "Bellwether, Pennsylvania" },
      { label: "Year", value: "2018" },
      { label: "Victims", value: "Jenna Kowalski, 34; Ethan Cole, 38" },
      { label: "Client", value: "Rachel Kowalski, Jenna's sister" },
      { label: "Police", value: "Det. Helen Cross, Bellwether PD" },
      { label: "Contact", value: "Bennett, Blackwood records, by phone" },
    ],
    people: ["jenna", "ethan", "rachel", "cross"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (Det. Cross)",
        spoken:
          "Bellwether Police Department. Case eighteen, oh nine, eleven forty-seven. Double homicide, Alder Street. On Friday, September fourteenth, twenty eighteen, at about six minutes past ten at night, a silver Honda driven by Jenna Kowalski, thirty-four, with passengers Ethan Cole, thirty-eight, and their daughter Sophie Cole, five, struck an oak tree outside four twelve Alder Street after shots were fired into the vehicle. Kowalski and Cole were pronounced dead at the scene. The child was uninjured and released to her aunt, Rachel Kowalski. No weapons recovered. No suspects identified. Working theory: attempted robbery. Lead investigator: Detective Helen Cross.",
        body: "BELLWETHER POLICE DEPARTMENT. Case 18-09-1147. Double homicide, Alder Street. On Friday, September 14, 2018, at about 10:06 PM, a silver 2014 Honda CR-V driven by Jenna Kowalski, 34, with passengers Ethan Cole, 38, and their daughter Sophie Cole, 5, struck an oak tree outside 412 Alder Street after shots were fired into the vehicle. Kowalski and Cole were pronounced dead at the scene. The child was uninjured and released to her aunt, Rachel Kowalski. No weapons recovered. No suspects identified. Working theory: attempted robbery. Lead investigator: Det. Helen Cross.",
      },
      {
        heading: "The victims",
        spoken:
          "The victims. Jenna Kowalski, thirty-four, a veterinary technician at Northside Animal Clinic, of twenty-seven Linden Court. Ethan Cole, thirty-eight, a commercial electrician with Kessel Electric, who lived in an apartment on Alder Street. They had been separated two years and shared custody of Sophie, on good terms. That night they had taken Sophie to the Bellwether fall carnival together, and Jenna was driving Ethan home.",
        body: "Jenna Kowalski, 34, veterinary technician at Northside Animal Clinic, 27 Linden Court. Ethan Cole, 38, commercial electrician, Kessel Electric, apartment on Alder Street. Separated two years, shared custody, on good terms. That night they had taken Sophie to the Bellwether fall carnival together and Jenna was driving Ethan home.",
      },
      {
        heading: "The scene",
        spoken:
          "The scene. Alder Street is a residential street of brick houses between Furnace Street and the river. The vehicle came to rest against a tree on the north side. The first nine one one call came from a neighbor at twelve minutes past ten. The wreck was towed by the rotation tow, Shaw Towing, and is held at the police impound.",
        body: "Alder Street is a residential street of brick houses between Furnace Street and the river. The vehicle came to rest against a tree on the north side. The first 911 call came from a neighbor at 10:12 PM. The wreck was towed by the rotation tow, Shaw Towing, and is held at the police impound.",
      },
      {
        heading: "People",
        spoken:
          "People. Rachel Kowalski, sister, and our client. Lena Ortiz, manager at Hart's Quick Stop on Furnace Street, where the family stopped that night. Vivian Marsh, a neighbor at four oh nine Alder Street, who came outside after the shots. Detective Helen Cross, Bellwether police. Doctor Samuel Reed, at the Calder County Forensic Laboratory.",
        body: "Rachel Kowalski, sister, client. Lena Ortiz, manager at Hart's Quick Stop, 1820 Furnace Street, where the family stopped. Vivian Marsh, neighbor at 409 Alder Street, came outside after the shots. Det. Helen Cross, Bellwether PD. Dr. Samuel Reed, Calder County Forensic Laboratory.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. I've done forty years of this, and robberies don't leave the wallets. Cross gave Rachel her file, which tells you Cross wants help. Her number and Doctor Reed's are in your phone. So is mine. B.",
        body: "Forty years of this, and robberies don't leave the wallets. Cross gave Rachel her file, which tells you Cross wants help. Her number and Dr. Reed's are in your phone. So is mine. B.",
      },
    ],
  },
];

const C = (text: string) => ({ speakerId: "cross", speaker: "Det. Cross", text });
const V = (text: string) => ({ speakerId: "vivian", speaker: "Vivian Marsh", text });
const L = (text: string) => ({ speakerId: "lena", speaker: "Lena Ortiz", text });
const officer = "Det. Helen Cross, Bellwether PD";

/* Two recorded canvass interviews from the week of the shooting, on the laptop in the office. */
export const statements: StatementDef[] = [
  {
    characterId: "vivian",
    recordedAt: "Sat 9/15/18, 11:20 AM",
    officer,
    tape: "BPD 18-09-1147 / Recording 4",
    audio: "rec.vivian1",
    transcript: [
      C("Detective Cross, Saturday the fifteenth, eleven twenty, at 409 Alder. Mrs. Marsh, you came outside after the shots."),
      V("I heard pops, four or five, then more, then the crash. By the time I got to the porch it was over. The car was against the tree."),
      C("Did you see another vehicle?"),
      V("Something was turning onto Furnace. Dark. Fast. Taillights. I'm sorry, I really couldn't tell you what it was."),
      C("Anything at all. Color, size, a sound."),
      V("Bigger than a car, I think. I don't want to say something and be wrong. I'd hate to send you after the wrong people."),
      C("If anything comes back to you, you call me."),
      V("I will. Is the little girl all right?"),
    ],
  },
  {
    characterId: "lena",
    recordedAt: "Sun 9/16/18, 3:40 PM",
    officer,
    tape: "BPD 18-09-1147 / Recording 7",
    audio: "rec.lena1",
    transcript: [
      C("Sunday the sixteenth, three forty, Hart's on Furnace. Ms. Ortiz, you sold them gas and coffee Friday night."),
      L("Him and the little girl came in. She picked apple juice. He paid with her mom's card, the mom was at the pump."),
      C("Anybody else in the store, or out front?"),
      L("Some guy before them bought cigarettes. Hood up. I didn't really look at him. There was a car out past the pumps."),
      C("What kind of car?"),
      L("Dark. Big. I was ringing people up. I'm sorry."),
      C("Do you keep video?"),
      L("The camera outside saves thirty days, I think. I'll ask the owner how to pull it."),
    ],
  },
];

export const calls: CallDef[] = [
  {
    id: "call_lena",
    from: "lena",
    title: "Call from Lena Ortiz, Hart's Quick Stop",
    lines: [
      "Hi, it's Lena from Hart's. I keep watching that clip.",
      "That SUV was there before they were. Twelve minutes before. The guy who came in for cigarettes, he had a work jacket on, dark, with a patch on the shoulder, like a uniform patch. I couldn't read it.",
      "I just thought you should know they were waiting.",
    ],
    effects: [
      { setFlag: "lena_called" },
      { timeline: { time: "9:30 PM (Fri 9/14)", text: "A dark SUV is already waiting at the side of Hart's lot, engine running, twelve minutes before the family arrives.", source: "Lena Ortiz (phone)" } },
    ],
  },
  {
    id: "call_rachel_envelope",
    from: "rachel",
    title: "Call from Rachel Kowalski",
    lines: [
      "When you said 'clearance' I got this cold feeling.",
      "Ethan came by the night before. Thursday. He gave me an envelope and said hold onto this, and I put it in Jenna's hall desk and then everything happened and I forgot.",
      "I haven't opened it. I'm scared to. It's in the hall desk drawer. Please come.",
    ],
    effects: [
      { setFlag: "envelope_remembered" },
      { timeline: { time: "Evening (Thu 9/13)", text: "Ethan leaves a sealed envelope with Rachel 'in case'.", source: "Rachel Kowalski (phone)" } },
    ],
  },
  {
    id: "call_vivian",
    from: "vivian",
    title: "Call from Vivian Marsh",
    lines: [
      "Hi, this is Vivian Marsh. On Alder Street.",
      "I've been thinking about what you asked me. About the vehicle. I remembered something, and I think you need to hear it. I'd rather not say it over the phone.",
      "Could you come by tonight? Around eight? Graham will be here. Thank you.",
    ],
    effects: [
      { setFlag: "vivian_called" },
      { timeline: { time: "5:40 PM (Mon 10/29)", text: "Vivian Marsh calls Blackwood and asks to meet at her house at 8:00 PM.", source: "Vivian Marsh (phone)" } },
    ],
  },
  {
    id: "call_cross_found",
    from: "cross",
    title: "Call from Det. Cross",
    lines: [
      "We found them. A rail crew at the end of the riverside access road found a burned SUV at a quarter after seven. Vivian and Graham were inside. I'm sorry.",
      "The SUV is registered to Bell Security. Marcus Bell reported it stolen at six forty this morning.",
      "Listen to me: this happened before you ever got to that door. You didn't do this. Come to the station when you can. This is my case now too.",
    ],
    effects: [
      { setFlag: "marshes_found" },
      { unlockLocation: "riverside" },
      { timeline: { time: "6:40 AM (Tue 10/30)", text: "Marcus Bell reports Bell Security's Unit 4 stolen 'from the garage overnight'.", source: "Det. Cross (phone)" } },
      { timeline: { time: "7:15 AM (Tue 10/30)", text: "A rail crew finds Unit 4, partly burned, on the riverside access road. Vivian and Graham Marsh are inside.", source: "Det. Cross (phone)" } },
    ],
  },
  {
    id: "call_reed_paint",
    from: "reed",
    title: "Call from Dr. Reed",
    lines: [
      "Reed. Your paint comparison's done.",
      "Short version: it fits. Long version, which you'll want, is in the report. Don't let anyone tell you it says more than it says.",
    ],
  },
  {
    id: "call_warning",
    from: "caller",
    title: "Call from a blocked number",
    lines: [
      "Riverside Commons is a construction site. It's not a crime scene.",
      "You've done your job, you've been paid. Go home to Pittsburgh.",
    ],
    effects: [
      { setFlag: "warned" },
      { note: { id: "warning_number", kind: "call", title: "The warning call: the number", text: "The blocked caller's number shows in the phone log: (724) 555-0149.", important: true } },
    ],
  },
  {
    id: "call_cross_search",
    from: "cross",
    title: "Call from Det. Cross",
    lines: [
      "The GPS and the Dudek camera got me a warrant. We went through the Bell Security trailer at the riverside site this morning.",
      "In the dumpster out back: a pair of work gloves in a grocery bag, and Vivian's phone.",
      "Marcus Bell is in an interview room at the station right now. He wants a lawyer. Reed says he can run the gloves for you if you ask him.",
    ],
    effects: [
      { setFlag: "search_done" },
      { setFlag: "bell_custody" },
      { timeline: { time: "Morning (Wed 10/31)", text: "Police search the Bell Security trailer at Riverside Commons; gloves and Vivian Marsh's phone recovered. Marcus Bell taken into custody.", source: "Det. Cross (phone)" } },
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "It's Bennett. I'm retired, I'm not dead, and I know what an empty board looks like.",
      "Pin what you've got on that wall in the office. When two things belong together, run string between them. The board will tell you when you're onto something.",
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
  { id: "t_rachel_envelope", from: "rachel", body: "Found something of Ethan's. Come by when you can." },
  { id: "t_reed_blood", from: "reed", body: "Cross says there's blood on a door frame. If you want it tested, ask me." },
  { id: "t_reed_suv", from: "reed", body: "The SUV is at our garage. I can pull its tracker, and compare its paint with anything you've got." },
];

/* Lab tests: real time from the moment Dr. Reed starts them; the results arrive on the phone and the office desk. */
export const labs: LabDef[] = [
  {
    id: "blood",
    label: "DNA: the smear on the Marsh door frame",
    seconds: 180,
    rect: LAB_BLOOD_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_blood" }, { message: "Dr. Reed's report on the Marsh door frame is in. It's on your phone and your desk." }],
  },
  {
    id: "gps",
    label: "Digital: Unit 4's tracker",
    seconds: 180,
    rect: LAB_GPS_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_gps" }, { message: "Dr. Reed has downloaded Unit 4's tracker. The report is on your phone and your desk." }],
  },
  {
    id: "paint",
    label: "Trace: the trim fragment and Unit 4",
    seconds: 180,
    rect: LAB_PAINT_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_paint" }, { message: "The paint comparison is in. It's on your phone and your desk." }],
  },
  {
    id: "gloves",
    label: "DNA: the gloves from the search",
    seconds: 180,
    rect: LAB_GLOVES_RECT,
    image: "obj.labfolder",
    onReady: [{ delivery: "lab_gloves" }, { message: "Dr. Reed's report on the gloves and the phone is in. It's on your phone and your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lab_blood",
    title: "Lab report: the Marsh door frame",
    exterior: "An email from the Calder County Forensic Laboratory with a report attached, and the same report in a county folder on your desk.",
    text: "Dr. Reed's note: 'The smear and the hall. Whose blood, not whose hands. S.R.'",
    evidence: ["E20"],
  },
  {
    id: "lab_gps",
    title: "Lab report: Unit 4's tracker",
    exterior: "An email from the Calder County Forensic Laboratory with an extraction report attached.",
    text: "Dr. Reed's note: 'The insurer's box under the dash. It tells you where the SUV went, minute by minute. It does not tell you who was driving. S.R.'",
    evidence: ["E22"],
  },
  {
    id: "lab_paint",
    title: "Lab report: paint comparison",
    exterior: "An email from the Calder County Forensic Laboratory with a trace evidence report attached.",
    text: "Dr. Reed's note: 'Read the interpretation twice. Consistent with, not proof of. S.R.'",
    evidence: ["E27"],
  },
  {
    id: "lab_gloves",
    title: "Lab report: the gloves and the phone",
    exterior: "An email from the Calder County Forensic Laboratory, marked PRIORITY, with a report attached.",
    text: "Dr. Reed's note: 'This one is different. DNA from inside a glove is about as close to a name as my work gets. S.R.'",
    evidence: ["E32"],
  },
];

/* The midpoint gate: the vehicle on Alder Street is tied to Bell Security, and the player has met both Vivian and Bell. */
const midpointReady: Condition = {
  all: [{ deduction: "D01" }, { deduction: "D02" }, { deduction: "D08" }, { talkedTo: "vivian" }, { talkedTo: "bell" }],
};

export const events: ReactiveEventDef[] = [
  // ---------------------------------------------------------------------
  // The six reactive events
  // ---------------------------------------------------------------------
  {
    id: "RE01",
    caseId: "C003",
    title: "A forgotten detail",
    characterId: "lena",
    requires: { deduction: "D02" },
    onActivate: [{ incomingCall: "call_lena" }, { message: "Your phone is ringing: Lena Ortiz." }],
    complete: { callAnswered: "call_lena" },
    notebook: {
      call: "call_lena",
      learned: [
        { text: "The SUV at Hart's had been waiting since 9:30 PM, twelve minutes before the family arrived.", requires: { callAnswered: "call_lena" } },
        { text: "The man who came in for cigarettes wore a dark work jacket with a patch on the shoulder.", requires: { callAnswered: "call_lena" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C003",
    title: "The unopened envelope",
    characterId: "rachel",
    requires: { all: [{ hasEvidence: "E09" }, { any: [{ hasEvidence: "E10" }, { hasEvidence: "E11" }, { hasEvidence: "E12" }] }] },
    onActivate: [{ incomingCall: "call_rachel_envelope" }, { text: "t_rachel_envelope" }],
    complete: { hasEvidence: "E15" },
    evidence: ["E15"],
    notebook: {
      call: "call_rachel_envelope",
      learned: [
        { text: "Ethan left a sealed envelope with Rachel on the Thursday night before he died. It is in the hall desk at 27 Linden Court." },
        { text: "Inside: copies of the original clearance and the survey, and a USB drive. 'Give this to the state DEP, not the city.'", requires: { hasEvidence: "E15" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "C003",
    title: "A vehicle has been moved",
    characterId: "bell",
    requires: { all: [{ hasEvidence: "E26" }, { not: { at: "bell_garage" } }] },
    activate: { at: "bell_garage" },
    onActivate: [{ setEnv: "bell_garage", to: "B" }, { message: "Bay 2 is empty. Unit 4 is gone." }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "When you came back to the Bell Security garage, Unit 4 was gone from bay 2." },
        { text: "Unit 4 was found on the riverside access road on Tuesday morning.", requires: found },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "C003",
    title: "Laboratory comparison",
    characterId: "reed",
    requires: { labReady: "paint" },
    onActivate: [{ incomingCall: "call_reed_paint" }],
    complete: { callAnswered: "call_reed_paint" },
    evidence: ["E27"],
    notebook: {
      call: "call_reed_paint",
      delivery: "lab_paint",
      learned: [{ text: "Dr. Reed compared the trim fragment and the paint on the CR-V with Bell Security's Unit 4. Consistent with, not proof of." }],
    },
  },
  {
    id: "RE05",
    caseId: "C003",
    title: "Anonymous warning",
    requires: { all: [found, { any: [{ deduction: "D05" }, { deduction: "D11" }] }] },
    onActivate: [{ incomingCall: "call_warning" }],
    complete: { callAnswered: "call_warning" },
    notebook: {
      call: "call_warning",
      learned: [
        { text: "A blocked caller with a disguised voice told you to leave Riverside Commons alone and go home to Pittsburgh.", requires: { callAnswered: "call_warning" } },
        { text: "The number in your phone log: (724) 555-0149.", requires: { callAnswered: "call_warning" } },
        { text: "The same prepaid number called Trevor Shaw twice on the night of September 14.", requires: { all: [{ callAnswered: "call_warning" }, { hasEvidence: "E29" }] } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "C003",
    title: "The expanded search",
    characterId: "cross",
    requires: { all: [{ hasEvidence: "E22" }, { hasEvidence: "E31" }] },
    onActivate: [{ incomingCall: "call_cross_search" }],
    complete: { callAnswered: "call_cross_search" },
    evidence: ["E32"],
    notebook: {
      call: "call_cross_search",
      learned: [
        { text: "With the GPS history and the scrapyard camera, Det. Cross got a warrant for the Bell Security trailer at Riverside Commons." },
        { text: "Work gloves and Vivian Marsh's phone were found in the dumpster behind it. Marcus Bell is in custody.", requires: { callAnswered: "call_cross_search" } },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // The midpoint: four story steps, once each, shared by the whole table
  // ---------------------------------------------------------------------
  {
    id: "MID1",
    caseId: "C003",
    title: "Vivian calls",
    characterId: "vivian",
    requires: midpointReady,
    // Never while the player is standing in her house.
    activate: { not: { at: "marsh_house" } },
    onActivate: [{ incomingCall: "call_vivian" }, { message: "Your phone is ringing: Vivian Marsh." }],
    complete: { callAnswered: "call_vivian" },
    notebook: {
      call: "call_vivian",
      learned: [
        { text: "Vivian Marsh remembered something about the vehicle and asked you to come to 409 Alder Street at eight.", requires: { callAnswered: "call_vivian" } },
      ],
    },
  },
  {
    id: "MID2",
    caseId: "C003",
    title: "409 Alder Street",
    characterId: "vivian",
    requires: { callAnswered: "call_vivian" },
    activate: { at: "marsh_house" },
    onActivate: [
      { setEnv: "marsh_house", to: "B" },
      { setFlag: "marsh_empty" },
      { message: "Monday, October 29, 8:10 PM. Alder Street." },
      { timeline: { time: "8:10 PM (Mon 10/29)", text: "You arrive at 409 Alder Street. The front door is open. Vivian and Graham are not there.", source: "You" } },
    ],
    complete: { flag: "cross_notified" },
    notebook: {
      learned: [
        { text: "At 8:10 PM the Marshes' front door was open, a lamp was knocked over and there was blood on the door frame. Vivian and Graham were gone. Graham's car was in the drive." },
        { text: "You called Det. Cross. Officers secured the house by 8:40 PM.", requires: { flag: "cross_notified" } },
      ],
    },
  },
  {
    id: "MID3",
    caseId: "C003",
    title: "Police at the Marsh house",
    characterId: "cross",
    requires: { flag: "cross_notified" },
    onActivate: [
      { setEnv: "marsh_house", to: "C" },
      { message: "Police secure 409 Alder Street, 8:40 PM." },
      { text: "t_reed_blood" },
      { timeline: { time: "8:40 PM (Mon 10/29)", text: "Bellwether police secure 409 Alder Street.", source: "Det. Cross" } },
    ],
    complete: { always: true },
    notebook: { learned: [{ text: "Dr. Reed can test the smear on the Marshes' door frame." }] },
  },
  {
    id: "MID4",
    caseId: "C003",
    title: "The Marshes are found",
    characterId: "cross",
    requires: { all: [{ eventState: "MID3", is: "completed" }, { not: { at: "marsh_house" } }] },
    onActivate: [{ incomingCall: "call_cross_found" }, { message: "Tuesday, October 30, 7:40 AM. Your phone is ringing: Det. Cross." }],
    complete: { callAnswered: "call_cross_found" },
    onComplete: [{ text: "t_reed_suv" }],
    notebook: {
      call: "call_cross_found",
      learned: [
        { text: "Vivian and Graham Marsh were found dead in a partly burned SUV at the end of the riverside access road.", requires: found },
        { text: "The SUV is Bell Security's Unit 4. Marcus Bell reported it stolen at 6:40 that morning.", requires: found },
      ],
    },
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read the police file Rachel brought", visible: { always: true }, done: { flag: "casefile_read" } },
  { id: "o_scene", text: "Go to Alder Street, where it happened", visible: { flag: "casefile_read" }, done: { visited: "alder_street" } },
  { id: "o_cause", text: "Find out whether the crash or the shots killed them", visible: { flag: "casefile_read" }, done: { deduction: "D01" } },
  { id: "o_route", text: "Retrace the family's last stop at Hart's", visible: { flag: "casefile_read" }, done: { deduction: "D02" } },
  { id: "o_people", text: "Talk to Rachel, Lena Ortiz, Det. Cross and Vivian Marsh", visible: { flag: "casefile_read" }, done: { all: [{ talkedTo: "rachel" }, { talkedTo: "lena" }, { talkedTo: "cross" }, { talkedTo: "vivian" }] } },
  { id: "o_bag", text: "Find out what was in Ethan's bag", visible: { hasEvidence: "E08" }, done: { deduction: "D03" } },
  { id: "o_clearance", text: "Compare the clearance at the annex with the one on file", visible: { hasEvidence: "E09" }, done: { deduction: "D04" } },
  { id: "o_vehicle", text: "Find the vehicle that followed them", visible: { deduction: "D02" }, done: { deduction: "D08" } },
  { id: "o_board", text: "Connect evidence on the murder board", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },
  { id: "o_vivian", text: "Meet Vivian Marsh at 409 Alder Street, 8 PM", visible: { callAnswered: "call_vivian" }, done: { flag: "marsh_empty" } },
  { id: "o_cross", text: "Call Det. Cross", visible: { flag: "marsh_empty" }, done: { flag: "cross_notified" } },
  { id: "o_riverside", text: "Go to the riverside access road", visible: found, done: { visited: "riverside" } },
  { id: "o_movements", text: "Reconstruct Unit 4's movements on October 29", visible: found, done: { all: [{ hasEvidence: "E22" }, { hasEvidence: "E31" }] } },
  { id: "o_connect", text: "Connect the two crimes", visible: found, done: { deduction: "D12" } },
  { id: "o_conclude", text: "File your final report from the office", visible: found, done: { flag: "case_closed" } },
];

/* The report can be opened once the Marshes have been found and the investigation has substance. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [{ flag: "casefile_read" }, found, { evidenceCount: 10 }],
};
