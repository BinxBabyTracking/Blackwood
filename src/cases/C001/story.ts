import type {
  CallDef,
  CaseDefinition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
} from "@/game/engine/types";
import { LAB_GLASS_RECT, LAB_SAMPLES_RECT } from "./desk";

/* DRAFT CASE CONTENT: see characters.ts. Nothing in this file names the culprit. */

export const intro: CaseDefinition["intro"] = [
  { heading: "Monday, August 26, 1985", text: "Wilshire Boulevard, eleventh floor. The air conditioning has given up again." },
  {
    text: "A folder from LAPD Northeast Division is waiting on your desk. Clipped to the front is a note from Detective Frank Bennett:",
  },
  {
    text: "'Eleanor Whitmore, 64, killed in her own living room ten days ago, on Friday night, after a supper for four guests. We have a cut screen, an open back door, and four statements that all hang together. Something doesn't. The department wants it closed. I want it right. Take a look. F.B.'",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "7:00 PM", text: "Friday, August 16. Guests begin arriving for supper at Eleanor Whitmore's.", source: "Case file" },
  { time: "7:40 AM (Sat)", text: "Saturday, August 17. Margaret Ellis finds Eleanor in the living room.", source: "Case file" },
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
    peopleHeading: "Persons present, Friday evening",
    evidence: ["E12"],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary",
        body: "Victim: Eleanor Ruth Whitmore, 64, widow, 1418 Hollister Avenue. Found deceased in her living room at 0740 hours Saturday 8/17/85 by neighbour Margaret Ellis. Cause of death: stab wound to the chest. Coroner's preliminary estimate of time of death: approximately 2300 Friday 8/16 to 0100 Saturday 8/17.",
      },
      {
        heading: "Scene",
        body: "Signs of a struggle in the living room. Kitchen window screen cut. Rear door to yard found unlocked. Working theory: intruder entered through kitchen. No property reported missing; jewellery and $140 in the victim's handbag untouched.",
      },
      {
        heading: "Persons present Friday evening",
        body: "Margaret Ellis, neighbour. Daniel Mercer, manages the late husband's estate. Robert Hale, mechanic and family friend. Patricia Wells, niece. Supper from approximately 1900; all four guests state they had left by 2230. All four gave recorded statements on 8/17. Tapes and transcripts attached.",
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
        body: "My notes on when each guest left. One shard of the broken glass is bagged and held at the scene for you; if you want it typed, tell me and I'll get it to the lab; the knife block in the kitchen is tagged. Call me any time on the office line. F.B.",
      },
    ],
  },
];

const B = (text: string) => ({ speakerId: "bennett", speaker: "Det. Bennett", text });
const officer = "Det. Frank Bennett, LAPD Northeast Division";

/* Initial statements, Saturday 8/17/85. Consistent with the timeline; none names the culprit. */
export const statements: StatementDef[] = [
  {
    characterId: "margaret",
    recordedAt: "Sat 8/17/85, 10:15 AM",
    officer,
    tape: "85-NE-2291 / Tape 1",
    audio: "rec.margaret",
    transcript: [
      B("This is Detective Bennett, Northeast Division, Saturday the seventeenth. Mrs. Ellis, take your time. When did you leave last night?"),
      { speakerId: "margaret", speaker: "Margaret Ellis", text: "About ten past ten. I walked home. I live just across the street." },
      B("Who was still there when you left?"),
      { speakerId: "margaret", speaker: "Margaret Ellis", text: "Patricia and Daniel. Robert had gone a few minutes before me." },
      B("Did you see or hear anything unusual after that?"),
      { speakerId: "margaret", speaker: "Margaret Ellis", text: "No. I watched the news, and I'm afraid I fell asleep in my chair. This morning I went over with the paper like I always do. The door was locked, so I used my key, and then I saw her." },
      B("That's all right. That's enough for now."),
    ],
  },
  {
    characterId: "daniel",
    recordedAt: "Sat 8/17/85, 2:30 PM",
    officer,
    tape: "85-NE-2291 / Tape 2",
    audio: "rec.daniel",
    transcript: [
      B("Mr. Mercer, what time did you leave Mrs. Whitmore's last night?"),
      { speakerId: "daniel", speaker: "Daniel Mercer", text: "About twenty-five past ten. I was the last to go." },
      B("And after that?"),
      { speakerId: "daniel", speaker: "Daniel Mercer", text: "I drove to the Maple Street Diner on Sunset. I couldn't sleep, so I had pie and read the paper until about one. The waitress, Linda, she'll remember me." },
      B("You managed Mrs. Whitmore's finances."),
      { speakerId: "daniel", speaker: "Daniel Mercer", text: "I managed her late husband's estate. Everything is in order. You're welcome to see my reports." },
    ],
  },
  {
    characterId: "robert",
    recordedAt: "Sat 8/17/85, 4:05 PM",
    officer,
    tape: "85-NE-2291 / Tape 3",
    audio: "rec.robert",
    transcript: [
      B("Mr. Hale, you were the first to leave?"),
      { speakerId: "robert", speaker: "Robert Hale", text: "Ten o'clock or so. I open the shop at seven on Saturdays." },
      B("Anything strike you as wrong during the evening?"),
      { speakerId: "robert", speaker: "Robert Hale", text: "No. It was a nice supper. Eleanor was a good woman. That's all I know." },
    ],
  },
  {
    characterId: "patricia",
    recordedAt: "Sat 8/17/85, 5:20 PM",
    officer,
    tape: "85-NE-2291 / Tape 4",
    audio: "rec.patricia",
    transcript: [
      B("Miss Wells, I'm sorry for your loss. When did you leave your aunt's house?"),
      { speakerId: "patricia", speaker: "Patricia Wells", text: "About twenty past ten. Aunt Eleanor walked me to the door." },
      B("Who was still in the house?"),
      { speakerId: "patricia", speaker: "Patricia Wells", text: "Only Daniel. He was helping her clear up." },
      B("Was your aunt worried about anything?"),
      { speakerId: "patricia", speaker: "Patricia Wells", text: "She'd been quiet lately. Distracted. I thought she was tired." },
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
      "I'd dozed off in my chair after the news, and the cat woke me scratching at the door. Ten past twelve by the mantel clock. When I let him in, there was a car parked under the jacaranda by Eleanor's house with its lights off. A big dark sedan.",
      "When I came down for a glass of water at half past twelve, it was gone. I didn't think anything of it at the time. People do park there.",
    ],
    effects: [
      { timeline: { time: "12:10 AM", text: "Margaret sees a dark sedan, lights off, parked under the jacaranda by Eleanor's house.", source: "Margaret Ellis (telephone)" } },
      { timeline: { time: "12:30 AM", text: "The sedan is gone.", source: "Margaret Ellis (telephone)" } },
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Det. Bennett",
    lines: [
      "Bennett. You've been busy. I hear you've got a pocketful of evidence and nothing up on the wall yet.",
      "Here's how I work a case. Every piece goes up on the board in your office. Then you run string between anything that belongs together: a cut and a blood type, a time and a place, a ledger and a bank statement.",
      "Each one on its own doesn't say much. When two of them fit, you'll know it, and the picture starts to show up. Call me if you need me.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Det. Bennett: use the board",
          text: "Pin the evidence on the murder board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

/*
 * Det. Bennett is now interviewed by telephone (see characters.ts). These
 * entries remain only so older call logs keep their titles; they are never offered.
 */
export const outgoingCalls: OutgoingCallDef[] = [
  { id: "call_bennett_jacket", to: "bennett", label: "Asked Det. Bennett to search for the jacket", available: { not: { always: true } }, done: { always: true }, lines: [] },
  { id: "call_bennett_general", to: "bennett", label: "Called Det. Bennett for an update", available: { not: { always: true } }, done: { always: true }, lines: [] },
];

/*
 * Police lab tests. Each takes real time from the moment Det. Bennett sends
 * it, shown as a countdown on the office desk; the results then arrive there.
 */
export const labs: LabDef[] = [
  {
    id: "glass",
    label: "Blood typing: the broken glass",
    seconds: 180,
    rect: LAB_GLASS_RECT,
    onReady: [{ delivery: "lab_glass" }, { message: "The police lab's results on the broken glass are on your desk." }],
  },
  {
    id: "samples",
    label: "Blood typing: the guests",
    seconds: 180,
    rect: LAB_SAMPLES_RECT,
    onReady: [{ delivery: "lab_samples" }, { message: "The lab's comparison of the guests' blood is on your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lab_glass",
    title: "Lab results: the broken glass",
    exterior: "A thin LAPD laboratory folder, stamped RESULTS and clipped shut.",
    text: "Det. Bennett's note on the folder: 'Typing on the glass you asked for. Read item 3. F.B.'",
    evidence: ["E11"],
  },
  {
    id: "lab_samples",
    title: "Lab results: the guests' blood",
    exterior: "A second LAPD laboratory folder, stamped SUPPLEMENTARY.",
    text: "Det. Bennett's note on the folder: 'All four guests gave samples without a fuss. Here's how they compare to the glass. F.B.'",
    evidence: ["E16"],
  },
  {
    id: "jacket_recovered",
    title: "LAPD evidence bag",
    exterior: "A brown paper evidence bag, sealed with red tape and tagged by LAPD Northeast Division.",
    text: "Det. Bennett's note, clipped to the bag: 'Recovered from the dumpster behind 2240 Griffith Park Blvd., under a sack of grass clippings. The lab has had it; their notes are attached. F.B.'",
    evidence: ["E05"],
  },
  {
    id: "patricia_envelope",
    title: "Envelope from Patricia Wells",
    exterior: "A sealed manila envelope, addressed by hand to you care of Blackwood Investigations. The return address is Pacific Crest Savings & Loan, Vermont Avenue.",
    text: "A short note on Pacific Crest letterhead: 'The police returned Aunt Eleanor's handbag with her things. This was folded in the inside pocket. It's from the statements I pulled for her, and she had marked some of the lines. I can't look at it any more. Please take it. P.W.'",
    evidence: ["E15"],
  },
];

/*
 * Reactive events. Each is independent and driven only by investigation
 * state: discoveries, interviews, deductions and visits, never time. They
 * can resolve in any order, and every order arrives at the same facts.
 * Requirements live here on the server; the browser only sees what an
 * event changes in the world.
 */

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "C001",
    title: "Margaret's telephone call",
    characterId: "margaret",
    // Margaret has been interviewed about that night, and the investigator has the guests' timeline in hand.
    requires: {
      all: [
        { any: [{ asked: "margaret_evening" }, { asked: "margaret_departure" }, { asked: "margaret_noise" }, { asked: "margaret_mostly" }, { asked: "margaret_guests" }] },
        { any: [{ hasEvidence: "E12" }, { inspected: "office_recorder" }, { deduction: "D_ALIBI" }] },
      ],
    },
    // The telephone rings when the investigator is next in the office.
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_margaret_sedan" }, { message: "Agency telephone ringing." }],
    complete: { callAnswered: "call_margaret_sedan" },
    onComplete: [
      { setFlag: "margaret_recalled_sedan" },
      {
        note: {
          id: "statement:RE01",
          kind: "interview",
          title: "Margaret Ellis: a later recollection",
          text: "Margaret remembered a large dark sedan parked by Eleanor's house with its lights off at about 12:10 AM. It was gone by 12:30.",
          characterId: "margaret",
          important: true,
        },
      },
    ],
    unlocksQuestions: ["margaret_sedan_more", "margaret_sedan_driver", "margaret_confidence"],
    notebook: {
      call: "call_margaret_sedan",
      learned: [
        { text: "Margaret Ellis telephoned with something she had remembered about the night.", requires: { callAnswered: "call_margaret_sedan" } },
        { text: "At about 12:10 AM a large dark sedan was parked under the jacaranda by Eleanor's house, lights off. By 12:30 it was gone.", requires: { callAnswered: "call_margaret_sedan" } },
        { text: "Margaret describes a crumpled rear fender on the street side. She would not guess whose car it was.", requires: { asked: "margaret_sedan_more" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C001",
    title: "Daniel's apartment changes",
    characterId: "daniel",
    // He has been interviewed in his apartment, and the investigation has started to point at an injury or at his account of the night.
    requires: { all: [{ visited: "daniel_apartment" }, { any: [{ asked: "daniel_evening" }, { asked: "daniel_departure" }, { asked: "daniel_afterwards" }, { asked: "daniel_gathering" }] }, { any: [{ deduction: "D_INJURED" }, { deduction: "D_HAND" }, { deduction: "D_ALIBI" }] }] },
    // The change happens while the investigator is elsewhere.
    activate: { not: { at: "daniel_apartment" } },
    onActivate: [{ setEnv: "daniel_apartment", to: "B" }],
    complete: { deliveryOpened: "jacket_recovered" },
    unlocksQuestions: ["bennett_jacket_where"],
    evidence: ["E05"],
    notebook: {
      // Only once the investigator has seen the changed apartment, or acted on it.
      visible: { any: [{ inspected: "da_coats_b" }, { inspected: "da_suitcase" }, { inspected: "da_ashtray" }, { flag: "jacket_search" }] },
      delivery: "jacket_recovered",
      learned: [
        { text: "Daniel Mercer's apartment has changed since your earlier visit." },
        { text: "The tan windbreaker you saw on his coat rack is no longer there.", requires: { flag: "jacket_missing" } },
        { text: "A packed suitcase stands by the door.", requires: { inspected: "da_suitcase" } },
        { text: "Fresh ash in the ashtray, with the corner of a typed page.", requires: { inspected: "da_ashtray" } },
        { text: "At your request, Det. Bennett's officers searched the dumpster behind the building and recovered a tan windbreaker.", requires: { flag: "jacket_search" } },
        { text: "The windbreaker was delivered to your office in a police evidence bag.", requires: { deliveryOpened: "jacket_recovered" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "C001",
    title: "Patricia's envelope",
    characterId: "patricia",
    // Patricia has been interviewed and asked about money, and the investigator has seen the ledger or established the irregularities.
    requiresInterviews: ["patricia_money"],
    requires: { any: [{ hasEvidence: "E03" }, { deduction: "D_MOTIVE" }] },
    activate: { at: "office" },
    onActivate: [{ delivery: "patricia_envelope" }, { message: "An item has been delivered." }],
    complete: { hasEvidence: "E15" },
    unlocksQuestions: ["patricia_envelope", "patricia_circled"],
    evidence: ["E15"],
    notebook: {
      delivery: "patricia_envelope",
      learned: [
        { text: "A sealed manila envelope from Patricia Wells was left on your desk." },
        { text: "Inside: a note from Patricia and a torn page from the estate account statements, found in Eleanor's handbag.", requires: { deliveryOpened: "patricia_envelope" } },
      ],
    },
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read Detective Bennett's case file", visible: { always: true }, done: { flag: "casefile_read" } },
  { id: "o_scene", text: "Examine the Whitmore residence, inside and out", visible: { flag: "casefile_read" }, done: { all: [{ visited: "living_room" }, { visited: "kitchen" }] } },
  { id: "o_bennett", text: "Speak with Det. Bennett on the office telephone", visible: { flag: "casefile_read" }, done: { talkedTo: "bennett" } },
  { id: "o_lab", text: "Get the broken glass to the police lab", visible: { hasEvidence: "E02" }, done: { labStarted: "glass" } },
  { id: "o_tapes", text: "Review the recorded police statements", visible: { flag: "casefile_read" }, done: { inspected: "office_recorder" } },
  {
    id: "o_guests",
    text: "Interview all four guests",
    visible: { flag: "casefile_read" },
    done: { all: [{ talkedTo: "margaret" }, { talkedTo: "daniel" }, { talkedTo: "robert" }, { talkedTo: "patricia" }] },
  },
  { id: "o_board", text: "Connect evidence on the murder board to establish what happened", visible: { evidenceCount: 3 }, done: { any: [{ deduction: "D_STAGED" }, { deduction: "D_STRUGGLE" }, { deduction: "D_INJURED" }, { deduction: "D_MOTIVE" }, { deduction: "D_LAWYER" }, { deduction: "D_ALIBI" }, { deduction: "D_JACKET" }, { deduction: "D_HAND" }] } },
  { id: "o_conclude", text: "Prepare and file your final report from the office desk", visible: { evidenceCount: 6 }, done: { flag: "case_closed" } },
];

/** The final report can be opened once the investigation has real substance: briefed, evidence in hand, and at least one guest interviewed. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [
    { flag: "casefile_read" },
    { evidenceCount: 6 },
    { any: [{ talkedTo: "margaret" }, { talkedTo: "daniel" }, { talkedTo: "robert" }, { talkedTo: "patricia" }] },
  ],
};
