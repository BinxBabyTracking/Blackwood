import type { CharacterDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";

/*
 * DRAFT CASE CONTENT. Names, roles and the solution follow the Phase 2 brief.
 * Every date, time, statement and forensic detail below is a working draft
 * written to be internally consistent; review before release.
 *
 * Interview design: Margaret Ellis and Patricia Wells open up as the
 * investigation progresses. Robert Hale and Daniel Mercer mostly repeat what
 * they told the police, until specific evidence is put in front of them.
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
      { text: "Had an appointment with an attorney on Monday the 19th about the estate accounts.", requires: { hasEvidence: "E09" } },
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
      { text: "Retired schoolteacher. Lives directly across Hollister Avenue from the Whitmore house and has known Eleanor for twenty years." },
      { text: "Walked home at about 10:35 on the night of the gathering." },
      { text: "Saw a dark sedan parked near Eleanor's house after midnight.", requires: { event: "RE01" } },
    ],
    available: { always: true },
    locationId: "margaret_house",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what to make of that. You'd know better than I would.",
    idleLine: "I've told you everything I can think of. If anything else comes back to me, I'll telephone your office.",
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
  },
  {
    id: "robert",
    name: "Robert Hale",
    role: "Party guest, mechanic",
    portrait: "char.robert",
    bio: [
      { text: "Owns Hale Automotive on Fletcher Drive. Kept Harold Whitmore's trucks running for fifteen years and stayed friendly with Eleanor afterwards." },
      { text: "Left the gathering first, at about 10:20." },
    ],
    available: { always: true },
    locationId: "robert_garage",
    onBoard: true,
    defaultEvidenceReply: "Can't help you there. I know engines, not police work.",
    idleLine: "Look, I open at seven. I told the detective everything already.",
  },
  {
    id: "patricia",
    name: "Patricia Wells",
    role: "Party guest, Eleanor's niece",
    portrait: "char.patricia",
    bio: [
      { text: "Thirty-one. Eleanor's niece and closest family. Loan officer at Pacific Crest Savings & Loan on Vermont Avenue." },
      { text: "Left the gathering at about 10:50." },
      { text: "Eleanor had asked her to pull the estate account statements a few weeks before she died.", requires: { asked: "patricia_money" } },
    ],
    available: { always: true },
    locationId: "patricia_office",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what that tells us. Aunt Eleanor kept everything; that could have come from anywhere in the house.",
    idleLine: "Please, find out what happened to her. Call me if you need anything from the bank.",
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
    available: { not: { always: true } },
    locationId: null,
    onBoard: false,
    defaultEvidenceReply: "",
    idleLine: "",
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
  },
];

const q = (characterId: string, id: string, prompt: string, reply: string[], extra: Partial<DialogueQuestion> = {}): DialogueQuestion => ({
  id,
  characterId,
  prompt,
  reply,
  ...extra,
});

export const questions: DialogueQuestion[] = [
  // ---------------- Margaret Ellis (opens up over time) ----------------
  q("margaret", "margaret_evening", "Tell me about Saturday evening.", [
    "Eleanor had a few of us over for supper. Nothing fancy. A roast, and a lemon cake for dessert. She cut it herself at the sideboard.",
    "It was a pleasant evening. Robert went first, then me at about half past ten. I only had to cross the street.",
  ], { effects: [{ timeline: { time: "10:35 PM", text: "Margaret Ellis walks home across the street.", source: "Margaret Ellis" } }] }),
  q("margaret", "margaret_eleanor_mood", "How did Eleanor seem that night?", [
    "Cheerful at the table. But when I helped her clear the plates she said something odd.",
    "She said, 'I'm seeing a lawyer on Monday about Harold's money, Maggie, and I should have done it a year ago.' I didn't press her.",
  ], { requires: { asked: "margaret_evening" } }),
  q("margaret", "margaret_daniel", "What do you know about Daniel Mercer?", [
    "He's handled Harold's estate since the funeral. Very polished. Eleanor trusted him completely, at least she used to.",
    "He wore one of those tan windbreakers all evening, even at the table. I thought it was a bit warm for it.",
  ], { requires: { asked: "margaret_evening" }, effects: [{ setFlag: "knows_tan_jacket" }] }),
  q("margaret", "margaret_noise", "Did you hear anything after you got home?", [
    "Not that I noticed. I had the television on until the late news finished, and then I went up to bed.",
  ], { requires: { asked: "margaret_evening" } }),
  q("margaret", "margaret_hands", "Did anyone at dinner have an injury? A bandage, a cut hand?", [
    "No. Daniel passed the plates round and poured the coffee. I'd have noticed a bandage.",
  ], { requires: { hasEvidence: "E14" } }),
  q("margaret", "margaret_sedan_more", "About the car you saw after midnight. Can you describe it?", [
    "Dark. Green or black, I couldn't tell under the streetlight. A big four-door.",
    "The back fender on the street side was crumpled in. I noticed because it caught the light.",
  ], { requires: { event: "RE01" }, effects: [{ setFlag: "knows_fender" }] }),

  // ---------------- Patricia Wells (opens up over time) ----------------
  q("patricia", "patricia_evening", "Walk me through Saturday night.", [
    "I got there around seven thirty. Dinner, cake, coffee. I left at about ten to eleven because I had an early start.",
    "Aunt Eleanor walked me to the door. That was the last time I saw her.",
  ], { effects: [{ timeline: { time: "10:50 PM", text: "Patricia Wells leaves. Eleanor sees her to the door.", source: "Patricia Wells" } }] }),
  q("patricia", "patricia_inheritance", "Who inherits Eleanor's estate?", [
    "I do, mostly. I know how that sounds. I also know the police have already asked me where I was.",
    "I was home by quarter past eleven. My downstairs neighbour heard me drop my keys on the landing and complained about it the next day.",
  ], { requires: { asked: "patricia_evening" } }),
  q("patricia", "patricia_money", "Did Eleanor ever ask you for help with money?", [
    "Yes. About three weeks ago she asked me to pull the statements for Uncle Harold's estate account. It's held at my bank.",
    "She'd been keeping her own ledger and the balance didn't match what Daniel told her. I made copies but I hadn't finished going through them when she died.",
    "Let me find what I have. I'll have it sent over to your office.",
  ], { requires: { asked: "patricia_evening" } }),
  q("patricia", "patricia_daniel", "How well do you know Daniel Mercer?", [
    "Well enough to be polite. He's charming. Aunt Eleanor called him 'my Mr. Mercer' for years.",
    "Lately she stopped calling him that.",
  ], { requires: { asked: "patricia_evening" } }),
  q("patricia", "patricia_hands", "Did you notice anyone hurt at dinner? A cut hand?", [
    "No. Daniel served the cake while Aunt Eleanor cut it. Both his hands were fine, I'm certain.",
  ], { requires: { hasEvidence: "E14" } }),

  // ---------------- Robert Hale (limited, repetitive) ----------------
  q("robert", "robert_evening", "Tell me about Saturday night.", [
    "Good dinner. I left around ten twenty. I open at seven on Sundays, so I don't stay out.",
  ], { effects: [{ timeline: { time: "10:20 PM", text: "Robert Hale leaves the gathering.", source: "Robert Hale" } }] }),
  q("robert", "robert_again", "Anything else you remember about the evening?", [
    "Like I told the detective. Dinner, cake, coffee, home. Nothing happened while I was there.",
  ], { requires: { asked: "robert_evening" }, repeatable: true }),
  q("robert", "robert_cars", "Do any of the other guests bring their cars here?", [
    "Mercer does. Green '81 Buick LeSabre. He backed it into a pole a couple of months ago and crumpled the rear fender.",
    "I quoted him two-forty to fix it. He said he'd think about it. Never came back.",
  ], { requires: { any: [{ event: "RE01" }, { flag: "knows_fender" }] }, effects: [{ setFlag: "fender_identified" }] }),

  // ---------------- Daniel Mercer (limited until confronted) ----------------
  q("daniel", "daniel_evening", "Where did you go after you left Eleanor's?", [
    "I left around a quarter to eleven and drove to the Maple Street Diner. I had coffee and a slice of pie and read the paper until about one.",
    "The waitress, a redhead called Linda, kept my cup filled the whole time. Ask her.",
  ], { effects: [{ setFlag: "daniel_alibi_given" }, { unlockLocation: "diner" }, { timeline: { time: "10:45 PM", text: "Daniel Mercer says he left and drove to the Maple Street Diner, staying until about 1:00 AM.", source: "Daniel Mercer" } }] }),
  q("daniel", "daniel_again", "Is there anything you left out of your statement?", [
    "No. I've been completely open with the police.",
  ], { requires: { asked: "daniel_evening" }, repeatable: true }),
  q("daniel", "daniel_hand", "What happened to your hand?", [
    "This? A pickle jar broke in my hand on Sunday morning. Clumsy of me. A few stitches' worth, I didn't bother with the doctor.",
  ], { effects: [{ giveEvidence: "E14" }] }),
  q("daniel", "daniel_accounts", "Tell me about Eleanor's accounts.", [
    "Harold's estate is in excellent order. Conservative investments, steady income. Eleanor never wanted for anything.",
  ]),
  q("daniel", "daniel_jacket_b", "Where is the tan windbreaker that was on your coat rack?", [
    "Windbreaker? I don't own a windbreaker. You must be thinking of someone else.",
  ], { requires: { all: [{ flag: "jacket_missing" }, { flag: "saw_jacket" }] } }),
  q("daniel", "daniel_alibi_broken", "Linda went home at eleven. Who poured your coffee until one?", [
    "Then I have the name wrong. It was a long night and I was upset. What does a waitress's name matter?",
  ], { requires: { deduction: "D_ALIBI" } }),
  q("daniel", "daniel_money_confront", "Eleanor's ledger and the bank's statements don't match. Explain that.", [
    "Eleanor was sixty-four and kept her sums in pencil. I won't discuss a client's affairs any further without my attorney.",
  ], { requires: { deduction: "D_MOTIVE" } }),

  // ---------------- Rosa Delgado (diner witness) ----------------
  q("rosa", "rosa_saturday", "Were you working last Saturday night?", [
    "Eleven to seven, same as every Saturday. Linda had the evening and clocked out at eleven on the dot. She always does.",
  ], { effects: [{ setFlag: "rosa_shift" }] }),
  q("rosa", "rosa_customer", "Do you remember a man on his own, around eleven? Coffee, maybe pie.", [
    "Tan jacket, booth by the window? He was finishing up when I came on. Left about twenty past eleven without paying for his refill.",
    "I wrote it on a ticket for the manager. It's still on the spike by the register if you want it.",
  ], { requires: { asked: "rosa_saturday" }, effects: [{ setFlag: "rosa_note" }] }),
  q("rosa", "rosa_return", "Did he come back later that night?", [
    "Not on my shift. It was dead after midnight. I'd remember.",
  ], { requires: { asked: "rosa_customer" } }),
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
  r("daniel", "E14", ["I've told you. A jar. Sunday morning."]),
  r("daniel", "E11", ["Why are you showing me a lab report? I wasn't hurt at Eleanor's."]),
  r("daniel", "E05", ["I've never seen that jacket in my life.", "I think we're finished. Any further questions can go through my attorney."], { effects: [{ setFlag: "daniel_lawyered" }] }),
  r("daniel", "E03", ["Eleanor's arithmetic, not mine. She was confused about a great many things lately."]),
  r("daniel", "E15", ["Where did you get that? That's a confidential client document."]),
  r("daniel", "E08", ["Eleanor kept her own papers. I wouldn't know where she filed anything."]),
  r("margaret", "E05", ["That's it. That's the jacket he wore at supper, I'm sure of it. The same pockets."]),
  r("margaret", "E09", ["That's Eleanor's writing. Monday. That's the lawyer she told me about."]),
  r("patricia", "E03", ["That's her ledger. See the pencil marks? Those are the months where the totals stopped adding up."]),
  r("patricia", "E15", ["That's from the statements I gave her. She must have torn it out to show someone."]),
  r("patricia", "E09", ["Mr. Albright was Uncle Harold's attorney. If she was seeing him, she'd made up her mind."]),
  r("robert", "E05", ["A windbreaker. Could be anybody's. I wear coveralls."]),
  r("rosa", "E05", ["Could be. His was tan like that. I didn't look at his cuffs, I looked at his check."]),
];
