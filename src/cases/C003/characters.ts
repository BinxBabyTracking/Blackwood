import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * C003 interviews, written against docs/C003-timeline.md.
 *
 * Rules for this file: nobody confesses; Bell, Shaw and Voss give their own
 * accounts, lies included; nobody states a forensic result that is not in a
 * report; every time agrees with the timeline. Nothing anyone says before the
 * Marshes are found mentions their deaths. Vivian and Graham can only be
 * interviewed before Vivian's call (MID1). Sophie is never a witness.
 */

const briefed: Condition = { flag: "casefile_read" };
const found: Condition = { flag: "marshes_found" };
const custody: Condition = { flag: "bell_custody" };
const searched: Condition = { flag: "search_done" };
const beforeCall: Condition = { not: { event: "MID1" } };
const never: Condition = { not: { always: true } };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The first victims: in the file and on the board, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "jenna",
    name: "Jenna Kowalski",
    role: "Killed on Alder Street, September 14",
    portrait: "char.jenna",
    bio: [
      { text: "Thirty-four. Veterinary technician at Northside Animal Clinic. Lived at 27 Linden Court with her daughter Sophie." },
      { text: "Shot while driving on Alder Street at about 10:06 PM on Friday, September 14, 2018." },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },
  {
    id: "ethan",
    name: "Ethan Cole",
    role: "Killed on Alder Street, September 14",
    portrait: "char.ethan",
    bio: [
      { text: "Thirty-eight. Commercial electrician with Kessel Electric. Jenna's former partner and Sophie's father." },
      { text: "Shot in the passenger seat on Alder Street. His gray messenger bag was the only thing taken." },
      { text: "Was wiring temporary power at the Riverside Commons site the week before he died.", requires: { hasEvidence: "E09" } },
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
    id: "rachel",
    name: "Rachel Kowalski",
    role: "Jenna's sister, your client",
    portrait: "char.rachel",
    bio: [
      { text: "Thirty-seven. Librarian at the Bellwether public library. Jenna's older sister." },
      { text: "Now living in Jenna's house at 27 Linden Court, raising her five-year-old niece, Sophie." },
    ],
    available: { always: true },
    locationId: "kowalski_house",
    phone: { talkedTo: "rachel" },
    contact: "Your client. 27 Linden Court.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that means. You're the one who'd know.",
    idleLine: "I'm sorry. I can't today. Call me when there's news.",
    noAnswer: ["I don't know.", "Ethan never told me that.", "I wish I knew."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman in her late thirties, a librarian, quiet and precise, grieving but holding it together. Western Pennsylvania American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "grieving", label: "Grieving", requires: { always: true } },
      { id: "determined", label: "Determined", requires: { any: [{ hasEvidence: "E09" }, { deduction: "D03" }] }, cue: "Rachel sits forward. She has something to hold on to now: a reason." },
      { id: "shaken", label: "Shaken", requires: found, cue: "Rachel hasn't slept. The news is on in the next room with the sound off." },
    ],
  },
  {
    id: "vivian",
    name: "Vivian Marsh",
    role: "Neighbor, 409 Alder Street",
    portrait: "char.vivian",
    bio: [
      { text: "Forty-six. Assistant principal at Bellwether Area High School. Has lived across from the crash site for nineteen years." },
      { text: "Came onto her porch after the shots on September 14 and saw a vehicle leaving." },
      { text: "Found dead with her husband on the riverside access road on Tuesday, October 30.", requires: found },
    ],
    available: beforeCall,
    deceased: found,
    locationId: "marsh_house",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what that is.",
    idleLine: "I think I've said everything I can. I'm sorry.",
    noAnswer: ["I'm sorry, I don't know.", "I really couldn't say.", "I'd hate to guess and be wrong."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman in her mid forties, a school administrator, polite and careful, a little anxious. Western Pennsylvania American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "polite", label: "Polite", requires: { always: true } },
      { id: "uneasy", label: "Uneasy", requires: { any: [{ deduction: "D02" }, { asked: "vivian_light" }] }, cue: "Vivian keeps glancing at the window, toward the oak across the street." },
      { id: "frightened", label: "Frightened", requires: { any: [{ asked: "vivian_bell" }, { deduction: "D08" }] }, cue: "Vivian has her arms folded tight. She looks like someone who has made up her mind about something and doesn't like it." },
    ],
  },
  {
    id: "graham",
    name: "Graham Marsh",
    role: "Vivian's husband, 409 Alder Street",
    portrait: "char.graham",
    bio: [
      { text: "Fifty-one. Retired land surveyor. Fishes." },
      { text: "Found dead with his wife on the riverside access road on Tuesday, October 30.", requires: found },
    ],
    available: beforeCall,
    deceased: found,
    known: { visited: "marsh_house" },
    locationId: "marsh_house",
    onBoard: true,
    defaultEvidenceReply: "Not my department. Vivian's the one who saw things.",
    idleLine: "That's it. Good night.",
    noAnswer: ["No idea.", "You'd have to ask Vivian.", "Couldn't tell you."],
    voice: {
      voiceId: "JBFqnCBsd6RMkjVDRZzb",
      direction: "Man in his early fifties, retired surveyor, dry, friendly, practical, protective. Western Pennsylvania American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "friendly", label: "Friendly", requires: { always: true } },
      { id: "protective", label: "Protective", requires: { asked: "graham_vivian" }, cue: "Graham moves a little closer to his wife's chair." },
    ],
  },
  {
    id: "lena",
    name: "Lena Ortiz",
    role: "Manager, Hart's Quick Stop",
    portrait: "char.lena",
    bio: [
      { text: "Forty-two. Manages Hart's Quick Stop, store 2, on Furnace Street. Sold the family gas and coffee at 9:42 PM on September 14." },
    ],
    available: { always: true },
    locationId: "harts",
    onBoard: true,
    defaultEvidenceReply: "I don't know nothing about that, hon.",
    idleLine: "I gotta work. You know where I am.",
    noAnswer: ["I didn't see that.", "No idea, hon.", "I was on the register."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman in her early forties, store manager, direct and warm, a strong Pittsburgh accent.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25 },
    },
    demeanor: [
      { id: "busy", label: "Busy", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: { callAnswered: "call_lena" }, cue: "Lena leaves the register to the other clerk and gives you her full attention." },
    ],
  },
  {
    id: "cross",
    name: "Det. Helen Cross",
    role: "Bellwether Police, lead investigator",
    portrait: "char.cross",
    bio: [
      { text: "Forty-eight. Bellwether PD detective, lead on case 18-09-1147." },
      { text: "Gave Rachel Kowalski a copy of her file. Reachable at the station or by phone." },
      { text: "Leads the investigation into the deaths of Vivian and Graham Marsh.", requires: found },
    ],
    available: briefed,
    locationId: "police",
    phone: briefed,
    contact: "Bellwether Police. Lead detective on Alder Street.",
    onBoard: false,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's all I've got right now. Call me if something breaks.",
    noAnswer: ["That's not in my file.", "I don't know. I'd like to.", "I can't speculate on that."],
    voice: {
      voiceId: "Xb7hH8MSUJpSbSDYk0k2",
      direction: "Woman in her late forties, small-city police detective, professional, tired, honest, firm. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [{ deduction: "D03" }, { deduction: "D08" }] }, cue: "Cross pulls a fresh legal pad toward her. She's taking notes now, not just answering." },
      { id: "driven", label: "Driven", requires: found, cue: "Cross looks like she hasn't been home. Her voice is very even." },
    ],
  },
  {
    id: "reed",
    name: "Dr. Samuel Reed",
    role: "Calder County forensic scientist",
    portrait: "char.reed",
    bio: [
      { text: "Forty-four. Runs trace, DNA and digital evidence at the Calder County Forensic Laboratory." },
      { text: "Runs lab tests on request. Reachable at the lab or by phone." },
    ],
    available: briefed,
    locationId: "lab",
    phone: briefed,
    contact: "Calder County Forensic Laboratory. Lab tests by request.",
    onBoard: false,
    defaultEvidenceReply: "Interesting. If you want it tested, tell me what you want it compared with.",
    idleLine: "Back to the bench. Requests still go through me.",
    noAnswer: ["That's not something a lab can tell you.", "I'd need something to test.", "I won't guess. Give me a sample."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man in his mid forties, forensic scientist, precise, patient, dry humor. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [{ id: "precise", label: "Precise", requires: { always: true } }],
  },
  {
    id: "voss",
    name: "Caleb Voss",
    role: "Owner, Bellwether Redevelopment Group",
    portrait: "char.voss",
    bio: [
      { text: "Thirty-nine. Developer of Riverside Commons, 212 homes on the old Keystone Plating site." },
      { text: "Bell Security patrols his site.", requires: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }] } },
    ],
    available: { always: true },
    known: { any: [{ hasEvidence: "E09" }, { hasEvidence: "E11" }] },
    locationId: "voss_office",
    onBoard: true,
    defaultEvidenceReply: "I don't see what that has to do with me.",
    idleLine: "We're done. Next time, call my lawyer.",
    noAnswer: ["I wouldn't know.", "That's not something I deal with.", "You'd have to ask my project manager."],
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Man in his late thirties, real estate developer, polished, confident, smooth, slightly condescending. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "dismissive", label: "Dismissive", requires: { any: [{ asked: "voss_clearance" }, { hasEvidence: "E14" }] }, cue: "Voss checks his watch without hiding it." },
      { id: "defensive", label: "Defensive", requires: { any: [{ deduction: "D04" }, { deduction: "D11" }, found] }, cue: "Voss's smile has gone. He has started choosing his words." },
      { id: "refusing", label: "Declining to answer", requires: { flag: "voss_lawyered" }, refuses: "Talk to my attorney. I'm finished here.", cue: "Voss has his phone out. He is calling his lawyer." },
    ],
  },
  {
    id: "bell",
    name: "Marcus Bell",
    role: "Owner, Bell Security Services",
    portrait: "char.bell",
    bio: [
      { text: "Thirty-three. Runs Bell Security Services out of a garage on Mill Road. Army military police, honorably discharged." },
      { text: "In custody at the Bellwether police station.", requires: custody },
    ],
    available: { always: true },
    known: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }] },
    locationId: "bell_garage",
    moves: [{ when: custody, locationId: "police" }],
    onBoard: true,
    defaultEvidenceReply: "Okay.",
    idleLine: "We're done.",
    noAnswer: ["No.", "Don't know.", "Not my business."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "Man in his early thirties, ex-military, controlled, low, flat, few words, quietly intimidating. American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "controlled", label: "Controlled", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { any: [{ hasEvidence: "E26" }, { deduction: "D08" }] }, cue: "Bell has stopped wiping his hands on the rag. He's watching you." },
      { id: "cornered", label: "Cornered", requires: found, cue: "Bell's answers have gotten shorter, and very exact." },
      { id: "refusing", label: "Declining to answer", requires: { flag: "bell_lawyered" }, refuses: "Lawyer.", cue: "Bell folds his arms and looks at the wall." },
    ],
  },
  {
    id: "shaw",
    name: "Trevor Shaw",
    role: "Owner-operator, Shaw Towing and Recovery",
    portrait: "char.shaw",
    bio: [
      { text: "Twenty-nine. Runs Shaw Towing and Recovery on Route 51 with one truck. On the police tow rotation." },
      { text: "Towed the wrecked CR-V from Alder Street early on September 15." },
    ],
    available: { always: true },
    known: { any: [{ hasEvidence: "E08" }, { inspected: "bg_magnet" }] },
    locationId: "shaw_yard",
    onBoard: true,
    defaultEvidenceReply: "I don't know what you want me to say about that.",
    idleLine: "I'm out. I'm not doing this anymore.",
    noAnswer: ["I don't know, man.", "No idea.", "How would I know that?"],
    voice: {
      voiceId: "IKne3meq5aSn9XLyUdCD",
      direction: "Man in his late twenties, tow truck driver, nervous, talks fast, says too much. Western Pennsylvania American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 },
    },
    demeanor: [
      { id: "chatty", label: "Chatty", requires: { always: true } },
      { id: "evasive", label: "Evasive", requires: { hasEvidence: "E28" }, cue: "Shaw is suddenly very interested in his phone." },
      { id: "rattled", label: "Rattled", requires: { any: [{ deduction: "D09" }, { hasEvidence: "E29" }] }, cue: "Shaw's knee is bouncing. He keeps looking toward the road." },
      { id: "scared", label: "Scared", requires: found, cue: "Shaw looks like he hasn't slept. He flinches when a truck goes by." },
    ],
  },
  {
    id: "owen",
    name: "Owen Price",
    role: "Former records clerk, municipal annex",
    portrait: "char.owen",
    bio: [
      { text: "Fifty-six. Twenty-two years a records clerk at the annex. Retired early on September 7. Volunteers in the basement archive." },
    ],
    available: { always: true },
    known: { visited: "annex" },
    locationId: "annex",
    onBoard: true,
    defaultEvidenceReply: "I'd rather not comment on that.",
    idleLine: "That's everything I know. Please leave me out of it.",
    noAnswer: ["I wouldn't know.", "That's above my pay grade. Was.", "I'd rather not guess."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man in his mid fifties, retired city clerk, careful, anxious, soft-spoken, decent. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "reluctant", label: "Reluctant", requires: { always: true } },
      { id: "candid", label: "Candid", requires: { asked: "owen_replaced" }, cue: "Owen takes off his glasses and cleans them. He seems to have decided something." },
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
    available: briefed,
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
  {
    id: "caller",
    name: "Blocked number",
    role: "An anonymous caller",
    portrait: "char.caller",
    bio: [{ text: "A disguised voice from a blocked number." }],
    available: never,
    known: never,
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
    voice: {
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      direction: "Male voice run through a cheap electronic voice changer: flat, slightly robotic, low. Unrecognizable.",
      settings: { stability: 0.8, similarity_boost: 0.5, style: 0 },
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
  // Rachel Kowalski: the client
  // =====================================================================
  q("rachel", "Hiring us", "rachel_hire", "Why did you come to Blackwood?", [
    "Because six weeks went by and the only word anyone used was 'robbery'. Robbers take wallets. They took Ethan's bag and nothing else.",
    "I don't want revenge. I want Sophie to grow up knowing somebody looked.",
  ]),
  q("rachel", "Jenna", "rachel_jenna", "Tell me about Jenna.", [
    "She was a vet tech. She'd come home with dog hair on everything and a story about some terrible cat she loved anyway.",
    "She was a good mom. She was better at being divorced than most people are at being married.",
  ]),
  q("rachel", "Ethan", "rachel_ethan", "Tell me about Ethan.", [
    "Ethan was an electrician. Steady. Not much of a talker. He and Jenna split up two years ago, but he was at every one of Sophie's things.",
    "He was the kind of guy who'd read a whole contract before he signed it. Jenna used to tease him about it.",
  ]),
  q("rachel", "Sophie", "rachel_sophie", "How is Sophie?", [
    "She's five. Some days she's fine and some days she asks when her mom's coming to get her.",
    "She's seeing someone who helps kids after things like this. I don't want anyone asking her about that night. Please.",
  ], { reveals: "Rachel asks that nobody question Sophie about that night." }),
  q("rachel", "Ethan", "rachel_worried", "Was Ethan worried about anything before he died?", [
    "That week, yes. He was jumpy. He said he'd seen something at work that wasn't right and he was going to the state about it.",
    "I asked what. He said, 'Better you don't know yet.' I thought he was being dramatic.",
  ], { reveals: "Ethan told Rachel he had seen something wrong at work that week and was going to report it to the state." }),
  q("rachel", "Ethan", "rachel_bag", "What was in Ethan's bag?", [
    "A gray canvas messenger bag with a flap. He carried it everywhere that week, even to the carnival. Jenna made fun of him.",
    "I don't know what was in it. Papers. He kept touching it like he was checking it was still there.",
  ], { reveals: "Ethan carried a gray canvas messenger bag everywhere the week he died, even to the carnival." }),
  q("rachel", "That night", "rachel_night", "What were they doing that night?", [
    "The Bellwether fall carnival. Sophie wanted to see the horses. They went together, the three of them, like they always did for her things.",
    "Jenna was driving Ethan home to his apartment on Alder afterward. She called me at nine thirty to say Sophie had fallen asleep with cotton candy in her hair.",
  ], { effects: [tl("9:30 PM (Fri 9/14)", "Jenna calls Rachel from the carnival; Sophie is asleep.", "Rachel Kowalski")] }),
  q("rachel", "The police", "rachel_police", "What have the police told you?", [
    "Detective Cross says robbery, but she doesn't sound like she believes it. She gave me a copy of her file. I don't think she was supposed to.",
  ]),
  q("rachel", "Ethan", "rachel_riverside", "Did Ethan ever mention Riverside Commons?", [
    "The old plating works on River Road? He was wiring there in September. Temporary power, he said. Boring work.",
    "He said once that he wouldn't let his dog dig in that dirt. I thought it was a joke.",
  ], { requiresEvidence: ["E09"] }),
  q("rachel", "Ethan", "rachel_envelope", "Tell me about the envelope Ethan left with you.", [
    "Thursday night, the night before. He came by late, after Sophie was asleep. He gave it to me and said, 'Just hold onto this.' He didn't stay.",
    "I put it in the hall desk. And then Friday happened and I forgot it existed. I'm so sorry.",
  ], { requires: { event: "RE02" }, reveals: "Ethan gave Rachel a sealed envelope late on Thursday, September 13, and told her to hold onto it." }),
  q("rachel", "The neighbors", "rachel_vivian", "Do you know Vivian Marsh?", [
    "She's the woman across the street from the tree. She came to the funeral. She hugged me and said she was sorry she couldn't help more.",
    "She looked like she wanted to say something else and didn't.",
  ]),
  q("rachel", "The Marshes", "rachel_marshes", "You heard about the Marshes.", [
    "I saw it on the news. That woman tried to help us. Was it because of us? Tell me the truth.",
    "No. Don't answer that. Just find who did it.",
  ], { requires: found }),

  // =====================================================================
  // Vivian Marsh: the witness (before her call only)
  // =====================================================================
  q("vivian", "About her", "vivian_job", "What do you do?", [
    "I'm the assistant principal at the high school. Discipline, schedules, and the football games, heaven help me.",
    "We've lived here nineteen years.",
  ]),
  q("vivian", "September 14", "vivian_night", "What happened that night?", [
    "I was reading. I heard pops, four or five, then more, then a crash. By the time I got to the porch it was over. The car was against the oak across the street.",
    "I called out to Graham to call 911, but Dick Kaminski at 415 already had.",
  ], { reveals: "Vivian heard shots, then a crash, and reached her porch after it was over.", effects: [tl("10:09 PM (Fri 9/14)", "Vivian Marsh comes onto her porch at 409 Alder Street after the shots.", "Vivian Marsh")] }),
  q("vivian", "September 14", "vivian_car", "Did you see another vehicle?", [
    "Something was turning onto Furnace. Dark. Fast. Bigger than a car, I think.",
    "I told the officer I couldn't describe it. I don't want to say something and be wrong.",
  ], { reveals: "Vivian saw a dark vehicle, bigger than a car, turning onto Furnace Street." }),
  q("vivian", "September 14", "vivian_shooting", "Did you see the shooting?", [
    "No. You can't see past the Hallorans' hedge from my porch. It all happened around the bend.",
    "I saw the crash. And whatever was leaving.",
  ]),
  q("vivian", "September 14", "vivian_light", "Was there anything you noticed about the vehicle that you didn't tell the police?", [
    "There was a light. A little amber light on the dashboard, on the driver's side. Not a headlight. Inside.",
    "I didn't tell the officer. I wasn't sure. I'm still not.",
  ], { requiresDeductions: ["D02"], reveals: "Vivian remembers a small amber light on the left side of the vehicle's dashboard. She never told the police." }),
  q("vivian", "September 14", "vivian_police", "Did the police talk to you?", [
    "Detective Cross, the next morning. She was kind. I wasn't much help.",
  ]),
  q("vivian", "Lately", "vivian_bell", "Does Bell Security mean anything to you?", [
    "They do the parking at our football games. They have vehicles at the gate.",
    "Why do you ask? No. Don't tell me. I'd rather think about it before I say anything. I need to be sure.",
  ], { requires: { any: [{ hasEvidence: "E25" }, { hasEvidence: "E26" }, { talkedTo: "bell" }] }, reveals: "Vivian knows Bell Security does parking at the high school football games. She would not say more until she was sure." }),
  q("vivian", "Lately", "vivian_scared", "Are you all right?", [
    "I've started checking the locks twice at night. Graham thinks I'm being silly.",
    "Maybe I am.",
  ]),
  q("vivian", "Lately", "vivian_graham", "What does Graham think?", [
    "Graham thinks I should leave it to the police. He's probably right. He usually is, which is annoying.",
  ]),
  q("vivian", "Lately", "vivian_sophie", "Did you see the little girl?", [
    "The paramedics carried her out of the back seat wrapped in a blanket. She wasn't crying. That was the worst part.",
    "I think about her every day.",
  ]),

  // =====================================================================
  // Graham Marsh
  // =====================================================================
  q("graham", "About him", "graham_who", "What do you do, Mr. Marsh?", [
    "Retired. Thirty years surveying for the county, then on my own. Now I fish, badly.",
  ]),
  q("graham", "September 14", "graham_night", "Where were you that night?", [
    "Asleep in front of the Pirates game, if you want the truth. Vivian woke me. By then the sirens were coming.",
  ]),
  q("graham", "Vivian", "graham_vivian", "Is Vivian all right?", [
    "She's not sleeping. She checks the locks twice. Sits by that window.",
    "I tell her the police have it. You're not going to make it worse, are you?",
  ]),
  q("graham", "The street", "graham_car", "Have you noticed anything unusual on the street?", [
    "The Sunday after the shooting a dark SUV went by slow, twice, down by the tree. I figured rubberneckers. People came to look all week.",
  ], { reveals: "On the Sunday after the shooting, Graham saw a dark SUV drive slowly past the tree twice." }),
  q("graham", "Surveying", "graham_survey", "Can you read these survey coordinates?", [
    "Let me see. Kerr and Lusk, good outfit. B-3 at those numbers is up in the northeast corner. If that's the old plating building, B-3 is inside the slab, not out in the yard.",
    "Why would anybody say it was somewhere else?",
  ], { requiresEvidence: ["E12"], reveals: "Graham reads the survey: boring B-3 was drilled inside the plating building's slab." }),
  q("graham", "Vivian", "graham_advice", "What would you do in my place?", [
    "Give what you've got to the police and let them carry it. That's what they're for.",
  ]),

  // =====================================================================
  // Lena Ortiz
  // =====================================================================
  q("lena", "That night", "lena_family", "Do you remember the family who stopped here on September 14?", [
    "The little girl with the apple juice. Yeah. I was on the register. Her dad brought her in while her mom pumped gas.",
  ]),
  q("lena", "That night", "lena_receipt", "Do you still have their receipt?", [
    "I printed the store copy for the cops and I kept one. I don't know why. Here.",
    "Nine forty-two. Pump three. Two coffees and an apple juice.",
  ], { reveals: "Lena hands over the store copy of the family's receipt: 9:42 PM.", effects: [{ giveEvidence: "E03" }, tl("9:42 PM (Fri 9/14)", "Jenna, Ethan and Sophie stop at Hart's Quick Stop for gas and coffee.", "Hart's receipt")] }),
  q("lena", "That night", "lena_suv", "Was there anyone else in the lot?", [
    "There was a big dark SUV out past the pumps, by the dumpster, with its lights off. I didn't think nothing of it. People sit out there and eat.",
  ], { reveals: "A big dark SUV was parked past the pumps with its lights off." }),
  q("lena", "That night", "lena_man", "Did anyone else come in?", [
    "A guy right before them. Hood up, cigarettes, paid cash, didn't look at me. I remember because he didn't say a word.",
  ]),
  q("lena", "The video", "lena_camera", "Do you have video from that night?", [
    "The outside camera keeps thirty days. The owner pulled it for the cops and I saved a copy on the computer in back. Go ahead, it's up on the monitor.",
  ]),
  q("lena", "That night", "lena_police", "What did you tell the police?", [
    "Same as you. The detective came Sunday. She recorded it on her phone.",
  ]),
  q("lena", "That night", "lena_after", "What happened after they left?", [
    "Ten minutes, maybe, and I heard sirens going down toward Alder. A lot of them.",
  ]),
  q("lena", "That night", "lena_ethan", "What do you remember about the father?", [
    "Nice guy. Tired. He had a gray bag over his shoulder, the kind with a flap, and he didn't put it down even to carry the kid.",
  ]),
  q("lena", "That night", "lena_patch", "Tell me more about the man with the patch on his jacket.", [
    "Dark work jacket, like a uniform. The patch was on the left shoulder. Round, I think, with writing. I couldn't read it.",
    "He stood like a cop. You know? Straight.",
  ], { requires: { callAnswered: "call_lena" }, reveals: "The man who bought cigarettes wore a dark uniform-style jacket with a round patch on the left shoulder and stood like a police officer." }),

  // =====================================================================
  // Det. Helen Cross: the police; no limit
  // =====================================================================
  q("cross", "The case", "cross_case", "Where does the investigation stand?", [
    "Two victims, two guns, no suspects, six weeks. My lieutenant wants it in the inactive drawer.",
    "I gave Rachel my file because I'd rather be embarrassed than wrong.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D08" }, reply: ["A security company's SUV, repaired three days after. I should have pulled body shop records in week one. I'm pulling them now."] },
      { requires: found, reply: ["I have four victims, and I think one man in the middle of all of it. Help me prove it."] },
    ],
  }),
  q("cross", "The case", "cross_robbery", "Do you really think it was a robbery?", [
    "On paper. Nothing else fit on paper.",
    "But they left the wallets, the cash and both phones. The only thing missing is his bag. I don't like it either.",
  ]),
  q("cross", "Reports", "cross_autopsy", "Can I see the autopsy report?", [
    "Preliminary. The ME is clear: the gunfire killed them, not the crash. The crash came after.",
    "Here's a copy.",
  ], { reveals: "The medical examiner found that the gunfire, not the crash, killed Jenna and Ethan.", effects: [{ giveEvidence: "E02" }] }),
  q("cross", "Reports", "cross_casings", "What about the guns?", [
    "Twelve casings on the road, two groups. Seven nine millimeter, five forty caliber. Two guns. State police have no match on file.",
    "Take the report.",
  ], { reveals: "Two different guns were fired on Alder Street, a 9mm and a .40.", effects: [{ giveEvidence: "E06" }] }),
  q("cross", "Reports", "cross_inventory", "What was taken from the car?", [
    "That's my problem with robbery. Here's the inventory. Wallets, cash, phones, all there.",
    "His bag is the only thing gone. A gray canvas messenger bag.",
  ], { reveals: "Nothing was taken from the victims except Ethan's gray messenger bag.", effects: [{ giveEvidence: "E08" }] }),
  q("cross", "Witnesses", "cross_vivian", "What did Vivian Marsh tell you?", [
    "That she heard the shots and saw something dark turning onto Furnace. She wouldn't guess at more. She was scared of being wrong.",
    "There's a recording of it on your laptop, in the file.",
  ]),
  q("cross", "The scene", "cross_tow", "Who towed the car?", [
    "Rotation tow that night was Shaw Towing. Trevor Shaw. Got there about two twenty, had it at impound by ten to three.",
  ]),
  q("cross", "Reports", "cross_shaw_records", "Can you get Trevor Shaw's phone records?", [
    "With his own dispatch log putting his truck on Mill Road and his story putting him on Route 51, a judge signed this morning.",
    "Here. Look at ten oh five.",
  ], { requiresDeductions: ["D09"], reveals: "Cross obtained Trevor Shaw's phone records by court order.", effects: [{ giveEvidence: "E29" }] }),
  q("cross", "Bell Security", "cross_bell", "Bell Security's SUV was repaired three days after the shooting.", [
    "I read the invoice. Deer strike, Route 88. Paid cash.",
    "I'll want that fragment you found at our lab. Talk to Reed.",
  ], { requiresDeductions: ["D08"] }),
  q("cross", "Riverside Commons", "cross_voss", "The Riverside Commons clearance was altered, and Voss paid Bell.", [
    "If a developer altered a state clearance, that's for the DA and the DEP, and I'll make the calls.",
    "If he paid people to get Ethan Cole's bag, that's mine.",
  ], { requires: { any: [{ deduction: "D04" }, { deduction: "D11" }] } }),
  q("cross", "409 Alder Street", "cross_marsh", "The Marshes' door is open and they're gone. There's blood on the frame.", [
    "Don't touch anything else. Stay outside. I'm sending two cars and I'm on my way.",
    "Did you see anyone? Any vehicle? Okay. Stay on the porch where the neighbors can see you.",
  ], { requires: { flag: "marsh_empty" }, reveals: "You reported the open door and the blood at 409 Alder Street to Det. Cross.", effects: [{ setFlag: "cross_notified" }, tl("8:25 PM (Mon 10/29)", "You call Det. Cross from 409 Alder Street.", "You")] }),
  q("cross", "The Marshes", "cross_bodies", "What happened to the Marshes?", [
    "They were found at the end of the riverside access road at a quarter after seven this morning, in Bell Security's Unit 4. The back seat was set on fire. The rain put it out.",
    "Bell reported it stolen at six forty. And I'll say it again: this happened before you ever got to that door.",
  ], { requires: found, reveals: "The Marshes were found in Bell Security's Unit 4, partly burned, on the riverside access road. Bell reported it stolen at 6:40 AM." }),
  q("cross", "The Marshes", "cross_bank", "Was anything taken from the Marsh house?", [
    "Graham took twenty-five hundred in cash out of the bank that morning. That looked bad for about an hour.",
    "We found every dollar in the kitchen drawer. He was buying a boat motor. Here's the record.",
  ], { requires: found, reveals: "Graham Marsh withdrew $2,500 that morning to buy a boat motor; the cash was found in the kitchen.", effects: [{ giveEvidence: "E23" }] }),
  q("cross", "The Marshes", "cross_stolen", "Bell says Unit 4 was stolen.", [
    "From his own garage, overnight, he says. And it turns up next to his own site trailer.",
    "Find me where that SUV went. Reed can pull its tracker.",
  ], { requires: found }),
  q("cross", "The Marshes", "cross_facilities", "How could anyone have known Vivian was going to talk?", [
    "She told them. Not on purpose. At nine twenty that morning she emailed the school district asking for the security contractor's vehicle list. 'For an incident report.'",
    "At two fourteen the district forwarded her request to Bell Security.",
  ], { requires: found, reveals: "Vivian asked the school district for the security contractor's vehicle list on October 29. The district forwarded her request to Bell Security at 2:14 PM.", effects: [tl("2:14 PM (Mon 10/29)", "The school district forwards Vivian Marsh's request for the security contractor's vehicle list to Bell Security.", "Det. Cross")] }),
  q("cross", "The Marshes", "cross_voss_text", "Did Voss order what happened to the Marshes?", [
    "I can't prove a negative. What I can tell you: Bell's phone made no calls to Voss that day. And at five past nine the next morning, Voss texted Bell: 'What the hell happened last night?'",
    "That's not a man who gave an order. That's a man who found out from the news.",
  ], { requires: searched, reveals: "Bell's phone made no calls to Voss on October 29. The next morning Voss texted Bell, 'What the hell happened last night?'" }),
  q("cross", "The case", "cross_again", "Anything new?", ["Nothing yet. I'm working on it."], {
    repeatable: true,
    variants: [
      { requires: { flag: "cross_notified" }, reply: ["We're working the Marsh house. Reed will test that smear if you ask him."] },
      { requires: found, reply: ["Unit 4 is at the county garage. Reed can pull the tracker and compare the paint."] },
      { requires: searched, reply: ["Bell's in an interview room with a lawyer. Reed has the gloves. Ask him."] },
    ],
  }),

  // =====================================================================
  // Dr. Samuel Reed: the lab; no limit
  // =====================================================================
  q("reed", "About the lab", "reed_who", "What do you do here?", [
    "Trace, DNA and digital for Calder County. Paint, fibers, blood, phones, anything with a chip in it.",
    "If you want something tested, ask me. Results come to your phone and your desk.",
  ]),
  q("reed", "About the lab", "reed_limits", "What can a lab tell me, and what can't it?", [
    "Paint gives you a color, a maker, a layer sequence. It can't pick one car out of every car painted that color. Blood type narrows. DNA can identify.",
    "I'll always tell you which kind of answer you're getting. 'Consistent with' is not 'matches'.",
  ]),
  q("reed", "Evidence", "reed_trim", "What can you tell me about this trim fragment?", [
    "FL3B is a Ford Explorer part number, 2016 to 2018. Right front wheel arch, by the shape. Gray paint on one edge, silver on the other.",
    "Find me the vehicle and I'll compare them.",
  ], { requiresEvidence: ["E05"] }),
  q("reed", "Evidence", "reed_casings", "What do the casings tell you?", [
    "Two calibers, two guns. Without the guns, that's as far as casings go.",
  ], { requiresEvidence: ["E06"] }),
  q("reed", "Lab requests", "reed_blood", "Can you test the blood on the Marshes' door frame?", [
    "I'll send a tech with Cross's people now. I'll swab the frame and screen the hall. If I get a profile I'll compare it with the household.",
    "Three hours of work, I'll have it to you as fast as I can.",
  ], { requires: { flag: "cross_notified" }, reveals: "Dr. Reed is testing the blood at the Marsh house.", effects: [{ startLab: "blood" }] }),
  q("reed", "Lab requests", "reed_gps", "Can you pull the tracker from Unit 4?", [
    "Fleet SUVs usually have an insurer's box under the dash. If it's there, I'll pull its history.",
    "It'll tell us where. It won't tell us who.",
  ], { requiresEvidence: ["E21"], reveals: "Dr. Reed is downloading Unit 4's tracker.", effects: [{ startLab: "gps" }] }),
  q("reed", "Lab requests", "reed_paint", "Can you compare the trim fragment and the CR-V's paint with Unit 4?", [
    "With the SUV in our garage, yes. Paint layers, and whether your fragment fits the clips on its arch.",
    "Remember what I said about paint.",
  ], { requiresEvidence: ["E05", "E21"], reveals: "Dr. Reed is comparing the trim fragment and the CR-V's paint with Unit 4.", effects: [{ startLab: "paint" }] }),
  q("reed", "Lab requests", "reed_gloves", "Can you test what Cross's search found?", [
    "Gloves and a phone. Blood on the outside of the gloves, and whoever wore them on the inside. I'll get the phone's carrier records too.",
    "I'll call you.",
  ], { requires: searched, reveals: "Dr. Reed is testing the gloves and the phone from the search.", effects: [{ startLab: "gloves" }] }),
  q("reed", "About the lab", "reed_again", "Anything back yet?", ["Nothing pending. Send me something."], {
    repeatable: true,
    variants: [
      { requires: { any: [{ labStarted: "blood" }, { labStarted: "gps" }, { labStarted: "paint" }, { labStarted: "gloves" }] }, reply: ["It's running. You'll get it on your phone the minute it's done."] },
    ],
  }),

  // =====================================================================
  // Caleb Voss: the developer; organizer of the first attack
  // =====================================================================
  q("voss", "Introductions", "voss_who", "Who are you, Mr. Voss?", [
    "Caleb Voss. Bellwether Redevelopment Group. We take land this town gave up on and put families on it.",
  ]),
  q("voss", "Riverside Commons", "voss_project", "Tell me about Riverside Commons.", [
    "Two hundred and twelve homes on the old Keystone Plating site. A park, a playground. Phase one breaks ground in the spring.",
    "It's the best thing to happen to this riverfront in forty years.",
  ]),
  q("voss", "Ethan Cole", "voss_ethan", "Did you know Ethan Cole?", [
    "He worked for Kessel, one of our electrical subs. I might have nodded to him on the site. I barely knew him.",
    "A terrible thing. Terrible.",
  ], { reveals: "Voss says he barely knew Ethan Cole." }),
  q("voss", "Riverside Commons", "voss_clearance", "Tell me about the environmental clearance.", [
    "Hollis Environmental did a full Phase Two. No restrictions. It's on file with the city. Every permit we have is in order.",
  ], { requires: { any: [{ hasEvidence: "E10" }, { hasEvidence: "E11" }, { deduction: "D04" }] } }),
  q("voss", "Riverside Commons", "voss_b3", "Why does the paper original say B-3 needs remediation?", [
    "Boring locations get adjusted in the field all the time. Ask the consultant. I'm a developer, not a geologist.",
  ], { requires: { any: [{ hasEvidence: "E12" }, { deduction: "D04" }] }, reveals: "Voss says boring locations 'get adjusted in the field'." }),
  q("voss", "Riverside Commons", "voss_annex", "You were at the annex when the file was replaced.", [
    "I go to the annex for my own permits. I don't touch the city's computers. I wouldn't know how.",
  ], { requiresEvidence: ["E16"] }),
  q("voss", "Bell Security", "voss_bell", "What does Bell Security do for you?", [
    "Site patrol. Copper thieves love a construction site. Marcus is reliable.",
  ]),
  q("voss", "Bell Security", "voss_invoice", "What was the five thousand dollars on September 13 for?", [
    "Extra patrols. We lost copper wire that week.",
  ], { requiresEvidence: ["E14"], reveals: "Voss says the $5,000 paid to Bell Security on September 13 was for extra patrols after copper theft." }),
  q("voss", "Bell Security", "voss_wire", "Why did you wire Bell fifteen thousand dollars on September 17?", [
    "A site security assessment. Marcus did a full review of the property. It's in the file.",
    "Who told you about that?",
  ], { requiresEvidence: ["E30"], reveals: "Voss says the $15,000 was for a 'site security assessment'." }),
  q("voss", "Alibi", "voss_sept14", "Where were you on September 14?", [
    "At home with my wife. Friday night. Ask her.",
  ]),
  q("voss", "Alibi", "voss_oct29", "Where were you on the evening of October 29?", [
    "At the Chamber of Commerce dinner, six to ten. I gave a toast. Two hundred people saw me.",
  ], { requires: found, reveals: "Voss was at the Chamber of Commerce dinner from 6 to 10 PM on October 29." }),
  q("voss", "The Marshes", "voss_marshes", "Vivian and Graham Marsh were found in Bell Security's SUV.", [
    "I heard. It's horrible. It has nothing to do with my company. I'm told the vehicle was stolen.",
    "I'd like you to leave now.",
  ], { requires: found }),

  // =====================================================================
  // Marcus Bell: took part in both crimes
  // =====================================================================
  q("bell", "Introductions", "bell_who", "Who are you?", [
    "Marcus Bell. I own this. Bell Security. Patrols, events, construction sites. Six years.",
  ]),
  q("bell", "The fleet", "bell_fleet", "What vehicles do you run?", [
    "Five. Two pickups, two SUVs, a van. It's on the board.",
  ]),
  q("bell", "The fleet", "bell_unit4", "Who drives Unit 4?", [
    "Me.",
  ], { reveals: "Marcus Bell drives Unit 4 himself." }),
  q("bell", "The fleet", "bell_deer", "What happened to Unit 4's right front corner?", [
    "Deer. Route 88. Saturday the fifteenth, late. Had it fixed Monday.",
  ], { requiresEvidence: ["E26"], reveals: "Bell says Unit 4 hit a deer on Route 88 on Saturday, September 15." }),
  q("bell", "September 14", "bell_sept14", "Where were you on the night of September 14?", [
    "Home. Alone. I live alone.",
  ], { reveals: "Bell says he was home alone on September 14." }),
  q("bell", "People", "bell_shaw", "Do you know Trevor Shaw?", [
    "He tows for us. We went to school together. That's it.",
  ]),
  q("bell", "People", "bell_voss", "What's your arrangement with Caleb Voss?", [
    "Client. Riverside Commons is a contract. Patrol, every night.",
  ]),
  q("bell", "Money", "bell_invoice", "What were the supplemental services on September 13?", [
    "Two extra guys on the site for three nights. Copper.",
    "Which two guys? Mine. That's who.",
  ], { requiresEvidence: ["E14"] }),
  q("bell", "The fleet", "bell_trim", "This trim came off a Ford Explorer at Alder Street.", [
    "Plenty of Explorers in this town.",
  ], { requiresEvidence: ["E05"] }),
  q("bell", "The fleet", "bell_where_unit4", "Where is Unit 4?", [
    "Out.",
  ], {
    requires: { event: "RE03" },
    repeatable: true,
    variants: [{ requires: found, reply: ["Somebody took it. Police have it now. I filed the report."] }],
  }),
  q("bell", "October 29", "bell_oct29", "Where were you on the evening of October 29?", [
    "On the riverside post. Six to two. Alone. Unit 4 was in the garage when I left.",
  ], { requires: found, reveals: "Bell says he worked the riverside post alone from 6 PM to 2 AM on October 29 and that Unit 4 was in the garage when he left." }),
  q("bell", "October 29", "bell_stolen", "How was Unit 4 stolen?", [
    "Somebody took it from the garage overnight. I came in at six thirty, it was gone. I reported it.",
    "Keys hang by the door. I'm changing that.",
  ], { requires: found, reveals: "Bell says Unit 4 was stolen from the garage overnight." }),
  q("bell", "October 29", "bell_vivian", "Did you know Vivian Marsh?", [
    "No.",
  ], { requires: found }),
  q("bell", "October 29", "bell_gps", "Unit 4's tracker shows it leaving your garage at 6:52 PM and stopping on Alder Street.", [
    "Then somebody took it earlier than I thought.",
  ], { requiresEvidence: ["E22"] }),
  q("bell", "October 29", "bell_gloves", "Your DNA is inside the gloves with Graham Marsh's blood on them.", [
    "Lawyer.",
  ], { requiresEvidence: ["E32"], effects: [{ setFlag: "bell_lawyered" }] }),

  // =====================================================================
  // Trevor Shaw: took part in the first attack only
  // =====================================================================
  q("shaw", "Introductions", "shaw_who", "Who are you?", [
    "Trevor. Shaw Towing and Recovery. One truck, me, and an app on my phone. Twenty-four hours.",
  ]),
  q("shaw", "The tow", "shaw_tow", "You towed the car from Alder Street.", [
    "I'm on the police rotation. Two in the morning. The car seat was still in the back.",
    "Worst thing I ever hooked up. I don't want to talk about it.",
  ]),
  q("shaw", "September 14", "shaw_sept14", "Where were you on the night of September 14?", [
    "On a call. Breakdown out on Route 51, around mile eight. Guy's car died, I jumped it, he paid cash.",
    "Then I went home, and then the cops called me for Alder.",
  ], { reveals: "Shaw says he was on a breakdown call on Route 51 at mile 8 on the night of September 14." }),
  q("shaw", "People", "shaw_bell", "How do you know Marcus Bell?", [
    "High school. Marcus is a good guy. He gives me work. Tows for his company, his events.",
  ]),
  q("shaw", "September 14", "shaw_dispatch", "Your own GPS puts your truck at the Bell Security garage from 9:15 to 10:38 that night.", [
    "That GPS glitches. It says I'm places I'm not all the time.",
    "Okay, maybe I stopped at Marcus's first. To use the bathroom. Then I went to Route 51.",
  ], { requiresEvidence: ["E28"], reveals: "Confronted with his truck's GPS, Shaw says he 'maybe' stopped at the Bell Security garage first." }),
  q("shaw", "September 14", "shaw_tower", "Your phone used the tower at Furnace and Alder at 10:05 PM.", [
    "Towers bounce around. That doesn't mean anything. Ask anybody.",
  ], { requiresEvidence: ["E29"] }),
  q("shaw", "Money", "shaw_payment", "Did Marcus Bell pay you around September 14?", [
    "He pays me for tows. Cash. That's how it works with him.",
    "How much? I don't remember. A couple grand, maybe, over the month.",
  ], { requires: { any: [{ hasEvidence: "E29" }, { deduction: "D10" }] }, reveals: "Shaw says Bell paid him 'a couple grand' in cash around that month, 'for tows'." }),
  q("shaw", "People", "shaw_voss", "Do you know Caleb Voss?", [
    "The developer? I seen him on the news. I tow cars, man.",
  ]),
  q("shaw", "October 29", "shaw_oct29", "Where were you on the evening of October 29?", [
    "On a jackknifed tractor-trailer on 79 with the state police, six to after eleven. In the rain. Ask the troopers. Ask anybody.",
  ], { requires: found, reveals: "Shaw says he was on a highway recovery job with state police from 6 to 11 PM on October 29." }),
  q("shaw", "October 29", "shaw_marshes", "Vivian and Graham Marsh were found in Unit 4.", [
    "I saw. That's got nothing to do with me. Nothing. I was on 79.",
    "I didn't even know those people.",
  ], { requires: found }),
  q("shaw", "October 29", "shaw_prepaid", "Whose number is (724) 555-0149?", [
    "I don't know. I get calls from all kinds of numbers. I'm a tow truck.",
  ], { requires: { all: [{ flag: "warned" }, { hasEvidence: "E29" }] } }),
  q("shaw", "October 29", "shaw_scared", "You look scared, Trevor.", [
    "I'm not sleeping. Okay? I'm not sleeping.",
    "I'm not talking about why.",
  ], { requires: found }),

  // =====================================================================
  // Owen Price: the records clerk
  // =====================================================================
  q("owen", "About him", "owen_who", "Who are you?", [
    "Owen Price. Twenty-two years at the counter upstairs. I volunteer down here in the archive now.",
  ]),
  q("owen", "About him", "owen_retired", "Why did you retire?", [
    "I was sixty days from my thirty, near enough. It was suggested that I go early. I took the suggestion.",
  ]),
  q("owen", "The portal", "owen_portal", "How does the permit portal work?", [
    "Every filing gets scanned onto the portal. The portal keeps every version and who touched it. Most people don't know that part.",
  ]),
  q("owen", "The clearance", "owen_replaced", "Did you notice anything wrong with the Riverside Commons file?", [
    "In August the clearance on the portal didn't match the paper in the box. Same letterhead, different page four.",
    "I reported it on the ninth. I was told it was a 'version update' and to leave it alone. Then I was told I might enjoy retirement.",
  ], { reveals: "Owen noticed in August that the Riverside Commons clearance on the portal did not match the paper original. He reported it and was told to leave it." }),
  q("owen", "The clearance", "owen_log", "Do you have proof?", [
    "I printed the portal history and copied the sign-in page before I left. I shouldn't have. Here.",
    "Please, if you use it, don't say where it came from unless you have to.",
  ], { requires: { asked: "owen_replaced" }, reveals: "Owen hands over the portal audit log and the annex sign-in page.", effects: [{ giveEvidence: "E16" }, tl("4:47 PM (Fri 8/3)", "The Riverside Commons clearance is replaced on the city portal from the annex public terminal.", "Portal audit log")] }),
  q("owen", "The clearance", "owen_jfenn", "Who is jfenn?", [
    "Janet Fenn, records. She was on vacation the week of July 30. Her login was on a sticky note at the public desk. Half the building knew it.",
  ], { requiresEvidence: ["E16"] }),
  q("owen", "The clearance", "owen_voss", "Who was in the annex when the file was replaced?", [
    "Look at the sign-in page. Mr. Voss signed in at 4:20 and out at 5:05. The file was replaced at 4:47 from the public terminal.",
    "I'm not saying anything. The page is saying it.",
  ], { requiresEvidence: ["E16"] }),
  q("owen", "Visitors", "owen_ethan", "Did anyone else ask about the Riverside Commons file?", [
    "An electrician, September 11. Polite young man. Asked to see the paper box and took a lot of notes. He asked me whether the portal copy was the same. I said it should be.",
    "I've thought about that answer a great deal since.",
  ], { reveals: "Ethan Cole examined the paper Riverside Commons file at the annex on September 11.", effects: [tl("2:05 PM (Tue 9/11)", "Ethan Cole examines the paper Riverside Commons file at the records annex.", "Owen Price")] }),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of the file?", [
    "Forty years of this, and robberies don't leave the wallets. Somebody wanted something in that car and knew it was there.",
    "Find out what was in the bag and you'll find out who wanted it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D03" }, reply: ["Now you know what they wanted. Follow the money from the people who needed it gone."] },
      { requires: found, reply: ["Two crimes, one car. Write it up so it holds for both."] },
    ],
  }),
  q("bennett", "The case", "bennett_cross", "Can I trust Det. Cross?", [
    "She gave the family her own file. That's a detective asking for help without saying so. Yes.",
  ]),
  q("bennett", "Records", "bennett_voss", "Run Caleb Voss for me.", [
    "No record. Two lawsuits from contractors over unpaid invoices, both settled. Bellwether Redevelopment Group is three years old and in debt on Riverside Commons up to its ears.",
  ], { requires: { any: [{ talkedTo: "voss" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }] } }),
  q("bennett", "Records", "bennett_bell", "Run Marcus Bell for me.", [
    "Army military police, honorable discharge. Licensed security contractor since 2012. No record. Owns five vehicles through the company.",
  ], { requires: { any: [{ talkedTo: "bell" }, { hasEvidence: "E14" }] } }),
  q("bennett", "Records", "bennett_shaw", "Run Trevor Shaw for me.", [
    "A DUI at twenty-two, nothing since. Behind on the loan for his truck. On the Bellwether PD tow rotation.",
  ], { requires: { any: [{ talkedTo: "shaw" }, { hasEvidence: "E28" }] } }),
  q("bennett", "Records", "bennett_prepaid", "Can you trace a prepaid number?", [
    "A prepaid phone bought with cash is built to have no name. What it does have is every number it ever called. Find who else it called.",
  ], { requires: { flag: "warned" } }),
  q("bennett", "The case", "bennett_marshes", "The Marshes are dead.", [
    "I heard. I've been at this forty years. A witness gets killed because somebody was afraid of what she knew, not because somebody went knocking.",
    "Go make it count.",
  ], { requires: found }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [{ requires: found, reply: ["Cross is on it with you now. Reed has the SUV. Ask him for its tracker."] }],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  r("rachel", "E09", ["That's his notepad. He kept it in his shirt pocket. 'Kids are going to live on this.' That's Ethan."]),
  r("rachel", "E15", ["'Give this to the state, not the city.' He knew. He knew something could happen."]),
  r("rachel", "E08", ["His wallet's there. His phone's there. They took his bag. That's all they wanted."]),
  r("vivian", "E07", ["Yes. That's what I could see. The tree, and not much past the Hallorans'."]),
  r("vivian", "E04", ["Is that the light? On the dashboard? Oh."], { reveals: "Shown the store video, Vivian recognizes the amber light on the SUV's dashboard." }),
  r("vivian", "E25", ["A fleet of them. I see."]),
  r("graham", "E12", ["Kerr and Lusk. Good outfit. B-3's inside the building."]),
  r("lena", "E04", ["That's them. That's the SUV. God."]),
  r("lena", "E03", ["Nine forty-two. Apple juice."]),
  r("cross", "E05", ["That was in the hedge? My people walked that hedge. Get it to Reed."]),
  r("cross", "E26", ["Deer strike, paid cash, three days after. I'll be talking to Ridgeway Collision."]),
  r("cross", "E28", ["His own software. That's enough for a judge. Ask me for his phone records."]),
  r("cross", "E15", ["'Not the city.' He didn't trust us either. I don't blame him."]),
  r("cross", "E24", ["She was going to send this to me. Tonight."]),
  r("cross", "E22", ["Stolen 'overnight'. It left his garage at 6:52."]),
  r("cross", "E31", ["One road out. One man walking. And Bell's own pickup leaving."]),
  r("cross", "E32", ["That's him. That's his hands. Thank you."]),
  r("reed", "E05", ["FL3B. Ford Explorer, right front arch. Find me the vehicle."]),
  r("reed", "E21", ["It's in our garage. Ask me for the tracker, and the paint."]),
  r("voss", "E11", ["That's our filing. As approved."]),
  r("voss", "E10", ["An earlier draft. I don't know how that's still in the box."]),
  r("voss", "E14", ["Extra patrols. I told you."]),
  r("voss", "E16", ["Lots of people sign that book."]),
  r("voss", "E30", ["I'm not discussing my company's finances without counsel."], { requires: found, effects: [{ setFlag: "voss_lawyered" }] }),
  r("bell", "E26", ["Deer."]),
  r("bell", "E25", ["My fleet. My roster. So?"]),
  r("bell", "E04", ["Lot of dark SUVs in this town."]),
  r("bell", "E22", ["Then somebody took it earlier than I thought."]),
  r("bell", "E31", ["I was on post. I left at the end of my shift."]),
  r("bell", "E32", ["Lawyer."], { effects: [{ setFlag: "bell_lawyered" }] }),
  r("shaw", "E28", ["That GPS glitches, man."]),
  r("shaw", "E29", ["I want to talk to somebody before I say anything else."]),
  r("shaw", "E04", ["I can't see anybody in that. Can you?"]),
  r("owen", "E11", ["That's the portal version. That's not what's in the box."]),
  r("owen", "E10", ["That's the paper original. That's the true one."]),
  r("bennett", "E08", ["Wallets left behind. That's not a robbery, that's a retrieval."]),
  r("bennett", "E29", ["A prepaid number. Built to have no name. See who else it called."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_DEER",
    characterId: "bell",
    title: "Marcus Bell: the deer",
    text: "Marcus Bell says Unit 4 hit a deer on Route 88 on Saturday, September 15. A right front wheel-arch trim for a 2016 to 2018 Explorer, with gray and silver paint, was in the hedge at Alder Street, where the shooting happened on September 14. The body shop found silver paint on Unit 4's corner and no hair.",
    when: { all: [{ asked: "bell_deer" }, { hasEvidence: "E05" }, { hasEvidence: "E26" }] },
  },
  {
    id: "X_STOLEN",
    characterId: "bell",
    title: "Marcus Bell: stolen overnight",
    text: "Marcus Bell says Unit 4 was stolen from his garage overnight on October 29. Its tracker shows it leaving the garage at 6:52 PM, stopping on Alder Street, and ending at the riverside access road at 8:02 PM.",
    when: { all: [{ any: [{ asked: "bell_stolen" }, { asked: "bell_oct29" }] }, { hasEvidence: "E22" }] },
  },
  {
    id: "X_ROUTE51",
    characterId: "shaw",
    title: "Trevor Shaw: Route 51",
    text: "Trevor Shaw says he was on a breakdown call on Route 51 at mile 8 on September 14. His own truck's GPS shows it parked at the Bell Security garage on Mill Road from 9:15 to 10:38 PM, and the call has no customer and no payment.",
    when: { all: [{ asked: "shaw_sept14" }, { hasEvidence: "E28" }] },
  },
  {
    id: "X_PATROLS",
    characterId: "voss",
    title: "Caleb Voss: extra patrols",
    text: "Caleb Voss says the $5,000 to Bell Security on September 13 was for extra patrols. The invoice names no site, no hours and no guard, unlike every other Bell invoice, and Voss told his bookkeeper not to put the September 17 payment 'under patrol'.",
    when: { all: [{ asked: "voss_invoice" }, { hasEvidence: "E14" }, { hasEvidence: "E30" }] },
  },
  {
    id: "X_ANNEX",
    characterId: "voss",
    title: "Caleb Voss: the annex",
    text: "Caleb Voss says he never touches the city's computers. The clearance file was replaced from the annex public terminal at 4:47 PM on August 3, while the sign-in book shows him in the annex from 4:20 to 5:05.",
    when: { all: [{ asked: "voss_annex" }, { hasEvidence: "E16" }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  rachel_hire: "why did you hire us why come to blackwood why me why an investigator",
  rachel_jenna: "tell me about your sister what was jenna like who was jenna",
  rachel_ethan: "tell me about ethan what was ethan like who was ethan sophie's dad",
  rachel_sophie: "how is sophie the little girl your niece is she okay can I talk to sophie",
  rachel_worried: "was ethan worried scared afraid nervous anything bothering him something at work",
  rachel_bag: "ethan's bag the messenger bag what was in the bag the gray bag",
  rachel_night: "what were they doing that night the carnival where were they going that friday",
  rachel_police: "what have the police told you detective cross what did the police say",
  rachel_riverside: "riverside commons plating works river road did ethan mention his job site",
  rachel_envelope: "the envelope ethan left what did he give you the envelope",
  rachel_vivian: "vivian marsh do you know the neighbor the woman across the street",
  rachel_marshes: "the marshes the news vivian is dead what happened to the marshes",
  vivian_job: "what do you do your job about you how long have you lived here",
  vivian_night: "what happened that night what did you hear september 14 tell me about the night",
  vivian_car: "did you see a car another vehicle what did you see leaving the car the suv",
  vivian_shooting: "did you see the shooting see the shots who fired",
  vivian_light: "anything else about the vehicle anything you didn't tell the police the light a detail you remember",
  vivian_police: "did the police talk to you what did you tell the police detective cross",
  vivian_bell: "bell security does bell security mean anything security company football games parking",
  vivian_scared: "are you all right are you okay are you scared afraid worried",
  vivian_graham: "what does your husband think graham",
  vivian_sophie: "the little girl the child did you see sophie the girl in the back seat",
  graham_who: "what do you do about you your job retired",
  graham_night: "where were you that night september 14 what did you see",
  graham_vivian: "is vivian okay how is your wife is she scared",
  graham_car: "anything unusual on the street strange cars anyone watching the house a car driving by",
  graham_survey: "read these coordinates survey field book boring b-3 can you read this survey",
  graham_advice: "what would you do your advice what should I do",
  lena_family: "the family that night do you remember them the little girl the people who stopped",
  lena_receipt: "receipt do you have the receipt what did they buy what time were they here",
  lena_suv: "anyone else in the lot another car outside a vehicle in the parking lot an suv",
  lena_man: "did anyone else come in other customers someone before them",
  lena_camera: "video camera footage security camera recording cctv tape",
  lena_police: "what did you tell the police did the police talk to you",
  lena_after: "what happened after they left after they drove off sirens",
  lena_ethan: "the father the dad ethan what was he carrying the bag",
  lena_patch: "the man with the patch the jacket the uniform the cigarette guy",
  cross_case: "where does the case stand where are you on the investigation status progress",
  cross_robbery: "was it a robbery do you think it was a robbery robbery theory",
  cross_autopsy: "autopsy medical examiner cause of death how did they die did the crash kill them ME report",
  cross_casings: "the guns casings shell cases ballistics firearms what kind of gun how many guns",
  cross_inventory: "what was taken what was missing inventory property wallets the bag",
  cross_vivian: "what did vivian marsh tell you the witness the neighbor",
  cross_tow: "who towed the car tow truck where is the car impound",
  cross_shaw_records: "shaw's phone records phone records subpoena court order cell records",
  cross_bell: "bell security suv repair body shop unit 4 invoice deer",
  cross_voss: "voss riverside commons clearance altered payments developer",
  cross_marsh: "the marshes are gone the door is open blood vivian is missing come to the house something happened at the marsh house",
  cross_bodies: "what happened to the marshes where were they found how did they die",
  cross_bank: "was anything taken from the house graham's money bank withdrawal cash",
  cross_stolen: "bell says unit 4 was stolen stolen suv stolen report",
  cross_facilities: "how did anyone know vivian was going to talk how did bell find out the school district email",
  cross_voss_text: "did voss order it did voss know voss bell phone calls who ordered the murders",
  cross_again: "anything new news updates what's new",
  reed_who: "what do you do here who are you the lab",
  reed_limits: "what can a lab tell me what can't it tell me limits of forensics how sure",
  reed_trim: "the trim fragment what can you tell me about this plastic part number",
  reed_casings: "the casings bullets guns ballistics",
  reed_blood: "test the blood door frame the smear dna the marsh house blood",
  reed_gps: "tracker gps unit 4 navigation history where did the suv go telematics",
  reed_paint: "compare the paint the trim fragment with unit 4 paint comparison",
  reed_gloves: "the gloves the phone the search test what the search found",
  reed_again: "anything back results yet any news",
  voss_who: "who are you what do you do your company",
  voss_project: "riverside commons the project the development tell me about it",
  voss_ethan: "ethan cole did you know ethan the electrician",
  voss_clearance: "the environmental clearance the report hollis permits approval",
  voss_b3: "b-3 boring remediation the original paper chromium contamination",
  voss_annex: "the annex the records office the city computers you were there august 3",
  voss_bell: "bell security what does bell do for you the security contract",
  voss_invoice: "five thousand dollars supplemental services september 13 invoice",
  voss_wire: "fifteen thousand wire consulting september 17 payment",
  voss_sept14: "where were you september 14 that friday night alibi",
  voss_oct29: "where were you october 29 monday night alibi",
  voss_marshes: "vivian and graham marsh the marshes the bodies the suv",
  bell_who: "who are you what do you do your company",
  bell_fleet: "what vehicles do you have your fleet how many cars",
  bell_unit4: "who drives unit 4 whose suv is that the explorer",
  bell_deer: "what happened to the front of unit 4 the damage the repair the deer",
  bell_sept14: "where were you september 14 that friday night alibi",
  bell_shaw: "do you know trevor shaw the tow guy",
  bell_voss: "caleb voss your arrangement with voss the developer the contract",
  bell_invoice: "supplemental services september 13 invoice five thousand two personnel",
  bell_trim: "this trim fragment ford explorer part from alder street",
  bell_where_unit4: "where is unit 4 where's the suv",
  bell_oct29: "where were you october 29 monday night alibi",
  bell_stolen: "how was unit 4 stolen the theft stolen suv",
  bell_vivian: "did you know vivian marsh the witness",
  bell_gps: "the tracker gps unit 4 left your garage at 6:52",
  bell_gloves: "the gloves dna blood graham marsh",
  shaw_who: "who are you what do you do",
  shaw_tow: "you towed the car alder street the tow that night",
  shaw_sept14: "where were you september 14 that friday night alibi",
  shaw_bell: "marcus bell how do you know bell your friend",
  shaw_dispatch: "your gps your truck dispatch log mill road bell's garage",
  shaw_tower: "your phone the cell tower furnace and alder 10:05",
  shaw_payment: "did bell pay you money cash payment",
  shaw_voss: "caleb voss do you know voss the developer",
  shaw_oct29: "where were you october 29 monday night alibi",
  shaw_marshes: "vivian and graham marsh the marshes the bodies",
  shaw_prepaid: "whose number is this prepaid phone 555-0149 burner",
  shaw_scared: "you look scared are you afraid are you okay",
  owen_who: "who are you what do you do",
  owen_retired: "why did you retire why did you leave",
  owen_portal: "how does the portal work the permit portal versions",
  owen_replaced: "anything wrong with the riverside commons file did you notice anything the clearance file",
  owen_log: "do you have proof records copies audit log history sign-in",
  owen_jfenn: "who is jfenn janet fenn the login",
  owen_voss: "who was in the annex who was there when it was replaced",
  owen_ethan: "did anyone else ask about the file ethan the electrician september 11",
  bennett_case: "what do you make of the file what do you think your read",
  bennett_cross: "can I trust cross detective cross",
  bennett_voss: "run caleb voss background on voss records",
  bennett_bell: "run marcus bell background on bell records",
  bennett_shaw: "run trevor shaw background on shaw records",
  bennett_prepaid: "trace a prepaid number burner phone the warning call",
  bennett_marshes: "the marshes are dead vivian graham",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
