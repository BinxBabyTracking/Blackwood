import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C01 "The Ledger" interviews, written against docs/S001C01-timeline.md.
 *
 * Rules for this file: nobody confesses; Holt and Reddick give their own
 * accounts, lies included; nobody names the killer; nobody states a forensic
 * result that is not in a report; every time, amount and number agrees with
 * the timeline. Nothing from the "Closing report only" list is said by anyone.
 * Holt calls Dr. Lockhart "the founding donor" and nothing more, and never
 * mentions anyone above him. Dr. Lockhart is gracious and helpful and says
 * nothing a later case contradicts. Nobody explains the copier footer or the
 * courier account on E030. Det. Bowman starts on burglary and moves with the
 * evidence.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const never: Condition = { not: { always: true } };
const reddickKnown: Condition = { any: [ev("E022"), ev("E026"), { talkedTo: "avery" }, ev("E021")] };
const amesKnown: Condition = { any: [ev("E009"), ev("E010"), { talkedTo: "hannah" }] };
const triCountyKnown: Condition = { any: [ev("E030"), ev("E015"), ev("E011")] };
const whitfieldShown: Condition = { any: [ev("E013"), ev("E015")] };
const morrisReady: Condition = { any: [{ visited: "rear_lot" }, { asked: "morris_thursday" }] };
const lockhartLead: Condition = { event: "RE02" };
const fosterKnown: Condition = ev("E028");
const holtAdmits: Condition = { flag: "holt_admits" };
const holtLawyer: Condition = { all: [{ presented: "holt:E019" }, { presented: "holt:E025" }] };
const reddickRefuses: Condition = { all: [{ flag: "reddick_refuses" }, { not: { any: [ev("E007"), ev("E024")] } }] };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The victim: in the file and on the board, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "martin",
    name: "Martin Keller",
    role: "Controller, Carroway Community Foundation. The victim",
    portrait: "char.martin",
    bio: [
      { text: "Forty-six. Controller of the Carroway Community Foundation for eleven years. Lived at 23 Orchard Street, Carroway. Hannah Keller's father." },
      { text: "Found dead in his office on the second floor of the Mercantile Building at 6:40 AM on Friday, November 9, 2018." },
      { text: "Had an appointment with Walter Ames, CPA, at 9:00 AM that Friday.", requires: { any: [ev("E009"), ev("E010")] } },
      { text: "Kept a hidden ledger of fund payments from July 23, 2018.", requires: ev("E011") },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },

  // ---------------------------------------------------------------------
  // Everyone else
  // ---------------------------------------------------------------------
  {
    id: "hannah",
    name: "Hannah Keller",
    role: "Martin's daughter, your client",
    portrait: "char.hannah",
    bio: [
      { text: "Twenty-four. Graduate student in public policy at the University of Pittsburgh. Lives at 5612 Darlington Road, Squirrel Hill." },
      { text: "Hired Blackwood on Monday, November 12. Has her father's house key." },
    ],
    available: { always: true },
    locationId: "hannah_apt",
    phone: { talkedTo: "hannah" },
    contact: "Your client. Squirrel Hill.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. Dad never talked about work in detail.",
    idleLine: "I need a minute. Call me when you know something.",
    noAnswer: ["I don't know.", "Dad never told me that.", "I wish I knew."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman of twenty-four, a graduate student, sharp and organized, grieving and holding it together. Western Pennsylvania American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "grieving", label: "Grieving", requires: { always: true } },
      { id: "determined", label: "Determined", requires: { any: [{ event: "RE01" }, ev("E011"), ev("E014")] }, cue: "Hannah has a legal pad on her knee now. She's writing things down." },
    ],
  },
  {
    id: "whitfield",
    name: "Susan Whitfield",
    role: "Executive director, Carroway Community Foundation",
    portrait: "char.whitfield",
    bio: [
      { text: "Fifty-four. Executive director of the Carroway Community Foundation, second floor of the Mercantile Building, 118 Market Street." },
      { text: "Signed the 2014 administrative services agreement with Holt Advisory." },
      { text: "Martin wrote to her about the fund's payments on October 22. She asked him to wait.", requires: ev("E027") },
    ],
    available: { always: true },
    locationId: "foundation",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what you'd like me to say about that.",
    idleLine: "I have a board to answer to. Let's continue another time.",
    noAnswer: ["I wouldn't know that.", "You'd have to ask Martin's files. I'm sorry. That's a habit.", "That's not something I handle."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman in her mid fifties, a nonprofit executive director: gracious, practiced, donor-polished; brittle and defensive under pressure, then quietly ashamed. Western Pennsylvania American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "gracious", label: "Gracious", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { any: [ev("E013"), ev("E015"), ev("E018")] }, cue: "Susan's smile stays where it is. Her hands have gone very still on the desk." },
      { id: "contrite", label: "Contrite", requires: ev("E027"), cue: "Susan takes off her reading glasses and doesn't put them back on." },
    ],
  },
  {
    id: "holt",
    name: "Adrian Holt",
    role: "Principal, Holt Advisory LLC; fund administrator",
    portrait: "char.holt",
    bio: [
      { text: "Forty-nine. Principal of Holt Advisory LLC, Suite 2210, 600 Grant Street, Pittsburgh. Administrator of the Small Business Recovery Fund since 2014." },
      { text: "Listed on the suite's nameplate as an affiliate partner of Meridian Advisory Group, whose Pittsburgh office shares his suite." },
      { text: "Signed every program services authorization from July to October 2018.", requires: ev("E018") },
    ],
    available: { always: true },
    locationId: "meridian",
    onBoard: true,
    defaultEvidenceReply: "I don't see the relevance.",
    idleLine: "I have a client call. We're done for today.",
    noAnswer: ["I couldn't say.", "That isn't something I'd know.", "You'd have to ask the foundation."],
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Man of about fifty, a Pittsburgh financial adviser: polished, articulate, confident, impatient, faintly condescending; clipped and careful when cornered. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "impatient", label: "Impatient", requires: { any: [ev("E011"), ev("E012"), ev("E015"), ev("E016"), ev("E017")] }, cue: "Holt glances at the clock over the door and doesn't hide it." },
      { id: "defensive", label: "Defensive", requires: holtAdmits, cue: "Holt has stopped leaning back. He's choosing every word." },
      { id: "refusing", label: "Declining to answer", requires: holtLawyer, refuses: "I'll have my attorney call you. We're finished.", cue: "Holt picks up his desk phone and asks Carol to get his lawyer on the line." },
    ],
  },
  {
    id: "reddick",
    name: "Paul Reddick",
    role: "Owner, Reddick Maintenance Services",
    portrait: "char.reddick",
    bio: [
      { text: "Thirty-eight. Runs Reddick Maintenance Services from a garage bay and office at 2207 Route 30 East, Carroway." },
      { text: "Maintenance contractor for the Mercantile Building since April 2, 2018. Holds card 0447, 24-hour access." },
      { text: "Drives a white 2015 Ford Transit 250 with a ladder rack and his company name on both sides, PA plate ZRK-1186.", requires: ev("E023") },
    ],
    available: { always: true },
    known: reddickKnown,
    locationId: "reddick_shop",
    onBoard: true,
    defaultEvidenceReply: "Don't know what that is. I fix boilers.",
    idleLine: "I got work. We're done.",
    noAnswer: ["Couldn't tell you.", "No idea.", "Ask somebody in an office."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man in his late thirties, a small-town maintenance contractor: easygoing and friendly at first, short answers, then guarded, then flat and hostile. Western Pennsylvania American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "easygoing", label: "Easygoing", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { any: [{ deduction: "D06" }, ev("E026"), ev("E023")] }, cue: "Reddick puts the wrench down and wipes his hands, slowly." },
      { id: "hostile", label: "Hostile", requires: { deduction: "D07" }, cue: "Reddick isn't smiling anymore. He stands between you and the van." },
      { id: "refusing", label: "Declining to answer", requires: reddickRefuses, refuses: "I'm done talking. You got something new, bring it. Otherwise get off my lot.", cue: "Reddick turns his back and starts loading the van." },
    ],
  },
  {
    id: "lockhart",
    name: "Dr. Evelyn Lockhart",
    role: "Founder, the Lockhart Foundation; founding donor of the fund",
    portrait: "char.lockhart",
    bio: [
      { text: "Fifty-two. Founder of the Lockhart Foundation, 1140 Fifth Avenue, New York." },
      { text: "The founding donor of the Carroway Small Business Recovery Fund since 2014. Sent Blackwood a copied invoice that reached her office by courier." },
    ],
    available: lockhartLead,
    known: lockhartLead,
    locationId: null,
    medium: "telephone",
    phone: lockhartLead,
    contact: "The Lockhart Foundation, New York. Her office puts you through.",
    onBoard: true,
    defaultEvidenceReply: "I'm afraid I really couldn't say. I'm sorry not to be more help.",
    idleLine: "I have a board meeting, I'm afraid. Do call again if I can help.",
    noAnswer: ["I really couldn't say.", "I'm afraid I don't know.", "That's outside anything I know, I'm sorry."],
    voice: {
      voiceId: "pFZP5JQG7iQjIQuC4Bku",
      direction: "Woman in her early fifties, a New York philanthropist on the telephone: composed, gracious, precise, warm in a measured way, unhurried. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [{ id: "gracious", label: "Gracious", requires: { always: true } }],
  },
  {
    id: "ames",
    name: "Walter Ames",
    role: "Partner, Ames and Kiley CPAs",
    portrait: "char.ames",
    bio: [
      { text: "Forty-three. Partner at Ames and Kiley, Certified Public Accountants, 4th floor, 310 Grant Street, Pittsburgh." },
      { text: "Martin Keller's appointment at 9:00 AM on Friday, November 9. Martin never arrived." },
    ],
    available: { always: true },
    known: amesKnown,
    locationId: "ames_office",
    onBoard: true,
    defaultEvidenceReply: "I'd want to sit with that before I said anything about it.",
    idleLine: "I have a client at the top of the hour. Come back any time.",
    noAnswer: ["The records don't tell me that.", "I won't guess at that.", "That's a question for the police, not an accountant."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man in his early forties, a forensic accountant: careful, kind, exact, explains money plainly, never overstates. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [ev("E011"), ev("E013"), { flag: "bank_records" }] }, cue: "Ames clears a space on his desk and uncaps a pen." },
    ],
  },
  {
    id: "avery",
    name: "Stanley Avery",
    role: "Security supervisor, the Mercantile Building",
    portrait: "char.avery",
    bio: [
      { text: "Sixty-one. Security supervisor for the Mercantile Building's owner. Keeps the card access system. His desk is inside the rear service door on Mulberry Alley." },
    ],
    available: { always: true },
    locationId: "rear_lot",
    onBoard: true,
    defaultEvidenceReply: "Not my department. Doors are my department.",
    idleLine: "I got rounds to walk. You know where the desk is.",
    noAnswer: ["The system doesn't record that.", "Couldn't tell you.", "That's a police question."],
    voice: {
      voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      direction: "Man in his early sixties, a building security supervisor and retired small-town cop: gruff, blunt, plain-spoken, warming up once he's helping. Western Pennsylvania American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "gruff", label: "Gruff", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: { any: [ev("E006"), ev("E022")] }, cue: "Avery pulls a second chair over to the desk." },
    ],
  },
  {
    id: "morris",
    name: "Angela Morris",
    role: "Administrative assistant, Carroway Community Foundation",
    portrait: "char.morris",
    bio: [
      { text: "Thirty-five. Administrative assistant at the Carroway Community Foundation: reception, grant files, the phones." },
      { text: "Worked late on Thursday, November 8, and left by the rear lot at about 7:48 PM.", requires: ev("E026") },
    ],
    available: { always: true },
    locationId: "foundation",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what that is.",
    idleLine: "Susan's going to wonder what we're talking about. Can we stop?",
    noAnswer: ["I don't know.", "I'm sorry, I really don't.", "Nobody tells me that kind of thing."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman in her mid thirties, an office administrative assistant: nervous, kind, quick, worried about her job, a Pittsburgh accent.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E026"), cue: "Angela lets out a long breath. She looks lighter for having said it." },
    ],
  },
  {
    id: "bowman",
    name: "Det. Curtis Bowman",
    role: "Carroway Police, lead investigator",
    portrait: "char.bowman",
    bio: [
      { text: "Forty-seven. Carroway Police Department detective, lead on case 18-1108-022." },
      { text: "Reachable at the station on Court Street or by phone." },
    ],
    available: { always: true },
    locationId: "police",
    phone: { always: true },
    contact: "Carroway PD, 40 Court Street. Lead detective on the Keller case.",
    onBoard: false,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man in his late forties, a small-town police detective: professional, plain-spoken, patient, a little dry, honest. Western Pennsylvania American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [{ deduction: "D01" }, { deduction: "D06" }] }, cue: "Bowman pulls a fresh legal pad toward him. He's writing now, not just listening." },
    ],
  },
  {
    id: "foster",
    name: "Warren Foster",
    role: "Owner, Foster's Hardware and Supply",
    portrait: "char.foster",
    bio: [
      { text: "Forty-two. Owner of Foster's Hardware and Supply in Carroway. A 2017 Recovery Fund grantee." },
      { text: "Argued loudly with Martin Keller at the foundation on Monday, November 5, over a $12,000 clawback letter." },
    ],
    available: fosterKnown,
    known: fosterKnown,
    locationId: null,
    medium: "telephone",
    phone: fosterKnown,
    contact: "Foster's Hardware and Supply, Carroway.",
    onBoard: true,
    defaultEvidenceReply: "I don't know anything about that. I sell nails.",
    idleLine: "I got customers. Call the store if you need me.",
    noAnswer: ["No idea.", "I wouldn't know.", "I sell hardware, I don't know about that."],
    voice: {
      voiceId: "IKne3meq5aSn9XLyUdCD",
      direction: "Man in his early forties, a small-town hardware store owner on the phone: loud and defensive at first, then embarrassed and decent. Western Pennsylvania American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 },
    },
    demeanor: [
      { id: "hot", label: "Hot", requires: { always: true } },
      { id: "sheepish", label: "Sheepish", requires: { asked: "foster_argument" }, cue: "Foster goes quiet on the line for a second. When he speaks again, it's lower." },
    ],
  },
  {
    id: "bennett",
    name: "Frank Bennett",
    role: "Blackwood records, by phone",
    portrait: "char.bennett",
    bio: [
      { text: "Forty years with the LAPD, retired. Blackwood keeps him on to pull records and backgrounds." },
      { text: "Reachable by phone, any time." },
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
  // Hannah Keller: the client
  // =====================================================================
  q("hannah", "Hiring us", "hannah_hire", "Why did you come to Blackwood?", [
    "Because the police keep saying burglary. Dad didn't own anything worth stealing except his files.",
    "Somebody went into his office for a reason. I want to know what it was.",
  ]),
  q("hannah", "Her father", "hannah_dad", "Tell me about your father.", [
    "He was the controller at the foundation for eleven years. He balanced his checkbook to the penny and read the footnotes in annual reports for fun.",
    "We were close. He called me every Wednesday, whether I picked up or not.",
  ]),
  q("hannah", "Her father", "hannah_anxious", "Was your father worried about anything?", [
    "Since October, yes. He said something at work didn't add up. I asked what, and he said, 'I'll tell you when I'm sure.'",
    "He was sleeping badly. He stopped making jokes. That's how I knew.",
  ], { reveals: "Martin was anxious from October on and told Hannah something at work didn't add up." }),
  q("hannah", "Her father", "hannah_numbers", "Did he say anything strange to you before he died?", [
    "On Sunday, the fourth, at dinner. Out of nowhere he said, 'If anything happens to me, look at the numbers.'",
    "I thought he meant the will. I made a joke about it. I keep thinking about that.",
  ], { reveals: "On Sunday, November 4, Martin told Hannah, 'If anything happens to me, look at the numbers.'", effects: [tl("Sun 11/4", "Martin tells Hannah, 'If anything happens to me, look at the numbers.'", "Hannah Keller")] }),
  q("hannah", "Her father", "hannah_book", "Did your father keep any books at the office?", [
    "Grandpa's Montgomery's Auditing. A 1950s edition, green, falling apart. It sat on his office shelf for as long as I can remember.",
    "He called it 'the only book nobody would ever borrow.'",
  ], {
    reveals: "Martin kept his grandfather's 1950s edition of Montgomery's Auditing on his office shelf, 'the only book nobody would ever borrow.'",
    effects: [{ setFlag: "book_known" }],
    volunteer: { near: "book books shelf textbook auditing hide hidden borrow borrowed keep kept things safe place" },
  }),
  q("hannah", "The house", "hannah_house", "Can I get into your father's house?", [
    "Here, take my key. 23 Orchard Street. His home office is the spare room at the top of the stairs.",
    "I haven't been able to go in since. Tell me if there's anything I should see.",
  ], { reveals: "Hannah gave you the key to 23 Orchard Street." }),
  q("hannah", "Her father", "hannah_last", "When did you last speak to him?", [
    "Wednesday night, on the phone. He sounded tired. He said Friday was going to be 'a big day' and he'd tell me about it on the weekend.",
  ]),
  q("hannah", "People", "hannah_holt", "Do you know Adrian Holt?", [
    "Only the name. The fund's consultant from Pittsburgh. Dad mentioned him the way you mention the weather.",
  ]),
  q("hannah", "People", "hannah_lockhart", "Do you know who Lockhart is?", [
    "The big donor. A foundation in New York. Dad met her a few times when she visited.",
    "Susan was always nervous before those visits. Dad thought that was funny.",
  ]),
  q("hannah", "People", "hannah_whitfield", "What did your father think of Susan Whitfield?", [
    "He liked her. He said she worried more about the donors than the books, but somebody had to.",
  ]),
  q("hannah", "The police", "hannah_police", "What have the police told you?", [
    "Detective Bowman says burglary. He's been decent to me. But he asks questions like he doesn't believe it either.",
  ]),
  q("hannah", "People", "hannah_reddick", "Do you know Paul Reddick?", [
    "No. Who is he? I don't think Dad ever mentioned him.",
  ], { requires: reddickKnown }),
  q("hannah", "Her father", "hannah_letter", "Your father left you a letter.", [
    "'You know where I keep the things I don't want borrowed.' That's Grandpa's Montgomery's. On his office shelf.",
    "He was telling me where to look. He was telling me, and I thought he meant the will.",
  ], { requiresEvidence: ["E014"], reveals: "Hannah reads her father's letter: the things he didn't want borrowed are in his grandfather's Montgomery's Auditing.", effects: [{ setFlag: "book_known" }] }),
  q("hannah", "Her father", "hannah_ledger", "Your father kept a ledger inside the textbook.", [
    "'If you're reading this and I'm not, give it to Hannah.' He knew. He knew something could happen, and he went in anyway.",
    "Use it. Whatever's in there, use it.",
  ], { requiresEvidence: ["E011"] }),

  // =====================================================================
  // Susan Whitfield: executive director
  // =====================================================================
  q("whitfield", "About her", "whitfield_who", "What do you do here?", [
    "I'm the executive director. Twelve years. We make grants to small businesses and nonprofits all over Carroway County.",
  ]),
  q("whitfield", "Martin", "whitfield_martin", "Tell me about Martin Keller.", [
    "Martin was meticulous. Perhaps over-cautious. He double-checked everything twice, and then once more for luck.",
    "We're all devastated. I keep expecting him to knock on my door with a question about a decimal point.",
  ]),
  q("whitfield", "The fund", "whitfield_fund", "Tell me about the Small Business Recovery Fund.", [
    "It's our main program. Founded in 2014, after the plant layoffs. The Lockhart Foundation in New York is our founding donor.",
    "Holt Advisory in Pittsburgh administers it under contract. Grants to local businesses, and program services to help them succeed.",
  ]),
  q("whitfield", "The fund", "whitfield_holt", "What do you know about Holt Advisory?", [
    "A respected firm. Adrian Holt has run the fund cleanly for four years. He reviews the program payments; that's what we pay him for.",
  ]),
  q("whitfield", "Martin", "whitfield_concerns", "Did Martin ever raise concerns about the fund?", [
    "Not formally. Controllers ask questions; that's their job. Martin asked a great many.",
    "If he'd had a real concern, he'd have put it in writing. He put everything in writing.",
  ], { requires: { not: whitfieldShown }, reveals: "Susan Whitfield says Martin never raised a formal concern about the fund." }),
  q("whitfield", "Martin", "whitfield_warning", "Martin wrote that you asked him to wait.", [
    "Yes. He emailed me on October 22. He said he couldn't match most of the program services payments to work done.",
    "I asked him to wait until after the Lockhart donor dinner on December 6, so we didn't alarm our founding donor over paperwork. I told him to put it in the January review.",
    "I have the emails. You should have them. I should have listened.",
  ], {
    requires: whitfieldShown,
    reveals: "On October 22 Martin emailed Susan Whitfield his concerns about the fund's payments. She asked him to wait until after the Lockhart donor dinner on December 6.",
    effects: [{ giveEvidence: "E027" }, tl("Mon 10/22", "Martin emails Susan Whitfield his concerns about the program services payments; she asks him to wait until after the Lockhart dinner.", "Susan Whitfield")],
    volunteer: { near: "memo wait waited warned warning email emails october concern concerns told you asked him register payments" },
  }),
  q("whitfield", "Martin", "whitfield_emails", "Do you have Martin's emails to you?", [
    "His email of October 22 and my reply. I printed them this morning. I wrote on the top, so you'd know I'm not hiding it anymore.",
  ], { requires: whitfieldShown, effects: [{ giveEvidence: "E027" }] }),
  q("whitfield", "Martin", "whitfield_told_holt", "Did anyone else know Martin wanted an outside review?", [
    "Adrian called on Tuesday morning, the sixth, about the board packet. I mentioned Martin wanted an outside review in January and had spoken to an accountant.",
    "I thought it would make him tidy up his paperwork. That's all I thought.",
  ], {
    requiresEvidence: ["E027"],
    reveals: "On the morning of Tuesday, November 6, Susan Whitfield told Adrian Holt that Martin wanted an outside review and had spoken to an accountant.",
    effects: [tl("Morning (Tue 11/6)", "Susan Whitfield tells Adrian Holt that Martin wants an outside review and has spoken to an accountant.", "Susan Whitfield")],
  }),
  q("whitfield", "The building", "whitfield_reddick", "How did Paul Reddick get the building's maintenance contract?", [
    "In April, on Adrian Holt's recommendation. The building's management asked us for a name, and Adrian had one. They took his word.",
  ], { requires: reddickKnown, reveals: "Reddick Maintenance got the building contract in April on Adrian Holt's recommendation." }),
  q("whitfield", "Thursday", "whitfield_thursday", "When did you leave on Thursday, November 8?", [
    "Five thirty. Martin was in his office with the door shut. That was normal for him.",
    "Angela was still here, working on a grant deadline.",
  ], { effects: [tl("5:30 PM (Thu 11/8)", "Susan Whitfield leaves for the day; Martin is in his office.", "Susan Whitfield")] }),
  q("whitfield", "The fund", "whitfield_lockhart", "Tell me about the Lockhart Foundation.", [
    "Dr. Lockhart is our founding donor. Without her there is no Recovery Fund. Her dinner here is on December 6.",
  ]),
  q("whitfield", "The fund", "whitfield_authorizations", "Who approved these program services payments?", [
    "The administrator, under the agreement. Under fifty thousand dollars, he doesn't need the board.",
    "I never looked at the forms one by one. That was the point of hiring an administrator.",
  ], { requiresEvidence: ["E018"] }),
  q("whitfield", "The fund", "whitfield_foster", "What happened with Warren Foster?", [
    "A routine clawback notice. He hadn't filed his quarterly reports. He came in and shouted. Martin handled it.",
  ]),

  // =====================================================================
  // Adrian Holt: fund administrator
  // =====================================================================
  q("holt", "Introductions", "holt_who", "Who are you, Mr. Holt?", [
    "Adrian Holt. Holt Advisory. We administer the Small Business Recovery Fund for the Carroway Community Foundation, and have since 2014.",
  ]),
  q("holt", "The fund", "holt_agreement", "What is your arrangement with the foundation?", [
    "A written one. Here is the administrative services agreement. Read section 4.2; I've flagged it for you.",
    "The administrator may engage subcontractors without prior board approval. That's in black and white.",
  ], { reveals: "Holt handed over the 2014 administrative services agreement, with section 4.2 flagged.", effects: [{ giveEvidence: "E020" }], volunteer: { after: 2 } }),
  q("holt", "The fund", "holt_subcontractors", "Why does the fund pay outside firms?", [
    "Because grantees need help a check can't buy. Storefronts, training, evaluation. We engage specialists. It's efficient and entirely legal.",
  ]),
  q("holt", "The fund", "holt_meridian", "What is Meridian Advisory Group?", [
    "A respected firm. I partner with them on evaluation work. I'm an affiliate partner; we share this suite.",
    "There's nothing unusual about advisers sharing space.",
  ], { reveals: "Holt says Meridian is a respected firm he partners with on evaluation work." }),
  q("holt", "The fund", "holt_tricounty", "What is Tri-County Facility Partners?", [
    "A facilities contractor. Storefront improvements for grantees. They're on the approved list.",
  ], { requires: triCountyKnown }),
  q("holt", "Martin", "holt_martin", "What do you make of Martin Keller's concerns?", [
    "Martin misunderstood a perfectly legal structure. He was a small-town controller looking at a professional arrangement and seeing shadows.",
    "A tragedy, what happened to him. But it has nothing to do with the fund.",
  ], {
    variants: [{ requires: holtAdmits, reply: ["Some payments were not documented to the standard I'd want. I'll grant that.", "That's paperwork. It isn't a crime, and it certainly isn't a reason anyone would hurt him."] }],
  }),
  q("holt", "The fund", "holt_authorizations", "Who authorized the program services payments?", [
    "I did, as administrator, within my discretion under the agreement. The board approved that structure in 2014.",
  ], {
    variants: [{
      requires: ev("E018"),
      reply: [
        "Yes, those are my forms. I engaged firms under the threshold, as the agreement allows.",
        "Some of the documentation was not what I'd want it to be. I'll concede that. I deny any wrongdoing.",
      ],
    }],
    reveals: "Holt says he authorized every program services payment himself, under the agreement.",
  }),
  q("holt", "The fund", "holt_split", "Why are there two Monongah forms for $49,500 on the same day?", [
    "Phase two and phase three. Separate engagements, separate scopes.",
    "That they were signed the same day is an administrative convenience.",
  ], { requiresEvidence: ["E018"] }),
  q("holt", "People", "holt_reddick", "Do you know Paul Reddick?", [
    "Barely. He does the boiler.",
  ], {
    requires: reddickKnown,
    reveals: "Holt says he barely knows Paul Reddick: 'He does the boiler.'",
    variants: [{ requires: ev("E025"), reply: ["I recommended him to the building. We speak about the building now and then. That's all."] }],
  }),
  q("holt", "People", "holt_calls", "Why did you call Paul Reddick on November 6, 7 and 8?", [
    "About the building. I recommended him for the contract, and he keeps me posted on the mechanical side.",
  ], { requiresEvidence: ["E025"], reveals: "Holt says his calls with Reddick were 'about the building.'" }),
  q("holt", "Money", "holt_payment", "Why did Tri-County pay Reddick Maintenance $9,500 on November 9?", [
    "For legitimate HVAC work at the Mercantile Building. Tri-County subcontracts mechanical work. Ask them for the paperwork.",
  ], { requires: { any: [ev("E019"), ev("E024")] }, reveals: "Holt says Tri-County's $9,500 to Reddick Maintenance was for 'legitimate HVAC work.'" }),
  q("holt", "People", "holt_dunmore", "Who is Carol Dunmore?", [
    "She manages my office. She does registered-agent filings for a number of small firms. It's a service. Many offices do it.",
  ], { requiresEvidence: ["E017"] }),
  q("holt", "Thursday", "holt_thursday", "Where were you on the evening of Thursday, November 8?", [
    "At home. I don't see what that has to do with anything.",
  ]),
  q("holt", "Martin", "holt_auditor", "Did you know Martin was meeting an outside auditor?", [
    "I had no idea. He never raised anything with me. If he had concerns, my door was open.",
  ], { reveals: "Holt says he had no idea Martin was meeting an outside auditor." }),
  q("holt", "The fund", "holt_lockhart", "What about the Lockhart Foundation?", [
    "The founding donor. You'd have to ask the foundation about donor relations. That's Susan's area.",
  ]),

  // =====================================================================
  // Paul Reddick: maintenance contractor
  // =====================================================================
  q("reddick", "Introductions", "reddick_who", "Who are you?", [
    "Paul Reddick. Reddick Maintenance. Boilers, HVAC, plumbing, whatever breaks. It's me and a van, mostly.",
  ]),
  q("reddick", "The building", "reddick_contract", "How did you get the Mercantile contract?", [
    "April. Building management hired me. I heard somebody from the foundation put in a good word.",
  ]),
  q("reddick", "People", "reddick_holt", "Do you know Adrian Holt?", [
    "Mr. Holt? The fund guy. Met him once or twice. He's the one who put in the word for me, I think.",
  ]),
  q("reddick", "Thursday", "reddick_thursday", "Where were you on Thursday, November 8?", [
    "Mercantile, doing the boiler. One to four thirty. Then I went home. Home by five.",
    "Alone. Watched the game. Steelers put fifty on Carolina. Good night.",
  ], {
    reveals: "Reddick says he serviced the boiler from 1:00 to 4:30 PM on Thursday, went home, was home by five, alone, and watched the game.",
    effects: [tl("4:30 PM (Thu 11/8)", "Paul Reddick says he finished the boiler and went home; home by five, alone.", "Paul Reddick")],
  }),
  q("reddick", "The building", "reddick_card", "Why do you have a 24-hour card to the building?", [
    "Because I'm maintenance. Everybody knows that. Boiler goes at two in the morning, who're they gonna call?",
  ]),
  q("reddick", "The building", "reddick_martin", "Did you know Martin Keller?", [
    "The numbers guy. Nodded to him in the hall. He worked late a lot.",
    "Shame what happened. Somebody broke in, I heard.",
  ]),
  q("reddick", "The van", "reddick_van", "What do you drive?", [
    "White Transit. Name on both sides. It's right out front, you walked past it.",
  ]),
  q("reddick", "Thursday", "reddick_swung_by", "Your card opened the rear door at 8:31 PM on Thursday.", [
    "Maybe I swung by. To check on something. The boiler had a gauge I wasn't happy with.",
    "I didn't go in. I didn't go upstairs. I don't go in the offices.",
  ], { requiresDeductions: ["D06"], requiresEvidence: ["E021"], reveals: "Reddick now says he 'might have swung by' Thursday night but did not go in." }),
  q("reddick", "Thursday", "reddick_morris", "Angela Morris saw your van in the rear lot at 7:48 PM.", [
    "Angela's mistaken. Or she's got the wrong night. I'm there all the time.",
  ], { requiresEvidence: ["E026"] }),
  q("reddick", "Thursday", "reddick_camera", "The bank camera has your van entering the rear lot at 8:24 PM.", [
    "Lot of white vans with ladder racks in this county. You read a plate off that?",
  ], { requiresEvidence: ["E023"] }),
  q("reddick", "Money", "reddick_payment", "What was the $9,500 from Tri-County for?", [
    "The HVAC job. Ask Tri-County.",
  ], { requiresEvidence: ["E024"], reveals: "Reddick says the $9,500 from Tri-County was 'the HVAC job.'" }),
  q("reddick", "People", "reddick_calls", "Why did Adrian Holt call you so often that week?", [
    "Building stuff. Boiler stuff. He recommended me, he likes to know things are running.",
  ], { requiresEvidence: ["E025"] }),
  q("reddick", "Thursday", "reddick_boots", "Tell me about your boots.", [
    "Detective Bowman asked for my work boots. I gave them to him. I've got nothing to hide.",
  ], {
    requires: { any: [{ flag: "footwear_requested" }, ev("E007")] },
    variants: [{ requires: ev("E007"), reply: ["Half the guys in this county wear those boots. Your own report says so. Read it."] }],
  }),
  q("reddick", "The office", "reddick_eagle", "There was a brass eagle on Martin Keller's desk.", [
    "I don't go in the offices. I'm in the basement. I never saw any eagle.",
  ], { requiresEvidence: ["E004"] }),

  // =====================================================================
  // Dr. Evelyn Lockhart: by telephone, after RE02
  // =====================================================================
  q("lockhart", "The foundation", "lockhart_fund", "Tell me about your foundation's support for the Carroway fund.", [
    "We've supported the Carroway fund since its beginning in 2014. Small towns that lose a plant deserve a second act, and the fund seemed a sensible way to help.",
  ]),
  q("lockhart", "Martin", "lockhart_martin", "Did you know Martin Keller?", [
    "I met him on several visits to Carroway. He was careful and kind.",
    "I was very sorry to read of his death.",
  ]),
  q("lockhart", "The envelope", "lockhart_envelope", "Tell me about the envelope you sent us.", [
    "It reached my office weeks ago, with no name on it and no letter. Just the copy. I didn't know what to make of it, and I confess I set it aside.",
    "Then I read about Martin, and I thought you should have it.",
  ], { reveals: "Dr. Lockhart says the copied invoice reached her office weeks ago, with no name and no letter, and she set it aside until she read of Martin's death." }),
  q("lockhart", "The envelope", "lockhart_sender", "Who sent you the envelope?", [
    "I don't know. I wish I did.",
  ]),
  q("lockhart", "The envelope", "lockhart_tricounty", "What do you know about Tri-County Facility Partners?", [
    "Nothing beyond that invoice. But it seemed to me the contractor named on it deserves a closer look.",
  ]),
  q("lockhart", "The fund", "lockhart_holt", "What do you know about Adrian Holt?", [
    "Mr. Holt was the administrator the foundation in Carroway chose. We relied on their oversight, as donors do.",
  ]),
  q("lockhart", "The fund", "lockhart_meridian", "Have you heard of Meridian Advisory Group?", [
    "I've heard of Meridian as a consulting firm. I couldn't tell you more than that.",
  ]),
  q("lockhart", "The envelope", "lockhart_waybill", "What about the courier waybill and the marks on the copy?", [
    "I really couldn't say.",
  ]),
  q("lockhart", "The fund", "lockhart_control", "Adrian Holt controlled the payments to Tri-County.", [
    "That is very troubling. I'm grateful someone is looking at it carefully.",
    "If there's anything my office can provide, you need only ask.",
  ], { requiresDeductions: ["D09"] }),

  // =====================================================================
  // Walter Ames: the auditor
  // =====================================================================
  q("ames", "About him", "ames_who", "What do you do, Mr. Ames?", [
    "I'm a partner here at Ames and Kiley. Audits, mostly for nonprofits, and the occasional forensic engagement when something looks wrong.",
  ]),
  q("ames", "Martin", "ames_call", "How did you know Martin Keller?", [
    "He called me at the end of October. We'd met at a nonprofit finance seminar years ago. He was careful not to say much on the phone.",
  ]),
  q("ames", "Martin", "ames_email", "Did Martin write to you?", [
    "On Tuesday, November 6, at 10:14 at night. He asked to meet outside his office, in confidence. Here's a copy.",
    "Read the last line. I've read it a dozen times.",
  ], {
    reveals: "Walter Ames handed over Martin's email of Tuesday, November 6, asking for a confidential meeting.",
    effects: [{ giveEvidence: "E010" }, tl("10:14 PM (Tue 11/6)", "Martin emails Walter Ames asking for an urgent, confidential meeting.", "Martin's email")],
    volunteer: { after: 1 },
  }),
  q("ames", "Martin", "ames_friday", "What happened on Friday morning?", [
    "I waited for him at nine. By nine thirty I called his cell. Then again at ten. No answer.",
    "I read about it that evening.",
  ], { reveals: "Ames waited for Martin at 9:00 AM on Friday, November 9, and called his cell twice with no answer.", effects: [tl("9:00 AM (Fri 11/9)", "Walter Ames waits for Martin, who never arrives. Ames calls his cell twice.", "Walter Ames")] }),
  q("ames", "The money", "ames_passthrough", "What is a pass-through payment?", [
    "Money goes to a company that keeps a little and sends the rest on somewhere else. The middle company is a door.",
    "Doors aren't illegal. But you ask why the money needs one.",
  ]),
  q("ames", "The money", "ames_split", "What does it mean to split an engagement?", [
    "Take one job and cut it into pieces, each just under the approval limit. Nobody above has to sign, because no single piece is big enough to need it.",
  ]),
  q("ames", "The money", "ames_meridian", "Why would three firms all pay the same fourth firm?", [
    "That's the question Martin was asking. If three firms each send most of what they get to one consulting firm, you want to know why it needs three doors.",
    "It could be honest subcontracting. You'd expect to find the work.",
  ]),
  q("ames", "The money", "ames_bank", "How would you prove where the money went?", [
    "Bank records. The fund's records show what went out. The three firms' bank records show where it went next. Those take a subpoena, so it's a police matter.",
  ]),
  q("ames", "People", "ames_holt", "Do you know Adrian Holt?", [
    "Never met him. I know the name as the fund's administrator, from Martin's email.",
  ]),
  q("ames", "The money", "ames_ledger", "What do you make of Martin's ledger?", [
    "It's a controller's working paper, and a good one. Payee, approval, whether he could see the work, where the money went next.",
    "Every engagement under fifty thousand. Every approval the same initials. He asked me exactly the right question on the last page.",
  ], { requiresEvidence: ["E011"] }),
  q("ames", "The money", "ames_memo", "What do you make of Martin's draft memo?", [
    "That's what he was bringing me. $412,600 paid to three firms; documented work for about $52,000.",
    "His recommendation is the right one: freeze, review, tell the donor.",
  ], { requiresEvidence: ["E013"] }),
  q("ames", "The money", "ames_records", "What do Martin's copied payment records show?", [
    "He called the grantees himself to ask whether the storefront work was done. That's what an auditor would do first. None of them had it.",
  ], { requiresEvidence: ["E012"] }),
  q("ames", "The money", "ames_schedule", "Are you working on the subpoenaed bank records?", [
    "Detective Bowman sent them over. I'm building a schedule of the onward payments, firm by firm. It'll be on your desk.",
  ], { requires: { flag: "bank_records" } }),

  // =====================================================================
  // Stanley Avery: building security
  // =====================================================================
  q("avery", "About him", "avery_who", "Who are you?", [
    "Stanley Avery. Security for the building's owner. Twenty years a cop in this town before that. Now I keep the doors.",
  ]),
  q("avery", "The doors", "avery_system", "How does the building's access system work?", [
    "Front doors on Market lock at six. After that it's cards. The rear service door on Mulberry logs every card that opens it, and every time it opens at all.",
  ]),
  q("avery", "The doors", "avery_doors", "Who came in or out of the building on Thursday night?", [
    "I printed it for the police this morning and ran a second copy. Front and back, Thursday six AM to Friday seven. Take it.",
    "Front's quiet after six. The back, read it yourself.",
  ], {
    reveals: "Stanley Avery handed over the building's door log for Thursday, November 8.",
    unlocks: ["avery_rex"],
    effects: [
      { giveEvidence: "E006" },
      tl("7:42 AM (Thu 11/8)", "Martin badges in at the front door.", "Door log"),
      tl("8:31 PM (Thu 11/8)", "Card 0447 opens the rear service door.", "Door log"),
      tl("8:57 PM (Thu 11/8)", "The rear service door is opened from inside.", "Door log"),
    ],
    volunteer: { near: "door doors night thursday access log logs entry entries came in left who in out after hours badge" },
  }),
  q("avery", "The doors", "avery_rex", "What does REX mean on the log?", [
    "Request to exit. The push bar. The log knows the door opened from the inside. It doesn't know who walked out.",
  ]),
  q("avery", "The doors", "avery_card", "Whose card is 0447?", [
    "Reddick Maintenance. Paul Reddick. Twenty-four-hour access, front and rear, since April 2, when he got the maintenance contract. Here's the record.",
  ], {
    reveals: "Card 0447 belongs to Reddick Maintenance Services (Paul Reddick), with 24-hour access since April 2, 2018.",
    effects: [{ giveEvidence: "E022" }],
    volunteer: { near: "card 0447 whose maintenance reddick credential contractor access 24 hour" },
  }),
  q("avery", "The doors", "avery_maintenance", "Isn't it unusual for maintenance to come in at night?", [
    "Not even a little. Maintenance comes and goes at all hours. Boilers don't keep office hours.",
    "If you're looking for something strange, you're looking at the wrong card.",
  ]),
  q("avery", "The doors", "avery_front", "Did anyone use the front door that night?", [
    "Martin Keller badged in at 7:42 that morning. After the doors locked at six, nobody came in the front till the cleaner Friday.",
  ]),
  q("avery", "Friday", "avery_cleaner", "Who found Martin?", [
    "Rosa Delgado, the cleaner. She badged in at 6:38 Friday morning and found him a couple minutes later. Called 911. Good woman. She hasn't been back.",
  ]),
  q("avery", "The lot", "avery_camera", "Are there cameras on the lot?", [
    "Not ours. The owner won't pay for them. The bank across the alley has one on its drive-through lane. That's a police request, not mine.",
  ]),
  q("avery", "The building", "avery_reddick", "How did Reddick get the maintenance contract?", [
    "April. The foundation recommended him to building management. Holt, I think. The money man from Pittsburgh.",
  ], { requires: reddickKnown }),
  q("avery", "The building", "avery_martin", "Did you know Martin Keller?", [
    "Nice man. Worked late plenty. Always said good night when he went out the back. Always.",
  ]),
  q("avery", "The doors", "avery_lost", "Was card 0447 ever reported lost or stolen?", [
    "Never. I'd have killed it the same hour. Nobody reported a thing.",
  ], { requires: reddickKnown }),
  q("avery", "The lot", "avery_van", "Do you recognize the van in these bank camera stills?", [
    "That's Reddick's. Ladder rack, the lettering. I've seen it in that lot a hundred times.",
    "Not usually after dark, I'll give you that.",
  ], { requiresEvidence: ["E023"] }),

  // =====================================================================
  // Angela Morris: administrative assistant
  // =====================================================================
  q("morris", "About her", "morris_who", "What do you do here?", [
    "I'm Angela. Administrative assistant. Reception, grant files, the phones, the coffee. Everything that isn't somebody else's.",
  ]),
  q("morris", "Martin", "morris_martin", "How did Martin seem in the last few weeks?", [
    "Jumpy. For weeks. He kept his door shut, which he never used to, and he'd print things at the end of the day when nobody was around.",
  ], { reveals: "Angela says Martin had been jumpy for weeks, kept his door shut and printed things at the end of the day." }),
  q("morris", "Thursday", "morris_thursday", "When did you leave on Thursday night?", [
    "Late. I had a grant deadline. Mr. Keller was still in his office with the door closed when I left. I went out the back, about ten to eight.",
    "I said good night through the door. He said, 'Drive safe, Angela.' That's the last thing.",
  ], { reveals: "Angela left by the back at about 7:48 PM on Thursday; Martin was still in his office." }),
  q("morris", "Thursday", "morris_van", "Did you see anyone when you left?", [
    "Paul Reddick's van was by the dumpsters. The white one with his name on it. He was in the driver's seat on his phone. I waved. I don't think he saw me.",
    "I thought he was finishing a job. Then I heard he told people he left at four thirty. I've written it all down for Detective Bowman. I kept a copy for you.",
  ], {
    requires: morrisReady,
    reveals: "Angela saw Paul Reddick's van by the dumpsters at about 7:48 PM on Thursday, with Reddick in the driver's seat on his phone.",
    effects: [{ giveEvidence: "E026" }, tl("7:48 PM (Thu 11/8)", "Angela Morris leaves by the rear lot; Reddick's van is by the dumpsters, Reddick in the driver's seat on his phone.", "Angela Morris")],
    volunteer: { near: "anyone see saw van lot parking outside back reddick dumpster dumpsters car truck leave leaving" },
  }),
  q("morris", "Martin", "morris_foster", "Did Martin have trouble with anyone?", [
    "Warren Foster, from the hardware store. Monday the fifth, about two. He came in shouting about his clawback letter and said he'd go to the paper.",
    "Mr. Keller calmed him down. Gave him coffee. Foster left promising his reports by the fifteenth.",
  ], { reveals: "Warren Foster shouted at Martin over his clawback letter on Monday, November 5, at about 2 PM.", effects: [tl("About 2 PM (Mon 11/5)", "Warren Foster argues loudly with Martin at the foundation over a $12,000 clawback letter.", "Angela Morris")] }),
  q("morris", "About her", "morris_job", "Are you all right?", [
    "I'm scared for my job, honestly. Susan doesn't like people talking about the foundation.",
    "Please don't tell her I said anything.",
  ]),
  q("morris", "The office", "morris_printer", "Where did Martin do his printing?", [
    "The front printer jams. Mr. Keller used the back one, by his office. He'd stand over it like it might run away.",
  ]),
  q("morris", "The office", "morris_files", "Where are the fund's records kept?", [
    "The grant register's in my files, behind my desk. The reimbursement binder's on the shelf. Susan keeps the fund binder in her office.",
    "Go ahead. Nobody's told me not to.",
  ]),
  q("morris", "People", "morris_holt", "What's Adrian Holt like?", [
    "Very polished. He comes in once a month or so. Always in a hurry. He calls me 'dear,' which, okay.",
  ]),
  q("morris", "People", "morris_reddick", "What do you know about Paul Reddick?", [
    "He does the boiler and fixes things. Friendly enough. He fixed my desk drawer once without being asked.",
  ], { requires: reddickKnown }),
  q("morris", "People", "morris_susan", "Did Martin and Susan get along?", [
    "Mostly. They had a closed-door talk in October. She came out looking annoyed, and he came out looking worse.",
  ]),
  q("morris", "People", "morris_lockhart", "Who is Dr. Lockhart?", [
    "The big donor, in New York. Susan's been planning her dinner for December for months. Place cards and everything.",
  ]),

  // =====================================================================
  // Det. Curtis Bowman: the police; no limit
  // =====================================================================
  q("bowman", "The case", "bowman_case", "Where does the investigation stand?", [
    "Working theory is a burglary that turned violent. Somebody got in, Keller walked in on him, it went bad.",
    "I'll tell you what bothers me. I'll show you, actually. Ask for the report.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D01" }, reply: ["One folder from one drawer. That's not a burglar. I've stopped writing 'burglary' on anything I sign."] },
      { requires: { deduction: "D06" }, reply: ["Reddick's card, at 8:31, and the back door opening from inside at 8:57. I'm pulling the bank camera."] },
      { requires: { flag: "bank_records" }, reply: ["Subpoenas are served. Ames has the bank records. Now it's about the money as much as the man."] },
    ],
  }),
  q("bowman", "Reports", "bowman_report", "Can I see the police report?", [
    "Here. Rosa Delgado, the cleaner, found him at 6:40 Friday morning. 911 at 6:43.",
    "Read my note at the bottom. It's the part that keeps me up.",
  ], {
    reveals: "Det. Bowman handed over the incident report: Martin was found at 6:40 AM on Friday, November 9; 911 was called at 6:43.",
    effects: [{ giveEvidence: "E001" }, tl("6:40 AM (Fri 11/9)", "The cleaner, Rosa Delgado, finds Martin. 911 at 6:43 AM.", "Police report")],
    volunteer: { after: 1 },
  }),
  q("bowman", "Reports", "bowman_photos", "Can I see the scene photographs?", [
    "Four that matter. Look at the cabinet in five, and the floor in front of it in nine.",
  ], { reveals: "Det. Bowman handed over the crime scene photographs.", effects: [{ giveEvidence: "E002" }] }),
  q("bowman", "Reports", "bowman_autopsy", "What did the medical examiner find?", [
    "One blow, left side of the head, something heavy with a hard edge. No defensive injuries. Death between about eight and ten Thursday night.",
    "No weapon at the scene. Here's Dr. Okafor's summary.",
  ], {
    reveals: "The medical examiner found a single blow to the head from a heavy object with a hard, angular edge; death between about 8:00 and 10:00 PM Thursday.",
    effects: [{ giveEvidence: "E003" }, tl("8:00 to 10:00 PM (Thu 11/8)", "Medical examiner's window for Martin's death.", "ME summary")],
  }),
  q("bowman", "Reports", "bowman_canvass", "Did the canvass turn up any witnesses?", [
    "One. Lorraine Bix, seventy-one, walks her dog down Mulberry Alley every night at half past eight. White work van with a ladder rack behind the building, lights off.",
    "Didn't get a plate. Here's her statement.",
  ], {
    reveals: "Lorraine Bix saw a white work van with a ladder rack behind the Mercantile Building on Thursday night, lights off.",
    effects: [{ giveEvidence: "E008" }, tl("~8:25 to 8:50 PM (Thu 11/8)", "Lorraine Bix sees a white work van with a ladder rack behind the building, lights off.", "Canvass statement")],
  }),
  q("bowman", "The case", "bowman_taken", "What was taken from the office?", [
    "Nothing of value. Wallet with sixty-two dollars, his phone, his laptop, the petty cash box out front. All left.",
    "Whoever it was took paper. I'd like to know what paper.",
  ], { reveals: "Nothing of value was taken from Martin's office; whoever it was took papers." }),
  q("bowman", "The case", "bowman_entry", "How did the intruder get into the building?", [
    "No forced entry. Front doors locked as normal. I've asked for the access records. Stanley Avery keeps the card system; his desk is inside the back door.",
  ]),
  q("bowman", "The scene", "bowman_eagle", "There's an award eagle missing from Martin's desk.", [
    "The Chamber award. I saw the photo on the wall and didn't put it together. That's on me.",
    "The ME says heavy, with a hard edge. A brass eagle on a wood base would fit that description. I can't tell you it's the thing until somebody finds it.",
  ], { requiresEvidence: ["E004"] }),
  q("bowman", "Lab", "bowman_footwear", "Can you compare the boot print in the toner with Paul Reddick's boots?", [
    "With photo nine and his card record, I've got a reason to ask. I'll ask him for his work boots, voluntarily. No warrant, no fuss. If he says no, that tells me something too.",
    "County lab will run the comparison. I'll send you the report when it's back.",
  ], {
    requiresEvidence: ["E002", "E022"],
    reveals: "Det. Bowman will ask Paul Reddick for his boots and send them to the county lab for a footwear comparison.",
    effects: [{ startLab: "footwear" }, { setFlag: "footwear_requested" }],
  }),
  q("bowman", "Lab", "bowman_lab", "Anything back from the lab?", ["Nothing pending. Give me something to send."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "footwear" }, reply: ["Reddick handed over his boots without a word. County lab has them. You'll get the report when it's back."] },
      { requires: { labReady: "footwear" }, reply: ["The footwear report's in. Read the conclusion carefully. It doesn't say what people will want it to say."] },
    ],
  }),
  q("bowman", "The lot", "bowman_camera", "Can you get the bank's camera footage for Thursday night?", [
    "Already did. Once you put his card at the back door at 8:31, I walked over to First Allegheny. Drive-through camera faces the lot.",
    "Plate's not readable. The make, the color, the rack and the lettering are. Registration's attached.",
  ], {
    requiresDeductions: ["D06"],
    reveals: "Det. Bowman obtained the bank camera stills: a white van with a ladder rack entered the rear lot at 8:24 PM and left at 8:59 PM. The van's registration is Reddick Maintenance's.",
    effects: [
      { giveEvidence: "E023" },
      tl("8:24 PM (Thu 11/8)", "Bank camera: a white van with a ladder rack pulls into the rear lot, lights off, and parks by the dumpsters.", "Bank camera"),
      tl("8:59 PM (Thu 11/8)", "Bank camera: the van leaves the rear lot.", "Bank camera"),
    ],
    volunteer: { after: 1, reply: ["Before you ask anything: Reddick's card at the back door got me off my chair. I pulled the bank's drive-through camera for Thursday night. Here, with the van's registration.", "Plate's not readable. The make, the color, the rack and the lettering are."] },
  }),
  q("bowman", "People", "bowman_foster", "Where was Warren Foster on Thursday night?", [
    "Carroway Middle School's fall concert, seven to nine fifteen. His daughter's in the band. I checked: two teachers and the principal put him in the third row the whole time.",
  ], { requiresEvidence: ["E028"], reveals: "Det. Bowman confirmed Warren Foster was at the middle school concert from 7:00 to 9:15 PM Thursday." }),
  q("bowman", "Money", "bowman_subpoena", "Can you get the three firms' bank records?", [
    "Not on a theory. A judge wants to see money moving between people who've got no business paying each other. Bring me that and I'll write the affidavit that afternoon.",
  ], {
    variants: [{ requires: { flag: "bank_records" }, reply: ["Done. Served on all three banks. Walter Ames is building the schedule."] }],
  }),
  q("bowman", "Money", "bowman_bank", "What did the subpoenas turn up?", [
    "The banks produced. I sent everything to Walter Ames, because I'm a detective, not an accountant. His schedule will come to your desk.",
  ], { requires: { flag: "bank_records" }, volunteer: { after: 1 } }),

  // =====================================================================
  // Warren Foster: by telephone, once the clawback letter is found
  // =====================================================================
  q("foster", "About him", "foster_who", "Who am I speaking to?", [
    "Warren Foster. Foster's Hardware and Supply. My dad opened it, I run it. What's this about?",
  ]),
  q("foster", "The grant", "foster_grant", "Tell me about your grant and the clawback.", [
    "The foundation gave me twelve thousand in 2017. I didn't file the quarterly reports. I run a store by myself, I don't have time for forms.",
    "So they sent a letter saying they could take it back.",
  ]),
  q("foster", "The grant", "foster_argument", "What happened on Monday, November 5?", [
    "I went in there and I yelled at Martin. Loud. Said I'd go to the paper.",
    "I was out of line. He was just doing his job. He sat me down and got me a coffee, and I yelled at him some more anyway.",
  ], { reveals: "Foster admits he shouted at Martin on November 5 and says Martin 'was just doing his job.'" }),
  q("foster", "The grant", "foster_paper", "Did you go to the newspaper?", [
    "No. I said it because I was angry. I never called anybody.",
  ]),
  q("foster", "The grant", "foster_reports", "Did you settle things with the foundation?", [
    "I promised the reports by the fifteenth. I'm doing them at night. Martin gave me the extra time.",
  ]),
  q("foster", "Thursday", "foster_thursday", "Where were you on Thursday night, November 8?", [
    "Carroway Middle School, the fall concert. Seven to nine fifteen. My daughter plays clarinet.",
    "Ask two hundred parents. Ask the band teacher. I was the one filming on the iPad.",
  ], { reveals: "Foster says he was at Carroway Middle School's fall concert from 7:00 to 9:15 PM on Thursday.", effects: [tl("7:00 to 9:15 PM (Thu 11/8)", "Warren Foster at Carroway Middle School's fall concert.", "Warren Foster")] }),
  q("foster", "About him", "foster_martin", "How do you feel about Martin now?", [
    "Sick. The last thing I ever did to that man was shout at him over a form. He gave me more time anyway.",
  ]),
  q("foster", "About him", "foster_police", "Have the police talked to you?", [
    "Detective Bowman called. I told him the same thing I'm telling you. He said he'd check. Let him.",
  ]),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of the file?", [
    "Forty years of this. A burglar who leaves a wallet and a laptop and takes one folder isn't a burglar. He's a courier.",
    "Find out what was in the folder and you'll find out who sent for it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D02" }, reply: ["Now you know what Keller was working on. Follow the money from the people who needed him quiet."] },
      { requires: { deduction: "D10" }, reply: ["Money and phone calls, both ways, the night of and the morning after. Write it up so it holds for both of them."] },
    ],
  }),
  q("bennett", "Records", "bennett_tricounty", "Can you pull the records on Tri-County Facility Partners?", [
    "Already have. Pennsylvania state filing. Registered office: 600 Grant Street, Suite 2210. Organizer: Carol Dunmore, same address.",
    "Ms. Dunmore is Holt Advisory's office manager. A building contractor run from a financial adviser's front desk. I'm sending it over.",
  ], {
    requires: triCountyKnown,
    reveals: "Tri-County Facility Partners is registered at Suite 2210, 600 Grant Street, and was organized by Carol Dunmore, Holt Advisory's office manager.",
    effects: [{ giveEvidence: "E017" }],
    volunteer: { near: "tri-county tricounty tri county filing company records corporation registered contractor" },
  }),
  q("bennett", "Records", "bennett_holt", "Run Adrian Holt for me.", [
    "No record. Holt Advisory is a small shop on Grant Street. He's listed as an affiliate partner of Meridian Advisory Group. Same suite.",
  ]),
  q("bennett", "Records", "bennett_reddick", "Run Paul Reddick for me.", [
    "No record. Business license current. Maintenance contract at the Mercantile since April. Couple of liens on the van, paid off.",
  ], { requires: reddickKnown }),
  q("bennett", "Records", "bennett_meridian", "What can you find on Meridian Advisory Group?", [
    "A private consulting firm, Pittsburgh office in Suite 2210. Private companies don't file much worth reading. Anything more takes a subpoena.",
  ]),
  q("bennett", "Records", "bennett_lockhart", "What do the records say about the Lockhart Foundation?", [
    "Private foundation, Fifth Avenue. Its public filings show grants to the Carroway fund every year since 2014. That's what's on paper.",
  ], { requires: lockhartLead }),
  q("bennett", "Records", "bennett_courier", "Can you trace the courier waybill?", [
    "Capital Courier, account 20417. It's a business account with no public listing. That's all I can get without a court.",
  ], { requiresEvidence: ["E030"] }),
  q("bennett", "Records", "bennett_foster", "Run Warren Foster for me.", [
    "No record. Third-generation hardware store, behind on a couple of supplier invoices. Bowman can tell you where he was Thursday.",
  ], { requiresEvidence: ["E028"] }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [{ requires: { flag: "bank_records" }, reply: ["Bowman's got the bank records and Ames is doing the arithmetic. Watch your desk."] }],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Hannah
  r("hannah", "E011", ["That's his handwriting. Pencil first, then ink when he was sure. He always did that.", "'Give it to Hannah.' Okay, Dad."], { effects: [{ setFlag: "book_known" }] }),
  r("hannah", "E014", ["'Hannie.' Nobody else calls me that.", "The things he didn't want borrowed. That's Grandpa's Montgomery's, on his office shelf."], { effects: [{ setFlag: "book_known" }], reveals: "Hannah recognizes the hiding place in her father's letter: his grandfather's Montgomery's Auditing, on his office shelf." }),
  r("hannah", "E013", ["'I can't.' That's him. He'd have gone in Friday with this under his arm."]),
  r("hannah", "E009", ["'Bring EVERYTHING.' Underlined twice. And 'Book stays here.'"]),
  r("hannah", "E004", ["The eagle. He was so proud of that. He said he had to earn it every day.", "Where is it?"]),
  r("hannah", "E027", ["She asked him to wait. For a dinner."]),
  // Whitfield
  r("whitfield", "E013", ["'S.W. asked me to wait.' Yes. I did.", "I'll tell you about October 22. I owe him that."]),
  r("whitfield", "E015", ["The program services lines. Martin flagged those to me.", "All right. I'll tell you about October."]),
  r("whitfield", "E027", ["I wrote 'paperwork.' I'll live with that word for the rest of my life."]),
  r("whitfield", "E018", ["Every one under fifty thousand. I signed an agreement that let him do that. I never once looked."]),
  r("whitfield", "E020", ["Section 4.2. Our lawyer at the time said it was standard."]),
  r("whitfield", "E011", ["He kept this himself, by hand, because he didn't trust the system. Or me."]),
  // Holt
  r("holt", "E018", [
    "My authorizations. Each within the administrator's discretion.",
    "I engaged firms under the threshold, as the agreement allows. Some of the documentation was not what I'd want. That's a filing problem, not a crime.",
  ], { reveals: "Shown his authorizations, Holt concedes engagements were kept under the threshold and documentation was 'not what I'd want,' and denies wrongdoing." }),
  r("holt", "E020", ["Section 4.2. Read it twice if you need to."]),
  r("holt", "E016", ["Meridian billed Monongah for evaluation services. Subcontracting is how this industry works."]),
  r("holt", "E017", ["Carol does registered-agent work for several firms. It's a service."]),
  r("holt", "E011", ["A private notebook. Not a record of anything except Martin's suspicions."]),
  r("holt", "E013", ["A draft. Never sent. Never shown to me. That tells you how confident he was."]),
  r("holt", "E030", ["A Tri-County invoice. Approved, within discretion. I don't know how someone came to have a copy."]),
  r("holt", "E025", ["About the building. I recommended the man. I check on my recommendations."], { reveals: "Shown Reddick's phone bill, Holt says the calls were about the building." }),
  r("holt", "E024", ["Tri-County subcontracts mechanical work. Legitimate HVAC work."]),
  r("holt", "E019", ["A payment for legitimate HVAC work. Which you took off my desk."], { requires: { not: { presented: "holt:E025" } } }),
  r("holt", "E019", ["I think I'd like my attorney present for anything further."], { requires: { presented: "holt:E025" } }),
  r("holt", "E025", ["I think I'd like my attorney present for anything further."], { requires: { presented: "holt:E019" } }),
  // Reddick
  r("reddick", "E021", ["My job sheet. One to four thirty. Home. It says right there."]),
  r("reddick", "E006", ["Lot of people could have that card number. Or somebody's using mine.", "I didn't go in."]),
  r("reddick", "E022", ["Twenty-four hours. Because I'm maintenance. I told you."]),
  r("reddick", "E026", ["Angela's mistaken. Or it's the wrong night."]),
  r("reddick", "E023", ["Can't read a plate on that. White vans everywhere."]),
  r("reddick", "E008", ["Old lady in the dark sees a van. Okay."]),
  r("reddick", "E007", ["'Cannot identify the wearer.' Read it. Your own lab says so."]),
  r("reddick", "E024", ["The HVAC job. Ask Tri-County."]),
  r("reddick", "E025", ["Mr. Holt calls about the building. So what?"]),
  r("reddick", "E019", ["That's Tri-County's business. I got paid for a job."]),
  r("reddick", "E004", ["Never saw it. I don't go in the offices."]),
  r("reddick", "E002", ["I don't need to look at that."]),
  // Lockhart
  r("lockhart", "E030", ["Yes, that's what reached my office. I'm glad it's with someone who'll know what to do with it."]),
  r("lockhart", "E017", ["The same suite as Mr. Holt's office. I see. That does seem worth understanding."]),
  r("lockhart", "E013", ["'Notify the founding donor.' He meant to. I'm so sorry he didn't have the chance."]),
  r("lockhart", "E018", ["I'm afraid I'm not the person to interpret these. Mr. Ames would be."]),
  // Ames
  r("ames", "E011", ["This is careful work. Every column an auditor would want.", "His last question is the right question."]),
  r("ames", "E013", ["That's what he was bringing me on Friday."]),
  r("ames", "E012", ["He called the grantees. Good. That's evidence of absence, which is harder to get than people think."]),
  r("ames", "E016", ["Meridian invoices Monongah for nearly all of what the fund paid Monongah. There's your door."]),
  r("ames", "E015", ["Program services between $18,000 and $49,500. Every one under fifty."]),
  r("ames", "E018", ["Two forms, same firm, same day, phase two and phase three. That's a split engagement on its face."]),
  r("ames", "E017", ["A facilities contractor registered in a financial adviser's suite. I'd want to know why."]),
  r("ames", "E029", ["Meridian on every page. Where the money goes after Meridian is outside these subpoenas."]),
  // Avery
  r("avery", "E023", ["That's Reddick's van. Not usually there after dark."]),
  r("avery", "E006", ["My log. Read the back door."]),
  r("avery", "E022", ["Card 0447. Never reported lost."]),
  r("avery", "E007", ["Boot print. Not my department, but I'd have asked for the boots too."]),
  // Morris
  r("morris", "E026", ["That's what I told the detective. Every word."]),
  r("morris", "E028", ["My message slip. He was so loud. Mr. Keller was so patient with him."]),
  r("morris", "E013", ["From the back printer. He printed things at night. I told you."]),
  r("morris", "E021", ["'Home'? He wasn't home at ten to eight. He was in the lot."]),
  // Bowman
  r("bowman", "E004", ["The eagle. I looked at that photo on the wall for two days and didn't see it."]),
  r("bowman", "E005", ["One folder, one drawer. Not a burglar's search."]),
  r("bowman", "E006", ["Card 0447 at 8:31, the back door from inside at 8:57. Nobody through the front."]),
  r("bowman", "E022", ["Reddick's card. With photo nine, I've got a reason to ask him for his boots."]),
  r("bowman", "E021", ["'Home,' in a heavier pen. Written after, maybe."]),
  r("bowman", "E026", ["Angela came in and gave it to me in writing. Good for her."]),
  r("bowman", "E023", ["Lettering's readable even if the plate isn't."]),
  r("bowman", "E025", ["Holt's number, both ways, the night of. That's not about a boiler."]),
  r("bowman", "E019", ["'Done. Shred.' The morning after."]),
  r("bowman", "E024", ["Nine and a half thousand, the morning after, and no job behind it."]),
  r("bowman", "E011", ["This should've been in my evidence room. I'm glad it's in your hands."]),
  r("bowman", "E007", ["Consistent with. Can't identify. A jury will hear both halves. It's one brick, not the wall."]),
  r("bowman", "E028", ["Foster. I checked him. Middle school concert, seven to nine fifteen."]),
  // Foster
  r("foster", "E028", ["Yeah. That's the letter. And that's me, on Angela's slip. Not my finest day."]),
  r("foster", "E015", ["'Reports missing.' Yeah, that's me. I'm fixing it."]),
  // Bennett
  r("bennett", "E001", ["Left the wallet, the phone and the laptop. That's not a burglary, that's a retrieval."]),
  r("bennett", "E030", ["Courier account 20417. Business account, no public listing. That's as far as paper goes."]),
  r("bennett", "E017", ["A contractor organized at a financial adviser's front desk. Hang on to that."]),
  r("bennett", "E025", ["Phone records are honest. People aren't. Holt's number, before and after."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_HOME_DOOR",
    characterId: "reddick",
    title: "Paul Reddick: home by five (door log)",
    text: "Paul Reddick says he finished the boiler at 4:30 PM on Thursday and was home by five. The building's log shows his card, 0447, opening the rear service door at 8:31 PM, and the door opened from inside at 8:57 PM.",
    when: { all: [{ asked: "reddick_thursday" }, ev("E006")] },
  },
  {
    id: "X_HOME_MORRIS",
    characterId: "reddick",
    title: "Paul Reddick: home by five (Angela Morris)",
    text: "Paul Reddick says he was home by five on Thursday. Angela Morris states that at about 7:48 PM his van was by the dumpsters in the rear lot, with him in the driver's seat on his phone.",
    when: { all: [{ asked: "reddick_thursday" }, ev("E026")] },
  },
  {
    id: "X_HOME_CAMERA",
    characterId: "reddick",
    title: "Paul Reddick: home by five (bank camera)",
    text: "Paul Reddick says he was home by five on Thursday. The bank camera shows a white high-roof van with a ladder rack and partly readable 'REDDICK MAINTENANCE' lettering entering the rear lot at 8:24 PM and leaving at 8:59 PM.",
    when: { all: [{ asked: "reddick_thursday" }, ev("E023")] },
  },
  {
    id: "X_NOT_INSIDE",
    characterId: "reddick",
    title: "Paul Reddick: never went in",
    text: "Paul Reddick now says he may have swung by on Thursday night but did not go in. His card opened the rear service door at 8:31 PM, the door held open five seconds, and it was next opened from inside at 8:57 PM.",
    when: { all: [{ asked: "reddick_swung_by" }, ev("E006")] },
  },
  {
    id: "X_REDDICK_HVAC",
    characterId: "reddick",
    title: "Paul Reddick: the HVAC job",
    text: "Paul Reddick says the $9,500 from Tri-County on November 9 was for an HVAC job. His shop's invoice book has no invoice to Tri-County, and there is no HVAC retrofit on his job sheets for October or November.",
    when: { all: [{ asked: "reddick_payment" }, ev("E024")] },
  },
  {
    id: "X_HOLT_REDDICK",
    characterId: "holt",
    title: "Adrian Holt: barely knows Reddick",
    text: "Adrian Holt says he barely knows Paul Reddick. Holt's number, (412) 555-0193, called Reddick on November 6, 7 and 8, Reddick called it at 9:02 PM on Thursday night, and there were no calls between them in the three months before.",
    when: { all: [{ asked: "holt_reddick" }, ev("E025")] },
  },
  {
    id: "X_HOLT_HVAC",
    characterId: "holt",
    title: "Adrian Holt: legitimate HVAC work",
    text: "Adrian Holt says Tri-County's $9,500 to Reddick Maintenance was for legitimate HVAC work. Reddick's invoice book has no invoice to Tri-County, and there is no HVAC retrofit on his job sheets for October or November.",
    when: { all: [{ asked: "holt_payment" }, ev("E024")] },
  },
  {
    id: "X_WHITFIELD_WARNED",
    characterId: "whitfield",
    title: "Susan Whitfield: no formal concern",
    text: "Susan Whitfield said Martin never raised a formal concern about the fund. On October 22 he emailed her that he could not match most program services payments to work done and wanted outside eyes; she replied asking him to wait until after the Lockhart dinner.",
    when: { all: [{ asked: "whitfield_concerns" }, ev("E027")] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  hannah_hire: "why did you hire us why come to blackwood why an investigator why not the police",
  hannah_dad: "tell me about your father your dad who was martin what was he like",
  hannah_anxious: "was he worried anxious scared nervous something bothering him at work didn't add up dad father concerned afraid stressed",
  hannah_numbers: "did he say anything strange anything unusual look at the numbers last things he said warning",
  hannah_book: "books textbook montgomery's auditing shelf where did he hide things borrowed mention a book talked about book dad father",
  hannah_house: "house key can I get into his house orchard street home office",
  hannah_last: "when did you last talk to him last speak last call",
  hannah_holt: "adrian holt the consultant do you know holt",
  hannah_lockhart: "lockhart the donor who is lockhart big donor",
  hannah_whitfield: "susan whitfield his boss the director",
  hannah_police: "what have the police told you detective bowman police say",
  hannah_reddick: "paul reddick do you know reddick maintenance man",
  hannah_letter: "the letter he left you his letter only if needed hannie",
  hannah_ledger: "the ledger the notebook in the book his record",
  whitfield_who: "what do you do your job who are you the foundation",
  whitfield_martin: "tell me about martin keller what was martin like",
  whitfield_fund: "the fund small business recovery fund the program what is the fund",
  whitfield_holt: "holt advisory adrian holt the administrator who reviews payments",
  whitfield_concerns: "did martin raise concerns worries complaints did he come to you about the fund",
  whitfield_warning: "you asked him to wait october 22 the memo his email warned you why did you tell him to wait",
  whitfield_emails: "do you have the emails his email your reply copies",
  whitfield_told_holt: "who else knew did you tell holt did anyone know about the auditor outside review",
  whitfield_reddick: "paul reddick maintenance contract how did he get the contract who recommended",
  whitfield_thursday: "when did you leave thursday where were you that night november 8",
  whitfield_lockhart: "lockhart foundation the donor dr lockhart the dinner",
  whitfield_authorizations: "who approved these payments authorizations forms signed",
  whitfield_foster: "warren foster the hardware store clawback argument",
  holt_who: "who are you what do you do your firm holt advisory",
  holt_agreement: "your arrangement contract agreement with the foundation administrative services agreement",
  holt_subcontractors: "why does the fund pay outside firms subcontractors program services",
  holt_meridian: "meridian advisory group what is meridian your partner the suite",
  holt_tricounty: "tri-county facility partners tricounty what is tri-county storefront",
  holt_martin: "martin keller his concerns what do you make of martin misunderstood",
  holt_authorizations: "who authorized the payments approved signed authorizations threshold under fifty thousand",
  holt_split: "two monongah forms same day phase two phase three split",
  holt_reddick: "paul reddick do you know reddick the maintenance man boiler",
  holt_calls: "why did you call reddick phone calls november 6 7 8",
  holt_payment: "9,500 nine thousand five hundred tri-county paid reddick hvac payment why did you pay paul reddick money",
  holt_dunmore: "carol dunmore who is carol your office manager",
  holt_thursday: "where were you thursday night november 8 alibi",
  holt_auditor: "did you know martin was meeting an auditor walter ames outside auditor",
  holt_lockhart: "lockhart foundation the donor dr lockhart",
  reddick_who: "who are you what do you do your business",
  reddick_contract: "the mercantile contract how did you get the job building contract",
  reddick_holt: "adrian holt do you know holt the fund guy",
  reddick_thursday: "where were you thursday november 8 that night alibi what did you do after the boiler",
  reddick_card: "why do you have a card 24 hour access key card",
  reddick_martin: "did you know martin keller the controller",
  reddick_van: "what do you drive your van your truck",
  reddick_swung_by: "your card opened the door at 8:31 you went back that night were you there",
  reddick_morris: "angela morris saw your van 7:48 in the lot",
  reddick_camera: "bank camera your van entering the lot 8:24 footage",
  reddick_payment: "9,500 tri-county payment what was the money for",
  reddick_calls: "holt calling you phone calls why did holt call",
  reddick_boots: "your boots the boot print bowman took your boots footwear",
  reddick_eagle: "brass eagle the award on his desk the weapon",
  lockhart_fund: "your foundation support for the fund why carroway",
  lockhart_martin: "did you know martin keller",
  lockhart_envelope: "the envelope you sent the invoice copy how did you get it when did it arrive",
  lockhart_sender: "who sent it who sent the envelope",
  lockhart_tricounty: "tri-county facility partners what do you know about tri-county",
  lockhart_holt: "adrian holt the administrator what do you know about holt",
  lockhart_meridian: "meridian advisory group have you heard of meridian",
  lockhart_waybill: "courier waybill capital courier account 20417 footer mag-rm copier marks",
  lockhart_control: "holt controlled the payments tri-county is holt's",
  ames_who: "who are you what do you do your firm",
  ames_call: "how did you know martin did he call you",
  ames_email: "did martin write to you email his message confidential meeting",
  ames_friday: "friday morning the meeting did he show up what happened friday",
  ames_passthrough: "pass-through payment what is a pass through",
  ames_split: "split engagement splitting under the limit threshold",
  ames_meridian: "three firms paying one firm meridian why",
  ames_bank: "how to prove where the money went bank records subpoena",
  ames_holt: "do you know adrian holt",
  ames_ledger: "martin's ledger what do you make of the ledger",
  ames_memo: "the draft memo what do you make of the memo",
  ames_records: "copied payment records vouchers home copies",
  ames_schedule: "subpoenaed bank records schedule onward payments",
  avery_who: "who are you what do you do security",
  avery_system: "how does the access system work card system doors lock",
  avery_doors: "door log who came in thursday night access records entries",
  avery_rex: "what does rex mean request to exit push bar",
  avery_card: "whose card is 0447 belong to belongs owner owns maintenance card credential who has an access card cards issued holders",
  avery_maintenance: "maintenance at night unusual after hours",
  avery_front: "front door that night market street entries",
  avery_cleaner: "who found him the cleaner rosa delgado",
  avery_camera: "cameras on the lot cctv video surveillance camera on the building outside exterior",
  avery_reddick: "how did reddick get the contract who recommended reddick",
  avery_martin: "did you know martin keller",
  avery_lost: "card 0447 lost stolen reported missing",
  avery_van: "recognize the van bank camera stills",
  morris_who: "who are you what do you do your job",
  morris_martin: "how did martin seem lately behaving worried jumpy",
  morris_thursday: "when did you leave thursday night working late",
  morris_van: "did you see anyone when you left the van in the lot reddick",
  morris_foster: "trouble with anyone argument warren foster shouting",
  morris_job: "are you all right okay scared worried about your job",
  morris_printer: "printer where did he print the back printer",
  morris_files: "where are the records kept files grant register binder",
  morris_holt: "what's adrian holt like holt",
  morris_reddick: "paul reddick what do you know about reddick maintenance",
  morris_susan: "martin and susan get along argument relationship",
  morris_lockhart: "dr lockhart who is lockhart the donor dinner",
  bowman_case: "where does the case stand investigation status theory burglary",
  bowman_report: "police report incident report can I see the report",
  bowman_photos: "scene photographs photos crime scene pictures",
  bowman_autopsy: "medical examiner autopsy cause of death time of death me report",
  bowman_canvass: "canvass witnesses neighbors anyone see anything lorraine bix",
  bowman_taken: "what was taken stolen missing robbery",
  bowman_entry: "how did they get in forced entry break in access",
  bowman_eagle: "eagle award missing from desk weapon",
  bowman_footwear: "boot print footwear comparison reddick's boots lab compare the print",
  bowman_lab: "anything back from the lab results lab report",
  bowman_camera: "bank camera footage video lot first allegheny registration",
  bowman_foster: "warren foster alibi where was foster",
  bowman_subpoena: "bank records subpoena the three firms financial records",
  bowman_bank: "subpoenas results what did the banks show",
  foster_who: "who is this who are you your store",
  foster_grant: "your grant the clawback letter twelve thousand",
  foster_argument: "monday november 5 the argument you yelled shouting argument with martin fight disagreement row about",
  foster_paper: "did you go to the newspaper the paper reporter",
  foster_reports: "settle things reports did you file",
  foster_thursday: "where were you thursday night alibi november 8",
  foster_martin: "how do you feel about martin now",
  foster_police: "have the police talked to you bowman",
  bennett_case: "what do you make of the file your read what do you think",
  bennett_tricounty: "tri-county records state filing who owns tri-county run tri-county",
  bennett_holt: "run adrian holt background on holt",
  bennett_reddick: "run paul reddick background on reddick",
  bennett_meridian: "meridian advisory group records background",
  bennett_lockhart: "lockhart foundation records filings",
  bennett_courier: "courier waybill account 20417 capital courier trace",
  bennett_foster: "run warren foster background",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
