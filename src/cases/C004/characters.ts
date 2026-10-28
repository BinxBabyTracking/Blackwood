import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * C004 interviews, written against docs/C004-timeline.md.
 *
 * Rules for this file: nobody names the killer or confesses; Victor Harlan's
 * answers are his own account, lies included; Samuel Finch lies about 10:15
 * until his card reaches the investigator (RE03), and then tells it straight;
 * nobody states a forensic result that is not in a document; every time agrees
 * with the timeline. Nothing anyone says suggests the investigator brought the
 * trap at the warehouse on themselves.
 */

const held: Condition = { flag: "held" };
const over: Condition = { flag: "captivity_over" };
const rescue: Condition = { env: "captivity", is: "rescue" };
/** Samuel has sent his card and stopped lying about 10:15. */
const samuelClean: Condition = { deliveryOpened: "samuel_card" };
/** Someone the investigator would not name until they are met. */
const nobody: Condition = { not: { always: true } };

export const characters: CharacterDef[] = [
  {
    id: "arthur",
    name: "Arthur Vale",
    role: "The victim. Host of Vale After Dark, WCRB",
    portrait: "char.arthur",
    bio: [
      { text: "Forty-one. The best-known voice on Chicago radio: Vale After Dark, weeknights at a quarter past ten on WCRB, sponsored by Hollister's Fine Coffees." },
      { text: "Found dead in Studio A at 10:40 PM on Friday, October 21, 1927, the door barred from inside." },
      { text: "Had found that the station's advertising books did not match what went out on the air, and meant to say so at 10:35.", requires: { hasEvidence: "E12" } },
    ],
    available: nobody,
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "A man in his early forties, a famous 1927 Chicago radio announcer: warm, intimate, unhurried, a smile in the voice, the polished Mid-Atlantic diction of old-time radio. Heard only on a 1927 phonograph disc recording: thin, tinny and slightly muffled, with faint surface crackle.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.3 },
    },
  },
  {
    id: "louise",
    name: "Louise Vale",
    role: "Arthur's sister, your client",
    portrait: "char.louise",
    bio: [
      { text: "Thirty-eight. Teaches piano from her house on Dorchester Avenue, Hyde Park. Arthur's only family." },
      { text: "Hired the bureau on Saturday morning because she does not believe Henry Mercer killed her brother." },
      { text: "A letter from Arthur, posted Thursday, lay unopened on her piano until Monday.", requires: { flag: "letter_found" } },
    ],
    available: { always: true },
    locationId: "vale_house",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that means. I teach scales to children. You're the one who knows what it means.",
    idleLine: "Find out who did this to him. That's all I want from you.",
    noAnswer: ["I don't know.", "Arthur never told me that.", "I couldn't say."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "A woman in her late thirties from Chicago in 1927, a piano teacher: composed, precise and quietly grieving, a cultivated Mid-Atlantic accent of the era, a warm low register, measured pace.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "grieving", label: "Grieving", requires: { always: true } },
      { id: "determined", label: "Determined", requires: { flag: "letter_found" }, cue: "Louise Vale has the letter in her lap. She has stopped crying and started being angry." },
    ],
  },
  {
    id: "victor",
    name: "Victor Harlan",
    role: "Station manager, WCRB",
    portrait: "char.victor",
    bio: [
      { text: "Forty-five. Manager of WCRB since 1924. Hires the talent, sells the time, keeps the books." },
      { text: "Says he was in his office from 9:30 to 10:10 on Friday night, then in the lobby with the sponsor when Arthur Vale went on the air." },
      { text: "In custody since Tuesday morning, October 25.", requires: { flag: "victor_arrested" } },
    ],
    available: { always: true },
    locationId: "station_office",
    moves: [{ when: { flag: "victor_arrested" }, locationId: "police" }],
    onBoard: true,
    defaultEvidenceReply: "I'm afraid that's not anything I can help you with. I run a radio station.",
    idleLine: "I have a station to keep on the air. If there's nothing else.",
    noAnswer: ["I couldn't tell you that.", "That's a matter for the police, surely.", "I'm afraid I don't follow."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "A man in his mid forties, a 1927 Chicago radio station manager: smooth, cultured, deep and controlled, gracious but condescending, the polished Mid-Atlantic accent of a 1920s businessman, unhurried, every word placed.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "gracious", label: "Gracious", requires: { always: true } },
      {
        id: "correcting",
        label: "Correcting",
        requires: { any: [{ asked: "victor_card" }, { asked: "victor_disc" }, { presented: "victor:E05" }, { presented: "victor:E08" }, { presented: "victor:E13" }] },
        cue: "Harlan's smile stays where it is, but he has started correcting your facts before you finish them.",
      },
      {
        id: "cold",
        label: "Cold",
        requires: { any: [{ hasEvidence: "E17" }, { deduction: "D08" }, over] },
        idleLine: "I've been more patient than most men would be.",
        cue: "The courtesy has gone out of Victor Harlan's face like a light switched off.",
      },
      {
        id: "refusing",
        label: "Declining to answer",
        requires: { any: [{ flag: "victor_lawyer" }, { flag: "victor_arrested" }] },
        refuses: "My attorney is Mr. Lucius Pratt, of LaSalle Street. Speak to him.",
        cue: "Victor Harlan has stopped answering questions.",
      },
    ],
  },
  {
    id: "henry",
    name: "Henry Mercer",
    role: "Arthur's business partner, Vale and Mercer Productions",
    portrait: "char.henry",
    bio: [
      { text: "Forty-three. Arthur Vale's partner in Vale and Mercer Productions, which makes Vale After Dark and sells it to sponsors." },
      { text: "Argued with Arthur in the WCRB lobby at about 8:15 on Friday night, over money, and left at 8:40. The police like him for it." },
      { text: "Has been rooming at Doyle's on South Halsted since his landlord padlocked his apartment on October 15." },
      { text: "Was at Doyle's from 9:20 PM until after midnight, by the register and the landlady.", requires: { hasEvidence: "E11" } },
    ],
    available: { always: true },
    locationId: "boardinghouse",
    onBoard: true,
    defaultEvidenceReply: "I don't know what you want me to say about that.",
    idleLine: "I've told you more than I told the police. Leave me alone with my rummy.",
    noAnswer: ["How would I know that?", "I don't know.", "Ask the station. I only sold the program."],
    voice: {
      voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      direction: "A man in his early forties from 1927 Chicago, a small-time businessman down on his luck: quick, bitter and defensive with shame underneath, a flat working Chicago Midwestern accent, a slightly hoarse, tired voice.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25 },
    },
    demeanor: [
      { id: "bitter", label: "Bitter", requires: { always: true } },
      {
        id: "defensive",
        label: "Defensive",
        requires: { any: [{ asked: "henry_loan" }, { asked: "henry_argument" }, { presented: "henry:E10" }, { presented: "henry:E22" }] },
        cue: "Henry Mercer's ears have gone red. He has been asked about the money before.",
      },
      { id: "relieved", label: "Relieved", requires: { deduction: "D06" }, cue: "Henry Mercer looks like a man who has just put down something heavy." },
    ],
  },
  {
    id: "samuel",
    name: "Samuel Finch",
    role: "Engineer, WCRB",
    portrait: "char.samuel",
    bio: [
      { text: "Twenty-seven. WCRB's engineer: the control room board, the transmitter line and the recording workshop." },
      { text: "Told the police Arthur Vale went on the air live at 10:15 and that he never left the board." },
      { text: "Played disc A-114 to the air at 10:15 on a card rewritten at 9:05, and lied about it to keep his license.", requires: samuelClean },
    ],
    available: { always: true },
    locationId: "control_room",
    onBoard: true,
    defaultEvidenceReply: "I don't, I mean, I wouldn't know about that, sir.",
    idleLine: "I've got the board to mind. Please.",
    noAnswer: ["I don't know, sir.", "I just work the board.", "I wouldn't know that."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "A young man in his late twenties, a 1927 radio engineer from the Midwest: earnest, technical and nervous, talks a little fast, says sir, an eager, slightly reedy voice with a plain Midwestern accent of the 1920s.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      {
        id: "evasive",
        label: "Evasive",
        requires: { any: [{ asked: "samuel_recorder" }, { asked: "samuel_1015" }, { presented: "samuel:E09" }, { presented: "samuel:E08" }, { presented: "samuel:E06" }] },
        cue: "Samuel Finch is looking at the pen recorder on the wall and trying not to.",
      },
      { id: "candid", label: "Candid", requires: samuelClean, cue: "Samuel Finch looks wretched, and relieved. He has stopped watching the door." },
    ],
  },
  {
    id: "clara",
    name: "Clara Whitcomb",
    role: "Secretary, WCRB",
    portrait: "char.clara",
    bio: [
      { text: "Thirty-two. Secretary at WCRB for six years. Types the station's invoices and keeps its carbons." },
      { text: "Told the police she was in the office all evening and saw nothing, with the station manager standing beside her." },
      { text: "Saw Victor Harlan leave the equipment storage room at about 10:02 PM, wiping his hands.", requires: { hasEvidence: "E17" } },
    ],
    available: { always: true },
    locationId: "station_office",
    onBoard: true,
    defaultEvidenceReply: "I'd rather not guess at things, if you don't mind. I'm only the secretary.",
    idleLine: "Mr. Harlan will be wanting his letters.",
    noAnswer: ["I couldn't say.", "I don't know that.", "That isn't anything I'd see from my desk."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "A woman in her early thirties, a 1927 Chicago office secretary: soft-spoken, careful and exact, frightened but brave, a light clear voice with a crisp, proper 1920s American accent.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "uneasy", label: "Uneasy", requires: { any: [{ asked: "clara_victor" }, { asked: "clara_invoice" }, { hasEvidence: "E16" }] }, cue: "Clara Whitcomb glances at the manager's door before she answers, every time." },
      { id: "brave", label: "Brave", requires: { all: [{ hasEvidence: "E17" }, { hasEvidence: "E14" }] }, cue: "Clara Whitcomb has stopped looking at the manager's door." },
    ],
  },
  {
    id: "russo",
    name: "Dominic Russo",
    role: "Runs the Blue Lantern supper club",
    portrait: "char.russo",
    bio: [
      { text: "Thirty-nine. Runs the Blue Lantern, behind a cigar store on North Clark Street. A supper club with a band, and better whiskey than the law allows." },
      { text: "Paid WCRB for forty-six advertisements in September. Six went out on the air.", requires: { hasEvidence: "E13" } },
      { text: "His note: 'V.H. squares the books. V.H. pays Riverside.'", requires: { hasEvidence: "E23" } },
    ],
    available: { always: true },
    locationId: "blue_lantern",
    onBoard: true,
    defaultEvidenceReply: "Paper. Everybody's got paper. You want a drink?",
    idleLine: "The band's starting. Enjoy your evening, or don't.",
    noAnswer: ["Never heard of it.", "I run a supper club.", "You'd have to ask somebody who cares."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "A man in his late thirties, a 1927 Chicago speakeasy owner, Italian-American: deep, unhurried, amused and quietly dangerous, never raises his voice, a smooth South Side Chicago accent with a faint Italian-American color.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "amused", label: "Amused", requires: { always: true } },
      { id: "annoyed", label: "Annoyed", requires: { any: [{ hasEvidence: "E15" }, { hasEvidence: "E23" }, { presented: "russo:E13" }] }, cue: "Russo's smile has gone thin. He has started looking at your hands instead of your face." },
      { id: "calculating", label: "Calculating", requires: { any: [{ deduction: "D10" }, over] }, cue: "Dominic Russo is doing arithmetic behind his eyes: what you know, and what it's worth to him." },
    ],
  },
  {
    id: "rose",
    name: "Rose Marlowe",
    role: "Singer with the Starlight Orchestra",
    portrait: "char.rose",
    bio: [
      { text: "Twenty-nine. Sings with the Starlight Orchestra on WCRB, Fridays, and at the Blue Lantern on Saturday nights." },
      { text: "Stopped at the Studio A door at 9:35 on Friday night and talked with Arthur Vale. The last person known to have seen him alive." },
      { text: "Arthur read her an opening that said it was raining.", requires: { callAnswered: "call_rose" } },
    ],
    available: { always: true },
    locationId: "control_room",
    onBoard: true,
    defaultEvidenceReply: "Honey, I sing. I don't read paper.",
    idleLine: "I've got rehearsal. Come hear us Saturday.",
    noAnswer: ["I wouldn't know, honey.", "Ask somebody with a desk.", "I just sing the songs."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "A woman in her late twenties, a 1920s Chicago jazz club singer: a warm, husky, smoky alto, wry and quick with grief underneath, relaxed and musical speech, a 1920s Chicago South Side accent.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35 },
    },
    demeanor: [
      { id: "warm", label: "Warm", requires: { always: true } },
      { id: "thoughtful", label: "Thoughtful", requires: { callAnswered: "call_rose" }, cue: "Rose Marlowe has the look of someone going over a conversation word by word." },
    ],
  },
  {
    id: "keene",
    name: "Officer Thomas Keene",
    role: "Chicago Police, Detective Bureau",
    portrait: "char.keene",
    bio: [
      { text: "Forty-nine. Twenty-two years on the Chicago police, the last nine in the Detective Bureau. Has the Vale file." },
      { text: "Reachable at the Detective Bureau on South State Street, or by telephone from your office." },
    ],
    available: { flag: "casefile_read" },
    locationId: "police",
    phone: { flag: "casefile_read" },
    contact: "Detective Bureau, South State Street. Ask about the scene, the reports, or for the chemist.",
    onBoard: false,
    defaultEvidenceReply: "Read it to me slow. I'll tell you if it's anything I can take to the captain.",
    idleLine: "That's all I've got right now. Ring me when you've got something I can use.",
    noAnswer: ["Nothing in my file on that.", "I can't help you there.", "That's not something I've got."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "A man around fifty, a 1927 Chicago police detective, Irish-American: gravelly, patient and plain-spoken with dry humor, an old Chicago accent with a faint Irish lilt, a slow, steady pace.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "patient", label: "Patient", requires: { always: true } },
      { id: "interested", label: "Interested", requires: { deduction: "D03" }, cue: "Keene has stopped tapping his pencil. He's writing things down now." },
      { id: "committed", label: "Committed", requires: over, cue: "Keene looks at you differently since the warehouse. This is his case now too." },
    ],
  },
  {
    id: "agnes",
    name: "Agnes Doyle",
    role: "Keeps Doyle's Rooms, South Halsted Street",
    portrait: "char.agnes",
    bio: [
      { text: "Fifty-four. Widow. Keeps a respectable rooming house on South Halsted Street and the register to prove it." },
      { text: "Henry Mercer has had Room 4 since October 15." },
    ],
    available: { always: true },
    locationId: "boardinghouse",
    onBoard: true,
    defaultEvidenceReply: "I keep a house. I don't read other people's papers.",
    idleLine: "I've a pot on the stove. Good day to you.",
    noAnswer: ["I couldn't say.", "That's no business of mine.", "Ask Mr. Mercer."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "A woman in her mid fifties, a 1927 Chicago rooming-house landlady, Irish-American widow: brisk, sharp and practical, protective, a strong old-fashioned Chicago Irish accent, quick and clipped.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "brisk", label: "Brisk", requires: { always: true } },
      { id: "protective", label: "Protective", requires: { any: [{ asked: "agnes_friday" }, { asked: "agnes_police" }] }, cue: "Agnes Doyle has folded her arms. Nobody is going to say anything against her lodgers in her own hall." },
    ],
  },
  {
    id: "frankie",
    name: "Frankie Moretti",
    role: "Night tally clerk, Riverside Shipping",
    portrait: "char.frankie",
    bio: [
      { text: "Twenty-four. Night tally clerk at Riverside Shipping and Storage, on the river at Kinzie Street. Counts what comes in and what goes out." },
      { text: "His initials are on the Blue Lantern's delivery receipt.", requires: { hasEvidence: "E15" } },
      { text: "Says he did not write the note that brought you to the warehouse.", requires: { asked: "frankie_note" } },
    ],
    available: { always: true },
    locationId: "warehouse_gate",
    moves: [{ when: { all: [held, rescue] }, locationId: "wh_night_gate" }],
    onBoard: true,
    defaultEvidenceReply: "I just count boxes, mister. I don't know what's in them. Honest.",
    idleLine: "I gotta get back to the tally. Please.",
    noAnswer: ["I don't know.", "Nobody tells me nothing.", "I just count."],
    voice: {
      voiceId: "IKne3meq5aSn9XLyUdCD",
      direction: "A young man in his mid twenties, a 1927 Chicago warehouse clerk, Italian-American: jumpy, fast-talking, scared and decent, a thick working-class Chicago accent of the 1920s, a slightly high, nasal voice.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 },
    },
    demeanor: [
      { id: "jumpy", label: "Jumpy", requires: { always: true } },
      { id: "ashamed", label: "Ashamed", requires: { any: [held, { hasEvidence: "E25" }] }, cue: "Frankie Moretti can't look at you." },
      { id: "helpful", label: "Helpful", requires: over, cue: "Frankie Moretti stands up straighter. He's made up his mind which side he's on." },
    ],
  },
  // Heard, never interviewed.
  {
    id: "sal",
    name: "Sal",
    role: "A man at Riverside Shipping",
    portrait: "char.sal",
    bio: [{ text: "One of the two men who held you at Riverside Shipping." }],
    available: nobody,
    known: { hasEvidence: "E26" },
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "A man in his forties, a 1927 Chicago hoodlum: flat, low, bored and menacing without trying, a rough working-class Chicago accent, gravelly, few words.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
  },
  {
    id: "augie",
    name: "Augie",
    role: "A man at Riverside Shipping",
    portrait: "char.augie",
    bio: [{ text: "One of the two men who held you at Riverside Shipping. Does the dock rounds at the half hour." }],
    available: nobody,
    known: { hasEvidence: "E26" },
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "A man in his thirties, a 1927 Chicago warehouse heavy: nasal, whiny and complaining, a little dim, a thick working-class Chicago accent.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
  },
  {
    id: "stranger",
    name: "Unknown caller",
    role: "Would not give his name",
    portrait: "char.stranger",
    bio: [{ text: "A man who telephoned the office to warn you away from the river." }],
    available: nobody,
    known: nobody,
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
    // The same voice as Sal: an attentive listener can tell, and the captive's notes say so.
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Same man as Sal, on a telephone line: flat, low, bored, menacing.",
      sameAs: "sal",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
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
  // Louise Vale: the client
  // =====================================================================
  q("louise", "Arthur", "louise_hire", "Why did you hire us?", [
    "Because the police have decided it was Henry, and once a policeman decides something he stops looking. Officer Keene is the only one who isn't sure, and he has a captain.",
    "Arthur was frightened of something last week, and it wasn't Henry. He was never frightened of Henry. Nobody is.",
  ]),
  q("louise", "Arthur", "louise_arthur", "Tell me about your brother.", [
    "He was eleven when our father died, and he decided he'd be the man of the house. He never stopped. Everybody in Chicago thought he was talking to them alone, at night. He was.",
    "He wasn't careful with money and he wasn't careful with people, but he was honest. It made him tiresome at dinner parties.",
  ]),
  q("louise", "Arthur", "louise_announcement", "Did Arthur say anything about an announcement?", [
    "He telephoned on Wednesday night, the nineteenth, late. He said, 'Lou, listen on Friday at twenty-five to eleven. I'm going to make an announcement that will cost some people their jobs, and I'll probably be one of them.'",
    "I asked him what about and he laughed and said, 'Money, what else? Somebody's been using my microphone to sell something it never said.' He said he'd tell me all of it at Sunday dinner.",
  ], {
    reveals: "On Wednesday, Oct 19, Arthur told Louise he would make an announcement on Friday at 10:35 that would 'cost some people their jobs': about money, and his microphone 'selling something it never said.'",
    effects: [tl("Wed Oct 19", "Arthur telephones Louise: he will make an announcement on Friday at 10:35 about money at the station.", "Louise Vale")],
  }),
  q("louise", "Arthur", "louise_lastsaw", "When did you last see him?", [
    "Sunday dinner, the sixteenth. He brought a pie he hadn't baked and told me Harlan was 'getting grand.' That was the whole of the conversation about work. The rest was about my roof.",
  ]),
  q("louise", "People", "louise_henry", "What about Henry Mercer?", [
    "Henry is a weak man who borrowed money from my brother and couldn't pay it back. They shouted at each other; they always shouted at each other. Henry would sooner cry than hit anyone.",
    "He came to my door on Saturday and stood on the step in the rain and couldn't say anything. I sent him away. I'm sorry for that now.",
  ]),
  q("louise", "People", "louise_victor", "What did Arthur think of Victor Harlan?", [
    "Mr. Harlan gave Arthur his start at WCRB in 1924, and Arthur was grateful for a long time. Lately he called him 'the Accountant,' and not kindly.",
    "He said Victor had started taking money from places that didn't make any noise. I thought he meant cheap sponsors. I didn't ask.",
  ]),
  q("louise", "People", "louise_rose", "Do you know Rose Marlowe?", [
    "The singer. Arthur took me to hear her once, at a place I'm not supposed to know the name of, behind a cigar store on Clark Street. She's kind. I think she loved him a little. I think everyone did, a little.",
  ]),
  q("louise", "The police", "louise_police", "What have the police told you?", [
    "That Arthur was struck on the head in his studio after his program began, and that the door was barred from inside, and that Henry lied about where he was. Officer Keene told me privately that he didn't like the door any more than I did.",
  ]),
  q("louise", "The letter", "louise_letter", "What does Arthur's letter say?", [
    "Read it yourself; it's on the piano. He went through the station's books on Tuesday. A supper club paid for forty-six advertisements and he read six of them. The money went out again to a company he'd never heard of. Lakeshore Novelty.",
    "He wrote, 'I think I know who is doing the washing.' He didn't write the name. Of course he didn't. He was going to say it on the air.",
  ], { requires: { flag: "letter_found" }, reveals: "Arthur's letter: the Blue Lantern paid for 46 spots, six aired; the money went out to 'Lakeshore Novelty.' He thought he knew who was 'doing the washing.'" }),
  q("louise", "The letter", "louise_lakeshore", "Have you heard of Lakeshore Novelty?", [
    "Never, until his letter. If it were a real company that made real advertisements, Arthur would have read one of them. He read everything they gave him. He read the price of hogs.",
  ], { requires: { any: [{ hasEvidence: "E12" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }] } }),
  q("louise", "After", "louise_warehouse", "Have you heard what happened at the warehouse?", [
    "Officer Keene telephoned me. He said you were all right, and he said I wasn't to think it was my fault for hiring you, and that you'd say the same. Is it true? Are you all right?",
    "Arthur would have liked you. He'd have put you on the air.",
  ], { requires: over }),

  // =====================================================================
  // Victor Harlan: the station manager; his own account, lies included
  // =====================================================================
  q("victor", "Friday night", "victor_evening", "Where were you on Friday evening?", [
    "In my office from half past nine with the month's accounts and the door shut, as I told Officer Keene. At ten past ten I went out to the lobby to meet Mr. Hollister, our sponsor, who likes to hear his program with the people who make it.",
    "I was with Mr. Hollister from then until Finch came for me at twenty-five to eleven.",
  ], {
    reveals: "Victor Harlan says he was in his office with the door shut from 9:30 to 10:10, then in the lobby with the sponsor until 10:35.",
    effects: [tl("9:30 to 10:10 PM (Fri)", "Victor Harlan says he was in his office with the accounts, door shut.", "Victor Harlan")],
  }),
  q("victor", "Friday night", "victor_broadcast", "What did you hear at 10:15?", [
    "Arthur, opening his program. 'Good evening, Chicago.' Mr. Hollister and I stood under the lobby loudspeaker for it. He was in fine voice. Mr. Hollister remarked on it.",
    "That's what makes it so hard, you see. He was alive at a quarter past ten, talking to half the city.",
  ], { reveals: "Victor Harlan says he heard Arthur Vale open the program live at 10:15, with the sponsor, on the lobby loudspeaker." }),
  q("victor", "Friday night", "victor_found", "Tell me how he was found.", [
    "At twenty-five to eleven Finch came running. Arthur hadn't answered his cue for the announcement and the door was barred. Arthur always barred it on the air; he hated anyone wandering in.",
    "We put our shoulders to it, Finch and I, and the brackets gave at about twenty to. He was on the floor. Miss Whitcomb telephoned the police.",
  ]),
  q("victor", "Friday night", "victor_curtain", "Why was the curtain drawn?", [
    "Arthur liked it drawn when he was going to do something special. He said the engineer's face put him off. Artists.",
  ]),
  q("victor", "Arthur", "victor_arthur", "How did you and Arthur get along?", [
    "I gave Arthur Vale his first microphone in 1924, when he was reading livestock prices for a feed company. We built the station on that voice. We disagreed about money, as every manager and every star do. I was very fond of him.",
  ]),
  q("victor", "Arthur", "victor_announcement", "What was Arthur going to announce at 10:35?", [
    "A new sponsor, I assumed. Arthur liked to surprise me with things I'd already signed. Whatever it was, he never had the chance.",
  ]),
  q("victor", "Arthur", "victor_henry", "Who would want to hurt Arthur?", [
    "I don't like to say it. Henry Mercer was in our lobby at a quarter past eight, shouting at Arthur about money, in front of my staff. I heard him tell Arthur he'd be sorry.",
    "I gather he told the police he went home. I gather he hasn't got a home.",
  ]),
  q("victor", "The station", "victor_card", "Why did you rewrite the program card at 9:05?", [
    "Did I? Yes. Arthur came to me at nine and said his voice was going; he wanted to save it for the announcement. I suggested we play his rehearsal for the opening and he agreed. Finch had it on a disc.",
    "It's done all the time.",
  ], { requires: { hasEvidence: "E05" }, reveals: "Victor Harlan says Arthur asked at 9:00 to save his voice, and agreed to the rehearsal disc being played at 10:15." }),
  q("victor", "The station", "victor_unannounced", "Why wasn't the recording announced?", [
    "An oversight. I'll speak to Finch about it. The Commission's rules are a nuisance.",
    "I hardly think it matters now.",
  ], { requires: { any: [{ hasEvidence: "E05" }, { hasEvidence: "E08" }] } }),
  q("victor", "The station", "victor_disc", "Why did you sign disc A-114 out of the workshop at 9:10?", [
    "To give it to Finch at the board. I'm the manager; I sign for things.",
    "Where it went after that I couldn't tell you. In the rack, I'd imagine. That's where discs live.",
  ], { requires: { hasEvidence: "E08" } }),
  q("victor", "The station", "victor_diary", "Your book says '9:50, A.V., Studio A.'", [
    "I meant to look in on him before the program, and I didn't; the accounts ran long. I crossed it out. A man doesn't usually have to explain his own diary.",
  ], { requires: { hasEvidence: "E16" }, reveals: "Victor Harlan says he meant to see Arthur in Studio A at 9:50 but didn't, and struck the entry out." }),
  q("victor", "The station", "victor_storage", "Were you in the equipment storage room at about ten?", [
    "Ah. Miss Whitcomb. The storage lamp had been left burning again and I went to put it out. It was a minute's errand. I'd hardly call that 'in' the room.",
    "As to the time, I wouldn't trust anyone's watch that night but Mr. Hollister's.",
  ], { requires: { hasEvidence: "E17" } }),
  q("victor", "The station", "victor_locksmith", "Why did you change the lock on the storage room?", [
    "Tubes go missing. Discs go missing. After Friday I wasn't taking chances with anything on that floor.",
  ], { requires: { any: [{ hasEvidence: "E16" }, { flag: "clara_panel" }, { inspected: "st_lock" }] } }),
  q("victor", "The money", "victor_bluelantern", "Tell me about the Blue Lantern account.", [
    "A supper club on Clark Street. A good customer. They buy announcements, we broadcast them.",
    "If Arthur skipped some of them, that's between Arthur and his conscience. Talent forgets things.",
  ], { requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E12" }] } }),
  q("victor", "The money", "victor_lakeshore", "Who is Lakeshore Novelty?", [
    "An outside production house. We buy production for some of the smaller accounts: the jingles, the copy. It's an ordinary arrangement.",
    "I don't remember who owns it. A post-office box, I think. The checks clear.",
  ], { requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }, { hasEvidence: "E12" }] }, reveals: "Victor Harlan calls Lakeshore Novelty 'an outside production house' and says he doesn't remember who owns it." }),
  q("victor", "The money", "victor_russo", "Do you know Dominic Russo?", [
    "I know the name. The Blue Lantern's man. I've never met him. Our business is done by mail.",
  ], { requires: { any: [{ talkedTo: "russo" }, { hasEvidence: "E23" }, { hasEvidence: "E15" }] } }),
  q("victor", "The money", "victor_warehouse", "Where were you on Monday night at 11:40?", [
    "At home, in bed, as a man of my age should be at that hour.",
  ], { requires: over }),

  // =====================================================================
  // Henry Mercer: the police's man; innocent
  // =====================================================================
  q("henry", "Friday night", "henry_argument", "What was the argument with Arthur about?", [
    "Four thousand dollars. I owed it to him and he wanted it by the first of November. I went to the station at eight to talk to him like a gentleman and ended up shouting in the lobby like a fishwife.",
    "I said, 'You'll be sorry if you do this to me, Arthur, I'll go under.' Harlan's been telling everyone I said 'You'll be sorry.' That's the half of the sentence he liked.",
  ], { reveals: "Henry Mercer says the argument at 8:15 was about a $4,000 loan; he told Arthur 'you'll be sorry if you do this to me, I'll go under.'" }),
  q("henry", "Friday night", "henry_loan", "Tell me about the loan.", [
    "In March the bank was going to take Vale and Mercer. Arthur lent me four thousand to keep it out of their hands. I said July. It's October.",
    "Then this month he wanted it all back, by November first. He said he wouldn't be at WCRB much longer and he'd need every dollar. I thought he was being dramatic. Arthur was usually being dramatic. The letters are at my apartment, if the landlord will let you in.",
  ], { reveals: "Arthur lent Henry $4,000 in March; in October he demanded it by November 1, saying he wouldn't be at WCRB much longer." }),
  q("henry", "Friday night", "henry_evening", "Where did you go after you left the station?", [
    "I left at twenty to nine and walked. I didn't have the fare and I didn't want anybody to see my face. It started to rain on Roosevelt Road. I got to Doyle's at twenty past nine, soaked, and Mrs. Doyle wrote it in her book with a remark about my umbrella.",
    "I had my supper in her kitchen and played rummy with Kowal and Briggs in the parlor until after midnight. Ask her. Ask them. I lost four dollars and sixty cents.",
  ], {
    reveals: "Henry Mercer says he reached Doyle's at 9:20 PM, soaked, and played rummy with two lodgers until after midnight.",
    effects: [tl("8:40 PM (Fri)", "Henry Mercer leaves WCRB.", "Henry Mercer"), tl("9:20 PM (Fri)", "Henry Mercer reaches Doyle's on South Halsted, soaked. Rain has started.", "Henry Mercer")],
  }),
  q("henry", "Friday night", "henry_police", "Why did you tell the police you went home?", [
    "Because I was ashamed. Because my 'home' is a room in a boardinghouse on Halsted Street with a landlady who writes down when I come in. Because I'm forty-three years old and I own half a radio program and I can't pay my rent.",
    "It was a stupid lie and it's the only one I've told.",
  ]),
  q("henry", "Friday night", "henry_apartment", "What happened to your apartment?", [
    "Mr. Szabo put a padlock on it on the fifteenth. Two hundred and ten dollars behind. My things are still in there, my desk, my letters. He'll let you in if you tell him you're from the police. Or from anybody, really. He likes company.",
  ]),
  q("henry", "The program", "henry_broadcast", "Did you hear the program at 10:15?", [
    "Mrs. Doyle keeps WCRB on in the parlor every night; she's sweet on Arthur's voice. We were halfway through a hand. He came on and said the sky over the Loop was clear as a bell, and stumbled on it, and I laughed out loud, because it was coming down in buckets on Halsted Street.",
    "I said, 'He's never once looked out a window.' Kowal laughed. Then I felt rotten about laughing.",
  ], { reveals: "Henry heard the 10:15 opening at Doyle's: Arthur said the sky was 'clear as a bell,' stumbling on it, while it was pouring rain." }),
  q("henry", "The program", "henry_transcript", "Is there a record of exactly what went out on the air?", [
    "There is, as it happens. Crane and Ward, Hollister's advertising agency, has a girl take down every program from a receiver, word for word, so the client knows he got what he paid for. Vale and Mercer gets a copy every Monday.",
    "I picked up Friday's this morning. Here. Read the first lines and tell me it wasn't clear as a bell.",
  ], { effects: [{ giveEvidence: "E07" }], reveals: "Henry hands over the sponsor's stenographic transcript of the 10:15 broadcast." }),
  q("henry", "People", "henry_arthur", "What was Arthur like to work with?", [
    "Impossible, and worth it. He'd rewrite a script on his cuff a minute before air. He never once did a program the way it was typed.",
    "Last week he was different. Quiet. He went through every program log we had for September. He said, 'Henry, how many Blue Lantern spots did you hear me read last month?' I said I didn't listen to the commercials. He said, 'Neither did anybody.'",
  ]),
  q("henry", "People", "henry_victor", "What do you make of Victor Harlan?", [
    "Harlan squeezed us on the rate every year and smiled while he did it. He and Arthur had been at each other since September, and I don't know why; Arthur stopped telling me things.",
    "On Friday, when I was leaving, Harlan was in the hall outside Studio A, looking at the door. Just looking at it. That was twenty to nine.",
  ]),
  q("henry", "People", "henry_lantern", "Do you know the Blue Lantern?", [
    "The supper club behind the cigar store on Clark. Arthur went on Saturday nights to hear Rose Marlowe sing. I went with him twice; I couldn't afford the whiskey.",
    "You don't walk in. You ask the man at the cigar counter for 'a box of Havanas, the blue label,' and he lets you through the back. Or ask Rose; they know her.",
  ], { reveals: "The Blue Lantern is behind Lantern Cigars on North Clark Street. The password: 'a box of Havanas, the blue label.'" }),
  q("henry", "People", "henry_announcement", "Did Arthur tell you about his announcement?", [
    "Not a word. He wrote me on the twelfth, 'I'll tell you why when I can.' Then he didn't.",
  ]),

  // =====================================================================
  // Samuel Finch: lies about 10:15 until his card reaches the office
  // =====================================================================
  q("samuel", "Friday night", "samuel_evening", "Walk me through Friday evening at the board.", [
    "Same as every Friday, sir. Hollister Hour at seven fifteen, the talk, the organ, the orchestra at nine with Miss Marlowe, the news, the recital disc at ten. I was at the board the whole time.",
  ], {
    variants: [
      {
        requires: samuelClean,
        reply: [
          "All of it, this time. At five past nine Mr. Harlan came in with the 10:15 card rewritten in his own hand: Mr. Vale's opening and letters by transcription, disc A-114, the curtain drawn, not for the log. He said Mr. Vale had agreed, to rest his voice for 10:35. He drew the curtain himself from the studio side, and he signed the disc out of the workshop and brought it to me.",
          "At ten fifteen I put A-114 on turntable 2 and keyed PHONO 2. At ten twenty-seven the orchestra. At ten thirty-five I gave Mr. Vale his cue light for the announcement and nothing happened.",
        ],
      },
    ],
    effects: [{ when: samuelClean, then: [tl("9:05 PM (Fri)", "Victor Harlan hands Samuel Finch the rewritten 10:15 card and draws the Studio A curtain.", "Samuel Finch")] }],
  }),
  q("samuel", "Friday night", "samuel_1015", "Was Arthur Vale live on the air at 10:15?", [
    "Yes, sir. Live. From Studio A. Like every night.",
  ], {
    variants: [
      {
        requires: samuelClean,
        reply: [
          "No, sir. He wasn't. What went out at ten fifteen was disc A-114, the rehearsal I cut at ten past seven. I played it. I told the police he was live because a recording that isn't announced is against the Commission's rules, and Mr. Harlan said nobody had to know.",
          "I didn't know he was dead behind that curtain. I swear to God I didn't.",
        ],
      },
    ],
    reveals: "Samuel Finch says Arthur Vale was live at 10:15.",
  }),
  q("samuel", "Friday night", "samuel_rehearsal", "Did Arthur rehearse that evening?", [
    "At ten past seven. He had a new opening and he wanted to hear how it sounded, so I cut it on a disc in the workshop: the opening and the letters, twelve minutes. A-114. He listened to it once and laughed at himself for stumbling on 'bell.'",
  ], { effects: [tl("7:10 PM (Fri)", "Arthur Vale rehearses his opening and letters; Samuel Finch cuts it on disc A-114.", "Samuel Finch")] }),
  q("samuel", "Friday night", "samuel_curtain", "Why was the curtain drawn?", [
    "Mr. Vale wanted to rest his voice. Before the announcement. That's what I was told.",
  ], {
    variants: [{ requires: samuelClean, reply: ["Mr. Harlan drew it, at about ten past nine, from inside the studio. He said Mr. Vale wanted it so. I never saw Mr. Vale behind it after that. I never saw him at all."] }],
  }),
  q("samuel", "Friday night", "samuel_cue", "What happened at 10:35?", [
    "I gave him the cue light for the announcement. Nothing. I gave it again. Dead air. I knocked on the studio door and it was barred, and I ran for Mr. Harlan. He came from the front of the floor, from the lobby. We forced the door together at twenty to eleven.",
  ], { effects: [tl("10:35 PM (Fri)", "Arthur Vale does not answer his cue for the special announcement. Dead air.", "Samuel Finch")] }),
  q("samuel", "The equipment", "samuel_workshop", "Where do you make recordings?", [
    "In the workshop, sir, at the back. The cutting lathe. We do our own advertisements and the recital discs. It's the best equipment in Chicago; Mr. Harlan bought it last year. You can go and look. I'll come with you.",
  ]),
  q("samuel", "The equipment", "samuel_disc", "Where is disc A-114 now?", [
    "Back in the rack in the workshop. I don't know who put it back. The log says Mr. Harlan took it out at ten past nine and it doesn't say anybody brought it in.",
    "I played it for you. It's him. It's the rehearsal.",
  ], { requires: { any: [{ hasEvidence: "E06" }, { hasEvidence: "E08" }] } }),
  q("samuel", "The equipment", "samuel_recorder", "What is the pen recorder on the wall?", [
    "The line register. It writes down which key is sending to the transmitter, minute by minute, on a paper strip. It runs by itself. I forget it's there, mostly.",
  ], {
    variants: [{ requires: samuelClean, reply: ["The line register, sir. It shows PHONO 2 from ten fifteen to ten twenty-seven. I forgot it was there. I should have known it would tell on me sooner or later."] }],
  }),
  q("samuel", "The equipment", "samuel_rules", "Is it allowed to play a recording without saying so?", [
    "No, sir. The Federal Radio Commission says any program by recording has to be announced as a recording. It's in the workshop log, Mr. Harlan's own instruction. A station can lose its license, and an engineer can lose his ticket.",
  ]),
  q("samuel", "The equipment", "samuel_weight", "What's missing from Studio A?", [
    "The brass base weight off the floor stand, sir. Nine pounds. It sits on the foot to stop the stand tipping. The police took the stand and there was no weight on it, and it isn't anywhere in the studio. I've looked.",
  ], { requires: { any: [{ hasEvidence: "E20" }, { hasEvidence: "E01" }] }, reveals: "Samuel Finch says the nine-pound brass base weight from the Studio A floor stand is missing." }),
  q("samuel", "The equipment", "samuel_panel", "What's the panel behind the amplifier rack?", [
    "The cable crawlway, through to the storage room. It's how we run new lines into Studio A without taking the wall down. The turn-buttons are on the storage side so the studio stays quiet.",
    "Mr. Harlan had it put in when we built the studio. Not many people know it's there. Me, and Mr. Harlan, and the man who built it.",
  ], { requires: { any: [{ hasEvidence: "E03" }, { inspected: "sa_rack" }] }, reveals: "Samuel Finch says the crawlway panel to storage is known to himself, Victor Harlan and the builder." }),
  q("samuel", "People", "samuel_victor", "Where was Mr. Harlan between half past nine and half past ten?", [
    "I couldn't say, sir. I was at the board. He came from the front when I fetched him at ten thirty-five.",
  ], {
    variants: [{ requires: samuelClean, reply: ["He was in the control room at five past nine, and in the studio at ten past to draw the curtain. After that I didn't see him until ten thirty-five, when he came from the front. I don't know where he was at ten. I've been thinking about nothing else."] }],
  }),

  // =====================================================================
  // Clara Whitcomb: the secretary
  // =====================================================================
  q("clara", "Friday night", "clara_evening", "What did you do on Friday evening?", [
    "I was in the office typing Monday's invoices. I didn't go anywhere. I told the officer so.",
  ], {
    variants: [{ requires: { hasEvidence: "E17" }, reply: ["I was in the office typing, except for the minute I went down the back hall for carbon paper, at about two minutes past ten. You have it in writing."] }],
  }),
  q("clara", "Friday night", "clara_argument", "Did you hear Henry Mercer and Arthur argue?", [
    "Everyone on the floor heard it. A quarter past eight, in the lobby. Mr. Mercer said, 'You'll be sorry if you do this to me, Arthur, I'll go under.' Mr. Vale said, 'I'm sorry already, Henry. The first of November.' Then Mr. Mercer left, about twenty to nine. Crying, I think.",
  ], { reveals: "Clara heard Henry say 'You'll be sorry if you do this to me, Arthur, I'll go under.' Henry left about 8:40." }),
  q("clara", "Friday night", "clara_discovery", "Tell me what happened at 10:40.", [
    "Samuel shouted, and Mr. Harlan came down the hall, and they broke the door. Mr. Vale was on the floor. Mr. Harlan told me to telephone the police, so I did. It was eight minutes to eleven. I remember looking at the clock because my hands were shaking and I wanted to look at something.",
  ], { effects: [tl("10:52 PM (Fri)", "Clara Whitcomb telephones the police.", "Clara Whitcomb")] }),
  q("clara", "Friday night", "clara_victor", "Where was Mr. Harlan at about ten o'clock?", [
    "I told the officer I didn't see anything. Mr. Harlan was standing next to me when he asked.",
    "At about two minutes past ten I went down the back hall for carbon paper. Mr. Harlan came out of the equipment storage room, wiping his hands on his handkerchief. His right cuff was wet. He told me to go home. I've written it all down for you, and signed it. Here.",
  ], {
    requires: { any: [{ hasEvidence: "E03" }, { hasEvidence: "E16" }, { hasEvidence: "E20" }, { hasEvidence: "E22" }] },
    effects: [{ giveEvidence: "E17" }, tl("~10:02 PM (Fri)", "Clara Whitcomb sees Victor Harlan leave the equipment storage room, wiping his hands.", "Clara Whitcomb")],
    reveals: "Clara saw Victor Harlan leave the equipment storage room at about 10:02 PM, wiping his hands, his right cuff wet.",
  }),
  q("clara", "The office", "clara_books", "Did Arthur look at the station's books?", [
    "On Tuesday the eighteenth, in the afternoon. He asked for the advertising ledger and the September program logs and sat at the end of my desk for two hours with a pencil. He didn't say a word to me. When Mr. Harlan came in, Mr. Vale closed the ledger and went out.",
  ], { effects: [tl("Tue Oct 18", "Arthur Vale spends two hours with the advertising ledger and the September program logs.", "Clara Whitcomb")] }),
  q("clara", "The office", "clara_invoice", "What can you tell me about the Blue Lantern account?", [
    "I type the invoices from the program logs. In September the Blue Lantern had six announcements. I typed it that way on the thirtieth. The next morning Mr. Harlan had me type it again, forty-six announcements, payable to Lakeshore Novelty, and throw the first one away.",
    "I didn't throw away the carbon. I don't know why. Here, you'd better have it.",
  ], {
    requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E12" }, { asked: "clara_books" }] },
    effects: [{ giveEvidence: "E14" }],
    reveals: "Clara typed the September Blue Lantern invoice for six spots; Victor Harlan had her retype it for 46, payable to Lakeshore Novelty.",
  }),
  q("clara", "The office", "clara_lakeshore", "Who is Lakeshore Novelty?", [
    "I've never seen anyone from it. Their invoices come in plain envelopes from a post-office box. Mr. Harlan opens those himself, and he signs their checks himself. He never does that with anyone else's.",
  ], { requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }, { hasEvidence: "E12" }] } }),
  q("clara", "The office", "clara_keys", "Who has keys to the equipment storage room?", [
    "Samuel has one and Mr. Harlan has one. It's never locked in the daytime. It was never locked at all, until Saturday.",
  ]),
  q("clara", "The office", "clara_police", "Why didn't you tell the police?", [
    "Because Mr. Harlan was standing next to me with his hand on my shoulder, telling the officer what a terrible shock it had been for me. I have a mother on the West Side and a job I'm good at. I'm not proud of it.",
  ], { requires: { hasEvidence: "E17" } }),
  q("clara", "The office", "clara_panel", "Tell me about the storage room lock and the panel.", [
    "On Saturday at nine a locksmith came and changed the storage room lock, on Mr. Harlan's order, and Mr. Harlan kept the only key. I let the locksmith in. The two little brass buttons on the cable panel had been oiled. They were shining wet. Nobody oils anything in that room.",
  ], { reveals: "On Saturday morning Victor Harlan had the storage lock changed and kept the only key; the crawlway turn-buttons had been oiled." }),

  // =====================================================================
  // Dominic Russo: the supper club; partner in the scheme, not the murder
  // =====================================================================
  q("russo", "The club", "russo_who", "Who are you, and what is this place?", [
    "Dominic Russo. This is the Blue Lantern. A supper club. Steak, a band, a little dancing. Rose sings Saturdays. Sit down, you're making the waiters nervous.",
  ]),
  q("russo", "The club", "russo_friday", "Where were you on Friday night?", [
    "Right here, from six until four in the morning, in front of forty customers, two waiters, a band and a police lieutenant who likes our rye. Ask any of them. I don't go to radio stations. They're full of radio people.",
  ]),
  q("russo", "The club", "russo_arthur", "Did you know Arthur Vale?", [
    "Saturday nights, that table, Rose on the stand. He tipped like a sailor and he listened when she sang, which most of them don't. I liked him fine.",
    "Lately he was asking my waiters how much the club spends on the radio. I don't know why a radio man cares what a supper club spends on the radio.",
  ]),
  q("russo", "The money", "russo_spots", "Why does the Blue Lantern advertise on WCRB?", [
    "I like the radio. Good for business.",
    "Forty-six announcements, they tell me. You'd have to ask the station how many they read. I don't listen to my own advertisements. Who does?",
  ], { requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E12" }] } }),
  q("russo", "The money", "russo_lakeshore", "What is Lakeshore Novelty?", [
    "Advertising. What else would it be. You pay the station, the station pays the advertising people, the advertising people do whatever advertising people do. Very modern.",
  ], { requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }, { hasEvidence: "E12" }] } }),
  q("russo", "The money", "russo_cabinets", "What's in the crates stenciled radio cabinets?", [
    "Radio cabinets. It's a radio-themed club. We're very modern.",
    "All right. You've got eyes. So does every cop on Clark Street. Rye isn't what killed your radio man, friend.",
  ], { requires: { hasEvidence: "E15" } }),
  q("russo", "The money", "russo_victor", "Do you know Victor Harlan?", [
    "Never met the man.",
  ], {
    variants: [
      {
        requires: { hasEvidence: "E23" },
        reply: [
          "You've been in my office. All right. Harlan and I do business. He squares the books at the station and he pays the warehouse. I pay the station for my 'spots.' Nobody gets hurt. Rye goes in, money comes out clean, everybody's happy.",
          "That's all it ever was. Whatever happened to your radio man, I didn't need it. I was making money.",
        ],
      },
    ],
  }),
  q("russo", "The money", "russo_suspicion", "Did Harlan say anything about Arthur Vale?", [
    "Two weeks ago Harlan came in here jumpy, which he never is, and asked if my boys could 'have a word' with an announcer who was getting nosy. I said I don't do favors for station managers; I'm in the supper business.",
    "Then on Saturday morning I read the paper, and I thought, well. Well, well. And I thought: that's not my problem. And I still think so.",
  ], { requires: { any: [{ hasEvidence: "E23" }, { deduction: "D10" }] }, reveals: "Russo says Harlan asked him two weeks before if his men could 'have a word' with a nosy announcer; Russo says he refused." }),
  q("russo", "The money", "russo_warehouse", "Do you know Riverside Shipping?", [
    "I know a lot of warehouses. It's a city on a river.",
  ], {
    requires: { any: [{ hasEvidence: "E15" }, { hasEvidence: "E25" }] },
    variants: [
      {
        requires: over,
        reply: [
          "I heard about Monday night. Sal and Augie are not my boys; they work for whoever pays them on a Monday. Monday, that wasn't me.",
          "I'll tell you one thing for nothing. The ledger in that office was mine, and somebody came for it, and it wasn't the police.",
        ],
      },
    ],
  }),

  // =====================================================================
  // Rose Marlowe: the singer
  // =====================================================================
  q("rose", "Friday night", "rose_friday", "What did you do on Friday night?", [
    "Sang with the Starlight from nine to half past in Studio B, the same three songs Hollister likes. Then I went to say goodnight to Arthur on my way out, the way I always do. Did.",
  ]),
  q("rose", "Friday night", "rose_door", "Tell me about talking to Arthur at the studio door.", [
    "Twenty-five to ten. The news was on in the hall. I waved through the little window in the Studio A door, and he opened it. He was nervous and happy at once, like a boy before a fight. He had his opening in his hand and he read it to me.",
    "I wasn't listening to the words, honey, I was thinking about my own set. He said, 'Listen at twenty-five to eleven, Rosie, you'll want to.' Then he closed the door and I heard the bar go down.",
  ], {
    reveals: "Rose talked with Arthur at the Studio A door at 9:35 PM; he read her his opening, said to listen at 10:35, closed the door and barred it.",
    effects: [tl("9:35 PM (Fri)", "Rose Marlowe talks with Arthur Vale at the Studio A door. He is alive, nervous and happy, and bars the door after her.", "Rose Marlowe")],
  }),
  q("rose", "Friday night", "rose_raining", "What exactly did Arthur read you at the door?", [
    "I didn't remember it right off. Now I can't forget it. 'Good evening, Chicago. This is Arthur Vale, the night is young, and it's raining on the Loop, so pull up a chair.' He'd crossed out 'clear as a bell.' He laughed and said he'd better tell them it was raining. He read it twice more. He never stumbled.",
  ], { requires: { callAnswered: "call_rose" }, reveals: "At 9:35 Arthur read Rose 'it's raining on the Loop'; he had crossed out 'clear as a bell' and never stumbled." }),
  q("rose", "Friday night", "rose_bar", "Did Arthur always bar the studio door?", [
    "Every night he was on. He said once a cleaning woman walked in on him in the middle of a love poem and he'd never live it down. He'd bar it after the last person said goodnight.",
  ]),
  q("rose", "People", "rose_arthur", "How well did you know Arthur?", [
    "Well enough. Saturday nights he'd sit at the front table at the Lantern and listen like it mattered. That's rarer than you'd think, in my line. We had dinner some Sundays. That's all you need to know, and more than I've told anybody.",
  ]),
  q("rose", "People", "rose_victor", "What do you think of Victor Harlan?", [
    "He calls me 'Miss Marlowe' like it's a word he looked up. He doesn't like singers who sing at places he doesn't own. On Friday he was in the hall when I came off the air, at half past nine, walking up and down outside his own office like a man waiting for a train.",
  ]),
  q("rose", "People", "rose_lantern", "Can you get me into the Blue Lantern?", [
    "Lantern Cigars, eight-eighteen North Clark. Ask the man at the counter for a box of Havanas, the blue label. He'll let you through the back. Tell Dom I sent you; he'll like you less, but he'll talk to you.",
  ], { reveals: "Rose: the Blue Lantern is behind Lantern Cigars, 818 North Clark. Ask for 'a box of Havanas, the blue label.'" }),
  q("rose", "People", "rose_russo", "What is Dominic Russo like?", [
    "Dom pays the band on time and keeps his hands to himself, which is two more things than most club men. He's not a nice man. He's a polite one.",
  ]),
  q("rose", "People", "rose_announcement", "Do you know what Arthur meant to announce?", [
    "No. But he said a funny thing on Saturday at the club, the week before. He said, 'Rosie, how many times have you heard me say the name of this place on the air?' I said never. He said, 'Me neither.'",
  ]),

  // =====================================================================
  // Officer Keene: the police contact (no question limit)
  // =====================================================================
  q("keene", "The file", "keene_case", "What do you make of the case?", [
    "My captain likes Mercer because Mercer shouted and Mercer lied. Mercer's a liar, all right. But he's a liar who couldn't break a bar off a door without a carpenter.",
    "What I don't like: a barred door, and a voice on the radio. A dead man doesn't bar a door, and a man who's barred himself in doesn't hit himself on the side of the head.",
  ]),
  q("keene", "The file", "keene_photos", "Can I see the scene photographs?", [
    "Bureau photographer's prints and his sketch. Copy's yours. Look at the floor stand, and look at what's not on it.",
  ], { effects: [{ giveEvidence: "E01" }] }),
  q("keene", "The file", "keene_coroner", "What did the coroner find?", [
    "Doc Ames's report. One blow, left temple, something round and heavy. He says Vale couldn't have said a word after it. And read what he says about the time; it's not what my captain thinks it says.",
  ], { effects: [{ giveEvidence: "E02" }], reveals: "Officer Keene hands over the coroner's physician's report." }),
  q("keene", "The file", "keene_statements", "What did everyone tell the police?", [
    "Here's my summary of what we took down that night. Harlan, the engineer, the secretary, Mercer. The stenographer's cylinders are on your desk, if you'd rather hear Harlan and the engineer in their own voices.",
  ], { effects: [{ giveEvidence: "E22" }] }),
  q("keene", "The file", "keene_weapon", "Was a weapon found?", [
    "Nothing in the room that fits the coroner's description. We looked. The stand was on its side, so the captain says Mercer used the stand. The stand's nickel tube, not round and heavy. Doesn't fit.",
  ]),
  q("keene", "The file", "keene_mercer", "Why does your captain like Henry Mercer for it?", [
    "He shouted, he threatened, he owed the dead man money, and he told us he went home to an apartment with a padlock on it. To a captain that's three-quarters of a conviction.",
  ]),
  q("keene", "The chemist", "keene_send_weight", "Can you get the brass weight tested?", [
    "Bring it in. I'll walk it down to Tessaro myself; he's the City Chemist, he owes me a hat. He can tell you if it's blood and if it's human, and maybe the group. He can't tell you whose hand. Give him a few minutes.",
  ], { requiresEvidence: ["E18"], effects: [{ startLab: "weight" }] }),
  q("keene", "The chemist", "keene_lab", "What did the chemist find?", [
    "Human blood in the screw thread, Vale's group, which is four people in ten. Wiped down with that rag. It's the weapon, near as anybody can say. It doesn't say who swung it. Somebody who knew where the storage room was.",
  ], { requires: { labReady: "weight" } }),
  q("keene", "People", "keene_russo", "What do you know about Dominic Russo?", [
    "The Blue Lantern. Rye from Canada, beer from Cicero, protection from somebody in the Twenty-Second Ward who isn't me. He's never been near a killing that I know of. He's a businessman. That's what they all say, and with Russo it's mostly true.",
  ], { requires: { any: [{ talkedTo: "russo" }, { hasEvidence: "E13" }, { hasEvidence: "E15" }] } }),
  q("keene", "People", "keene_victor", "What do you make of Victor Harlan?", [
    "Smooth. Gave a good statement. Too good; he had the times ready before I asked. That's not evidence, that's a feeling, and I don't take feelings to a judge.",
  ], {
    variants: [{ requires: { deduction: "D08" }, reply: ["His own book puts him at the studio at ten to ten. Your secretary puts him in the storage room at two minutes past. And he heard a man 'live' who was on a disc. That's not a feeling anymore. Bring me the money and I'll bring you a warrant."] }],
  }),
  q("keene", "Monday night", "keene_partner", "My partner went to Riverside Shipping and hasn't come back.", [
    "On a note? Damn it. Listen to me: I can't take a squad through a warehouse door on a note signed with initials; the captain would have my badge and they'd have the place empty before we got the chain off.",
    "Find me which door. You've got that kid's sketch. Find where they are, and find somebody on the inside with a key, and you'll get there faster than I could. I'll have a car on Kinzie Street.",
  ], { requires: { all: [held, rescue] } }),
  q("keene", "Monday night", "keene_after", "What happens now, after the warehouse?", [
    "Now I've got a ledger with Harlan's name on every load, and a man who saw him get out of a Packard at twenty to midnight asking where you were. That's enough to open his safe. Let me do that part.",
    "And for the record: none of what happened on Monday is on you. Men like that set traps for people who are getting close. You were getting close.",
  ], { requires: over }),

  // =====================================================================
  // Agnes Doyle: the boardinghouse
  // =====================================================================
  q("agnes", "Mr. Mercer", "agnes_friday", "When did Henry Mercer come in on Friday night?", [
    "Twenty past nine, soaked to the skin like a drowned cat, no umbrella, no hat to speak of. I wrote it in my book. I write everybody in.",
    "He had his supper in my kitchen at half past and then sat down to rummy in the parlor with Mr. Kowal and Mr. Briggs. They were at it until a quarter past twelve, and he lost. Here's the page. Take it. The police never came for it.",
  ], {
    effects: [{ giveEvidence: "E11" }, tl("9:20 PM (Fri)", "Henry Mercer signs in at Doyle's, soaked. Rummy in the parlor until 12:15.", "Agnes Doyle")],
    reveals: "Agnes Doyle's register: Henry Mercer in at 9:20 PM, soaked; supper, then rummy with two lodgers until 12:15.",
  }),
  q("agnes", "Mr. Mercer", "agnes_door", "Could anyone have gone out after ten?", [
    "Not through my front door. I chain it at ten and the key's on my belt. The back stairs creak like a ship and my room's at the bottom of them. Nobody went out of this house on Friday night, and I'd have known.",
  ]),
  q("agnes", "Mr. Mercer", "agnes_henry", "What's Henry Mercer like as a lodger?", [
    "Pays when he can, apologizes when he can't, eats like a bird and plays cards like a fool. He's had Room 4 since the fifteenth, when his landlord shut him out. A gentleman fallen on hard times. I've had worse. I've had a great deal worse.",
  ]),
  q("agnes", "Friday night", "agnes_radio", "Did you hear Arthur Vale's program on Friday?", [
    "I never miss it. I had the set on in the parlor. At a quarter past ten Mr. Vale came on and said the sky was clear as a bell, which made Mr. Mercer laugh out loud, because it was raining fit to drown the cat. I gave him a look. Then later there was nothing, and organ music. I went to bed upset and didn't know why.",
  ]),
  q("agnes", "Friday night", "agnes_police", "Have the police spoken to you?", [
    "Not a word. Not a knock. I read in the paper that Mr. Mercer 'won't say where he was,' and I nearly put my fist through the paper. He was in my parlor losing at rummy, and I can prove it.",
  ]),

  // =====================================================================
  // Frankie Moretti: the night tally clerk (no question limit)
  // =====================================================================
  q("frankie", "The warehouse", "frankie_job", "What do you do here?", [
    "I'm the night tally clerk. Things come in off the barges and the trucks, I count them and write it down. Things go out, I count them and write it down. That's all. I count.",
  ]),
  q("frankie", "The warehouse", "frankie_who", "Who runs this place at night?", [
    "Riverside Shipping's a real company, mister, with real freight. But bay 6 is Mr. Russo's people. A man called Sal at nights, sometimes a fella called Augie. They don't like questions. I don't ask them.",
  ]),
  q("frankie", "The warehouse", "frankie_cabinets", "What's really in the radio cabinets?", [
    "Mister, don't. I've got a mother.",
    "All right. It's rye. Canadian. It comes up the river at night and goes out to the clubs in trucks marked furniture. It's paid for by checks from some advertising company. I write down the cases. That's all I do.",
  ], { requires: { hasEvidence: "E15" }, reveals: "Frankie says the 'radio cabinets' in bay 6 are Canadian rye, paid for by checks from 'some advertising company.'" }),
  q("frankie", "The warehouse", "frankie_sketch", "Can you show me how the warehouse is laid out?", [
    "If I do and anybody asks, I didn't. Give me that.",
    "There. The gate, the yard, twelve bays down to the river. The river doors are chained on the yard side at night; I've got the keys. Upstairs at the river end, the storeroom and my tally office. You can see my window from the Wells Street bridge. I eat my lunch there.",
  ], {
    requires: { any: [{ hasEvidence: "E15" }, { asked: "frankie_cabinets" }] },
    effects: [{ giveEvidence: "E25" }],
    reveals: "Frankie draws the warehouse: twelve bays, river doors chained from the yard at night, his tally office upstairs, visible from the Wells Street bridge.",
  }),
  q("frankie", "The warehouse", "frankie_harlan", "Does a man in a good overcoat ever come here?", [
    "Sometimes a big Packard comes late, with a driver. A man in a gray coat gets out and talks to Sal and goes upstairs to the book. He doesn't talk to me. I don't know his name. I don't want to.",
  ], { requires: { any: [{ hasEvidence: "E15" }, { hasEvidence: "E23" }] } }),
  q("frankie", "Monday night", "frankie_note", "Did you write a note asking me to meet you?", [
    "No! I didn't write nothing to nobody. I can't even spell shipment. Somebody used my initials. F.M. is on every tally sheet in the place.",
    "Mister, I'm sorry. I'm sorry they used my name to do that.",
  ], { requires: { any: [held, over] } }),
  q("frankie", "Monday night", "frankie_where", "Where are they keeping my partner?", [
    "Upstairs, if it's anywhere. There's a dozen rooms up there. I don't know which. I can't just go up; Sal's at the gate and Augie's walking the bays. If I knew which one, I've got the keys to the river doors.",
  ], { requires: { all: [held, rescue] } }),
  q("frankie", "Monday night", "frankie_door", "Unchain the river door at bay 6.", [
    "Bay 6. Six flashes, from my own window. All right. All right.",
    "Augie's walking the far end. Come on, quiet, along the water. I'll get the chain off. Don't you let anybody know it was me.",
  ], {
    requires: { all: [held, rescue, { flag: "signal_seen" }] },
    effects: [{ setFlag: "door_unchained" }],
    volunteer: { near: "bay six 6 door chain key open unlock river flashes light window signal" },
    reveals: "Frankie Moretti unchained the river door at bay 6.",
  }),
  q("frankie", "After", "frankie_after", "What will you do now?", [
    "Quit, is what. My uncle's got a bakery on Taylor Street. Officer Keene says if I tell a judge what I counted, he'll see nobody comes looking for me. I'm going to tell him. Every case.",
  ], { requires: over }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  r("louise", "E12", ["That's his hand. 'Where they can't cut me off.' Oh, Arthur."]),
  r("louise", "E06", ["That's him. That's how he sounded at dinner when he'd had one glass of wine. Please stop it."]),
  r("louise", "E13", ["Six ticks. He counted. Of course he counted."]),
  r("victor", "E05", ["My hand, yes. At Arthur's request. Finch should have logged it. Is that a crime?"]),
  r("victor", "E08", ["I signed for a disc. I sign for a great many things."]),
  r("victor", "E09", ["I've no idea how that machine works. Finch is the engineer. Ask Finch."]),
  r("victor", "E16", ["I meant to see him. I didn't. I crossed it out."]),
  r("victor", "E17", ["Clara is a nervous girl. I went to put out a lamp."]),
  r("victor", "E14", ["Clerical. Miss Whitcomb typed the wrong figure and I corrected it."]),
  r("victor", "E13", ["That's Arthur's pencil, not the bookkeeper's. Arthur never could leave other people's work alone."]),
  r("victor", "E18", ["A stand weight. We have dozens. Studio A? How very odd."]),
  r("victor", "E24", ["I have never seen that book in my life. I'd like to telephone my attorney."], { effects: [{ setFlag: "victor_lawyer" }] }),
  r("victor", "E27", ["I was in bed. I'd like to telephone my attorney."], { effects: [{ setFlag: "victor_lawyer" }] }),
  r("victor", "E28", ["Where did you get that? Speak to Mr. Pratt. I've nothing more to say."], { effects: [{ setFlag: "victor_lawyer" }] }),
  r("henry", "E10", ["Those are mine. 'I'll tell you why when I can.' He never could."]),
  r("henry", "E11", ["God bless that woman and her book."]),
  r("henry", "E22", ["'Not confirmed.' Nobody asked."]),
  r("henry", "E07", ["'Clear as a bell.' I told you. It was pouring."]),
  r("henry", "E12", ["He thought the station was washing money. Of course he did. That's why he wanted the four thousand. He was going to be out of a job."], { reveals: "Henry realizes Arthur wanted the $4,000 back because he expected to lose his job at WCRB." }),
  r("samuel", "E06", ["That's the rehearsal. A-114. I cut that at ten past seven. That's the stumble on 'bell.'"]),
  r("samuel", "E09", ["PHONO 2. Ten fifteen to ten twenty-seven. I... I forgot about the register, sir."], { reveals: "Shown the line register, Samuel admits PHONO 2 was keyed from 10:15 to 10:27." }),
  r("samuel", "E08", ["'A-114 out, V.H.' Mr. Harlan took it. It's his initials."]),
  r("samuel", "E18", ["'Studio A, 1.' That's the stand weight. In storage? Who put it in storage?"]),
  r("samuel", "E21", ["Raining. He changed it. And I played 'clear as a bell.' Oh, God."]),
  r("samuel", "E05", ["That's the card. I'm sorry. I'm so sorry."]),
  r("clara", "E16", ["'Nine fifty, A.V., Studio A.' He struck it out. He never strikes anything out."]),
  r("clara", "E14", ["My carbon. I'm glad I kept it."]),
  r("clara", "E13", ["Those pencil ticks are Mr. Vale's. He sat at my desk all Tuesday afternoon."]),
  r("clara", "E18", ["That was in storage? At two minutes past ten Mr. Harlan was wiping his hands."]),
  r("russo", "E13", ["Forty-six. Sounds like a lot of advertising."]),
  r("russo", "E15", ["Radio cabinets. Says so right there."]),
  r("russo", "E23", ["You read other people's mail. That's not polite."]),
  r("russo", "E24", ["That's my book. You took it out of there? Good for you. Don't bring it back."]),
  r("russo", "E28", ["Huh. 'Kept.' He kept a cut on my money and wrote it down. Some businessman."], { reveals: "Shown the reconciliation sheet, Russo learns Harlan kept a share of every month's money." }),
  r("rose", "E06", ["That's the afternoon version. 'Clear as a bell.' That's not what he read me."]),
  r("rose", "E07", ["My landlady heard that. 'Clear as a bell.' He crossed that out."]),
  r("keene", "E03", ["A crawlway. To storage. Well, I'll be damned. My boys looked at a barred door and stopped."]),
  r("keene", "E09", ["The machine writes it down by itself? Then nobody was live at ten fifteen."]),
  r("keene", "E17", ["Two minutes past ten, wiping his hands. That's a witness."]),
  r("keene", "E11", ["Mercer's alibi. My captain is going to hate you."]),
  r("keene", "E24", ["Harlan's name on every load. That gets me inside his office."]),
  r("keene", "E18", ["Round and heavy. Bring it in and I'll take it to the chemist."]),
  r("agnes", "E10", ["Poor man. Four thousand dollars. He's lucky he's got me."]),
  r("frankie", "E15", ["That's my tally. F.M. That's me. Please don't tell anybody I said that's me."]),
  r("frankie", "E26", ["Sal and Augie. That's them. I'm sorry, mister."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_OFFICE",
    characterId: "victor",
    title: "Victor Harlan: in his office",
    text: "Victor Harlan says he was in his office with the door shut from 9:30 to 10:10. His own appointment book reads '9:50 P.M. A.V., Studio A (tonight),' struck through.",
    when: { all: [{ asked: "victor_evening" }, { hasEvidence: "E16" }] },
  },
  {
    id: "X_STORAGE",
    characterId: "victor",
    title: "Victor Harlan: the storage room",
    text: "Victor Harlan says he was in his office until 10:10. Clara Whitcomb saw him leave the equipment storage room at about 10:02, wiping his hands.",
    when: { all: [{ asked: "victor_evening" }, { hasEvidence: "E17" }] },
  },
  {
    id: "X_LIVE",
    characterId: "victor",
    title: "Victor Harlan: 'live' at 10:15",
    text: "Victor Harlan says he heard Arthur Vale live at 10:15. The line register shows the transmitter fed by PHONO 2, a turntable, from 10:15 to 10:27, and Studio A not keyed to the air at all after 10:00.",
    when: { all: [{ asked: "victor_broadcast" }, { hasEvidence: "E09" }] },
  },
  {
    id: "X_SAMUEL",
    characterId: "samuel",
    title: "Samuel Finch: 'live' at 10:15",
    text: "Samuel Finch told the police Arthur Vale was live at 10:15. The control room's 10:15 card was rewritten: 'Opening and letters by transcription, disc A-114.'",
    when: { all: [{ any: [{ asked: "samuel_1015" }, { hasEvidence: "E22" }] }, { hasEvidence: "E05" }] },
  },
  {
    id: "X_HOME",
    characterId: "henry",
    title: "Henry Mercer: 'home'",
    text: "Henry Mercer told the police he went 'home' after 8:40. His apartment was padlocked. He was at Doyle's rooming house from 9:20 PM until after midnight.",
    when: { all: [{ hasEvidence: "E22" }, { hasEvidence: "E11" }] },
  },
  {
    id: "X_RUSSO",
    characterId: "russo",
    title: "Dominic Russo: Harlan",
    text: "Dominic Russo says he has never met Victor Harlan. His own note reads 'V.H. squares the books. V.H. pays Riverside.'",
    when: { all: [{ asked: "russo_victor" }, { hasEvidence: "E23" }] },
  },
  {
    id: "X_LAKESHORE",
    characterId: "victor",
    title: "Victor Harlan: Lakeshore Novelty",
    text: "Victor Harlan says he doesn't remember who owns Lakeshore Novelty. Its checks to Riverside Shipping are signed 'V. Harlan.'",
    when: { all: [{ asked: "victor_lakeshore" }, { hasEvidence: "E24" }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  louise_hire: "why did you hire us why come to us why a detective what do you want",
  louise_arthur: "tell me about your brother what was arthur like who was he",
  louise_announcement: "announcement what was he going to announce did your brother say he would announce something important on the air friday 10:35 jobs",
  louise_lastsaw: "when did you last see him last time sunday dinner",
  louise_henry: "henry mercer partner do you think henry did it what about henry",
  louise_victor: "victor harlan station manager what did arthur think of harlan the accountant",
  louise_rose: "rose marlowe singer girlfriend",
  louise_police: "police what did the police tell you keene captain",
  louise_letter: "the letter what does the letter say arthur's letter",
  louise_lakeshore: "lakeshore novelty company who is lakeshore",
  louise_warehouse: "warehouse monday night what happened to me are you all right",
  victor_evening: "where were you friday evening alibi where were you at ten what were you doing",
  victor_broadcast: "what did you hear at 10:15 did you hear him on the air the broadcast lobby loudspeaker hollister",
  victor_found: "how was he found the discovery forced the door 10:40",
  victor_curtain: "why was the curtain drawn the curtain",
  victor_arthur: "how did you get along with arthur your relationship with vale",
  victor_announcement: "what was the announcement special announcement 10:35 what was he going to say",
  victor_henry: "who would want to hurt him enemies who did it suspects henry mercer",
  victor_card: "program card you rewrote the card 9:05 transcription changed the schedule",
  victor_unannounced: "why wasn't the recording announced unannounced rules commission",
  victor_disc: "disc a-114 why did you sign out the disc workshop log 9:10",
  victor_diary: "appointment book diary 9:50 studio a struck out",
  victor_storage: "storage room equipment storage at ten clara saw you wiping your hands",
  victor_locksmith: "locksmith new lock why change the lock storage room key",
  victor_bluelantern: "blue lantern account supper club advertisements spots",
  victor_lakeshore: "lakeshore novelty who owns lakeshore production house",
  victor_russo: "dominic russo do you know russo",
  victor_warehouse: "monday night riverside shipping warehouse 11:40 packard kinzie street",
  henry_argument: "the argument what did you argue about arguing argued shouting in the lobby fight row you'll be sorry 8:15",
  henry_loan: "the loan the money four thousand dollars debt owe",
  henry_evening: "where did you go after you left alibi where were you friday night after 8:40",
  henry_police: "why did you lie to the police you said you went home",
  henry_apartment: "your apartment padlock landlord evicted dearborn szabo",
  henry_broadcast: "did you hear the program at 10:15 the radio did you listen clear as a bell",
  henry_transcript: "transcript record of the broadcast word for word stenographer agency crane and ward copy",
  henry_arthur: "what was arthur like to work with your partner",
  henry_victor: "victor harlan what do you think of harlan",
  henry_lantern: "blue lantern speakeasy how do I get in password supper club",
  henry_announcement: "did arthur tell you about the announcement",
  samuel_evening: "walk me through friday evening at the board what happened the schedule",
  samuel_1015: "was arthur live at 10:15 was he on the air live was it really him",
  samuel_rehearsal: "rehearsal did he rehearse did you record him 7:10 disc",
  samuel_curtain: "why was the curtain drawn",
  samuel_cue: "what happened at 10:35 cue light no answer",
  samuel_workshop: "where do you make recordings workshop recording equipment lathe",
  samuel_disc: "where is disc a-114 now the rehearsal disc",
  samuel_recorder: "pen recorder line register machine on the wall chart",
  samuel_rules: "is it allowed to play a recording without announcing it rules commission license",
  samuel_weight: "what's missing from studio a stand weight brass base weight",
  samuel_panel: "panel behind the rack crawlway cables storage turn buttons",
  samuel_victor: "where was harlan between 9:30 and 10:30 mr harlan whereabouts",
  clara_evening: "what did you do friday evening where were you",
  clara_argument: "did you hear the argument henry and arthur shouting lobby",
  clara_discovery: "what happened at 10:40 the door forced who called the police",
  clara_victor: "where was mr harlan at ten did you see harlan what did you see storage room",
  clara_books: "did arthur look at the books ledger tuesday program logs",
  clara_invoice: "blue lantern account invoice carbon retyped 46 spots",
  clara_lakeshore: "who is lakeshore novelty checks invoices post office box",
  clara_keys: "who has keys to the storage room key",
  clara_police: "why didn't you tell the police",
  clara_panel: "storage room lock locksmith panel oiled buttons",
  russo_who: "who are you what is this place what is the blue lantern",
  russo_friday: "where were you friday night alibi",
  russo_arthur: "did you know arthur vale the radio man",
  russo_spots: "why advertise on wcrb your advertisements spots radio",
  russo_lakeshore: "what is lakeshore novelty",
  russo_cabinets: "radio cabinets crates what's in the crates rye liquor whiskey",
  russo_victor: "do you know victor harlan harlan v.h.",
  russo_suspicion: "did harlan say anything about arthur have a word nosy announcer",
  russo_warehouse: "riverside shipping warehouse kinzie street sal augie monday night",
  rose_friday: "what did you do friday night your set studio b",
  rose_door: "talking to arthur at the studio door 9:35 last time you saw him",
  rose_raining: "what exactly did he read you the opening raining weather words",
  rose_bar: "did he always bar the door the bar",
  rose_arthur: "how well did you know arthur relationship",
  rose_victor: "victor harlan what do you think of harlan",
  rose_lantern: "can you get me into the blue lantern password how do I get in",
  rose_russo: "dominic russo what is russo like dom",
  rose_announcement: "do you know what he was going to announce",
  keene_case: "what do you make of the case your theory what do you think",
  keene_photos: "scene photographs pictures photos sketch",
  keene_coroner: "what did the coroner say coroner autopsy how did he die cause of death time of death medical examiner doctor ames",
  keene_statements: "what did everyone tell the police statements summary",
  keene_weapon: "was a weapon found murder weapon",
  keene_mercer: "why does the captain like mercer suspect henry",
  keene_send_weight: "test the weight send the brass weight to the chemist have it tested analyze examine marchetti",
  keene_lab: "what did the chemist find marchetti results of the test on the weight",
  keene_russo: "dominic russo blue lantern what do you know about russo",
  keene_victor: "victor harlan what do you think of harlan",
  keene_partner: "my partner is missing warehouse riverside shipping help raid",
  keene_after: "what happens now after the warehouse harlan safe",
  agnes_friday: "when did henry mercer come in friday register what time",
  agnes_door: "could anyone go out after ten front door chain back stairs",
  agnes_henry: "what's henry like as a lodger room 4",
  agnes_radio: "did you hear the program friday radio clear as a bell",
  agnes_police: "have the police spoken to you",
  frankie_job: "what do you do here your job",
  frankie_who: "who runs this place at night sal augie bay 6",
  frankie_cabinets: "what's in the radio cabinets really rye liquor",
  frankie_sketch: "show me the layout draw a map sketch where is everything",
  frankie_harlan: "man in a good overcoat packard who comes at night",
  frankie_note: "did you write the note the invitation f.m. meet",
  frankie_where: "where are they keeping my partner which room upstairs",
  frankie_door: "unchain the river door bay 6 open the door the chain key six flashes",
  frankie_after: "what will you do now",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
