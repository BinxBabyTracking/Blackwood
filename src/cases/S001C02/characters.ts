import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C02 "Room 614" interviews, written against docs/S001C02-timeline.md.
 *
 * Rules for this file: nobody confesses; Hurst, Lyons, Rourke, Grant and
 * Okoye give their own accounts, lies included, and move only when the design
 * says; nobody says who took Jonathan or who gave the orders before the
 * closing; every time, amount and number agrees with the timeline. Nothing
 * from the "Closing report only" list is said by anyone. Jonathan tells only
 * what he saw and heard. Nobody names anyone above Rourke, and nobody
 * mentions Dr. Lockhart. Nobody explains the copier footer or the courier
 * account on E033. Det. Collins starts at voluntary absence and moves with
 * the evidence. Every handover is an authored answer with `giveEvidence`,
 * matched by a knowledge fact with the same gate and effect.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const d = (id: string): Condition => ({ deduction: id });
const not = (c: Condition): Condition => ({ not: c });
const all = (...c: Condition[]): Condition => ({ all: c });
const any = (...c: Condition[]): Condition => ({ any: c });

const hurstKnown: Condition = any(ev("E009"), ev("E015"), ev("E016"));
const lyonsKnown: Condition = any(ev("E027"), ev("E028"), ev("E034"));
const chenKnown: Condition = any(ev("E021"), ev("E020"), ev("E003"));
const rourkeKnown: Condition = any(ev("E026"), ev("E025"), { event: "RE04" });
const natalieGarage: Condition = { flag: "natalie_garage" };
const natalieTruth: Condition = any(ev("E025"), ev("E019"), { talkedTo: "jonathan" });
const hurstOpen: Condition = any({ flag: "hurst_admits" }, d("D11"));
const okoyeOpen: Condition = any(ev("E017"), d("D08"));
const carrierGate: Condition = any(d("D04"), d("D05"));
const plateGate: Condition = any(d("D07"), all(ev("E011"), ev("E013")));
const kestrelGate: Condition = all(d("D11"), { chapter: 3 });
const chenRelease: Condition = { flag: "chen_release" };
const rescued: Condition = { event: "RE07" };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The missing man: on the board from the start, interviewable after RE07
  // ---------------------------------------------------------------------
  {
    id: "jonathan",
    name: "Jonathan Ellery",
    role: "Senior procurement analyst, Eastbridge Systems. Missing",
    portrait: "char.jonathan",
    bio: [
      { text: "Forty-one. Senior procurement analyst at Eastbridge Systems, Reston, Virginia. Lives in Clarendon, Arlington. Natalie Ellery's brother." },
      { text: "Checked into Room 614 of the Ashcroft Hotel at 3:44 PM on Sunday, November 18, 2018. Missed a 9:30 AM task force interview on Monday." },
      { text: "Paid $2,500 a month by Northgate Bridge Lending since June 2017.", requires: ev("E019") },
      { text: "Found alive in an upstairs room at 4 Sawmill Hollow Road, Frederick County, Maryland, on Wednesday, November 21.", requires: rescued },
    ],
    available: rescued,
    locationId: "holding_property",
    phone: rescued,
    contact: "Recovering, with Agent Quinlan's team.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I'm sorry. I'm not thinking very clearly.",
    idleLine: "I need to sit for a minute. Please.",
    noAnswer: ["I don't know.", "I never saw that. I only know what I saw.", "I can't tell you that. I wish I could."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "Man of forty-one, a procurement analyst, exhausted after three days locked in a room: quiet, ashamed, precise, steadier as he goes. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "ashamed", label: "Ashamed", requires: { always: true } },
      { id: "candid", label: "Candid", requires: { asked: "jonathan_2017" }, cue: "Jonathan pulls the blanket tighter and looks at you straight for the first time." },
    ],
  },

  // ---------------------------------------------------------------------
  // The client
  // ---------------------------------------------------------------------
  {
    id: "natalie",
    name: "Natalie Ellery",
    role: "Jonathan's sister, your client",
    portrait: "char.natalie",
    bio: [
      { text: "Thirty-seven. Physical therapist in Pittsburgh; Bennett is one of her patients. Lives near their mother's memory-care home in Cranberry Township." },
      { text: "Reported Jonathan missing to MPD by phone at 11:20 AM on Monday, November 19, then called Bennett. Drove down to Washington with you." },
    ],
    available: { always: true },
    locationId: "lobby",
    phone: { always: true },
    contact: "Your client. Jonathan's sister.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. Jon never told me anything about work.",
    idleLine: "I need a minute. Call me when you know something.",
    noAnswer: ["I don't know.", "Jon never told me that.", "I wish I knew."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman of thirty-seven, a physical therapist: practical, blunt, frightened for her brother and holding it together by being useful. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "frightened", label: "Frightened", requires: { always: true } },
      { id: "determined", label: "Determined", requires: any(natalieGarage, d("D02")), cue: "Natalie has stopped twisting her car keys. She's taking notes on her phone." },
    ],
  },

  // ---------------------------------------------------------------------
  // Meridian and Kestrel
  // ---------------------------------------------------------------------
  {
    id: "rourke",
    name: "Julian Rourke",
    role: "Director of Corporate Intelligence, Meridian Advisory Group",
    portrait: "char.rourke",
    bio: [
      { text: "Forty-six. Director of Corporate Intelligence at Meridian Advisory Group, eighth floor, 1620 K Street NW, Washington." },
      { text: "Signed Jonathan Ellery's independent advisor agreement on June 1, 2017.", requires: ev("E025") },
      { text: "His Meridian cell, (202) 555-0108, called Jonathan 14 times in 2018.", requires: ev("E026") },
      { text: "In federal custody since Wednesday afternoon, November 21.", requires: { event: "RE08" } },
    ],
    available: all({ event: "RE04" }, not({ event: "RE08" })),
    known: rourkeKnown,
    locationId: "meridian_hq",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what you'd like me to say about that.",
    idleLine: "I have a client waiting. Do call my assistant.",
    noAnswer: ["I couldn't say.", "That isn't something I'd know.", "I'm afraid that's outside my remit."],
    voice: {
      voiceId: "SOYHLrjzK2X1ezoPC6cr",
      direction: "Man in his mid forties, a Washington corporate intelligence director: polished, warm, unhurried, perfectly reasonable; shorter and colder under pressure. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: any(ev("E026"), ev("E033")), cue: "Rourke's smile stays. He stops offering coffee." },
      { id: "cold", label: "Cold", requires: any(ev("E034"), ev("E035")), cue: "Rourke folds his hands on the desk and waits for you to finish." },
    ],
  },
  {
    id: "lyons",
    name: "Garrett Lyons",
    role: "Principal, Kestrel Protective Group",
    portrait: "char.lyons",
    bio: [
      { text: "Thirty-nine. Principal of Kestrel Protective Group LLC, Suite 210, 1100 East Gude Drive, Rockville, Maryland. Former Army military police." },
      { text: "Kestrel's gray 2016 Ford Transit Connect, MD 3CR7719, is registered with him as company principal.", requires: ev("E027") },
      { text: "Managing member of Briarfield Holdings LLC, tenant of 4 Sawmill Hollow Road.", requires: ev("E028") },
      { text: "Arrested in the farmhouse driveway on Wednesday, November 21.", requires: rescued },
    ],
    available: any(all({ chapter: 3 }, lyonsKnown, not({ flag: "kestrel_search" })), rescued),
    known: lyonsKnown,
    locationId: "kestrel",
    moves: [{ when: rescued, locationId: "holding_property" }],
    onBoard: true,
    defaultEvidenceReply: "Interesting paper. Doesn't mean much to me.",
    idleLine: "I've got a business to run. We're done.",
    noAnswer: ["No idea.", "Couldn't tell you.", "That's not my business."],
    voice: {
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      direction: "Man of thirty-nine, a former Army MP running a security firm: relaxed, practical, faintly amused; flat and hard when cornered. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "easy", label: "Easy", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: ev("E027"), cue: "Lyons sets his coffee down and stops smiling." },
      { id: "hostile", label: "Hostile", requires: d("D11"), cue: "Lyons leans back and looks at you like a problem he's been paid to handle." },
      {
        id: "custody",
        label: "In custody",
        requires: rescued,
        refuses: "I want a lawyer.",
        idleLine: "Lawyer.",
        cue: "Lyons sits in the back of the state police car, cuffed, looking straight ahead.",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // The Ashcroft
  // ---------------------------------------------------------------------
  {
    id: "hurst",
    name: "Kevin Hurst",
    role: "Maintenance Engineer II, the Ashcroft",
    portrait: "char.hurst",
    bio: [
      { text: "Thirty-two. Maintenance Engineer II at the Ashcroft Hotel since March 2016. Staff badge 2231." },
      { text: "Worked 2 PM to 10 PM on Sunday, November 18. Clocked out at 10:02 PM.", requires: ev("E016") },
      { text: "Created temporary vendor badge T-07 at 9:41 PM on Sunday.", requires: ev("E015") },
    ],
    available: { chapter: 2 },
    known: hurstKnown,
    locationId: "loading_dock",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I fix air handlers.",
    idleLine: "I gotta get back to work, man.",
    noAnswer: ["No idea.", "I don't know nothing about that.", "Ask security. I'm engineering."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man of thirty-two, a hotel maintenance engineer from D.C.: friendly, chatty, a sports fan; then nervous and talking too fast, then scared. American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 },
    },
    demeanor: [
      { id: "friendly", label: "Friendly", requires: { always: true } },
      { id: "nervous", label: "Nervous", requires: ev("E009"), cue: "Hurst keeps wiping his hands on a rag that's already clean." },
      { id: "frightened", label: "Frightened", requires: { flag: "hurst_admits" }, cue: "Hurst sits down on an upturned bucket. His knee won't stop bouncing." },
      { id: "talking", label: "Talking", requires: d("D11"), cue: "Hurst looks at the floor and starts talking before you ask." },
    ],
  },
  {
    id: "grant",
    name: "Celia Grant",
    role: "General manager, the Ashcroft",
    portrait: "char.grant",
    bio: [
      { text: "Forty-four. General manager of the Ashcroft Hotel, 1214 Fifteenth Street NW: 12 floors, 288 rooms." },
      { text: "Wrote the September 10 memo letting engineering issue after-hours vendor badges without security sign-off.", requires: ev("E015") },
    ],
    available: { always: true },
    locationId: "lobby",
    onBoard: true,
    defaultEvidenceReply: "I'd want our counsel to see that before I comment.",
    idleLine: "The house needs me. Let's continue later.",
    noAnswer: ["I wouldn't know that.", "That's a question for Douglas.", "I'd have to check with the department."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman in her mid forties, a downtown hotel general manager: polished, gracious, guarded about liability; clipped when defensive, then plainly honest. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: ev("E009"), cue: "Grant closes the door to her office before she answers." },
      { id: "candid", label: "Candid", requires: ev("E015"), cue: "Grant takes off her name badge and sets it on the desk." },
    ],
  },
  {
    id: "wallace",
    name: "Douglas Wallace",
    role: "Director of security, the Ashcroft",
    portrait: "char.wallace",
    bio: [
      { text: "Fifty-six. Director of security at the Ashcroft Hotel. Twenty-two years with the Metropolitan Police Department before that." },
      { text: "Read Room 614's lock at 10:52 AM on Monday and reviewed the sixth-floor camera." },
      { text: "Found the S6-2 alarm bypass under an engineer's code on Monday night.", requires: ev("E009") },
    ],
    available: { always: true },
    locationId: "lobby",
    moves: [{ when: { chapter: 2 }, locationId: "security_office" }],
    onBoard: true,
    defaultEvidenceReply: "Tell me what you think it means. Then I'll tell you if you're wrong.",
    idleLine: "I've got floors to walk. You know where to find me.",
    noAnswer: ["The system doesn't record that.", "Couldn't tell you.", "That's a question for the police."],
    voice: {
      voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      direction: "Man of fifty-six, a hotel security director and retired D.C. cop: gruff, exact, certain; troubled and then fully engaged once he sees he was wrong. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "certain", label: "Certain", requires: { always: true } },
      { id: "troubled", label: "Troubled", requires: ev("E008"), cue: "Wallace reads the access log twice and doesn't say anything for a while." },
      { id: "engaged", label: "Engaged", requires: ev("E009"), cue: "Wallace has his jacket off and a marker in his hand." },
    ],
  },
  {
    id: "monroe",
    name: "Tessa Monroe",
    role: "Front desk supervisor, the Ashcroft",
    portrait: "char.monroe",
    bio: [
      { text: "Twenty-nine. Front desk supervisor at the Ashcroft, 3 PM to 11 PM. Checked Jonathan in on Sunday afternoon." },
    ],
    available: { always: true },
    locationId: "lobby",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what that is.",
    idleLine: "I have guests waiting. Come back any time.",
    noAnswer: ["I don't know, I'm sorry.", "I was at the desk. I didn't see that.", "You'd have to ask security."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman of twenty-nine, a hotel front desk supervisor: bright, conscientious, quick, eager to help and careful not to overstate. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [{ id: "helpful", label: "Helpful", requires: { always: true } }],
  },

  // ---------------------------------------------------------------------
  // Eastbridge and the lawyer
  // ---------------------------------------------------------------------
  {
    id: "okoye",
    name: "David Okoye",
    role: "Director of Ethics and Compliance, Eastbridge Systems",
    portrait: "char.okoye",
    bio: [
      { text: "Fifty-two. Director of Ethics and Compliance at Eastbridge Systems, 11900 Sunrise Valley Drive, Reston, Virginia." },
      { text: "His office opened internal review IR-18-027 on August 20, 2018.", requires: ev("E018") },
    ],
    available: { chapter: 3 },
    known: any({ chapter: 3 }, ev("E017"), ev("E004")),
    locationId: "eastbridge",
    onBoard: true,
    defaultEvidenceReply: "I'm not in a position to comment on that.",
    idleLine: "I have outside counsel waiting. Security will see you out.",
    noAnswer: ["I'm not in a position to say.", "That's not something compliance would know.", "I'd have to refer that to counsel."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man in his early fifties, a defense contractor's compliance director: careful, legalistic, worried; more human once he stops hiding. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "guarded", label: "Guarded", requires: { always: true } },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E018"), cue: "Okoye takes off his glasses and rubs his eyes. 'All right.'" },
    ],
  },
  {
    id: "chen",
    name: "Irene Chen",
    role: "Attorney, Law Office of Irene Chen",
    portrait: "char.chen",
    bio: [
      { text: "Forty-eight. White-collar and whistleblower counsel, Law Office of Irene Chen, PLLC, Suite 402, 1150 Seventeenth Street NW." },
      { text: "Jonathan Ellery's lawyer. Holds sealed deposit 18-114, left by him on Sunday, November 18.", requires: ev("E021") },
    ],
    available: { always: true },
    known: chenKnown,
    locationId: "chen_office",
    phone: { event: "RE05" },
    contact: "Law Office of Irene Chen, (202) 555-0161.",
    onBoard: true,
    defaultEvidenceReply: "I won't comment on that.",
    idleLine: "I have another client. You have my number.",
    noAnswer: ["I can't discuss that.", "I don't know.", "That's privileged, and it isn't mine to waive."],
    voice: {
      voiceId: "ThT5KcBeYPX3keUQqHPh",
      direction: "Woman of forty-eight, a white-collar defense lawyer: precise, careful, reserved, protective of her client; warmer once she decides to help. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "reserved", label: "Reserved", requires: { always: true } },
      { id: "cooperative", label: "Cooperative", requires: chenRelease, cue: "Chen lays a chain-of-custody form on the desk and uncaps her pen." },
    ],
  },

  // ---------------------------------------------------------------------
  // Police, FBI, records
  // ---------------------------------------------------------------------
  {
    id: "collins",
    name: "Det. Nadia Collins",
    role: "MPD Missing Persons Unit",
    portrait: "char.collins",
    bio: [
      { text: "Forty-two. Detective, Metropolitan Police Department, Missing Persons Unit (Youth and Family Services Division). Assigned to CCN 18197742 at 2:30 PM on Monday." },
      { text: "Reachable in the hotel lobby or by phone." },
    ],
    available: { always: true },
    locationId: "lobby",
    moves: [{ when: { event: "RE06" }, locationId: "holding_property" }],
    phone: { always: true },
    contact: "MPD Missing Persons. Lead on the Ellery case.",
    onBoard: false,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "Woman in her early forties, a D.C. missing persons detective: dry, quick, decent, unhurried; never overstates. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: carrierGate, cue: "Collins crosses out 'voluntary' on her pad and writes something else." },
    ],
  },
  {
    id: "quinlan",
    name: "Special Agent Teresa Quinlan",
    role: "FBI Washington Field Office",
    portrait: "char.quinlan",
    bio: [
      { text: "Forty-four. Special Agent, FBI Washington Field Office. Took the Ellery case federally when it crossed into Maryland." },
    ],
    available: rescued,
    known: rescued,
    locationId: "holding_property",
    phone: rescued,
    contact: "FBI Washington Field Office.",
    onBoard: false,
    defaultEvidenceReply: "I'll have it logged.",
    idleLine: "I have a scene to run. Call me.",
    noAnswer: ["I won't speculate.", "I don't know.", "That's not something I'll say yet."],
    voice: {
      voiceId: "Xb7hH8MSUJpSbSDYk0k2",
      direction: "Woman in her mid forties, an FBI special agent: measured, sparing with words, calm, exact. American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [{ id: "measured", label: "Measured", requires: { always: true } }],
  },
  {
    id: "bennett",
    name: "Frank Bennett",
    role: "Blackwood records, by phone",
    portrait: "char.bennett",
    bio: [
      { text: "Forty years with the LAPD, retired. Blackwood keeps him on to pull records and backgrounds." },
      { text: "Natalie Ellery is his physical therapist. Reachable by phone, any time." },
    ],
    available: { always: true },
    locationId: "office",
    medium: "telephone",
    contact: "Blackwood records. Backgrounds, records, a second opinion.",
    onBoard: false,
    defaultEvidenceReply: "Read it to me again. Over the phone it doesn't tell me much more than that.",
    idleLine: "That's all I've got right now. Call me when you've got something I can run down.",
    noAnswer: ["Nothing in the records on that.", "I can't help you there. Find me a name and I'll run it.", "That's not something I've got."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "Older man in his late sixties, retired detective, calm, dry, kind underneath. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [{ id: "professional", label: "Professional", requires: { always: true } }],
  },
];

const q = (characterId: string, topic: string, id: string, prompt: string, reply: string[], extra: Partial<DialogueQuestion> = {}): DialogueQuestion => ({
  id,
  characterId,
  topic,
  prompt,
  reply,
  ...extra,
});

const tl = (time: string, text: string, source: string) => ({ timeline: { time, text, source } });

export const questions: DialogueQuestion[] = [
  // =====================================================================
  // Natalie Ellery: the client
  // =====================================================================
  q("natalie", "Hiring us", "natalie_hire", "Why did you come to Blackwood?", [
    "Because Bennett's my patient, and when the police said grown men walk away, he was the first person I thought of.",
    "Jon doesn't walk away. I need somebody who'll look like he didn't.",
  ]),
  q("natalie", "Her brother", "natalie_jonathan", "Tell me about your brother.", [
    "He's forty-one. Senior procurement analyst at Eastbridge Systems, out in Reston. Apartment in Clarendon.",
    "He's a rule-follower. He color-codes his taxes. He irons his shirts on Sunday for the week.",
  ]),
  q("natalie", "Her brother", "natalie_walkaway", "Could he have just walked away?", [
    "No. He had his suit hanging up for Monday. And he calls me every Sunday night before anything big. Every time. Sunday he didn't.",
  ], { reveals: "Natalie says Jonathan calls her every Sunday night before anything big, and had his suit ready for Monday." }),
  q("natalie", "Sunday", "natalie_texts", "When did you last hear from him?", [
    "Sunday evening. He texted at 6:12 and again at 6:14. I had the front desk print the screenshots. Here.",
    "Read the second one. 'Anyone.' He underlined things when he talked, too.",
  ], {
    reveals: "Natalie handed over Jonathan's texts: Thursday, November 15, 'They know I'm going to talk,' and Sunday at 6:12 and 6:14 PM.",
    effects: [
      { giveEvidence: "E020" },
      tl("9:48 PM (Thu 11/15)", "Jonathan texts Natalie: 'They know I'm going to talk.'", "Jonathan's texts"),
      tl("6:12 PM (Sun 11/18)", "Jonathan texts Natalie from the hotel: if she doesn't hear from him, call Irene Chen.", "Jonathan's texts"),
    ],
    volunteer: { after: 2 },
  }),
  q("natalie", "Sunday", "natalie_sunday", "Did you try to reach him Sunday night?", [
    "I texted at 10:44 and called at 10:45. He didn't pick up. I thought he was prepping and went to bed.",
    "I keep thinking about that. I went to bed.",
  ], { effects: [tl("10:45 PM (Sun 11/18)", "Natalie calls Jonathan. No answer.", "Natalie Ellery")] }),
  q("natalie", "Family", "natalie_mother", "Tell me about your mother.", [
    "She's been in memory care in Cranberry Township since 2015. I see her three times a week. Jon paid most of it. It's a lot of money.",
  ]),
  q("natalie", "Family", "natalie_money", "Did Jonathan have money problems?", [
    "He was buried. Mom's bills, and a business loan he guaranteed for a friend who didn't pay.",
    "Then in mid-2017 he told me 'it's handled.' He wouldn't say how. I didn't push. I was relieved.",
  ], { reveals: "Natalie says Jonathan was deep in debt until mid-2017, when he told her 'it's handled' and wouldn't say how." }),
  q("natalie", "Her brother", "natalie_frightened", "How had he seemed lately?", [
    "Frightened. For about three weeks. Jumpy on the phone, distracted, checking the door when we FaceTimed.",
  ]),
  q("natalie", "Her brother", "natalie_lawyer", "Did he have a lawyer?", [
    "A lawyer named Irene. About 'the thing at work.' I don't know her last name. He said she was good.",
  ]),
  q("natalie", "Her brother", "natalie_taskforce", "Did he have an appointment on Monday?", [
    "With 'a task force.' Monday morning. He said he'd tell me all about it after. That's all he said.",
  ]),
  q("natalie", "Her brother", "natalie_passcode", "Do you know his phone passcode?", [
    "0411. Mom's birthday. He uses it for everything. I've told him a hundred times.",
  ]),
  q("natalie", "Her brother", "natalie_work", "Did he ever talk about his work?", [
    "Hardly. Contracts, pricing, spreadsheets. He'd never do anything wrong at work. He's a rule-follower.",
  ], {
    variants: [{ requires: natalieTruth, reply: ["I know now what he did there. I'm furious with him.", "He's still my brother."] }],
  }),
  q("natalie", "Her brother", "natalie_garage", "Did he say anything about anyone bothering him?", [
    "Saturday, the 17th, he asked me not to talk to anyone who called from his work. Anyone. I thought he was being dramatic.",
    "And early in November he said a man from 'the consulting people' had been waiting by his car in his office garage. He laughed about it. He wasn't laughing.",
  ], {
    requires: natalieGarage,
    reveals: "Natalie remembers that on Saturday, November 17 Jonathan asked her not to talk to anyone from his work, and that in early November 'a man from the consulting people' waited by his car in his office garage.",
  }),
  q("natalie", "Her brother", "natalie_sold", "Jonathan was selling his employer's information.", [
    "No. No, he... Show me.",
    "I'm angry. I'm so angry I can't see straight. He's still my brother. Get him home.",
  ], { requires: natalieTruth }),
  q("natalie", "Her brother", "natalie_notebook", "Jonathan wrote about a man by his car in his notebook.", [
    "'Think about Natalie.' That's me. Somebody stood by his car and said my name to him.",
    "I don't know who G.L. is. I want to.",
  ], { requires: ev("E024") }),
  q("natalie", "The police", "natalie_police", "What have the police told you?", [
    "Detective Collins thinks he ran. She's been decent to me. She also wrote down that he left his shoes. I saw her write it.",
  ]),
  q("natalie", "Her brother", "natalie_found", "Jonathan is alive.", [
    "Oh God. Oh, thank God. Where is he? When can I see him?",
    "Tell him... no. I'll tell him myself.",
  ], { requires: rescued }),

  // =====================================================================
  // Tessa Monroe: front desk
  // =====================================================================
  q("monroe", "About her", "monroe_who", "What do you do here?", [
    "Front desk supervisor. Three to eleven, five days. Sunday was my shift.",
  ]),
  q("monroe", "Check-in", "monroe_checkin", "Tell me about his check-in.", [
    "3:44 Sunday afternoon. Two keys, encoded at 3:45. His car went to the valet. Here's the registration record.",
    "I wrote a note at the bottom about the man who came by later.",
  ], {
    reveals: "Tessa Monroe handed over Jonathan's registration record: checked in 3:44 PM Sunday, two keys, two nights.",
    effects: [{ giveEvidence: "E005" }, tl("3:44 PM (Sun 11/18)", "Jonathan checks in at the Ashcroft with Tessa Monroe. Two keys encoded.", "Registration record")],
    volunteer: { after: 1 },
  }),
  q("monroe", "Check-in", "monroe_manner", "How did he seem?", [
    "Tired. Polite. A little jumpy. He looked at the lobby doors twice while I was doing his keys.",
  ]),
  q("monroe", "Check-in", "monroe_room", "Why was he in Room 614?", [
    "He asked for a quiet room, high floor, away from the elevators. 614 is the far north end of six. It's the quietest king we had.",
  ]),
  q("monroe", "Sunday night", "monroe_visitor", "Did anyone ask about him?", [
    "About ten to eight. A man came to the desk and asked for Mr. Ellery's room number. Said he was a colleague.",
    "I said I couldn't give it out and offered to ring the room. He said not to bother and walked out to Fifteenth Street.",
  ], {
    reveals: "At about 7:50 PM Sunday a man asked Tessa Monroe for Jonathan's room number, saying he was a colleague; she declined and he left by the Fifteenth Street doors.",
    effects: [tl("About 7:50 PM (Sun 11/18)", "A man in a cap asks the front desk for Jonathan's room number, says he's a colleague, and leaves when refused.", "Tessa Monroe")],
    volunteer: { near: "anyone ask asked visitor visitors colleague came looking desk someone man" },
  }),
  q("monroe", "Sunday night", "monroe_describe", "What did the man look like?", [
    "Late thirties. Short dark hair. A navy quilted jacket. A ball cap, and he kept it on.",
    "Honestly, I'm not sure what he looked like under the cap. I was looking at the brim.",
  ]),
  q("monroe", "Check-in", "monroe_policy", "Would the desk ever give out a room number?", [
    "Never. Not to a colleague, not to a husband, not to anybody. We offer to ring the room. That's the rule and I like the rule.",
  ]),
  q("monroe", "Sunday night", "monroe_sunday", "Did you see Jonathan again on Sunday?", [
    "No. Not after he went up. I was at the desk until eleven and he never came through the lobby.",
  ]),
  q("monroe", "Sunday night", "monroe_license", "Is this the man who asked for his room?", [
    "It could be him. The hair, the age.",
    "I couldn't swear to it. I'm sorry. I'd rather tell you that than guess.",
  ], { requires: ev("E027") }),
  q("monroe", "Staff", "monroe_hurst", "Do you know Kevin Hurst?", [
    "Kevin in engineering? Sure. He's friendly. He talks Commanders with everybody, even people who don't want to.",
  ], { requires: hurstKnown }),

  // =====================================================================
  // Douglas Wallace: hotel security
  // =====================================================================
  q("wallace", "About him", "wallace_who", "Who are you?", [
    "Douglas Wallace. Director of security. Twenty-two years at MPD before I came here. I've worked more missing persons than you've had birthdays.",
  ]),
  q("wallace", "The cameras", "wallace_cameras", "What do the hotel cameras show?", [
    "Guest-facing cameras cover the lobby, both entrances, the garage ramp, the guest elevators and every landing. He comes up to six at 6:38 Sunday with a takeout bag and walks north. He never comes back down.",
    "Here's the sixth-floor camera record. Read my note.",
  ], {
    reveals: "Douglas Wallace handed over the sixth-floor camera record: Jonathan went up at 6:38 PM Sunday and never came back down by any guest route.",
    effects: [{ giveEvidence: "E007" }, tl("6:38 PM (Sun 11/18)", "Camera C6-1: Jonathan steps off a guest elevator on six with a takeout bag and walks north out of view.", "Sixth-floor camera")],
    volunteer: { near: "camera cameras video footage cctv recording surveillance" },
  }),
  q("wallace", "The room", "wallace_lock", "What does the room's lock record show?", [
    "I read it at the door with the handheld at 10:52 Monday. Here.",
    "Opened from inside at 10:32 and again at 10:58 Sunday night. Nobody keyed in. Key 2 never used.",
  ], {
    reveals: "Douglas Wallace handed over Room 614's lock audit: the door was opened from inside at 10:32 PM and 10:58 PM Sunday, and no key was used after 6:39 PM.",
    effects: [
      { giveEvidence: "E006" },
      tl("10:32 PM (Sun 11/18)", "Room 614's deadbolt is retracted and the door opened from inside.", "Lock audit"),
      tl("10:58 PM (Sun 11/18)", "Room 614 is opened from inside and held open 41 seconds.", "Lock audit"),
    ],
    volunteer: { near: "lock locks door audit key keycard entry room 614" },
  }),
  q("wallace", "The room", "wallace_voluntary", "What do you think happened to him?", [
    "He walked out on his own. People walk out on their lives. I've seen it a hundred times.",
    "A man with debts and a meeting he doesn't want. He found a way out I haven't spotted yet.",
  ], {
    requires: not(d("D04")),
    reveals: "Douglas Wallace believes Jonathan left of his own accord.",
  }),
  q("wallace", "The cameras", "wallace_visitor", "Did the lobby camera catch the man who asked for his room?", [
    "Man in a cap at the desk at 7:49, out the Fifteenth Street doors at 7:53. Face under the brim the whole time. Nothing useful. He knew where the cameras were, or he got lucky.",
  ]),
  q("wallace", "The room", "wallace_welfare", "Who opened the room on Monday?", [
    "Me and the housekeeping supervisor, 10:21, after a federal investigator called the desk. Empty. Phone on the bedside table, wallet on the desk, coat on the chair.",
  ]),
  q("wallace", "The back of house", "wallace_service", "What about the service side of the hotel?", [
    "Service doors are on staff cards and alarms. S6-2 at the end of six is locked, and I have the only override. Guests don't go back there.",
  ], {
    variants: [{ requires: { chapter: 2 }, reply: ["Every hotel's two buildings. The one guests see and the one that feeds it. Come down to my office and I'll walk you through the second one."] }],
  }),
  q("wallace", "The cameras", "wallace_dock", "Is there a camera on the loading dock?", [
    "One. DOCK-1, over bays one and two. It records to the same box, but it's on page three of the monitor wall. Page one is guests.",
    "I didn't look at it Monday. He's a guest. Why would he be on the dock?",
  ]),
  q("wallace", "The back of house", "wallace_bypass", "What did you find on the S6-2 alarm?", [
    "Somebody put the S6-2 alarm in bypass at 10:19 Sunday night, at its keypad, user code 2231. That's Kevin Hurst, engineering. Forty-five minutes. 'Scheduled maintenance.'",
    "Policy 7.3: any bypass on a guest-floor service door needs my approval. Nobody asked me. That door's twenty-five feet from his room.",
  ], {
    requires: ev("E009"),
    reveals: "Wallace found the S6-2 alarm was bypassed at 10:19 PM Sunday under user code 2231, Kevin Hurst's, for 45 minutes, without the approval policy requires.",
  }),
  q("wallace", "Staff", "wallace_hurst", "What do you know about Kevin Hurst?", [
    "Good engineer. Bets on football. Borrowed two hundred dollars off one of my guards last spring and paid it back late.",
  ], { requires: hurstKnown }),
  q("wallace", "The back of house", "wallace_memo", "Did you object to Celia Grant's badge memo?", [
    "In writing, September 11. 'This puts a key to the back of house in anybody's hands at night.' She thanked me for my input.",
  ], { requires: ev("E015") }),
  q("wallace", "Staff", "wallace_luis", "Did any of the staff see anything?", [
    "I'm asking everybody who was on Sunday. Nothing useful yet. Kitchen's next.",
  ], {
    variants: [{
      requires: { chapter: 2 },
      reply: [
        "Luis Batista, a dishwasher. He took the trash out to the dock Sunday night and saw a gray van in bay two. I took his statement at 8:30 tonight.",
        "He wrote out a copy for you and left it at the smoking bench on the dock.",
      ],
    }],
  }),
  q("wallace", "The back of house", "wallace_badge", "What is badge T-07?", [
    "A temporary vendor badge. Created Sunday at 9:41 PM, and used at the dock, the service elevator and S6-2. Nobody told me about a vendor.",
    "The badge station in my office keeps the credential record. Pull it.",
  ], { requires: ev("E008") }),
  q("wallace", "The back of house", "wallace_rex", "What does REX mean on the access log?", [
    "Request to exit. The push bar, or the motion sensor over it. The door logs that it opened from inside. It doesn't know who went through.",
  ], { requires: ev("E008") }),
  q("wallace", "The room", "wallace_changed", "Do you still think he walked out on his own?", [
    "No. I was wrong. He didn't walk out the front of my hotel. Somebody brought him out the back, through doors I'm paid to watch.",
  ], { requires: d("D04") }),
  q("wallace", "Staff", "wallace_staff", "Did you ask the staff who were on duty Sunday?", [
    "Everybody on the two-to-ten. Nobody saw him after he went up.",
  ], {
    variants: [{ requires: hurstKnown, reply: ["Everybody on the two-to-ten. Kevin Hurst told me he clocked out at ten, went out the employee door and was on the bus by ten fifteen. Didn't go upstairs after his shift. I wrote it down."] }],
  }),

  // =====================================================================
  // Celia Grant: general manager
  // =====================================================================
  q("grant", "About her", "grant_who", "What's your role here?", [
    "General manager. Twelve floors, two hundred eighty-eight rooms, and this week we're 94% booked. Thanksgiving.",
  ]),
  q("grant", "Records", "grant_privacy", "Will the hotel cooperate with the investigation?", [
    "Of course. Our guests' privacy and their safety are the same thing. I'll authorize what the police need, and what you need if it helps find him.",
  ]),
  q("grant", "Security", "grant_security", "Could someone get into the back of the hotel?", [
    "No. There was no security failure here. Every service door is on a card and an alarm. No one gets into the back of the house without security.",
  ], { requires: not(ev("E015")), reveals: "Celia Grant says no one gets into the back of the house without security." }),
  q("grant", "Security", "grant_bypass", "Why was the S6-2 alarm bypassed on Sunday night?", [
    "A maintenance bypass is a maintenance bypass. Engineering does them every week, on every floor.",
    "I'm not going to make a scandal out of a work order.",
  ], { requires: ev("E009") }),
  q("grant", "Security", "grant_memo", "Tell me about your September 10 memo.", [
    "I wrote it. Engineering may issue after-hours vendor credentials without security sign-off. To cut security overtime. Corporate wanted the number down.",
    "Douglas objected in writing the next day. He was right. You can put that in your report.",
  ], {
    requires: ev("E015"),
    reveals: "Celia Grant admits her September 10 memo let engineering issue after-hours vendor badges without security, to cut overtime, and that Douglas Wallace objected in writing.",
    effects: [tl("Mon 9/10", "Celia Grant's memo lets engineering issue after-hours vendor badges without security sign-off.", "Celia Grant")],
  }),
  q("grant", "Records", "grant_hurst", "Can I see Kevin Hurst's employment records?", [
    "I'll authorize it. HR file, his schedule and the timeclock for Sunday. Here.",
  ], {
    requires: hurstKnown,
    reveals: "Celia Grant authorized and handed over Kevin Hurst's HR file, schedule and timeclock.",
    effects: [{ giveEvidence: "E016" }, tl("10:02 PM (Sun 11/18)", "Kevin Hurst clocks out.", "Hurst's timeclock")],
    volunteer: { near: "hurst kevin engineer employee personnel hr file schedule timeclock records" },
  }),
  q("grant", "Records", "grant_locker", "Can Kevin Hurst's locker be opened?", [
    "I've told Douglas to open it. Locker 41, in the engineering shop off the dock. Hotel property, hotel locks.",
  ], { requires: d("D06") }),
  q("grant", "Monday", "grant_natalie", "Did you contact his family?", [
    "I called his sister, Natalie, at 11:05 Monday morning. She was the emergency contact on his registration card. It's the worst call in this job.",
  ], { effects: [tl("11:05 AM (Mon 11/19)", "Celia Grant calls Natalie Ellery, the emergency contact.", "Celia Grant")] }),
  q("grant", "Monday", "grant_room", "What happened when the room was opened on Monday?", [
    "A federal investigator called the desk at 9:58 asking for him. Douglas and the housekeeping supervisor went up at 10:21. The room was empty. His phone was on the bedside table.",
  ]),
  q("grant", "Security", "grant_wallace", "What do you think of Douglas Wallace?", [
    "The best security director I've worked with. Also the most stubborn. Those may be the same quality.",
  ]),

  // =====================================================================
  // Kevin Hurst: maintenance engineer
  // =====================================================================
  q("hurst", "About him", "hurst_who", "Who are you?", [
    "Kevin Hurst. Maintenance Engineer Two. Here since March 2016. Commanders, unfortunately. You?",
  ]),
  q("hurst", "Sunday", "hurst_sunday", "Where were you on Sunday night?", [
    "Normal shift. Two to ten. Clocked out at ten, went out the employee entrance, bus home by ten fifteen.",
    "Never went upstairs after my shift. Why would I?",
  ], {
    requires: not(hurstOpen),
    reveals: "Kevin Hurst says he clocked out at ten on Sunday, left by the employee entrance, was on the bus home by 10:15 and never went upstairs after his shift.",
    effects: [tl("10:15 PM (Sun 11/18)", "Kevin Hurst says he was on the bus home by now.", "Kevin Hurst")],
  }),
  q("hurst", "Sunday", "hurst_guest", "Did you see the guest in Room 614?", [
    "Never saw him. Engineering doesn't see guests much. We see air handlers.",
  ]),
  q("hurst", "About him", "hurst_job", "What does a maintenance engineer do here?", [
    "HVAC, plumbing, door closers, door alarms, whatever breaks. You get a call on the radio, you go fix it.",
  ]),
  q("hurst", "The back of house", "hurst_elevator", "Who has the service elevator key?", [
    "Engineering and security. The independent service key. I've got one, everybody in engineering does. For moving equipment.",
  ]),
  q("hurst", "The back of house", "hurst_bypass", "Why was the S6-2 alarm bypassed under your code?", [
    "That's the S6-2 work order. The closer. I was getting a jump on it before I left.",
    "People do that. You get ahead.",
  ], {
    requires: ev("E009"),
    reveals: "Kevin Hurst says the S6-2 bypass was for the door's work order, which he was 'getting a jump on' before he left.",
    variants: [{
      requires: hurstOpen,
      reply: [
        "Okay. Okay. I set it. For a contractor guy. He said the job was approved for overnight, and he gave me a couple hundred to make it easy.",
        "I didn't see anybody. I didn't move anybody. I turned off an alarm.",
      ],
    }],
  }),
  q("hurst", "The back of house", "hurst_contractor", "Who was the contractor?", [
    "Some HVAC guy. He said the job was approved. I didn't ask a lot of questions. That's the point of a couple hundred.",
  ], {
    requires: hurstOpen,
    variants: [{ requires: d("D11"), reply: ["He called himself Garrett. That's all he ever gave me. Garrett."] }],
  }),
  q("hurst", "The back of house", "hurst_badge", "Why did you create badge T-07?", [
    "Engineering does vendor badges. Ms. Grant said so in September. There's a memo. Ask her.",
  ], { requires: ev("E015") }),
  q("hurst", "Money", "hurst_money", "Where did the cash you deposited come from?", [
    "I won some games.",
  ], {
    requires: ev("E029"),
    variants: [{ requires: d("D11"), reply: ["It was supposed to make the debt go away. That's all I thought it was for. I swear that's all I thought."] }],
  }),
  q("hurst", "Money", "hurst_messages", "Why did you delete your messages?", [
    "Because I was scared. Monday afternoon, after the police came.",
    "He said they only needed to talk to a guy. That's what he said.",
  ], { requires: ev("E030") }),
  q("hurst", "Money", "hurst_debts", "Why were your payroll advances turned down?", [
    "It's been a rough fall. The Commanders have been a rough fall. They said I hit the limit.",
  ], { requires: ev("E016") }),
  q("hurst", "Garrett", "hurst_garrett", "How did you meet Garrett?", [
    "Thursday. A sports bar on M Street, near here. He bought the wings. He knew things about me.",
    "He said they only needed to talk to a guy. Talk.",
  ], {
    requires: d("D11"),
    reveals: "Kevin Hurst says he met 'Garrett' on Thursday, November 15 at a sports bar on M Street, and Garrett said they only needed 'to talk to a guy.'",
    effects: [tl("Evening (Thu 11/15)", "Kevin Hurst meets 'Garrett' at a sports bar on M Street.", "Kevin Hurst")],
  }),
  q("hurst", "Garrett", "hurst_elevator_six", "What happened at the service elevator?", [
    "I held the car on six with my key. Independent service. When the doors opened the guy was walking on his own. Garrett had his arm.",
    "I didn't look at him. I looked at the panel.",
  ], {
    requires: d("D11"),
    reveals: "Kevin Hurst says he held the service elevator on six with his key, and that the man came walking on his own with Garrett holding his arm.",
  }),
  q("hurst", "The man", "hurst_name", "Did you know who the man was?", [
    "I never knew the guy. I didn't know his name was Jonathan until the news. I swear to God.",
  ], { requires: d("D11") }),
  q("hurst", "Police", "hurst_phone", "What happened with your phone?", [
    "Detective Collins asked for it. I gave it to her. I signed the paper. I'm cooperating, right? That counts?",
  ], { requires: { flag: "hurst_phone_seized" } }),

  // =====================================================================
  // David Okoye: Eastbridge compliance
  // =====================================================================
  q("okoye", "About him", "okoye_who", "What do you do at Eastbridge?", [
    "David Okoye. Director of Ethics and Compliance. Policies, investigations, export control, the hotline.",
  ]),
  q("okoye", "Jonathan", "okoye_jonathan", "Tell me about Jonathan Ellery.", [
    "A valued senior analyst. Careful, well liked. We're very concerned for his safety.",
  ]),
  q("okoye", "The review", "okoye_review", "Is there any internal matter concerning Jonathan?", [
    "Eastbridge has no comment on any internal matter.",
    "And no task force has told me anything about anything.",
  ], { requires: not(ev("E018")), reveals: "David Okoye says Eastbridge has no comment on any internal matter and that no task force has told him anything." }),
  q("okoye", "The review", "okoye_taskforce", "Jonathan had a task force interview on Monday.", [
    "All right. There's an internal review, IR-18-027. Opened in August. The task force asked us in October not to discuss it with him.",
    "My office missed the leak for a year. Here it is. Read the cover.",
  ], {
    requires: okoyeOpen,
    reveals: "David Okoye handed over Eastbridge's internal review IR-18-027: the leak of recompete pricing was traced to Jonathan's export, and the task force asked Eastbridge not to discuss it with him.",
    effects: [
      { giveEvidence: "E018" },
      tl("Mon 8/20", "Eastbridge opens internal review IR-18-027.", "Internal review"),
      tl("Thu 10/25", "The task force notifies Eastbridge and asks it not to discuss the matter with the employees concerned.", "Internal review"),
    ],
    volunteer: { near: "task force letter interview varga monday 9:30 review investigation internal leak" },
  }),
  q("okoye", "Jonathan", "okoye_file", "Do you have his personnel security file?", [
    "The relevant financial pages. I've released them to investigators because a cleared employee is missing. They're on my desk. Take them.",
  ]),
  q("okoye", "Jonathan", "okoye_laptop", "Was his laptop company-issued?", [
    "Yes. The charger would carry our asset tag. It last connected to our VPN at 10:14 PM on Sunday. Nothing since.",
  ], { effects: [tl("10:14 PM (Sun 11/18)", "Jonathan's Eastbridge laptop last connects to the company VPN.", "David Okoye")] }),
  q("okoye", "Names", "okoye_kestrel", "Have you heard of Kestrel Protective Group or Northgate Bridge Lending?", [
    "Never. Neither one.",
  ]),
  q("okoye", "The review", "okoye_corvane", "Who is Corvane Systems?", [
    "Our competitor on the Logistics Support recompete. Their July proposal matched our unreleased labor rates in eleven of twelve categories.",
  ], { requires: ev("E018") }),
  q("okoye", "The review", "okoye_export", "Who exported the pricing file?", [
    "It was exported once, on May 14, by user JELLERY. Nine people had access. One export.",
  ], { requires: ev("E018") }),
  q("okoye", "The review", "okoye_meridian", "What is Meridian Advisory Group to Eastbridge?", [
    "A name on a market brief, on their letterhead, that reproduced our internal rate tables, typos included. I know them only as that.",
  ], { requires: ev("E018") }),
  q("okoye", "Jonathan", "okoye_notebook", "Jonathan wrote that someone waited by his car in your garage.", [
    "On November 1. In our garage. Nobody reported it to us. He didn't report it to us.",
    "I think I understand why.",
  ], { requires: ev("E024") }),

  // =====================================================================
  // Irene Chen: Jonathan's lawyer
  // =====================================================================
  q("chen", "About her", "chen_who", "What kind of law do you practice?", [
    "White-collar defense and whistleblower counsel. People who know something and don't know what it will cost them.",
  ]),
  q("chen", "Her client", "chen_client", "Is Jonathan Ellery your client?", [
    "I can confirm that he is. Nothing else.",
    "The privilege is his. Not mine, and not his sister's.",
  ]),
  q("chen", "Her client", "chen_monday", "What happened on Monday morning?", [
    "He was due here at 8:15. My office called him at 8:16 and 8:31. I went to the 9:30 interview alone and waited with the investigator.",
    "At first I thought he'd lost his nerve. He had before.",
  ], { effects: [tl("9:30 AM (Mon 11/19)", "Jonathan does not appear at the task force. Irene Chen waits with Investigator Varga.", "Irene Chen")] }),
  q("chen", "Her client", "chen_deposit", "What is deposit 18-114?", [
    "A client matter. I can't discuss what a client leaves with me. I'm sorry. I mean that.",
  ], { requires: all(ev("E021"), not(chenRelease)) }),
  q("chen", "The envelope", "chen_release", "Will you release what Jonathan left with you?", [
    "Under D.C. Rule 1.6, a lawyer may reveal what's needed to prevent a crime likely to result in death or substantial bodily harm. I believe that's where he is.",
    "Here is the envelope. Seal 18-114, intact. Detective Collins is on the line. Sign the chain-of-custody form under me.",
  ], {
    requires: chenRelease,
    reveals: "Irene Chen released Jonathan's sealed envelope, deposit 18-114, under D.C. Rule 1.6, with a chain-of-custody form.",
    effects: [{ giveEvidence: "E022" }],
    volunteer: { after: 1 },
  }),
  q("chen", "The envelope", "chen_code", "Do you know the code to the drive?", [
    "No. He said he'd never written it down, and I didn't want to know it.",
    "Ten wrong tries and it erases itself. Nobody guesses.",
  ], { requires: ev("E022") }),
  q("chen", "Her client", "chen_first", "When did Jonathan first come to you?", [
    "October 31. He was frightened. He'd been to a meeting at Meridian the day before.",
  ], { requires: chenRelease, effects: [tl("Wed 10/31", "Jonathan first consults Irene Chen.", "Irene Chen")] }),
  q("chen", "Her client", "chen_advice", "What did you advise him?", [
    "To tell the task force everything, his own part included. It's the only advice that works.",
    "He agreed on November 14.",
  ], { requires: chenRelease, effects: [tl("Wed 11/14", "On Irene Chen's advice Jonathan agrees to tell the task force everything, his own part included.", "Irene Chen")] }),
  q("chen", "The envelope", "chen_sunday", "What happened on Sunday at your office?", [
    "I came in on a Sunday for him. He was here from 1:00 to 1:24 and left a sealed deposit. We agreed he'd pick it up at 8:15 Monday and we'd go to the interview together.",
  ], { requires: chenRelease, effects: [tl("1:00 to 1:24 PM (Sun 11/18)", "Jonathan leaves sealed deposit 18-114 at Irene Chen's office.", "Irene Chen")] }),
  q("chen", "Her client", "chen_varga", "Who is Investigator Varga?", [
    "P. Varga runs the task force interviews. I sat with him at 9:30 on Monday. Beyond that, you'd have to ask the task force.",
  ], { requires: any(ev("E017"), chenRelease) }),

  // =====================================================================
  // Julian Rourke: Meridian, after RE04
  // =====================================================================
  q("rourke", "Introductions", "rourke_who", "Who are you, Mr. Rourke?", [
    "Julian Rourke. I run Corporate Intelligence here. Corporate risk, mostly. Open-source research for clients who'd like to know who they're dealing with.",
  ]),
  q("rourke", "Jonathan", "rourke_agreement", "What was Jonathan's relationship with Meridian?", [
    "He was a paid independent advisor on public procurement trends, from 2017. Entirely above board. I'd rather you heard that from me.",
    "Here is the agreement. I've tabbed section 6 for you.",
  ], {
    requires: { event: "RE04" },
    reveals: "Julian Rourke handed over Jonathan's independent advisor agreement with Meridian, section 6 flagged, and says the arrangement was 'entirely above board.'",
    effects: [{ giveEvidence: "E025" }, tl("Thu 6/1/2017", "Meridian's independent advisor agreement with Jonathan takes effect, signed by Julian Rourke.", "Advisor agreement")],
    volunteer: { after: 1 },
  }),
  q("rourke", "Jonathan", "rourke_contact", "When did you last speak to Jonathan?", [
    "In the summer, I think. He'd been quieter this year.",
  ], { reveals: "Julian Rourke says he last spoke to Jonathan 'in the summer.'" }),
  q("rourke", "Jonathan", "rourke_whereabouts", "Do you know where Jonathan is?", [
    "I have no idea. I'm concerned. Truly. If there's anything Meridian can do, ask.",
  ]),
  q("rourke", "Meridian", "rourke_work", "What does Corporate Intelligence do?", [
    "Due diligence, market studies, open-source research. Who owns what, who's suing whom, what a competitor has said in public. Lawful, dull, and well paid.",
  ]),
  q("rourke", "Jonathan", "rourke_calls", "Why did your phone call Jonathan fourteen times this year?", [
    "About his advisory work. Advisors need chasing.",
    "The 9:20 and 11:12 calls on Sunday, from a number I don't recognize? Wrong numbers. Or a vendor. I get a great many calls.",
  ], { requires: ev("E026"), reveals: "Julian Rourke says his calls with Jonathan were about his advisory work, and the late Sunday calls from the prepaid number were 'wrong numbers, or a vendor.'" }),
  q("rourke", "Meridian", "rourke_kestrel", "What is Kestrel Protective Group to Meridian?", [
    "A vendor. Meridian uses dozens of vendors. Kestrel is one of many.",
  ], { requires: lyonsKnown }),
  q("rourke", "Meridian", "rourke_clientlist", "This is Meridian's intelligence client list.", [
    "Stolen, and misread. Client lists are commercial secrets, not confessions.",
  ], { requires: ev("E033") }),
  q("rourke", "Meridian", "rourke_funding", "Your division's funding sheet pays Kestrel and Northgate.", [
    "Internal accounting, taken out of context.",
  ], { requires: ev("E034") }),
  q("rourke", "Meridian", "rourke_index", "This index was in Garrett Lyons's bag.", [
    "I have never seen that document.",
  ], { requires: ev("E035") }),
  q("rourke", "Meridian", "rourke_superior", "Who do you report to?", [
    "The executive committee, like anyone.",
  ]),
  q("rourke", "Meridian", "rourke_northgate", "What is Northgate Bridge Lending?", [
    "Our disbursing agent for advisor fees. A convenience. Plenty of firms pay contractors through an agent.",
  ], { requires: any(ev("E019"), ev("E025")) }),
  q("rourke", "Meridian", "rourke_corvane", "Is Corvane Systems a Meridian client?", [
    "Corvane is a client. Competitive intelligence from public sources is a lawful business. I'd be happy to show you our ethics policy.",
  ], { requires: any(ev("E018"), ev("E033")) }),
  q("rourke", "Meridian", "rourke_holt", "Do you know Adrian Holt?", [
    "Adrian was an affiliate partner of our Pittsburgh office. I read about Carroway like everyone else. Very sad.",
  ]),

  // =====================================================================
  // Garrett Lyons: Kestrel
  // =====================================================================
  q("lyons", "Introductions", "lyons_who", "What does Kestrel do?", [
    "Guard contracts, executive protection, background work. Licensed in Maryland. I was an MP in the Army; this is the same job with better coffee.",
  ]),
  q("lyons", "Meridian", "lyons_meridian", "Do you work for Meridian Advisory Group?", [
    "I did a project for Meridian once. Meridian's a client. Lots of people are.",
  ]),
  q("lyons", "Jonathan", "lyons_jonathan", "Do you know Jonathan Ellery?", [
    "I may have met him in passing. I meet a lot of people.",
  ]),
  q("lyons", "Sunday", "lyons_sunday", "Where were you on Sunday night?", [
    "Home in Rockville. The van was in the lot. Football and bed.",
  ], {
    requires: not(d("D11")),
    reveals: "Garrett Lyons says he was home in Rockville on Sunday night and the van was in the lot.",
  }),
  q("lyons", "Sunday", "lyons_van", "Tell me about Kestrel's vans.", [
    "We run a few. Gray Transits, magnet signs on the doors so the clients know who's parked out front.",
  ], {
    variants: [{ requires: ev("E027"), reply: ["The vans go out with staff. I'd have to check who had that one Sunday.", "Plate readers catch a lot of vans."] }],
  }),
  q("lyons", "Sunday", "lyons_meeting", "Tell me what really happened Sunday night.", [
    "All right. Jonathan asked for a private meeting before his interview. He wanted out, and he didn't want it on a phone. We talked in the van.",
    "I dropped him at Union Station after midnight. He said he needed to disappear for a while. That's a grown man's choice.",
  ], {
    requires: d("D11"),
    reveals: "Garrett Lyons now says Jonathan asked for a private meeting, they talked in the van, and he dropped Jonathan at Union Station after midnight because Jonathan wanted to disappear for a while.",
    effects: [tl("After midnight (Mon 11/19)", "Garrett Lyons says he dropped Jonathan at Union Station.", "Garrett Lyons")],
  }),
  q("lyons", "Sunday", "lyons_hurst", "Who is Kevin Hurst to you?", [
    "Kevin's a guy who knows the building. Jonathan didn't want to walk through a lobby the night before his interview. That's all that was.",
  ], { requires: d("D11") }),
  q("lyons", "Jonathan", "lyons_where", "Where is Jonathan?", [
    "No idea. I'm not his keeper.",
  ], {
    variants: [{ requires: d("D11"), reply: ["Last I saw him was Union Station. He said he needed to disappear for a while. Seems like he did."] }],
  }),
  q("lyons", "Sunday", "lyons_prepaid", "Whose phone is (240) 555-0179?", [
    "I carry a couple of work phones. Clients like discretion. You'd be amazed how many.",
  ], { requires: ev("E030") }),
  q("lyons", "Meridian", "lyons_rourke", "Do you know Julian Rourke?", [
    "Meridian's a client. I don't discuss clients. You wouldn't want me to discuss you.",
  ], { requires: rourkeKnown }),
  q("lyons", "Jonathan", "lyons_garage", "Who is G.L. in Jonathan's notebook?", [
    "Lots of people have the initials G.L. Go look in a phone book.",
  ], { requires: ev("E024") }),

  // =====================================================================
  // Det. Nadia Collins: MPD; no limit
  // =====================================================================
  q("collins", "The case", "collins_case", "Where does the investigation stand?", [
    "Possible voluntary absence. An adult with debts who doesn't want to testify. That's what it looks like on paper.",
    "On the other hand, he left his shoes and his wallet. Read my note.",
  ], {
    repeatable: true,
    variants: [
      { requires: carrierGate, reply: ["I've stopped writing 'voluntary.' Somebody came in the back of that hotel. I'm treating it as an abduction."] },
      { requires: d("D11"), reply: ["The van's Kestrel's and the hotel man was talking to 'G.' I can get Montgomery County to take a warrant for Kestrel's office when you're ready."] },
      { requires: d("D12"), reply: ["We know where he is. The FBI's in and Maryland State Police are on Sawmill Hollow Road."] },
      { requires: rescued, reply: ["He's alive. Now we make it hold."] },
    ],
  }),
  q("collins", "Reports", "collins_report", "Can I see the missing person report?", [
    "Here. CCN 18197742. His sister called it in at 11:20 this morning. Read my note at the bottom.",
  ], {
    reveals: "Det. Collins handed over the MPD missing person report, CCN 18197742.",
    effects: [{ giveEvidence: "E001" }, tl("11:20 AM (Mon 11/19)", "Natalie Ellery reports Jonathan missing to MPD by phone.", "Missing person report")],
    volunteer: { after: 1 },
  }),
  q("collins", "Reports", "collins_photos", "Can I see the photographs of the room?", [
    "Twelve, Ofc. Kimball, 1:25 this afternoon. Look at four and eleven. Eleven he didn't collect, because nobody'd established a crime.",
  ], { reveals: "Det. Collins handed over the MPD photographs of Room 614.", effects: [{ giveEvidence: "E002" }] }),
  q("collins", "The case", "collins_voluntary", "Do you think he left on his own?", [
    "Adults are allowed to go missing. They usually take their shoes and their wallet. He didn't.",
    "Give me something that says he didn't walk, and I'll stop saying it.",
  ], {
    variants: [{ requires: carrierGate, reply: ["No. He didn't leave on his own. Somebody came in the back and went out the back, and he went with them."] }],
  }),
  q("collins", "Records", "collins_phone_wait", "Can you get Jonathan's phone records?", [
    "Not on a missing adult. For an exigent request I need signs he was taken, not just gone. Show me how somebody got to that room.",
  ], { requires: not(carrierGate) }),
  q("collins", "Records", "collins_carrier", "Can you get Jonathan's phone records now?", [
    "Now I can. A bypassed alarm and a stranger's badge on the service side is a possible abduction. I'm sending an exigent request to his carrier tonight.",
    "They'll come back in a few hours. You'll get them on your phone.",
  ], {
    requires: carrierGate,
    reveals: "Det. Collins sent an exigent request to Jonathan's wireless carrier.",
    effects: [{ startLab: "carrier_records" }, { setFlag: "carrier_requested" }],
    volunteer: { after: 1, reply: ["Before you ask anything: I'm treating this as a possible abduction now, so I'm sending an exigent request to his carrier tonight. The records will come to your phone."] },
  }),
  q("collins", "Records", "collins_lab", "Is anything back from the lab?", ["Nothing pending. Give me something to send."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "carrier_records" }, reply: ["The carrier has the exigent request. It'll come straight to your phone."] },
      { requires: { labReady: "carrier_records" }, reply: ["The carrier records are back. Read my note at the bottom."] },
      { requires: { labStarted: "hurst_phone" }, reply: ["Digital evidence has Hurst's phone. Deleted messages take time."] },
      { requires: { labReady: "hurst_phone" }, reply: ["Hurst's messages are back. Deleted isn't gone."] },
      { requires: { labStarted: "drive_image" }, reply: ["The FBI lab has the drive. Agent Quinlan will send the summary."] },
      { requires: { labReady: "drive_image" }, reply: ["The drive's imaged. Quinlan sent the summary to both of us."] },
    ],
  }),
  q("collins", "Kevin Hurst", "collins_hurst_wait", "Can you take Kevin Hurst's phone?", [
    "He's an engineer who was at work on a Sunday. I need more than that before I ask for his phone. Show me he wasn't where he says he was.",
  ], { requires: all(hurstKnown, not(d("D06"))) }),
  q("collins", "Kevin Hurst", "collins_hurst", "Can you get Kevin Hurst's phone examined?", [
    "Yes. His badge in the service corridor after he says he was on the bus, and the badge he made. I'll ask him for his phone. With consent it goes to our digital evidence unit today.",
  ], {
    requires: d("D06"),
    reveals: "Det. Collins took Kevin Hurst's phone with his consent and sent it to MPD's digital evidence unit.",
    effects: [{ startLab: "hurst_phone" }, { setFlag: "hurst_phone_seized" }],
  }),
  q("collins", "The van", "collins_plate_wait", "Can you trace the van from the dock?", [
    "A gray van with no name on it isn't enough for the state's databases. Give me the van on the dock and a plate from somebody who saw it.",
  ], { requires: all(any(ev("E011"), ev("E013")), not(plateGate)) }),
  q("collins", "The van", "collins_plate", "Can you run the partial plate?", [
    "Already did. Maryland MVA and the state's plate readers. One match: MD 3CR7719, a gray 2016 Transit Connect registered to Kestrel Protective Group in Rockville.",
    "Readers have it southbound at Urbana at 6:21 Sunday and northbound at Germantown at 11:41. License photo of the company principal's attached.",
  ], {
    requires: plateGate,
    reveals: "Det. Collins traced the partial plate to MD 3CR7719, a gray Ford Transit Connect registered to Kestrel Protective Group, seen on I-270 at 6:21 PM and 11:41 PM Sunday.",
    effects: [
      { giveEvidence: "E027" },
      tl("6:21 PM (Sun 11/18)", "Plate reader: Kestrel's van southbound on I-270 at Urbana.", "Plate readers"),
      tl("11:41 PM (Sun 11/18)", "Plate reader: Kestrel's van northbound on I-270 at Germantown.", "Plate readers"),
    ],
    volunteer: { after: 1 },
  }),
  q("collins", "Kestrel", "collins_warrant_wait", "Can you get a warrant for Kestrel's office?", [
    "On a van and a plate reader? No judge in Montgomery County signs that for a licensed security company. Tie the van to the night. Tie the man to the hotel.",
  ], { requires: all(lyonsKnown, not(kestrelGate)) }),
  q("collins", "Kestrel", "collins_kestrel", "Will you ask for a warrant on Kestrel's office now?", [
    "Yes. The van, the messages, the timing. Montgomery County Police will take the warrant. They'll serve it tonight about nine, and you can walk it after.",
  ], {
    requires: kestrelGate,
    reveals: "Det. Collins asked Montgomery County Police to take a warrant for Kestrel Protective Group's office.",
    effects: [{ setFlag: "kestrel_search" }, { setEnv: "kestrel", to: "searched" }],
    variants: [{ requires: { flag: "kestrel_search" }, reply: ["Done. MCPD served it. The office is yours to walk. Lyons wasn't there."] }],
  }),
  q("collins", "The farmhouse", "collins_fbi", "Who else is involved now?", [
    "He was carried across a state line. I'm bringing in the FBI, and Maryland State Police are watching Sawmill Hollow Road from four in the morning.",
  ], { requires: d("D12") }),
  q("collins", "The farmhouse", "collins_farmhouse", "Are we going in?", [
    "Not until somebody gives me a reason. A farmhouse is a home. Look at it, and tell me what you see.",
  ], { requires: { event: "RE06" } }),
  q("collins", "The farmhouse", "collins_rescue", "Is Jonathan all right?", [
    "He's alive. Dehydrated, scared, wrists raw. Lyons was arrested in the driveway and asked for a lawyer before his knees hit the gravel.",
    "Agent Quinlan has it federally now, with us.",
  ], { requires: rescued }),

  // =====================================================================
  // Special Agent Teresa Quinlan: FBI, from RE07; no limit
  // =====================================================================
  q("quinlan", "Introductions", "quinlan_who", "Why is the FBI involved?", [
    "He was carried across a state line. That makes it federal. I have the case now, with MPD.",
  ]),
  q("quinlan", "The scene", "quinlan_van", "What did you take from the van?", [
    "Lyons's bag and the laptop. My team is logging the bag in the side door now. Look, don't touch.",
  ]),
  q("quinlan", "The drive", "quinlan_drive", "Can you open Jonathan's drive?", [
    "If Mr. Ellery gives us the code. Our lab images it write-blocked. Nobody guesses at a drive that erases itself.",
  ], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "drive_image" }, reply: ["He gave us the code. The lab is imaging it now. I'll send you the summary."] },
      { requires: { labReady: "drive_image" }, reply: ["It's imaged. The summary's on your phone. Read item three."] },
    ],
  }),
  q("quinlan", "The card", "quinlan_a", "Who is 'A'?", [
    "A letter is not a name.",
  ], { requires: ev("E036") }),
  q("quinlan", "The card", "quinlan_holt", "Could Adrian Holt have written the card?", [
    "Adrian Holt has been in a cell in Carroway since the fifteenth. The card is dated the nineteenth.",
  ], { requires: ev("E036") }),
  q("quinlan", "Rourke", "quinlan_rourke", "What happened at Rourke's office?", [
    "Federal warrant this afternoon. His office, his safe. Passport, cash, a pistol, and a card. He's in custody.",
  ], { requires: { event: "RE08" } }),
  q("quinlan", "The scene", "quinlan_lyons", "Has Lyons said anything?", [
    "He asked for a lawyer. He hasn't said a word since.",
  ]),
  q("quinlan", "The scene", "quinlan_jonathan", "What happens to Jonathan now?", [
    "He's cooperating. He'll answer for what he did. That's not my decision, and it isn't today's.",
  ]),

  // =====================================================================
  // Jonathan Ellery: after RE07
  // =====================================================================
  q("jonathan", "Now", "jonathan_ok", "Are you all right?", [
    "I'm all right. I'm tired. I'm ashamed of a lot of things. Is Natalie okay?",
  ]),
  q("jonathan", "Meridian", "jonathan_2017", "How did you get involved with Meridian?", [
    "In 2017 I was drowning. Mom's care, a loan I guaranteed for a friend. A man from Meridian offered a lifeline.",
    "At first it was 'trends.' Then pricing. Then 'anything.' I knew it was wrong from the first pricing file. I did it anyway.",
  ], { reveals: "Jonathan says Meridian paid him from 2017, first for 'trends,' then pricing, then 'anything,' and he knew it was wrong from the first pricing file." }),
  q("jonathan", "Meridian", "jonathan_oct30", "What happened on October 30?", [
    "Rourke asked me for the evaluators on the recompete. Names, home addresses, 'anything personal.' I said no.",
    "He smiled and said, 'Everyone has a file.' I recorded it on my phone.",
  ], {
    reveals: "Jonathan says that on October 30 Julian Rourke asked him for the evaluators' names, addresses and 'anything personal'; he refused, and Rourke said 'Everyone has a file.'",
    effects: [tl("Tue 10/30", "At Meridian, Julian Rourke asks Jonathan for the evaluators' names, addresses and 'anything personal.' Jonathan refuses.", "Jonathan Ellery")],
  }),
  q("jonathan", "Meridian", "jonathan_garage", "What happened on November 1?", [
    "Garrett Lyons was waiting by my car in the garage at work. Level three. He didn't say much. 'Think about Natalie. Think about your mother's bills.'",
  ], { effects: [tl("Thu 11/1", "Garrett Lyons waits by Jonathan's car in the Eastbridge garage: 'Think about Natalie.'", "Jonathan Ellery")] }),
  q("jonathan", "Sunday", "jonathan_call", "Who called you at 9:12 on Sunday night?", [
    "Lyons. He said, 'We should talk before tomorrow.' I said no and hung up.",
  ], { effects: [tl("9:12 PM (Sun 11/18)", "Garrett Lyons calls Jonathan: 'We should talk before tomorrow.' Jonathan refuses.", "Jonathan Ellery")] }),
  q("jonathan", "Sunday", "jonathan_door", "What happened at your door on Sunday night?", [
    "At 10:31 he knocked. He said, 'Five minutes, and you never see us again.'",
    "I opened the door. I'd met him a dozen times. I wrote 'Do not open the door' in my own notebook and I opened it.",
  ], {
    reveals: "Jonathan says Garrett Lyons knocked at about 10:31 PM Sunday and said 'Five minutes, and you never see us again,' and he opened the door.",
    effects: [tl("10:31 PM (Sun 11/18)", "Garrett Lyons knocks at Room 614.", "Jonathan Ellery")],
  }),
  q("jonathan", "Sunday", "jonathan_room", "What happened inside the room?", [
    "He threatened my sister. He took the laptop.",
    "He wanted my copies. When I wouldn't say where they were, he tied my hands.",
  ], { reveals: "Jonathan says that inside Room 614 Lyons threatened Natalie, took his laptop, and tied his hands when he wouldn't say where his copies were." }),
  q("jonathan", "Sunday", "jonathan_out", "How did you leave the hotel?", [
    "Out the service door at the end of the hall. There was an elevator waiting. A man in a gray hotel work shirt was holding it. He wouldn't look at me. I never knew his name.",
    "Then a loading dock, cold, and the side door of a van.",
  ], { reveals: "Jonathan says he was walked out through the service door, a man in a gray hotel work shirt held an elevator without looking at him, and he was put in a van at a loading dock." }),
  q("jonathan", "The farmhouse", "jonathan_held", "Where were you held?", [
    "The upstairs room. The whole time. He brought water and protein bars. The window was boards.",
    "I scratched the dates on the door so I'd know. Monday. Tuesday.",
  ]),
  q("jonathan", "The farmhouse", "jonathan_julian", "Did you hear anything while you were held?", [
    "Monday morning, early, through the door. He was on the phone. 'He says there are no copies, Julian.'",
  ], {
    reveals: "Jonathan heard Lyons on the phone through the door on Monday morning: 'He says there are no copies, Julian.'",
    effects: [tl("About 7:05 AM (Mon 11/19)", "Through the door Jonathan hears Lyons on the phone: 'He says there are no copies, Julian.'", "Jonathan Ellery")],
  }),
  q("jonathan", "The farmhouse", "jonathan_list", "Did he show you anything?", [
    "A printed list. Pages of names. He said they were 'people who came around.' He wanted me to see I wasn't special.",
  ]),
  q("jonathan", "The farmhouse", "jonathan_index", "Is this the list he showed you?", [
    "That's it. That's my name at the top. 'Recover.'",
  ], { requires: ev("E035") }),
  q("jonathan", "Meridian", "jonathan_above", "Who is above Rourke?", [
    "I don't know. I never met anyone above him. I never heard anyone called 'A.'",
  ]),
  q("jonathan", "The drive", "jonathan_code", "Will you give the code to the drive?", [
    "Yes. To Detective Collins and Agent Quinlan. Now, while I'm sure of my own hands.",
    "It's everything. What I gave them, what they asked for, October 30.",
  ], {
    requires: ev("E022"),
    reveals: "Jonathan gave the drive's code to Det. Collins and Agent Quinlan; the FBI lab is imaging it.",
    effects: [{ startLab: "drive_image" }, { setFlag: "passphrase_given" }],
    volunteer: { near: "code pin drive envelope copies password unlock open" },
  }),
  q("jonathan", "The drive", "jonathan_envelope", "Where are your copies?", [
    "Irene Chen has an envelope for me. Sealed. The code opens what's inside. I never wrote it down.",
  ], { requires: not(ev("E022")) }),
  q("jonathan", "Now", "jonathan_natalie", "Natalie hired us to find you.", [
    "Of course she did. Tell her I'm sorry. No. I'll tell her.",
  ]),
  q("jonathan", "Now", "jonathan_after", "What happens now?", [
    "I testify. I tell them all of it, including me. I'll answer for what I sold.",
  ]),
  q("jonathan", "Sunday", "jonathan_hotel", "Why were you at the Ashcroft?", [
    "I didn't want to sleep at home the night before. I thought a hotel was safer. Quiet room, high floor, away from the elevators.",
  ]),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of the file?", [
    "Collins is good. She thinks he ran; she also wrote down that he left his shoes. A man who runs takes his shoes.",
    "Find out how somebody got to that door without a camera seeing.",
  ], {
    repeatable: true,
    variants: [
      { requires: d("D04"), reply: ["The back of a hotel is a whole other building. Find out who opened it for them."] },
      { requires: d("D10"), reply: ["A paid source about to talk, and the night's caller phoning his paymaster. Now find where they put him."] },
      { requires: rescued, reply: ["He's home. Now write it so it holds against all of them."] },
    ],
  }),
  q("bennett", "People", "bennett_natalie", "What do you know about Natalie Ellery?", [
    "She fixed my knee. She doesn't rattle. If she says he didn't walk away, he didn't.",
  ]),
  q("bennett", "Records", "bennett_meridian", "What can you find on Meridian Advisory Group?", [
    "Headquarters at 1620 K Street, floors eight to ten. Julian Rourke is Director of Corporate Intelligence. Private firm. Files little worth reading.",
  ], { requires: any({ chapter: 3 }, ev("E026")) }),
  q("bennett", "Records", "bennett_kestrel", "Run Kestrel Protective Group for me.", [
    "Licensed Maryland security agency, Rockville. Principal Garrett M. Lyons, ex-Army MP. Clean license. Guard contracts and a little alarm monitoring.",
  ], { requires: lyonsKnown }),
  q("bennett", "Records", "bennett_northgate", "Who is behind Northgate Bridge Lending?", [
    "Maryland LLC, formed March 2017. Resident agent: Garrett M. Lyons, at Kestrel's suite. A lender run from a security company's front desk.",
  ], { requires: ev("E019") }),
  q("bennett", "Records", "bennett_briarfield", "Who is behind Briarfield Holdings?", [
    "Maryland LLC. Same resident agent. Garrett M. Lyons.",
  ], { requires: ev("E028") }),
  q("bennett", "Records", "bennett_corvane", "What can you find on Corvane Systems?", [
    "Defense logistics contractor. Eastbridge's competitor on the recompete. Public company filings, nothing interesting in them.",
  ], { requires: ev("E018") }),
  q("bennett", "Records", "bennett_holt", "Where is Adrian Holt?", [
    "Held without bail in the Carroway County Prison since Thursday the 15th. He's not going anywhere.",
  ]),
  q("bennett", "Records", "bennett_courier", "Can you trace the courier waybill?", [
    "Capital Courier, account 20417. A business account with no public listing. Same as I told you in Carroway.",
  ], { requires: ev("E033") }),
  q("bennett", "Records", "bennett_jonathan", "Run Jonathan Ellery for me.", [
    "No record. Cleared employee at a defense contractor, so somebody's checked him harder than I can. Apartment in Clarendon.",
  ]),
  q("bennett", "Records", "bennett_hurst", "Run Kevin Hurst for me.", [
    "No criminal record. A couple of small-claims judgments from a payday lender. Behind, not crooked, on paper.",
  ], { requires: hurstKnown }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], { repeatable: true }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Natalie
  r("natalie", "E003", ["His phone. He'd never leave his phone. He sleeps with it on the pillow."]),
  r("natalie", "E002", ["His suit. His good shoes. He packed for Monday."]),
  r("natalie", "E017", ["'All of it. Including me.' What does that mean? What did he do?"]),
  r("natalie", "E024", ["'Think about Natalie.' Someone said my name to him.", "Who is G.L.?"]),
  r("natalie", "E019", ["Northgate. Sixty thousand. 'It's handled.' That's how it was handled."]),
  r("natalie", "E025", ["'Above board.' Then why did he hide it from me?"]),
  r("natalie", "E032", ["Don't. Don't show me that. Just tell me he's all right."]),
  // Monroe
  r("monroe", "E005", ["That's my note at the bottom. I wrote it Monday when I heard."]),
  r("monroe", "E027", ["It could be him. I couldn't swear to it."]),
  r("monroe", "E007", ["That's him, with the takeout. Thai, from the place on Fourteenth. He asked me where it was."]),
  // Wallace
  r("wallace", "E006", ["Opened from inside, twice. Nobody keyed in. He let somebody in, or somebody let himself out."]),
  r("wallace", "E007", ["The far end brightens at 10:29 and 10:59. That's the service door opening. I looked at it Monday and saw a flicker."]),
  r("wallace", "E008", ["A temporary badge in my dock door at 10:24. Badge 2231 in the corridor at 10:16. I should have pulled this Monday morning."]),
  r("wallace", "E011", ["Page three. I never looked at page three.", "Three people come out. One went in."]),
  r("wallace", "E013", ["Luis. Good kid. He remembers numbers. Lockers, plates, everything."]),
  r("wallace", "E015", ["My letter, clipped behind her memo. Somebody filed them together. Good."]),
  r("wallace", "E010", ["WO 3372 is Tuesday, day shift, and security gets told first. Sunday night isn't Tuesday."]),
  r("wallace", "E014", ["Independent service at six for two and a half minutes. That key is engineering and security only."]),
  r("wallace", "E016", ["Clocked out at 10:02. Badge in the corridor at 10:16. Out the employee door at 11:09. Bus home by ten fifteen, he told me."]),
  // Grant
  r("grant", "E009", ["A maintenance bypass is a maintenance bypass."]),
  r("grant", "E015", ["My memo. And Douglas's letter behind it.", "All right. Ask me about September."]),
  r("grant", "E016", ["Two advances declined this fall. I sign those. I didn't think about it."]),
  // Hurst
  r("hurst", "E008", ["Lot of people walk through B1. Badges get borrowed. It's a hotel."]),
  r("hurst", "E009", ["That's the S6-2 work order. I was getting ahead on it."], { requires: { not: hurstOpen } }),
  r("hurst", "E009", ["I set it. I told you I set it. That's all I did."], { requires: hurstOpen }),
  r("hurst", "E010", ["Tuesday. Yeah. Okay, it says Tuesday."]),
  r("hurst", "E015", ["Engineering does vendor badges. Ms. Grant said so in September."]),
  r("hurst", "E016", ["I clocked out. I did clock out. It says I clocked out."]),
  r("hurst", "E029", ["I won some games."], { requires: { not: d("D11") } }),
  r("hurst", "E030", ["I deleted those because I was scared. 'Talk to a guy.' That's what he said."]),
  r("hurst", "E027", ["I don't know that guy. I mean. I don't know his last name."]),
  r("hurst", "E011", ["I don't look at cameras. I'm engineering."]),
  // Okoye
  r("okoye", "E017", ["The task force letter. All right. Ask me about the review."]),
  r("okoye", "E018", ["'We missed this for a year.' My handwriting. My year."]),
  r("okoye", "E004", ["EB-L-20441. That's ours. The laptop it belongs to isn't in that picture."]),
  r("okoye", "E019", ["The security office referred it in September. It came to me. I opened a file. That's all I did."]),
  r("okoye", "E024", ["Our garage. Level three. Nobody told us."]),
  // Chen
  r("chen", "E021", ["My card, my handwriting. I won't discuss what it refers to."], { requires: { not: chenRelease } }),
  r("chen", "E020", ["'Call Irene Chen.' He told his sister to call me. I wish she had sooner."]),
  r("chen", "E017", ["Addressed to him care of me. Yes. I won't say more about it."], { requires: { not: chenRelease } }),
  r("chen", "E022", ["Seal 18-114. Intact until today, in front of you."]),
  r("chen", "E023", ["He did what I told him to do. All of it, including him."]),
  // Rourke
  r("rourke", "E025", ["Section 6. 'Nothing provided is confidential.' He signed that."]),
  r("rourke", "E026", ["Advisors need chasing. And I get a great many wrong numbers."]),
  r("rourke", "E033", ["Stolen, and misread. Client lists are commercial secrets, not confessions."]),
  r("rourke", "E034", ["Internal accounting, taken out of context."]),
  r("rourke", "E035", ["I have never seen that document."]),
  r("rourke", "E027", ["Meridian uses dozens of vendors. Kestrel is one of many."]),
  r("rourke", "E018", ["Eastbridge's internal paperwork. I couldn't comment on it."]),
  r("rourke", "E024", ["A man's private notebook. 'J.R.' is a great many people."]),
  // Lyons
  r("lyons", "E027", ["Vans go out with staff. Plate readers catch a lot of vans."]),
  r("lyons", "E030", ["'G.' That narrows it to everyone named Greg."], { requires: { not: d("D11") } }),
  r("lyons", "E030", ["Jonathan wanted to talk. Kevin helped with a door. Ask Jonathan."], { requires: d("D11") }),
  r("lyons", "E013", ["A dishwasher saw a van. There's a lot of gray vans."]),
  r("lyons", "E011", ["Can't read a plate on that. Can't read a face either."]),
  r("lyons", "E026", ["Somebody's prepaid. Not my problem."]),
  r("lyons", "E024", ["Lots of people have the initials G.L."]),
  // Collins
  r("collins", "E001", ["My note's at the bottom. I meant it."]),
  r("collins", "E002", ["Photo eleven. A cable tie tail, and nobody collected it. I'll live with that."]),
  r("collins", "E004", ["The laptop's gone and nothing else is. Whoever went in knew what they wanted."]),
  r("collins", "E006", ["Opened from inside twice. Nobody keyed in from the corridor."]),
  r("collins", "E008", ["A vendor badge at 10:24 on a Sunday night, in the dock and up to six. That's a door somebody opened for somebody."]),
  r("collins", "E009", ["The alarm off for forty-five minutes on the door by his room. I'm done saying 'voluntary.'"]),
  r("collins", "E011", ["Three people out, the middle one with no coat, into a van. That's not a man walking away."]),
  r("collins", "E013", ["'3C.' Maryland. Give me that and the dock camera and I'll run it."]),
  r("collins", "E020", ["'If you don't hear from me by tomorrow night, call Irene Chen.' He knew something was coming."]),
  r("collins", "E026", ["The supplemental page is the caller's own activity. Worth lining up against his own phone records."]),
  r("collins", "E030", ["'Here.' Texted as the van backed in. Deleted isn't gone."]),
  r("collins", "E031", ["Armed stay. Every time he leaves. Not away. Stay."]),
  r("collins", "E028", ["Six months paid in advance on a farmhouse in August. Corporate housing."]),
  r("collins", "E032", ["The hasp's new. The receipt's from Saturday. He built this before he took him."]),
  // Quinlan
  r("quinlan", "E035", ["That came out of the bag in his van. It's tagged."]),
  r("quinlan", "E036", ["A letter is not a name."]),
  r("quinlan", "E023", ["Item three is the one a jury will remember."]),
  r("quinlan", "E033", ["I'll want to know how that reached you. I don't expect you know either."]),
  // Jonathan
  r("jonathan", "E022", ["My envelope. Irene kept it. Of course she did."]),
  r("jonathan", "E024", ["'Do not open the door for G.L.' I wrote that Sunday. I opened the door."]),
  r("jonathan", "E035", ["That's the list. My name's on it. 'Recover.'"]),
  r("jonathan", "E032", ["I don't want to look at that room again."]),
  r("jonathan", "E025", ["Section 6. I signed that knowing it wasn't true."]),
  r("jonathan", "E036", ["I don't know who that is. I never heard anyone called 'A.'"]),
  // Bennett
  r("bennett", "E033", ["Capital Courier, account 20417. A business account with no public listing. Same as I told you in Carroway."]),
  r("bennett", "E019", ["A Rockville lender paying a cleared analyst twenty-five hundred a month. Find out who Northgate is."]),
  r("bennett", "E026", ["Phone records are honest. People aren't."]),
  r("bennett", "E036", ["A typed card and one letter. Hang on to it."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "c_hurst_left",
    characterId: "hurst",
    title: "Kevin Hurst: left at ten",
    text: "Kevin Hurst says he clocked out at ten on Sunday and was on the bus home by 10:15. His badge, 2231, opened the B1 service corridor at 10:16 PM and went out the employee entrance at 11:09 PM, and the S6-2 alarm was bypassed under his code at 10:19 PM.",
    when: { all: [{ asked: "hurst_sunday" }, { any: [ev("E008"), ev("E009")] }] },
  },
  {
    id: "c_grant_badges",
    characterId: "grant",
    title: "Celia Grant: nobody in the back of house",
    text: "Celia Grant says no one gets into the back of the house without security. Under her memo of September 10, engineering issued temporary vendor badge T-07 at 9:41 PM Sunday, with access to the dock, the service elevator and the service doors on floors 5 to 7, without security sign-off.",
    when: { all: [{ asked: "grant_security" }, ev("E015")] },
  },
  {
    id: "c_wallace_voluntary",
    characterId: "wallace",
    title: "Douglas Wallace: he left on his own",
    text: "Douglas Wallace believed Jonathan left the hotel on his own. A temporary badge entered at the dock, rode the service elevator to six and opened S6-2 at 10:29 PM; S6-2 opened from inside at 10:59 PM, the elevator went down to B1, and the dock door opened from inside at 11:04 PM.",
    when: { all: [{ asked: "wallace_voluntary" }, d("D04")] },
  },
  {
    id: "c_okoye_review",
    characterId: "okoye",
    title: "David Okoye: no internal matter",
    text: "David Okoye said Eastbridge had no internal matter concerning Jonathan and that no task force had told him anything. Internal review IR-18-027 was opened on August 20, traces the leaked pricing file to Jonathan's export, and records the task force's notice of October 25.",
    when: { all: [{ asked: "okoye_review" }, ev("E018")] },
  },
  {
    id: "c_rourke_contact",
    characterId: "rourke",
    title: "Julian Rourke: last spoke in the summer",
    text: "Julian Rourke says he last spoke to Jonathan in the summer. Rourke's Meridian cell had 14 calls with Jonathan's phone in 2018, the last answered on October 30, with unanswered calls on November 12 and 16.",
    when: { all: [{ asked: "rourke_contact" }, ev("E026")] },
  },
  {
    id: "c_lyons_sunday",
    characterId: "lyons",
    title: "Garrett Lyons: home, the van in the lot",
    text: "Garrett Lyons says he was home in Rockville on Sunday night with the van in the lot. Plate readers recorded Kestrel's van, MD 3CR7719, southbound on I-270 at Urbana at 6:21 PM and northbound at Germantown at 11:41 PM.",
    when: { all: [{ asked: "lyons_sunday" }, ev("E027")] },
  },
  {
    id: "c_lyons_meeting",
    characterId: "lyons",
    title: "Garrett Lyons: dropped at Union Station",
    text: "Garrett Lyons says Jonathan asked for a meeting and was dropped at Union Station after midnight. The farmhouse alarm Lyons controls was disarmed at 12:16 AM Monday and set to 'someone inside' every time he left, and a padlocked, boarded room was built there the day before.",
    when: { all: [{ asked: "lyons_meeting" }, { any: [ev("E031"), ev("E032")] }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  natalie_hire: "why did you hire us why come to blackwood why an investigator why not the police bennett sent you",
  natalie_jonathan: "tell me about your brother jon jonathan who is he what is he like what does he do his job",
  natalie_walkaway: "could he have walked away run off left on his own disappeared voluntarily ran away would he leave",
  natalie_texts: "last hear from him last contact last talk messages texts text message screenshots what did he text when did you last speak",
  natalie_sunday: "sunday night try to reach call him did you call phone him no answer 10:45",
  natalie_mother: "your mother mom memory care cranberry township parents family",
  natalie_money: "jon money problems trouble struggling debt debts broke bills finances loan owe owed handled",
  natalie_frightened: "how did he seem lately acting last few weeks mood scared afraid frightened worried nervous behaving recently",
  natalie_lawyer: "lawyer attorney irene legal counsel",
  natalie_taskforce: "appointment monday meeting task force interview 9:30 where was he going",
  natalie_passcode: "passcode password phone code unlock pin 0411",
  natalie_work: "his work job eastbridge talk about work what did he do at work",
  natalie_garage: "anyone bothering him threatened followed someone waiting man by his car garage consulting people strange people anyone from work",
  natalie_sold: "selling information sold secrets confidential pricing leak he was paid what he did wrong",
  natalie_notebook: "notebook g.l. think about natalie man by his car wrote about",
  natalie_police: "police detective collins what have the police said what do the police think",
  natalie_found: "he's alive found him rescued safe good news",
  monroe_who: "what do you do your job who are you front desk",
  monroe_checkin: "check in checkin checked in what time registration record registration card arrival arrive booking keys",
  monroe_manner: "how did he seem mood demeanor behave nervous jumpy tired polite",
  monroe_room: "why room 614 which room quiet room request high floor away from elevators",
  monroe_visitor: "anyone anybody ask about him visitor someone asking come came coming room number colleague looking for him man at the desk",
  monroe_describe: "what did the man look like describe him appearance cap jacket hair age face",
  monroe_policy: "give out room numbers policy rule ring the room",
  monroe_sunday: "see him again later sunday night come down the lobby after he went up",
  monroe_license: "is this the man license photo picture recognize identify him lyons",
  monroe_hurst: "kevin hurst engineering engineer do you know kevin",
  wallace_who: "who are you what do you do security director your background police",
  wallace_cameras: "cameras camera security footage video what do the cameras show pick up picked caught surveillance cctv guest elevators sixth floor landing",
  wallace_lock: "lock record lock audit door lock key card entries who opened the door room 614 keycard log",
  wallace_voluntary: "what do you think happened your theory where did he go did he leave on his own",
  wallace_visitor: "lobby camera man in a cap who asked for his room 7:49 desk visitor face",
  wallace_welfare: "who opened the room monday welfare check found the room empty",
  wallace_service: "service side back of house staff corridors service doors s6-2 behind the scenes",
  wallace_dock: "loading dock camera dock-1 dock video back door camera alley",
  wallace_bypass: "s6-2 alarm bypass bypassed what did you find alarm turned off disabled code 2231",
  wallace_hurst: "kevin hurst what do you know about hurst the engineer gambling",
  wallace_memo: "celia grant memo badge memo objected objection your letter",
  wallace_luis: "staff see anything witness employees kitchen dishwasher luis van statement anyone notice",
  wallace_badge: "badge t-07 temporary badge vendor badge credential who made it",
  wallace_rex: "rex request to exit what does rex mean push bar",
  wallace_changed: "still think he walked out changed your mind were you wrong left on his own now",
  wallace_staff: "asked the staff on duty sunday shift who was working employees questioned what did hurst tell you",
  grant_who: "what's your role who are you general manager the hotel occupancy",
  grant_privacy: "cooperate help records privacy will the hotel help authorize",
  grant_security: "could someone get into the back of house back of the hotel security failure service doors monitored",
  grant_bypass: "why was the alarm bypassed s6-2 bypass maintenance bypass alarm off",
  grant_memo: "september 10 memo vendor badges after hours without security sign-off overtime your memo",
  grant_hurst: "kevin hurst employment records hr file personnel file schedule timeclock time clock shift records",
  grant_locker: "hurst's locker open his locker locker 41 search locker",
  grant_natalie: "contact his family call his sister natalie emergency contact who called",
  grant_room: "room opened monday what happened when they opened the room empty",
  grant_wallace: "douglas wallace what do you think of wallace your security director",
  hurst_who: "who are you what do you do your name your job",
  hurst_sunday: "where were you sunday night shift what did you do after work clock out leave go home bus alibi",
  hurst_guest: "see the guest room 614 jonathan the man in 614 see him",
  hurst_job: "what does a maintenance engineer do your job duties engineering",
  hurst_elevator: "service elevator key independent service who has the key",
  hurst_bypass: "alarm bypass s6-2 your code 2231 why did you bypass turn off the alarm",
  hurst_contractor: "who was the contractor the guy who paid you hvac guy who asked you name",
  hurst_badge: "badge t-07 why did you create make issue the vendor badge temporary badge",
  hurst_money: "cash deposit deposits money where did the money come from atm 5,000 2,500 sportsbook paid off",
  hurst_messages: "messages texts deleted why did you delete your phone",
  hurst_debts: "payroll advances turned down declined debt broke owe gambling",
  hurst_garrett: "how did you meet garrett sports bar m street when did you meet him thursday",
  hurst_elevator_six: "what happened at the elevator held the elevator sixth floor service car walking his arm",
  hurst_name: "did you know who he was the man jonathan his name know him",
  hurst_phone: "your phone collins took your phone consent",
  okoye_who: "what do you do at eastbridge who are you compliance ethics",
  okoye_jonathan: "tell me about jonathan ellery what kind of employee",
  okoye_review: "internal matter internal review investigation concerning jonathan leak inquiry has anyone contacted you",
  okoye_taskforce: "task force interview letter monday 9:30 varga he was going to talk",
  okoye_file: "personnel security file personnel file security clearance financial records his file",
  okoye_laptop: "laptop company issued charger asset tag vpn computer last connected",
  okoye_kestrel: "kestrel protective group northgate bridge lending heard of",
  okoye_corvane: "corvane systems competitor who is corvane recompete proposal",
  okoye_export: "who exported the pricing file export rate tables may 14 who leaked",
  okoye_meridian: "meridian advisory group market brief letterhead",
  okoye_notebook: "notebook someone waited by his car garage november 1 your garage",
  chen_who: "what kind of law who are you what do you do practice",
  chen_client: "is he your client jonathan your client represent him",
  chen_monday: "monday morning what happened 8:15 appointment interview did he show up",
  chen_deposit: "deposit 18-114 appointment card what did he leave with you",
  chen_release: "release the envelope what he left give it to us what is in the envelope sealed rule 1.6",
  chen_code: "code to the drive pin password do you know the code",
  chen_first: "when did he first come to you first meeting october 31",
  chen_advice: "what did you advise him your advice tell everything",
  chen_sunday: "sunday at your office sunday afternoon 1:00",
  chen_varga: "investigator varga who is varga task force investigator",
  rourke_who: "who are you what do you do your job",
  rourke_agreement: "relationship with meridian advisor agreement contract what did he do for you independent advisor consultant",
  rourke_contact: "when did you last speak to him last talk last contact last see him",
  rourke_whereabouts: "where is jonathan do you know where he is",
  rourke_work: "what does corporate intelligence do your division your work what kind of research",
  rourke_calls: "phone calls fourteen calls why did you call him carrier records 9:20 11:12 prepaid number",
  rourke_kestrel: "kestrel protective group vendor garrett lyons kestrel",
  rourke_clientlist: "client list clients meridian intelligence client list",
  rourke_funding: "funding cross-reference budget pays kestrel northgate cost center",
  rourke_index: "index compromising information index lyons's bag files on people",
  rourke_superior: "who do you report to your boss superior above you who gives you orders",
  rourke_northgate: "northgate bridge lending disbursing agent loan payments",
  rourke_corvane: "corvane systems client corvane",
  rourke_holt: "adrian holt know holt carroway pittsburgh office",
  lyons_who: "what does kestrel do who are you your company your business",
  lyons_meridian: "do you work for meridian employed by meridian advisory group client project",
  lyons_jonathan: "do you know jonathan ellery met him",
  lyons_sunday: "where were you sunday night alibi home that night",
  lyons_van: "vans van your van kestrel vans transit who drives fleet",
  lyons_meeting: "what really happened sunday night the truth tell me the truth meeting",
  lyons_hurst: "kevin hurst who is hurst the hotel engineer",
  lyons_where: "where is jonathan where is he where did he go",
  lyons_prepaid: "whose phone prepaid 240 555-0179 burner number",
  lyons_rourke: "julian rourke know rourke who gives you orders who do you answer to",
  lyons_garage: "g.l. initials notebook his car garage november 1",
  collins_case: "where does the case stand investigation status theory what do you think update",
  collins_report: "missing person report police report the report your report",
  collins_photos: "photographs photos pictures of the room scene photos",
  collins_voluntary: "did he leave on his own voluntary walk away ran do you think he ran",
  collins_phone_wait: "phone records his phone records call records carrier subpoena records",
  collins_carrier: "phone records his phone records call records carrier exigent request now",
  collins_lab: "anything back from the lab results lab report any results",
  collins_hurst_wait: "take hurst's phone kevin hurst phone his phone search hurst",
  collins_hurst: "hurst's phone kevin hurst phone examined extraction digital evidence his phone",
  collins_plate_wait: "trace the van the van from the dock plate van owner",
  collins_plate: "run the plate partial plate 3c license plate van registration who owns the van trace the van",
  collins_warrant_wait: "warrant kestrel office search kestrel",
  collins_kestrel: "warrant kestrel office search kestrel now montgomery county",
  collins_fbi: "fbi state police who else is involved federal",
  collins_farmhouse: "are we going in go in the farmhouse door entry",
  collins_rescue: "is jonathan all right is he okay alive what happened at the farmhouse",
  quinlan_who: "why is the fbi involved who are you federal",
  quinlan_van: "what did you take from the van bag laptop evidence",
  quinlan_drive: "open the drive the encrypted drive imaging can you open it",
  quinlan_a: "who is a the card signed a who signed wrote written letter initial",
  quinlan_holt: "adrian holt could holt have written the card",
  quinlan_rourke: "rourke's office the search the safe rourke arrested",
  quinlan_lyons: "has lyons said anything lyons talking",
  quinlan_jonathan: "what happens to jonathan now charges will he be charged",
  jonathan_ok: "are you all right okay how are you hurt",
  jonathan_2017: "how did you get involved with meridian how did it start why did you do it 2017 money sell information",
  jonathan_oct30: "october 30 meeting with rourke what did rourke want from you ask asked demand evaluators everyone has a file",
  jonathan_garage: "november 1 garage by your car lyons waiting think about natalie",
  jonathan_call: "who called you at 9:12 phone call sunday night",
  jonathan_door: "what happened at your door who knocked why did you open the door who came to the room",
  jonathan_room: "what happened inside the room what did he do to you in the room laptop tied threatened",
  jonathan_out: "how did you leave the hotel how did you get out service door elevator who held the elevator",
  jonathan_held: "where were you held kept locked room farmhouse food",
  jonathan_julian: "did you hear anything overheard phone call through the door julian",
  jonathan_list: "did he show you anything list papers names",
  jonathan_index: "is this the list index he showed you",
  jonathan_above: "who is above rourke who gives rourke orders who is a boss",
  jonathan_code: "code to the drive give the code pin password unlock the drive",
  jonathan_envelope: "where are your copies the copies your evidence what did you keep",
  jonathan_natalie: "natalie your sister hired us",
  jonathan_after: "what happens now what will you do testify",
  jonathan_hotel: "why were you at the ashcroft why a hotel why not home",
  bennett_case: "what do you make of the file your read what do you think advice",
  bennett_natalie: "natalie ellery what do you know about natalie your therapist",
  bennett_meridian: "meridian advisory group records background run meridian",
  bennett_kestrel: "kestrel protective group run kestrel background license",
  bennett_northgate: "northgate bridge lending who is northgate run northgate",
  bennett_briarfield: "briarfield holdings who is briarfield run briarfield",
  bennett_corvane: "corvane systems run corvane background",
  bennett_holt: "adrian holt where is holt jail custody",
  bennett_courier: "courier waybill account 20417 capital courier trace sender",
  bennett_jonathan: "run jonathan ellery background on jonathan record",
  bennett_hurst: "run kevin hurst background on hurst record",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
