import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * C005 interviews, written against docs/C005-timeline.md.
 *
 * Rules for this file: nobody confesses; Matthias and Geoffrey give their own
 * accounts, lies included; Simon, Peter, Margery and Alice hide things at
 * first for their own reasons and tell them once given cause; nobody names a
 * clock hour, only the abbey's offices; no one speaks of police, laboratories
 * or anything a medieval eye could not see. Peter is a novice of seventeen and
 * is never pressed hard. Nobody says who struck Edmund.
 */

const never: Condition = { not: { always: true } };
const atMill: Condition = { event: "RE05" };
const beforeFled: Condition = { not: { event: "RE03" } };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The victim: in the commission and on the table, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "edmund",
    name: "Brother Edmund",
    role: "Scholar, keeper of the register. Found dead Monday",
    portrait: "char.edmund",
    bio: [
      { text: "Fifty-two. A monk of Saint Aldwyn's for thirty years, the best scholar in the house, keeper of the register and of charters in use." },
      { text: "Found dead in the book room after Compline on Monday, October 19, behind a barred door." },
      { text: "In his last weeks he was copying the Fellbeck confirmation into the register, and doubting it.", requires: { hasEvidence: "E14" } },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },

  // ---------------------------------------------------------------------
  // The abbey
  // ---------------------------------------------------------------------
  {
    id: "abbot",
    name: "Abbot Benedict",
    role: "Abbot of Saint Aldwyn's",
    portrait: "char.abbot",
    bio: [
      { text: "Sixty-one. Abbot for thirteen years. A careful steward of a poor house, and anxious to keep peace with its patron, Lord Roland of Ashcombe." },
      { text: "Holds that Brother Edmund died of a seizure.", requires: { not: { deduction: "D01" } } },
      { text: "Half-promised Lord Roland the Fellbeck meadows if the writing proved good.", requires: { event: "RE08" } },
    ],
    available: { always: true },
    locationId: "abbot_chamber",
    onBoard: true,
    defaultEvidenceReply: "I do not see what that has to do with a poor old man's heart.",
    idleLine: "That is enough for today. God keep you.",
    noAnswer: ["I could not say.", "That is not something an abbot is told.", "I do not know, and I would rather not guess."],
    voice: {
      voiceId: "JBFqnCBsd6RMkjVDRZzb",
      direction: "Man of sixty, an abbot, warm, weary and careful, used to being obeyed and to smoothing things over. Northern English.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "gracious", label: "Gracious", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { flag: "archive_closed" }, cue: "The abbot's courtesy has a door in it now, and the door is shut." },
      { id: "troubled", label: "Troubled", requires: { deduction: "D01" }, cue: "The abbot is not looking at you. He is looking at the floor of his own chamber." },
      { id: "resolved", label: "Resolved", requires: { event: "RE08" }, cue: "The abbot sits straighter. Whatever he decided, he has decided it." },
    ],
  },
  {
    id: "matthias",
    name: "Brother Matthias",
    role: "Cellarer",
    portrait: "char.matthias",
    bio: [
      { text: "Forty-six. Cellarer of Saint Aldwyn's: the stores, the rents, the leases, the abbey's money. Disciplined, exact, outwardly devout." },
      { text: "Wrote a fair book hand in the scriptorium before he took the cellar's keys.", requires: { asked: "thomas_matthias" } },
    ],
    available: { always: true },
    locationId: "cellar",
    onBoard: true,
    defaultEvidenceReply: "That is not the cellar's business.",
    idleLine: "I have nothing more to say to you.",
    noAnswer: ["I could not say.", "The cellar does not concern itself with that.", "Ask someone whose office it is."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man in his mid forties, a monk and administrator, precise, controlled, quietly cold. Never raises his voice. Northern English.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "courteous", label: "Courteous", requires: { always: true } },
      { id: "measured", label: "Measured", requires: { any: [{ hasEvidence: "E16" }, { hasEvidence: "E14" }] }, cue: "The cellarer folds his hands. He chooses every word now." },
      { id: "cold", label: "Cold", requires: { any: [{ hasEvidence: "E26" }, { hasEvidence: "E30" }] }, cue: "Something in the cellarer's face has closed, like a ledger." },
      {
        id: "declining",
        label: "Declining to answer",
        requires: { hasEvidence: "E31" },
        refuses: "You have been in my salt. I will say nothing more without the abbot present, and very little with him.",
        cue: "The cellarer turns back to his tallies and does not turn round again.",
      },
    ],
  },
  {
    id: "thomas",
    name: "Brother Thomas",
    role: "Librarian",
    portrait: "char.thomas",
    bio: [
      { text: "Thirty-four. Librarian of Saint Aldwyn's. Edmund's pupil and friend. Found the body after Compline on Monday." },
      { text: "Lent Edmund his key to the muniment room, against the rule.", requires: { asked: "thomas_key" } },
    ],
    available: { always: true },
    locationId: "scriptorium",
    onBoard: true,
    defaultEvidenceReply: "I'd need to sit with that a while before I said anything.",
    idleLine: "I can't. Not today. Come back tomorrow.",
    noAnswer: ["I don't know.", "Edmund never told me that.", "I wish I did."],
    voice: {
      voiceId: "Zlb1dXrM653N07WRdFW3",
      direction: "Man in his mid thirties, a monk and librarian, gentle, clever, grieving, a little ashamed of himself. Northern English.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "grieving", label: "Grieving", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: { asked: "thomas_charter" }, cue: "Thomas wipes his eyes and pulls up a stool for you. This, at least, he can do." },
      { id: "ashamed", label: "Ashamed", requires: { asked: "thomas_key" }, cue: "Thomas cannot quite look at you." },
      { id: "steadfast", label: "Steadfast", requires: { event: "RE05" }, cue: "Thomas looks like a man who has slept for the first time in days." },
    ],
  },
  {
    id: "peter",
    name: "Novice Peter",
    role: "Novice, seventeen",
    portrait: "char.peter",
    bio: [
      { text: "Seventeen. A novice of a year. Helps Brother Simon with the bells. His parents are dead; he grew up at Hollin Bridge." },
      { text: "Heard voices in the book room during the Collation on Monday." },
      { text: "Missing from the abbey since the night after you came.", requires: { all: [{ event: "RE03" }, { not: atMill }] } },
      { text: "Sheltering with his aunt, Alice Miller, at the mill at Hollin Bridge.", requires: atMill },
    ],
    available: { any: [beforeFled, atMill] },
    locationId: "cloister",
    moves: [{ when: atMill, locationId: "mill" }],
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I'm sorry.",
    idleLine: "I've told you everything. Please.",
    noAnswer: ["I don't know.", "I didn't see that.", "I'm sorry, I don't know."],
    voice: {
      voiceId: "SOYHLrjzK2X1ezoPC6cr",
      direction: "A boy of seventeen, a novice, nervous, honest, frightened, trying hard to be brave. Northern English.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "evasive", label: "Evasive", requires: { asked: "peter_court" }, cue: "Peter's eyes go to the cloister door, and stay there." },
      { id: "frightened", label: "Frightened", requires: atMill, cue: "Peter sits on the bottom rung of the loft ladder, wrapped in a blanket, and won't let go of the cup." },
      { id: "steadier", label: "Steadier", requires: { all: [atMill, { asked: "peter_why" }] }, cue: "Peter's hands have stopped shaking." },
      { id: "brave", label: "Brave", requires: { hasEvidence: "E30" }, cue: "Peter sits up straight. He has said it, and the roof has not fallen in." },
    ],
  },
  {
    id: "anselm",
    name: "Brother Anselm",
    role: "Sacristan",
    portrait: "char.anselm",
    bio: [
      { text: "Fifty-seven. Sacristan: the church's furnishings, its lights and its wine, and the second key to the cellarer's passage. Helped force the book room door." },
    ],
    available: { always: true },
    locationId: "church",
    onBoard: true,
    defaultEvidenceReply: "That's not church property. Not my department.",
    idleLine: "That's all. The sacristy's waiting.",
    noAnswer: ["I couldn't say.", "I was seeing to the lamps.", "Ask the cellarer, it's his sort of thing."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man in his late fifties, a fussy, house-proud sacristan, quick to take offense and quick to be sorry. Northern English.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "fussy", label: "Fussy", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { hasEvidence: "E20" }, cue: "Anselm keeps glancing at the Lady altar." },
      { id: "contrite", label: "Contrite", requires: { asked: "anselm_returned" }, cue: "Anselm's shoulders have come down. He looks older." },
    ],
  },
  {
    id: "agnes",
    name: "Sister Agnes",
    role: "Infirmarian, from Thornholme Priory",
    portrait: "char.agnes",
    bio: [
      { text: "Forty-three. Infirmarian of Thornholme Priory, eight miles east, lodging in the guest-house to nurse Saint Aldwyn's old infirmarian, Brother Odo." },
      { text: "Saw Brother Edmund's body on Monday night and washed it for burial." },
    ],
    available: { always: true },
    locationId: "infirmary",
    onBoard: true,
    defaultEvidenceReply: "I can tell you what I see. I can't tell you more than that.",
    idleLine: "I'm needed in the infirmary. Come if you need my eyes again.",
    noAnswer: ["I didn't see that.", "I can't say what I didn't see.", "That's beyond what I know."],
    voice: {
      voiceId: "pFZP5JQG7iQjIQuC4Bku",
      direction: "Woman in her early forties, a nun and nurse, calm, exact, unafraid, kind without softness. Northern English.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "precise", label: "Precise", requires: { always: true } },
      { id: "candid", label: "Candid", requires: { asked: "agnes_seizure" }, cue: "Agnes puts down the linen she is folding and gives you her whole attention." },
    ],
  },
  {
    id: "simon",
    name: "Brother Simon",
    role: "Bell ringer",
    portrait: "char.simon",
    bio: [{ text: "Twenty-five. Rings the bells under the sacristan. Cheerful, proud of his ringing, and ashamed when it goes wrong." }],
    available: { always: true },
    locationId: "tower",
    onBoard: true,
    defaultEvidenceReply: "I'm only the ringer. That's beyond me.",
    idleLine: "I have to ring for None. Sorry!",
    noAnswer: ["I don't know, brother.", "I was up the tower.", "Couldn't tell you."],
    voice: {
      voiceId: "bIHbv24MWmeRgasZH58o",
      direction: "Young man of twenty-five, a monk and bell ringer, cheerful, eager, easily embarrassed. Northern English, Yorkshire.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "cheerful", label: "Cheerful", requires: { always: true } },
      { id: "embarrassed", label: "Embarrassed", requires: { asked: "simon_compline" }, cue: "Simon has gone red to the tonsure." },
      { id: "earnest", label: "Earnest", requires: { hasEvidence: "E23" }, cue: "Simon looks relieved to have told it straight." },
    ],
  },
  {
    id: "william",
    name: "William Carter",
    role: "Gatekeeper",
    portrait: "char.william",
    bio: [{ text: "Forty-two. The abbey's lay gatekeeper. Keeps the gate roll, a line for every comer, and bars the gate at Compline." }],
    available: { always: true },
    locationId: "gatehouse",
    onBoard: true,
    defaultEvidenceReply: "Can't read much beyond names and days, myself.",
    idleLine: "I've a gate to keep. You know where I am.",
    noAnswer: ["Couldn't say.", "Not from the gate, I didn't.", "You'd want the brothers for that."],
    voice: {
      voiceId: "CYw3kZ02Hs0563khs1Fj",
      direction: "Man in his early forties, a lay gatekeeper, plain spoken, steady, a working man. Northern English.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "plain", label: "Plain", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: { asked: "william_monday" }, cue: "William leans on the window ledge, settling in." },
    ],
  },
  {
    id: "margery",
    name: "Margery",
    role: "Cook in the guest kitchen",
    portrait: "char.margery",
    bio: [
      { text: "Fifty. Cooks in the guest-house kitchen in the west range, by the kitchen court and the end of the cellarer's passage." },
      { text: "Came forward on her own to say what she saw on Monday evening.", requires: { event: "RE04" } },
    ],
    available: { always: true },
    known: { any: [{ talkedTo: "margery" }, { event: "RE04" }] },
    locationId: "cellar",
    onBoard: true,
    defaultEvidenceReply: "I can't read, love. Tell me what it says.",
    idleLine: "I've said my piece. I've a kitchen to run.",
    noAnswer: ["I was at my pots.", "Don't know, love.", "Ask the brothers."],
    voice: {
      voiceId: "XB0fDUnXU5powFXDhCwa",
      direction: "Woman of fifty, a cook, brisk, warm, wary of losing her place, plain spoken. Northern English, Yorkshire.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "busy", label: "Busy", requires: { always: true } },
      { id: "fearful", label: "Fearful", requires: { all: [{ asked: "margery_monday" }, { not: { event: "RE04" } }] }, cue: "Margery glances toward the cellar door before she answers." },
      { id: "forthcoming", label: "Forthcoming", requires: { event: "RE04" }, cue: "Margery wipes her hands and sits down. She has decided." },
    ],
  },

  // ---------------------------------------------------------------------
  // The manor and the mill
  // ---------------------------------------------------------------------
  {
    id: "roland",
    name: "Lord Roland Ashcombe",
    role: "Lord of Ashcombe, the abbey's patron",
    portrait: "char.roland",
    bio: [
      { text: "Fifty-five. Lord of Ashcombe Hall, three miles up the moor, and patron of Saint Aldwyn's, as his fathers were. Means to enclose the Fellbeck meadows for sheep." },
      { text: "Sealed the warning letter his steward wrote.", requires: { asked: "roland_warning" } },
    ],
    available: { always: true },
    locationId: "manor",
    onBoard: true,
    defaultEvidenceReply: "My steward deals in paper. I deal in land.",
    idleLine: "Enough. My steward will see you out.",
    noAnswer: ["I have no idea.", "Ask my steward.", "That is beneath my notice."],
    voice: {
      voiceId: "2EiwWnXFnvU5JabPnv8n",
      direction: "Man in his mid fifties, a country lord, haughty, impatient, blunt, not cunning. Northern English, gentry.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "haughty", label: "Haughty", requires: { always: true } },
      { id: "impatient", label: "Impatient", requires: { asked: "roland_writing" }, cue: "Lord Roland drums his fingers on the table." },
      { id: "wary", label: "Wary", requires: { event: "RE06" }, cue: "Lord Roland has sent the hound out, and his steward with it." },
    ],
  },
  {
    id: "geoffrey",
    name: "Geoffrey Hale",
    role: "Steward of Ashcombe Hall",
    portrait: "char.geoffrey",
    bio: [
      { text: "Forty-nine. Lord Roland's steward: his rents, his letters, his lawsuits. Laid the Fellbeck confirmation before the abbot at Michaelmas." },
    ],
    available: { always: true },
    locationId: "manor",
    onBoard: true,
    defaultEvidenceReply: "I don't see what that has to do with my lord's business.",
    idleLine: "We're done. Speak to my lord if you must.",
    noAnswer: ["I couldn't say.", "That's no concern of the manor's.", "I don't recall."],
    voice: {
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      direction: "Man of fifty, a steward, smooth, plausible, quick, self-serving, a lawyer's manner. Northern English.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "smooth", label: "Smooth", requires: { always: true } },
      { id: "evasive", label: "Evasive", requires: { hasEvidence: "E25" }, cue: "Geoffrey smiles a little too long before each answer." },
      { id: "rattled", label: "Rattled", requires: { presented: "geoffrey:E17" }, cue: "Geoffrey has gone pale around the mouth." },
      { id: "self_serving", label: "Self-serving", requires: { event: "RE06" }, cue: "Geoffrey speaks as if he were reading from his own letter." },
    ],
  },
  {
    id: "alice",
    name: "Alice Miller",
    role: "The miller's wife at Hollin Bridge, Peter's aunt",
    portrait: "char.alice",
    bio: [{ text: "Thirty-eight. Wife of John Miller, who holds the abbey's mill at Hollin Bridge on a lease. Peter's mother was her sister." }],
    available: atMill,
    known: { any: [atMill, { hasEvidence: "E28" }, { asked: "william_peter" }] },
    locationId: "mill",
    onBoard: true,
    defaultEvidenceReply: "I can't read that. Tell me if it helps the boy.",
    idleLine: "That's all. Go gently with him.",
    noAnswer: ["I don't know.", "I'm a miller's wife, not a clerk.", "You'd have to ask Peter."],
    voice: {
      voiceId: "ThT5KcBeYPX3keUQqHPh",
      direction: "Woman in her late thirties, a miller's wife, protective, wary, practical, warm underneath. Northern English, Yorkshire.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "wary", label: "Wary", requires: { always: true } },
      { id: "protective", label: "Protective", requires: { asked: "alice_peter" }, cue: "Alice stands between you and the loft ladder without seeming to." },
      { id: "relieved", label: "Relieved", requires: { asked: "alice_back" }, cue: "Alice lets out a long breath." },
    ],
  },

  // ---------------------------------------------------------------------
  // The archdeacon, by letter
  // ---------------------------------------------------------------------
  {
    id: "archdeacon",
    name: "Master Hugh Selwood",
    role: "Archdeacon of Wendale, by letter",
    portrait: "char.archdeacon",
    bio: [{ text: "Archdeacon of Wendale, on visitation at Kirkby, five miles down the dale. Commissioned you. Answers your letters by return of messenger." }],
    available: { always: true },
    locationId: "chamber",
    medium: "telephone",
    contact: "Write to him at Kirkby. He answers by return.",
    onBoard: false,
    defaultEvidenceReply: "Describe it to me plainly in your next letter and I will tell you what I make of it.",
    idleLine: "Write again when you need me.",
    noAnswer: ["The diocese has nothing on that.", "I cannot tell you that from Kirkby.", "That is for you to find out, not me."],
    voice: {
      voiceId: "GBv7mTt0atIp3Br8iCZE",
      direction: "Man in his fifties, a senior churchman and lawyer, dry, exact, patient, quietly humorous. Educated northern English.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
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
  // Abbot Benedict
  // =====================================================================
  q("abbot", "Edmund", "abbot_welcome", "What happened to Brother Edmund?", [
    "He went to the book room after Vespers, as he did most evenings, and he did not come to Compline. Brother Thomas went to fetch him and found the door barred.",
    "When they forced it he was on the floor. Old men's hearts give out. Or the falling sickness. He struck his head as he fell. That is all.",
  ], { reveals: "The abbot says Edmund died of a seizure or a failing heart and struck his head as he fell." }),
  q("abbot", "Edmund", "abbot_edmund", "Tell me about Brother Edmund.", [
    "The best mind in this house. Thirty years a monk. He kept the register and every charter we had in use, and he could read a hand two hundred years old as easily as you read mine.",
    "He was also stubborn, and he worked too late by too little light.",
  ]),
  q("abbot", "Monday", "abbot_evening", "Where was everyone on Monday evening?", [
    "At Vespers, all of us. Edmund too. Afterward he went off to his book room instead of to the drink; Thomas saw him go.",
    "Brother Matthias served the drink, as cellarer, and asked my leave to go and lock the cellar before the Collation. I gave it. Then the rest of us went to the chapter house for the reading. Thomas read. I presided.",
  ], {
    reveals: "Edmund went to the book room after Vespers. The cellarer served the evening drink, then had the abbot's leave to lock the cellar before the Collation.",
    effects: [tl("After Vespers (Mon)", "Brother Matthias serves the evening drink, then leaves with the abbot's leave 'to lock the cellar' before the Collation.", "Abbot Benedict")],
  }),
  q("abbot", "Monday", "abbot_found", "How was he found?", [
    "After Compline. Thomas missed him and went to the book room. The door would not open; the bar was down inside. He fetched Brother Anselm and two others and they forced it with a bench.",
    "They came for me. I sent for Sister Agnes from the guest-house. There was nothing to be done.",
  ]),
  q("abbot", "Edmund", "abbot_seizure", "Why do you say it was a seizure?", [
    "Because the door was barred from the inside, and he was alone, and old. What else could it be?",
  ], { variants: [{ requires: { deduction: "D01" }, reply: ["Because I wanted it to be. A seizure is God's will. Anything else is a scandal in my house, and the house has a patron who would like a scandal very much."] }] }),
  q("abbot", "The writing", "abbot_charter", "What writing is missing from Edmund's keeping?", [
    "A confirmation, very old, concerning our meadows at Fellbeck. The steward of Ashcombe laid it before me at Michaelmas. I gave it to Edmund to enter in the register and to tell me what he made of it.",
    "It is a matter of land, between this house and Lord Roland. It is for the lawyers.",
  ], { reveals: "The missing writing is an old confirmation about the Fellbeck meadows, laid before the abbot by Ashcombe's steward at Michaelmas." }),
  q("abbot", "The writing", "abbot_archive", "May I see the muniment room?", [
    "No. It is kept under three keys, mine, the prior's and the librarian's, and they stay where they are. You were sent to look into a death.",
  ], { variants: [{ requires: { event: "RE08" }, reply: ["It is open to you. Brother Thomas will show you the seal drawer and the necrology, whatever you need."] }] }),
  q("abbot", "Ashcombe", "abbot_roland", "Tell me about Lord Roland.", [
    "Our patron, as his fathers were before him. A proud man and a hard one. He wants Fellbeck for sheep; wool pays better than tenants.",
    "This house is poor. I cannot afford to quarrel with him.",
  ]),
  q("abbot", "The house", "abbot_matthias", "Tell me about Brother Matthias.", [
    "My cellarer. Exact, tireless, devout. He keeps our stores, our rents and our leases, and he has kept this house out of debt when I could not.",
    "I would trust him with the abbey's last penny. I have.",
  ]),
  q("abbot", "The writing", "abbot_rent", "Did you give leave for the Ashcombe pasture rent to be remitted?", [
    "No. Never. I saw it in the cellarer's account at Michaelmas and wrote my question in the margin.",
    "He has not answered me. I have not pressed him. I should have.",
  ], { requiresEvidence: ["E15"], reveals: "The abbot never gave leave for the Ashcombe pasture rent to be remitted." }),
  q("abbot", "Ashcombe", "abbot_promise", "Did you promise Lord Roland anything?", [
    "At Michaelmas, when the steward showed me the writing, I told Lord Roland that if it proved good I would not fight him for Fellbeck.",
    "I wanted peace with him. That is all I wanted. God forgive me, I hoped Edmund would say it was good.",
  ], { requires: { event: "RE08" }, reveals: "At Michaelmas the abbot told Lord Roland he would not fight him for Fellbeck if the writing proved good." }),
  q("abbot", "The house", "abbot_peter", "Tell me about Novice Peter.", [
    "A good boy. A year with us. He helps Brother Simon with the bells. He heard voices from the book room, he says; boys hear things.",
  ], { variants: [{ requires: { event: "RE03" }, reply: ["We have searched the mill-race. Every brother who can walk is out on the beck. If he is drowned it is on my soul, for I let this go on."] }, { requires: atMill, reply: ["Alive. Thank God. Alive at Hollin Bridge."] }] }),
  q("abbot", "Monday", "abbot_compline", "Was Brother Matthias at Compline?", [
    "He was in his stall at the end, I know that. I did not see him come in. I was not looking for him.",
  ]),

  // =====================================================================
  // Brother Matthias
  // =====================================================================
  q("matthias", "The cellar", "matthias_who", "What are your duties here?", [
    "The cellar, the stores, the rents and the leases. Everything the abbey eats or sells or owes passes through my hands.",
    "It leaves little time for anything else.",
  ]),
  q("matthias", "Edmund", "matthias_edmund", "Tell me about Brother Edmund.", [
    "A learned man. Old, and his eyes were going; he borrowed candles from the church to see by. God rest him.",
  ]),
  q("matthias", "Monday", "matthias_evening", "Where were you on Monday evening?", [
    "At Vespers. Then I served the drink in the refectory, as I always do, and asked the lord abbot's leave to lock the cellar before the reading.",
    "Then to the church for Compline.",
  ], { reveals: "Matthias says that after serving the drink he locked the cellar, then went to the church for Compline." }),
  q("matthias", "Monday", "matthias_compline", "When did you come into the church for Compline?", [
    "I was in my stall before the great bell finished tolling. I always am.",
  ], { reveals: "Matthias says he was in his stall before the great bell finished tolling for Compline." }),
  q("matthias", "The passage", "matthias_passage", "Who uses the passage behind the book room?", [
    "I do, and the sacristan. Candles, oil, wine for the Mass, parchment for the scriptorium. It saves the brothers carrying stores through the cloister.",
    "I was not in it on Monday evening, if that is your question.",
  ], { reveals: "Matthias says only he and the sacristan hold keys to the passage, and that he was not in it on Monday evening." }),
  q("matthias", "Edmund", "matthias_rolls", "Did Edmund ask you for anything on Monday?", [
    "Nothing I could give him.",
  ], { variants: [{ requires: { hasEvidence: "E14" }, reply: ["He asked for the old rent rolls. They are the cellar's business, not the book room's. I told him so."] }] }),
  q("matthias", "The writing", "matthias_charter", "What do you know about the Fellbeck writing?", [
    "What the abbot told chapter at Michaelmas: that the steward of Ashcombe had found an old confirmation, and that Edmund was to look at it. Land is the abbot's affair.",
  ]),
  q("matthias", "Ashcombe", "matthias_geoffrey", "Do you know Geoffrey Hale?", [
    "The steward. He comes about tithes and barley twice a year. I hardly know him.",
  ]),
  q("matthias", "Money", "matthias_rent", "Why did you remit Lord Roland's pasture rent?", [
    "With the lord abbot's leave, for the lord's good will. A poor house cannot afford to anger its patron over forty shillings.",
  ], { requiresEvidence: ["E15"], reveals: "Matthias says he remitted the Ashcombe pasture rent with the abbot's leave." }),
  q("matthias", "Money", "matthias_founder", "What did you pay Robert the founder at York for?", [
    "The great bell's clapper. It was worn. The founder recast it.",
  ], { requiresEvidence: ["E16"], reveals: "Matthias says the payment to the founder at York was for recasting the great bell's clapper." }),
  q("matthias", "Money", "matthias_parchment", "Why does the cellar buy parchment, ink and wax?", [
    "Leases. Every lease is written twice, one for us and one for the tenant. I write them myself rather than trouble the scriptorium.",
  ], { requiresEvidence: ["E16"] }),
  q("matthias", "The passage", "matthias_sleeve", "How did you tear your sleeve?", [
    "On a cask hoop, on Tuesday morning. The cellar is full of them.",
  ], { requiresEvidence: ["E07"], reveals: "Matthias says he tore his sleeve on a cask hoop on Tuesday morning." }),
  q("matthias", "Peter", "matthias_peter", "Did you speak to Novice Peter after Monday?", [
    "I sent for him at Prime on Tuesday to fetch bread for the guest-house. Nothing else.",
  ], { variants: [{ requires: { hasEvidence: "E30" }, reply: ["The boy is fanciful, and frightened of his own shadow. Whatever he says, he says it from a loft."] }] }),
  q("matthias", "Ashcombe", "matthias_letter", "What is this letter from the steward?", [
    "Business between the cellar and the manor. Barley.",
    "I have nothing more to say about it.",
  ], { requiresEvidence: ["E17"] }),
  q("matthias", "Edmund", "matthias_hand", "Did you once work in the scriptorium?", [
    "Twenty years ago. I copied psalters before I was given the keys. My hand is a cellarer's hand now.",
  ], { requires: { asked: "thomas_matthias" } }),

  // =====================================================================
  // Brother Thomas
  // =====================================================================
  q("thomas", "Monday", "thomas_found", "Tell me how you found him.", [
    "He wasn't at Compline. He never missed it. After, in the silence, I went to the book room and knocked. Nothing. The door held; the bar was down inside.",
    "I fetched Anselm and two of the brothers and we broke it with the bench off the walk. He was on the floor. It was dark in there. His candle was gone.",
  ], { reveals: "Thomas found the door barred after Compline. When they forced it the room was dark and Edmund's candlestick was gone." }),
  q("thomas", "Monday", "thomas_monday", "What did Edmund do on Monday evening?", [
    "After Vespers he went to the book room instead of to the drink. I saw him go, with the candlestick Anselm lent him, lit.",
    "That's the last I saw of him alive.",
  ], {
    reveals: "Thomas saw Edmund go to the book room after Vespers with the borrowed candlestick, lit.",
    effects: [tl("After Vespers (Mon)", "Edmund goes to the book room with his borrowed candlestick, lit.", "Brother Thomas")],
  }),
  q("thomas", "Monday", "thomas_collation", "Did anyone leave the Collation?", [
    "The cellarer had the abbot's leave before we began; he wasn't there at all. And I sent Peter to the kitchen for oil, because the lamp was low and I was reading.",
    "He was gone far longer than he should have been. He came back white as a sheet, after the bell.",
  ], { reveals: "The cellarer was not at the Collation. Thomas sent Peter for oil; he was gone a long time and came back after the bell." }),
  q("thomas", "Edmund", "thomas_edmund", "Tell me about Edmund.", [
    "He taught me to read old hands. He was patient with me for ten years. He'd hold a charter up to the window and tell you who wrote it and roughly when, and be right.",
  ]),
  q("thomas", "Edmund", "thomas_worry", "Was Edmund troubled in his last days?", [
    "He was. On Monday morning he said he would lay something before the lord abbot at chapter on Tuesday. He wouldn't tell me what. He said, better you don't know until it's said aloud.",
  ], { reveals: "On Monday morning Edmund told Thomas he would lay something before the abbot at chapter on Tuesday." }),
  q("thomas", "The writing", "thomas_charter", "What was Edmund working on?", [
    "The Fellbeck confirmation. The abbot gave it to him at Michaelmas to copy into the register and judge. For three weeks he copied it and stopped, and held it to the candle, and turned it over.",
    "He didn't like it. I could see that much.",
  ], { reveals: "Edmund had been copying the Fellbeck confirmation for three weeks and did not trust it." }),
  q("thomas", "The writing", "thomas_grant", "Do you have the old grant of Fellbeck?", [
    "Edmund borrowed it from the muniment room on Saturday to compare, and gave it back to me on Monday morning. It's here. Take it.",
  ], { requires: { any: [{ hasEvidence: "E08" }, { asked: "thomas_charter" }] }, effects: [{ giveEvidence: "E09" }] }),
  q("thomas", "The writing", "thomas_key", "How did Edmund get into the muniment room?", [
    "With my key. It's under three keys, and one is mine. He asked and I lent it. It's against the rule.",
    "I haven't told the abbot. I'm telling you.",
  ], { requiresEvidence: ["E08"], reveals: "Thomas lent Edmund his key to the muniment room, against the rule." }),
  q("thomas", "The writing", "thomas_seals", "Tell me about the abbey's seal.", [
    "There have been two. The old one showed Saint Aldwyn seated with his book. It cracked, and a new one was cut at York; now he stands under a canopy. The chronicle has the year.",
  ]),
  q("thomas", "The house", "thomas_matthias", "Tell me about Brother Matthias.", [
    "The cellarer. Before he took the keys he was in the scriptorium, years ago. He wrote a fair book hand. Better than mine.",
    "I don't know why I said that. Forgive me.",
  ], { requires: { any: [{ hasEvidence: "E16" }, { hasEvidence: "E14" }] }, reveals: "Before he became cellarer, Matthias wrote a fair book hand in the scriptorium." }),
  q("thomas", "The writing", "thomas_hands", "How can you tell an old hand from a new one?", [
    "Look at the a, the s and the d. The old hand makes a single round a and a tall s; we make a double a, a short s, and a d that loops over. The exemplar book shows them side by side.",
  ]),
  q("thomas", "Peter", "thomas_peter", "Tell me about Peter.", [
    "A good boy, and a frightened one this week. He hasn't eaten. Edmund was kind to him.",
  ], { variants: [{ requires: { event: "RE03" }, reply: ["Gone. His cloak folded on the bench like an apology. He wouldn't leave it unless he meant not to be a thief. He's not drowned. I won't believe he's drowned."] }, { requires: atMill, reply: ["At the mill. Thank God. Thank God."] }] }),
  q("thomas", "The writing", "thomas_compare", "Will you help me compare the writings?", [
    "Gladly. Lay them side by side at your lectern. Choose a passage and tell me what differs; I'll tell you if you're right, and set my name to it.",
  ], { repeatable: true }),

  // =====================================================================
  // Novice Peter: in the cloister (before he runs) and at the mill
  // =====================================================================
  q("peter", "Monday", "peter_voices", "What did you hear on Monday evening?", [
    "At the reading, Brother Thomas sent me to the kitchen for oil. Going along the west walk I heard voices in the book room. Loud. Brother Edmund said, 'The lord abbot shall see it at chapter.'",
    "The other voice was low. I didn't stop. I'm sorry.",
  ], {
    requires: beforeFled,
    reveals: "Passing the book room during the Collation, Peter heard Edmund say, 'The lord abbot shall see it at chapter.' The other voice was low.",
    effects: [tl("Before Compline (Mon)", "Raised voices in the book room. Edmund: 'The lord abbot shall see it at chapter.'", "Novice Peter")],
  }),
  q("peter", "Monday", "peter_voice_who", "Whose was the other voice?", [
    "I couldn't tell. It was low. A man's.",
  ], { requires: beforeFled }),
  q("peter", "Monday", "peter_oil", "What did you do after you heard the voices?", [
    "I went to the kitchen for the oil and came straight back with it. Straight back.",
  ], { requires: beforeFled, reveals: "Peter says he went to the kitchen for oil and came straight back." }),
  q("peter", "Monday", "peter_court", "Did you see anyone in the kitchen court?", [
    "No. No one.",
  ], { requires: beforeFled }),
  q("peter", "About him", "peter_who", "Tell me about yourself.", [
    "I've been a novice a year. I help Brother Simon with the bells. I grew up at Hollin Bridge. My mother and father are dead.",
  ], { requires: beforeFled }),
  q("peter", "About him", "peter_afraid", "Are you afraid of something?", [
    "No. May I go? The novice master will be looking for me.",
  ], { requires: beforeFled }),
  q("peter", "The mill", "peter_why", "Why did you run?", [
    "Because you asked about the passage, and I knew they'd make me swear. I can't lie under oath. And I couldn't tell the truth. So I ran.",
  ], { requires: atMill }),
  q("peter", "The mill", "peter_fire", "Where were you really, after you heard the voices?", [
    "By Margery's fire. She gave me bread. I knew I should hurry back and I didn't. I'm sorry I lied about that.",
  ], { requires: atMill, reveals: "Peter admits he sat by Margery's fire instead of hurrying back with the oil." }),
  q("peter", "The mill", "peter_saw", "What did you see in the kitchen court?", [
    "When the hand bell rang I ran out, and Brother Matthias came out of the passage door. He had no light. He was holding something against himself under his scapular. Something heavy.",
    "He saw me. He looked at me, and then he went on toward the salt store.",
  ], {
    requires: atMill,
    reveals: "As the hand bell rang, Peter saw Brother Matthias come out of the passage door without a light, holding something heavy under his scapular.",
    effects: [tl("At the Compline bell (Mon)", "Peter sees Brother Matthias come out of the passage door into the kitchen court, carrying something under his scapular.", "Novice Peter")],
  }),
  q("peter", "The mill", "peter_threat", "Did someone threaten you?", [
    "On Tuesday at Prime he sent for me to the cellar. He said I'd seen the cellarer fetching candles and nothing else. He said a novice who lies under oath is put out of the abbey as a liar.",
    "And he said my aunt's lease on the mill comes up at Martinmas, and it's his to renew.",
  ], { requires: atMill, reveals: "At Prime on Tuesday, Matthias told Peter he had seen nothing but the cellarer fetching candles, and reminded him the mill's lease was his to renew." }),
  q("peter", "The mill", "peter_carrying", "What was he carrying?", [
    "I don't know. Something long and heavy, held against his chest. I didn't see.",
  ], { requires: atMill }),
  q("peter", "The mill", "peter_blow", "Did you see what happened to Edmund?", [
    "No. I never saw anyone hurt him. I only heard them, and later I saw where he came out. That's all I know.",
  ], { requires: atMill }),
  q("peter", "The mill", "peter_testimony", "Will you give your testimony?", [
    "Yes. If you write it down, I'll put my mark to it. I've no psalter to swear on. I'll swear on my mother's soul.",
  ], { requires: atMill, effects: [{ giveEvidence: "E30" }] }),
  q("peter", "The mill", "peter_back", "Will you come back to the abbey?", [
    "If he's not there. If the abbot says I may. I still want to be a monk. I just didn't want to be a liar.",
  ], { requires: atMill }),

  // =====================================================================
  // Brother Anselm
  // =====================================================================
  q("anselm", "About him", "anselm_who", "What do you do here?", [
    "Sacristan. Every candle, every cloth, every cup in this church is my business. And the lamps, and the wine. And the bells, through Simon, God help me.",
  ]),
  q("anselm", "Monday", "anselm_found", "You helped force the book room door?", [
    "Thomas came for me after Compline. The bar was down; I could feel it when I pushed. We took the bench off the walk and broke it in. The bracket came out of the wall.",
    "It was dark. I held the lamp. I wish I hadn't.",
  ]),
  q("anselm", "The passage", "anselm_keys", "Who holds keys to the cellarer's passage?", [
    "The cellarer and I. It's how the candles and the wine come to the church without going through the cloister. Nobody else.",
    "I'll open it for you, if you want to see it.",
  ], { reveals: "Only the cellarer and the sacristan hold keys to the passage behind the book room." }),
  q("anselm", "Monday", "anselm_whereabouts", "Where were you on Monday evening?", [
    "In the church from the end of the reading, lighting the stall lamps. Simon saw me there when he rang. I didn't leave it till after Compline.",
  ]),
  q("anselm", "Monday", "anselm_compline", "Who was at Compline on Monday?", [
    "I'll tell you what I saw, and you can write it down. The abbot was in his stall from the first, Thomas too. The cellarer's stall was empty when the first psalm began. By the hymn, someone was in it. Edmund's was empty all through.",
  ], { effects: [{ giveEvidence: "E24" }] }),
  q("anselm", "The church", "anselm_candlestick", "Did you lend Brother Edmund anything?", [
    "One of the two Lady altar candlesticks. At Michaelmas. For his eyes. He swore he'd bring it back. It's on my board.",
  ], { reveals: "Anselm lent Edmund one of the Lady altar's two bronze candlesticks at Michaelmas." }),
  q("anselm", "The church", "anselm_returned", "When did the candlestick come back to the altar?", [
    "I saw both on the altar at Prime on Tuesday. I thought Thomas had brought it back. I didn't ask. I didn't want to be the man who'd lent a dead brother the church's bronze.",
    "I should have said. I'm saying now.",
  ], { requiresEvidence: ["E20"], reveals: "Anselm saw both candlesticks back on the Lady altar at Prime on Tuesday, assumed Thomas had returned one, and said nothing." }),
  q("anselm", "The church", "anselm_candle", "Is the candle on it one of yours?", [
    "That stub? No. That's a scriptorium candle, the cheap kind they burn for long work. I'd never put that on Our Lady's altar.",
  ], { requiresEvidence: ["E20"] }),

  // =====================================================================
  // Sister Agnes
  // =====================================================================
  q("agnes", "About her", "agnes_who", "Why are you here at Saint Aldwyn's?", [
    "I'm infirmarian at Thornholme. My prioress sent me to nurse Brother Odo, your old infirmarian. He's dying, slowly. So I was in the guest-house when they called.",
  ]),
  q("agnes", "The body", "agnes_wound", "What did you see on the body?", [
    "One wound, above the left ear, curved like the rim of a cup, about two fingers wide, the bone broken in beneath. A bruise across the outside of the right forearm, the kind you get lifting an arm to keep off a blow.",
    "I've written it down for you. Here.",
  ], { reveals: "Agnes found one curved wound above Edmund's left ear and a warding bruise on his right forearm.", effects: [{ giveEvidence: "E02" }] }),
  q("agnes", "The body", "agnes_seizure", "Could it have been a seizure?", [
    "No. His tongue wasn't bitten and there was no froth. I've nursed many in the falling sickness. And a desk has a straight edge. That wound is curved.",
  ], { reveals: "Agnes says Edmund showed none of the marks of the falling sickness, and the curved wound could not come from the desk's straight edge." }),
  q("agnes", "The body", "agnes_when", "When did he die?", [
    "He was cold and beginning to stiffen when I came, after Compline, and the blood under him hadn't been moved. Before Compline, I'd say. Some while before. I can't be closer than that.",
  ]),
  q("agnes", "The body", "agnes_abbot", "Why didn't you contradict the abbot that night?", [
    "Because it was his house and his brother, and I was a guest with a dying man to nurse. I didn't agree with him. I waited for someone who'd ask me.",
  ]),
  q("agnes", "The body", "agnes_weapon", "What could make a wound like that?", [
    "Something heavy, with a rounded edge. Metal, or stone. Swung hard. Not a fall.",
  ]),
  q("agnes", "The body", "agnes_examine", "Will you compare the candlestick with the wound?", [
    "Bring it to me and I'll lay a cord along both. I can't tell you more than my eyes can, but my eyes are good.",
    "Go about your business; when you're next in your chamber you'll find my answer on your table.",
  ], { requiresEvidence: ["E20"], effects: [{ setFlag: "x1_requested" }] }),

  // =====================================================================
  // Brother Simon
  // =====================================================================
  q("simon", "About him", "simon_who", "What do you do here?", [
    "I ring! Every office, day and night. Under Brother Anselm. Peter helps me, or he did.",
  ]),
  q("simon", "Monday", "simon_compline", "How was Compline rung on Monday?", [
    "As ever, brother. The great bell, nine and tolling. As ever.",
  ], { reveals: "Simon says Compline was rung as ever on Monday, on the great bell." }),
  q("simon", "Monday", "simon_rope", "What happened to the great bell's rope?", [
    "It parted. Monday, Compline, at the first stroke. Frayed through where it goes over the wheel. I tried to splice it in the dark and couldn't, so I ran down and rang the hand bell at the church door, as the book says.",
    "It was late. About three short psalms late. The great bell didn't toll for Compline at all that night. Here, my tally. I'm sorry I said otherwise.",
  ], {
    requires: { any: [{ hasEvidence: "E22" }, { inspected: "to_rope" }] },
    reveals: "Simon admits the great bell's rope parted at the first stroke for Compline on Monday; he rang the hand bell at the church door, late.",
    effects: [{ giveEvidence: "E23" }, tl("At the Compline bell (Mon)", "The great bell's rope parts at the first stroke. Simon rings the hand bell at the church door, late.", "Brother Simon")],
  }),
  q("simon", "Monday", "simon_saw", "Did you see anyone while you rang?", [
    "Brother Anselm, inside the church, lighting the stall lamps. Nobody else. I was at the north door with my back to the cloister.",
  ]),
  q("simon", "The bells", "simon_order", "What is the order of the bells in the evening?", [
    "It's all in the customary, chained up there. Vespers, the little bell for the drink, the reading, then Compline on the great bell. If the great bell fails, the hand bell.",
  ]),
  q("simon", "The bells", "simon_clapper", "Was the great bell's clapper recast at York?", [
    "Recast? No! It's the same old clapper it's had since my master's day. I'd know. I'd have to hang it.",
  ], { requires: { any: [{ hasEvidence: "E16" }, { asked: "matthias_founder" }] }, reveals: "Simon says the great bell's clapper has never been recast." }),
  q("simon", "Peter", "simon_peter", "Tell me about Peter.", [
    "He sits behind the beam while I ring, out of the wind. Good lad. Quiet this week.",
  ], { variants: [{ requires: { event: "RE03" }, reply: ["He used to sit behind that beam, there, while I rang. If he left anything, he'd leave it there."] }] }),

  // =====================================================================
  // William Carter
  // =====================================================================
  q("william", "About him", "william_who", "What do you do here?", [
    "Keep the gate. Every soul in or out goes in my roll. Bar it at Compline, open it at first light.",
  ]),
  q("william", "Monday", "william_monday", "Who came and went on Monday?", [
    "The salt carter in the morning. The steward from Ashcombe at Sext, with a groom, to see the cellarer about barley. He left about Vespers, I think. Two pilgrims for Durham. That's all.",
  ], { reveals: "William says Ashcombe's steward came at Sext to see the cellarer and left 'about Vespers'." }),
  q("william", "Monday", "william_night", "Could anyone come in after Compline?", [
    "Not by me. The gate's barred at Compline and I sleep against it. Nobody came in Monday night, nor Tuesday.",
  ]),
  q("william", "Monday", "william_wall", "Where could a man get over the wall?", [
    "Only by the mill-race. The wall's low where the water goes under. A lad could do it. Not a fat man.",
  ]),
  q("william", "Monday", "william_found", "Were you there when they found Edmund?", [
    "No, I was at the gate. A brother came running for the guest-house to fetch the nun. That's how I knew.",
  ]),
  q("william", "Peter", "william_peter", "Do you know Peter's family?", [
    "Peter? His mother's sister is Alice, John Miller's wife, down at Hollin Bridge. Brought him here herself a year back.",
  ], { reveals: "Peter's aunt is Alice Miller, wife of the miller at Hollin Bridge." }),
  q("william", "Ashcombe", "william_geoffrey", "Tell me about the steward of Ashcombe.", [
    "Smooth. Always a word for the gate and never a penny. Comes more often than he used to, this year.",
  ]),

  // =====================================================================
  // Margery
  // =====================================================================
  q("margery", "About her", "margery_who", "Who are you?", [
    "Margery. I cook for the guest-house. Eleven years.",
  ]),
  q("margery", "Monday", "margery_monday", "What did you see on Monday evening?", [
    "I was at my pots, love. I saw my pots.",
  ], { variants: [{ requires: { event: "RE04" }, reply: ["The boy by my fire, and the cellarer coming out of that passage door with no lantern, as the hand bell rang. I've told it you and I'll tell it to the abbot."] }] }),
  q("margery", "Monday", "margery_peter", "Was Peter in your kitchen on Monday?", [
    "For the oil. I filled his jar.",
  ], { variants: [{ requires: { event: "RE04" }, reply: ["For the oil. And I gave him bread and let him sit by the fire, the poor starved thing, as long as it takes to say the psalms twice. He jumped up when the hand bell went."] }] }),
  q("margery", "The cellarer", "margery_sleeve", "Did you mend anything for the cellarer this week?", [
    "His habit, Tuesday morning. A tear on the right sleeve, three-cornered. He said a cask hoop.",
    "There's no hoop in that cellar high enough to catch a man's sleeve.",
  ], { requires: { any: [{ event: "RE04" }, { hasEvidence: "E07" }] } }),
  q("margery", "The cellarer", "margery_salt", "Did the cellarer go to the salt store that evening?", [
    "Toward it, from the passage door. Then toward the church. I didn't watch him go in.",
  ], { requires: { event: "RE04" } }),
  q("margery", "Monday", "margery_why", "Why didn't you speak before?", [
    "He keeps the keys to everything I need, and he hires and puts off. But the boy's gone, and the boy was at my fire.",
  ], { requires: { event: "RE04" } }),

  // =====================================================================
  // Lord Roland Ashcombe
  // =====================================================================
  q("roland", "About him", "roland_who", "Who are you to the abbey?", [
    "Its patron. My great-grandfather's father gave them half their land. I sit in their prayers whether they like it or not.",
  ]),
  q("roland", "Fellbeck", "roland_fellbeck", "What do you want with Fellbeck?", [
    "Sheep. Three hundred on the Fellbeck walk, and the wool goes to Flanders. The monks' tenants grow oats on it. Oats.",
  ]),
  q("roland", "Fellbeck", "roland_writing", "Where did the old confirmation come from?", [
    "My steward found it among my evidences. Old Abbot Walter admitted Fellbeck was ours to take back. Plain as day. I paid Geoffrey for finding it and I'd pay him again.",
  ], { reveals: "Lord Roland says his steward found the confirmation among his papers, and that he paid him for it." }),
  q("roland", "Fellbeck", "roland_warning", "Did you send me a warning?", [
    "I sealed it. Geoffrey wrote it; he writes all my letters. I want my rights tried in the king's court, not picked over by monks and clerks.",
  ], { requires: { event: "RE01" }, reveals: "Lord Roland sealed the warning letter; his steward wrote it." }),
  q("roland", "Edmund", "roland_edmund", "Did you know Brother Edmund?", [
    "The old scholar? I saw him in chapter once. I never spoke to him. I am sorry he's dead, if that's what you're asking.",
  ]),
  q("roland", "Monday", "roland_monday", "Where were you on Monday?", [
    "Here, at my own table, with my household. Ask any of them. Do you think I go about hitting monks?",
  ]),
  q("roland", "The abbey", "roland_abbot", "What did the abbot promise you?", [
    "That if the writing was good he would not fight me for Fellbeck. A sensible man, Benedict. Mostly.",
  ]),
  q("roland", "Money", "roland_accounts", "May I see the manor's accounts?", [
    "If my steward has been doing things in my name I don't know about, I'll see them myself first. There. The bailiff's roll. Read what you like.",
  ], { requires: { any: [{ event: "RE06" }, { hasEvidence: "E17" }] }, effects: [{ giveEvidence: "E18" }] }),

  // =====================================================================
  // Geoffrey Hale
  // =====================================================================
  q("geoffrey", "About him", "geoffrey_who", "What do you do for Lord Roland?", [
    "Everything that involves ink. Rents, letters, lawsuits. My lord deals in land; I deal in paper about land.",
  ]),
  q("geoffrey", "Fellbeck", "geoffrey_found", "How did the Fellbeck confirmation come to light?", [
    "I found it in my lord's evidence chest this summer, among his grandfather's papers. A lucky thing. I brought it to the abbot at Michaelmas, as was proper.",
  ], { reveals: "Geoffrey says he found the confirmation in Lord Roland's evidence chest among his grandfather's papers." }),
  q("geoffrey", "Monday", "geoffrey_monday", "Were you at the abbey on Monday?", [
    "Monday? No. I never set foot in the place that day. I sent a groom about the tithe barley.",
  ], { reveals: "Geoffrey says he never set foot in the abbey on Monday." }),
  q("geoffrey", "The abbey", "geoffrey_matthias", "Do you know Brother Matthias?", [
    "The cellarer. Barely. We meet about tithes. A dry stick.",
  ]),
  q("geoffrey", "Fellbeck", "geoffrey_fellbeck", "What does Lord Roland gain from Fellbeck?", [
    "A sheep walk. A good one. And a quarrel ended that's been running since my lord's grandfather's day.",
  ]),
  q("geoffrey", "Edmund", "geoffrey_edmund", "Did you know Brother Edmund?", [
    "Not to speak to. I gather he was a scholar. Scholars find problems; it's their trade.",
  ]),
  q("geoffrey", "Fellbeck", "geoffrey_warning", "Did you write the warning letter?", [
    "I write all my lord's letters. My lord sealed it. It says only what's true: the land is for the courts.",
  ], { requires: { event: "RE01" } }),
  q("geoffrey", "Monday", "geoffrey_gate", "The gate roll has you in the abbey at Sext on Monday.", [
    "Does it? Then William's roll knows more than I do. Perhaps I went myself. Barley is barley. I spoke to the cellarer and I left.",
  ], { requiresEvidence: ["E25"], reveals: "Shown the gate roll, Geoffrey allows he may have gone to the abbey on Monday to see the cellarer." }),
  q("geoffrey", "Money", "geoffrey_reward", "Lord Roland paid you five marks for the writing.", [
    "For finding my lord's evidence. A steward's diligence is worth paying for.",
  ], { requiresEvidence: ["E18"] }),
  q("geoffrey", "Fellbeck", "geoffrey_after", "Your letter says the cellarer brought you the writing.", [
    "It does, and he did. I believed him. I was a fool to.",
  ], { requires: { event: "RE06" } }),

  // =====================================================================
  // Alice Miller
  // =====================================================================
  q("alice", "Peter", "alice_peter", "Tell me how Peter came to you.", [
    "Before first light Wednesday, at the mill door, wet to the waist from the beck. Shaking so hard he couldn't lift the latch. Not a mark on him. Only cold and frightened half out of his wits.",
    "He begged me not to send to the abbey. He said 'the cellarer' twice and then nothing. I've set it down for you, the way you asked.",
  ], { reveals: "Peter reached the mill before first light on Wednesday, soaked, frightened and unhurt.", effects: [{ giveEvidence: "E29" }] }),
  q("alice", "About her", "alice_who", "Who are you?", [
    "Alice. John Miller's wife. We hold the abbey's mill. Peter's my sister's boy.",
  ]),
  q("alice", "The mill", "alice_mill", "How old is the mill?", [
    "Raised in old Abbot John's time. The second Abbot John, not the first. My husband's grandfather carried stone for it, sixty years back.",
  ], { reveals: "Alice says the mill at Hollin Bridge was built about sixty years ago, in the time of the second Abbot John." }),
  q("alice", "The mill", "alice_lease", "Who holds your lease?", [
    "The abbey. The cellarer renews it every Martinmas. That's what frightened Peter most, I think. Not for himself. For us.",
  ]),
  q("alice", "Peter", "alice_hide", "Why did you hide him?", [
    "He's my sister's boy. I'd have hidden him from the king.",
  ]),
  q("alice", "Peter", "alice_back", "Will you let him go back to the abbey?", [
    "If he wants to, and if the man who frightened him isn't there. He wants to. God knows why.",
  ]),

  // =====================================================================
  // Master Hugh Selwood, the archdeacon (by letter)
  // =====================================================================
  q("archdeacon", "The case", "archdeacon_case", "What do you make of this business?", [
    "A barred room, a missing writing and an abbot in a hurry. I have seen all three before, though not together.",
    "Look at the door before you look at anyone's face. And believe nothing that cannot be shown.",
  ]),
  q("archdeacon", "The house", "archdeacon_abbot", "Tell me about Abbot Benedict.", [
    "A decent man and a frightened one. He runs a poor house with a rich patron. He will choose peace over truth until you make truth cheaper. H.S.",
  ]),
  q("archdeacon", "Ashcombe", "archdeacon_roland", "Tell me about Lord Roland.", [
    "Proud, greedy, and not clever. A man who wants a thing and says so is rarely the man who plans in the dark. Look at whoever does his writing for him. H.S.",
  ]),
  q("archdeacon", "The writing", "archdeacon_seals", "Do the diocese's records say anything about the abbey's seal?", [
    "Our visitation rolls note that Saint Aldwyn's changed its seal some forty years ago, after the old one cracked. The abbey's own chronicle will have the year. H.S.",
  ], { requiresEvidence: ["E10"] }),
  q("archdeacon", "The body", "archdeacon_examine", "Could Sister Agnes compare the candlestick with the wound?", [
    "I have written to her. She will do it, and you will have her answer on your table when you are next in your chamber. H.S.",
  ], { requiresEvidence: ["E20"], effects: [{ setFlag: "x1_requested" }] }),
  q("archdeacon", "Peter", "archdeacon_peter", "The novice Peter has gone. What should I do?", [
    "Boys who run go somewhere they know. Ask the gate who his people are. And do not let the brothers drag the mill-race all day on my account; it frightens everyone and finds nothing. H.S.",
  ], { requires: { event: "RE03" } }),
  q("archdeacon", "The law", "archdeacon_law", "What happens to a monk who kills?", [
    "He answers to the Church, in the archbishop's court, not to the king's. That is no mercy; the archbishop's prison at York is a cold place. But it must be proved first. H.S.",
  ]),
  q("archdeacon", "The law", "archdeacon_forgery", "Is forging a charter a crime?", [
    "Before the king's justices, a grave one, and for a layman a hanging one. For a monk, the Church's. Either way, the land goes back where it belongs. H.S.",
  ], { requiresEvidence: ["E17"] }),
  q("archdeacon", "The case", "archdeacon_table", "How should I use the table in my chamber?", [
    "Lay out what you have and run thread between two things you think belong together. If they do, the table will show you why. If not, you have lost nothing but thread. H.S.",
  ], { repeatable: true }),
  q("archdeacon", "The case", "archdeacon_finding", "When should I send you my finding?", [
    "When you can show me who, why, how, and what became of the boy, from more than one kind of proof: things you have seen, writings and money, and what people have told you. H.S.",
  ], { repeatable: true }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  r("abbot", "E14", ["He reads it twice and hands it back. 'Edmund was old,' he says, 'and saw shadows in everything.'"]),
  r("abbot", "E10", ["'A copy. Copies are full of crosses. That proves nothing.'"]),
  r(
    "abbot",
    "E14",
    [
      "Edmund's own hand. 'Lay all before the lord abbot at chapter.' He was coming to me. And I have been telling everyone he had a seizure.",
      "You will have the muniment room. Brother Ralph and Brother Thomas hold the other two keys; I will send for them.",
      "And you should know, since you will find it out: I told Lord Roland at Michaelmas that if the writing proved good I would not fight him. I wanted peace. That is all I wanted.",
    ],
    { requires: { deduction: "D01" }, effects: [{ setFlag: "abbot_shown_notes" }], reveals: "Shown Edmund's notes, the abbot opened the muniment room and admitted a half-promise to Lord Roland." },
  ),
  r(
    "abbot",
    "E10",
    ["He reads the crosses in the margin and is quiet a long time. 'Edmund would not mark a thing without a reason. Very well. You will have the muniment room.'"],
    { requires: { deduction: "D01" }, effects: [{ setFlag: "abbot_shown_notes" }] },
  ),
  r("abbot", "E15", ["'By whose leave? Not mine. I have been waiting for his answer since Michaelmas.'"]),
  r("abbot", "E17", ["The abbot reads it and sits down. 'Ten marks. And a clerkship. In my house.'"]),
  r("abbot", "E31", ["'In the salt. Our own seal. Or something wearing its face.'"]),
  r("matthias", "E14", ["'An old man's worries. He saw forgers in every margin.'"]),
  r("matthias", "E16", ["'Leases. And the bell. I told you.'"]),
  r("matthias", "E07", ["'A cask hoop. Ask Margery, she mended it.'"]),
  r("matthias", "E06", ["'Every brother in this house wears that cloth.'"]),
  r("matthias", "E26", ["'A cook at her window in the dark. Very well.'"]),
  r("matthias", "E30", ["'The boy is frightened of his own shadow.'"]),
  r("matthias", "E23", ["'Then I am mistaken about which bell. It was a long day.'"]),
  r("matthias", "E17", ["He reads it without expression. 'Barley,' he says. 'Nothing else.'"]),
  r("matthias", "E31", ["He looks at it for a long moment and says nothing at all."]),
  r("thomas", "E14", ["'His hand. Five points. The saint stands, the prior's dead, the mill's too young, and the back's a rent roll. He had it all.'"]),
  r("thomas", "E10", ["'His copy. Three crosses. He'd found three things wrong before he even turned it over.'"]),
  r("thomas", "E13", ["'Yes. The a. Look at the a. That's what he saw.'"]),
  r("thomas", "E11", ["'There. Seated until 1290. Standing after. And the confirmation says 1215.'"]),
  r("thomas", "E31", ["'Bring it to your lectern with the old grant. Show me what's wrong with it, and I'll set my name to every point you find.'"]),
  r("thomas", "E20", ["'That's his. That's the one he took to the book room on Monday, lit. How is it on the altar?'"]),
  r("anselm", "E19", ["'My board. One lent, to be returned. And it was. Wasn't it?'"]),
  r("anselm", "E20", ["He goes very still. 'That's not an altar candle on it.'"]),
  r("anselm", "E05", ["'That hook lives in the passage. I've used it myself, for the oil cask.'"]),
  r("agnes", "E20", ["'Bring it to me. I'll lay a cord along it.'"]),
  r("agnes", "E03", ["'A straight dent, with metal in it. Something heavy struck the desk. Not his head.'"]),
  r("simon", "E22", ["Simon goes red. 'Yes. The hand bell, if the great bell fails. It did fail.'"]),
  r("simon", "E28", ["'That's where he sat. He left it for me to find, I think. Or for someone.'"]),
  r("william", "E25", ["'My roll. Out after None, it says. I'd have said Vespers. The roll's right; I wrote it at the time.'"]),
  r("william", "E27", ["'His cloak. He'd not leave it to be stolen. He left it so as not to steal it.'"]),
  r("peter", "E26", ["'Margery said that? Then I'm not mad. Then I did see it.'"], { requires: atMill }),
  r("peter", "E05", ["'That's the passage. That's the door he came out of.'"], { requires: atMill }),
  r("margery", "E07", ["'That's my mending. Tuesday.'"]),
  r("alice", "E28", ["'My sister's boy. He always could write better than he could talk.'"]),
  r("geoffrey", "E17", ["Geoffrey reads it, folds it, and hands it back very carefully. 'I'll say nothing more about that. Not here.'"]),
  r("geoffrey", "E25", ["'William's a careful man. Barley is barley.'"]),
  r("roland", "E17", ["Lord Roland reads it twice, slowly, his lips moving. 'Ten marks. A clerkship. My steward, promising things in my name to a monk.'"]),
  r("roland", "E18", ["'Five marks for finding my evidence. I said so.'"]),
  r("archdeacon", "E31", ["'Bring it to your lectern, and let Brother Thomas walk you through it. Proof you can point to is worth ten you can only feel. H.S.'"]),
  r("archdeacon", "E17", ["'Promises made in another man's name. That is the steward's crime, and it may not be his only one. H.S.'"]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_COMPLINE",
    characterId: "matthias",
    title: "Brother Matthias: the great bell",
    text: "Brother Matthias says he was in his stall before the great bell finished tolling for Compline. The great bell's rope parted at the first stroke; Compline was rung late, on the hand bell. The sacristan found the cellarer's stall empty when the first psalm began.",
    when: { all: [{ asked: "matthias_compline" }, { hasEvidence: "E23" }, { hasEvidence: "E24" }] },
  },
  {
    id: "X_SLEEVE",
    characterId: "matthias",
    title: "Brother Matthias: the cask hoop",
    text: "Brother Matthias says he tore his sleeve on a cask hoop on Tuesday morning. A scrap of the same black cloth was caught on a nail in the aumbry frame in the passage he says he was not in, and the cook who mended it says no hoop in the cellar stands high enough to catch a sleeve.",
    when: { all: [{ asked: "matthias_sleeve" }, { hasEvidence: "E06" }, { hasEvidence: "E26" }] },
  },
  {
    id: "X_FOUNDER",
    characterId: "matthias",
    title: "Brother Matthias: the founder at York",
    text: "Brother Matthias says he paid Robert the founder at York to recast the great bell's clapper. The ringer says the clapper has never been recast.",
    when: { all: [{ asked: "matthias_founder" }, { asked: "simon_clapper" }] },
  },
  {
    id: "X_REMIT",
    characterId: "matthias",
    title: "Brother Matthias: the Ashcombe rent",
    text: "Brother Matthias says he remitted Lord Roland's pasture rent with the abbot's leave. The abbot wrote 'By whose leave?' in the margin of the account, and says he never gave it.",
    when: { all: [{ asked: "matthias_rent" }, { any: [{ hasEvidence: "E15" }, { asked: "abbot_rent" }] }] },
  },
  {
    id: "X_PASSAGE",
    characterId: "matthias",
    title: "Brother Matthias: the passage",
    text: "Brother Matthias says he was not in the passage on Monday evening. The guest-house cook saw him come out of its door into the kitchen court as the hand bell rang for Compline.",
    when: { all: [{ asked: "matthias_passage" }, { hasEvidence: "E26" }] },
  },
  {
    id: "X_GATE",
    characterId: "geoffrey",
    title: "Geoffrey Hale: Monday",
    text: "Geoffrey Hale says he never set foot in the abbey on Monday. The gate roll has him in at Sext with a groom, to see the cellarer, and out after None.",
    when: { all: [{ asked: "geoffrey_monday" }, { hasEvidence: "E25" }] },
  },
  {
    id: "X_FOUND",
    characterId: "geoffrey",
    title: "Geoffrey Hale: how the writing was found",
    text: "Geoffrey Hale says he found the confirmation in his lord's evidence chest. His own letter to the cellarer says 'it shall be found among his evidences and brought at Michaelmas, as we agreed.'",
    when: { all: [{ asked: "geoffrey_found" }, { hasEvidence: "E17" }] },
  },
  {
    id: "X_OIL",
    characterId: "peter",
    title: "Novice Peter: the oil",
    text: "Peter said he went to the kitchen for oil and came straight back. The cook kept him by her fire as long as it takes to say the psalms twice, until the hand bell rang.",
    when: { all: [{ asked: "peter_oil" }, { hasEvidence: "E26" }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  abbot_welcome: "what happened how did he die tell me what happened to edmund the death",
  abbot_edmund: "tell me about edmund who was edmund what was he like the scholar",
  abbot_evening: "where was everyone monday evening the evening vespers the drink collation who was where",
  abbot_found: "how was he found who found him the body the door forced discovered",
  abbot_seizure: "why a seizure heart failed falling sickness why do you think it was natural illness",
  abbot_charter: "what writing is missing the charter the document the confirmation fellbeck what was taken",
  abbot_archive: "muniment room archive records the three keys may i see the records let me in",
  abbot_roland: "lord roland the patron ashcombe the lord",
  abbot_matthias: "brother matthias the cellarer tell me about the cellarer",
  abbot_rent: "remitted rent pasture rent forty shillings did you give leave the account",
  abbot_promise: "did you promise roland anything half promised the meadows",
  abbot_peter: "novice peter the boy tell me about peter where is peter",
  abbot_compline: "was matthias at compline was the cellarer in his stall did you see him",
  matthias_who: "what do you do your duties cellarer your work",
  matthias_edmund: "tell me about edmund did you know edmund",
  matthias_evening: "where were you monday evening what did you do monday night after vespers",
  matthias_compline: "when did you come into church compline were you at compline in your stall the great bell",
  matthias_passage: "the passage who uses the passage behind the book room were you in the passage keys",
  matthias_rolls: "did edmund ask you for anything the rent rolls old rolls 1319 monday morning",
  matthias_charter: "the fellbeck writing the confirmation the charter what do you know",
  matthias_geoffrey: "geoffrey hale the steward do you know the steward ashcombe",
  matthias_rent: "remitted the rent pasture rent why did you remit forty shillings",
  matthias_founder: "the founder at york robert the founder casting what did you pay for",
  matthias_parchment: "parchment ink galls wax why does the cellar buy parchment",
  matthias_sleeve: "your sleeve torn the tear mended habit how did you tear it",
  matthias_peter: "did you speak to peter the novice threaten peter",
  matthias_letter: "this letter the steward's letter ten marks clerkship burn this",
  matthias_hand: "did you work in the scriptorium were you a copyist your handwriting book hand",
  thomas_found: "how did you find him tell me how he was found the door forced",
  thomas_monday: "what did edmund do monday evening after vespers last saw him the candle",
  thomas_collation: "did anyone leave the collation the reading who was missing peter sent for oil",
  thomas_edmund: "tell me about edmund what was he like your teacher",
  thomas_worry: "was edmund troubled worried something on his mind chapter tuesday",
  thomas_charter: "what was edmund working on the fellbeck writing the confirmation copying",
  thomas_grant: "the old grant 1189 the authentic charter sir hugh do you have the grant give me the grant",
  thomas_key: "how did edmund get into the muniment room the key your key",
  thomas_seals: "the abbey's seal old seal new seal the seal changed",
  thomas_matthias: "tell me about matthias the cellarer did he write",
  thomas_hands: "old hand new hand handwriting how can you tell letters",
  thomas_peter: "tell me about peter the novice the boy",
  thomas_compare: "help me compare the writings the lectern compare documents side by side",
  peter_voices: "hear heard what did you hear voices shouting arguing an argument the book room monday",
  peter_voice_who: "whose voice who was the other voice who was arguing",
  peter_oil: "what did you do after where did you go the oil came straight back",
  peter_court: "see anyone in the kitchen court the court yard someone outside who did you see",
  peter_who: "tell me about yourself who are you your family",
  peter_afraid: "are you afraid scared what's wrong frightened",
  peter_why: "why did you run why did you leave why did you flee",
  peter_fire: "where were you really margery's fire the kitchen bread",
  peter_saw: "what did you see in the kitchen court who came out of the passage door",
  peter_threat: "did someone threaten you what did matthias say at prime the cellar the lease",
  peter_carrying: "what was he carrying under his scapular something heavy",
  peter_blow: "did you see who hurt edmund did you see the blow the killing",
  peter_testimony: "will you give testimony swear set it down written statement put your mark",
  peter_back: "will you come back return to the abbey",
  anselm_who: "what do you do sacristan your duties",
  anselm_found: "you forced the door you helped break in the door",
  anselm_keys: "who has keys to the passage the cellarer's passage keys open the passage",
  anselm_whereabouts: "where were you monday evening during the reading",
  anselm_compline: "who was at compline who was in their stalls attendance the cellarer's stall",
  anselm_candlestick: "did you lend edmund anything the candlestick lent the lady altar",
  anselm_returned: "when did the candlestick come back returned on the altar both candlesticks",
  anselm_candle: "is that your candle the candle on it scriptorium candle",
  agnes_who: "why are you here who are you thornholme brother odo",
  agnes_wound: "what did you see on the body the wound injuries the head describe",
  agnes_seizure: "could it have been a seizure falling sickness heart natural",
  agnes_when: "when did he die how long dead time of death before compline",
  agnes_abbot: "why didn't you contradict the abbot why didn't you say",
  agnes_weapon: "what made the wound what could cause it weapon what struck him",
  agnes_examine: "compare the candlestick with the wound examine the candlestick lay it against the wound",
  simon_who: "what do you do the bells ringer",
  simon_compline: "how was compline rung monday the bell for compline",
  simon_rope: "the rope parted what happened to the rope the hand bell late",
  simon_saw: "did you see anyone while you rang who was in the church",
  simon_order: "order of the bells evening bells the customary",
  simon_clapper: "the clapper recast york the founder was the bell repaired",
  simon_peter: "tell me about peter where did he sit",
  william_who: "what do you do the gate gatekeeper",
  william_monday: "who came and went monday visitors the steward who came in",
  william_night: "come in after compline at night the gate barred locked who came in at night",
  william_wall: "could anyone get over the wall climb the wall low place mill-race",
  william_found: "were you there when they found him",
  william_peter: "peter's family his people where is he from who are his relatives aunt",
  william_geoffrey: "the steward geoffrey hale tell me about the steward",
  margery_who: "who are you what do you do the cook",
  margery_monday: "what did you see monday evening anything that night",
  margery_peter: "was peter in your kitchen the boy the oil",
  margery_sleeve: "did you mend anything the cellarer's habit sleeve",
  margery_salt: "the salt store did he go to the salt store",
  margery_why: "why didn't you speak before why now",
  roland_who: "who are you the patron",
  roland_fellbeck: "what do you want with fellbeck the meadows sheep",
  roland_writing: "where did the confirmation come from the old writing who found it",
  roland_warning: "did you send me a warning the letter your seal",
  roland_edmund: "did you know edmund",
  roland_monday: "where were you monday",
  roland_abbot: "what did the abbot promise you",
  roland_accounts: "the manor accounts account roll may i see your accounts payments",
  geoffrey_who: "what do you do steward",
  geoffrey_found: "how did the confirmation come to light where did you find it",
  geoffrey_monday: "were you at the abbey monday did you go to the abbey",
  geoffrey_matthias: "do you know matthias the cellarer",
  geoffrey_fellbeck: "what does roland gain from fellbeck",
  geoffrey_edmund: "did you know edmund",
  geoffrey_warning: "did you write the warning letter",
  geoffrey_gate: "the gate roll says you were there sext monday",
  geoffrey_reward: "five marks the payment reward",
  geoffrey_after: "your letter says the cellarer brought it",
  alice_peter: "how did peter come to you when did he arrive tell me about peter",
  alice_who: "who are you",
  alice_mill: "how old is the mill when was it built",
  alice_lease: "who holds your lease the lease renewed martinmas",
  alice_hide: "why did you hide him",
  alice_back: "will you let him go back",
  archdeacon_case: "what do you make of this your opinion advice",
  archdeacon_abbot: "tell me about the abbot benedict",
  archdeacon_roland: "tell me about roland the lord",
  archdeacon_seals: "the abbey's seal diocese records when did the seal change",
  archdeacon_examine: "can agnes compare the candlestick ask agnes examine",
  archdeacon_peter: "peter has gone what should i do the missing novice",
  archdeacon_law: "what happens to a monk who kills punishment church court",
  archdeacon_forgery: "is forging a charter a crime forgery",
  archdeacon_table: "how do i use the table the deduction table board",
  archdeacon_finding: "when should i send my finding report",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
