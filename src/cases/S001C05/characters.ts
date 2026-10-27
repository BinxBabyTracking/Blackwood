import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C05 "The Benefactor" interviews, written against docs/S001C05-timeline.md.
 *
 * Rules for this file: nobody confesses; Knox and Marchetti give their own
 * accounts, lies included; nobody names the killer; nobody states a forensic
 * result that is not in a report; every time, amount and number agrees with
 * the timeline. Nothing from the "Closing report only" list is said by anyone:
 * not what was said in Suite C, not the blow, not the 9:56 PM call, not who
 * "A." is. Dr. Lockhart is the client: gracious, plausible, never
 * self-incriminating, and nothing she or anyone says proves she is the
 * Architect or that she ordered anything. Marchetti never names her as "A."
 * Knox never names Marchetti; he says "counsel." Det. Caruso starts skeptical
 * of robbery and moves with the evidence.
 *
 * Gates are written only as `requires` so each answer and its knowledge fact
 * (knowledge.ts) carry the same condition.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const never: Condition = { not: { always: true } };
const knoxKnown: Condition = { any: [{ talkedTo: "porter" }, { talkedTo: "lane" }, ev("E001"), ev("E021"), ev("E022")] };
const mendesKnown: Condition = { any: [{ talkedTo: "claudia" }, { talkedTo: "lane" }] };
const wexlerKnown: Condition = { any: [{ talkedTo: "claudia" }, { chapter: 3 }] };
const abernathyOn: Condition = { any: [ev("E019"), { event: "RE05" }, { event: "RE06" }] };
const donovanOn: Condition = { event: "RE09" };
const meridianResearch: Condition = { any: [ev("E011"), ev("E012"), ev("E017")] };
const halvardKnown: Condition = { any: [ev("E011"), ev("E012"), ev("E013"), ev("E014"), ev("E017"), ev("E033")] };
const trustKnown: Condition = { any: [ev("E012"), ev("E035"), ev("E047")] };
const cardKnown: Condition = { any: [ev("E001"), ev("E006"), ev("E029"), { talkedTo: "claudia" }] };
const mendesReady: Condition = { any: [ev("E009"), { asked: "mendes_mezzanine" }] };
const re05: Condition = { event: "RE05" };
const re06: Condition = { event: "RE06" };
const re07Done: Condition = { eventState: "RE07", is: "completed" };
const lockhartNamed: Condition = { any: [ev("E035"), ev("E047"), { deduction: "D14" }] };
const knoxDeclining: Condition = { all: [ev("E031"), { not: ev("E032") }] };
const marchettiDeclining: Condition = { all: [{ flag: "marchetti_warrant" }, { not: { all: [ev("E045"), ev("E046")] } }] };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The victim: in the file and on the board, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "nathaniel",
    name: "Nathaniel Ogden",
    role: "Independent investment adviser to the Lockhart Foundation. The victim",
    portrait: "char.nathaniel",
    bio: [
      { text: "Fifty-seven. Founder of Ogden Fiduciary Partners LLC, 31st floor, 1185 Sixth Avenue. Adviser to the Lockhart Foundation's investment committee since 2016. Lived at 312 West 87th Street, Apt. 4, with his wife, Claudia." },
      { text: "Found dead in Conference Suite C, on the mezzanine of the Belgrave Grand Hotel, at 10:12 PM on Thursday, December 20, 2018, during the foundation's Winter Gala." },
      { text: "Preparing the committee's January review of its alternative investments, he traced the foundation's largest private holding to Halvard Holdings and Meridian Advisory Group.", requires: { any: [ev("E011"), ev("E019"), ev("E038")] } },
      { text: "Wrote to Dr. Lockhart on Monday, December 17, asking for twenty minutes alone at the gala.", requires: ev("E019") },
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
    id: "lockhart",
    name: "Dr. Evelyn Lockhart",
    role: "Founder and chair, the Lockhart Foundation; your client",
    portrait: "char.lockhart",
    bio: [
      { text: "Fifty-two. Founder and chair of the Lockhart Foundation, 1140 Fifth Avenue, New York. Host of the Winter Gala at the Belgrave Grand." },
      { text: "Asked Blackwood to find out what happened to Nathaniel Ogden, in front of her guests, at about 11:05 PM on Thursday." },
      { text: "Gave her remarks from the stage from 9:30 to 9:52 PM, in front of about four hundred guests." },
      { text: "Organized Meridian Advisory Group in 2007; disclosed it to the investment committee in 2009 and recused herself.", requires: ev("E042") },
      { text: "Settlor and trust protector, for life, of Cardinal Point Trust.", requires: ev("E035") },
    ],
    available: { always: true },
    locationId: "ballroom",
    moves: [{ when: { chapter: 2 }, locationId: "foundation" }],
    phone: { always: true },
    contact: "Your client. The Lockhart Foundation, 1140 Fifth Avenue.",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what you'd like me to say about that.",
    idleLine: "I have guests, and a board, to look after. Do come back.",
    noAnswer: ["I really couldn't say.", "I'm afraid I don't know.", "You'd have to ask Elena, or Lionel."],
    voice: {
      voiceId: "pFZP5JQG7iQjIQuC4Bku",
      direction: "Woman in her early fifties, a New York philanthropist: composed, gracious, precise, warm in a measured way, unhurried; cooler and shorter as she is pressed, never rattled. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "gracious", label: "Gracious", requires: { always: true } },
      { id: "measured", label: "Measured", requires: { any: [{ deduction: "D13" }, ev("E042")] }, cue: "Dr. Lockhart's smile is still there. She has started to wait a moment before each answer." },
      { id: "guarded", label: "Guarded", requires: { deduction: "D14" }, cue: "Dr. Lockhart folds her hands and answers the question asked, and not one word more." },
      { id: "cool", label: "Cool", requires: { event: "RE10" }, idleLine: "I think we've said what we have to say to each other today.", cue: "Dr. Lockhart looks at you for a long moment, pleasantly, the way she might look at a painting she has decided not to buy." },
    ],
  },
  {
    id: "marchetti",
    name: "Elena Marchetti",
    role: "Principal, Marchetti Law Group PLLC; outside counsel to the foundation",
    portrait: "char.marchetti",
    bio: [
      { text: "Fifty. Principal of Marchetti Law Group PLLC, 27th floor, 600 Lexington Avenue. Outside counsel to the Lockhart Foundation." },
      { text: "Engaged Knox Protective Services for the gala.", requires: knoxKnown },
      { text: "Manager of Halvard Holdings LLC; certified its beneficial ownership to its bank in August 2018.", requires: ev("E013") },
      { text: "Special trustee of Cardinal Point Trust.", requires: { any: [ev("E018"), ev("E035")] } },
    ],
    available: { always: true },
    locationId: "lobby",
    moves: [{ when: { chapter: 2 }, locationId: "marchetti_office" }],
    phone: { talkedTo: "marchetti" },
    contact: "Marchetti Law Group, 600 Lexington Avenue.",
    onBoard: true,
    defaultEvidenceReply: "I'm not going to comment on that.",
    idleLine: "I have clients. If you need me, call my office.",
    noAnswer: ["That's privileged.", "I wouldn't know, and I wouldn't say if I did.", "Ask the foundation."],
    voice: {
      voiceId: "XB0fDUnXU5powFXDhCwa",
      direction: "Woman of fifty, a Manhattan trusts lawyer: poised, fluent, quick, faintly amused; clipped and cold once defensive. Educated New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "poised", label: "Poised", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { deduction: "D08" }, cue: "Ms. Marchetti stops smiling. She takes a pen from her bag and starts writing down your questions." },
      { id: "refusing", label: "Declining to answer", requires: marchettiDeclining, refuses: "On advice of counsel, I'm declining to answer. You may speak to my lawyer.", cue: "Ms. Marchetti sits very straight while the officers box her files. She says nothing at all." },
    ],
  },
  {
    id: "knox",
    name: "Gabriel Knox",
    role: "Owner, Knox Protective Services LLC; gala security lead",
    portrait: "char.knox",
    bio: [
      { text: "Forty-one. Owner of Knox Protective Services LLC, second floor over a tire shop at 38-14 Northern Boulevard, Long Island City, Queens." },
      { text: "Ran the gala's contract security with Dario Restrepo and Tunde Oyelaran. Held hotel credential EVT-SEC-07." },
      { text: "Drives a black 2017 Chevrolet Tahoe, NY plate JHK-4471, registered to his company.", requires: ev("E024") },
      { text: "Held at JFK by Port Authority police at Det. Caruso's request before a one-way flight to Panama City.", requires: { flag: "knox_held" } },
    ],
    available: { always: true },
    known: knoxKnown,
    locationId: "lobby",
    moves: [
      { when: { chapter: 2 }, locationId: "knox_office" },
      { when: { flag: "knox_held" }, locationId: "police" },
    ],
    onBoard: true,
    defaultEvidenceReply: "Don't know what that is.",
    idleLine: "I've got work. We're done.",
    noAnswer: ["Couldn't tell you.", "Not my department.", "Ask counsel."],
    voice: {
      voiceId: "2EiwWnXFnvU5JabPnv8n",
      direction: "Man of about forty, a former soldier who runs a small security firm: clipped, flat, professional, short sentences; guarded, then hostile. Working-class New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { deduction: "D05" }, cue: "Knox shifts his weight and puts his hands behind his back, parade rest." },
      { id: "hostile", label: "Hostile", requires: { flag: "knox_held" }, cue: "Knox sits in the interview room with his jaw set. He doesn't look at you when you come in." },
      { id: "refusing", label: "Declining to answer", requires: knoxDeclining, refuses: "Lawyer.", cue: "Knox folds his arms. 'Lawyer,' he says, and nothing else." },
    ],
  },
  {
    id: "claudia",
    name: "Claudia Ogden",
    role: "Nathaniel's wife",
    portrait: "char.claudia",
    bio: [
      { text: "Fifty-five. Director of administration at a Manhattan museum. Nathaniel's wife; they lived at 312 West 87th Street, Apt. 4." },
      { text: "Sat with Nathaniel at table 4. Gave him the brown leather briefcase with brass corners for their 25th anniversary, in 2011." },
    ],
    available: { always: true },
    locationId: "ballroom",
    moves: [{ when: { chapter: 2 }, locationId: "ogden_home" }],
    phone: { talkedTo: "claudia" },
    contact: "Mrs. Ogden. West 87th Street.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. Nathaniel didn't bring his work home to me in detail.",
    idleLine: "I need a little time alone. Please call me.",
    noAnswer: ["I don't know.", "He never told me that.", "I wish I knew."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman in her mid fifties, a museum administrator: grief held in by good manners, soft, exact; steadier and resolute later. Educated New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "shattered", label: "Shattered", requires: { always: true } },
      { id: "resolute", label: "Resolute", requires: ev("E019"), cue: "Claudia has put on her reading glasses. She looks at you as if she is taking notes too." },
    ],
  },
  {
    id: "wexler",
    name: "Simon Wexler",
    role: "Junior analyst, Ogden Fiduciary Partners",
    portrait: "char.wexler",
    bio: [
      { text: "Twenty-nine. Junior analyst at Ogden Fiduciary Partners, 31st floor, 1185 Sixth Avenue. Worked with Nathaniel for three years." },
      { text: "Knows the passphrase to Nathaniel's backup.", requires: re05 },
    ],
    available: { chapter: 3 },
    known: wexlerKnown,
    locationId: "ogden_office",
    phone: re05,
    contact: "Ogden Fiduciary Partners, Sixth Avenue.",
    onBoard: true,
    defaultEvidenceReply: "I'd rather not guess about that.",
    idleLine: "I need to think. Can we stop for now?",
    noAnswer: ["I don't know.", "Nathaniel didn't tell me that.", "I'm not sure. I'm sorry."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "Man of about thirty, a junior financial analyst: quick, nervous, afraid for his job; steadier and committed once he decides to talk. New York American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "frightened", label: "Frightened", requires: { always: true } },
      { id: "committed", label: "Committed", requires: re05, cue: "Simon has stopped glancing at the door. He has a legal pad of his own on the desk." },
    ],
  },
  {
    id: "bellamy",
    name: "Lionel Bellamy",
    role: "Chief financial officer, the Lockhart Foundation",
    portrait: "char.bellamy",
    bio: [
      { text: "Fifty-eight. Chief financial officer of the Lockhart Foundation since 2011. Oversees its grants, its managers and its books." },
      { text: "Processes Lockhart Endowment Partners' capital calls and reports." },
    ],
    available: { always: true },
    locationId: "lobby",
    moves: [{ when: { chapter: 2 }, locationId: "foundation" }],
    phone: { talkedTo: "bellamy" },
    contact: "The Lockhart Foundation, Office of the CFO.",
    onBoard: true,
    defaultEvidenceReply: "I'd want to check that against our books before I said anything.",
    idleLine: "I have the auditors to deal with. Please come back.",
    noAnswer: ["I wouldn't know that.", "That would be a question for counsel.", "It isn't in my books."],
    voice: {
      voiceId: "JBFqnCBsd6RMkjVDRZzb",
      direction: "Man in his late fifties, a nonprofit CFO: correct, a little stiff, formal; uneasy, then quietly candid. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "correct", label: "Correct", requires: { always: true } },
      { id: "uneasy", label: "Uneasy", requires: { deduction: "D11" }, cue: "Bellamy straightens a stack of papers that was already straight." },
      { id: "candid", label: "Candid", requires: re06, cue: "Bellamy closes his office door and sits down across from you, not behind the desk." },
    ],
  },
  {
    id: "lane",
    name: "Victoria Lane",
    role: "Director of events, the Lockhart Foundation",
    portrait: "char.lane",
    bio: [
      { text: "Forty-five. Director of events for the Lockhart Foundation. Ran the Winter Gala." },
      { text: "Found Nathaniel Ogden in Conference Suite C at 10:12 PM." },
    ],
    available: { always: true },
    locationId: "ballroom",
    moves: [{ when: { chapter: 2 }, locationId: "lobby" }],
    phone: { talkedTo: "lane" },
    contact: "Events office, the Belgrave Grand.",
    onBoard: true,
    defaultEvidenceReply: "I don't know anything about that, I'm afraid.",
    idleLine: "I have the hotel to settle up with. Come back any time.",
    noAnswer: ["I don't know.", "That wasn't on my run sheet.", "I couldn't tell you."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman in her mid forties, an events director: shaken at first, then brisk and precise, with a run-sheet memory. New York American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "shaken", label: "Shaken", requires: { always: true } },
      { id: "precise", label: "Precise", requires: { any: [{ asked: "lane_booking" }, ev("E006")] }, cue: "Victoria opens her binder and runs a finger down the change log." },
    ],
  },
  {
    id: "porter",
    name: "James Porter",
    role: "Security supervisor, the Belgrave Grand Hotel",
    portrait: "char.porter",
    bio: [
      { text: "Thirty-eight. Security supervisor at the Belgrave Grand Hotel. Keeps the door access system and the corridor cameras." },
      { text: "Reached Suite C with two officers at 10:15 PM." },
    ],
    available: { always: true },
    locationId: "security_office",
    phone: { talkedTo: "porter" },
    contact: "Security office, the Belgrave Grand.",
    onBoard: true,
    defaultEvidenceReply: "That's not one of ours. I can tell you about doors and cameras.",
    idleLine: "I've got monitors to watch. You know where the office is.",
    noAnswer: ["The system doesn't record that.", "Couldn't tell you.", "That's a question for Det. Caruso."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man in his late thirties, a hotel security supervisor: by the book, plain-spoken, a little stiff; embarrassed, then eager to put it right. New York American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "bythebook", label: "By-the-book", requires: { always: true } },
      { id: "embarrassed", label: "Embarrassed", requires: { flag: "assignment_changed" }, cue: "Porter rubs the back of his neck and doesn't quite meet your eye." },
      { id: "helpful", label: "Helpful", requires: ev("E030"), cue: "Porter pulls a second chair up to the monitors for you." },
    ],
  },
  {
    id: "mendes",
    name: "Olivia Mendes",
    role: "Banquet server, the Belgrave Grand Hotel",
    portrait: "char.mendes",
    bio: [
      { text: "Thirty-two. Banquet server at the Belgrave Grand. Worked table 4 at the gala." },
      { text: "Delivered a note card to Nathaniel Ogden at about 9:24 PM." },
    ],
    available: { chapter: 2 },
    known: mendesKnown,
    locationId: "service_corridor",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what that is.",
    idleLine: "I have to get back on the floor. Please.",
    noAnswer: ["I don't know.", "I'm sorry, I really don't.", "Nobody tells servers that kind of thing."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman in her early thirties, a hotel banquet server: nervous, quick, worried about her job; relieved and clear once she has said it. New York American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E029"), cue: "Olivia lets out a long breath. She looks lighter for having said it." },
    ],
  },
  {
    id: "abernathy",
    name: "Lawrence Abernathy",
    role: "Partner, trusts and private funds; adjunct, NYU Law",
    portrait: "char.abernathy",
    bio: [
      { text: "Forty-seven. Partner in trusts and private funds at a midtown firm, and adjunct professor at NYU Law." },
      { text: "Had lunch with Nathaniel Ogden on Monday, December 17." },
    ],
    available: abernathyOn,
    known: abernathyOn,
    locationId: null,
    medium: "telephone",
    phone: abernathyOn,
    contact: "Trusts lawyer, midtown. A second reading of the documents.",
    onBoard: true,
    defaultEvidenceReply: "Read me the operative paragraph. That's where the answer usually is.",
    idleLine: "I have a client on the hour. Call me when you have more paper.",
    noAnswer: ["The documents don't say that.", "I won't guess at that.", "That's a question of fact, not of law."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man in his late forties, a trusts lawyer and law professor on the telephone: careful, engaged, exact, explains plainly, never overstates. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [re06, ev("E035"), ev("E041")] }, cue: "Over the line you hear Abernathy push his chair back and pick up a pen." },
    ],
  },
  {
    id: "caruso",
    name: "Det. Anthony Caruso",
    role: "NYPD Manhattan South Homicide, lead detective",
    portrait: "char.caruso",
    bio: [
      { text: "Forty-nine. NYPD Manhattan South Homicide Squad. Assigned to complaint 2018-018-04417." },
      { text: "Agreed at Dr. Lockhart's request to share his file with Blackwood. Reachable at the squad room or by phone." },
    ],
    available: { always: true },
    locationId: "police",
    phone: { always: true },
    contact: "NYPD Manhattan South Homicide. Lead on the Ogden case.",
    onBoard: true,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man of about fifty, a New York homicide detective: professional, dry, patient, plain; quietly more worried as the case widens. New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "concerned", label: "Concerned", requires: { any: [{ deduction: "D08" }, { flag: "briefcase_recovered" }] }, cue: "Caruso rubs his eyes and pulls a fresh legal pad toward him." },
    ],
  },
  {
    id: "donovan",
    name: "Claire Donovan",
    role: "Former Meridian records analyst; cooperating witness",
    portrait: "char.donovan",
    bio: [
      { text: "Thirty-four. Former records analyst at Meridian Advisory Group's records center. Cooperating witness, Alexandria, Virginia." },
      { text: "Copied Meridian records for Miriam Castell of the Clearwater Accountability Initiative, and kept her own register." },
    ],
    available: donovanOn,
    known: donovanOn,
    locationId: null,
    medium: "telephone",
    phone: donovanOn,
    contact: "Alexandria, Virginia. Through Bennett.",
    onBoard: true,
    defaultEvidenceReply: "I can only speak to my own part. I don't know about that.",
    idleLine: "I need to stop for now. Please call again.",
    noAnswer: ["I don't know.", "I can only tell you what my register shows.", "I won't guess about that."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman in her mid thirties, a records analyst and cooperating witness on the telephone: careful, quiet, exact; shaken as she sees the pattern. Mid-Atlantic American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "shaken", label: "Shaken", requires: ev("E044"), cue: "Claire goes quiet on the line. When she speaks again, it's slower." },
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
  // Dr. Evelyn Lockhart: the client
  // =====================================================================
  q("lockhart", "Hiring us", "lockhart_hire", "Why did you ask Blackwood to look into this?", [
    "Because I admire what you did for Hannah Keller. I wanted you to see the foundation at its best.",
    "I'm sorry it was this. Detective Caruso has agreed to share his file with you. I asked him to.",
  ]),
  q("lockhart", "Nathaniel", "lockhart_nathaniel", "Tell me about Nathaniel Ogden.", [
    "A careful man, and a fair one. He advised our investment committee for two years.",
    "He was the kind of adviser who reads the footnotes. I valued that.",
  ]),
  q("lockhart", "Nathaniel", "lockhart_meeting", "Were you meeting Nathaniel tonight?", [
    "He wrote to me on Monday asking for a private word about some questions on our alternative investments. I told him Elena would find us a room.",
    "I understood we would meet in the Library after my remarks, at a quarter past ten.",
  ], {
    reveals: "Dr. Lockhart says Nathaniel asked on Monday for a private word about the alternative investments; she understood they would meet in the Library at 10:15 PM, after her remarks.",
    effects: [tl("Mon 12/17", "Nathaniel writes to Dr. Lockhart asking for a private word at the gala.", "Dr. Lockhart")],
  }),
  q("lockhart", "Nathaniel", "lockhart_card", "Did you send Nathaniel a card?", [
    "No. I never sent him a card. I was on stage from half past nine.",
    "If Elena moved the meeting, you'll have to ask her why. People do use my name; it's the price of having one.",
  ], { requires: cardKnown, reveals: "Dr. Lockhart says she never sent Nathaniel a card and was on stage from 9:30 PM." }),
  q("lockhart", "The evening", "lockhart_remarks", "Where were you between 9:30 and 10:15?", [
    "On stage from half past nine until about eight minutes to ten, in front of four hundred people. Then the auction, and I was at the front table.",
    "Victoria came to me a little after ten. I thought she'd come about the auction.",
  ], { effects: [tl("9:30 to 9:52 PM (Thu 12/20)", "Dr. Lockhart gives her remarks from the stage.", "Dr. Lockhart")] }),
  q("lockhart", "The foundation", "lockhart_investments", "What does the foundation invest in?", [
    "Public markets, through managers, and one large private line: Lockhart Endowment Partners. It holds most of a company called Halvard Holdings.",
    "Halvard owns part of Meridian. It's disclosed in our statements. Lionel can give you every figure.",
  ], { reveals: "Dr. Lockhart says the foundation invests through Lockhart Endowment Partners, which holds most of Halvard Holdings, which owns part of Meridian." }),
  q("lockhart", "The foundation", "lockhart_meridian", "What is your connection to Meridian Advisory Group?", [
    "Meridian is one of Halvard's holdings. From where I sit it's an investment of an investment.",
    "I've read about its troubles like everyone else.",
  ], { requires: { not: ev("E042") }, reveals: "Dr. Lockhart describes Meridian only as one of Halvard's holdings, 'an investment of an investment.'" }),
  q("lockhart", "People", "lockhart_marchetti", "Tell me about Elena Marchetti.", [
    "Elena has been the foundation's counsel for as long as we've had papers worth signing. She's very good.",
    "She arranges a great many things for me. That's rather the point of her.",
  ]),
  q("lockhart", "People", "lockhart_knox", "What do you know about Gabriel Knox?", [
    "Mr. Knox? Elena's security people. I couldn't tell you more than that.",
  ], { requires: knoxKnown }),
  q("lockhart", "People", "lockhart_claudia", "Do you know Claudia Ogden?", [
    "Socially, for years. I'm very fond of her. I can't imagine what this is for her.",
  ]),
  q("lockhart", "Meridian", "lockhart_arrests", "What do you make of the arrests of Holt, Rourke and Kane?", [
    "I read about them in the newspapers, like everyone else.",
    "Meridian has had a terrible autumn, and I'm glad it's being cleaned up.",
  ]),
  q("lockhart", "Meridian", "lockhart_architect", "Have you heard of someone called the Architect?", [
    "The Architect? I have no idea what that means.",
  ]),
  q("lockhart", "People", "lockhart_donovan", "Do you know Claire Donovan?", [
    "I met Ms. Donovan once, at a Clearwater breakfast in October. I was relieved to hear she was safe.",
    "The foundation funds Clearwater openly. I believe in transparency.",
  ]),
  q("lockhart", "Carroway", "lockhart_envelope", "Tell me about the Carroway envelope you sent us.", [
    "It reached my office with no name on it and no letter. Just the copy. I confess I set it aside.",
    "Then I read about Martin Keller, and I thought you should have it.",
  ]),
  q("lockhart", "The foundation", "lockhart_control", "Who controls the foundation's investments?", [
    "The board, through its investment committee. The partnership has its own general partner, so the endowment is insulated. Counsel designed it that way.",
    "I'm one vote of five, and I recuse myself where I should.",
  ], { requires: { not: ev("E035") }, reveals: "Dr. Lockhart says the board and its investment committee oversee the foundation's investments, and she is 'one vote of five.'" }),
  q("lockhart", "The foundation", "lockhart_records", "Can I see the foundation's records?", [
    "Of course. Lionel keeps the books. Anything you need, ask him.",
  ]),
  q("lockhart", "Meridian", "lockhart_founded", "The 2009 committee minutes say you organized Meridian.", [
    "I did, in 2007, as a governance consultancy. A good idea that grew.",
    "I disclosed it to the committee in 2009, I left the room, and I've had no operating role since.",
  ], { requires: ev("E042"), reveals: "Dr. Lockhart says she organized Meridian in 2007, disclosed it in 2009, recused herself, and has had no operating role since." }),
  q("lockhart", "The trust", "lockhart_protector", "You are the trust protector of Cardinal Point Trust.", [
    "It's a safeguard I agreed to carry, so the foundation's interest could never be voted against it.",
    "I've used it rarely, and always for the foundation. It was kept confidential on advice, so it could never become a lever.",
  ], { requires: ev("E035"), reveals: "Dr. Lockhart says the protector role is a safeguard she carries for the foundation, used rarely, kept confidential on advice." }),
  q("lockhart", "The trust", "lockhart_letters", "Your September 17 letter told the trustee to have Halvard act on its risk review.", [
    "And to keep me informed. I asked to be kept informed. Is that sinister?",
  ], { requires: ev("E040") }),
  q("lockhart", "The trust", "lockhart_structure", "The foundation's endowment owns most of Halvard.", [
    "It does, and has since 2009. It's in the register I sent you myself.",
  ], { requires: { deduction: "D13" } }),
  q("lockhart", "The trust", "lockhart_directs", "As protector, you direct every vote above Meridian.", [
    "I hold a power I seldom use, for the foundation's sake. You've seen how seldom.",
  ], { requires: { deduction: "D14" } }),
  q("lockhart", "Nathaniel", "lockhart_memo", "Nathaniel's memo asked you for an independent review.", [
    "I never received it. He'd have given it to me in the Library at a quarter past ten.",
    "I'd like to think I would have said yes.",
  ], { requires: ev("E048") }),
  q("lockhart", "Nathaniel", "lockhart_email", "You wrote back to Nathaniel, 'Elena will find us a room.'", [
    "Yes. Elena arranges my private meetings at events. She always has.",
  ], { requires: ev("E019") }),
  q("lockhart", "Meridian", "lockhart_exposure", "Halvard cut off each operation before its leader was arrested.", [
    "If Halvard's managers acted on their own risk review, that is what I asked of them.",
    "If you're asking whether I knew those men were going to be arrested, I read it in the newspaper, as you did.",
  ], { requires: ev("E043") }),
  q("lockhart", "Meridian", "lockhart_index", "Elena Marchetti's files record calls from 'A.' and a matter called ARCHITECT.", [
    "I couldn't tell you who Elena speaks to late at night, or what she calls her files.",
    "You'd have to ask her.",
  ], { requires: { any: [ev("E045"), ev("E046")] } }),
  q("lockhart", "The trust", "lockhart_theory", "What do you think I've concluded?", [
    "You've decided something about me. I hope you have more than a diagram.",
  ], { requires: { event: "RE10" }, volunteer: { after: 1 } }),

  // =====================================================================
  // Elena Marchetti: counsel
  // =====================================================================
  q("marchetti", "Introductions", "marchetti_who", "Who are you, Ms. Marchetti?", [
    "Elena Marchetti, Marchetti Law Group. I'm outside counsel to the Lockhart Foundation, and have been for a long time.",
  ]),
  q("marchetti", "Nathaniel", "marchetti_nathaniel", "What did you think of Nathaniel Ogden?", [
    "An adviser who had misread a lawful structure and was about to embarrass a great charity over it.",
    "That's no reason anyone would harm him, obviously.",
  ], { reveals: "Elena Marchetti calls Nathaniel 'an adviser who had misread a lawful structure and was about to embarrass a great charity over it.'" }),
  q("marchetti", "Security", "marchetti_knox", "Why did you hire Knox Protective for the gala?", [
    "Knox Protective is a reputable firm. I've used them for sensitive events. Principal protection, the VIP rooms, the usual.",
  ], { reveals: "Marchetti says Knox Protective is a reputable firm she uses for sensitive events and principal protection." }),
  q("marchetti", "The meeting", "marchetti_room", "Why was Nathaniel's meeting moved to Suite C?", [
    "I may have suggested a quieter room. Evelyn's remarks were going to run long.",
    "I asked Victoria to send a card up to him. That's all.",
  ], { reveals: "Marchetti says she may have suggested a quieter room because the remarks would run long, and asked Victoria Lane to send a card." }),
  q("marchetti", "Security", "marchetti_knox_contact", "When did you last speak to Gabriel Knox?", [
    "On Wednesday, about the arrangements. He's the contractor. I'm counsel.",
  ], { reveals: "Marchetti says she last spoke to Gabriel Knox on Wednesday, about the arrangements." }),
  q("marchetti", "The structure", "marchetti_opinion", "How is the foundation's investment structure set up?", [
    "It's set out in my 2009 opinion to the board. Read it; it's been right for nine years.",
    "Here. Take a copy. Page nine is the one people like to quote.",
  ], { reveals: "Marchetti handed over her 2009 opinion to the foundation's board on the Halvard investment.", effects: [{ giveEvidence: "E036" }] }),
  q("marchetti", "The evening", "marchetti_evening", "Where were you during Dr. Lockhart's remarks?", [
    "At the foundation's table in the ballroom, listening to Evelyn, like everyone else.",
  ]),
  q("marchetti", "The structure", "marchetti_privilege", "Can I see the Halvard governance files?", [
    "The governance files of the general partner, Halvard and the trust are privileged and held at my direction.",
    "You may read anything that's public. That isn't.",
  ]),
  q("marchetti", "The structure", "marchetti_halvard", "What is Halvard Holdings?", [
    "A private company the partnership invests in. Its affairs are confidential.",
  ]),
  q("marchetti", "People", "marchetti_lockhart", "What is your relationship with Dr. Lockhart?", [
    "She is my client's founder and chair. I've advised the foundation for more than ten years.",
  ]),
  q("marchetti", "The structure", "marchetti_cardinal", "What is Cardinal Point Trust?", [
    "A trust for the foundation's exclusive benefit. Its terms are customary, and confidential.",
  ]),
  q("marchetti", "Security", "marchetti_credential", "Why did Knox's hotel credential include the mezzanine?", [
    "Principal protection requires mezzanine and VIP room access. That's standard for an event like this.",
  ], { requires: ev("E022") }),
  q("marchetti", "The meeting", "marchetti_request", "The booking log says the change was 'at Dr. Lockhart's request.'", [
    "Evelyn wanted the conversation to happen. The arrangements were mine.",
  ], { requires: ev("E006") }),
  q("marchetti", "Security", "marchetti_engagement", "Your engagement letter covers 'confidential document-security matters.'", [
    "Protecting the foundation's confidential papers, which is what lawyers do.",
    "Privileged matters are instructed orally. You don't put a client's secrets in a contractor's filing cabinet.",
  ], { requires: ev("E027") }),
  q("marchetti", "The meeting", "marchetti_texts", "Your texts told Knox the room and the time.", [
    "I asked Mr. Knox to make sure the foundation's confidential documents did not leave the hotel. I told him which room.",
    "I never told him to touch anyone. He exceeded any instruction he had from me.",
  ], {
    requires: { deduction: "D08" },
    reveals: "Marchetti concedes she asked Knox to make sure the foundation's confidential documents did not leave the hotel and told him which room; she says she never told him to touch anyone.",
  }),
  q("marchetti", "After", "marchetti_refused", "What did 'Not here. Not to me.' mean?", [
    "I don't discuss calls with people working under my direction.",
    "The text says what it says.",
  ], { requires: ev("E026") }),
  q("marchetti", "After", "marchetti_payment", "Why did your firm pay Stratford Risk Consulting $40,000?", [
    "I won't discuss my firm's payments.",
  ], { requires: ev("E028") }),
  q("marchetti", "After", "marchetti_sheet", "Your office sent the hotel a 'corrected' assignment sheet at 11:40 PM.", [
    "My office corrected a contractor's paperwork. If the hotel had the wrong version, the right one went over.",
  ], { requires: ev("E030") }),
  q("marchetti", "The structure", "marchetti_bellamy", "You told Lionel Bellamy to route Nathaniel's requests through you.", [
    "Counsel coordinates requests from advisers. That's ordinary governance.",
  ], { requires: ev("E037") }),
  q("marchetti", "The structure", "marchetti_trustee", "Your trustee letters had Halvard cut off Pittsburgh, Washington and Baltimore.", [
    "Trustee correspondence is privileged and, in any event, lawful. A holding company is entitled to manage its risk.",
  ], { requires: ev("E018") }),
  q("marchetti", "The structure", "marchetti_protector", "Dr. Lockhart is the trust's protector.", [
    "The terms of the trust are confidential by their own terms. I'm bound by them.",
  ], { requires: ev("E035") }),
  q("marchetti", "Nathaniel", "marchetti_binder", "Did Larchmont tell you Nathaniel had seen the governance binder?", [
    "Corinne Rhee at Larchmont called me after he'd been in, on November 28.",
    "He was entitled to see the binder as the committee's adviser. I was entitled to know he had.",
  ], {
    requires: { all: [{ deduction: "D08" }, { any: [ev("E011"), ev("E038")] }] },
    reveals: "Marchetti says Corinne Rhee of Larchmont told her after Nathaniel reviewed the governance binder on November 28.",
    effects: [tl("Wed 11/28", "Nathaniel reviews the GP governance binder at Larchmont; Corinne Rhee tells Marchetti afterward.", "Elena Marchetti")],
  }),
  q("marchetti", "Records", "marchetti_message", "Who is 'A.' in your telephone message of December 18?", [
    "Notes of a client call. The client is privileged. So is the matter.",
  ], { requires: ev("E045"), allowWhenRefusing: true }),
  q("marchetti", "Records", "marchetti_index", "Who is the Architect in your matter index?", [
    "The client is privileged. So is the matter.",
    "I won't confirm or deny any name.",
  ], { requires: ev("E046"), allowWhenRefusing: true }),

  // =====================================================================
  // Gabriel Knox: security lead
  // =====================================================================
  q("knox", "Introductions", "knox_who", "Who are you?", [
    "Gabriel Knox. Knox Protective Services, Long Island City. I ran security for the gala.",
  ]),
  q("knox", "The evening", "knox_where", "Where were you during Dr. Lockhart's remarks?", [
    "Ballroom east, stage side, nine fifteen to ten thirty. Covering the principal's remarks.",
    "I never went up to the mezzanine. That's what I told the officer.",
  ], {
    reveals: "Gabriel Knox says he was posted at ballroom east, stage side, from 9:15 to 10:30 PM, and never went to the mezzanine.",
    effects: [tl("9:15 to 10:30 PM (Thu 12/20)", "Gabriel Knox says he was at ballroom east, stage side.", "Gabriel Knox")],
  }),
  q("knox", "The evening", "knox_ogden", "Did you know Nathaniel Ogden?", [
    "No. Never met him.",
    "Lots of guys in suits with earpieces at a thing like that. If somebody saw one near him, it doesn't mean it was me.",
  ]),
  q("knox", "The job", "knox_credential", "Why did you have a mezzanine credential?", [
    "Counsel wanted the VIP rooms covered. So the credential included the mezzanine. Standard.",
  ]),
  q("knox", "The job", "knox_team", "Who was on your team?", [
    "Three of us. Me, Dario Restrepo, Tunde Oyelaran.",
  ]),
  q("knox", "The job", "knox_hired", "Who hired you for the gala?", [
    "The foundation, through its lawyers. I deal with counsel. That's normal.",
  ]),
  q("knox", "The evening", "knox_mezzanine", "Did you go up to the mezzanine at all?", [
    "I might have checked the mezzanine for a minute. Before the remarks.",
    "Then I was on the stage side.",
  ], { requires: { deduction: "D05" }, reveals: "Knox now says he 'might have checked the mezzanine for a minute' before the remarks." }),
  q("knox", "The job", "knox_staffing", "Your own staffing sheet has you floating the mezzanine from 9 to 10.", [
    "That was Wednesday's plan. Plans change on the night.",
  ], { requires: ev("E023") }),
  q("knox", "The evening", "knox_dock", "The dock log has you going out at 9:55 with a garment bag and a case.", [
    "My garment bag and my equipment case. I went out for radio batteries. I told the dock that.",
  ], { requires: ev("E009") }),
  q("knox", "The evening", "knox_storage", "Your truck left the hotel at 9:58 and went to your storage unit.", [
    "Radio batteries. Ours were dying.",
    "I went to our unit and came straight back.",
  ], { requires: ev("E024"), reveals: "Knox says he drove to his storage unit for radio batteries because theirs were dying, and came straight back." }),
  q("knox", "The evening", "knox_batteries", "Your sheet says the radios were all charged that morning, with spares in the truck.", [
    "The sheet says what I planned. Spares run out.",
  ], { requires: { all: [ev("E024"), ev("E023")] } }),
  q("knox", "The job", "knox_camera", "Why did you have camera M-2 turned away from the suites?", [
    "Principal privacy. VIP meetings upstairs. The client didn't want a camera on the doors.",
    "Normal request.",
  ], { requires: ev("E030") }),
  q("knox", "The evening", "knox_mendes", "A server saw you carrying a brown briefcase at 9:52.", [
    "The waitress is confused.",
  ], { requires: ev("E029") }),
  q("knox", "The evening", "knox_card", "Did you give a server a card for Mr. Ogden?", [
    "No. I don't run notes for guests.",
  ], { requires: ev("E029") }),
  q("knox", "The job", "knox_counsel", "Elena Marchetti hired you and told you where to be.", [
    "Counsel hired us. Counsel gives instructions about the client's events.",
    "I'm not discussing that.",
  ], { requires: { any: [ev("E026"), ev("E027")] } }),
  q("knox", "Money", "knox_wire", "What was the $40,000 from Stratford Risk Consulting for?", [
    "Incident response. There was an incident at our client's event. We responded.",
  ], { requires: ev("E025") }),
  q("knox", "JFK", "knox_flight", "Why were you on a one-way flight to Panama City?", [
    "I was going on vacation.",
  ], { requires: { flag: "knox_held" } }),
  q("knox", "The briefcase", "knox_opened", "The bookend was inside Nathaniel's briefcase, in your storage unit.", [
    "I never opened that briefcase.",
    "I have no idea how it got there.",
  ], { requires: ev("E032"), reveals: "Knox says he never opened the briefcase and has no idea how it got into his unit." }),
  q("knox", "The briefcase", "knox_unit", "Who else can get into unit 3C-27?", [
    "It's a company unit. A lot of people have that code.",
  ], { requires: ev("E032") }),

  // =====================================================================
  // Claudia Ogden: the widow
  // =====================================================================
  q("claudia", "Nathaniel", "claudia_nathaniel", "Tell me about your husband.", [
    "Thirty-two years. He was an investment adviser, and careful about everything. He read the footnotes.",
    "He was looking forward to tonight. He'd bought new cuff links.",
  ]),
  q("claudia", "Nathaniel", "claudia_worried", "Was Nathaniel worried about anything?", [
    "Since November, about the foundation. He worked late. He stopped sleeping properly.",
    "He said there was a trust with one person at the top, and the board doesn't know it.",
  ], { reveals: "Claudia says Nathaniel had been worried about the foundation since November and spoke of 'a trust with one person at the top, and the board doesn't know it.'" }),
  q("claudia", "The evening", "claudia_evening", "Tell me about the evening.", [
    "He carried his briefcase all evening. I gave it to him for our twenty-fifth anniversary. He wouldn't check it.",
    "At dinner he put his phone in it, because I asked him to stop checking it.",
  ], { reveals: "Nathaniel carried his briefcase all evening and put his phone in it at dinner." }),
  q("claudia", "The evening", "claudia_card", "Why did Nathaniel leave the table?", [
    "At 9:24 a young server brought him a card. Her name tag said OLIVIA. He read it and said, 'She'll see me now.'",
    "He left at 9:33, with the briefcase. He kissed my shoulder on the way.",
  ], {
    reveals: "At 9:24 PM a server named Olivia brought Nathaniel a card; he said 'She'll see me now' and left table 4 at 9:33 PM with his briefcase.",
    effects: [
      tl("9:24 PM (Thu 12/20)", "A server, Olivia, brings Nathaniel a card at table 4.", "Claudia Ogden"),
      tl("9:33 PM (Thu 12/20)", "Nathaniel leaves table 4 with his briefcase: 'She'll see me now.'", "Claudia Ogden"),
    ],
  }),
  q("claudia", "The evening", "claudia_looking", "When did you go looking for him?", [
    "Five past ten. The remarks were over and he hadn't come back. I asked Victoria Lane where his meeting was.",
  ], { effects: [tl("10:05 PM (Thu 12/20)", "Claudia asks Victoria Lane where Nathaniel's meeting is.", "Claudia Ogden")] }),
  q("claudia", "The briefcase", "claudia_briefcase", "Tell me about the missing briefcase.", [
    "Brown leather, brass corners, a brass plate engraved N.H.O. A blue folder of papers for Dr. Lockhart was in it, and his glasses, and his phone.",
    "I told Detective Caruso. Here's a copy of my statement. He kept his watch on. He always did.",
  ], { requires: { event: "RE02" }, reveals: "Claudia Ogden handed over her statement on the missing briefcase.", effects: [{ giveEvidence: "E010" }], volunteer: { after: 0 } }),
  q("claudia", "Nathaniel", "claudia_copies", "Did Nathaniel keep copies of his work?", [
    "Always. A second copy of anything that mattered, behind his father's diploma, in the frame in his office.",
    "He thought it was funny. Nobody steals a diploma.",
  ], {
    reveals: "Claudia says Nathaniel kept a second copy of anything that mattered behind his father's diploma, in the frame in his office.",
    effects: [{ setFlag: "backup_known" }],
    volunteer: { near: "copy copies backup backed duplicate spare saved safe keep kept hide hidden" },
  }),
  q("claudia", "People", "claudia_wexler", "Who did Nathaniel work with?", [
    "Simon Wexler. A junior analyst, very bright. Nathaniel trusted him.",
  ]),
  q("claudia", "People", "claudia_lockhart", "Do you know Dr. Lockhart?", [
    "Socially. I liked her. I still do, I think.",
  ], { variants: [{ requires: ev("E019"), reply: ["He liked her too. That's why he wanted to ask her first."] }] }),
  q("claudia", "Nathaniel", "claudia_enemies", "Did anyone want to hurt him?", [
    "No. People don't hurt investment advisers.",
  ]),
  q("claudia", "People", "claudia_police", "What have the police told you?", [
    "Detective Caruso has been kind. He doesn't believe it was a robbery either.",
  ]),
  q("claudia", "People", "claudia_knox", "Did you notice the security men tonight?", [
    "There were men with earpieces everywhere. I wasn't watching them. I was watching the door.",
  ], { requires: knoxKnown }),
  q("claudia", "People", "claudia_marchetti", "Do you know Elena Marchetti?", [
    "The foundation's lawyer. Nathaniel called her very thorough, and he didn't mean it kindly.",
  ]),
  q("claudia", "Nathaniel", "claudia_memo", "I found Nathaniel's memorandum to file.", [
    "He wrote that at our kitchen table on Tuesday night.",
    "S.W. is Simon.",
  ], { requires: ev("E019") }),
  q("claudia", "Nathaniel", "claudia_monday", "Who did Nathaniel see on Monday?", [
    "He had lunch with a lawyer he knew from NYU. Lawrence Abernathy.",
    "He came home quieter than he went.",
  ], { requires: ev("E019"), reveals: "Claudia says Nathaniel lunched with Lawrence Abernathy, a lawyer he knew from NYU, on Monday." }),
  q("claudia", "The briefcase", "claudia_returned", "The police have recovered the briefcase.", [
    "I want it back when they're finished. I had the plate engraved myself.",
  ], { requires: ev("E031") }),

  // =====================================================================
  // Simon Wexler: the analyst
  // =====================================================================
  q("wexler", "Introductions", "wexler_who", "Who are you?", [
    "Simon Wexler. I'm the junior analyst here. It was Nathaniel and me, mostly.",
  ]),
  q("wexler", "Nathaniel", "wexler_work", "What was Nathaniel working on?", [
    "He was reviewing the alternatives for the committee.",
    "That's all I can tell you right now.",
  ]),
  q("wexler", "About him", "wexler_scared", "Are you all right?", [
    "Not really. The foundation is about a third of the firm's revenue, and I don't know who I can trust.",
  ]),
  q("wexler", "Nathaniel", "wexler_lockhart", "Did Nathaniel talk about Dr. Lockhart?", [
    "Always with respect. He said he might be wrong, and he wanted to be fair to her.",
  ]),
  q("wexler", "The research", "wexler_summary", "What do you know about Nathaniel's research?", [
    "Everything I know is in here. I wrote it up last night.",
    "Since October he was on the committee's review of alternatives. In November he found Halvard, and that Halvard holds every vote in Meridian.",
  ], { requires: re05, reveals: "Simon Wexler handed over his summary of what Nathaniel was working on.", effects: [{ giveEvidence: "E038" }], volunteer: { after: 0 } }),
  q("wexler", "The research", "wexler_copies", "Did Nathaniel back up his research?", [
    "Everything, on a drive in the usual place. I know the passphrase.",
  ], { requires: re05, effects: [{ setFlag: "backup_known" }] }),
  q("wexler", "The research", "wexler_backup", "Can you open Nathaniel's backup drive?", [
    "Give it here. There. The two files that matter most are his exposure comparison and his control summary.",
    "I'll print them. I'm not going to tell you what they mean about anyone. I'll tell you what they show.",
  ], { requires: { all: [re05, ev("E020")] }, reveals: "Simon opened Nathaniel's backup and printed the exposure comparison and the control summary.", effects: [{ giveEvidence: "E043" }, { giveEvidence: "E047" }] }),
  q("wexler", "The research", "wexler_binder", "What happened on November 28?", [
    "He went to Larchmont, the general partner's administrator, and read the governance binder. He copied the protector letters.",
  ], { requires: re05, effects: [tl("Wed 11/28", "Nathaniel reviews the GP governance binder at Larchmont and copies the protector letters.", "Simon Wexler")] }),
  q("wexler", "The research", "wexler_abernathy", "Who did Nathaniel consult about the trust?", [
    "Lawrence Abernathy, a trusts lawyer. Lunch on the 17th. About protector powers.",
  ], { requires: re05 }),
  q("wexler", "The research", "wexler_arrests", "What did Nathaniel notice in December?", [
    "On the 10th he saw that the three Meridian arrests matched Halvard's September risk note. Pittsburgh, Washington, Baltimore.",
  ], { requires: re05, effects: [tl("Mon 12/10", "Nathaniel notices the three Meridian arrests match Halvard's September risk note.", "Simon Wexler")] }),
  q("wexler", "The research", "wexler_memo", "Did Nathaniel write to Dr. Lockhart?", [
    "He emailed her on the 17th asking for twenty minutes. He drafted a memo asking her for an independent review by January 15.",
  ], { requires: re05 }),
  q("wexler", "The research", "wexler_exposure", "What does the exposure comparison show?", [
    "Halvard's September risk note, what Halvard did, and when each arrest came. Each operation was cut loose first. Halvard lost nothing.",
  ], { requires: ev("E043") }),
  q("wexler", "The research", "wexler_control", "What does the control summary show?", [
    "Who owns each layer, and who decides it. At the top, the protector directs the votes.",
  ], { requires: ev("E047") }),

  // =====================================================================
  // Lionel Bellamy: CFO
  // =====================================================================
  q("bellamy", "Introductions", "bellamy_who", "What do you do at the foundation?", [
    "I'm the chief financial officer, since 2011. Our grants are real and audited. Two hundred and twelve organizations last year.",
  ]),
  q("bellamy", "Halvard", "bellamy_halvard", "What is the Halvard arrangement?", [
    "The founder's arrangement, approved in 2009, before my time, on counsel's opinion.",
    "I process the partnership's capital calls and reports. That's my part of it.",
  ]),
  q("bellamy", "Halvard", "bellamy_board", "Has the board ever voted on Halvard's governance?", [
    "Never on Class B matters. Counsel said it shouldn't, to keep the insulation.",
  ]),
  q("bellamy", "Nathaniel", "bellamy_nathaniel", "What did Nathaniel ask you for?", [
    "In November, the partnership's reports. I gave them to him. He was the committee's adviser; that's what he was for.",
  ]),
  q("bellamy", "Nathaniel", "bellamy_route", "What did Elena Marchetti tell you about Nathaniel?", [
    "On December 14 she asked me to route all his requests through her.",
  ], { effects: [tl("Fri 12/14", "Marchetti tells Bellamy to route all Nathaniel's requests through her.", "Lionel Bellamy")] }),
  q("bellamy", "After", "bellamy_cooperate", "What have the staff been told since the gala?", [
    "This morning Ms. Marchetti told the senior staff to cooperate visibly with the police and the investigators.",
    "And to release nothing about Halvard without her.",
  ], { requires: { chapter: 2 } }),
  q("bellamy", "Introductions", "bellamy_statement", "Will you give me a statement?", [
    "I've written one for Detective Caruso and for you. Here is a copy.",
  ], { requires: { chapter: 2 }, reveals: "Lionel Bellamy handed over his written statement.", effects: [{ giveEvidence: "E037" }] }),
  q("bellamy", "Halvard", "bellamy_trust", "Have you seen the trust's governing instrument?", [
    "No. I relied on Ms. Marchetti's opinion. I see now that I should have asked.",
  ]),
  q("bellamy", "Records", "bellamy_archive", "Where are the foundation's records kept?", [
    "In the archive, on the lower level of this building.",
  ], { variants: [{ requires: { flag: "archive_open" }, reply: ["In the archive, downstairs. It's open to you. Dr. Lockhart asked me herself."] }] }),
  q("bellamy", "People", "bellamy_lockhart", "What is Dr. Lockhart like to work for?", [
    "Exacting and generous. She remembers every grantee's name.",
  ]),
  q("bellamy", "The evening", "bellamy_evening", "Where were you during the remarks?", [
    "At table two, with our donors.",
  ]),
  q("bellamy", "Halvard", "bellamy_opinion", "What do you make of Marchetti's 2009 opinion?", [
    "That opinion is the reason I never asked. 'Customary terms.' I never saw them.",
  ], { requires: ev("E036") }),
  q("bellamy", "Halvard", "bellamy_restricted", "What did Marchetti's letter say?", [
    "That the Halvard files are privileged and that we're not to release or discuss them.",
    "I'm sorry. I don't like it either.",
  ], { requires: re06 }),
  q("bellamy", "Halvard", "bellamy_demand", "Will you sign a books-and-records demand as the limited partner?", [
    "If the foundation is entitled to inspect the partnership's books as a limited partner, I'll sign the demand as its officer.",
    "It's our money. We're entitled to see where it is.",
  ], { requires: { flag: "lp_route" }, reveals: "Lionel Bellamy signed the foundation's books-and-records demand on the partnership as its officer.", effects: [{ setFlag: "lp_demand" }] }),
  q("bellamy", "Halvard", "bellamy_larchmont", "Where are Halvard's records kept?", [
    "With Larchmont Corporate Services, 410 Madison Avenue, 19th floor. The demand goes there.",
  ], { requires: { flag: "lp_demand" } }),
  q("bellamy", "Records", "bellamy_register", "Walk me through the investment register.", [
    "Managers for the public markets, cash, our community lending, and the partnership interest at $66.1 million. Under it, 62% of Halvard.",
  ], { requires: ev("E033") }),
  q("bellamy", "Records", "bellamy_k1", "Why did the general partner send only one K-1?", [
    "We asked for every underlying K-1 for the tax filing. That's the only one they sent.",
  ], { requires: ev("E034") }),

  // =====================================================================
  // Victoria Lane: events director
  // =====================================================================
  q("lane", "Introductions", "lane_who", "What do you do for the foundation?", [
    "I'm the director of events. The gala was mine to run.",
  ]),
  q("lane", "The suite", "lane_found", "How did you find him?", [
    "Mrs. Ogden asked me at five past ten where his meeting was. I went up and opened Suite C with my card at 10:12.",
    "He was on the carpet by the credenza. I knew before I reached him.",
  ], { effects: [tl("10:12 PM (Thu 12/20)", "Victoria Lane opens Suite C and finds Nathaniel.", "Victoria Lane")] }),
  q("lane", "The booking", "lane_booking", "Who booked the room for Nathaniel's meeting?", [
    "Ms. Marchetti asked me on Wednesday to book the Library at 10:15 for Dr. Lockhart and Mr. Ogden.",
    "At 6:05 on Thursday she moved it to Suite C at 9:30, bar for two, no staff after setup, 'at Dr. Lockhart's request.' She took five blank note cards. Here's the change log.",
  ], {
    reveals: "Victoria Lane handed over the banquet event order and change log: Marchetti moved the meeting from the Library at 10:15 PM to Suite C at 9:30 PM at 6:05 PM on Thursday, and took five blank note cards.",
    effects: [{ giveEvidence: "E006" }, tl("6:05 PM (Thu 12/20)", "Marchetti moves the meeting from the Library to Suite C at 9:30 PM and takes five blank note cards.", "Banquet change log")],
    volunteer: { near: "room booking booked booking meeting library suite reserved reservation" },
  }),
  q("lane", "The booking", "lane_doubt", "How could Dr. Lockhart be in Suite C at 9:40?", [
    "That's what I asked. She was speaking from 9:30 to 9:50. Ms. Marchetti said, 'She'll come up after.'",
  ]),
  q("lane", "People", "lane_mendes", "Who served table 4?", [
    "The banquet captain told me it was Olivia Mendes.",
  ]),
  q("lane", "People", "lane_knox", "When did you see the security team?", [
    "Mr. Knox's people came in about half past five. I saw him in the ballroom at dinner.",
    "Not during the remarks. But I was watching the stage.",
  ]),
  q("lane", "The evening", "lane_schedule", "What was the schedule for the evening?", [
    "Reception at 6:30, dinner at 7:30, Dr. Lockhart's remarks from 9:30 to 9:52, then the auction. We stopped it at 10:20.",
  ]),
  q("lane", "The suite", "lane_suite", "How was Suite C set up?", [
    "Banquet set it at 9:20. A decanter of Scotch, two glasses, napkins. No staff entry after setup.",
  ]),
  q("lane", "People", "lane_lockhart", "Where was Dr. Lockhart during the evening?", [
    "On stage from 9:30, then at the front for the auction. I went straight to her afterward.",
  ]),
  q("lane", "People", "lane_marchetti", "How did Elena Marchetti seem tonight?", [
    "Calm. She's always calm.",
  ]),
  q("lane", "The suite", "lane_key", "Who has keys to Suite C?", [
    "My events card, the banquet cards and hotel security. From inside it opens with no card at all.",
  ]),
  q("lane", "The suite", "lane_scene", "What did you see in the room?", [
    "A chair was overturned. His wallet was by the door. I backed out and ran for security.",
  ]),
  q("lane", "The booking", "lane_card", "The card in Nathaniel's pocket was a gala note card.", [
    "Those are ours. Five blank ones went to Ms. Marchetti at 6:06. It's in the log.",
  ], { requires: ev("E001") }),

  // =====================================================================
  // James Porter: hotel security
  // =====================================================================
  q("porter", "Introductions", "porter_who", "Who are you?", [
    "James Porter, security supervisor here. Doors, cameras, credentials. My department.",
  ]),
  q("porter", "The doors", "porter_access", "Who went through the mezzanine doors on Thursday night?", [
    "I printed the access report for the police at 11:15 and ran you a copy. Mezzanine and back of house, five to midnight.",
    "Read the Suite C lines. The ones with no name are opened from inside.",
  ], {
    reveals: "James Porter handed over the hotel's door access report for the mezzanine and back of house.",
    effects: [
      { giveEvidence: "E007" },
      tl("9:31 PM (Thu 12/20)", "Credential EVT-SEC-07 opens Suite C.", "Door access report"),
      tl("9:51 PM (Thu 12/20)", "Suite C opened from inside; EVT-SEC-07 opens the corridor staff door.", "Door access report"),
    ],
    volunteer: { near: "door doors access card cards key entry entries badge lock opened suite" },
  }),
  q("porter", "The cameras", "porter_cameras", "What do the corridor cameras show?", [
    "Two cameras. M-1 at the landing, looking down the corridor. M-2 mid-corridor. Here's my log, with stills.",
  ], {
    reveals: "James Porter handed over the corridor camera log for cameras M-1 and M-2.",
    effects: [{ giveEvidence: "E008" }, tl("9:30 PM (Thu 12/20)", "Camera M-1: a man matching the EVT-SEC-07 credential photo enters the conference corridor.", "Camera log")],
    volunteer: { near: "camera cameras video footage cctv surveillance recording" },
  }),
  q("porter", "Contract security", "porter_assignments", "Where were the security contractors posted?", [
    "Knox Protective's post assignments. The sheet on our file. I gave the police a copy Thursday night.",
  ], { reveals: "James Porter handed over Knox Protective's post assignments as on the hotel's file.", effects: [{ giveEvidence: "E021" }] }),
  q("porter", "Contract security", "porter_credential", "Who held credential EVT-SEC-07?", [
    "Knox Protective. Gabriel Knox. Counsel for the client asked for mezzanine access, the night manager signed.",
    "Here's the record.",
  ], { reveals: "Credential EVT-SEC-07 was Gabriel Knox's, issued with mezzanine access at the request of the client's counsel.", effects: [{ giveEvidence: "E022" }] }),
  q("porter", "The scene", "porter_first", "What did hotel security first think happened?", [
    "A fall, or a robbery. A man that age, a glass of Scotch, the wallet on the floor.",
  ]),
  q("porter", "The doors", "porter_staffdoor", "Where does the staff door at the end of the corridor go?", [
    "To the service corridor, service elevator 3 and Loading Dock B. The vendor lot's out on East 52nd.",
  ]),
  q("porter", "The doors", "porter_lock", "How do the suite doors work?", [
    "They lock on closing. From inside they open with no card, and the system records no name.",
  ]),
  q("porter", "The cameras", "porter_m2", "Why was camera M-2 facing the window bay?", [
    "I'd have to check the work log.",
  ], { variants: [{ requires: { flag: "assignment_changed" }, reply: ["Officer Albee turned it at 6:10, at Mr. Knox's request. 'Principal privacy.' It's in the work log.", "Suite C's door was out of frame from then on."] }] }),
  q("porter", "Contract security", "porter_report", "What did you find in the emails?", [
    "I wrote it up for the general manager and Det. Caruso. The credential, the camera, and the sheet.",
    "The sheet on our file was replaced at 11:40 PM by a 'corrected version' from Marchetti Law Group. I gave the police the replacement on Thursday night. That's on me.",
  ], {
    requires: { flag: "assignment_changed" },
    reveals: "James Porter handed over his security report: the credential, the turned camera, and the assignment sheet replaced at 11:40 PM.",
    effects: [{ giveEvidence: "E030" }, tl("11:40 PM (Thu 12/20)", "Marchetti Law Group emails hotel security a 'corrected' post assignment sheet.", "James Porter's report")],
    volunteer: { after: 0 },
  }),
  q("porter", "Contract security", "porter_knox", "What did you make of Gabriel Knox?", [
    "Professional. Counsel vouched for him. I didn't think twice.",
  ], { requires: knoxKnown }),
  q("porter", "Contract security", "porter_staffing", "Knox's own staffing sheet has him floating the mezzanine.", [
    "That matches the version his firm emailed at 2:04. Not the one on my file.",
  ], { requires: ev("E023") }),
  q("porter", "The doors", "porter_dock", "Who keeps the log at the loading dock?", [
    "Officer Delacroix, on the desk at Loading Dock B. The clipboard's down there.",
  ]),

  // =====================================================================
  // Olivia Mendes: banquet server
  // =====================================================================
  q("mendes", "Introductions", "mendes_who", "What do you do here?", [
    "I'm Olivia. Banquet server. I worked tables one to six on Thursday.",
  ]),
  q("mendes", "The card", "mendes_card", "Did you take a card to table 4?", [
    "About 9:24. One of the security men gave it to me at the service door. For table four, Mr. Ogden, from Dr. Lockhart.",
    "I took it to him. He read it and thanked me.",
  ], { reveals: "Olivia Mendes took a card to Nathaniel at about 9:24 PM; a security man gave it to her at the service door, 'from Dr. Lockhart.'" }),
  q("mendes", "The mezzanine", "mendes_mezzanine", "Were you on the mezzanine during the remarks?", [
    "Yes. At the pantry door, with a tray, about 9:36. Mr. Ogden walked into the conference corridor with a brown briefcase.",
    "There's more. I'm not supposed to be where I was.",
  ], { reveals: "Olivia saw Nathaniel enter the conference corridor with a brown briefcase at about 9:36 PM.", volunteer: { near: "mezzanine upstairs corridor conference stairs pantry" } }),
  q("mendes", "The mezzanine", "mendes_statement", "Tell me everything you saw.", [
    "About 9:52 I cut through the service corridor, which we're not supposed to do. The same security man came through the staff door carrying a brown leather briefcase with brass corners. He went to service elevator 3.",
    "Security doesn't carry briefcases. That's why I remember. I gave Det. Caruso a statement and kept a copy.",
  ], {
    requires: mendesReady,
    reveals: "Olivia Mendes handed over her statement: at about 9:52 PM the security man who gave her the card came through the staff door carrying a brown briefcase with brass corners.",
    effects: [{ giveEvidence: "E029" }, tl("9:52 PM (Thu 12/20)", "Olivia Mendes sees the security man carrying a brown briefcase to service elevator 3.", "Olivia Mendes")],
    volunteer: { after: 1 },
  }),
  q("mendes", "About her", "mendes_job", "Are you worried about your job?", [
    "Servers aren't supposed to cut through the mezzanine corridor. I did. I need this job.",
  ]),
  q("mendes", "The card", "mendes_ogden", "What was Mr. Ogden like?", [
    "Polite. He thanked me. He kept the briefcase by his chair all through dinner.",
  ]),
  q("mendes", "The mezzanine", "mendes_elevator", "Where does service elevator 3 go?", [
    "Down to B1. The dock level.",
  ]),
  q("mendes", "The card", "mendes_man", "Describe the security man.", [
    "Tall. Shaved head. An earpiece with the coil. Dark suit.",
  ], { requires: ev("E029") }),
  q("mendes", "The card", "mendes_still", "Is this the man in the camera still?", [
    "That's him. The same man.",
  ], { requires: ev("E008") }),

  // =====================================================================
  // Lawrence Abernathy: trusts lawyer, by telephone
  // =====================================================================
  q("abernathy", "Introductions", "abernathy_who", "Who am I speaking to?", [
    "Lawrence Abernathy. Trusts and private funds, and I teach at NYU Law. What can I do for you?",
  ]),
  q("abernathy", "Nathaniel", "abernathy_lunch", "What did Nathaniel ask you on December 17?", [
    "He bought me lunch and asked what a trust protector can do. I told him: anything the instrument says. That's the point of them.",
    "He asked whether control proves anything. I said it proves control.",
  ], { reveals: "Abernathy says Nathaniel asked him on December 17 what a trust protector can do: 'anything the instrument says.'", effects: [tl("Mon 12/17", "Nathaniel lunches with Lawrence Abernathy about protector powers.", "Lawrence Abernathy")] }),
  q("abernathy", "The law", "abernathy_protector", "What is a trust protector?", [
    "Someone the trust instrument gives powers over the trustees. To direct them, remove them, veto things.",
    "How much power depends entirely on the instrument.",
  ]),
  q("abernathy", "The law", "abernathy_partnership", "How does a limited partnership work?", [
    "Limited partners put in the money. The general partner runs it. The limited partners usually have no say in the running.",
  ]),
  q("abernathy", "The law", "abernathy_nominee", "What is a nominee holder?", [
    "A company that holds an interest in its own name for somebody else. The somebody else stays out of the record.",
  ]),
  q("abernathy", "The law", "abernathy_certification", "What is a beneficial ownership certification?", [
    "A bank form. It says who owns a quarter or more of a company and one person who controls it. It's only as honest as whoever signs it.",
  ]),
  q("abernathy", "The law", "abernathy_classb", "What are Class A and Class B units?", [
    "You can split a company's profits from its votes. Class A carries the money, Class B carries the say. Whoever holds the B units runs the company.",
  ]),
  q("abernathy", "The law", "abernathy_control", "Does control prove a crime?", [
    "Control is not a crime, and it isn't proof of one.",
    "If you want to say someone ordered something, you need a record of the order.",
  ], { variants: [{ requires: lockhartNamed, reply: ["This shows control. Control is not a crime, and it isn't proof of one.", "If you want to say she ordered something, you need a record of her ordering it."] }] }),
  q("abernathy", "The records", "abernathy_lp", "Can the foundation see the partnership's records without counsel?", [
    "Yes. A limited partner in a Delaware partnership can inspect the partnership's books and records on a written demand, for a proper purpose. The foundation is a limited partner, and its officer can sign the demand.",
    "Counsel's privilege covers counsel's advice. It doesn't cover the partnership's own records.",
  ], { requires: re06, reveals: "Abernathy says the foundation, as a limited partner, can demand the partnership's books and records, signed by its officer; privilege does not cover the partnership's own records.", effects: [{ setFlag: "lp_route" }], volunteer: { after: 0 } }),
  q("abernathy", "The records", "abernathy_crossref", "Can you put the ownership on one page?", [
    "I already have. Not legal advice; a reading of the documents. It's on its way.",
    "Read the last paragraph twice. It says what these papers show and what they don't.",
  ], { requires: { all: [{ deduction: "D12" }, { deduction: "D13" }] }, reveals: "Lawrence Abernathy sent his one-page cross-reference of Meridian's ownership.", effects: [{ giveEvidence: "E041" }] }),
  q("abernathy", "The records", "abernathy_instrument", "What does the trust protector authorization mean?", [
    "Article 4 lets the protector direct every vote the trust holds, and remove any trustee. Article 9 keeps that from the foundation's board.",
    "Unusual. Not unlawful on its face.",
  ], { requires: ev("E035") }),
  q("abernathy", "The records", "abernathy_rights", "What does the Class B Rights Agreement allow?", [
    "The 2014 amendment lets the Class B holder suspend, assign or terminate any division or affiliate on three days' notice. That's an off switch.",
  ], { requires: ev("E039") }),
  q("abernathy", "The records", "abernathy_letters", "What do Dr. Lockhart's protector letters show?", [
    "That she used the protector's power, in 2014 and in September.",
    "They don't show what she knew about anything else.",
  ], { requires: ev("E040") }),
  q("abernathy", "The records", "abernathy_architect", "What does a matter called ARCHITECT tell us?", [
    "That counsel had a client she called that. It doesn't tell you who.",
  ], { requires: ev("E046") }),

  // =====================================================================
  // Det. Anthony Caruso: the police; no limit
  // =====================================================================
  q("caruso", "The case", "caruso_case", "Where does the investigation stand?", [
    "Hotel security wrote it up as a fall or a robbery. I don't buy it.",
    "Ask for the report. My note's at the bottom.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D01" }, reply: ["The ME says homicide. One blow. Now I want the man who walked into that room."] },
      { requires: { deduction: "D05" }, reply: ["Knox's story doesn't hold. I'm pulling his vehicle."] },
      { requires: { flag: "briefcase_recovered" }, reply: ["The briefcase is in my property room with the bookend inside it. Now it's about who sent him up there."] },
      { requires: { flag: "marchetti_warrant" }, reply: ["The warrant on the law firm is executed. Read what's in her files before you tell me what it means."] },
    ],
  }),
  q("caruso", "Reports", "caruso_report", "Can I see the police report?", [
    "Here. Complaint report and the property list. 911 at 10:14, EMS pronounced at 10:29.",
    "Read my note at the bottom.",
  ], {
    reveals: "Det. Caruso handed over the complaint report and property list.",
    effects: [{ giveEvidence: "E001" }, tl("10:14 PM (Thu 12/20)", "911 call from the Belgrave Grand: a man unconscious in Conference Suite C.", "Complaint report")],
    volunteer: { after: 1 },
  }),
  q("caruso", "Reports", "caruso_photos", "Can I see the scene photographs?", [
    "Crime Scene Unit. Four that matter. Look at the credenza in eleven and the tray in seven.",
  ], { reveals: "Det. Caruso handed over the Suite C photographs.", effects: [{ giveEvidence: "E002" }] }),
  q("caruso", "Reports", "caruso_me", "What did the medical examiner find?", [
    "Dr. Raman did the post first thing this morning. Here's her summary.",
    "Read it yourself. I'll tell you she wrote 'homicide' at the bottom.",
  ], { requires: { visited: "suite" }, reveals: "Det. Caruso handed over the medical examiner's summary.", effects: [{ giveEvidence: "E003" }] }),
  q("caruso", "The case", "caruso_robbery", "Was this a robbery?", [
    "A robber who leaves a gold watch on the wrist and takes a briefcase.",
    "You tell me.",
  ]),
  q("caruso", "Lab", "caruso_glass", "Can you send the whiskey glass to the lab?", [
    "The tumbler, the one on the tray and the decanter. Toxicology and prints. I'll send you the report when it's back.",
  ], { requires: { inspected: "suite_glass" }, reveals: "Det. Caruso sent the whiskey glass and the decanter to the lab.", effects: [{ startLab: "glass" }, { setFlag: "glass_requested" }] }),
  q("caruso", "The briefcase", "caruso_bookend", "Can you send the bookend and the briefcase to the lab?", [
    "Already in a bag with your name on the request. Biology and latents. You'll have the report when they're done.",
  ], { requires: ev("E031"), reveals: "Det. Caruso sent the bookend and the briefcase to the police laboratory.", effects: [{ startLab: "bookend" }, { setFlag: "bookend_requested" }] }),
  q("caruso", "Lab", "caruso_lab", "Are the test results back yet?", ["Nothing pending. Give me something to send."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "glass" }, reply: ["The glass is at the lab. You'll get the report when it's back."] },
      { requires: { labReady: "glass" }, reply: ["The glass report's in. Read the last line. It says less than people want it to."] },
      { requires: { labStarted: "bookend" }, reply: ["The bookend and the briefcase are at the lab. I won't guess at what they'll say."] },
      { requires: { labReady: "bookend" }, reply: ["The bookend report's in. Read the conclusion carefully, both halves of it."] },
    ],
  }),
  q("caruso", "People", "caruso_knox", "What did Gabriel Knox tell the police?", [
    "He told Officer Ferrante at 11:30 he was at ballroom east, stage side, from 9:15 to 10:30. Didn't leave the ballroom. Saw nothing on the mezzanine.",
  ], { requires: knoxKnown, effects: [tl("11:30 PM (Thu 12/20)", "Knox tells Ptl. Ferrante he was at ballroom east, stage side, 9:15 to 10:30 PM.", "Det. Caruso")] }),
  q("caruso", "People", "caruso_jfk", "What happened with Knox at JFK?", [
    "One-way to Panama City, booked last night. Port Authority held him at the gate. His phone's with Digital Forensics.",
  ], { requires: { flag: "knox_held" } }),
  q("caruso", "Records", "caruso_phone", "What's on Knox's phone?", [
    "Digital Forensics finished the extraction. His messages and calls with a contact saved as 'EM.' Here.",
    "Look up whose cell that is. I already did.",
  ], { requires: re07Done, reveals: "Det. Caruso handed over the extraction of Knox's phone: his messages and calls with Elena Marchetti.", effects: [{ giveEvidence: "E026" }], volunteer: { after: 0 } }),
  q("caruso", "Money", "caruso_stratford", "Can you get the bank records behind the Stratford wire?", [
    "Done. I subpoenaed the bank the minute you showed me that advice. Here's what came back.",
    "Read my note. Eight days old, one deposit, one withdrawal.",
  ], { requires: ev("E025"), reveals: "Det. Caruso obtained Stratford Risk Consulting's bank records.", effects: [{ giveEvidence: "E028" }] }),
  q("caruso", "The briefcase", "caruso_storage", "What did you find in Knox's storage unit?", [
    "The briefcase, with the bookend inside it, wrapped in a hotel napkin. And two cartons of radio batteries. Still in the plastic.",
  ], { requires: { flag: "briefcase_recovered" } }),
  q("caruso", "Records", "caruso_subpoena", "Can you subpoena Halvard's records?", [
    "With what you've given me on Ms. Marchetti, yes. I'll serve Larchmont myself.",
  ], { requires: { all: [re06, { deduction: "D08" }] }, reveals: "Det. Caruso will subpoena Halvard's records at Larchmont Corporate Services.", effects: [{ setFlag: "subpoena_halvard" }] }),
  q("caruso", "Records", "caruso_warrant", "What about Marchetti's office?", [
    "We have the warrant. Her desk and her files are open to you. Gloves on.",
  ], { requires: { flag: "marchetti_warrant" } }),
  q("caruso", "People", "caruso_lockhart", "What do you make of Dr. Lockhart?", [
    "She's been very cooperative. Very.",
  ]),
  q("caruso", "People", "caruso_marchetti", "What do you make of Elena Marchetti?", [
    "The foundation's lawyer. She's been at my elbow all night.",
  ], { variants: [{ requires: { deduction: "D08" }, reply: ["She told a contractor which room and when. What she told him to do there is the question."] }] }),
  q("caruso", "The case", "caruso_hotel", "Who has the hotel's records for the mezzanine?", [
    "James Porter in hotel security. The doors, the cameras, the credentials. He's in the security office off the lobby.",
  ]),
  q("caruso", "The briefcase", "caruso_briefcase", "Mrs. Ogden reported his briefcase missing.", [
    "She did. Brown leather, brass corners. A man who takes a briefcase and leaves a gold watch knew what he came for.",
  ], { requires: ev("E010") }),

  // =====================================================================
  // Claire Donovan: by telephone, after RE09
  // =====================================================================
  q("donovan", "Introductions", "donovan_who", "Why did you call?", [
    "Mr. Bennett told me what Mr. Ogden found. I used to work in Meridian's records center. I think I can help, a little.",
  ]),
  q("donovan", "Clearwater", "donovan_clearwater", "Tell me about your work for Clearwater.", [
    "I copied records from the archive for Miriam Castell. She said they were what the investigators needed next.",
  ]),
  q("donovan", "Clearwater", "donovan_register", "Did you keep a record of what you copied?", [
    "My own register. Every record, every date. I didn't trust anyone else to keep one.",
  ]),
  q("donovan", "People", "donovan_lockhart", "Have you met Dr. Lockhart?", [
    "Once. Clearwater's donor breakfast, in October. She asked what I did and said something kind about record keepers. She never mentioned Meridian.",
    "I thought she was being polite.",
  ]),
  q("donovan", "About her", "donovan_safe", "Are you safe now?", [
    "Yes. I was found on December 14. I'm somewhere the agents chose.",
  ]),
  q("donovan", "The dates", "donovan_notes", "Can you compare your register with Nathaniel's table?", [
    "I already have. I typed it up. I'll email it to you now.",
    "I can only speak to my own part.",
  ], { requires: { all: [{ event: "RE09" }, ev("E043")] }, reveals: "Claire Donovan sent her notes comparing her copy register with Nathaniel's exposure comparison.", effects: [{ giveEvidence: "E044" }], volunteer: { after: 0 } }),
  q("donovan", "The dates", "donovan_pattern", "What do you make of the dates?", [
    "Twice Halvard moved before I was even asked. Whoever was telling Miriam what to ask me for knew what Halvard was going to do. Or was Halvard.",
    "I have no proof of anything beyond my own dates. I may be wrong.",
  ], { requires: ev("E044") }),
  q("donovan", "Clearwater", "donovan_castell", "Who told Miriam what to ask you for?", [
    "I never knew. She always said 'the investigators.'",
  ]),
  q("donovan", "The dates", "donovan_architect", "Have you heard of someone called the Architect?", [
    "Never, not at Meridian. I don't know who it is, and I won't guess about people.",
  ], { requires: ev("E046") }),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of the file?", [
    "Forty years of this. A robber who leaves a gold watch and takes a briefcase isn't a robber. He's a courier.",
    "Find out what was in the briefcase and you'll find out who sent for it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D10" }, reply: ["Now you know what Ogden was working on. Follow the paper up, one layer at a time."] },
      { requires: { deduction: "D16" }, reply: ["The foundation's money and Meridian's votes, same chain. Paper tells you who holds it. It doesn't tell you who gave the orders."] },
    ],
  }),
  q("bennett", "Records", "bennett_meridian", "Can you pull the records on Meridian Advisory Group?", [
    "Already have. Delaware formation, 2007, and the D.C. registration. Neither names an owner. That's what they're for.",
    "The lawyer who formed it in 2007 is Elena Marchetti. Same lawyer who certifies Halvard to its bank this year. I'm sending it over.",
  ], { requires: meridianResearch, reveals: "Bennett pulled Meridian's corporate registrations; the lawyer who formed it in 2007 was Elena Marchetti.", effects: [{ giveEvidence: "E016" }] }),
  q("bennett", "Records", "bennett_knox", "Run Gabriel Knox for me.", [
    "Knox Protective Services. Licensed private security, office over a tire shop on Northern Boulevard. Gabriel Knox, no record.",
  ], { requires: knoxKnown }),
  q("bennett", "Records", "bennett_marchetti", "Run Elena Marchetti for me.", [
    "Marchetti Law Group, 600 Lexington Avenue. Trusts, nonprofits, private funds. In good standing. Nothing on her.",
  ]),
  q("bennett", "Records", "bennett_lockhart", "What do the records say about the Lockhart Foundation?", [
    "Private foundation, Fifth Avenue. About $318 million in net assets and grants every year. That's what's on paper.",
  ]),
  q("bennett", "Records", "bennett_halvard", "Run Halvard Holdings for me.", [
    "Delaware LLC, care of Larchmont Corporate Services, 410 Madison. Delaware doesn't list owners. You'll need the company's own papers.",
  ], { requires: halvardKnown }),
  q("bennett", "Records", "bennett_cardinal", "Run Cardinal Point Trust for me.", [
    "Delaware statutory trust. The public filing names a registered agent in Wilmington, not the people.",
  ], { requires: trustKnown }),
  q("bennett", "Records", "bennett_stratford", "Run Stratford Risk Consulting for me.", [
    "Formed December 13, New York Department of State. Organizer Joyce Haddad. Address 600 Lexington Avenue, 27th floor.",
    "Same floor as a law firm you know.",
  ], { requires: ev("E025") }),
  q("bennett", "Records", "bennett_abernathy", "Who was that trusts lawyer?", [
    "Lawrence Abernathy. Trusts and private funds, teaches at NYU. Ogden had lunch with him on the 17th. He'll take your call.",
  ], { requires: re06 }),
  q("bennett", "Records", "bennett_ogden", "Run Nathaniel Ogden for me.", [
    "No record. Ogden Fiduciary Partners, 1185 Sixth Avenue. Thirty years in the business, not a complaint.",
  ]),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [{ requires: { flag: "knox_held" }, reply: ["Caruso's got Knox in a room. Let him sweat. You keep reading."] }],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Lockhart
  r("lockhart", "E001", ["'With Dr. Lockhart's compliments.' I didn't write that.", "People do use my name."]),
  r("lockhart", "E006", ["'At Dr. Lockhart's request.' I asked Elena to find us a room. That's all I asked."]),
  r("lockhart", "E019", ["'Elena will find us a room.' Yes. I wrote that."]),
  r("lockhart", "E033", ["Our register. I sent it to you myself. We have nothing to hide from you."]),
  r("lockhart", "E035", ["A safeguard, for the foundation. I've used it rarely."]),
  r("lockhart", "E040", ["My letters. I asked to be kept informed."]),
  r("lockhart", "E042", ["The 2009 minutes. I disclosed, and I left the room. It's all there."]),
  r("lockhart", "E043", ["Nathaniel's table. Careful work, as always. It tells you what Halvard did."]),
  r("lockhart", "E046", ["I have no idea what that means."]),
  r("lockhart", "E048", ["He was going to give me this. I'd like to think I'd have said yes."]),
  // Marchetti
  r("marchetti", "E006", ["Victoria keeps a very thorough log."]),
  r("marchetti", "E027", ["An engagement letter. Lawyers engage people."]),
  r("marchetti", "E026", ["I won't discuss privileged communications."]),
  r("marchetti", "E028", ["I won't discuss my firm's payments."]),
  r("marchetti", "E030", ["A hotel's paperwork. Not mine."]),
  r("marchetti", "E036", ["My opinion. It's been right for nine years."]),
  r("marchetti", "E045", ["Notes of a client call. The client is privileged. So is the matter."]),
  r("marchetti", "E046", ["The client is privileged. So is the matter."]),
  // Knox
  r("knox", "E008", ["Lots of guys in suits with earpieces."]),
  r("knox", "E021", ["That's the sheet. Ballroom east, stage side."]),
  r("knox", "E022", ["Counsel wanted the VIP rooms covered. Standard."]),
  r("knox", "E023", ["Wednesday's plan. Plans change."]),
  r("knox", "E024", ["Radio batteries."]),
  r("knox", "E029", ["The waitress is confused."]),
  r("knox", "E025", ["Incident response."]),
  r("knox", "E027", ["Counsel hired us."]),
  r("knox", "E026", ["Counsel hired us. I'm not discussing it."]),
  r("knox", "E032", ["I never opened that briefcase."]),
  // Claudia
  r("claudia", "E001", ["His watch. They left his watch. He'd never have handed over the briefcase, not for anything."]),
  r("claudia", "E010", ["Every word of it is true."]),
  r("claudia", "E019", ["'Be fair.' That was him. He wanted to ask her before he told anyone."]),
  r("claudia", "E031", ["N.H.O. I had that plate engraved myself."]),
  r("claudia", "E029", ["Olivia. That's the girl who brought the card."]),
  // Wexler
  r("wexler", "E011", ["His pads. He wrote everything by hand first."]),
  r("wexler", "E012", ["He drew that on a Saturday. He wouldn't let me photograph it."]),
  r("wexler", "E019", ["'S.W. can open them.' That's me. He meant the drive."]),
  r("wexler", "E020", ["That's the drive. I know the passphrase."]),
  r("wexler", "E043", ["I'll tell you what it shows. Not what it means about anyone."]),
  // Bellamy
  r("bellamy", "E015", ["Note 7. One sentence. I signed off on that sentence every year."]),
  r("bellamy", "E033", ["My office prepared it. It's accurate, as far as our books go."]),
  r("bellamy", "E035", ["Article 9. The board was never to be told. I was never told."]),
  r("bellamy", "E036", ["'Customary terms.' I took that on trust. I shouldn't have."]),
  r("bellamy", "E037", ["My statement. I stand by it."]),
  // Lane
  r("lane", "E006", ["My log. Read my note at the bottom."]),
  r("lane", "E001", ["That's one of our cards. Five blank ones went to Ms. Marchetti."]),
  r("lane", "E008", ["10:11. That's me. I don't remember running."]),
  // Porter
  r("porter", "E021", ["That's the sheet on our file. I gave it to the police."]),
  r("porter", "E008", ["My log. The 9:30 man matches Knox's credential photo."]),
  r("porter", "E023", ["That's not what's on my file. Let me look at something."]),
  r("porter", "E009", ["Delacroix writes everything down. Good man."]),
  r("porter", "E030", ["My report. I should've caught it Thursday night."]),
  // Mendes
  r("mendes", "E008", ["That's him. The security man."]),
  r("mendes", "E009", ["9:55. That's right after I saw him."]),
  r("mendes", "E029", ["That's what I told the detective. Every word."]),
  // Abernathy
  r("abernathy", "E013", ["'None' in Section I, and the lawyer as the control person. Lawful on its face. Look at what it leaves out."]),
  r("abernathy", "E014", ["The founding member's signature page isn't in the binder. I'd want to know why."]),
  r("abernathy", "E034", ["Class B: fifteen percent of the profits, all of the votes."]),
  r("abernathy", "E035", ["Article 4 and Article 9. That's the whole structure, in two paragraphs."]),
  r("abernathy", "E039", ["Section 2.6. An off switch for every affiliate."]),
  r("abernathy", "E040", ["She used the power. That's what these show."]),
  r("abernathy", "E041", ["My page. Read the last paragraph twice."]),
  r("abernathy", "E046", ["A name for a client. Not the client."]),
  // Caruso
  r("caruso", "E004", ["One bookend. Square edges, seven pounds. And its twin is missing. I want that twin."]),
  r("caruso", "E006", ["Somebody moved that meeting to where nobody would see it."]),
  r("caruso", "E008", ["Nobody back out past M-1. Then they went out the other end."]),
  r("caruso", "E009", ["'In a hurry.' Delacroix earned his paycheck."]),
  r("caruso", "E010", ["The briefcase. That's what he came for."]),
  r("caruso", "E021", ["That's the sheet Porter gave me Thursday night."]),
  r("caruso", "E023", ["His own handwriting. Not the sheet he gave the hotel."]),
  r("caruso", "E025", ["Forty thousand the morning after. I'll get the bank."]),
  r("caruso", "E029", ["Security doesn't carry briefcases. She's right."]),
  r("caruso", "E030", ["Replaced at 11:40. After the body. Porter's an honest man."]),
  r("caruso", "E031", ["Radio batteries. Still in the plastic."]),
  r("caruso", "E032", ["The bookend is the weapon. The lab can't tell us whose hand."]),
  r("caruso", "E045", ["'Nothing in writing.' Except this."]),
  r("caruso", "E046", ["The index never says who. I read it three times."]),
  // Donovan
  r("donovan", "E043", ["Those are my dates. Some of them are before my dates."]),
  r("donovan", "E044", ["My notes. I can only speak to my own part."]),
  // Bennett
  r("bennett", "E001", ["Left the watch, took the briefcase. That's a retrieval, not a robbery."]),
  r("bennett", "E016", ["Delaware won't tell you who owns an LLC. That's what it's for."]),
  r("bennett", "E028", ["A company eight days old with one deposit and one withdrawal isn't a company. It's a pipe."]),
  r("bennett", "E046", ["A name in an index isn't an order. Remember that when you write it up."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "c_knox_post",
    characterId: "knox",
    title: "Gabriel Knox: at the stage all evening",
    text: "Gabriel Knox says he was posted at ballroom east, stage side, from 9:15 to 10:30 PM and never went to the mezzanine. The hotel's corridor camera log and his firm's own staffing sheet each put him on the mezzanine in that hour: camera M-1 logs a man matching his credential photograph entering the conference corridor at 9:30:38 PM, and the staffing sheet assigns him to 'float mezz / VIP' from 9:00 to 10:00 PM.",
    when: { all: [{ asked: "knox_where" }, { any: [ev("E008"), ev("E023")] }] },
  },
  {
    id: "c_knox_left",
    characterId: "knox",
    title: "Gabriel Knox: never left his post",
    text: "Gabriel Knox says he stayed at his post in the ballroom until 10:30 PM. His company's Tahoe left the hotel's vendor lot at 9:58 PM, passed through the Queens-Midtown Tunnel toward Queens at 10:09 PM, entered Bridgeview Self Storage at 10:21 PM and was back in the vendor lot at 10:51 PM.",
    when: { all: [{ asked: "knox_where" }, ev("E024")] },
  },
  {
    id: "c_knox_briefcase",
    characterId: "knox",
    title: "Gabriel Knox: nowhere near the mezzanine",
    text: "Gabriel Knox told the police he did not leave the ballroom and saw nothing on the mezzanine. Olivia Mendes states that at about 9:52 PM a security man matching his description came through the conference corridor's staff door carrying a brown leather briefcase with brass corners and went to service elevator 3.",
    when: { all: [ev("E029"), { any: [{ asked: "knox_where" }, ev("E001")] }] },
  },
  {
    id: "c_marchetti_room",
    characterId: "marchetti",
    title: "Elena Marchetti: a quieter room",
    text: "Elena Marchetti says she may have suggested a quieter room because the remarks would run long, and asked Victoria Lane to send a card. The banquet change log records that at 6:05 PM she canceled the Library for 10:15 PM and booked Conference Suite C from 9:30 PM with no staff entry after setup, 'at Dr. Lockhart's request,' and that five blank note cards went to her at 6:06 PM.",
    when: { all: [{ asked: "marchetti_room" }, ev("E006")] },
  },
  {
    id: "c_marchetti_engagement",
    characterId: "marchetti",
    title: "Elena Marchetti: event security",
    text: "Elena Marchetti described Knox Protective as a reputable firm she uses for sensitive events and principal protection. Her firm's engagement letter of December 12 also engages it for 'such confidential document-security matters relating to the Foundation as counsel may direct orally,' with additional compensation as counsel may determine, and says nothing about those matters is to be put in writing.",
    when: { all: [{ asked: "marchetti_knox" }, ev("E027")] },
  },
  {
    id: "c_marchetti_contact",
    characterId: "marchetti",
    title: "Elena Marchetti: last spoke to Knox on Wednesday",
    text: "Elena Marchetti says she last spoke to Gabriel Knox on Wednesday, about the arrangements. Knox's phone shows her texts to him at 6:02 PM ('Room changed. C, mezz. 9:40.') and 10:01 PM on December 20, his 3-minute call to her at 9:56 PM, her 6-minute call to him at 7:02 AM on December 21 and her text at 9:15 AM, 'Taken care of.'",
    when: { all: [{ asked: "marchetti_knox_contact" }, ev("E026")] },
  },
  {
    id: "c_lockhart_card",
    characterId: "lockhart",
    title: "Dr. Lockhart: the Library at a quarter past ten",
    text: "Dr. Lockhart says she understood she would meet Nathaniel Ogden in the Library after her remarks, at 10:15 PM. The unsigned note card in his jacket, typed 'With Dr. Lockhart's compliments,' sent him to Conference Suite C at 9:40 PM, while she was on stage.",
    when: { all: [{ asked: "lockhart_meeting" }, ev("E001")] },
  },
  {
    id: "c_lockhart_meridian",
    characterId: "lockhart",
    title: "Dr. Lockhart: an investment of an investment",
    text: "Dr. Lockhart described Meridian Advisory Group only as one of Halvard's holdings. The investment committee's minutes of June 23, 2009 record that she organized Meridian in 2007 and that her founder interests in it were contributed to Halvard.",
    when: { all: [{ asked: "lockhart_meridian" }, ev("E042")] },
  },
  {
    id: "c_lockhart_board",
    characterId: "lockhart",
    title: "Dr. Lockhart: one vote of five",
    text: "Dr. Lockhart says the foundation's board and investment committee oversee its investments and that she is one vote of five. The Cardinal Point Trust instrument appoints her trust protector for life, with power to direct every vote of the trust, through the general partner, over the partnership's holdings, and keeps that power confidential from the foundation's board.",
    when: { all: [{ asked: "lockhart_control" }, ev("E035")] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  lockhart_hire: "why did you hire us why blackwood why an investigator why us why bring us in invite invited",
  lockhart_nathaniel: "tell me about nathaniel ogden what was he like your adviser advisor who was he",
  lockhart_meeting: "were you meeting him supposed to meet appointment private word twenty minutes library meeting with nathaniel arranged",
  lockhart_card: "did you send the card note card compliments your name invitation message to him",
  lockhart_remarks: "where were you during your speech on stage alibi remarks 9:30 9:40 at the time when he died when it happened at the moment",
  lockhart_investments: "what does the foundation invest in investments portfolio endowment holdings lockhart endowment partners lep",
  lockhart_meridian: "meridian advisory group connection to meridian involved with meridian your link role at meridian",
  lockhart_marchetti: "elena marchetti your lawyer counsel tell me about elena",
  lockhart_knox: "gabriel knox security man security lead knox protective",
  lockhart_claudia: "claudia ogden his wife do you know claudia",
  lockhart_arrests: "arrests holt rourke kane arrested indicted meridian scandal news",
  lockhart_architect: "architect the architect a. initial code name",
  lockhart_donovan: "claire donovan clearwater breakfast funds clearwater transparency",
  lockhart_envelope: "carroway envelope the invoice you sent martin keller hannah keller tri-county",
  lockhart_control: "who controls the investments the money who decides oversight governance board votes runs who is in charge control",
  lockhart_records: "foundation's records books documents files can i see",
  lockhart_founded: "you founded meridian organized meridian 2007 minutes 2009 recused disclosed started",
  lockhart_protector: "trust protector cardinal point trust protector role your power",
  lockhart_letters: "september 17 letter protector letters keep me informed risk review direction",
  lockhart_structure: "endowment owns halvard majority 62 percent holds",
  lockhart_directs: "direct every vote you control halvard you control meridian",
  lockhart_memo: "nathaniel's memo independent review january 15 his memo to you",
  lockhart_email: "your reply email elena will find us a room wrote back",
  lockhart_exposure: "cut off before arrested exposure comparison halvard acted knew in advance",
  lockhart_index: "marchetti's files message pad matter index architect calls from a.",
  lockhart_theory: "what do you think i concluded my theory suspicion suspect you",
  marchetti_who: "who are you what do you do your firm your role",
  marchetti_nathaniel: "nathaniel ogden what did you think of him opinion of nathaniel",
  marchetti_knox: "why hire knox protective security firm who hired security why knox",
  marchetti_room: "why move the meeting room changed suite c quieter room moved the meeting card",
  marchetti_knox_contact: "when did you last speak talk call knox contact with knox spoken",
  marchetti_opinion: "investment structure set up how does the structure work explain the structure opinion 2009",
  marchetti_evening: "where were you during the remarks speech alibi that evening",
  marchetti_privilege: "governance files halvard files privileged see the files access records",
  marchetti_halvard: "halvard holdings what is halvard",
  marchetti_lockhart: "relationship with dr lockhart evelyn your client",
  marchetti_cardinal: "cardinal point trust what is the trust",
  marchetti_credential: "credential mezzanine access vip rooms badge",
  marchetti_request: "at dr lockhart's request booking log her request",
  marchetti_engagement: "engagement letter document-security matters contract with knox oral instructions",
  marchetti_texts: "your texts room and time told knox text messages",
  marchetti_refused: "not here not to me somewhere safe say nothing 10:01 text",
  marchetti_payment: "40,000 forty thousand stratford risk consulting payment wire paid",
  marchetti_sheet: "corrected assignment sheet 11:40 replaced post sheet",
  marchetti_bellamy: "bellamy route requests through you instructed staff",
  marchetti_trustee: "trustee letters pittsburgh washington baltimore cut off non-renewal",
  marchetti_protector: "dr lockhart protector trust terms article",
  marchetti_binder: "larchmont governance binder corinne rhee november 28 seen the binder",
  marchetti_message: "a. telephone message december 18 who is a. message pad",
  marchetti_index: "architect matter index who is the architect arc",
  knox_who: "who are you what do you do your company your firm",
  knox_where: "where were you during the remarks your post alibi that night speech stationed position",
  knox_ogden: "did you know nathaniel ogden the victim met him",
  knox_credential: "mezzanine credential why access vip badge",
  knox_team: "your team staff your men your crew officers guards on the detail",
  knox_hired: "who hired you client who do you work for employer work job contract",
  knox_mezzanine: "go upstairs mezzanine at all go up there",
  knox_staffing: "staffing sheet float mezz your own sheet clipboard",
  knox_dock: "dock log garment bag case 9:55 loading dock",
  knox_storage: "truck storage unit left the hotel drove queens tunnel tahoe 9:58",
  knox_batteries: "radios charged spares in the truck batteries",
  knox_camera: "camera turned m-2 window bay privacy",
  knox_mendes: "server waitress saw you briefcase carrying 9:52 olivia",
  knox_card: "card note give a server deliver",
  knox_counsel: "elena marchetti counsel instructions told you texts",
  knox_wire: "40,000 forty thousand wire stratford payment money",
  knox_flight: "flight panama jfk leaving country one-way vacation",
  knox_opened: "bookend briefcase storage unit inside weapon",
  knox_unit: "who else access unit code 3c-27",
  claudia_nathaniel: "tell me about your husband nathaniel what was he like",
  claudia_worried: "worried anxious concerned stressed bothering him something wrong",
  claudia_evening: "tell me about the evening tonight dinner the gala his phone",
  claudia_card: "why did he leave the table card note 9:24 she'll see me now when did he leave",
  claudia_looking: "when did you go looking look for him search for him notice missing",
  claudia_briefcase: "briefcase missing bag satchel case what was in it",
  claudia_copies: "copies backup copy of his work kept copies duplicate",
  claudia_wexler: "who did he work with colleague partner simon wexler analyst",
  claudia_lockhart: "do you know dr lockhart evelyn",
  claudia_enemies: "anyone want to hurt him enemies threats",
  claudia_police: "what have the police told you detective caruso",
  claudia_knox: "security men earpieces security guards",
  claudia_marchetti: "elena marchetti the lawyer",
  claudia_memo: "memorandum to file his memo kitchen table",
  claudia_monday: "monday lunch who did he see abernathy lawyer",
  claudia_returned: "briefcase recovered found police have it",
  wexler_who: "who are you what do you do your job",
  wexler_work: "what was nathaniel working on his project the review",
  wexler_scared: "are you all right okay scared afraid nervous your job",
  wexler_lockhart: "dr lockhart did he talk about her",
  wexler_summary: "his research what do you know what did he find halvard findings",
  wexler_copies: "back up backup drive copies passphrase usual place",
  wexler_backup: "open the drive usb backup passphrase unlock print the files",
  wexler_binder: "november 28 larchmont governance binder protector letters",
  wexler_abernathy: "who did he consult lawyer abernathy trust advice",
  wexler_arrests: "december arrests match risk note noticed",
  wexler_memo: "write to dr lockhart email memo independent review",
  wexler_exposure: "exposure comparison spreadsheet what does it show",
  wexler_control: "control summary who controls what does it show",
  bellamy_who: "what do you do your job cfo who are you grants",
  bellamy_halvard: "halvard arrangement what is halvard partnership capital calls",
  bellamy_board: "board vote class b governance board voted",
  bellamy_nathaniel: "what did nathaniel ask for request reports",
  bellamy_route: "what did marchetti tell you elena instructions about nathaniel route requests december 14",
  bellamy_cooperate: "staff told since the gala cooperate visibly release nothing instructions this morning",
  bellamy_statement: "statement written statement will you give",
  bellamy_trust: "trust instrument governing document seen the trust",
  bellamy_archive: "records archive where kept files basement lower level",
  bellamy_lockhart: "dr lockhart like to work for boss",
  bellamy_evening: "where were you during the remarks alibi table",
  bellamy_opinion: "marchetti's opinion 2009 opinion customary terms",
  bellamy_restricted: "marchetti's letter restricted privileged not to release",
  bellamy_demand: "books and records demand limited partner inspect sign the demand inspection",
  bellamy_larchmont: "where are halvard's records kept larchmont address",
  bellamy_register: "investment register walk me through register holdings",
  bellamy_k1: "k-1 tax form only one sent",
  lane_who: "what do you do your job events director who are you",
  lane_found: "how did you find him found the body discovered when did you find",
  lane_booking: "who booked the room booking reservation change log library suite c meeting room moved",
  lane_doubt: "how could dr lockhart be there at 9:40 on stage at the same time",
  lane_mendes: "who served table 4 waiter server waitress table four",
  lane_knox: "security team knox when did you see security arrive",
  lane_schedule: "schedule program timetable run of show agenda order of events",
  lane_suite: "how was suite c set up setup bar scotch glasses",
  lane_lockhart: "where was dr lockhart evelyn during the evening",
  lane_marchetti: "how did marchetti seem elena behavior",
  lane_key: "who has keys key cards access to suite c open the door",
  lane_scene: "what did you see in the room inside scene",
  lane_card: "card in his pocket note card gala card",
  porter_who: "who are you what do you do your job",
  porter_access: "door access report who went through the doors key card log entries mezzanine doors",
  porter_cameras: "cameras video footage cctv surveillance what do the cameras show recording",
  porter_assignments: "security contractors posted posts assignments where were the guards post sheet",
  porter_credential: "credential evt-sec-07 badge who held whose credential pass",
  porter_first: "what did you first think fall robbery initial theory",
  porter_staffdoor: "staff door end of the corridor where does it go service corridor",
  porter_lock: "how do the suite doors work lock card from inside",
  porter_m2: "camera m-2 window bay pointed turned away why facing",
  porter_report: "what did you find emails report discrepancy replaced sheet",
  porter_knox: "what did you make of knox gabriel knox",
  porter_staffing: "knox's staffing sheet float mezzanine his own sheet",
  porter_dock: "loading dock log who keeps delacroix dock b",
  mendes_who: "what do you do your job who are you",
  mendes_card: "did you take a card note to table 4 deliver card mr ogden",
  mendes_mezzanine: "mezzanine upstairs during the remarks pantry corridor see mr ogden",
  mendes_statement: "tell me everything everything you saw what else statement all of it",
  mendes_job: "worried about your job in trouble scared",
  mendes_ogden: "what was mr ogden like nathaniel",
  mendes_elevator: "service elevator 3 where does it go",
  mendes_man: "describe the security man what did he look like",
  mendes_still: "camera still photo is this him recognize",
  abernathy_who: "who are you who am i speaking to what do you do",
  abernathy_lunch: "what did nathaniel ask you december 17 lunch monday",
  abernathy_protector: "what is a trust protector protector mean",
  abernathy_partnership: "how does a limited partnership work general partner limited partners lp",
  abernathy_nominee: "nominee holder what is a nominee brandywine",
  abernathy_certification: "beneficial ownership certification bank form",
  abernathy_classb: "class a class b units voting units",
  abernathy_control: "does control prove a crime is it illegal proof",
  abernathy_lp: "see the partnership's records without counsel inspection rights books and records privilege get around",
  abernathy_crossref: "ownership on one page cross-reference summary put it together",
  abernathy_instrument: "trust protector authorization article 4 article 9 instrument mean",
  abernathy_rights: "class b rights agreement amendment allow 2.6",
  abernathy_letters: "dr lockhart's protector letters what do they show",
  abernathy_architect: "matter called architect what does it tell us",
  caruso_case: "where does the case stand investigation status theory progress",
  caruso_report: "police report complaint report property list can i see the report",
  caruso_photos: "scene photographs photos crime scene pictures",
  caruso_me: "medical examiner autopsy cause of death post mortem how did he die",
  caruso_robbery: "was it a robbery robbed stolen theft wallet cash",
  caruso_glass: "whiskey glass lab test the glass tumbler drink poison decanter",
  caruso_bookend: "send the bookend briefcase to the lab test the bookend fingerprints prints dna blood biology latents analysis weapon examine",
  caruso_lab: "results back yet ready tests came back findings any news from the tests status pending waiting heard word update",
  caruso_knox: "what did knox tell the police knox's statement",
  caruso_jfk: "knox at jfk airport flight held",
  caruso_phone: "knox's phone extraction messages texts calls",
  caruso_stratford: "bank records stratford wire subpoena the bank",
  caruso_storage: "storage unit what did you find warrant",
  caruso_subpoena: "subpoena halvard's records larchmont",
  caruso_warrant: "marchetti's office warrant search her office",
  caruso_lockhart: "dr lockhart what do you make of her evelyn",
  caruso_marchetti: "elena marchetti what do you make of her the lawyer",
  caruso_hotel: "hotel records mezzanine who has doors cameras hotel security",
  caruso_briefcase: "mrs ogden briefcase missing reported",
  donovan_who: "why did you call who are you",
  donovan_clearwater: "work for clearwater miriam castell copied records",
  donovan_register: "record of what you copied register log",
  donovan_lockhart: "have you met dr lockhart evelyn",
  donovan_safe: "are you safe okay rescued",
  donovan_notes: "compare your register with nathaniel's table comparison",
  donovan_pattern: "what do you make of the dates pattern conclusion",
  donovan_castell: "who told miriam what to ask instructions",
  donovan_architect: "architect heard of the architect",
  bennett_case: "what do you make of the file your read what do you think",
  bennett_meridian: "meridian advisory group records registration who owns meridian pull meridian",
  bennett_knox: "run gabriel knox background on knox knox protective",
  bennett_marchetti: "run elena marchetti background on marchetti law group",
  bennett_lockhart: "lockhart foundation records filings",
  bennett_halvard: "run halvard holdings records on halvard",
  bennett_cardinal: "run cardinal point trust records on the trust",
  bennett_stratford: "run stratford risk consulting who formed stratford",
  bennett_abernathy: "trusts lawyer name who was the lawyer abernathy",
  bennett_ogden: "run nathaniel ogden background on ogden",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
