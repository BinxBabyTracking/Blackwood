import type { CharacterDef, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * C001 interviews. DRAFT CASE CONTENT, written against the canonical
 * provisional timeline (see docs/C001-timeline.md):
 *
 *   Fri 8/16/85  7:00 PM guests arrive · 8:00 supper · 9:15 Eleanor takes
 *   Daniel to her desk with the ledger · 10:00 Robert leaves · 10:10 Margaret
 *   · 10:20 Patricia · 10:25 Daniel · 10:30 Eleanor alone · ~10:40 Daniel at
 *   the diner, served by Linda · 11:00 Linda clocks out, Rosa starts · ~11:05
 *   tan-jacket customer leaves · 11:20 Daniel returns · 11:30 late news ends
 *   at Margaret's · 11:35 confrontation · 12:10 AM Margaret sees the sedan ·
 *   12:15 Daniel departs · 12:30 sedan gone · Sat 7:40 AM Eleanor found.
 *
 * Rules for this file: no character names the culprit; nobody states a
 * forensic result that is not in a document; every time agrees with the
 * timeline above. Questions unlock from evidence, deductions, flags and
 * earlier answers, and answers vary deterministically with progress.
 */

export const characters: CharacterDef[] = [
  {
    id: "eleanor",
    name: "Eleanor Whitmore",
    role: "Victim",
    portrait: "char.eleanor",
    bio: [
      { text: "Sixty-four. Widowed in 1981 when her husband Harold, a building contractor, died. Lived alone on Hollister Avenue in Los Feliz." },
      { text: "Well known in the neighbourhood for funding the reading room at the Hollister branch library." },
      { text: "Her late husband's estate had been managed by Daniel Mercer since 1981.", requires: { any: [{ talkedTo: "daniel" }, { hasEvidence: "E03" }] } },
      { text: "Had told Margaret Ellis she was seeing Harold's attorney on Monday the 19th.", requires: { any: [{ hasEvidence: "E09" }, { asked: "margaret_eleanor_mood" }] } },
    ],
    available: { not: { always: true } },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },
  {
    id: "margaret",
    name: "Margaret Ellis",
    role: "Party guest, neighbour",
    portrait: "char.margaret",
    bio: [
      { text: "Retired schoolteacher. Lives directly across Hollister Avenue from the Whitmore house and knew Eleanor for twenty years." },
      { text: "Walked home at about 10:10 on the night of the gathering.", requires: { any: [{ asked: "margaret_departure" }, { inspected: "office_recorder" }] } },
      { text: "Saw a dark sedan parked by Eleanor's house at 12:10 AM.", requires: { eventState: "RE01", is: "completed" } },
    ],
    available: { always: true },
    locationId: "margaret_house",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what to make of that. You'd know better than I would.",
    idleLine: "I've told you everything I can think of. If anything else comes back to me, I'll telephone your office.",
    noAnswer: ["I'm sorry, I don't know anything about that.", "I couldn't tell you. I'd rather not guess.", "That's not something I would know, I'm afraid."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Mature woman, measured speech, slightly guarded. American.",
      settings: { stability: 0.62, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "reserved", label: "Reserved", requires: { always: true } },
      {
        id: "forthcoming",
        label: "Forthcoming",
        requires: { any: [{ eventState: "RE01", is: "completed" }, { asked: "margaret_sedan_more" }, { asked: "margaret_eleanor_mood" }] },
        cue: "Margaret seems more at ease with you now.",
      },
    ],
  },
  {
    id: "daniel",
    name: "Daniel Mercer",
    role: "Party guest, estate manager",
    portrait: "char.daniel",
    bio: [
      { text: "Forty-one. Runs a one-man bookkeeping and estate management practice from his apartment in Silver Lake." },
      { text: "Managed Harold Whitmore's estate accounts on Eleanor's behalf since 1981." },
      { text: "Told the police he spent the rest of the night at the Maple Street Diner." },
      { text: "His right hand is bandaged.", requires: { hasEvidence: "E14" } },
    ],
    available: { always: true },
    locationId: "daniel_apartment",
    onBoard: true,
    defaultEvidenceReply: "I don't see what that has to do with me.",
    idleLine: "I gave the police a full statement. I don't have anything to add.",
    noAnswer: ["I have no idea what you mean.", "I don't see how that's any concern of mine.", "You'd have to ask someone else about that."],
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Adult man, composed and articulate, increasingly defensive when challenged. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "composed", label: "Composed", requires: { always: true } },
      {
        id: "guarded",
        label: "Guarded",
        requires: { any: [{ contradiction: "X_LINDA" }, { contradiction: "X_DINER_TIME" }, { presented: "daniel:E13" }, { presented: "daniel:E04" }, { asked: "daniel_sedan" }, { asked: "daniel_jacket_b" }] },
        idleLine: "I've answered your questions. I think you should go.",
        cue: "Mercer's manner has cooled. He is choosing his words more carefully now.",
      },
      {
        id: "defensive",
        label: "Defensive",
        requires: { any: [{ deduction: "D_HAND" }, { deduction: "D_MOTIVE" }, { asked: "daniel_alibi_broken" }] },
        idleLine: "If you have something to say to me, say it. Otherwise I have work to do.",
        cue: "Mercer is no longer pretending to be patient with you.",
      },
      {
        id: "refusing",
        label: "Declining to answer",
        requires: { flag: "daniel_lawyered" },
        refuses: "I've said all I'm going to say. Any further questions can go through my attorney.",
        cue: "Mercer has stopped answering questions.",
      },
    ],
  },
  {
    id: "robert",
    name: "Robert Hale",
    role: "Party guest, mechanic",
    portrait: "char.robert",
    bio: [
      { text: "Owns Hale Automotive on Fletcher Drive. Kept Harold Whitmore's trucks running for fifteen years and stayed friendly with Eleanor afterwards." },
      { text: "Left the gathering first, at about 10:00.", requires: { any: [{ asked: "robert_departure" }, { inspected: "office_recorder" }] } },
      { text: "Fitted the bolt on Eleanor's kitchen door.", requires: { asked: "robert_property" } },
    ],
    available: { always: true },
    locationId: "robert_garage",
    onBoard: true,
    defaultEvidenceReply: "Can't help you there. I know engines, not police work.",
    idleLine: "Look, I've got a pickup on the lift. I told the detective everything already.",
    noAnswer: ["Couldn't tell you.", "No idea. I fix cars.", "That's not something I'd know about."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Middle-aged man, direct, slightly rough voice. American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "plain", label: "Plain-spoken", requires: { always: true } },
      { id: "impatient", label: "Impatient", requires: { flag: "robert_impatient" }, cue: "Hale wipes his hands and looks at the clock on the wall." },
    ],
  },
  {
    id: "patricia",
    name: "Patricia Wells",
    role: "Party guest, Eleanor's niece",
    portrait: "char.patricia",
    bio: [
      { text: "Thirty-one. Eleanor's niece and closest family. Loan officer at Pacific Crest Savings & Loan on Vermont Avenue." },
      { text: "Left the gathering at about 10:20.", requires: { any: [{ asked: "patricia_evening" }, { inspected: "office_recorder" }] } },
      { text: "Eleanor had asked her to pull the estate account statements a few weeks before she died.", requires: { asked: "patricia_money" } },
    ],
    available: { always: true },
    locationId: "patricia_office",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what that tells us. Aunt Eleanor kept everything; that could have come from anywhere in the house.",
    idleLine: "Please, find out what happened to her. Call me if you need anything from the bank.",
    noAnswer: ["I don't know. I'm sorry.", "I wouldn't know anything about that.", "I can't help you with that one."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Adult woman, emotional but controlled. American.",
      settings: { stability: 0.42, similarity_boost: 0.8, style: 0.3 },
    },
    demeanor: [
      { id: "hesitant", label: "Hesitant", requires: { always: true } },
      { id: "forthcoming", label: "Forthcoming", requires: { asked: "patricia_money" }, cue: "Patricia seems to have decided to trust you." },
    ],
  },
  {
    id: "bennett",
    name: "Det. Frank Bennett",
    role: "LAPD Northeast Division, police contact",
    portrait: "char.bennett",
    bio: [
      { text: "Twenty-two years on the job. Asked Blackwood to review the Whitmore file because the department's own case has stalled." },
      { text: "Reachable by telephone from your office." },
    ],
    available: { flag: "casefile_read" },
    locationId: "office",
    medium: "telephone",
    onBoard: false,
    defaultEvidenceReply: "Send it over and I'll have a look. Over the telephone it doesn't tell me much.",
    idleLine: "That's all I have for you right now. Call me when you've got something I can use.",
    noAnswer: ["Nothing on that in my file.", "I can't help you there. Find me something and I'll run it down.", "That's not something I've got."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "Middle-aged man, professional, calm, authoritative. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [{ id: "professional", label: "Professional", requires: { always: true } }],
  },
  {
    id: "rosa",
    name: "Rosa Delgado",
    role: "Night waitress, Maple Street Diner",
    portrait: "char.rosa",
    bio: [{ text: "Works the eleven-to-seven shift at the Maple Street Diner." }],
    available: { always: true },
    locationId: "diner",
    onBoard: true,
    defaultEvidenceReply: "Honey, I pour coffee. I wouldn't know.",
    idleLine: "I've got tables waiting. Holler if you need anything else.",
    noAnswer: ["Honey, I wouldn't know.", "No idea. I just pour the coffee.", "Couldn't tell you, sorry."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman in her thirties, warm, quick, a little tired. American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 },
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
  // Margaret Ellis: observant, reserved, careful not to accuse anyone
  // =====================================================================
  q("margaret", "Relationship", "margaret_relationship", "How did you know Eleanor?", [
    "Twenty years across the street. We took the paper over to each other on Saturday mornings, whoever was up first.",
    "After Harold died she leaned on me a little, and I leaned on her. That's what neighbours do.",
  ]),
  q("margaret", "The evening", "margaret_evening", "Tell me about Friday evening.", [
    "Eleanor had four of us for supper. A roast, and a lemon cake she cut herself at the sideboard. I came over at seven, before the others.",
    "It was a pleasant evening. Mostly.",
  ], { effects: [tl("7:00 PM", "Margaret Ellis arrives, the first guest.", "Margaret Ellis")] }),
  q("margaret", "The evening", "margaret_mostly", "Did anything spoil the evening or seem out of place?", [
    "At about a quarter past nine Eleanor asked Daniel to come over to her writing desk. She had her ledger open. They talked for ten minutes or so with their backs to the table.",
    "I couldn't hear what was said, and I don't want to make more of it than it was. But she was quiet for the rest of the evening.",
  ], {
    reveals: "At about 9:15 Eleanor took Daniel Mercer to her writing desk, with her ledger open, for about ten minutes. Margaret could not hear them.",
    effects: [tl("9:15 PM", "Eleanor speaks privately with Daniel Mercer at her writing desk, ledger open.", "Margaret Ellis")],
  }),
  q("margaret", "Other guests", "margaret_guests", "How did the other guests behave?", [
    "Robert ate and said very little, which is Robert. Patricia was tense all night. She kept watching her aunt.",
    "Daniel was charming. He usually is. He poured the coffee and passed the cake round.",
  ]),
  q("margaret", "Departures", "margaret_departure", "When did everyone leave?", [
    "Robert went first, about ten. I left ten minutes after him. I only had to cross the street.",
    "Patricia and Daniel were still there when I went. A little later I saw Patricia's car pull away from my front window.",
  ], {
    reveals: "Robert left about 10:00, Margaret about 10:10. Patricia and Daniel were still in the house when Margaret left.",
    effects: [tl("10:00 PM", "Robert Hale leaves, the first to go.", "Margaret Ellis"), tl("10:10 PM", "Margaret Ellis walks home across the street.", "Margaret Ellis")],
  }),
  q("margaret", "Relationship", "margaret_eleanor_mood", "How did Eleanor seem that night?", [
    "Cheerful at the table, until the business at the desk. When I helped her clear the plates she said something odd.",
    "She said, 'I'm seeing Harold's lawyer on Monday, Maggie, and I should have done it a year ago.' I didn't press her. I wish I had.",
  ], { reveals: "Eleanor told Margaret she was seeing Harold's lawyer on Monday." }),
  q("margaret", "Other guests", "margaret_daniel", "What do you know about Daniel Mercer?", [
    "He has handled Harold's estate since the funeral. Very polished. Eleanor trusted him completely. At least, she used to.",
    "He wore one of those tan windbreakers all evening, even at the table. I thought it was a little warm for it.",
  ], {
    volunteer: {
      near: "daniel mercer wear wore jacket clothes dressed",
      after: 4,
      reply: ["There's one small thing I keep coming back to. Daniel wore one of those tan windbreakers all evening, even at the table. I thought it was a little warm for it."],
    },
    reveals: "Daniel Mercer wore a tan windbreaker all evening.",
    effects: [{ setFlag: "knows_tan_jacket" }],
  }),
  q("margaret", "Unusual observations", "margaret_noise", "Did you hear anything after you got home?", [
    "No. I had the television on until the late news finished at half past eleven, and then I'm afraid I dozed off in my chair.",
    "With the windows shut and the set on, I don't think I'd have heard much from across the street.",
  ], { effects: [tl("11:30 PM", "The late news ends. Margaret dozes in her chair.", "Margaret Ellis")] }),
  q("margaret", "Unusual observations", "margaret_unusual", "Was anything out of the ordinary about the house?", [
    "Not that I saw. Eleanor was a creature of habit. She had Robert put a bolt on the kitchen door after Harold died, and she checked it every night like a ritual.",
  ], { reveals: "Eleanor bolted her kitchen door every night." }),
  q("margaret", "Unusual observations", "margaret_hands", "Did anyone at supper have an injury? A bandage, a cut hand?", [
    "No. Daniel passed the plates round and poured the coffee with both hands. I'd have noticed a bandage.",
  ], { requiresEvidence: ["E14"], reveals: "Margaret saw no injury on Daniel Mercer's hands at supper." }),
  q("margaret", "Unusual observations", "margaret_screen", "Did Eleanor ever worry about someone getting in at the back?", [
    "After Harold died, yes. That's why she had the bolt put on. She never said a word about the window.",
    "And if anyone had been in her garden, the flower bed would have told her. She knew every plant in it.",
  ], { requiresEvidence: ["E01"] }),
  q("margaret", "The sedan", "margaret_sedan_more", "About the car you saw after midnight. Can you describe it?", [
    "Dark. Green or black, I couldn't tell under the streetlight. A big four-door, parked under the jacaranda with its lights off.",
    "The back fender on the street side was crumpled in. I noticed because it caught the light.",
  ], {
    // Unlocked by RE01, Margaret's telephone call.
    reveals: "The sedan Margaret saw at 12:10 AM was dark green or black, a large four-door, lights off, with a crumpled rear fender on the street side.",
    effects: [{ setFlag: "knows_fender" }],
  }),
  q("margaret", "The sedan", "margaret_sedan_driver", "Did you see anyone in the car, or near it?", [
    "No one. It just sat there. When I came down for a glass of water at half past twelve, it was gone.",
    "Please don't ask me whose car it was. I couldn't tell you, and I won't guess about something like that.",
  ]),
  q("margaret", "The sedan", "margaret_confidence", "How sure are you about the time?", [
    "Quite sure. The clock on my mantel was my mother's, and it keeps good time. I wind it every Sunday.",
    "Ten past twelve when the cat woke me, and half past when I came down for water. I looked both times.",
  ], { reveals: "Margaret is confident of the times: 12:10 AM by her mantel clock, and the car gone by 12:30." }),
  q("margaret", "Evidence", "margaret_struggle", "Would you have heard a struggle from across the street?", [
    "I keep asking myself that. I was asleep in my chair.",
    "I'm sorry. I would give anything to have stayed awake.",
  ], { requiresDeductions: ["D_STRUGGLE"] }),
  q("margaret", "Evidence", "margaret_money", "Did Eleanor ever talk to you about money?", [
    "Never in figures. She said once that Harold's money seemed to get smaller every quarter, and Daniel always had a reason.",
    "I told her to ask Patricia, since Patricia works at the bank. I believe she did.",
  ], { requiresDeductions: ["D_MOTIVE"] }),

  // =====================================================================
  // Daniel Mercer: polished and cooperative, defensive when pressed
  // =====================================================================
  q("daniel", "Relationship", "daniel_relationship", "How did you come to manage the Whitmore estate?", [
    "Harold hired me in 1979 to keep his company books. When he died, Eleanor asked me to carry on with the estate. I was glad to.",
    "I'm a bookkeeper, not a banker. I kept things simple for her.",
  ]),
  q("daniel", "The evening", "daniel_gathering", "Tell me about Friday evening.", [
    "A small supper. Eleanor liked having people round. Good food, pleasant company, nothing out of the ordinary.",
    "Forgive me. It's hard to talk about an evening like that when you know how it ended.",
  ]),
  q("daniel", "The evening", "daniel_desk", "I'm told Eleanor took you aside at her desk at a quarter past nine.", [
    "She had a question about a bank statement. The bank changed its format this year and she found it confusing. I explained it.",
    "Ten minutes. Routine.",
  ], {
    reveals: "Daniel says the 9:15 conversation at the desk was a routine question about a bank statement's format.",
  }),
  q("daniel", "Departure", "daniel_departure", "What time did you leave?", [
    "About twenty-five past ten. I was the last to go. I helped her carry the cups into the kitchen, and she saw me out.",
    "She was perfectly well when I left.",
  ], { reveals: "Daniel says he left at about 10:25, the last guest.", effects: [tl("10:25 PM", "Daniel Mercer leaves, the last guest, by his own account.", "Daniel Mercer")] }),
  q("daniel", "Afterwards", "daniel_evening", "Where did you go after you left Eleanor's?", [
    "I drove to the Maple Street Diner on Sunset. I couldn't face an empty apartment, so I had coffee and pie and read the paper until about one.",
    "The waitress, a redhead called Linda, kept my cup filled the whole time. Ask her.",
  ], {
    allowWhenRefusing: true,
    // Mercer is keen to put his alibi on record.
    volunteer: {
      near: "night after left later midnight alibi where",
      after: 3,
      reply: [
        "And before you ask, I know how these things go. After I left Eleanor's I drove to the Maple Street Diner on Sunset and sat there with coffee and pie until about one.",
        "The waitress, a redhead called Linda, kept my cup filled the whole time. Ask her.",
      ],
    },
    reveals: "Daniel says he was at the Maple Street Diner from about 10:40 PM until about 1:00 AM, served throughout by a waitress named Linda.",
    variants: [{ requires: { flag: "daniel_lawyered" }, reply: ["I told the police where I was. The Maple Street Diner, until about one. That is all I will say without my attorney."] }],
    effects: [{ setFlag: "daniel_alibi_given" }, { unlockLocation: "diner" }, tl("10:40 PM", "Daniel Mercer says he arrives at the Maple Street Diner and stays until about 1:00 AM.", "Daniel Mercer")],
  }),
  q("daniel", "Afterwards", "daniel_afterwards", "What did you do after you left the diner?", ["Home. Bed. I didn't sleep much, if you want to know."]),
  q("daniel", "The injury", "daniel_hand", "What happened to your hand?", [
    "This? A pickle jar broke in my hand on Saturday morning. Clumsy of me. I cleaned it up and bandaged it myself.",
    "I didn't bother with a doctor.",
  ], {
    // The bandage is plain to see on his figure, so the question is open from the start.
    reveals: "Daniel says a jar broke in his right hand on Saturday morning.",
    effects: [{ giveEvidence: "E14" }],
  }),
  q("daniel", "The injury", "daniel_hand_when", "What time on Saturday morning did you cut your hand?", [
    "Early. Before nine. I bought gauze at the Rexall on Sunset on my way back from the newsstand.",
  ]),
  q("daniel", "Financial records", "daniel_accounts", "Tell me about Eleanor's accounts.", [
    "Harold's estate is in excellent order. Conservative investments, steady income. Eleanor never wanted for anything.",
    "I sent her a report every quarter. She kept copies of all of them in her desk.",
  ], { reveals: "Daniel says the estate is in excellent order, and that Eleanor kept copies of his quarterly reports in her desk." }),
  q("daniel", "Financial records", "daniel_folder", "The folder of your reports is missing from her desk drawer.", [
    "Then the police have it, or she moved it. Eleanor moved things.",
    "I keep my own copies, naturally. They're confidential.",
  ], { requiresEvidence: ["E08"] }),
  q("daniel", "The house", "daniel_screen", "Did Eleanor ever worry about break-ins?", [
    "All the time. I told her to put bars on that kitchen window. That street isn't what it was.",
    "Whoever came through that window, I hope you find him.",
  ], { requiresEvidence: ["E01"], reveals: "Daniel assumes the killer came in through the kitchen window." }),
  q("daniel", "Inconsistencies", "daniel_jacket_b", "Where is the tan windbreaker that was on your coat rack?", [
    "Windbreaker? I don't own a windbreaker. You must be thinking of somebody else.",
  ], { topic: "Physical evidence", requiresFlags: ["saw_jacket", "jacket_missing"], reveals: "Daniel says he does not own a windbreaker." }),
  q("daniel", "Afterwards", "daniel_suitcase", "You've packed a suitcase.", [
    "A client in Phoenix. I travel for work.",
    "Is there a law against packing a bag now?",
  ], { requires: { inspected: "da_suitcase" } }),
  q("daniel", "Physical evidence", "daniel_jacket_found", "Police recovered a tan windbreaker from the dumpster behind your building.", [
    "Anyone can throw anything into that dumpster. The whole building uses it.",
    "I have nothing more to say to you without my attorney.",
  ], {
    // Unlocked by RE02 once the recovered jacket has been collected.
    requiresEvidence: ["E05"],
    reveals: "Told the police had recovered a tan windbreaker behind his building, Daniel points out that the whole building uses the dumpster, and refers further questions to his attorney.",
    effects: [{ setFlag: "daniel_lawyered" }],
  }),
  q("daniel", "Inconsistencies", "daniel_alibi_broken", "Linda went home at eleven. Who kept your cup filled until one?", [
    "Then I have the name wrong. It was a long night and I was upset. What does a waitress's name matter?",
  ], { requiresDeductions: ["D_ALIBI"] }),
  q("daniel", "Inconsistencies", "daniel_left_early", "The night waitress saw a man in a tan jacket leave just after eleven.", [
    "Perhaps I stepped out to the car. I don't account for every minute of my evenings, and I don't see why I should.",
  ], { requiresDeductions: ["D_ALIBI"], reveals: "Asked about leaving the diner just after eleven, Daniel says he may have stepped out to his car." }),
  q("daniel", "Inconsistencies", "daniel_sedan", "A dark sedan with a crumpled rear fender was parked by Eleanor's house at ten past twelve.", [
    "There are a great many dark cars in Los Angeles.",
    "I was at the diner. I've told you that.",
  ], {
    requires: { all: [{ asked: "margaret_sedan_more" }, { any: [{ flag: "fender_identified" }, { inspected: "g_orders" }] }] },
    variants: [{ requires: { deduction: "D_ALIBI" }, reply: ["There are a great many dark cars in Los Angeles.", "I've said where I was, and I'm not going to keep saying it."] }],
  }),
  q("daniel", "The injury", "daniel_hand_glass", "There was blood on the broken glass at Eleanor's, and there's a cut on your hand.", [
    "A jar. Saturday morning. I've told you twice now.",
    "If you're accusing me of something, say it plainly, and then you can say it to my attorney.",
  ], { requiresDeductions: ["D_HAND"] }),
  q("daniel", "Financial records", "daniel_money_confront", "Eleanor's ledger and the bank's statements don't match. Explain that.", [
    "Eleanor was sixty-four and kept her sums in pencil. The bank changed its formats. She got confused.",
    "I won't discuss a client's affairs any further without my attorney.",
  ], { requiresDeductions: ["D_MOTIVE"] }),
  q("daniel", "Financial records", "daniel_lawyer_appt", "Did you know she had an appointment with Mr. Albright on Monday?", [
    "No. Why would she tell me who she was seeing?",
    "Albright was Harold's man. Eleanor didn't need him. She had me.",
  ], { requiresDeductions: ["D_LAWYER"] }),
  q("daniel", "The evening", "daniel_again", "Is there anything you left out of your statement?", ["No. I've been completely open with the police."], {
    repeatable: true,
    variants: [{ requires: { any: [{ contradiction: "X_LINDA" }, { contradiction: "X_DINER_TIME" }, { deduction: "D_ALIBI" }] }, reply: ["I've answered your questions. I'd like you to leave now."] }],
  }),

  // =====================================================================
  // Robert Hale: direct, practical, impatient with repetition
  // =====================================================================
  q("robert", "Relationship", "robert_relationship", "How did you know the Whitmores?", [
    "I kept Harold's trucks running for fifteen years. After he died I kept Eleanor's Oldsmobile running and did odd jobs round the house. She paid me in pie, mostly.",
    "She was a good woman. That's all there is to it.",
  ]),
  q("robert", "The evening", "robert_evening", "Tell me about Friday night.", [
    "Good dinner. Roast beef. I'm not one for talk at the table, so I listened.",
    "After the plates were cleared Eleanor took Mercer over to her desk for a while. Had her account book open. None of my business, so I didn't ask.",
  ]),
  q("robert", "Departure", "robert_departure", "When did you leave?", ["Ten o'clock. First one out. I open at seven on Saturdays, so I don't stay late."], {
    reveals: "Robert left at about 10:00, the first guest to go.",
    effects: [tl("10:00 PM", "Robert Hale leaves the gathering.", "Robert Hale")],
  }),
  q("robert", "Vehicles", "robert_cars_night", "Did you notice the cars outside when you left?", [
    "Margaret walks, so hers wasn't there. Patricia's little Datsun, and Mercer's big green Buick behind it. I pulled out round them.",
  ], {}),
  q("robert", "The house", "robert_property", "How well do you know the house?", [
    "Every pipe and hinge. I put the bolt on her kitchen door myself, two years ago, after Harold passed. Thumb-turn on the inside, no keyhole outside. She asked for it that way.",
    "She bolted it every night. Told me so.",
  ], { reveals: "Robert fitted the kitchen door bolt: a thumb-turn on the inside only, with no keyhole outside." }),
  q("robert", "Rear entrance", "robert_reardoor", "Could anyone open the kitchen door bolt from the yard?", [
    "Not without breaking the door or the frame. That's the whole point of it.",
  ]),
  q("robert", "Rear entrance", "robert_screen", "What would a cut screen look like if someone came in from the yard?", [
    "Mesh goes the way the blade pushes it. Cut it from the yard and the edges bend in, toward the sink. Cut it from the kitchen and they bend out.",
    "I'm telling you how screens work, that's all. I wasn't there.",
  ], { requiresEvidence: ["E01"], reveals: "Robert: a screen cut from outside bends inward; one cut from inside bends outward." }),
  q("robert", "Vehicles", "robert_cars", "Does Daniel Mercer bring his car here?", [
    "He does. Green '81 Buick LeSabre. He backed it into a pole a couple of months ago and crumpled the rear fender.",
    "I quoted him two-forty to fix it. He said he'd think about it. Never came back.",
  ], {
    requires: { any: [{ eventState: "RE01", is: "completed" }, { flag: "knows_fender" }, { asked: "robert_cars_night" }] },
    reveals: "Daniel Mercer drives a green 1981 Buick LeSabre with a crumpled rear fender. Robert quoted $240 to fix it; Mercer declined.",
    effects: [{ setFlag: "fender_identified" }],
  }),
  q("robert", "Vehicles", "robert_buick", "Did he say how the fender got damaged?", [
    "Said he backed into a pole in a parking structure downtown. Could be. A fender doesn't tell you who was driving.",
  ], { requires: { any: [{ eventState: "RE01", is: "completed" }, { flag: "knows_fender" }, { asked: "robert_cars_night" }] } }),
  q("robert", "Rear entrance", "robert_staged", "So nobody came in through the kitchen.", ["You said that, not me. But I won't argue with you."], { requiresDeductions: ["D_STAGED"] }),
  q("robert", "The evening", "robert_again", "Anything else you remember about the evening?", [
    "Like I told the detective. Dinner, cake, coffee, home. Nothing happened while I was there that I'd call happening.",
  ], {
    repeatable: true,
    effects: [{ setFlag: "robert_impatient" }],
    variants: [{ requires: { flag: "robert_impatient" }, reply: ["Look, I've told you the same thing three ways now. Ask me something new or let me get back to this pickup."] }],
  }),

  // =====================================================================
  // Patricia Wells: grieving, hesitant about money until shown it matters
  // =====================================================================
  q("patricia", "Relationship", "patricia_relationship", "You were close to your aunt?", [
    "She half raised me. Saturday mornings at her kitchen table, homework and pancakes.",
    "I'm sorry. Give me a moment.",
  ]),
  q("patricia", "The evening", "patricia_evening", "Walk me through Friday night.", [
    "I got there around a quarter past seven. Dinner, cake, coffee. I left at about twenty past ten, because I had to open the branch on Saturday morning.",
    "Aunt Eleanor walked me to the door. Daniel was still there, carrying cups into the kitchen. That was the last time I saw her.",
  ], {
    reveals: "Patricia left at about 10:20. Daniel Mercer was still in the house.",
    effects: [tl("10:20 PM", "Patricia Wells leaves. Eleanor sees her to the door; Daniel Mercer is still inside.", "Patricia Wells")],
  }),
  q("patricia", "The evening", "patricia_desk", "Did anything happen during the evening that worried you?", [
    "At a quarter past nine she took Daniel over to her desk with her ledger. She'd told me she was going to ask him about the statements.",
    "When she came back to the table she was pale, and he was smiling. I remember thinking that was strange.",
  ], {
    reveals: "Eleanor had told Patricia she meant to ask Daniel about the statements. After the 9:15 talk at the desk Eleanor came back pale.",
    effects: [tl("9:15 PM", "Eleanor speaks privately with Daniel Mercer at her writing desk, ledger open.", "Patricia Wells")],
  }),
  q("patricia", "Relationship", "patricia_inheritance", "Who inherits Eleanor's estate?", [
    "I do, mostly. I know how that sounds. The police have already asked me where I was.",
    "I was home by a quarter to eleven. My downstairs neighbour heard me drop my keys on the landing and complained about it the next day.",
  ], {}),
  q("patricia", "Eleanor's concerns", "patricia_concerns", "Was your aunt worried about anything lately?", [
    "She'd been quiet. Distracted. I told the police I thought she was tired.",
    "It was more than that, but it's family business, and I'd rather not go into money with a stranger. I'm sorry.",
  ], {
    variants: [
      {
        requires: { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }, { asked: "margaret_eleanor_mood" }] },
        reply: ["She'd been quiet. Distracted. I told the police I thought she was tired.", "If you've seen her desk, you know it wasn't tiredness. It was the estate account."],
      },
    ],
  }),
  q("patricia", "Family finances", "patricia_money", "Did Eleanor ask you for help with money?", [
    "Yes. About three weeks ago she asked me to pull the statements for Uncle Harold's estate account. It's held at my bank.",
    "She'd been keeping her own ledger, and the balance didn't match what Daniel's reports told her. I made copies, but I hadn't finished going through them when she died.",
    "Let me find what I have. I'll have it sent over to your office.",
  ], {
    requires: { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }, { asked: "margaret_eleanor_mood" }] },
    reveals: "Three weeks before her death Eleanor asked Patricia to pull the estate account statements. Her ledger did not match Daniel's reports.",
  }),
  q("patricia", "Missing documents", "patricia_missing", "A folder is missing from her desk drawer. The estate accounts.", [
    "That's where she kept Daniel's quarterly reports. She showed me the folder three weeks ago, when she asked me to pull the bank's copies.",
    "If it's gone, someone took it. Aunt Eleanor never lost a piece of paper in her life.",
  ], { requiresEvidence: ["E08"], reveals: "The missing estate folder held Daniel Mercer's quarterly reports." }),
  q("patricia", "Family finances", "patricia_ledger", "Her ledger has two columns that don't agree.", [
    "The first column is what Daniel's reports told her. The second is what she worked out from the bank's statements. She did it at night, at that desk.",
    "She wasn't confused. She was a contractor's wife for forty years. She could add.",
  ], { requiresEvidence: ["E03"], reveals: "In Eleanor's ledger, the first column follows Daniel's reports and the second follows the bank's statements." }),
  q("patricia", "Additional financial information", "patricia_more", "How much money are we talking about?", [
    "I never finished going through the copies. The cheques I did see were made out to D. Mercer Management, and none of them had her signature on the authorisation.",
    "I didn't know what to think. I still don't want to think it.",
  ], { requiresDeductions: ["D_MOTIVE"], reveals: "Cheques Patricia saw were payable to D. Mercer Management, with no authorisation signed by Eleanor." }),
  q("patricia", "Additional financial information", "patricia_lawyer", "She had an appointment with Mr. Albright on Monday.", [
    "Mr. Albright was Uncle Harold's attorney. If she was taking the papers to him, she'd made up her mind.",
    "She never told me that part. I think she was protecting me.",
  ], { requiresDeductions: ["D_LAWYER"] }),
  q("patricia", "Financial documentation", "patricia_envelope", "Tell me about the envelope you left at my office.", [
    "The police gave me back her handbag with her things. The page was folded in the inside pocket. I knew it was from the copies I'd made for her.",
    "I couldn't keep looking at it. I thought you would know what to do with it.",
  ], { reveals: "Patricia found the torn statement page folded in Eleanor's handbag when the police returned her belongings." }),
  q("patricia", "Financial documentation", "patricia_circled", "Eleanor marked lines on this statement. What are they?", [
    "They're cheques drawn on the estate account. I can tell you what a line on a statement means. Who a cheque was made out to is on the half that's missing, or in the bank's files.",
    "She tore it on purpose, I think. She was keeping the other half somewhere.",
  ], { requiresEvidence: ["E15"] }),
  q("patricia", "Other guests", "patricia_daniel", "How well do you know Daniel Mercer?", [
    "Well enough to be polite. He's charming. Aunt Eleanor called him 'my Mr. Mercer' for years.",
    "Lately she stopped calling him that.",
  ], {}),
  q("patricia", "Other guests", "patricia_hands", "Did you notice anyone hurt at supper? A cut hand?", [
    "No. Daniel served the cake while Aunt Eleanor cut it. Both his hands were fine, I'm certain.",
  ], { requiresEvidence: ["E14"], reveals: "Patricia saw no injury on Daniel Mercer's hands at supper." }),

  // =====================================================================
  // Det. Frank Bennett: professional, factual, by telephone
  // =====================================================================
  q("bennett", "Crime scene", "bennett_scene", "What did your people find at the house?", [
    "Mrs. Whitmore on the living room carpet, between the sofa and an overturned chair. A single stab wound. The carving knife was on the floor beside her. It's in our property room.",
    "Broken crystal near the chair, a cut screen over the kitchen sink, the back door unbolted, front door locked. Nothing taken that anyone can name. Purse, jewellery, a hundred and forty dollars, all still there.",
  ]),
  q("bennett", "Police interviews", "bennett_interviews", "How did the four interviews go?", [
    "Smoothly. That's what bothers me. Four people, four statements, and nobody saw anything after half past ten.",
    "Mercer says he spent the night at a diner on Sunset. Hale went home to bed. The niece went home. Mrs. Ellis watched television across the street. The tapes are on your desk.",
  ]),
  q("bennett", "Timeline", "bennett_timeline", "Walk me through the timeline as you have it.", [
    "Guests arrived from seven on Friday. Supper at eight. They left between ten and half past, by their own account. Hale first, then Mrs. Ellis, then the niece, then Mercer.",
    "After that, nothing until Mrs. Ellis let herself in at twenty to eight on Saturday morning. That's nine hours I can't account for.",
  ], { effects: [tl("8:00 PM", "Supper is underway.", "Det. Bennett"), tl("10:00 PM", "The guests leave between 10:00 and 10:30, by their own accounts.", "Det. Bennett")] }),
  q("bennett", "Evidence reports", "bennett_reports", "What reports have come back?", [
    "The coroner's preliminary. Nothing from the lab yet, because nobody's sent them anything. There's a shard of that broken glass bagged at the scene if you want the blood typed.",
    "I'll tell you what I tell my captain. Preliminary means preliminary. I won't read more into those pages than the people who wrote them.",
  ], {
    variants: [
      { requires: { labStarted: "glass" }, reply: ["The coroner's preliminary, and the lab's working on your glass. Their results come to your desk."] },
      { requires: { labReady: "glass" }, reply: ["The coroner's preliminary, and the lab's typing on the glass. It's on your desk."] },
    ],
    repeatable: true,
  }),
  q("bennett", "Evidence reports", "bennett_send_glass", "Can you get the broken glass to the lab and have the blood typed?", [
    "I can. I'll run it over to SID myself; they owe me a favor. The results come straight to your desk.",
    "Thing is, typing only tells you whether the blood is hers. If you want to know whose it is, I'd need samples from the guests to compare. Want me to ask them?",
  ], {
    requiresEvidence: ["E02"],
    offers: "bennett_samples",
    effects: [{ startLab: "glass" }],
  }),
  q("bennett", "Requests for assistance", "bennett_samples", "Can you get blood samples from all the guests to compare with the glass?", [
    "I'll ask all four to come in and give a sample. People with nothing to hide usually do.",
    "The lab will compare them with the glass. Same as before: the results come to your desk.",
  ], {
    requires: { labStarted: "glass" },
    effects: [{ startLab: "samples" }],
  }),
  q("bennett", "Forensic findings", "bennett_forensics", "What does the coroner's preliminary say?", [
    "An estimate. Somewhere between about eleven on Friday night and one on Saturday morning. One wound, consistent with a blade like the knife we recovered.",
    "Anything finer than that, they haven't given me, and I'm not going to guess.",
  ], { effects: [tl("11:00 PM to 1:00 AM", "Coroner's preliminary estimate of the time of death.", "Det. Bennett")] }),
  q("bennett", "Forensic findings", "bennett_glass", "The lab's typing on the glass doesn't fit Eleanor alone.", [
    "That's how I read it too. Typing narrows a field. It doesn't name anybody.",
    "If somebody walked out of that room with a cut, somebody saw it the next day. Find me the hand.",
  ], { requiresDeductions: ["D_INJURED"] }),
  q("bennett", "Police interviews", "bennett_hand", "Did Daniel Mercer have an injury when you took his statement?", [
    "His right hand was bandaged. He said a jar broke in it that morning. I wrote it down.",
    "At the time I had a cut screen and an open door, and I wasn't looking at the guests' hands. Maybe I should have been.",
  ], { requiresEvidence: ["E14"], reveals: "Bennett confirms Mercer's right hand was already bandaged when he gave his statement on Saturday afternoon." }),
  q("bennett", "Crime scene", "bennett_staged", "Nobody came in through that kitchen window.", [
    "My captain likes a burglar. Burglars close cases.",
    "If you can show me that screen was cut from the inside, I'll walk it upstairs myself. Write it down the way you'd say it in court.",
  ], { requiresDeductions: ["D_STAGED"] }),
  q("bennett", "Crime scene", "bennett_struggle", "Whatever happened, it happened in the living room.", [
    "That fits the room. The kitchen was tidy, dishes in the rack. She cleaned up after her guests, so she was on her feet and alone for a while after half past ten.",
  ], { requiresDeductions: ["D_STRUGGLE"] }),
  q("bennett", "Requests for assistance", "bennett_alibi", "Can you check Mercer's account with the diner's evening waitress?", [
    "I'll send a uniform round now.",
    "Done. The evening girl, Linda, went home at eleven, like the schedule says. She remembers a man in a tan jacket at the window booth, coffee and pie, still there when she left.",
    "So he was there. The question is when he left, and where he went.",
  ], { requiresDeductions: ["D_ALIBI"], reveals: "Linda confirms to the police that she went home at 11:00 PM, and that a man in a tan jacket was still in the window booth when she left." }),
  q("bennett", "Requests for assistance", "bennett_sedan", "Can you run a green 1981 Buick LeSabre?", [
    "Already did, once you gave me the fender. There's one registered to D. Mercer Management, Griffith Park Boulevard. Dark green.",
    "That puts a car on Hollister Avenue. It doesn't put a man in the house. Keep going.",
  ], {
    requires: { all: [{ asked: "margaret_sedan_more" }, { any: [{ flag: "fender_identified" }, { inspected: "g_orders" }] }] },
    reveals: "A dark green 1981 Buick LeSabre is registered to D. Mercer Management.",
    effects: [{ setFlag: "sedan_registered" }],
  }),
  q("bennett", "Requests for assistance", "bennett_jacket", "Something is missing from Mercer's apartment. Can your people look for a tan windbreaker?", [
    "A tan windbreaker with a wet cuff, and now it's gone. That's enough for me to look at the trash. Give me an hour.",
    "It's done. Two of my officers pulled one out of the dumpster behind his building, under a sack of grass clippings. It goes to the lab first, then I'll have it brought to your office.",
  ], {
    // Available once the changed apartment has been seen, and the investigator has a reason to ask about a jacket.
    requires: { all: [{ eventState: "RE02", is: "active" }, { inspected: "da_coats_b" }, { any: [{ flag: "jacket_missing" }, { flag: "knows_tan_jacket" }] }] },
    variants: [
      {
        requires: { not: { flag: "jacket_missing" } },
        reply: [
          "A tan windbreaker Mrs. Ellis saw him wear, and you didn't see one at his place. That's thin. But trash is public property. Give me an hour.",
          "It's done. Two of my officers pulled one out of the dumpster behind his building, under a sack of grass clippings. It goes to the lab first, then I'll have it brought to your office.",
        ],
      },
    ],
    reveals: "At your request, police searched the dumpster behind Mercer's building and recovered a tan windbreaker.",
    effects: [{ setFlag: "jacket_search" }, { delivery: "jacket_recovered" }, { message: "An item has been delivered." }],
  }),
  q("bennett", "Police findings", "bennett_jacket_where", "Tell me exactly where your officers found the jacket.", [
    "Near the top of the bin, under a sack of grass clippings. The building manager says the bins were emptied two days before, so it went in after that.",
    "Who put it there, I can't tell you. Nobody saw anything. Nobody ever does.",
  ]),
  q("bennett", "Evidence reports", "bennett_jacket_lab", "What did the lab say about the jacket?", [
    "Their notes are clipped to the bag. That's everything I have, and I'm not going to improve on it.",
  ], { requiresEvidence: ["E05"] }),
  q("bennett", "Requests for assistance", "bennett_motive", "Eleanor's ledger and the bank statements disagree.", [
    "Money is the oldest reason there is. But a pencil ledger and a bank statement are paper, and paper needs somebody to explain it to a jury.",
    "Who had his hands on that account? Start there.",
  ], { requiresDeductions: ["D_MOTIVE"] }),
  q("bennett", "Requests for assistance", "bennett_lawyer", "She had an appointment with Harold's attorney on Monday.", [
    "Albright. I spoke to him on Tuesday. She'd called his office the week before and asked for an hour. Wouldn't say what about on the phone.",
    "So whoever knew about Monday had until Monday.",
  ], { requiresDeductions: ["D_LAWYER"] }),
  q("bennett", "Police interviews", "bennett_again", "Anything new on your side?", [
    "Nothing new. The captain wants it filed as a burglary gone wrong. If you find something that says otherwise, I'm listening.",
  ], {
    repeatable: true,
    variants: [{ requires: { deduction: "D_STAGED" }, reply: ["The captain has stopped saying burglary quite so loudly. Keep at it."] }],
  }),

  // =====================================================================
  // Rosa Delgado: diner witness
  // =====================================================================
  q("rosa", "That night", "rosa_friday", "Were you working last Friday night?", [
    "Eleven to seven, same as every Friday. Linda had the evening and clocked out at eleven on the dot. She always does.",
    "It's all on the schedule by the pass, if you want a look.",
  ], { offers: "rosa_schedule", effects: [{ setFlag: "rosa_shift" }, tl("11:00 PM", "Linda, the diner's evening waitress, clocks out. Rosa Delgado starts the night shift.", "Rosa Delgado")] }),
  q("rosa", "That night", "rosa_customer", "Do you remember a man on his own, around eleven? Coffee, maybe pie.", [
    "Tan jacket, window booth? He was finishing up when I came on. Left about five past eleven without paying for his refill.",
    "I wrote it on a ticket for the manager. Hang on, let me get it off the spike for you. Here.",
  ], {
    volunteer: {
      near: "friday night man customer jacket booth eleven anybody someone unusual",
      after: 2,
      reply: [
        "Oh, and honey, there was a fella in a tan jacket in the window booth when I came on. He left about five past eleven without paying for his refill.",
        "I wrote it on a ticket for the manager. Here, you might as well have it.",
      ],
    },
    reveals: "A man in a tan jacket left the window booth at about 11:05 PM without paying for a refill.",
    // She hands the ticket over as she mentions it.
    effects: [{ setFlag: "rosa_note" }, { giveEvidence: "E04" }, tl("11:05 PM", "A man in a tan jacket leaves the diner without paying for a refill.", "Rosa Delgado")],
  }),
  q("rosa", "That night", "rosa_schedule", "Can I see the staff schedule?", [
    "Sure. Here, off the wall. This week's. Linda, three to eleven. Me, eleven to seven. Manager initials it every Monday.",
  ], {
    effects: [{ giveEvidence: "E13" }],
    variants: [{ requires: { hasEvidence: "E13" }, reply: ["You've already got it, honey."] }],
    repeatable: true,
  }),
  q("rosa", "That night", "rosa_ticket", "Can I have that ticket?", [
    "Sure, honey. Here, off the spike. Just bring it back if the manager asks.",
  ], {
    effects: [{ giveEvidence: "E04" }],
    variants: [{ requires: { hasEvidence: "E04" }, reply: ["You've already got it, honey. That's the only one."] }],
    repeatable: true,
  }),
  q("rosa", "That night", "rosa_return", "Did he come back later that night?", ["Not on my shift. It was dead after midnight. I'd remember."], {}),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  r("daniel", "E13", ["Then I have the name wrong. I don't keep track of waitresses."]),
  r("daniel", "E04", ["Lots of men own a tan jacket. That ticket proves nothing about me."]),
  r("daniel", "E14", ["I've told you. A jar. Saturday morning."]),
  r("daniel", "E11", ["Why are you showing me a lab report? I wasn't hurt at Eleanor's."]),
  r("daniel", "E05", ["I've never seen that jacket in my life.", "I think we're finished. Any further questions can go through my attorney."], {
    effects: [{ setFlag: "daniel_lawyered" }],
    reveals: "Shown the recovered windbreaker, Daniel denies ever seeing it and refers further questions to his attorney.",
  }),
  r("daniel", "E03", ["Eleanor's arithmetic, not mine. She was confused about a great many things lately."]),
  r("daniel", "E15", ["Where did you get that? That's a confidential client document."]),
  r("daniel", "E08", ["Eleanor kept her own papers. I wouldn't know where she filed anything."]),
  r("daniel", "E01", ["That's the window. I told her to put bars on it."]),
  r("daniel", "E09", ["Eleanor wrote all sorts of things in that diary."]),
  r("margaret", "E05", ["That's it. That's the jacket he wore at supper, I'm sure of it. The same pockets."], { reveals: "Margaret identifies the recovered windbreaker as the jacket Daniel Mercer wore at supper." }),
  r("margaret", "E09", ["That's Eleanor's writing. Monday. That's the lawyer she told me about."]),
  r("margaret", "E07", ["Those were her mother's chairs. She would never have left one lying like that."]),
  r("margaret", "E10", ["She bolted that door every night. Every single night."]),
  r("patricia", "E03", ["That's her ledger. See the pencil marks? Those are the months where the totals stopped adding up."]),
  r("patricia", "E15", ["That's from the statements I gave her. She must have torn it out to show someone."]),
  r("patricia", "E09", ["Mr. Albright was Uncle Harold's attorney. If she was seeing him, she'd made up her mind."]),
  r("patricia", "E08", ["The estate folder. That's where Daniel's reports were kept."]),
  r("robert", "E05", ["A windbreaker. Could be anybody's. I wear coveralls."]),
  r("robert", "E10", ["That's my bolt. Drawn back clean. Nobody forced that."]),
  r("robert", "E01", ["Look at the edges. Which way are they bent? That tells you which side the blade was on."]),
  r("bennett", "E01", ["The screen. I've looked at that mesh a dozen times. Tell me which way it bends."]),
  r("bennett", "E02", ["Bagged and tagged. The lab's typing is in the folder on your desk."]),
  r("bennett", "E11", ["That's the lab's page. I'll stand behind what's typed there and nothing more."]),
  r("bennett", "E14", ["He had that bandage when I took his statement."]),
  r("bennett", "E05", ["That came out of his building's trash. The rest is the lab's job, and yours."]),
  r("bennett", "E04", ["Diner paperwork. If the times on it are right, somebody's evening has a hole in it."]),
  r("bennett", "E13", ["Diner paperwork. If the times on it are right, somebody's evening has a hole in it."]),
  r("rosa", "E05", ["Could be. His was tan like that. I didn't look at his cuffs, I looked at his check."]),
  r("rosa", "E04", ["That's my ticket. Five past eleven, refill, no money. I write everything down."]),
];

/** Told the police or the investigator his diner alibi. */
const alibiOnRecord = { any: [{ asked: "daniel_evening" }, { inspected: "office_recorder" }] };

export const contradictions: ContradictionDef[] = [
  {
    id: "X_LINDA",
    characterId: "daniel",
    title: "Daniel Mercer: the waitress named Linda",
    text: "Daniel Mercer says Linda kept his cup filled until about 1:00 AM. The diner's records show Linda's shift ended at 11:00 PM.",
    when: { all: [alibiOnRecord, { any: [{ hasEvidence: "E13" }, { asked: "rosa_friday" }] }] },
  },
  {
    id: "X_DINER_TIME",
    characterId: "daniel",
    title: "Daniel Mercer: when he left the diner",
    text: "Daniel Mercer says he stayed at the diner until about 1:00 AM. The night waitress saw a man in a tan jacket leave at about 11:05 PM, and Mercer was seen in a tan windbreaker that weekend.",
    when: { all: [alibiOnRecord, { any: [{ hasEvidence: "E04" }, { asked: "rosa_customer" }] }, { any: [{ flag: "knows_tan_jacket" }, { flag: "saw_jacket" }] }] },
  },
  {
    id: "X_WINDBREAKER",
    characterId: "daniel",
    title: "Daniel Mercer: the windbreaker",
    text: "Daniel Mercer says he does not own a windbreaker. You saw a tan windbreaker on the coat rack in his apartment.",
    when: { all: [{ asked: "daniel_jacket_b" }, { flag: "saw_jacket" }] },
  },
  {
    id: "X_SEDAN",
    characterId: "daniel",
    title: "Daniel Mercer: the car on Hollister Avenue",
    text: "Daniel Mercer says he was at the diner until about 1:00 AM. At 12:10 AM Margaret Ellis saw a dark four-door sedan with a crumpled rear fender parked by Eleanor's house, and Mercer's green Buick has a crumpled rear fender.",
    when: { all: [alibiOnRecord, { asked: "margaret_sedan_more" }, { any: [{ flag: "fender_identified" }, { inspected: "g_orders" }] }] },
  },
  {
    id: "X_ACCOUNTS",
    characterId: "daniel",
    title: "Daniel Mercer: the state of the estate",
    text: "Daniel Mercer says the estate is in excellent order. Eleanor's ledger and the bank's statements disagree.",
    when: { all: [{ asked: "daniel_accounts" }, { deduction: "D_MOTIVE" }] },
  },
  {
    id: "X_DESK",
    characterId: "daniel",
    title: "Daniel Mercer: the conversation at the desk",
    text: "Daniel Mercer describes the 9:15 conversation as a routine question about a statement's format. Patricia Wells says Eleanor had told her she meant to ask him about the statements, and came back from the desk pale.",
    when: { all: [{ asked: "daniel_desk" }, { asked: "patricia_desk" }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  margaret_relationship: "how long have you known eleanor her friends neighbour across the street",
  margaret_evening: "what happened at the party supper dinner that night tell me about the evening",
  margaret_mostly: "what was not pleasant anything happen mostly why",
  margaret_guests: "how was everyone acting other guests behave mood",
  margaret_departure: "when did you leave what time did people go home who left first who was still there",
  margaret_eleanor_mood: "how was eleanor behaving acting how was eleanor did she seem worried upset anything on her mind say anything",
  margaret_daniel: "what about daniel mercer what do you think of him wearing jacket",
  margaret_noise: "were you awake asleep did anything catch your attention after you got back home did you see or hear anything after you went home that night later noise sounds",
  margaret_unusual: "did eleanor lock her doors at night anything unusual about the house back door bolt locks habits",
  margaret_hands: "anyone injured bandage cut hand hurt at supper",
  margaret_screen: "worried about burglars prowlers break in garden window back of the house",
  margaret_sedan_more: "tell me about the car you saw describe what the car looked like what kind of car colour fender details describe the car what did the car look like colour make model which car sedan details",
  margaret_sedan_driver: "did you see who was in the car anyone get in or out driver whose car",
  margaret_confidence: "are you sure about the time how certain clock how do you know it was ten past twelve",
  margaret_struggle: "would you have heard a fight struggle argument screams",
  margaret_money: "did eleanor talk about money finances estate trouble with money",
  daniel_relationship: "how do you know the whitmores harold and eleanor how long have you worked for her what do you do for her",
  daniel_gathering: "tell me about the evening the party supper friday night how did it go",
  daniel_desk: "what did you and eleanor talk about at the desk private conversation nine fifteen aside",
  daniel_departure: "when did you leave eleanor's house what time did you go who left last",
  daniel_evening: "what did you do once you left hollister avenue where did you go next where did you go after where were you that night alibi what did you do after you left",
  daniel_afterwards: "what did you do after the diner after one when did you get home",
  daniel_hand: "what happened to your hand bandage injury cut how did you hurt yourself",
  daniel_hand_when: "when did that happen what time did you cut it gauze pharmacy",
  daniel_accounts: "how are the accounts the estate finances money is everything in order",
  daniel_folder: "the folder is missing from her desk your reports where are the papers",
  daniel_screen: "was she worried about break ins burglars window",
  daniel_suitcase: "going somewhere are you leaving town trip packed bag",
  daniel_jacket_found: "we found the jacket in the trash dumpster police recovered windbreaker",
  daniel_jacket_b: "where is your jacket the windbreaker on the coat rack where did the coat go do you own a windbreaker",
  daniel_alibi_broken: "linda clocked out at eleven who poured your coffee kept your cup filled who served you the waitress was not there your story does not add up",
  daniel_left_early: "you left the diner at eleven the night waitress saw you leave early tan jacket",
  daniel_sedan: "your car was seen outside her house after midnight buick crumpled fender parked",
  daniel_hand_glass: "the blood on the glass your cut hand broken glass",
  daniel_money_confront: "the ledger and bank statements do not match explain the missing money cheques",
  daniel_lawyer_appt: "did you know about her lawyer appointment albright monday",
  daniel_again: "anything else you left out of your statement anything to add",
  robert_relationship: "how do you know the whitmores harold and eleanor how long did you know them",
  robert_evening: "tell me about the evening the party supper friday night what happened",
  robert_departure: "when did you leave what time did you go home",
  robert_cars_night: "what cars were outside parked when you left did you see anyone's car",
  robert_property: "who fixed the bolt who installed put in the lock on the kitchen door how well do you know the house have you worked on the house odd jobs",
  robert_reardoor: "can the back door be opened from outside the yard bolt from outside",
  robert_screen: "how can you tell which side a screen was cut from window screen cut outside inside",
  robert_cars: "does mercer bring his car here what does daniel drive his car fender damage what car does mercer drive what kind of car did you fix mercer's car work on his car",
  robert_buick: "how did he damage the fender how did the fender get dented what did he hit the pole the damage",
  robert_staged: "nobody broke in it was staged the break in was fake",
  robert_again: "anything else you remember about the evening",
  patricia_relationship: "were you close to your aunt what was she like your relationship",
  patricia_evening: "what time did you go home when did you leave tell me about friday night the evening when did you leave what happened",
  patricia_desk: "did anything worry you at the party desk conversation daniel aside nine fifteen",
  patricia_inheritance: "who gets eleanor's money now who inherits the estate the will who gets the money where were you",
  patricia_concerns: "was something bothering her recently troubling her was your aunt worried about anything lately concerns on her mind",
  patricia_money: "did she ask you for help with money bank statements accounts",
  patricia_missing: "the estate folder is missing from her desk drawer papers missing",
  patricia_ledger: "her ledger two columns figures do not agree",
  patricia_more: "how much money is missing how much was taken cheques",
  patricia_lawyer: "she had an appointment with a lawyer albright monday",
  patricia_daniel: "what do you think of daniel mercer how well do you know him",
  patricia_hands: "was anyone injured at supper bandage cut hand",
  patricia_envelope: "the envelope you sent me where did you find this page",
  patricia_circled: "what are the marked lines on the statement circled lines",
  bennett_scene: "what did you find at the scene the crime scene what did police find",
  bennett_interviews: "how did the interviews go the statements what did the guests say",
  bennett_timeline: "what is the timeline when did things happen sequence of events",
  bennett_reports: "what reports have come back lab results coroner reports",
  bennett_send_glass: "send the glass to the lab test the blood on the glass type the blood get it typed lab analysis forensic test the shard",
  bennett_samples: "blood samples from the guests test the guests blood compare the suspects blood everyone's blood type samples from everyone yes get samples",
  bennett_forensics: "when did she die time of death what does the coroner say time of death autopsy cause of death",
  bennett_glass: "the blood on the glass is not hers lab typing second person",
  bennett_hand: "did mercer have an injury bandage when you interviewed him his hand",
  bennett_staged: "the break in was staged nobody came through the window",
  bennett_struggle: "it happened in the living room struggle",
  bennett_alibi: "check the diner waitress linda alibi can you talk to the waitress",
  bennett_sedan: "run the plates check the car registration buick lesabre who owns the car",
  bennett_jacket: "can you search for the jacket windbreaker find the coat search his trash",
  bennett_jacket_where: "where did they find the jacket where was it recovered",
  bennett_jacket_lab: "what did the lab say about the jacket results on the windbreaker",
  bennett_motive: "the money does not add up ledger statements disagree financial motive",
  bennett_lawyer: "she had an appointment with a lawyer albright",
  bennett_again: "anything new any news updates on your side",
  rosa_friday: "were you working friday night your shift who was working",
  rosa_customer: "do you remember a man alone around eleven customer tan jacket serving him did you serve him did you see him who did you serve what did he look like describe him",
  rosa_schedule: "can I see the schedule the staff schedule shift sheet the roster who works when show me the schedule",
  rosa_ticket: "give me the ticket can I have the ticket the check guest check note the spike hand it over can I see it get it for me",
  rosa_return: "did he come back later return that night",
};
for (const q of questions) if (KEYWORDS[q.id]) q.keywords = [KEYWORDS[q.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
