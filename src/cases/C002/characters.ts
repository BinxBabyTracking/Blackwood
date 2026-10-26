import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * C002 interviews, written against docs/C002-timeline.md.
 *
 * Rules for this file: nobody names the culprit or confesses; Gordon Pell's
 * answers are his own account, lies included; nobody states a forensic result
 * that is not in a document; every time agrees with the timeline. Nothing
 * about Laura's captivity goes beyond what she sensed: held, blindfolded,
 * sedated, released.
 */

const arrested: Condition = { flag: "gordon_arrested" };
/** The investigator knows Gordon Pell's name. */
const knowsPell: Condition = { any: [{ hasEvidence: "E14" }, { hasEvidence: "E15" }, { hasEvidence: "E17" }, { talkedTo: "gordon" }] };

export const characters: CharacterDef[] = [
  {
    id: "laura",
    name: "Laura Kessler",
    role: "Taken from 418 Elm Street",
    portrait: "char.laura",
    bio: [
      { text: "Twenty-nine. Teaches music at Mariposa Bay Junior High. Has been with Tom Hale for two years." },
      { text: "Taken from Tom's house at about three on Monday morning, by Tom's account. Missing.", requires: { not: { flag: "laura_home" } } },
      { text: "Released on Wednesday morning in Alamitos Park, Long Beach, two blocks from her sister's apartment.", requires: { flag: "laura_home" } },
    ],
    available: { flag: "laura_home" },
    locationId: "ruth_apartment",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I'm sorry. I only know what I heard and smelled.",
    idleLine: "I've told you everything I can remember. If anything else comes back, Ruth will call you.",
    noAnswer: ["I don't know. I couldn't see anything.", "I'm sorry, I don't remember that.", "I wouldn't know."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman in her late twenties, shaken but steady, a teacher's clear diction. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "shaken", label: "Shaken", requires: { always: true } },
      { id: "steady", label: "Steady", requires: { any: [{ asked: "laura_held" }, { asked: "laura_men" }] }, cue: "Laura has stopped twisting the sleeve of her sweater. She sits up a little straighter." },
      { id: "determined", label: "Determined", requires: { any: [{ hasEvidence: "E11" }, { hasEvidence: "E16" }] }, cue: "Something in Laura has hardened. She wants this finished." },
    ],
  },
  {
    id: "tom",
    name: "Tom Hale",
    role: "Laura's boyfriend, 418 Elm Street",
    portrait: "char.tom",
    bio: [
      { text: "Thirty-one. Land surveyor for the County of Ventura. Owns the house at 418 Elm Street, Mariposa Bay." },
      { text: "Reported the abduction at 1:40 PM on Monday, more than ten hours after it happened. Questioned by Sgt. Ferris into the night." },
      { text: "Asked for his own blood test at County General on Monday evening.", requires: { any: [{ hasEvidence: "E03" }, { asked: "tom_blood" }] } },
    ],
    available: { always: true },
    locationId: "hale_kitchen",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that tells you. I just want to know where she is.",
    idleLine: "I've told you all of it. I've told Ferris all of it. Go and find her.",
    noAnswer: ["I don't know.", "I couldn't tell you that.", "I didn't see. I had tape over my eyes."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man in his early thirties, exhausted, flat and quiet, controlled. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "exhausted", label: "Exhausted", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { any: [{ asked: "tom_delay" }, { asked: "tom_money" }, { presented: "tom:E22" }, { presented: "tom:E21" }] }, cue: "Tom's jaw tightens. He's answered this before, many times." },
      { id: "relieved", label: "Relieved", requires: { flag: "laura_home" }, cue: "Tom looks as if he has slept, for the first time." },
    ],
  },
  {
    id: "ruth",
    name: "Ruth Kessler",
    role: "Laura's sister, your client",
    portrait: "char.ruth",
    bio: [
      { text: "Thirty-four. Bookkeeper at a shipyard in Long Beach. Laura's older sister." },
      { text: "Hired Blackwood on Tuesday morning because, she says, nobody else was looking for Laura." },
      { text: "Laura came to her door on Wednesday morning.", requires: { flag: "laura_home" } },
    ],
    available: { always: true },
    locationId: "ruth_apartment",
    onBoard: true,
    defaultEvidenceReply: "I don't know what to make of that. You're the one who'd know.",
    idleLine: "Find who did this. That's what I'm paying you for.",
    noAnswer: ["I don't know.", "I couldn't tell you.", "That's not something Laura ever told me."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "Woman in her mid thirties, tense, practical, protective older sister. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "anxious", label: "Anxious", requires: { always: true } },
      { id: "hopeful", label: "Hopeful", requires: { callAnswered: "call_nora" }, cue: "Ruth is holding on to something now: her sister's voice on a tape." },
      { id: "relieved", label: "Relieved", requires: { flag: "laura_home" }, cue: "Ruth keeps glancing toward the next room, where her sister is." },
    ],
  },
  {
    id: "ferris",
    name: "Sgt. Walter Ferris",
    role: "Mariposa Bay Police, lead investigator",
    portrait: "char.ferris",
    bio: [
      { text: "Twenty years with the Mariposa Bay Police. Leads the investigation into Laura Kessler's disappearance." },
      { text: "Believes Tom Hale knows more than he says." },
      { text: "Told the press on Wednesday evening that the abduction appears to have been staged.", requires: { hasEvidence: "E11" } },
    ],
    available: { always: true },
    locationId: "police_station",
    onBoard: false,
    defaultEvidenceReply: "That's interesting. It doesn't change what I've got.",
    idleLine: "I've got a desk full of this case and a chief who wants it closed. We're done for now.",
    noAnswer: ["Nothing in my file on that.", "I'm not going to guess about that.", "Ask me something I can answer."],
    voice: {
      voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      direction: "Man in his fifties, small-town police sergeant, blunt and sure of himself, tired. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "dismissive", label: "Dismissive", requires: { always: true } },
      {
        id: "irritated",
        label: "Irritated",
        requires: { any: [{ asked: "ferris_glasses" }, { asked: "ferris_howard" }, { asked: "ferris_hoax" }, { deduction: "D7" }, { presented: "ferris:E23" }] },
        cue: "Ferris drops his pen on the desk. He doesn't like being second-guessed in his own station.",
      },
      {
        id: "reconsidering",
        label: "Reconsidering",
        requires: { any: [arrested, { hasEvidence: "E16" }] },
        cue: "Ferris is quieter now. He has the look of a man rereading his own file.",
      },
    ],
  },
  {
    id: "nora",
    name: "Nora Pruitt",
    role: "Crime reporter, Mariposa Bay Courier",
    portrait: "char.nora",
    bio: [
      { text: "Covers crime and the courts for the Mariposa Bay Courier." },
      { text: "Received a letter and a cassette from 'the crew' on Tuesday afternoon, and three calls to her desk." },
    ],
    available: { always: true },
    known: { callAnswered: "call_nora" },
    locationId: "courier",
    onBoard: false,
    defaultEvidenceReply: "Interesting. Can I quote you on that? No? Then I didn't see it.",
    idleLine: "I've got a deadline. Call me when you've got something I can print.",
    noAnswer: ["I don't know, and I don't print what I don't know.", "No idea.", "That one's not in my notes."],
    voice: {
      voiceId: "SAz9YHcvj6GT2YYXdXww",
      direction: "Woman in her forties, quick, dry, skeptical newspaper reporter. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "guarded", label: "Guarded", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [{ asked: "nora_calls" }, { hasEvidence: "E09" }] }, cue: "Nora has pulled her chair closer. She's interested now." },
      { id: "ally", label: "Ally", requires: { any: [{ hasEvidence: "E11" }, { hasEvidence: "E10" }] }, cue: "Nora is on your side. Her own paper ran the hoax story, and she is angry about it." },
    ],
  },
  {
    id: "howard",
    name: "Howard Lisk",
    role: "Neighbor across Elm Street",
    portrait: "char.howard",
    bio: [
      { text: "Seventy. Retired machinist. Lives across the street from 418 Elm and sleeps badly." },
      { text: "Saw a dark van leave Elm Street without headlights at 3:40 AM on Monday.", requires: { hasEvidence: "E06" } },
    ],
    available: { always: true },
    known: { any: [{ visited: "elm_street" }, { talkedTo: "howard" }] },
    locationId: "elm_street",
    onBoard: true,
    defaultEvidenceReply: "Can't help you with that one. I only know what I saw out my window.",
    idleLine: "That's all I saw. I wrote it down, and I'll stand by it.",
    noAnswer: ["Couldn't tell you.", "Didn't see that.", "I won't say what I didn't see."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man of seventy, a retired machinist, chatty, precise, a little gravelly. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "chatty", label: "Chatty", requires: { always: true } },
      { id: "precise", label: "Precise", requires: { hasEvidence: "E06" }, cue: "Howard has his reading glasses on now. He's taking this seriously." },
    ],
  },
  {
    id: "diane",
    name: "Diane Moss",
    role: "Florist, Oak Terrace",
    portrait: "char.diane",
    bio: [
      { text: "Forty-one. Runs a flower shop in Oak Terrace. Lives alone with a dog." },
      { text: "Fought off a masked intruder in her bedroom at 2:40 AM on Friday, November 4." },
    ],
    available: { flag: "oak_terrace" },
    known: { flag: "oak_terrace" },
    locationId: "moss_house",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I know what was in my bedroom.",
    idleLine: "I've told you what happened. I'm going to go and sit with my dog.",
    noAnswer: ["I don't know.", "I didn't see that.", "I couldn't tell you."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman in her early forties, shaken and angry, plain-spoken. American.",
      settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 },
    },
    demeanor: [
      { id: "shaken", label: "Shaken", requires: { always: true } },
      { id: "angry", label: "Angry", requires: { any: [{ asked: "diane_lamp" }, { asked: "diane_tape" }] }, cue: "Diane's fear has turned into something else." },
      { id: "helpful", label: "Helpful", requires: { any: [{ asked: "diane_laura" }, { hasEvidence: "E17" }] }, cue: "Diane leans in. She wants to help you get him." },
    ],
  },
  {
    id: "gordon",
    name: "Gordon Pell",
    role: "TV and radio repairman, Cabin 14",
    portrait: "char.gordon",
    bio: [
      { text: "Thirty-eight. Repairs televisions, radios and stereos from his mother's cabin at Tamarack Lake." },
      { text: "His mother, Vera Pell, has lived in a care home in Redlands since spring.", requires: { any: [{ asked: "gordon_who" }, { hasEvidence: "E17" }] } },
      { text: "Arrested at Cabin 14 on Monday, November 7, and brought to Mariposa Bay.", requires: arrested },
    ],
    available: { always: true },
    known: knowsPell,
    locationId: "cabin14",
    moves: [{ when: arrested, locationId: "police_station" }],
    onBoard: true,
    defaultEvidenceReply: "Can't say I know anything about that. Sorry.",
    idleLine: "I've got a set on the bench that won't fix itself. You have a good day now.",
    noAnswer: ["Couldn't tell you.", "No idea, friend.", "That's not something I'd know about."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man in his late thirties, soft-spoken, polite and helpful on the surface, careful. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "obliging", label: "Obliging", requires: { always: true } },
      {
        id: "evasive",
        label: "Evasive",
        requires: { any: [{ asked: "gordon_purchases" }, { asked: "gordon_gas" }, { presented: "gordon:E15" }, { asked: "gordon_window" }] },
        idleLine: "I think I've been neighborly enough for one day.",
        cue: "Pell's smile stays where it is, but he has stopped meeting your eyes.",
      },
      {
        id: "cornered",
        label: "Cornered",
        requires: { any: [{ hasEvidence: "E17" }, arrested] },
        idleLine: "I don't have to talk to you.",
        cue: "Pell's hands have gone still. He is thinking very hard.",
      },
      {
        id: "refusing",
        label: "Declining to answer",
        requires: { flag: "gordon_lawyered" },
        refuses: "I'd like a lawyer now. I'm not answering any more questions.",
        cue: "Pell has stopped answering questions.",
      },
    ],
  },
  {
    id: "bennett",
    name: "Det. Frank Bennett",
    role: "LAPD, police contact",
    portrait: "char.bennett",
    bio: [
      { text: "Twenty-five years with LAPD. Not his case and not his town, but he knows Sgt. Ferris and can get things done in other people's jurisdictions." },
      { text: "Reachable by telephone from your office." },
    ],
    available: { flag: "casefile_read" },
    locationId: "office",
    medium: "telephone",
    onBoard: false,
    defaultEvidenceReply: "Read it to me. Over the telephone it doesn't tell me much more than that.",
    idleLine: "That's all I have right now. Call me when you've got something I can run down.",
    noAnswer: ["Nothing on that in what I've got.", "I can't help you there. Find me something and I'll run it down.", "That's not something I've got."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "Middle-aged man, professional, calm, authoritative. American.",
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
  // Tom Hale: flat, exhausted, precise; wrongly suspected
  // =====================================================================
  q("tom", "Laura", "tom_relationship", "How long have you and Laura been together?", [
    "Two years in November. She moved most of her things in last spring. Her piano's still at her old place; it wouldn't fit through my door.",
  ]),
  q("tom", "That night", "tom_night", "Tell me what happened that night.", [
    "We went to bed about a quarter past eleven. I woke up to a flashlight in my face. A man in a mask, with a gun and something that cracked like a shock when he pressed it on my leg.",
    "He tied us with plastic ties, put taped goggles over our eyes, played a tape, and made us drink something. Then I was gone. When I woke up it was twenty to ten and she wasn't there.",
  ], {
    reveals: "Tom says a masked man woke them at about 3 AM, tied and blindfolded them, played a tape, made them drink something and took Laura.",
    effects: [tl("11:15 PM (Sun)", "Tom and Laura go to bed.", "Tom Hale"), tl("~3:05 AM (Mon)", "A masked man wakes Tom and Laura with a flashlight and a stun gun.", "Tom Hale"), tl("9:40 AM (Mon)", "Tom wakes, still tied. Laura is gone.", "Tom Hale")],
  }),
  q("tom", "The intruder", "tom_man", "Describe the man.", [
    "I only saw him for a few seconds before the goggles. Dark clothes, a knit mask, gloves. Not big. Ordinary.",
    "He whispered everything. Every word. I never heard his real voice.",
  ], { reveals: "The intruder wore a knit mask and gloves and only ever whispered." }),
  q("tom", "The intruder", "tom_tape", "What did the recording say?", [
    "A man's voice, flat, with a hiss behind it, like an old tape. It said they were a crew, that they'd been watching the house, that they were professionals. Do what we say and nobody gets hurt. Fight and they'd hurt Laura.",
    "It clicked off at the end. Like somebody pressed stop on a recorder.",
  ], { reveals: "A recorded message said a 'crew' of professionals was watching the house." }),
  q("tom", "The intruder", "tom_others", "Were there others with him?", [
    "That's the thing. He'd say 'Okay, go' toward the hall, like there was somebody out there. Nobody ever answered.",
    "I only ever heard one set of footsteps. One man, walking around my house. I told Ferris that.",
  ], {
    reveals: "Tom heard only one set of footsteps. The man spoke toward the hall but nobody answered.",
  }),
  q("tom", "The intruder", "tom_drink", "What did he make you drink?", [
    "Something in my own kitchen glasses. Sweet, like orange juice, with something bitter under it. He held the glass and made me finish it.",
    "The glasses are still on the nightstand. Nobody took them. I don't think anybody even looked at them.",
  ], { reveals: "The intruder made them drink something sweet and bitter from two kitchen glasses, which are still on the nightstand." }),
  q("tom", "That night", "tom_blood", "Did you see a doctor afterward?", [
    "I asked for a blood test at County General on Monday evening, between Ferris's sessions. I wanted it on paper that he drugged us.",
    "It came back positive. Here. Ferris has a copy too, for all the good it did.",
  ], { volunteer: { near: "drug drugged drink sedative sedated hospital doctor proof believe police lie lying", after: 4, reply: ["And before you ask, I can prove he drugged us. I went to County General on Monday evening and asked for a blood test, between Ferris's sessions.", "It came back positive. Here, take my copy. Ferris has one too, for all the good it did."] },
    reveals: "Tom's blood, drawn at 6:10 PM Monday at his own request, was positive for a sedative.",
    effects: [{ giveEvidence: "E03" }, tl("6:10 PM (Mon)", "Tom's blood is drawn at County General at his own request. Positive for a sedative.", "Tom Hale")],
  }),
  q("tom", "Afterward", "tom_letter", "What did the letter say?", [
    "No police, or they'd know and I'd never see her again. Twelve thousand dollars, six by Tuesday noon. They'd call the house at one o'clock with instructions.",
    "The police have the original. That's their copy on the table.",
  ], { reveals: "The ransom letter demanded $12,000 and promised a call at 1 PM Monday. No call came." }),
  q("tom", "Afterward", "tom_delay", "Why did you wait ten hours to call the police?", [
    "I didn't wait ten hours. I was unconscious for six and a half of them. When I could stand up, I read a letter that said if I called the police she'd die.",
    "So I did what it said. I went to the bank, I sat by the phone, and when one o'clock came and went I called the police. At one forty. I've explained this to Ferris about forty times.",
  ], { reveals: "Tom says he was unconscious until 9:40, then followed the letter's instructions until the promised 1 PM call never came." }),
  q("tom", "Afterward", "tom_money", "Why did you take out two thousand dollars?", [
    "Because that's what I had. The letter wanted six thousand by Tuesday. I thought if they called I'd have something, and I'd ask Ruth and my dad for the rest.",
    "The slip's on the hall table. I wrote it all down on the back. It's all still in the envelope. Ferris can count it.",
  ], { effects: [tl("11:15 AM (Mon)", "Tom withdraws $2,000 at Harbor Federal Savings.", "Tom Hale")] }),
  q("tom", "The house", "tom_door", "How did he get into the house?", [
    "The side door from the garage, I think. I took the trash out that way about twenty to eleven and I don't remember locking it. Laura always checks it. That night she didn't.",
    "There's nothing broken because nothing had to be. That's my fault.",
  ], { reveals: "Tom believes he left the garage side door unlocked after taking out the trash at about 10:40 PM.", effects: [tl("10:40 PM (Sun)", "Tom takes the trash out through the garage and leaves the side door unlocked.", "Tom Hale")] }),
  q("tom", "Laura", "tom_laura", "Tell me about Laura.", [
    "She teaches music at the junior high. Seventh grade band, God help her. She's stubborn and funny and she checks the locks twice.",
    "If anybody could get through this, it's her.",
  ], {
    variants: [{ requires: { flag: "laura_home" }, reply: ["She's at Ruth's. She's home. I talked to her on the phone for an hour. She's stubborn and funny and she checks the locks twice, and she's home."] }],
  }),
  q("tom", "Afterward", "tom_ferris", "How did the police treat you?", [
    "Ferris had me in a room from three in the afternoon to eleven at night. Polygraph at nine the next morning, while I still couldn't walk straight.",
    "He's decided I did something to her. Everything I say just proves it to him.",
  ]),
  q("tom", "Laura", "tom_enemies", "Is there anyone who would want to hurt Laura, or you?", [
    "No. I'm a surveyor. She teaches band. We don't have money. Who would look at this house and think twelve thousand dollars?",
    "That's what I keep coming back to. Why us?",
  ]),
  q("tom", "Evidence", "tom_van", "A neighbor saw a dark van at your curb that night.", [
    "Howard? He's up half the night with his knees. I didn't know he'd seen anything. Nobody told me.",
    "We don't know anybody with a van.",
  ], { requiresEvidence: ["E06"] }),
  q("tom", "Evidence", "tom_hoax", "The police told the press it was staged.", [
    "I saw. My mother called me crying. Laura's back, and they're saying we made it up.",
    "Made up what? The drug in my blood? The ties on my wrists? Ask Ferris what I was supposed to have gained.",
  ], { requiresEvidence: ["E11"] }),
  q("tom", "Evidence", "tom_tape_found", "Deputies found a cassette marked MSG. Is this what you heard?", [
    "That's it. 'You are being visited by a crew. We are professionals.' Word for word. And 'others from our crew are outside.'",
    "There was nobody outside. There was only him.",
  ], { requiresEvidence: ["E20"], reveals: "Tom confirms the 'MSG' cassette is the recording played in his bedroom." }),
  q("tom", "Evidence", "tom_gordon", "Do you know a man named Gordon Pell?", [
    "No. Never heard the name. Who is he?",
  ], { requires: knowsPell }),

  // =====================================================================
  // Ruth Kessler: the client; protective, practical
  // =====================================================================
  q("ruth", "The case", "ruth_hire", "Why did you come to us?", [
    "Because the police have spent a day and a half on Tom, and nobody is looking for my sister. Detective Bennett used to work with my father. He said you'd listen.",
  ]),
  q("ruth", "Laura", "ruth_laura", "Tell me about your sister.", [
    "She's five years younger than me. She teaches music, she plays piano at a church on Sundays, she leaves voice messages that are longer than the call.",
    "She's careful. She checks the locks twice. She'd never just go somewhere without telling me.",
  ]),
  q("ruth", "Laura", "ruth_tom", "What do you think of Tom?", [
    "He's quiet. People think he's cold until they know him. He measures land for a living; he doesn't do drama.",
    "He'd never hurt her. I'd know. She'd have told me.",
  ]),
  q("ruth", "Laura", "ruth_last", "When did you last speak with Laura?", [
    "Sunday afternoon, on the phone, about our mother's birthday on the twenty-second. She sounded completely normal. She was grading band practice sheets.",
  ]),
  q("ruth", "The case", "ruth_police", "What have the police told you?", [
    "Ferris called me Monday night to ask whether Tom had ever hit her. That was the first I heard of any of it.",
    "Nobody has asked me a single question about who else could have done this.",
  ]),
  q("ruth", "The case", "ruth_money", "Could your family pay a ransom?", [
    "Twelve thousand dollars? I'm a bookkeeper. Our mother is on a pension. Tom's a county employee. Nobody in this family has twelve thousand dollars.",
  ]),
  q("ruth", "The case", "ruth_voice", "You heard the cassette at the Courier?", [
    "Over the telephone. It's her. She called me Ruthie. Nobody calls me that but Laura.",
    "She was alive on Monday. I keep holding on to that.",
  ], { requires: { callAnswered: "call_nora" } }),
  q("ruth", "Laura's return", "ruth_return", "How did Laura get here?", [
    "Half past eight on Wednesday morning, a knock. She was standing there in a man's flannel coat, shaking, with her eyes all red from tape. She said someone left her on a bench in the park.",
    "She had those goggles in her pocket. She wouldn't let go of them.",
  ], { requires: { flag: "laura_home" } }),
  q("ruth", "Laura's return", "ruth_statement", "Did Laura give the police a statement?", [
    "Ferris came for ten minutes and asked her whether Tom had ever hit her. Then he left.",
    "So I sat her down and typed everything she remembered, every detail, and she signed it. Ask her for it.",
  ], { requires: { flag: "laura_home" } }),
  q("ruth", "Evidence", "ruth_hoax", "The police are calling it a hoax.", [
    "I read it. My sister comes home with tape marks on her face and the police say she made it up.",
    "Prove them wrong. Please.",
  ], { requiresEvidence: ["E11"] }),

  // =====================================================================
  // Laura Kessler: what she heard and smelled; never more
  // =====================================================================
  q("laura", "That night", "laura_night", "What do you remember of that night?", [
    "A light, a man whispering, ties on my wrists. Then the goggles. A tape played. He made us drink something sweet.",
    "I remember saying Tom's name, and being carried. That's all, until the van.",
  ]),
  q("laura", "Where she was held", "laura_held", "Where were you held?", [
    "I never saw it. But I wrote down everything I heard and smelled, all of it, while it was fresh. Ruth typed it and I signed it.",
    "Here. It's better than anything I can tell you now.",
  ], { volunteer: { near: "where held kept place room house taken happened remember", after: 1 },
    reveals: "Laura has given you her written statement: a long drive, climbing, pines and woodsmoke, a small room, one man.",
    effects: [{ giveEvidence: "E12" }],
  }),
  q("laura", "Where she was held", "laura_drive", "How long was the drive?", [
    "Three hours, maybe. For the second half we were climbing. My ears popped more than once. When the door opened the air was cold and smelled of pine trees and woodsmoke.",
    "Going home was shorter, and all downhill.",
  ], { reveals: "Laura was driven about three hours, climbing for the second half, to somewhere cold with pines and woodsmoke." }),
  q("laura", "Where she was held", "laura_room", "Describe the place you were kept.", [
    "A small room with carpet. A space heater that ticked. A radio or a television always on low in the next room.",
    "And a smell. Hot dust, and burnt solder, like my father's workbench when he fixed the stereo.",
  ], { reveals: "The house where Laura was kept smelled of hot dust and burnt solder, like an electronics workbench." }),
  q("laura", "Where she was held", "laura_men", "How many people were there?", [
    "One. I'm sure of it. He'd say things like 'the others want to know if you're eating' or 'I'll tell the crew'. But I never heard another voice, another car, another set of feet.",
    "One man, pretending to be several.",
  ], { reveals: "Laura is certain only one man was there, though he talked about 'the crew'." }),
  q("laura", "Where she was held", "laura_tape", "Tell me about the recording you made.", [
    "On Monday he lifted the goggles a little at the bottom and held a newspaper under a lamp so I could read the headline. Then he recorded me saying the date.",
    "While I was talking, a whistle went off outside. Long and steady, like a factory.",
  ], { reveals: "On Monday, while Laura read a headline into a recorder, a long, steady whistle sounded outside." }),
  q("laura", "Where she was held", "laura_whistle", "When did you hear the whistle?", [
    "Monday, while he was recording. And again on Tuesday, at the same time, around midday. Then not on Wednesday, because we left before dawn.",
    "It sounded like a factory or a mill letting out.",
  ], { requires: { any: [{ asked: "laura_tape" }, { hasEvidence: "E08" }, { hasEvidence: "E12" }] }, reveals: "The whistle sounded around midday on both Monday and Tuesday." }),
  q("laura", "Where she was held", "laura_goggles", "What did he put over your eyes?", [
    "Swim goggles with black tape all over the lenses. Children's goggles, I think; the strap's too small. There's a little gap at the bottom of one where I could see light.",
    "I still have them. I couldn't throw them away. Take them.",
  ], { volunteer: { near: "eyes see saw blindfold goggles face", after: 4 }, reveals: "Laura has given you the taped swim goggles she wore.", effects: [{ giveEvidence: "E13" }] }),
  q("laura", "Release", "laura_release", "How were you released?", [
    "Early Wednesday he put me back in the van. We drove downhill for a long time. He walked me a little way, sat me on a bench, and told me to count to three hundred before I took the goggles off.",
    "When I did, I was in Alamitos Park, two blocks from Ruth's. I walked to her door.",
  ], { effects: [tl("8:10 AM (Wed)", "Laura is left on a bench in Alamitos Park, Long Beach.", "Laura Kessler")] }),
  q("laura", "That night", "laura_voice", "Would you know the man's voice?", [
    "He only ever whispered. I'd know the whisper. I'd know the smell of that room.",
    "I never saw his face. I won't say I did.",
  ]),
  q("laura", "Afterward", "laura_ferris", "Did the police ask you what happened?", [
    "Sergeant Ferris came to Ruth's for ten minutes. He asked whether Tom had ever hit me and whether we needed money.",
    "He didn't ask where I'd been.",
  ]),
  q("laura", "Evidence", "laura_hoax", "The police told the press it was staged.", [
    "I know. My students' parents read that paper.",
    "I want you to find the room I was in. Then let them say it.",
  ], { requiresEvidence: ["E11"] }),
  q("laura", "Evidence", "laura_oak", "A woman in Oak Terrace was attacked the same way.", [
    "A tape player telling her a crew was watching? That's him. That's exactly him.",
    "Is she all right? She fought him? Good.",
  ], { requiresEvidence: ["E16"] }),
  q("laura", "Evidence", "laura_gordon", "A man named Gordon Pell has been arrested.", [
    "I never saw his face. I can't tell you it was him, and I won't.",
    "But if his house smells of solder and he has a space heater that ticks, you'll know what I know.",
  ], { requires: arrested }),

  // =====================================================================
  // Sgt. Walter Ferris: the hoax theory, until he can't hold it
  // =====================================================================
  q("ferris", "The investigation", "ferris_case", "What's your read on this case?", [
    "No forced entry. A ten-hour delay. Two thousand dollars in cash the same morning. A boyfriend who doesn't shed a tear. And no ransom call at the time the letter promised.",
    "Twenty years on the job, the simple answer is usually the right one. Something happened in that house between those two people.",
  ], {
    variants: [
      { requires: { flag: "laura_home" }, reply: ["She's back, isn't she? Walked up to her sister's door without a scratch. No ransom paid. Kidnappers don't do that.", "I think those two cooked this up, or he did something and she's covering for him. Either way, it's not what they say it is."] },
      { requires: arrested, reply: ["I'm holding a man from Tamarack Lake I'd never heard of a week ago. You can guess how I feel about my own file right now."] },
    ],
  }),
  q("ferris", "The investigation", "ferris_statement", "Can I see Tom Hale's statement?", [
    "Bennett vouches for you, so all right. Here's his statement, with my notes. Read the notes.",
  ], { volunteer: { after: 2, reply: ["Look, don't take my word for it. Bennett vouches for you, so here's Hale's statement, with my notes. Read the notes."] }, reveals: "Sgt. Ferris has given you Tom Hale's statement, with his own notes added.", effects: [{ giveEvidence: "E05" }] }),
  q("ferris", "The investigation", "ferris_polygraph", "How did the polygraph go?", [
    "Inconclusive. Here's the summary. It doesn't clear him.",
    "The examiner wants to blame the sedative. I'd want to know who gave it to him.",
  ], { reveals: "The polygraph was inconclusive; the examiner put it down to sedation and lack of sleep.", effects: [{ giveEvidence: "E21" }] }),
  q("ferris", "The investigation", "ferris_entry", "Any sign of forced entry?", [
    "Not a scratch on a door, a window or a lock. Now, does a gang of professionals walk in without picking a lock?",
  ], {
    variants: [{ requires: { asked: "tom_door" }, reply: ["Not a scratch. He says he left the garage door open. Convenient.", "If you leave your door open, sure, anybody can walk in. Or nobody did."] }],
  }),
  q("ferris", "The investigation", "ferris_school", "Did anyone try to reach the house that morning?", [
    "The junior high called twice, at twenty past eight and quarter to nine, when she didn't show for class. Nobody picked up.",
    "Which means he wasn't answering the phone. You can read that whichever way you like.",
  ]),
  q("ferris", "Evidence", "ferris_glasses", "Why didn't you take the glasses from the bedroom?", [
    "We photographed the bedroom. Two glasses on a nightstand aren't evidence of anything but somebody being thirsty.",
    "If you want to waste a lab's time on them, go ahead.",
  ], { requiresEvidence: ["E02"] }),
  q("ferris", "Evidence", "ferris_blood", "Tom's blood shows a sedative.", [
    "It shows he had a sedative in him by six at night. Not who gave it to him. A man can take a sleeping pill.",
  ], { requiresEvidence: ["E03"] }),
  q("ferris", "Evidence", "ferris_howard", "A neighbor gave your officer a note about a van that night.", [
    "What note? Nobody gave me a note.",
    "I'll have a word with patrol. It doesn't change the rest of it.",
  ], { requiresEvidence: ["E06"], reveals: "Howard Lisk's note about the van never reached Sgt. Ferris." }),
  q("ferris", "Evidence", "ferris_letters", "The Courier received a letter and a tape from 'the crew'.", [
    "Pruitt called me. A typed letter and a tape of the girl saying she's fine. Anybody can type a letter. Anybody can make a tape of themselves.",
    "It's part of the act.",
  ], { requiresEvidence: ["E07"] }),
  q("ferris", "Evidence", "ferris_trace", "The calls to the Courier came from a payphone at Tamarack Lake.", [
    "Then somebody has a friend in the mountains. That's two hundred miles from here.",
    "It's not my county and it's not my problem.",
  ], { requiresEvidence: ["E09"] }),
  q("ferris", "Evidence", "ferris_hoax", "You told the press this was staged.", [
    "I told the press what the evidence showed. No entry, no call, no ransom paid, the girl home without a scratch.",
    "The chief wanted it said. I said it.",
  ], { requiresEvidence: ["E11"], effects: [tl("5:00 PM (Wed)", "Sgt. Ferris tells reporters the abduction appears staged.", "Sgt. Ferris")] }),
  q("ferris", "Evidence", "ferris_lab", "The lab found the same sleep preparation in both glasses, and the glasses were wiped.", [
    "Both glasses. Wiped.",
    "All right. That's not nothing. Wiped is not a word I like.",
  ], { requiresEvidence: ["E23"] }),
  q("ferris", "Evidence", "ferris_oak", "A woman in Oak Terrace was attacked the same way.", [
    "Bennett sent me that report. Stun gun, cable ties, a tape player and a thermos.",
    "I've been in this job twenty years. I know what a pattern looks like. I just didn't want this to be one.",
  ], { requiresEvidence: ["E16"] }),
  q("ferris", "Evidence", "ferris_gordon", "How is Gordon Pell answering your questions?", [
    "Polite as a church usher. Says he was home every night of his life and his van's been in the shop since September.",
    "He has a cut on his head he says came from a tailgate.",
  ], { requires: arrested }),
  q("ferris", "Evidence", "ferris_typewriter", "The three letters were typed on the Smith-Corona from Cabin 14.", [
    "I had those letters on Tuesday. I filed them under 'the act'.",
    "I'll be calling the Courier myself. The department is withdrawing the statement. Write that down, since you'll want to.",
  ], { requiresEvidence: ["E19"], reveals: "Sgt. Ferris says the department will withdraw its hoax statement." }),

  // =====================================================================
  // Nora Pruitt: the reporter; skeptical, quick
  // =====================================================================
  q("nora", "The package", "nora_package", "Tell me about the package.", [
    "Came in the afternoon mail, addressed to me by name, typed. A letter and a cassette. Postmarked San Bernardino, Monday.",
    "They're on my desk. Look, don't touch. I'm holding them for the police whenever the police decide they want them.",
  ]),
  q("nora", "The package", "nora_calls", "Did anyone contact you besides the letter?", [
    "Three phone calls to my desk on Tuesday afternoon. Quarter past three, ten to four, twenty past four.",
    "The first two started with a tape: 'Print the story tonight. The crew is waiting.' The last one was a live man, whispering. He asked if the police had been here and if the tape was clear enough.",
  ], { volunteer: { near: "else anything call called calls phone contact heard caller crew", after: 1, reply: ["There's something else you should know, and the police haven't asked. Three phone calls came to my desk this afternoon, at quarter past three, ten to four and twenty past four.", "The first two started with a tape: 'Print the story tonight. The crew is waiting.' The last one was a live man, whispering. He asked if the police had been here, and if the tape was clear enough."] }, reveals: "Three calls reached Nora's desk on Tuesday afternoon: two began with a tape, the third was a whispering man.", effects: [tl("3:15 PM (Tue)", "First of three calls to Nora Pruitt's desk. The caller plays a tape.", "Nora Pruitt")] }),
  q("nora", "The package", "nora_voice", "Describe the caller.", [
    "On the tape, a flat man's voice, like a radio announcer with a cold. Live, a whisper. Same man, I'd bet.",
    "On the last call I heard coins drop twice, wind, and a truck going by on gravel. That's not a city phone booth.",
  ], { requires: { asked: "nora_calls" } }),
  q("nora", "The package", "nora_tape", "What do you make of the tape?", [
    "It's her. Her sister heard it and broke down. She reads Monday's headline from the Los Angeles Daily Star. That's a morning paper; it's sold all over Southern California.",
    "And there's a whistle at the end. Long, steady. Not a train. Somebody should find out what that is.",
  ]),
  q("nora", "The package", "nora_crew", "Do you think there's a crew?", [
    "I've covered two kidnappings. Professionals don't write to reporters to explain themselves.",
    "This reads like one man who very badly wants to be taken seriously.",
  ]),
  q("nora", "The package", "nora_ferris", "What did the police say about the package?", [
    "Ferris said it was part of the act, and he'd send someone for it. Nobody has come.",
  ]),
  q("nora", "The package", "nora_printed", "Did you print the story?", [
    "Tuesday night's edition, page one: 'Teacher Missing; Group Claims Responsibility.' My editor cut half of it.",
  ]),
  q("nora", "Later", "nora_letter2", "You said a second letter came.", [
    "Thursday morning. Postmarked San Bernardino again, Wednesday. It says they let her go, and it says how they did it: the shock, the tape, the orange juice.",
    "Somebody who wanted to make it up would have to know all that. Here. It's yours.",
  ], { requires: { flag: "letter2_waiting" }, reveals: "Nora has given you the second letter from 'the crew'.", effects: [{ giveEvidence: "E10" }] }),
  q("nora", "Later", "nora_hoax", "Your paper ran the hoax story.", [
    "My paper ran Ferris's press conference. On the front page, with my name under the other story on page four.",
    "I'd like to write the one that comes after it. Find me something.",
  ], { requiresEvidence: ["E11"] }),
  q("nora", "Later", "nora_oak", "There was a break-in in Oak Terrace with a tape player and a crew.", [
    "Oak Terrace. Same tape, same crew. And this time she fought back.",
    "I'm not printing it until you tell me I can.",
  ], { requiresEvidence: ["E16"] }),

  // =====================================================================
  // Howard Lisk: the neighbor; chatty, exact
  // =====================================================================
  q("howard", "That night", "howard_night", "Did you see anything that night?", [
    "I did, and I wrote it down. I keep a sleep log for my doctor. Anything that wakes me goes in it.",
    "A van at their curb at three, gone at twenty to four with its lights off. Here's the page. I gave a copy to a young officer on Monday and never heard a thing.",
  ], { reveals: "Howard Lisk saw a dark van at Tom's curb from about 3:00 to 3:40 AM; it left with its lights off.", effects: [{ giveEvidence: "E06" }, tl("3:40 AM (Mon)", "A dark van pulls away from 418 Elm with no headlights. Plate begins 2K.", "Howard Lisk")] }),
  q("howard", "About Howard", "howard_sleep", "Why were you up at that hour?", [
    "Knees. Forty years on a lathe. I was up at five to three for aspirin, and I sit at the front window till it kicks in.",
  ]),
  q("howard", "That night", "howard_van", "Describe the van.", [
    "Full-size. Dark blue or black, hard to say under the streetlight. No windows down the side, no ladder rack, so not a tradesman's.",
    "Engine had a rough idle when it started. A Ford six, if I had to bet. I worked on enough of them.",
  ], { requires: { asked: "howard_night" } }),
  q("howard", "That night", "howard_driver", "Did you see who was driving?", [
    "One man, I think. A cap. I went to the kitchen for water and when I came back he was pulling away. I'm sorry for that now.",
  ], { requires: { asked: "howard_night" } }),
  q("howard", "That night", "howard_plate", "How sure are you of the plate?", [
    "Two K. California. Sure as I'm standing here. He passed under the light at the corner of Third and that's when I got it. The rest was too quick.",
  ], { requires: { asked: "howard_night" }, reveals: "Howard is sure the van's California plate began 2K." }),
  q("howard", "Neighbors", "howard_couple", "What do you know about Tom and Laura?", [
    "Good kids. She plays the piano Sunday nights with the window open. He fixed my gate and wouldn't take a dime.",
    "Never heard a raised voice from that house. Not once.",
  ]),
  q("howard", "That night", "howard_police", "What happened when you told the police?", [
    "A young fellow in uniform came to the door Monday at four. I gave him a copy of the page. He said a detective would call.",
    "Nobody called.",
  ], { requires: { asked: "howard_night" } }),
  q("howard", "Evidence", "howard_vanfound", "A dark blue Ford van with plate 2KXL418 has turned up.", [
    "Two K, dark blue, a Ford. That's what I wrote down.",
    "I'd like that young officer to read my note again.",
  ], { requires: { any: [{ hasEvidence: "E18" }, { inspected: "cb_van" }] } }),

  // =====================================================================
  // Diane Moss: Oak Terrace; fought him off
  // =====================================================================
  q("diane", "That night", "diane_night", "Tell me what happened.", [
    "Twenty to three. A flashlight in my face, a man in a ski mask with a gun and one of those shock things. He whispered at me to roll over. He had black plastic ties.",
    "Then a little tape player on my nightstand started talking.",
  ], { effects: [tl("2:40 AM (Nov 4)", "Diane Moss wakes to a masked man in her bedroom.", "Diane Moss")] }),
  q("diane", "That night", "diane_tape", "What did the tape player say?", [
    "A crew was watching the house. Resistance would be punished. In this voice like a radio announcer on a bad tape.",
    "It was so stupid. Like a play he'd rehearsed.",
  ], { reveals: "The Oak Terrace intruder played a tape saying a crew was watching the house." }),
  q("diane", "That night", "diane_lamp", "How did you get away?", [
    "I grabbed the lamp off the nightstand and hit him on the head with it as hard as I've ever hit anything. He went down on one knee and he was bleeding.",
    "He dropped the ties and the shock thing, grabbed his tape player, and ran out the back.",
  ], { reveals: "Diane hit the intruder on the head with a ceramic lamp; he was bleeding when he fled." }),
  q("diane", "That night", "diane_man", "Describe the man.", [
    "Not big. Gloves, a dark ski mask, a dark jacket. He smelled like coffee.",
    "And he was careful. Polite, almost. That was the worst part.",
  ]),
  q("diane", "That night", "diane_door", "How did he get in?", [
    "The garage side door. I take the trash out that way on Thursday nights and I don't always lock it.",
    "He knew that. He'd been watching. My dog was at the kennel that week. He knew that too.",
  ], { reveals: "The intruder came in through Diane's unlocked garage side door, on a night her dog was away." }),
  q("diane", "That night", "diane_thermos", "He brought a thermos?", [
    "A steel thermos. The police said it was full of something orange and sweet. He wanted me to drink it.",
  ]),
  q("diane", "That night", "diane_pager", "Did he leave anything behind?", [
    "A pager. It fell out of his jacket by the side gate when he ran. The police took it.",
    "You'd think a man that careful would have checked his pockets.",
  ], { reveals: "A pager fell from the intruder's jacket in Diane's side yard." }),
  q("diane", "Evidence", "diane_laura", "A woman in Mariposa Bay was taken the same way in October.", [
    "The schoolteacher? The one the paper said made it up?",
    "Oh my God. She didn't make it up, did she.",
  ], { requires: { any: [{ hasEvidence: "E12" }, { hasEvidence: "E11" }, { talkedTo: "laura" }] } }),

  // =====================================================================
  // Gordon Pell: his own account, lies included. Nothing here confesses.
  // =====================================================================
  q("gordon", "Himself", "gordon_who", "Who are you?", [
    "Gordon Pell. I fix televisions, radios, stereos, anything with a tube or a transistor. This is my mother's place. She's in a home down in Redlands now.",
    "If you've got a set that needs looking at, I do house calls on the mountain.",
  ]),
  q("gordon", "Himself", "gordon_week", "Where were you on the night of October 9th?", [
    "Right here. I'm here every night. I haven't been down the hill in a month, maybe more.",
    "Why do you ask?",
  ], { reveals: "Gordon Pell says he was home that night and hasn't been down the mountain in a month." }),
  q("gordon", "Himself", "gordon_van", "Whose van is that under the tarp?", [
    "My mother's old Ford. It's been in the shop since September, transmission. Well, it's back from the shop, but it doesn't run. I keep the tarp on it for the pine needles.",
  ], { requires: { inspected: "cb_van" }, reveals: "Gordon Pell says his mother's van hasn't run since September." }),
  q("gordon", "Himself", "gordon_phone", "Do you use the payphone at the store?", [
    "Everybody does. There's no phone line out this far on the north shore. I take my calls at the store.",
  ]),
  q("gordon", "Himself", "gordon_laura", "Do you know Laura Kessler?", [
    "Can't say I do. Should I?",
  ], {
    variants: [{ requires: { hasEvidence: "E11" }, reply: ["Isn't she the girl in the paper? The one they say made the whole thing up?", "I don't read the Mariposa paper. Somebody left one at the store."] }],
  }),
  q("gordon", "The store", "gordon_purchases", "You bought cable ties, cassettes, electrical tape and duct tape on October 6th.", [
    "I'm a repairman. I tie off wiring with cable ties. I record test tones on blank tapes. Electrical tape is half my job.",
    "You'd find the same in any repairman's account.",
  ], { requiresEvidence: ["E15"] }),
  q("gordon", "The store", "gordon_gas", "You signed for eighteen gallons of gas at 7:50 on Monday morning.", [
    "That's for the generator. When the power goes out up here, it goes out for days.",
  ], { requiresEvidence: ["E15"], reveals: "Gordon Pell says the 18.4 gallons of gas on Monday morning were for his generator." }),
  q("gordon", "The store", "gordon_quarters", "You bought a roll of quarters at 3:05 on Tuesday afternoon.", [
    "For the laundromat in Big Bear. Ten dollars of quarters doesn't go far.",
  ], { requiresEvidence: ["E15"] }),
  q("gordon", "The store", "gordon_ribbon", "You bought a Smith-Corona typewriter ribbon.", [
    "I type my invoices. People like a typed invoice. Is that a crime now?",
  ], { requiresEvidence: ["E15"] }),
  q("gordon", "The cabin", "gordon_window", "Why is the back window boarded up from the inside?", [
    "Broke it in a windstorm. Glass is expensive and it's a long way to the glazier.",
  ], { requires: { inspected: "cb_window" } }),
  q("gordon", "Oak Terrace", "gordon_oak", "Where were you early on Friday, November 4th?", [
    "Asleep. Here. Where else would I be?",
  ], { requiresEvidence: ["E16"] }),
  q("gordon", "Oak Terrace", "gordon_pager", "Your mother's pager was found in a yard in Oak Terrace.", [
    "My mother's pager? She hasn't used a pager in her life. She's in a home.",
    "I don't know anything about a pager.",
  ], { requiresEvidence: ["E17"], reveals: "Gordon Pell says he knows nothing about a pager in his mother's name." }),
  q("gordon", "Oak Terrace", "gordon_head", "How did you cut your head?", [
    "Hit it on the tailgate of the van. Stupid. Bled like anything.",
  ], { requires: arrested }),
  q("gordon", "The search", "gordon_mask", "Deputies found a ski mask in your cabin with blood inside it.", [
    "I want a lawyer. I'm not saying anything else.",
  ], { requiresEvidence: ["E18"], effects: [{ setFlag: "gordon_lawyered" }] }),

  // =====================================================================
  // Det. Frank Bennett: the telephone; gets things done, no theories
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of Ferris's file?", [
    "Ferris has a boyfriend, a delay and two thousand dollars. That's a theory, not a case.",
    "What bothers me is what's not in the file. Nobody bagged anything in the bedroom. Nobody canvassed the street. Start there.",
  ], {
    repeatable: true,
    variants: [
      { requires: { flag: "laura_home" }, reply: ["She's home, so Ferris thinks he's proved his point. He's proved she's alive. That's all.", "Somebody drove her a long way and back. Find out where."] },
      { requires: arrested, reply: ["You've got a man in custody and a sergeant rereading his own file. Now write it up so it holds."] },
    ],
  }),
  q("bennett", "The case", "bennett_ferris", "Tell me about Sgt. Ferris.", [
    "Twenty years in a small department. Honest. Stubborn. Decides early, and once he's decided, everything fits.",
    "He'll come around if you give him something he can't explain away.",
  ]),
  q("bennett", "Lab", "bennett_send_glasses", "Can you get the two glasses from the bedroom to a lab?", [
    "I can. Ventura County's lab owes me a favor. I'll have them picked up from the house today.",
    "I'll ask what dried in them and whether anybody left prints. Results to your desk.",
  ], { requiresEvidence: ["E02"], effects: [{ startLab: "glasses" }] }),
  q("bennett", "Lab", "bennett_lab_glasses", "The lab found a sleep preparation in both glasses, and they'd been wiped.", [
    "Both glasses, same thing, and wiped. Somebody made two people drink, then cleaned up after himself.",
    "Put that next to the boyfriend's blood test and see what you've got.",
  ], { requiresEvidence: ["E23"] }),
  q("bennett", "Requests", "bennett_whistle", "What makes a long, steady whistle at midday?", [
    "A factory, or a mill. Lumber mills up in the mountains still blow a noon whistle so the crews know when to eat.",
    "Find the place with the whistle and you've found the neighborhood.",
  ], { requiresEvidence: ["E08"] }),
  q("bennett", "Requests", "bennett_plate", "Can you run a partial plate, California, beginning 2K?", [
    "Do you know how many plates in this state start with 2K? Give me a place, or more letters, and I'll narrow it.",
  ], { requiresEvidence: ["E06"] }),
  q("bennett", "Requests", "bennett_plate_full", "Run California plate 2KXL418.", [
    "2KXL418. A 1979 Ford Econoline van, dark blue. Registered to a Vera M. Pell, Cabin 14, Tamarack Lake. Registration lapsed in August.",
    "Pell. Hang on to that name.",
  ], { requires: { inspected: "cb_van" }, reveals: "Plate 2KXL418 is a dark blue 1979 Ford Econoline registered to Vera M. Pell, Cabin 14, Tamarack Lake." }),
  q("bennett", "Requests", "bennett_pager", "Can you find out who owns the pager from Oak Terrace?", [
    "Already did. The paging company in San Bernardino read me the account over the phone. I'll send you a copy.",
    "Account holder Vera M. Pell, Cabin 14, Tamarack Lake. The contact number is the payphone outside the general store. And Mrs. Pell has been in a care home in Redlands since spring.",
  ], { requiresEvidence: ["E16"], reveals: "The Oak Terrace pager is registered to Vera M. Pell, Cabin 14, Tamarack Lake, who lives in a care home.", effects: [{ giveEvidence: "E17" }] }),
  q("bennett", "Requests", "bennett_vera", "Who is Vera Pell?", [
    "Seventy-four, widowed, in a care home in Redlands since April. One son, Gordon, thirty-eight, lives at the cabin and fixes televisions.",
    "No record on him that I can find. Which means nothing either way.",
  ], { requiresEvidence: ["E17"] }),
  q("bennett", "Lab", "bennett_send_typewriter", "Can the sheriff's lab compare the three letters with the typewriter from the cabin?", [
    "Ferris has the kitchen letter and Pruitt has the other two. I'll get all three to San Bernardino with the Smith-Corona.",
    "Results to your desk.",
  ], { requiresEvidence: ["E18"], effects: [{ startLab: "typewriter" }] }),
  q("bennett", "Lab", "bennett_typewriter", "The three letters were typed on the typewriter from Cabin 14.", [
    "One machine. The kitchen table and both letters to the paper.",
    "It names the machine, not the man. You've got the rest of the man.",
  ], { requiresEvidence: ["E19"] }),
  q("bennett", "The case", "bennett_hoax", "Ferris told the press it was staged.", [
    "I read it. I called him. He thinks I'm sentimental.",
    "Give him something he can't explain.",
  ], { requiresEvidence: ["E11"] }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "glasses" }, reply: ["The glasses are at Ventura County's lab. When they're done, it'll be on your desk."] },
      { requires: { labReady: "glasses" }, reply: ["The lab's report on the glasses is on your desk, if you haven't read it."] },
      { requires: { hasEvidence: "E16" }, reply: ["Oak Terrace has me thinking. Ask me about that pager."] },
      { requires: arrested, reply: ["Pell's at Mariposa Bay with Ferris. The deputies' inventory is the best reading you'll do this year."] },
    ],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  r("tom", "E04", ["I've read that a hundred times. 'We are a crew.' I keep waiting for the crew."]),
  r("tom", "E22", ["That's my handwriting on the back. I was going to ask Ruth and my dad for the other four thousand."]),
  r("tom", "E06", ["Howard saw it? A van. At three. Nobody told me."]),
  r("tom", "E21", ["I couldn't stand up straight. They strapped me to a machine anyway."]),
  r("tom", "E20", ["That's it. That's the tape. Word for word."], { reveals: "Tom confirms the 'MSG' cassette is the recording played in his bedroom." }),
  r("tom", "E11", ["Ask Ferris what I was supposed to have gained."]),
  r("ruth", "E08", ["That's her. 'Ruthie.' Nobody calls me that but Laura."]),
  r("ruth", "E11", ["My sister came home with tape marks on her face."]),
  r("ruth", "E13", ["She had those in her pocket when she knocked. She wouldn't let go of them."]),
  r("laura", "E13", ["Those are them. There's the little gap at the bottom. That's where the light came in."]),
  r("laura", "E08", ["That's me. I didn't know if anyone would ever hear it."]),
  r("laura", "E14", ["A repairman? The solder. That smell was everywhere."], { reveals: "Shown the repair card, Laura connects it to the smell of solder in the place she was held." }),
  r("laura", "E16", ["A tape player telling her a crew was watching. That's him."]),
  r("laura", "E18", ["A space heater. A soldering iron. A mattress on the floor.", "I never saw the room. But that's the room."]),
  r("ferris", "E03", ["It shows he had a sedative in him. It doesn't show who gave it to him."]),
  r("ferris", "E06", ["Nobody gave me this. I'll be talking to patrol."]),
  r("ferris", "E23", ["Both glasses. Wiped. All right. I'm listening."]),
  r("ferris", "E09", ["Tamarack Lake. That's not even our county."]),
  r("ferris", "E11", ["I said what the evidence showed at the time."]),
  r("ferris", "E16", ["Stun gun, ties, a tape and a thermos. I can read."]),
  r("ferris", "E19", ["One typewriter. I had those letters on Tuesday."]),
  r("nora", "E09", ["Tamarack Lake. Wind and gravel. That's what I heard."]),
  r("nora", "E11", ["Page one. My byline's on page four."]),
  r("howard", "E18", ["Two K. Dark blue. A Ford. Like I wrote."]),
  r("diane", "E20", ["That's what it said. 'A crew.' That voice."]),
  r("diane", "E13", ["Goggles with tape on them. He had something black in his other hand. I thought it was a glove."]),
  r("gordon", "E15", ["Lots of people sign that ledger. I'm a repairman. That's repair supplies."]),
  r("gordon", "E14", ["That's my card. Fair prices. You need something fixed?"]),
  r("gordon", "E09", ["Everybody uses that phone. There's no line out to the north shore."]),
  r("gordon", "E17", ["That's my mother's name. She's in a home.", "I don't know anything about a pager."]),
  r("gordon", "E18", ["I'd like a lawyer now."], { effects: [{ setFlag: "gordon_lawyered" }] }),
  r("gordon", "E19", ["Lots of people have Smith-Coronas. I want a lawyer."], { effects: [{ setFlag: "gordon_lawyered" }] }),
  r("gordon", "E20", ["I record test tones on those. I want a lawyer."], { effects: [{ setFlag: "gordon_lawyered" }] }),
  r("bennett", "E02", ["Two glasses on a nightstand that nobody bagged. Ask me to get them to a lab."]),
  r("bennett", "E08", ["A whistle at the end. Find out what blows a whistle at noon."]),
  r("bennett", "E09", ["A phone booth, not a man. But it's a long way from Elm Street."]),
  r("bennett", "E16", ["Read what fell out of his jacket. Then ask me about it."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_VAN",
    characterId: "gordon",
    title: "Gordon Pell: the van",
    text: "Gordon Pell says his mother's van has not run since September. The store ledger shows him signing for 18.4 gallons of gas at the pump at 7:50 AM on Monday, October 10.",
    when: { all: [{ asked: "gordon_van" }, { hasEvidence: "E15" }] },
  },
  {
    id: "X_DOWNHILL",
    characterId: "gordon",
    title: "Gordon Pell: down the hill",
    text: "Gordon Pell says he hasn't been down the mountain in a month. Letters typed in capitals were mailed from San Bernardino on October 10 and 12, and a pager on his mother's account was found in Oak Terrace on November 4.",
    when: { all: [{ asked: "gordon_week" }, { hasEvidence: "E17" }, { any: [{ hasEvidence: "E07" }, { hasEvidence: "E10" }] }] },
  },
  {
    id: "X_GENERATOR",
    characterId: "gordon",
    title: "Gordon Pell: the gas",
    text: "Gordon Pell says the 18.4 gallons of gas on Monday morning were for a generator. The ledger records it at pump 2, the vehicle pump.",
    when: { all: [{ asked: "gordon_gas" }, { inspected: "ts_ledger" }] },
  },
  {
    id: "X_PATROL",
    characterId: "ferris",
    title: "Sgt. Ferris: no witnesses",
    text: "Sgt. Ferris's file has no witness on Elm Street. Howard Lisk gave a patrol officer a note about a van at 418's curb on Monday at 4 PM.",
    when: { all: [{ asked: "ferris_case" }, { hasEvidence: "E06" }] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  tom_relationship: "how long have you been together how did you meet your relationship girlfriend dating",
  tom_night: "what happened that night tell me everything sunday night monday morning what happened to laura walk me through it",
  tom_man: "what did he look like describe him the intruder the man in the mask what was he wearing his voice",
  tom_tape: "the tape recording what did the recording say the message the cassette the voice played",
  tom_others: "were there other people how many men was he alone accomplices anyone else the crew footsteps",
  tom_drink: "what did you drink the drink the juice drugged sedated the glasses what did he give you",
  tom_blood: "blood test hospital doctor county general were you drugged proof drug screen tox screen medical",
  tom_letter: "the ransom letter the note what did the letter say demands instructions the ransom",
  tom_delay: "why did you wait so long to call the police ten hours why not call right away delay waited",
  tom_money: "the two thousand dollars the bank withdrawal why did you take out money the cash",
  tom_door: "how did he get in the door the lock break in forced entry garage side door unlocked",
  tom_laura: "tell me about laura what is she like who is laura",
  tom_ferris: "the police how did ferris treat you interrogation questioned you polygraph",
  tom_enemies: "anyone want to hurt you enemies who would do this why you why her money",
  tom_van: "the van a neighbor saw howard saw a van at the curb do you know anyone with a van",
  tom_hoax: "hoax staged police say you made it up the newspaper story",
  tom_tape_found: "is this the tape you heard the msg cassette sheriff transcript the recording found",
  tom_gordon: "gordon pell do you know pell the repairman",
  ruth_hire: "why did you hire us why come to blackwood why did you come to me",
  ruth_laura: "tell me about your sister what is laura like",
  ruth_tom: "what do you think of tom do you trust tom could tom have done it",
  ruth_last: "when did you last talk to her last time you spoke to laura last saw her",
  ruth_police: "what have the police told you ferris what did police say",
  ruth_money: "can your family pay the ransom money twelve thousand dollars afford",
  ruth_voice: "the cassette the tape at the courier is it her voice did you hear the tape",
  ruth_return: "how did laura get here when did she come home what happened wednesday morning she came back",
  ruth_statement: "did laura give a statement the police statement did ferris talk to laura typed statement",
  ruth_hoax: "the police say it was a hoax staged made up newspaper",
  laura_night: "what do you remember of that night what happened to you at tom's house sunday night",
  laura_held: "where were you held where did he take you where were you kept statement can I see your statement what happened to you",
  laura_drive: "how long was the drive the van ride how far did you go which direction uphill climbing ears popped",
  laura_room: "describe the room where you were kept the house the place what did it smell like what did you hear",
  laura_men: "how many people were there how many men was he alone the crew others voices",
  laura_tape: "the recording the tape you made proof of life newspaper headline what did you read",
  laura_whistle: "the whistle when did you hear the whistle what was the whistle noon midday factory mill",
  laura_goggles: "the blindfold the goggles what was over your eyes can I have the goggles do you still have them",
  laura_release: "how were you released how did you get away where did he leave you the park bench how did you get home",
  laura_voice: "would you recognize him his voice did you see his face could you identify him",
  laura_ferris: "did the police talk to you ferris what did the police ask you",
  laura_hoax: "the police said it was a hoax staged made it up newspaper",
  laura_oak: "oak terrace another woman attacked the same way another break in",
  laura_gordon: "gordon pell arrested the man arrested is it him",
  ferris_case: "what do you think happened your theory your read on the case what's your take why do you suspect tom",
  ferris_statement: "can I see tom's statement his statement to police the statement police file copy of the statement",
  ferris_polygraph: "polygraph lie detector results did he pass did tom pass the test",
  ferris_entry: "forced entry signs of a break in how did they get in doors windows locks",
  ferris_school: "did anyone call the house that morning phone calls school called the junior high",
  ferris_glasses: "the glasses on the nightstand why didn't you take the glasses bag evidence bedroom",
  ferris_blood: "tom's blood test sedative drug screen county general",
  ferris_howard: "the neighbor howard lisk note about a van patrol officer witness",
  ferris_letters: "the courier letter and tape from the crew the package to the newspaper",
  ferris_trace: "phone calls traced to tamarack lake the payphone mountains",
  ferris_hoax: "you told the press it was staged hoax press conference why did you say it was a hoax",
  ferris_lab: "lab report on the glasses sleep preparation wiped prints both glasses",
  ferris_oak: "oak terrace the same method another attack break in diane moss",
  ferris_gordon: "gordon pell what is pell saying the suspect how is the interview going",
  ferris_typewriter: "the typewriter matched the letters same machine smith corona",
  nora_package: "tell me about the package the letter the cassette what came in the mail what did you receive",
  nora_calls: "did anyone call you phone calls did they contact you other contact the caller did the crew call",
  nora_voice: "what did the caller sound like describe the voice background noise what did you hear",
  nora_tape: "what do you make of the tape the cassette the recording the whistle the headline",
  nora_crew: "do you believe there is a crew is it a gang professionals one man",
  nora_ferris: "what did the police say about the package ferris",
  nora_printed: "did you print the story did the paper run it article",
  nora_letter2: "the second letter you said another letter came can I see the second letter",
  nora_hoax: "your paper ran the hoax story front page staged",
  nora_oak: "oak terrace break in tape player crew same",
  howard_night: "did you see anything that night what did you see sunday night monday morning anything unusual",
  howard_sleep: "why were you up so late awake at that hour can't sleep",
  howard_van: "describe the van what kind of van what did it look like color make",
  howard_driver: "did you see the driver who was driving the man anyone",
  howard_plate: "the license plate how sure are you the plate number 2k",
  howard_couple: "what do you know about tom and laura the neighbors what are they like do they fight",
  howard_police: "did you tell the police what did the police do the officer",
  howard_vanfound: "the van has been found dark blue ford 2kxl418",
  diane_night: "tell me what happened that night what happened to you",
  diane_tape: "what did the tape player say the recording the crew the voice",
  diane_lamp: "how did you get away the lamp did you fight him how did you escape",
  diane_man: "describe the man what did he look like",
  diane_door: "how did he get in the garage door the lock",
  diane_thermos: "the thermos what was in the thermos did he try to make you drink",
  diane_pager: "did he leave anything behind the pager what did he drop",
  diane_laura: "mariposa bay laura kessler another woman was taken the same way october",
  gordon_who: "who are you what do you do for a living your job your work your trade tell me about yourself your name",
  gordon_week: "where were you on october 9th that sunday night alibi where were you that weekend have you been down the hill",
  gordon_van: "whose van is that the van under the tarp does it run your van",
  gordon_phone: "do you use the payphone at the store the phone booth do you have a phone",
  gordon_laura: "do you know laura kessler the girl the teacher",
  gordon_purchases: "cable ties cassettes duct tape electrical tape what did you buy on october 6th",
  gordon_gas: "the gas eighteen gallons monday morning gasoline",
  gordon_quarters: "the roll of quarters tuesday afternoon why did you need quarters",
  gordon_ribbon: "typewriter ribbon smith corona do you have a typewriter do you type",
  gordon_window: "the boarded window plywood back window why is it covered",
  gordon_oak: "where were you november 4th oak terrace friday night",
  gordon_pager: "the pager your mother's pager skyline paging oak terrace",
  gordon_head: "how did you cut your head the cut on your head your scalp injury",
  gordon_mask: "the ski mask blood in the mask the search what the deputies found",
  bennett_case: "what do you make of the file the case what do you think your read on ferris's file",
  bennett_ferris: "tell me about ferris who is ferris what is he like",
  bennett_send_glasses: "send the glasses to the lab test the glasses lab analysis get them tested residue the glasses from the nightstand",
  bennett_lab_glasses: "lab report on the glasses sleep preparation wiped",
  bennett_whistle: "what makes a whistle at noon a steady whistle midday mill factory",
  bennett_plate: "run a partial plate 2k license plate check the plate",
  bennett_plate_full: "run plate 2kxl418 check the full plate who owns the van registration",
  bennett_pager: "trace the pager who owns the pager the pager from oak terrace pager registration paging company",
  bennett_vera: "who is vera pell gordon pell her son background record",
  bennett_send_typewriter: "compare the letters with the typewriter send the typewriter to the lab test the typewriter",
  bennett_typewriter: "the typewriter matched the letters same machine",
  bennett_hoax: "ferris told the press it was a hoax staged",
  bennett_again: "anything new any news updates on your side",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
