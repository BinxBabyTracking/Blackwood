import type {
  CallDef,
  CaseDefinition,
  DeliveryDef,
  DocumentDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
} from "@/game/engine/types";

/* DRAFT CASE CONTENT: see characters.ts. Nothing in this file names the culprit. */

export const intro: CaseDefinition["intro"] = [
  { heading: "Monday, August 26, 1985", text: "Wilshire Boulevard, eleventh floor. The air conditioning has given up again." },
  {
    text: "A folder from LAPD Northeast Division is waiting on your desk. Clipped to the front is a note from Detective Frank Bennett:",
  },
  {
    text: "'Eleanor Whitmore, 64, killed in her own living room nine days ago after a supper for four guests. We have a cut screen, an open back door, and four statements that all hang together. Something doesn't. The department wants it closed. I want it right. Take a look. F.B.'",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "7:30 PM", text: "Eleanor Whitmore's supper begins. Four guests attend.", source: "Case file" },
  { time: "7:40 AM (Sun)", text: "Margaret Ellis finds Eleanor in the living room.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "LAPD case file 85-NE-2291: Whitmore, Eleanor",
    dossier: [
      { label: "Case ID", value: "C001" },
      { label: "Case title", value: "The Whitmore File" },
      { label: "Classification", value: "Homicide" },
      { label: "Location", value: "Los Angeles, California" },
      { label: "Year", value: "1985" },
      { label: "Victim", value: "Eleanor Whitmore, 64" },
      { label: "Police contact", value: "Det. Frank Bennett, LAPD Northeast Division" },
    ],
    people: ["margaret", "daniel", "robert", "patricia"],
    evidence: ["E06", "E12"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary",
        body: "Victim: Eleanor Ruth Whitmore, 64, widow, 1418 Hollister Avenue. Found deceased in her living room at 0740 hours Sunday 8/18/85 by neighbour Margaret Ellis. Cause of death: stab wound to the chest. Coroner estimates death between 2330 Saturday and 0130 Sunday.",
      },
      {
        heading: "Scene",
        body: "Signs of a struggle in the living room. Kitchen window screen cut. Rear door to yard found unlocked. Working theory: intruder entered through kitchen. No property reported missing; jewellery and $140 in the victim's handbag untouched.",
      },
      {
        heading: "Persons present Saturday evening",
        body: "Margaret Ellis, neighbour. Daniel Mercer, manages the late husband's estate. Robert Hale, mechanic and family friend. Patricia Wells, niece. All four gave statements on 8/18. Tapes and transcripts attached.",
      },
      {
        heading: "Addresses",
        body: "Ellis: 1421 Hollister Ave (opposite). Mercer: 2240 Griffith Park Blvd, apt 2B, Silver Lake. Hale: Hale Automotive, Fletcher Dr. Wells: Pacific Crest Savings & Loan, Vermont Ave. Mercer reports spending the night at the Maple Street Diner, Sunset at Maple.",
      },
      {
        heading: "Open questions (Det. Bennett)",
        body: "Why cut a screen and then use the door? Why is nothing missing? Why did no neighbour hear glass break? I have not been able to answer any of these.",
      },
      {
        heading: "Attached",
        body: "Photograph and report extract for the weapon (property tag 85-41173). My notes on when each guest left. One shard of the broken glass, bagged and held at the scene for you.",
      },
    ],
  },
];

export const statements: StatementDef[] = [
  {
    characterId: "margaret",
    recordedAt: "Sun 8/18/85, 11:10 AM",
    audio: "rec.margaret",
    transcript: [
      { speaker: "Det. Bennett", text: "Take your time, Mrs. Ellis. When did you leave last night?" },
      { speaker: "Margaret Ellis", text: "About half past ten. I walked home. I only live across the street." },
      { speaker: "Det. Bennett", text: "Did you see or hear anything unusual after that?" },
      { speaker: "Margaret Ellis", text: "No. I watched the news and went to bed. This morning I went over with the paper like I always do, and the door was locked, so I used my key, and..." },
      { speaker: "Det. Bennett", text: "That's all right. That's enough for now." },
    ],
  },
  {
    characterId: "daniel",
    recordedAt: "Sun 8/18/85, 2:30 PM",
    audio: "rec.daniel",
    transcript: [
      { speaker: "Det. Bennett", text: "Mr. Mercer, what time did you leave Mrs. Whitmore's?" },
      { speaker: "Daniel Mercer", text: "A quarter to eleven, give or take. I drove to the Maple Street Diner on Sunset." },
      { speaker: "Det. Bennett", text: "How long were you there?" },
      { speaker: "Daniel Mercer", text: "Until about one. I couldn't sleep, so I had pie and read the paper. The waitress, Linda, she'll remember me." },
      { speaker: "Det. Bennett", text: "And Mrs. Whitmore's finances? You managed them." },
      { speaker: "Daniel Mercer", text: "I managed her late husband's estate. Everything is in order. You're welcome to see my reports." },
    ],
  },
  {
    characterId: "robert",
    recordedAt: "Sun 8/18/85, 4:05 PM",
    audio: "rec.robert",
    transcript: [
      { speaker: "Det. Bennett", text: "Mr. Hale, you left first?" },
      { speaker: "Robert Hale", text: "Ten twenty or so. I open the shop at seven on Sundays." },
      { speaker: "Det. Bennett", text: "Anything strike you as wrong during the evening?" },
      { speaker: "Robert Hale", text: "No. It was a nice supper. Eleanor was a good woman. That's all I know." },
    ],
  },
  {
    characterId: "patricia",
    recordedAt: "Sun 8/18/85, 5:20 PM",
    audio: "rec.patricia",
    transcript: [
      { speaker: "Det. Bennett", text: "Miss Wells, I'm sorry for your loss. When did you leave?" },
      { speaker: "Patricia Wells", text: "Ten to eleven. Aunt Eleanor walked me to the door. Daniel had already gone." },
      { speaker: "Det. Bennett", text: "Was your aunt worried about anything?" },
      { speaker: "Patricia Wells", text: "She'd been quiet lately. Distracted. I thought she was tired." },
    ],
  },
];

export const calls: CallDef[] = [
  {
    id: "call_margaret_sedan",
    from: "margaret",
    title: "Call from Margaret Ellis",
    lines: [
      "It's Margaret Ellis. I hope I'm not being silly, but after you left I kept thinking about that night, and something came back to me.",
      "After the news I let the cat in. That would have been a quarter past twelve. There was a car parked under the jacaranda by Eleanor's house with its lights off. A big dark sedan.",
      "When I came down for a glass of water at half past twelve, it was gone. I didn't think anything of it. People park there.",
    ],
    effects: [
      { timeline: { time: "12:15 AM", text: "Margaret sees a dark sedan, lights off, parked by Eleanor's house.", source: "Margaret Ellis (telephone)" } },
      { timeline: { time: "12:30 AM", text: "The sedan is gone.", source: "Margaret Ellis (telephone)" } },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [
  {
    id: "call_bennett_lab",
    to: "bennett",
    label: "Ask Det. Bennett to have the glass shard analysed",
    available: { hasEvidence: "E02" },
    done: { flag: "lab_requested" },
    lines: [
      "Bennett: The glass? The lab typed the victim's blood and called it a day. You think there's more on it?",
      "Bennett: All right. I'll lean on SID and have them type the shard against the guests' voluntary samples. I'll send the report over by courier.",
    ],
    effects: [{ setFlag: "lab_requested" }, { setFlag: "has_mail" }, { delivery: "lab_report" }],
  },
  {
    id: "call_bennett_jacket",
    to: "bennett",
    label: "Tell Det. Bennett the jacket at Mercer's apartment has disappeared",
    available: { all: [{ flag: "saw_jacket" }, { flag: "jacket_missing" }] },
    done: { flag: "jacket_search" },
    lines: [
      "Bennett: A tan windbreaker with a wet cuff, and now it's gone. That's enough for me to take a look at the trash.",
      "Bennett: ...You were right. Two of my officers just pulled it out of the dumpster behind his building, under a sack of grass clippings. It's gone to the lab, and I'll have it sent to you with their notes.",
    ],
    effects: [{ setFlag: "jacket_search" }, { setFlag: "has_mail" }, { delivery: "jacket_recovered" }],
  },
  {
    id: "call_bennett_general",
    to: "bennett",
    label: "Call Det. Bennett for an update",
    available: { flag: "casefile_read" },
    done: { not: { always: true } },
    lines: [
      "Bennett: Nothing new on our side. The captain wants it filed as a burglary gone wrong. If you find something that says otherwise, I'm listening.",
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lab_report",
    title: "Courier envelope from LAPD Scientific Investigation Division",
    text: "Typed results with a note from Bennett: 'Rushed it. You owe me. F.B.'",
    evidence: ["E11"],
  },
  {
    id: "jacket_recovered",
    title: "LAPD evidence bag: recovered jacket",
    text: "Bennett's note: 'Pulled from the dumpster behind 2240 Griffith Park Blvd. Lab notes clipped to the bag.'",
    evidence: ["E05"],
  },
  {
    id: "patricia_envelope",
    title: "Envelope from Patricia Wells",
    text: "A Pacific Crest envelope, hand-addressed. Inside, a short note: 'This was in Aunt Eleanor's handbag when the police returned it. It's from the statements I pulled for her. I can't look at it any more. P.W.'",
    evidence: ["E15"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    title: "Margaret's telephone call",
    trigger: { all: [{ asked: "margaret_evening" }, { visited: "living_room" }, { not: { at: "margaret_house" } }] },
    effects: [{ incomingCall: "call_margaret_sedan" }, { message: "The telephone in your office is ringing." }],
  },
  {
    id: "RE02",
    title: "Daniel's apartment changes",
    trigger: {
      all: [
        { flag: "saw_jacket" },
        { talkedTo: "daniel" },
        { any: [{ asked: "daniel_hand" }, { hasEvidence: "E13" }, { hasEvidence: "E11" }] },
        { not: { at: "daniel_apartment" } },
      ],
    },
    effects: [{ setEnv: "daniel_apartment", to: "B" }],
  },
  {
    id: "RE03",
    title: "Patricia's envelope",
    trigger: { all: [{ asked: "patricia_money" }, { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }] }] },
    effects: [{ setFlag: "has_mail" }, { delivery: "patricia_envelope" }, { message: "An envelope has been left for you at your office." }],
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read Detective Bennett's case file", visible: { always: true }, done: { flag: "casefile_read" } },
  { id: "o_scene", text: "Examine the Whitmore residence, inside and out", visible: { flag: "casefile_read" }, done: { all: [{ visited: "living_room" }, { visited: "kitchen" }] } },
  { id: "o_tapes", text: "Review the recorded police statements", visible: { flag: "casefile_read" }, done: { inspected: "office_recorder" } },
  {
    id: "o_guests",
    text: "Interview all four guests",
    visible: { flag: "casefile_read" },
    done: { all: [{ talkedTo: "margaret" }, { talkedTo: "daniel" }, { talkedTo: "robert" }, { talkedTo: "patricia" }] },
  },
  { id: "o_board", text: "Connect evidence on the murder board to establish what happened", visible: { evidenceCount: 3 }, done: { any: [{ deduction: "D_STAGED" }, { deduction: "D_STRUGGLE" }, { deduction: "D_INJURED" }, { deduction: "D_MOTIVE" }, { deduction: "D_LAWYER" }, { deduction: "D_ALIBI" }, { deduction: "D_JACKET" }, { deduction: "D_HAND" }] } },
  { id: "o_conclude", text: "File your conclusion with the agency", visible: { flag: "casefile_read" }, done: { flag: "case_closed" } },
];
