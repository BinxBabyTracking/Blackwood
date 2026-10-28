import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE } from "./interviews";
import { knowledgeFor, PERSONA } from "./knowledge";
import { alive, craneAt, dead } from "./rules";

/*
 * HALLOW001 interviews, written against docs/HALLOW001-timeline.md.
 *
 * Rules for this file: nobody confesses; Lucian Marsh gives his own account,
 * lies included; nobody names the killer; nobody says anything from the
 * "Closing report only" list (the shove in 1998, Marsh waiting at the panel,
 * the blow, what was said in the study, the folder in the port bins). Times,
 * sums and names agree with the timeline. American spelling, no em dashes.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const never: Condition = { not: { always: true } };
const found: Condition = { flag: "josie_found" };
/** Anyone has told the investigators about the stair, or they have found it. */
const stairKnown: Condition = { any: [ev("HE004"), ev("HE021"), { asked: "felix_stair" }, { visited: "servants_stair" }] };
const knows1998: Condition = { any: [ev("HE008"), ev("HE018"), ev("HE034"), ev("HE017"), found] };
const craneArrested: Condition = { flag: "crane_arrested" };
const rumor: Condition = { all: [{ flag: "rumor_intruder" }, { not: found }] };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The dead: in the file and on the board, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "ambrose",
    name: "Ambrose Blackthorn",
    role: "Antiquarian; chairman of the Blackthorn Foundation. The victim",
    portrait: "char.ambrose",
    bio: [
      { text: "Sixty-seven. Antiquarian, of Blackthorn Estate, Harrow Falls. Chairman of the Blackthorn Foundation. Separated from his wife, Constance, since 2012; one son, Felix." },
      { text: "Found dead in his study, behind a bolted door, at 10:23 PM on Halloween 2018, after the house went dark from 10:13 to 10:20." },
      { text: "Meant to tell his guests at 10:30 about Halloween 1998, and to give his attorney the foundation's records and a statement on November 1.", requires: { any: [ev("HE008"), ev("HE031")] } },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },
  {
    id: "annabel",
    name: "Annabel Lisle",
    role: "Seventeen; a foundation archive volunteer, missing since Halloween 1998",
    portrait: "char.annabel",
    known: knows1998,
    bio: [
      { text: "Seventeen in 1998, a junior at Harrow Falls Regional High School and a paid volunteer at the Blackthorn Foundation's archive. Last seen at the foundation's Halloween party at the house on October 31, 1998. Filed as a runaway." },
      { text: "Josie Lisle's older sister.", requires: { talkedTo: "josie" } },
      { text: "Her remains were found in the bricked chamber under the carriage house.", requires: ev("HE025") },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },

  // ---------------------------------------------------------------------
  // Lucian Marsh: moves on his own (adversary.ts)
  // ---------------------------------------------------------------------
  {
    id: "crane",
    name: "Lucian Marsh",
    role: "Treasurer and trustee of the Blackthorn Foundation",
    portrait: "char.crane",
    bio: [
      { text: "Sixty-one. Treasurer and trustee of the Blackthorn Foundation since 1994. Ambrose's partner in Blackthorn & Marsh Antiquities until 2009. Lives in Pittsfield." },
      { text: "Left the dinner table at 10:08 PM, he says to take a call from his Boston office in the conservatory." },
      { text: "Principal of Hollins Ridge Associates, which sold the foundation Ridgeline Road in 1997.", requires: { any: [ev("HE018"), ev("HE019")] } },
      { text: "Arranged the new main switch in the cellar, fitted on October 24.", requires: ev("HE030") },
      { text: "Detained by the State Police at the gatehouse.", requires: craneArrested },
      { text: "Left the estate during the investigation. His whereabouts are unknown.", requires: { flag: "crane_escaped" } },
    ],
    available: { not: { flag: "crane_escaped" } },
    locationId: "dining_room",
    moves: [
      { when: craneAt("library"), locationId: "library" },
      { when: craneAt("conservatory"), locationId: "conservatory" },
      { when: craneAt("wine_cellar"), locationId: "wine_cellar" },
      { when: craneAt("greenhouse"), locationId: "greenhouse" },
      { when: craneAt("gatehouse"), locationId: "gatehouse" },
    ],
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what you want me to say about that.",
    idleLine: "I'll be with the others if you need me.",
    noAnswer: ["I really couldn't tell you.", "That's not something I'd know.", "You'd have to ask someone else."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "Man of sixty, a New England trustee and antiques dealer: smooth, courteous, reasonable, a little weary, used to being the calm one in the room; thinner and more clipped under pressure. Educated Massachusetts American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "courteous", label: "Courteous", requires: { always: true } },
      { id: "careful", label: "Careful", requires: { any: [ev("HE029"), ev("HE028"), ev("HE030")] }, cue: "Lucian Marsh's smile stays where it is. He has started to answer more slowly." },
      { id: "cold", label: "Cold", requires: { deduction: "HD10" }, cue: "Marsh sets down his glass and looks at you without any warmth at all." },
      { id: "refusing", label: "Declining to answer", requires: craneArrested, refuses: "I've asked for my lawyer. Until he's here I have nothing to say to you.", cue: "Marsh sits in the gatehouse office with his hands folded, an officer at the door. He looks past you." },
    ],
  },

  // ---------------------------------------------------------------------
  // The thirteenth guest
  // ---------------------------------------------------------------------
  {
    id: "josie",
    name: "Josie Lisle",
    role: "The woman in the black veil",
    portrait: "char.josie",
    known: found,
    bio: [
      { text: "Twenty-nine. Josephine Lisle, of Pittsfield, a hospital pharmacist. Annabel Lisle's younger sister; she was nine when Annabel disappeared." },
      { text: "Came tonight on an invitation from Ambrose Blackthorn, sent separately, and sat in the thirteenth place." },
      { text: "Hid in the Rose Room in the guest wing after the scream, until she was found.", requires: { talkedTo: "josie" } },
    ],
    available: { all: [found, alive("josie")] },
    deceased: dead("josie"),
    locationId: "guest_wing",
    moves: [{ when: found, locationId: "morning_room" }],
    onBoard: true,
    defaultEvidenceReply: "I don't know what that means. I wish I did.",
    idleLine: "I'll be here. I'm not going anywhere now.",
    noAnswer: ["I don't know.", "I've never heard that.", "I wasn't old enough to know."],
    voice: {
      voiceId: "piTKgcLEGmPE4e6mEKli",
      direction: "Woman of about thirty, a hospital pharmacist: quiet, exact, frightened at first and then very steady; twenty years of grief held under precise sentences. Western Massachusetts American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "frightened", label: "Frightened", requires: { always: true } },
      { id: "steady", label: "Steady", requires: { asked: "josie_file" }, cue: "Josie has taken off her veil and folded it on her knee. Her hands have stopped shaking." },
    ],
  },

  // ---------------------------------------------------------------------
  // The family
  // ---------------------------------------------------------------------
  {
    id: "constance",
    name: "Constance Blackthorn",
    role: "Ambrose's wife, separated",
    portrait: "char.constance",
    bio: [
      { text: "Sixty-three. Married Ambrose in 1979; separated in 2012 and living in Stockbridge. A trustee of the foundation until 2012." },
      { text: "Left the dining room at about 10:05 PM." },
      { text: "Has been seeing Dr. Isaac Penrose for a year.", requires: ev("HE033") },
    ],
    available: { always: true },
    locationId: "conservatory",
    onBoard: true,
    defaultEvidenceReply: "I don't see what that has to do with me.",
    idleLine: "I'd like a little time to myself, please.",
    noAnswer: ["I have no idea.", "Ambrose never told me that sort of thing.", "Ask Lucian. He knew everything Ambrose did."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman in her early sixties, old Berkshires money: cool, dry, sharp-tongued, very composed; brittle when cornered, then quietly candid. Educated New England American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "cool", label: "Cool", requires: { always: true } },
      { id: "candid", label: "Candid", requires: ev("HE033"), cue: "Constance looks at the rain on the glass for a while, then back at you, and stops pretending." },
    ],
  },
  {
    id: "felix",
    name: "Felix Blackthorn",
    role: "Ambrose's son",
    portrait: "char.felix",
    bio: [
      { text: "Thirty-nine. Ambrose's only son. Lives in Boston; between ventures." },
      { text: "Argued with his father about money in the hall at about 9:30 PM. Was first up the stairs with Oscar Wren after the scream, and forced the study door with him." },
      { text: "Owes Callender Bridge Capital $212,000 on a loan secured on his expected inheritance.", requires: ev("HE032") },
    ],
    available: { always: true },
    locationId: "dining_room",
    onBoard: true,
    defaultEvidenceReply: "No idea. Not my department.",
    idleLine: "I'm not going anywhere. Apparently nobody is.",
    noAnswer: ["No idea.", "Dad didn't exactly confide in me.", "You'd have to ask Lucian."],
    voice: {
      voiceId: "TxGEqnHWrfWFTfGW9XjX",
      direction: "Man of about forty, a charming, rattled son of money: quick, defensive, joking when he is scared, grief breaking through. Boston American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "rattled", label: "Rattled", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { any: [ev("HE032"), ev("HE009")] }, cue: "Felix pushes his chair back from the table and crosses his arms." },
    ],
  },

  // ---------------------------------------------------------------------
  // The doctor
  // ---------------------------------------------------------------------
  {
    id: "penrose",
    name: "Dr. Isaac Penrose",
    role: "Family physician; a guest",
    portrait: "char.penrose",
    bio: [
      { text: "Fifty-six. General practitioner in Harrow Falls since 1990; the Blackthorns' doctor. Was at the 1998 party." },
      { text: "Reached Ambrose at 10:24 PM and found no pulse." },
      { text: "Has been seeing Constance Blackthorn for a year.", requires: ev("HE033") },
    ],
    available: { always: true },
    locationId: "conservatory",
    onBoard: true,
    defaultEvidenceReply: "I'm a doctor, not a detective, I'm afraid.",
    idleLine: "I'll be here if anyone needs me.",
    noAnswer: ["I couldn't say.", "That's outside my knowledge.", "I really don't know."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man in his mid fifties, a small-town family doctor: calm, kind, precise with medical facts, evasive and embarrassed about his private life. New England American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "embarrassed", label: "Embarrassed", requires: ev("HE033"), cue: "Dr. Penrose takes off his glasses and cleans them for much longer than they need." },
    ],
  },

  // ---------------------------------------------------------------------
  // The old staff and the 1998 witnesses
  // ---------------------------------------------------------------------
  {
    id: "harriet",
    name: "Harriet Lowell",
    role: "The foundation's accountant, 1990 to 2001",
    portrait: "char.harriet",
    bio: [
      { text: "Fifty-eight. Kept the Blackthorn Foundation's books from 1990 to 2001; now treasurer of the Harrow Falls library friends." },
      { text: "Supervised the archive volunteers in 1998, Annabel Lisle among them.", requires: { asked: "harriet_1998" } },
    ],
    available: alive("harriet"),
    deceased: dead("harriet"),
    locationId: "library",
    onBoard: true,
    defaultEvidenceReply: "I'd want my reading glasses for that, dear, and even then I couldn't tell you.",
    idleLine: "I'll be here with my book. I can't read a word of it.",
    noAnswer: ["I don't know, dear.", "That was after my time.", "I never knew that."],
    voice: {
      voiceId: "pMsXgVXv3BLzUgSXRplE",
      direction: "Woman in her late fifties, a retired bookkeeper: gentle, precise, a little prim, guilt held in for twenty years; firm once she has decided. Western Massachusetts American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "resolved", label: "Resolved", requires: { asked: "harriet_ledger" }, cue: "Harriet has put her book away. She holds her handbag on her knees with both hands." },
    ],
  },
  {
    id: "amos",
    name: "Amos Duffy",
    role: "Caretaker of the estate, 1984 to 2014",
    portrait: "char.amos",
    bio: [
      { text: "Sixty-five. Caretaker of Blackthorn Estate for thirty years; retired to a cottage on Hollins Road with his wife, Bridget." },
      { text: "Went down to the cellar in the dark and turned the power back on at 10:20 PM." },
      { text: "Screwed shut the hidden stair in the study, on Ambrose's orders, in 1999.", requires: { asked: "amos_passage" } },
    ],
    available: alive("amos"),
    deceased: dead("amos"),
    locationId: "entrance_hall",
    onBoard: true,
    defaultEvidenceReply: "Can't help you with that.",
    idleLine: "I'll be by the fire.",
    noAnswer: ["Couldn't say.", "Never had call to know that.", "Ask Bridget. She remembers things."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man of sixty-five, a retired estate caretaker: slow, plain, gruff and decent, few words, bad knees. Rural Western Massachusetts American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
  },
  {
    id: "bridget",
    name: "Bridget Duffy",
    role: "Housekeeper, 1985 to 2004; Amos's wife",
    portrait: "char.bridget",
    bio: [
      { text: "Sixty. Housekeeper at Blackthorn Estate from 1985 to 2004. Married to Amos Duffy." },
      { text: "Saw Annabel Lisle arguing with Lucian Marsh at the library door on Halloween 1998.", requires: { asked: "bridget_1998" } },
      { text: "Was left an unsigned note in her coat tonight.", requires: ev("HE036") },
    ],
    available: alive("bridget"),
    deceased: dead("bridget"),
    locationId: "dining_room",
    onBoard: true,
    defaultEvidenceReply: "I don't know anything about that, love.",
    idleLine: "I'll say a rosary and wait.",
    noAnswer: ["I couldn't tell you.", "That's not for me to know.", "Ask Amos."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "Woman of sixty, a retired housekeeper, Irish-American Catholic: warm, anxious, devout, apologetic; frightened, then brave. Western Massachusetts American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "anxious", label: "Anxious", requires: { always: true } },
      { id: "frightened", label: "Frightened", requires: { flag: "bridget_threatened" }, cue: "Bridget keeps one hand in her coat pocket and looks at the door each time it opens." },
    ],
  },
  {
    id: "beatrice",
    name: "Beatrice Holloway",
    role: "An old friend of the family",
    portrait: "char.beatrice",
    bio: [
      { text: "Fifty-five. An old friend of the Blackthorns; chairs the Harrow Falls garden club." },
      { text: "Drove Annabel Lisle to the 1998 party.", requires: { asked: "beatrice_truth" } },
    ],
    available: { always: true },
    locationId: "dining_room",
    onBoard: true,
    defaultEvidenceReply: "I'm sure I don't know.",
    idleLine: "I'd like some water, please, and to be left alone.",
    noAnswer: ["I don't know.", "I really couldn't say.", "I'd rather not guess."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman in her mid fifties, a garden club chair: brisk and social on the surface, fragile underneath; evasive, then ashamed and plain-spoken. New England American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "brittle", label: "Brittle", requires: { always: true } },
      { id: "ashamed", label: "Ashamed", requires: { asked: "beatrice_truth" }, cue: "Beatrice has been crying. She doesn't try to hide it." },
    ],
  },

  // ---------------------------------------------------------------------
  // The attorney, the historian, the organizer
  // ---------------------------------------------------------------------
  {
    id: "byrne",
    name: "Everett Byrne",
    role: "Attorney to the Blackthorn Foundation; your client",
    portrait: "char.byrne",
    bio: [
      { text: "Forty-nine. Partner at Byrne & Hale, Pittsfield; attorney to the Blackthorn Foundation since 2009. Called Blackwood at 10:24 PM." },
      { text: "Was to receive Ambrose's records and a statement on November 1.", requires: ev("HE031") },
    ],
    available: { always: true },
    locationId: "entrance_hall",
    onBoard: true,
    defaultEvidenceReply: "I'd have to see that in context.",
    idleLine: "I'll be by the door with the officers.",
    noAnswer: ["I don't know.", "Ambrose didn't tell me that.", "That would be privileged if I knew it, and I don't."],
    voice: {
      voiceId: "ErXwobaYiN019PkySvjV",
      direction: "Man of about fifty, a careful small-city attorney: measured, formal, shaken under the formality, exact about what he does and doesn't know. Massachusetts American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
  },
  {
    id: "iris",
    name: "Iris Kettering",
    role: "Local historian; consultant on the house",
    portrait: "char.iris",
    bio: [{ text: "Forty-one. Historian with the Berkshire Historical Society; historic consultant on the carriage house renovation. Invited \"for the house.\"" }],
    available: { always: true },
    locationId: "library",
    onBoard: true,
    defaultEvidenceReply: "I'd want to look at that properly before I said anything.",
    idleLine: "I'll be with the books.",
    noAnswer: ["I don't know.", "The archive might say; I don't.", "That's not in anything I've read."],
    voice: {
      voiceId: "9BWtsMINqrJLrRacOk9x",
      direction: "Woman of about forty, a local historian: bright, eager, quick, a little too interested in the building for the occasion; sobering as she understands. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
  },
  {
    id: "wren",
    name: "Oscar Wren",
    role: "Event organizer, Wren Events",
    portrait: "char.wren",
    bio: [
      { text: "Fifty-two. Owner of Wren Events, Lenox. Organized tonight's dinner and the midnight procession." },
      { text: "First up the stairs with Felix after the scream. Gave the lady in black a note from Ambrose at 9:52 PM.", requires: { asked: "wren_thirteen" } },
    ],
    available: { always: true },
    locationId: "dining_room",
    onBoard: true,
    defaultEvidenceReply: "Not one of mine, I'm afraid.",
    idleLine: "I'll be with my team.",
    noAnswer: ["I'm not sure.", "That's not something I'd have seen.", "I can check my notes, but I doubt it."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man in his early fifties, an events organizer: brisk, organized, observant, professionally calm with nerves showing at the edges. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
  },

  // ---------------------------------------------------------------------
  // The police
  // ---------------------------------------------------------------------
  {
    id: "mahoney",
    name: "Det. Lt. Joan Mahoney",
    role: "Massachusetts State Police, Berkshire Detective Unit",
    portrait: "char.mahoney",
    bio: [{ text: "Detective lieutenant, Massachusetts State Police, Berkshire Detective Unit. Commands the homicide investigation. Two Harrow Falls officers, Dana Reyes and Tom Kwan, are at the house under her direction." }],
    available: { always: true },
    locationId: null,
    medium: "telephone",
    contact: "State Police, Berkshire Detective Unit. Officers, the lab, warrants.",
    questionLimit: null,
    onBoard: false,
    defaultEvidenceReply: "Hold on to it. Tell me what you think it means.",
    idleLine: "Call me when you've got something.",
    noAnswer: ["I don't know yet.", "Not my end of it.", "Find out and tell me."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman in her late forties, a State Police detective lieutenant on a car phone in bad weather: dry, direct, practical, sardonic, quick to decide. Western Massachusetts American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
  },
  {
    id: "reyes",
    name: "Officer Dana Reyes",
    role: "Harrow Falls Police",
    portrait: "char.reyes",
    bio: [{ text: "Officer, Harrow Falls Police. First officer on scene at 10:38 PM; took the first statements." }],
    available: never,
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
    voice: {
      voiceId: "AZnzlk1XvdvUeBnXmlld",
      direction: "Woman of about thirty, a small-town police officer taking statements: polite, steady, plain. American.",
    },
  },
];

/* ---------------------------------------------------------------------- */
/* What they say                                                           */
/* ---------------------------------------------------------------------- */

const q = (x: DialogueQuestion) => x;

export const questions: DialogueQuestion[] = [
  // ---------------- Lucian Marsh ----------------
  q({
    id: "crane_evening",
    characterId: "crane",
    topic: "Tonight",
    prompt: "Where were you when the lights went out?",
    keywords: ["blackout", "10:13", "where were you", "alibi", "lights", "call", "phone call"],
    reply: [
      "In the conservatory, on the phone. My office in Boston had a problem with a sale closing in the morning, and the signal's best in there, by the glass.",
      "I left the table at about eight minutes past ten. The lights went out while I was talking. I stood there in the dark like a fool until I heard the scream, and then I came through.",
    ],
    reveals: "Marsh says he was in the conservatory on a call to his Boston office from 10:08 until he heard the scream.",
  }),
  q({
    id: "crane_ambrose",
    characterId: "crane",
    topic: "Ambrose",
    prompt: "What was your relationship with Ambrose?",
    keywords: ["friend", "partner", "relationship", "know him", "ambrose", "how long", "known", "years", "forty years"],
    reply: [
      "Forty years. We started in antiques together, Blackthorn and Marsh, and when the foundation needed a treasurer in 1994 he asked me. I've kept its books ever since.",
      "He was a good man and a nervous one. Lately more nervous than good, if I'm honest. He'd taken to drama.",
    ],
  }),
  q({
    id: "crane_revelation",
    characterId: "crane",
    topic: "Ambrose",
    prompt: "What was Ambrose going to tell everyone at 10:30?",
    keywords: ["half past ten", "10:30", "announcement", "reveal", "revelation", "why you're here", "twenty years"],
    reply: [
      "I haven't the faintest idea. Ambrose liked an audience. Twenty years ago tonight there was a party here and a girl ran off from it, poor thing, and I suppose he'd got it into his head to make a ceremony of it.",
      "He'd been talking about his conscience a great deal. At our age you do.",
    ],
  }),
  q({
    id: "crane_veil",
    characterId: "crane",
    topic: "The woman in black",
    prompt: "Who was the woman in the black veil?",
    keywords: ["veil", "veiled", "woman in black", "thirteenth", "13th", "stranger", "mourning"],
    reply: [
      "I've no idea. Ambrose seated her at the foot of the table and told nobody who she was, which is exactly the kind of thing he'd do.",
      "If you want my opinion, she walked in off Hollins Road in a costume. There are some very odd people about on Halloween. I'd want to know where she was at a quarter past ten.",
    ],
  }),
  q({
    id: "crane_stair",
    characterId: "crane",
    topic: "The house",
    prompt: "Do you know about the hidden stair behind the study shelves?",
    keywords: ["stair", "back stair", "servants", "passage", "hidden", "bookcase", "secret"],
    requires: stairKnown,
    reply: [
      "The old back stair? Of course I know of it. Every child who ever came to this house knew of it. Ambrose had it closed up in the nineties. I haven't set foot in it in twenty-five years.",
    ],
    reveals: "Marsh says he has not been in the back stair in twenty-five years.",
  }),
  q({
    id: "crane_switch",
    characterId: "crane",
    topic: "The house",
    prompt: "You had the main switch in the cellar replaced last week.",
    keywords: ["switch", "breaker", "electric", "hollins electric", "panel", "work order", "main"],
    requires: { any: [ev("HE030"), ev("HE006")] },
    reply: [
      "I manage the estate works for the foundation. The old breaker was nearly fifty years old and the insurers didn't like it. The electrician fitted a new one. That's what treasurers do: boring things that stop houses burning down.",
    ],
  }),
  q({
    id: "crane_key",
    characterId: "crane",
    topic: "The house",
    prompt: "The key book says you took the lower stair door key at 7:10.",
    keywords: ["key", "key book", "7:10", "signed", "lower stair door", "cellar wines"],
    requires: ev("HE029"),
    reply: [
      "Did it? I went down at about seven to look at the wines for dinner. Ambrose's father laid down some port I wanted to see. Wren's people had a board of keys and I took the one the girl handed me.",
      "If it was the wrong key, it was the wrong key. I didn't open any stair with it. I'll find it for you in my coat, I expect.",
    ],
    reveals: "Marsh says he took a key at 7:10 to look at the wines, and never opened any stair.",
  }),
  q({
    id: "crane_terrace",
    characterId: "crane",
    topic: "Tonight",
    prompt: "You came in from the terrace through the conservatory at 10:19, wet from the rain.",
    keywords: ["terrace", "garden door", "wet", "rain", "outside", "10:19", "penrose", "constance"],
    requires: ev("HE028"),
    reply: [
      "Did I say I stayed in the conservatory? I meant I was out by it. The signal comes and goes in there, so I stepped out onto the terrace for a bar or two. Then the lights went and I came in.",
      "I'd be careful with Isaac and Constance as witnesses, by the way. Ask them what they were doing in a dark conservatory together.",
    ],
    reveals: "Marsh now says he stepped out onto the terrace for a better signal.",
  }),
  q({
    id: "crane_money",
    characterId: "crane",
    topic: "The foundation",
    prompt: "Tell me about Marsh Advisory and the foundation's consulting payments.",
    keywords: ["crane advisory", "consulting", "invoices", "1,380,000", "payments", "money", "conservation"],
    requires: { any: [ev("HE027"), ev("HE038"), ev("HE031")] },
    reply: [
      "Marsh Advisory is my consultancy. The foundation's properties need a great deal of conservation advice, and I give it. The board approved every invoice, and the auditors have seen every one.",
      "If Ambrose had questions he might have asked me. He never did.",
    ],
  }),
  q({
    id: "crane_ridgeline",
    characterId: "crane",
    topic: "The foundation",
    prompt: "In 1997 the foundation bought Ridgeline Road from your company for four times its value.",
    keywords: ["ridgeline", "1997", "land", "appraisal", "hollins ridge", "elm hollow", "patten"],
    requires: { any: [ev("HE019"), ev("HE020")] },
    reply: [
      "Appraisals differ. We had a second opinion that valued it properly as building land. The board approved the purchase, Ambrose signed it, and it's been in the audited accounts for twenty years.",
      "Harriet was always a worrier. I'm sorry she's still worrying.",
    ],
  }),
  q({
    id: "crane_1998",
    characterId: "crane",
    topic: "1998",
    prompt: "What do you remember about Annabel Lisle?",
    keywords: ["annabel", "lisle", "girl", "1998", "runaway", "volunteer", "missing"],
    requires: knows1998,
    reply: [
      "Not much, I'm afraid. A volunteer in the archive one autumn. Bright, a little full of herself. She was at the party that year and the next day she'd gone. Everyone said she'd run away from home.",
      "It was a sad business. I'm not sure what it has to do with Ambrose.",
    ],
    reveals: "Marsh says he barely knew Annabel Lisle and that everyone said she ran away.",
  }),
  q({
    id: "crane_chamber",
    characterId: "crane",
    topic: "1998",
    prompt: "You had the chamber under the carriage house bricked over in November 1998.",
    keywords: ["carriage house", "chamber", "brick", "masons", "inspection pit", "november 1998"],
    requires: { any: [ev("HE022"), ev("HE024"), ev("HE025")] },
    reply: [
      "I did. It was an open pit in an outbuilding that children played in. The foundation's insurers wanted it closed, and I had it closed.",
    ],
    variants: [
      {
        requires: ev("HE025"),
        reply: [
          "I had a dangerous pit bricked over twenty years ago. I had no idea what was in it. If you're suggesting otherwise, I'd like you to say so in front of my lawyer.",
        ],
      },
    ],
  }),
  q({
    id: "crane_note",
    characterId: "crane",
    topic: "1998",
    prompt: "In 1998 you wrote to Ambrose: \"The masons come Wednesday. It is done and cannot be undone. Burn this.\"",
    keywords: ["masons come wednesday", "burn this", "note", "letter", "hollins ridge letterhead", "1998 note"],
    requires: ev("HE026"),
    reply: [
      "About the masons. About a pit. Ambrose kept every scrap of paper he was ever given, including the ones he was asked to burn. It proves he was a hoarder.",
      "I think I've been very patient tonight.",
    ],
  }),

  // ---------------- Josie Lisle ----------------
  q({
    id: "josie_who",
    characterId: "josie",
    topic: "Who she is",
    prompt: "Who are you?",
    keywords: ["name", "who are you", "veil", "identity", "lisle"],
    reply: [
      "My name is Josephine Lisle. Josie. I'm a pharmacist in Pittsfield. My sister was Annabel Lisle.",
      "She walked into this house on Halloween twenty years ago and never walked out. I was nine.",
    ],
    reveals: "The veiled woman is Josie Lisle, Annabel Lisle's younger sister.",
  }),
  q({
    id: "josie_why",
    characterId: "josie",
    topic: "Who she is",
    prompt: "Why did you come here tonight?",
    keywords: ["why", "come", "invitation", "invited", "here tonight", "black", "mourning"],
    reply: [
      "Mr. Blackthorn invited me. Two weeks ago a card came: he owed my family the truth, come on Halloween, come as I liked, there'd be a place at his table. I wore black because I've been in mourning for twenty years and nobody has ever let me say so.",
      "I nearly didn't come. Then I thought, if I don't, I'll never know.",
    ],
    offers: "josie_file",
  }),
  q({
    id: "josie_file",
    characterId: "josie",
    topic: "Annabel",
    prompt: "What have you found out about your sister's disappearance?",
    keywords: ["file", "investigation", "police report", "runaway", "research", "show me"],
    reply: [
      "Everything I could, for twenty years. The police report that calls her a runaway. My letters asking them to look again. Every name I could find from that party. His invitation. His note tonight.",
      "Take it. All of it. I've been waiting a long time for someone to read it.",
    ],
    effects: [{ giveEvidence: "HE034" }],
  }),
  q({
    id: "josie_diary",
    characterId: "josie",
    topic: "Annabel",
    prompt: "Did Annabel leave anything behind that might help?",
    keywords: ["diary", "journal", "wrote", "left behind", "annabel's things", "notes"],
    reply: [
      "Her diary. I found it under her mattress when I was eleven and I've carried it ever since. The last pages are about this house, and the foundation's library, and a land deal, and a man.",
      "I've read it so many times I know it by heart. You should read it fresh.",
    ],
    effects: [{ giveEvidence: "HE018" }],
  }),
  q({
    id: "josie_door",
    characterId: "josie",
    topic: "Tonight",
    prompt: "What happened when you went up to the study?",
    keywords: ["study", "door", "upstairs", "10:15", "scream", "heard", "what happened"],
    reply: [
      "His note said a quarter past ten, his study. I went up early and waited outside the door. Then the lights went out.",
      "At a quarter past I knocked. I heard him cry out, and something heavy fall, and a man's voice, low, two or three words I couldn't make out. Then a creak, like old wood. I tried the door and it was bolted. I screamed.",
    ],
    reveals: "Josie heard Ambrose cry out, a fall, a man's low voice and a creak of wood, and found the study door bolted.",
  }),
  q({
    id: "josie_voice",
    characterId: "josie",
    topic: "Tonight",
    prompt: "Could you tell whose voice it was?",
    keywords: ["voice", "who spoke", "recognize", "man's voice", "words"],
    requires: { asked: "josie_door" },
    reply: [
      "No. A man, not young, very low. I won't guess. I have had twenty years of people guessing about my sister, and I won't do that to anybody.",
    ],
  }),
  q({
    id: "josie_hide",
    characterId: "josie",
    topic: "Tonight",
    prompt: "Why did you run and hide?",
    keywords: ["hide", "ran", "rose room", "run away", "guest wing", "afraid"],
    reply: [
      "Because I'm a stranger in a veil who walked in off the road, standing outside a dead man's door. Who would you have believed?",
      "I heard them coming up the stairs and I ran around the corner into the first room that wasn't locked. I dropped a glove; I felt it go. I've been sitting on the floor of that room ever since.",
    ],
  }),
  q({
    id: "josie_crane",
    characterId: "josie",
    topic: "Annabel",
    prompt: "What do you know about Lucian Marsh?",
    keywords: ["crane", "desmond", "treasurer", "circled"],
    requires: { any: [ev("HE018"), ev("HE034"), { talkedTo: "crane" }] },
    reply: [
      "His name is in her diary. Hollins Ridge Associates. He kept the foundation's books, and she found something in them.",
      "He was at the party in 1998 and he's at the table tonight. He hardly looked at me all through dinner, which is a kind of looking too. That's all I know. That's all I'll say I know.",
    ],
  }),
  q({
    id: "josie_beatrice",
    characterId: "josie",
    topic: "Annabel",
    prompt: "Beatrice Holloway knew who you were.",
    keywords: ["beatrice", "holloway", "recognized", "drove"],
    requires: { any: [{ asked: "beatrice_truth" }, ev("HE017"), ev("HE014")] },
    reply: [
      "I saw her know me. Mrs. Holloway drove my sister here that night. She told the police Annabel talked about running away.",
      "I've hated her for that since I was nine. Tonight she looked at me like she was the one who'd been waiting twenty years.",
    ],
  }),

  // ---------------- Constance ----------------
  q({
    id: "constance_evening",
    characterId: "constance",
    topic: "Tonight",
    prompt: "Where were you when the lights went out?",
    keywords: ["where were you", "10:13", "blackout", "lights", "alibi", "left the table"],
    reply: [
      "I'd stepped out of the dining room for some air after the cheese. Ambrose's dinners always ran long and I've heard all his stories.",
      "I was in here when the lights went. I stayed put. It seemed the sensible thing.",
    ],
    variants: [
      {
        requires: ev("HE033"),
        reply: ["In here, with Isaac. You know that now. We'd come to talk about what to do once Ambrose had said whatever he meant to say. We were here from about five past ten until the lights came back."],
      },
    ],
  }),
  q({
    id: "constance_ambrose",
    characterId: "constance",
    topic: "Ambrose",
    prompt: "Tell me about Ambrose lately.",
    keywords: ["ambrose", "husband", "lately", "mood", "frightened", "afraid", "marriage"],
    reply: [
      "We've lived apart six years and stayed married out of laziness. But he called me a great deal this month, which he never does.",
      "He was frightened. Sleeping badly. Isaac gave him something for it. He said he'd made a promise to a dead girl and meant to keep it this time. I thought he meant it as a figure of speech.",
    ],
  }),
  q({
    id: "constance_revelation",
    characterId: "constance",
    topic: "Ambrose",
    prompt: "What do you think Ambrose meant to reveal tonight?",
    keywords: ["reveal", "revelation", "10:30", "announcement", "secret", "twenty years"],
    reply: [
      "Something about the foundation, I assumed. Money. It's always money with foundations. I left the board in 2012 because the numbers stopped adding up and nobody would tell me why.",
      "If you want to know who'd mind the books being opened, ask Lucian. He's kept them for twenty-four years.",
    ],
  }),
  q({
    id: "constance_crane",
    characterId: "constance",
    topic: "Lucian Marsh",
    prompt: "What do you think of Lucian Marsh?",
    keywords: ["crane", "desmond", "treasurer", "trust him"],
    reply: [
      "Lucian keeps the books and Ambrose keeps the peace. That's how it's always been. I never liked him and I never trusted him, and Ambrose would never hear a word against him.",
      "Lately I wondered if that was loyalty or fear.",
    ],
  }),
  q({
    id: "constance_veil",
    characterId: "constance",
    topic: "The woman in black",
    prompt: "Did you see the woman in the black veil?",
    keywords: ["veil", "woman in black", "thirteenth", "foot of the table", "stranger"],
    reply: ["At the foot of the table, yes. Ambrose told nobody who she was. I assumed she was one of his little theatrical touches. A ghost for Halloween."],
    variants: [
      {
        requires: rumor,
        reply: [
          "At the foot of the table, yes. Lucian's going around saying she's some madwoman who walked in off the road, and half the room believes him.",
          "Ambrose set a place for her. I don't think Ambrose set places for madwomen.",
        ],
      },
    ],
  }),
  q({
    id: "constance_attic",
    characterId: "constance",
    topic: "The house",
    prompt: "Where would Ambrose have kept his old papers?",
    keywords: ["papers", "old letters", "attic", "trunk", "keep", "files", "records"],
    reply: [
      "His father's tin trunk, in the attic. Ambrose kept every letter anyone ever sent him and couldn't bear to throw any of them away. The attic's up the narrow stair at the end of the guest wing. It's never locked.",
    ],
    effects: [{ setFlag: "attic_known" }],
  }),
  q({
    id: "constance_penrose",
    characterId: "constance",
    topic: "Tonight",
    prompt: "You and Dr. Penrose have been writing to each other.",
    keywords: ["penrose", "isaac", "letters", "affair", "seeing each other", "together"],
    requires: ev("HE033"),
    reply: [
      "For a year. We're both too old to be ashamed of it and too cowardly to say so. That's why I lied to you about where I was.",
      "Ask Isaac to write down what we saw in here. He's better at that sort of thing than I am. And he won't leave anything out.",
    ],
  }),

  // ---------------- Dr. Penrose ----------------
  q({
    id: "penrose_wound",
    characterId: "penrose",
    topic: "Ambrose",
    prompt: "What did you find when you reached Ambrose?",
    keywords: ["wound", "injury", "body", "how did he die", "pulse", "examined", "cause"],
    reply: [
      "He was gone when I got to him, at twenty-four minutes past. One blow to the left side of the head, from something heavy with a square edge. Not a fall.",
      "I wrote it down while it was fresh. Here. Whoever struck him was standing between the desk and the shelves, not by the door.",
    ],
    effects: [{ giveEvidence: "HE003" }],
  }),
  q({
    id: "penrose_evening",
    characterId: "penrose",
    topic: "Tonight",
    prompt: "Where were you at a quarter past ten?",
    keywords: ["where were you", "10:15", "blackout", "lights", "alibi"],
    reply: ["In here. In the conservatory. I needed some air and some quiet. It's been a long evening."],
    variants: [{ requires: ev("HE033"), reply: ["In here, with Constance, from about five past ten. I'm sorry I didn't say so. It's not the kind of thing a village doctor says easily."] }],
  }),
  q({
    id: "penrose_1998",
    characterId: "penrose",
    topic: "1998",
    prompt: "Were you at the party here in 1998?",
    keywords: ["1998", "party", "twenty years", "annabel", "lisle", "that night"],
    reply: [
      "I was. I left at half past ten. I remember Ambrose coming back into the party at about a quarter past ten, white as a sheet. I asked if he was ill and he said he'd had bad news.",
      "Two days later the Lisle girl was in the papers as a runaway. I never put the two together. I should have.",
    ],
  }),
  q({
    id: "penrose_ambrose",
    characterId: "penrose",
    topic: "Ambrose",
    prompt: "How had Ambrose been lately?",
    keywords: ["health", "mood", "sleeping", "lately", "frightened", "pills"],
    reply: ["Anxious. Not sleeping. I gave him something mild for it two weeks ago. He told me he had to do something he should have done a long time ago, and asked me to come tonight and be a witness to it."],
  }),
  q({
    id: "penrose_conservatory",
    characterId: "penrose",
    topic: "Tonight",
    prompt: "Was anyone else in the conservatory with you and Constance?",
    keywords: ["conservatory", "anyone else", "crane", "came in", "terrace", "phone call", "who came through"],
    requires: ev("HE033"),
    reply: [
      "Nobody else was in here, and nobody made a telephone call in here. I'd have heard. At about nineteen minutes past, in the dark, the garden door from the terrace opened and Lucian Marsh came in from outside, wet through. He said, 'Did the lights go?' and went straight on into the house.",
      "Constance and I will both sign to it. I'll write it now.",
    ],
    effects: [{ giveEvidence: "HE028" }],
    reveals: "Nobody made a call in the conservatory. Marsh came in from the terrace, wet, at about 10:19.",
  }),

  // ---------------- Felix ----------------
  q({
    id: "felix_evening",
    characterId: "felix",
    topic: "Tonight",
    prompt: "Where were you at a quarter past ten?",
    keywords: ["where were you", "10:15", "blackout", "lights", "alibi", "table"],
    reply: [
      "At the table, between Mrs. Holloway and Bridget Duffy, in the dark, saying something stupid about the electric bill. Oscar was at the sideboard right behind me. Then the scream, and Oscar and I went up with our phones.",
      "Ask them. Ask any of them. I didn't move until we ran.",
    ],
  }),
  q({
    id: "felix_argument",
    characterId: "felix",
    topic: "Tonight",
    prompt: "What did you and your father argue about?",
    keywords: ["argument", "argue", "money", "hall", "fight", "loan"],
    reply: [
      "Money. I asked him for some, he said no, I said something I'll be sorry about for the rest of my life. That was at half past nine. It was the last thing I said to him.",
    ],
  }),
  q({
    id: "felix_debts",
    characterId: "felix",
    topic: "Tonight",
    prompt: "You owe Callender Bridge Capital $212,000.",
    keywords: ["debt", "loan", "callender", "212,000", "inheritance", "owe"],
    requires: ev("HE032"),
    reply: [
      "Yes. Against what I'd get when he died, which is a lovely thing to have to admit tonight. I asked him to pay it off. He said he had bigger things to put right first.",
      "I was broke. I wasn't a murderer. I was at the table.",
    ],
  }),
  q({
    id: "felix_door",
    characterId: "felix",
    topic: "Tonight",
    prompt: "Tell me about forcing the study door.",
    keywords: ["door", "forced", "bolted", "locked", "broke", "shoulder", "found him"],
    reply: [
      "It was bolted from inside. You could feel the bolt when you pushed. When the lights came back Oscar and I put our shoulders to it, twice, and the keeper came out of the frame.",
      "He was on the floor between the desk and the bookshelves. Nobody else was in there. I looked. I looked everywhere.",
    ],
  }),
  q({
    id: "felix_veil",
    characterId: "felix",
    topic: "Tonight",
    prompt: "Who was the woman you saw in the corridor?",
    keywords: ["woman", "veil", "corridor", "guest wing", "who was she", "saw her"],
    reply: ["The one from the foot of the table, the one in black. She went around the corner into the guest wing like a ghost in a film. I shouted and she didn't stop. I thought she was some act Dad had hired."],
    variants: [{ requires: rumor, reply: ["The one in black from the foot of the table. Lucian thinks she's some madwoman who walked in off the road. She went around the corner into the guest wing and I lost her."] }],
  }),
  q({
    id: "felix_stair",
    characterId: "felix",
    topic: "The house",
    prompt: "Is there any other way into the study?",
    keywords: ["other way", "hidden", "stair", "passage", "secret", "bookcase", "another door"],
    reply: [
      "There used to be. When I was a kid there was a back stair behind one of the bookcases in Dad's study, down to the cellars. I used to hide in it.",
      "Dad had it shut up when I was about nineteen. Amos screwed it shut. Nobody's been in it in twenty years.",
    ],
    reveals: "Felix says there was a hidden back stair behind a study bookcase, down to the cellars, shut up around 1999.",
  }),
  q({
    id: "felix_print",
    characterId: "felix",
    topic: "Tonight",
    prompt: "The print on the shelf catch could be yours.",
    keywords: ["print", "fingerprint", "catch", "lab", "thumb"],
    requires: ev("HE009"),
    reply: [
      "Could be mine or could be Lucian's, the lab says, which means it could be anyone with a thumb like ours. I haven't touched that shelf since I was eighteen.",
      "I was at the table at a quarter past ten between Beatrice Holloway and Bridget Duffy, with Oscar Wren standing behind my chair. Ask them.",
    ],
  }),
  q({
    id: "felix_crane",
    characterId: "felix",
    topic: "Lucian Marsh",
    prompt: "What do you think of Lucian Marsh?",
    keywords: ["crane", "desmond", "uncle", "treasurer"],
    reply: [
      "Uncle Lucian. Smooth as a pond. He's been in this house my whole life, telling Dad what to sign.",
      "This last month Dad wouldn't be in a room with him alone. I thought they'd had a row about money. Everything's about money.",
    ],
  }),

  // ---------------- Oscar Wren ----------------
  q({
    id: "wren_thirteen",
    characterId: "wren",
    topic: "The dinner",
    prompt: "Who asked for a thirteenth place to be set?",
    keywords: ["thirteenth", "thirteen", "13", "place", "places", "setting", "settings", "extra", "who asked", "guest", "ordered"],
    reply: [
      "Mr. Blackthorn did, when he booked us. I queried it twice, because he gave me twelve names. Both times he said thirteen: one guest would come late, on foot, might not give a name, and was to sit at the foot and not be asked anything.",
      "And at ten to ten he gave me a note for her. I've written it all down for you.",
    ],
    effects: [{ giveEvidence: "HE012" }],
  }),
  q({
    id: "wren_photos",
    characterId: "wren",
    topic: "The dinner",
    prompt: "Did you take any photographs during dinner?",
    keywords: ["photo", "photographs", "pictures", "camera", "phone", "snapshots"],
    reply: [
      "A few for the client, from the side of the room, the way I always do. Nine-oh-five, ten-oh-nine, ten-eleven. I'll print them on the little printer in the van.",
      "Here. You can see her in the first one. You can see who's missing in the others.",
    ],
    effects: [{ giveEvidence: "HE014" }],
  }),
  q({
    id: "wren_evening",
    characterId: "wren",
    topic: "The dinner",
    prompt: "Who left the table before the lights went out?",
    keywords: ["left the table", "who left", "missing", "10:08", "10:11", "before the blackout"],
    reply: [
      "Mrs. Blackthorn at about five past ten, and Dr. Penrose just after her. Mr. Marsh at eight minutes past, for a call. Mr. Blackthorn at eleven minutes past; he went up to his study. The lady in black had gone at twenty past nine.",
      "Everyone else was at the table when the lights went. I was counting heads because that's what I do.",
    ],
  }),
  q({
    id: "wren_note",
    characterId: "wren",
    topic: "The dinner",
    prompt: "What was in the note you gave the lady in black?",
    keywords: ["note", "folded note", "gave her", "message", "9:52", "library"],
    requires: { asked: "wren_thirteen" },
    reply: ["I didn't read it. Mr. Blackthorn folded it twice and said, 'Give this to the lady in black, wherever she is, and nobody else.' I found her alone in the library at about 9:52 and gave it to her. She read it and tucked it into her sleeve."],
  }),
  q({
    id: "wren_keys",
    characterId: "wren",
    topic: "The house",
    prompt: "Who looks after the keys tonight?",
    keywords: ["keys", "key book", "key cabinet", "locked doors", "sealed"],
    reply: [
      "My people. The house keys are in a steel cabinet in the old service corridor downstairs, with a book on a string: everyone signs every key out and in. Two doors are marked sealed and aren't to be issued at all.",
      "Go and look at the book. It'll be more accurate than my memory.",
    ],
  }),
  q({
    id: "wren_procession",
    characterId: "wren",
    topic: "The procession",
    prompt: "Tell me about the midnight procession.",
    keywords: ["procession", "midnight", "lanterns", "maze", "walk"],
    reply: [
      "Mr. Blackthorn's father used to do it: at midnight everyone puts their mask back on and walks the yew maze with a lantern, out to the far gate and back. Mr. Blackthorn wanted it done tonight exactly as his father did it.",
      "I've got thirty lanterns in the greenhouse. If the lieutenant wants it called off, I'll call it off. I'd almost rather.",
    ],
  }),
  q({
    id: "wren_argument",
    characterId: "wren",
    topic: "The dinner",
    prompt: "Did you hear Felix argue with his father?",
    keywords: ["felix", "argument", "argue", "hall", "money", "9:30"],
    reply: ["At half past nine, in the hall, yes. Felix wanted money and his father said no, not tonight, he had bigger things to put right first. Felix said something unkind and went back to his seat. I was at the sideboard right behind him from then on, and he was in that chair when the lights went."],
  }),

  // ---------------- Harriet Lowell ----------------
  q({
    id: "harriet_evening",
    characterId: "harriet",
    topic: "Tonight",
    prompt: "Where were you at a quarter past ten?",
    keywords: ["where were you", "10:15", "blackout", "lights", "alibi"],
    reply: ["At the table, between Lucian's empty chair and Amos. When the lights went Maeve Corrigan grabbed my wrist so hard she left a mark. Look."],
  }),
  q({
    id: "harriet_foundation",
    characterId: "harriet",
    topic: "The foundation",
    prompt: "You kept the foundation's books?",
    keywords: ["accountant", "books", "bookkeeper", "foundation", "worked"],
    reply: ["From 1990 to 2001. Lucian became treasurer in 1994 and I worked for him after that. I left in 2001. I said it was my mother's health. It wasn't only my mother's health."],
  }),
  q({
    id: "harriet_1998",
    characterId: "harriet",
    topic: "1998",
    prompt: "What do you remember of Halloween 1998?",
    keywords: ["1998", "annabel", "lisle", "volunteer", "girl", "that night", "party"],
    reply: [
      "I supervised the archive volunteers that autumn. Annabel Lisle was the cleverest of them. A week before the party she came to me with a land purchase from 1997 and asked why the two figures didn't match.",
      "I told her the books had been changed and not to say anything to anyone. I meant to protect her. I've thought about that sentence every day for twenty years.",
    ],
  }),
  q({
    id: "harriet_ledger",
    characterId: "harriet",
    topic: "1998",
    prompt: "Do you still have any records from then?",
    keywords: ["records", "ledger", "copy", "kept", "evidence", "working copy", "green book"],
    requires: { any: [ev("HE018"), ev("HE020"), { asked: "harriet_1998" }] },
    reply: [
      "I have my working copy of the 1997 register. The one I wrote before I was told what to write. I've carried it in my bag to every Blackthorn party for twenty years, in case anybody ever asked.",
      "Nobody ever did. Here. Take it before I lose my nerve.",
    ],
    effects: [{ giveEvidence: "HE019" }],
  }),
  q({
    id: "harriet_crane",
    characterId: "harriet",
    topic: "Lucian Marsh",
    prompt: "What did Lucian Marsh ask you to do?",
    keywords: ["crane", "desmond", "told you", "second appraiser", "change"],
    requires: { asked: "harriet_1998" },
    reply: ["Enter the land at the price he paid for it, not the price it was worth. He said there was a second appraiser. There wasn't. I did as I was told, three times. That's what I'm ashamed of."],
  }),
  q({
    id: "harriet_consulting",
    characterId: "harriet",
    topic: "The foundation",
    prompt: "What do you make of the Marsh Advisory invoices?",
    keywords: ["crane advisory", "consulting", "invoices", "1,380,000"],
    requires: { any: [ev("HE027"), ev("HE038")] },
    reply: ["It's after my time. But it's the same trick in a new coat, isn't it? Pay yourself for something nobody can check. In 1997 it was land. Now it's advice."],
  }),

  // ---------------- Amos Duffy ----------------
  q({
    id: "amos_lights",
    characterId: "amos",
    topic: "Tonight",
    prompt: "Tell me about getting the lights back on.",
    keywords: ["lights", "switch", "breaker", "main", "power", "cellar", "panel"],
    reply: [
      "I went down the kitchen stair with my phone. Thirty years I worked here; I could find that panel blind. The new switch was all the way down. Not tripped. They don't trip, those. Down.",
      "And at the bottom of the stair I heard a door shut, down the old passage, and the outside cellar door banging in the wind. I took it for a caterer.",
    ],
  }),
  q({
    id: "amos_passage",
    characterId: "amos",
    topic: "The house",
    prompt: "Is there a hidden stair behind the study shelves?",
    keywords: ["hidden stair", "back stair", "passage", "bookcase", "secret", "study shelves", "screws"],
    requires: stairKnown,
    reply: [
      "There is. The old back stair, behind the fourth bookcase in the study, down to the service passage. Mr. Blackthorn had me screw the bookcase shut in 1999, four brass screws, and paint over the door at the bottom.",
      "If those screws are out, somebody took them out. I didn't.",
    ],
    effects: [{ setFlag: "passage_told" }],
    reveals: "Amos screwed the study's hidden bookcase door shut and painted over the lower door in 1999.",
  }),
  q({
    id: "amos_1998",
    characterId: "amos",
    topic: "1998",
    prompt: "What do you remember of Halloween 1998?",
    keywords: ["1998", "that night", "carriage house", "volvo", "party", "annabel"],
    reply: [
      "I was locking the grounds at about twenty past eleven. Mr. Marsh's Volvo was backed up to the carriage house doors with no lights. He said he was loading crates for an auction. At that hour.",
      "The next week he had masons brick over the old chamber under the inspection pit and told me to keep out. I'll write it down for you, if you want it written.",
    ],
    offers: "amos_statement",
  }),
  q({
    id: "amos_statement",
    characterId: "amos",
    topic: "1998",
    prompt: "Will you write down what you saw?",
    keywords: ["write", "statement", "written", "put it down", "sign"],
    requires: { asked: "amos_1998" },
    reply: ["Give me a pen. My hand's not what it was. There. That's what I saw, then and tonight. I've signed it."],
    effects: [{ giveEvidence: "HE022" }],
  }),
  q({
    id: "amos_carriage",
    characterId: "amos",
    topic: "1998",
    prompt: "What's under the carriage house?",
    keywords: ["carriage house", "chamber", "inspection pit", "drain", "under"],
    reply: ["An inspection pit for the old carriages, and under that a drainage chamber the size of a closet. Been there since 1903. Bricked over in 1998. They're digging it out next week for the new drains, I heard."],
  }),
  q({
    id: "amos_crane",
    characterId: "amos",
    topic: "Lucian Marsh",
    prompt: "What do you think of Lucian Marsh?",
    keywords: ["crane", "desmond", "treasurer"],
    reply: ["He paid my wages after Mr. Blackthorn senior died. He always paid on time. I never once wanted to have a beer with him."],
  }),

  // ---------------- Bridget Duffy ----------------
  q({
    id: "bridget_evening",
    characterId: "bridget",
    topic: "Tonight",
    prompt: "Where were you at a quarter past ten?",
    keywords: ["where were you", "10:15", "blackout", "lights", "alibi"],
    reply: ["At the table, praying. When that girl screamed I went up after Felix and Mr. Wren, as far as the top of the stairs, and then I couldn't go any farther."],
  }),
  q({
    id: "bridget_house",
    characterId: "bridget",
    topic: "The house",
    prompt: "You were the housekeeper here?",
    keywords: ["housekeeper", "worked here", "staff", "years"],
    reply: ["From 1985 until 2004. I know where every cup in this house goes, or I did. They've moved the kitchen since."],
  }),
  q({
    id: "bridget_veil",
    characterId: "bridget",
    topic: "The woman in black",
    prompt: "Did you see the woman in the black veil?",
    keywords: ["veil", "woman in black", "thirteenth", "ghost", "foot of the table"],
    reply: ["At the foot of the table. For a moment I thought she was a ghost, God forgive me. On Halloween, in this house. Then she lifted her glass and I saw she was a living woman, and I was ashamed of myself."],
  }),
  q({
    id: "bridget_1998",
    characterId: "bridget",
    topic: "1998",
    prompt: "What do you remember of Halloween 1998?",
    keywords: ["1998", "annabel", "lisle", "girl", "library", "argument", "that night"],
    requires: { any: [knows1998, { talkedTo: "amos" }] },
    reply: [
      "I saw the Lisle girl at the library door with Mr. Marsh, at about twenty to nine, with papers in her hand. He said, 'That's not your business, young lady,' very quiet, and she said, 'Then whose is it?'",
      "He took a glass off my tray and said she'd been at the punch. I never saw her again. I've written it down. Here. I should have said it twenty years ago.",
    ],
    effects: [{ giveEvidence: "HE023" }],
    reveals: "Bridget saw Annabel confront Marsh at the library door at about 8:40 PM in 1998.",
  }),
  q({
    id: "bridget_note",
    characterId: "bridget",
    topic: "Tonight",
    prompt: "Has anything happened since we last spoke?",
    keywords: ["happened", "note", "threat", "frightened", "pocket", "coat", "since we spoke"],
    requires: { flag: "bridget_threatened" },
    reply: [
      "I went to my coat for a handkerchief and there was this in the pocket. I didn't write it. I don't know who did.",
      "It's the library paper. He'd know that. Anyone at dinner would know that.",
    ],
    effects: [{ giveEvidence: "HE036" }],
    volunteer: { after: 0, reply: ["Please. Before you ask me anything. Someone put this in my coat."] },
  }),

  // ---------------- Beatrice Holloway ----------------
  q({
    id: "beatrice_evening",
    characterId: "beatrice",
    topic: "Tonight",
    prompt: "Where were you at a quarter past ten?",
    keywords: ["where were you", "10:15", "blackout", "lights", "alibi"],
    reply: ["At the table. Then on the stairs behind Felix and Mr. Wren. I saw her go around the corner at the end of the corridor. I didn't say anything."],
  }),
  q({
    id: "beatrice_veil",
    characterId: "beatrice",
    topic: "The woman in black",
    prompt: "Who was the woman at the foot of the table?",
    keywords: ["veil", "woman in black", "thirteenth", "foot of the table", "who was she", "stranger"],
    reply: ["How should I know? It's Halloween. People dress up. Ambrose loved a mystery."],
  }),
  q({
    id: "beatrice_truth",
    characterId: "beatrice",
    topic: "The woman in black",
    prompt: "You know who she is, don't you?",
    keywords: ["you know", "recognized", "who she is", "stared", "lisle", "josie", "sister", "glove"],
    requires: { any: [ev("HE014"), ev("HE016"), found, ev("HE034")] },
    reply: [
      "Yes. She's Josie Lisle. Annabel's little sister. I knew her the moment she sat down. She has her mother's mouth.",
      "I drove Annabel here that night, and Annabel told me she'd found something about Lucian Marsh, and I told her not to make a scene. Then I told the police she'd talked about running away. I've written it all out. I'm so sorry.",
    ],
    effects: [{ giveEvidence: "HE017" }],
    reveals: "Beatrice identifies the veiled woman as Josie Lisle, and says Annabel told her in 1998 she had found something about Lucian Marsh.",
  }),
  q({
    id: "beatrice_ambrose",
    characterId: "beatrice",
    topic: "Ambrose",
    prompt: "Why do you think Ambrose invited you?",
    keywords: ["invited", "why you", "ambrose", "invitation"],
    reply: ["Because I was there in 1998. Nearly all of us at that table were. He looked around it at nine o'clock like a man counting witnesses."],
  }),

  // ---------------- Everett Byrne ----------------
  q({
    id: "byrne_call",
    characterId: "byrne",
    topic: "Why you are here",
    prompt: "Why did Ambrose want investigators near the house tonight?",
    keywords: ["why", "called", "investigators", "blackwood", "hired", "afraid"],
    reply: ["He said he was going to tell the truth about something tonight, and that someone had reason to want him quiet. He asked me to have you at the inn. I thought he was being dramatic. I'm sorry, Ambrose."],
  }),
  q({
    id: "byrne_letter",
    characterId: "byrne",
    topic: "Ambrose",
    prompt: "What did Ambrose tell you he was going to do?",
    keywords: ["letter", "told you", "november 1", "records", "statement", "deliver", "plans", "plan", "planning", "planned", "intend", "intended", "going to do", "meant to do"],
    reply: [
      "He wrote to me on the twenty-fifth. On November first he'd give me the foundation's land and consulting records and a signed statement about a girl's death in this house in 1998. I was to take them to the Attorney General and the police.",
      "Here's the letter. Read the second paragraph.",
    ],
    effects: [{ giveEvidence: "HE031" }],
  }),
  q({
    id: "byrne_trustee",
    characterId: "byrne",
    topic: "Ambrose",
    prompt: "Which trustee did Ambrose tell about his plans?",
    keywords: ["trustee", "one trustee", "told", "trustees", "board"],
    requires: ev("HE031"),
    reply: ["He didn't say. But since Constance left the board in 2012 there have been two trustees: Ambrose and Lucian Marsh. You can do that arithmetic as well as I can."],
  }),
  q({
    id: "byrne_envelope",
    characterId: "byrne",
    topic: "Ambrose",
    prompt: "Ambrose's note mentions an envelope for you, \"where the world is.\"",
    keywords: ["envelope", "where the world is", "world", "hidden", "statement", "globe"],
    requires: ev("HE008"),
    reply: [
      "\"Where the world is.\" He used to say that about the library. His grandfather bought the great globe for it in 1910 and Ambrose said he kept the world in the library.",
      "The globe opens at the equator. I'd look there.",
    ],
    effects: [{ setFlag: "globe_known" }],
  }),
  q({
    id: "byrne_josie",
    characterId: "byrne",
    topic: "The woman in black",
    prompt: "Did Ambrose invite anyone who isn't on the list?",
    keywords: ["thirteenth", "invite", "list", "extra guest", "veil", "woman"],
    reply: ["He said there'd be one guest he owed more than an invitation, and that he'd write to her himself. He never told me her name."],
  }),
  q({
    id: "byrne_will",
    characterId: "byrne",
    topic: "Ambrose",
    prompt: "Who inherits from Ambrose?",
    keywords: ["will", "inherit", "inherits", "heir", "money", "who gets"],
    reply: ["Felix inherits the house and most of the estate; the collection goes to the foundation. That's not privileged; it'll be public soon enough. And yes, I know about Felix's loan. Ambrose knew too."],
  }),

  // ---------------- Iris Kettering ----------------
  q({
    id: "iris_plans",
    characterId: "iris",
    topic: "The house",
    prompt: "Do you have plans of the house?",
    keywords: ["plans", "blueprint", "drawings", "1903", "architect", "floor plan"],
    reply: [
      "The 1903 drawings, yes, photocopies from Peabody and Lowe's archive in Boston. I brought them for Ambrose. He wanted to show the table something.",
      "Look at the second floor. The study has a jib bookcase in its north wall, a door made to look like shelves, onto a back stair down to the service passage.",
    ],
    effects: [{ giveEvidence: "HE021" }],
  }),
  q({
    id: "iris_carriage",
    characterId: "iris",
    topic: "The house",
    prompt: "What's happening with the carriage house?",
    keywords: ["carriage house", "renovation", "drainage", "november 5", "chamber", "pit"],
    reply: [
      "New drainage and a slab, starting November fifth. The architects are breaking out a bricked-over chamber under the old inspection pit. Bricked in 1998, which is odd for a building put up in 1903 and never touched since.",
      "Ambrose read that sheet for a long time. He wrote on it.",
    ],
  }),
  q({
    id: "iris_attic",
    characterId: "iris",
    topic: "The house",
    prompt: "Where are the house's old papers kept?",
    keywords: ["papers", "attic", "trunk", "archive", "old letters", "records"],
    reply: ["The foundation's in the library. The family's are in the attic: trunks and trunks. Ambrose wouldn't let me catalog those. He said some of them weren't history yet."],
    effects: [{ setFlag: "attic_known" }],
  }),
  q({
    id: "iris_why",
    characterId: "iris",
    topic: "Why you are here",
    prompt: "Why were you invited tonight?",
    keywords: ["invited", "why", "historian", "for the house"],
    reply: ["\"For the house,\" his note said. I think he wanted someone at the table who'd know whether what he said about the building was true."],
  }),

  // ---------------- Lt. Mahoney ----------------
  q({
    id: "mahoney_officers",
    characterId: "mahoney",
    topic: "The police",
    prompt: "What can your officers do?",
    keywords: ["officers", "reyes", "kwan", "help", "post", "guard", "protect", "watch"],
    repeatable: true,
    reply: [
      "Two officers, Reyes and Kwan. I can put one at the front gate where everybody can see her, or one on the back lane where nobody can, or one keeping a quiet eye on a witness. Each one goes once. Choose.",
      "Just tell me on the phone and I'll make it happen.",
    ],
  }),
  q({
    id: "mahoney_arrest",
    characterId: "mahoney",
    topic: "The police",
    prompt: "Can you arrest someone tonight?",
    keywords: ["arrest", "detain", "hold", "take him in", "cuff"],
    repeatable: true,
    reply: ["Not on a feeling. Bring me a reason he'd want Ambrose dead, in writing, and a way he could have got into that room, and I'll hold anybody you like."],
    variants: [{ requires: { all: [{ deduction: "HD09" }, { deduction: "HD10" }] }, reply: ["Now you've given me motive and a way in. Ask me to detain him and I'll do it."] }],
  }),
  q({
    id: "mahoney_lab",
    characterId: "mahoney",
    topic: "The police",
    prompt: "Can the lab check something for me?",
    keywords: ["lab", "test", "prints", "fingerprints", "forensic", "dna"],
    repeatable: true,
    reply: ["Springfield can lift a print tonight and run it against elimination prints from everybody in the house. Find me something a hand touched that nobody's hand should have touched, and tell me."],
  }),
  q({
    id: "mahoney_crane",
    characterId: "mahoney",
    topic: "Background",
    prompt: "What do you have on Lucian Marsh?",
    keywords: ["crane", "desmond", "background", "record", "run him"],
    reply: ["No record. Trustee of the foundation, lives in Pittsfield, two companies registered to him: Hollins Ridge Associates, dissolved 2001, and Marsh Advisory LLC, registered 2013. Clean as a whistle. Those are the ones I worry about."],
  }),
  q({
    id: "mahoney_lisle",
    characterId: "mahoney",
    topic: "Background",
    prompt: "What do you have on Annabel Lisle?",
    keywords: ["annabel", "lisle", "1998", "missing", "runaway"],
    requires: knows1998,
    reply: ["Harrow Falls PD, November 1998: missing juvenile, seventeen, last seen at a party at that house. Filed as a runaway on one witness's word. Nobody ever found her. Her sister's written to us every few years since."],
  }),
];

/* ---------------------------------------------------------------------- */
/* Reactions to evidence                                                   */
/* ---------------------------------------------------------------------- */

export const reactions: EvidenceReaction[] = [
  { characterId: "crane", evidenceId: "HE009", reply: ["Felix's or mine, it says. Or anyone's with a common thumb. I've been in that study a thousand times in forty years. So has Felix."] },
  { characterId: "crane", evidenceId: "HE029", reply: ["Wren's girl handed me a key. I've told you. I didn't open any stair."] },
  { characterId: "crane", evidenceId: "HE035", reply: ["That's Ambrose's version of a night twenty years ago, written by a frightened old man who was drinking. It isn't evidence of anything. I'd like my lawyer now."] },
  { characterId: "crane", evidenceId: "HE025", reply: ["God. That poor child. I had no idea. I had a pit bricked over. That's all I did."] },
  { characterId: "constance", evidenceId: "HE033", reply: ["Well. You've been in Isaac's room. Yes. For a year. That's why I lied about the conservatory. Ask him; he'll tell you who came through it."] },
  { characterId: "penrose", evidenceId: "HE033", reply: ["Ah. Yes. Constance and I. I'm sorry I wasn't straight with you. Ask me again where I was, and who I saw, and I'll answer properly."] },
  { characterId: "felix", evidenceId: "HE032", reply: ["Going through my bag. Lovely. Yes, I owe them. No, I didn't kill my father for it."] },
  { characterId: "beatrice", evidenceId: "HE016", reply: ["J. Lisle. Her mother sewed those tags in everything, both girls. Oh, God."] },
  { characterId: "beatrice", evidenceId: "HE014", reply: ["That's me, looking at her. Yes. I knew her. I knew her the moment she sat down."] },
  { characterId: "josie", evidenceId: "HE016", reply: ["My glove. That tag was on my mittens when I was nine; Mom sewed them on everything, both of us. I sewed it in myself. I wanted something from then with me tonight."] },
  { characterId: "josie", evidenceId: "HE025", reply: ["Her bangle. A.L., sixteen. Mom gave it to her. She's been here the whole time. A mile from home. The whole time."] },
  { characterId: "harriet", evidenceId: "HE020", reply: ["Cost and appraisal agree to the dollar, three times, and no appraiser named. That's what I was told to write. Annabel's card is still in the 1997 volume. Oh, that poor girl."] },
  { characterId: "amos", evidenceId: "HE004", reply: ["Those are my screw holes. Four brass screws, 1999. Somebody's had them out, and lately; look how bright the threads are."] },
  { characterId: "amos", evidenceId: "HE024", reply: ["They're breaking out the chamber on the fifth. I'd heard. Mr. Marsh's masons bricked that in November 1998, the week after the party."] },
  { characterId: "bridget", evidenceId: "HE018", reply: ["That's her hand. She used to leave notes in the kitchen for me with little circles over the i's."] },
  { characterId: "wren", evidenceId: "HE029", reply: ["That's my book. L.M., 7:10, lower stair door. My girl shouldn't have issued that key; it's marked sealed. And it's never been signed back in."] },
  { characterId: "iris", evidenceId: "HE004", reply: ["That's the jib bookcase from the 1903 drawings. The fourth section. It's been opened."] },
  { characterId: "byrne", evidenceId: "HE008", reply: ["E.B. is me. \"Where the world is.\" He meant the library globe. He always called it the world."], effects: [{ setFlag: "globe_known" }] },
  { characterId: "mahoney", evidenceId: "HE015", reply: ["Nobody out the front since 8:41. The lane gate's not on camera. Remember that."] },
];

export const contradictions: ContradictionDef[] = [
  {
    id: "x_crane_conservatory",
    characterId: "crane",
    title: "Lucian Marsh's whereabouts at 10:13 to 10:19",
    text: "Marsh says he was in the conservatory on a call from 10:08 until he heard the scream. Dr. Penrose and Constance Blackthorn, there from 10:05, say nobody made a call there, and that Marsh came in from the terrace at about 10:19, wet from the rain.",
    when: { all: [{ asked: "crane_evening" }, ev("HE028")] },
  },
  {
    id: "x_crane_stair",
    characterId: "crane",
    title: "Lucian Marsh and the lower stair door",
    text: "Marsh says he has not been in the back stair in twenty-five years. The key book has him signing out the sealed lower stair door key at 7:10 PM, and it was never signed back in.",
    when: { all: [{ asked: "crane_stair" }, ev("HE029")] },
  },
  {
    id: "x_constance",
    characterId: "constance",
    title: "Constance Blackthorn's account of the conservatory",
    text: "Constance said she was alone in the conservatory for air. Her letters show she arranged to meet Dr. Penrose there.",
    when: { all: [{ asked: "constance_evening" }, ev("HE033")] },
  },
  {
    id: "x_beatrice",
    characterId: "beatrice",
    title: "Beatrice Holloway and the woman in black",
    text: "Beatrice said she had no idea who the woman at the foot of the table was. Wren's 9:05 photograph shows her staring at the woman through dinner.",
    when: { all: [{ asked: "beatrice_veil" }, ev("HE014")] },
  },
];

// Each person's knowledge: their own account, gated exactly like their answers.
for (const c of characters) {
  const k = knowledgeFor(c.id, questions);
  if (k.length) c.knowledge = k;
  if (PERSONA[c.id]) c.persona = PERSONA[c.id];
  if (PATIENCE[c.id]) c.patience = PATIENCE[c.id];
}
