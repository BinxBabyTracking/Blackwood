import type { Condition } from "@/game/engine/types";

/*
 * What each person knows, and will say, about the Whitmore case. Used to
 * answer questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's version of events. Daniel Mercer's facts are
 *   his account, including the parts that are untrue; nothing here confesses.
 * - A fact is gated exactly like the authored answer that reveals it, so no
 *   phrasing of a question reaches information the investigation has not earned.
 * - Times follow docs/C001-timeline.md. No forensic results beyond the reports.
 */

/**
 * `entry` names the authored answer that carries the same information. When an
 * answer in the character's own words uses this fact, that entry counts as
 * asked and its effects apply (evidence handed over, timeline, flags), so how
 * the subject comes up never decides whether the investigator gets it.
 */
type Fact = { text: string; requires?: Condition; entry?: string };
const f = (text: string, requires?: Condition, entry?: string): Fact => ({ text, requires, entry });

const recalledSedan: Condition = { eventState: "RE01", is: "completed" };
const fenderKnown: Condition = { any: [{ eventState: "RE01", is: "completed" }, { flag: "knows_fender" }, { asked: "robert_cars_night" }] };

export const PERSONA: Record<string, string> = {
  margaret:
    "Margaret Ellis, retired schoolteacher in her sixties. Measured, polite, a little guarded. Precise about what she saw, careful never to accuse anyone or guess. Grieving her friend quietly.",
  daniel:
    "Daniel Mercer, 41, bookkeeper and estate manager. Polished, articulate, cooperative on the surface. Sticks rigidly to his account. Grows curt and defensive when pressed about money, his hand, the diner or the jacket, and mentions his attorney. Never admits anything.",
  robert:
    "Robert Hale, mechanic, middle-aged. Plain-spoken, brief, practical. Talks about cars, locks and how things work. Impatient with repeated or vague questions. Will not speculate about people.",
  patricia:
    "Patricia Wells, 31, Eleanor's niece and a loan officer. Grieving, emotional but controlled. Reluctant to discuss family money with a stranger until it is clear the investigator already knows about the accounts.",
  bennett:
    "Det. Frank Bennett, LAPD Northeast Division, twenty-two years on the job, speaking by telephone. Calm, professional, factual. Shares police information, never goes beyond what the reports say, and asks for evidence rather than theories.",
  rosa:
    "Rosa Delgado, night waitress at the Maple Street Diner. Warm, quick, a little tired, calls people honey. Remembers customers by their checks.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  margaret: [
    f("I'm a retired schoolteacher. I live at 1421 Hollister Avenue, directly across the street from Eleanor's house."),
    f("I knew Eleanor for twenty years. We took the newspaper over to each other on Saturday mornings, whoever was up first."),
    f("Eleanor was widowed in 1981 when Harold died. After that we leaned on each other a little."),
    f("On Friday, August 16th, Eleanor had four of us for supper: me, Robert Hale, Patricia Wells and Daniel Mercer. I arrived first, at about seven.", undefined, "margaret_evening"),
    f("Supper was a roast. Eleanor cut a lemon cake herself at the sideboard for dessert."),
    f("At about a quarter past nine Eleanor took Daniel over to her writing desk with her ledger open. They talked for about ten minutes with their backs to the table. I couldn't hear them. She was quiet for the rest of the evening.", undefined, "margaret_mostly"),
    f("Robert ate and said little, as usual. Patricia seemed tense and kept watching her aunt. Daniel was charming, poured the coffee and passed the cake round."),
    f("Daniel wore a tan windbreaker all evening, even at the table. I thought it was a little warm for it.", undefined, "margaret_daniel"),
    f("When I helped clear the plates Eleanor told me she was seeing Harold's lawyer on Monday about Harold's money, and that she should have done it a year ago. I didn't press her.", undefined, "margaret_eleanor_mood"),
    f("Robert left first, at about ten. I left about ten minutes later and walked home across the street. Patricia and Daniel were still in the house. A little later I saw Patricia's car pull away from my window.", undefined, "margaret_departure"),
    f("At home I watched the television until the late news finished at half past eleven, then I dozed off in my chair. With the windows shut and the set on I don't think I'd have heard anything from across the street.", undefined, "margaret_noise"),
    f("Eleanor had Robert put a bolt on her kitchen door after Harold died, and she checked it every night.", undefined, "margaret_unusual"),
    f("No one at supper had a hurt hand. Daniel poured the coffee with both hands; I would have noticed a bandage.", undefined, "margaret_hands"),
    f("If anyone had been in Eleanor's garden, the flower bed would have shown it. She knew every plant."),
    f("At twenty to eight on Saturday morning I took the paper over as usual. The front door was locked, so I let myself in with my spare key, and I found her in the living room."),
    f("Eleanor once said Harold's money seemed to get smaller every quarter and that Daniel always had a reason. I told her to ask Patricia, who works at the bank.", { deduction: "D_MOTIVE" }),
    f("I remembered later: the cat woke me scratching at the door at ten past twelve by my mantel clock, which keeps good time. When I let him in, a big dark four-door sedan was parked under the jacaranda by Eleanor's house with its lights off.", recalledSedan),
    f("The car was dark, green or black, I couldn't tell under the streetlight. The back fender on the street side was crumpled in.", recalledSedan, "margaret_sedan_more"),
    f("I saw no one in the car or near it. When I came down for a glass of water at half past twelve it was gone. I won't guess whose car it was.", recalledSedan),
    f("I don't know who did this, and I won't accuse anyone."),
  ],
  daniel: [
    f("I run a one-man bookkeeping and estate management practice from my apartment on Griffith Park Boulevard in Silver Lake."),
    f("Harold Whitmore hired me in 1979 to keep his company books. After he died in 1981, Eleanor asked me to manage the estate."),
    f("Friday's supper was pleasant and ordinary. Eleanor liked having people round."),
    f("Eleanor's question at her desk around nine fifteen was a routine one about a bank statement; the bank changed its format this year and it confused her. It took ten minutes.", undefined, "daniel_desk"),
    f("I left at about twenty-five past ten, the last guest. I helped carry cups to the kitchen and Eleanor saw me out. She was perfectly well.", undefined, "daniel_departure"),
    f("After leaving I drove to the Maple Street Diner on Sunset, had coffee and pie and read the paper until about one in the morning. A redheaded waitress called Linda kept my cup filled.", undefined, "daniel_evening"),
    f("After the diner I drove home and went to bed. I didn't sleep much."),
    f("I drive a dark green 1981 Buick LeSabre."),
    f("I cut my right hand when a pickle jar broke early on Saturday morning, before nine. I bandaged it myself with gauze from the Rexall on Sunset. I didn't see a doctor.", undefined, "daniel_hand"),
    f("Harold's estate is in excellent order: conservative investments and steady income. I sent Eleanor a report every quarter and she kept copies in her desk.", undefined, "daniel_accounts"),
    f("Eleanor had become confused about a great many things lately, including her own sums."),
    f("I don't own a windbreaker.", { flag: "jacket_missing" }),
    f("I'm traveling to see a client in Phoenix.", { inspected: "da_suitcase" }),
    f("I gave the police a full statement and I have nothing to add. Anything further can go through my attorney."),
  ],
  robert: [
    f("I own Hale Automotive on Fletcher Drive in Atwater Village."),
    f("I kept Harold Whitmore's trucks running for fifteen years. After he died I kept Eleanor's Oldsmobile running and did odd jobs round her house. She paid me in pie, mostly."),
    f("Supper on Friday was roast beef. I listened more than I talked."),
    f("After the plates were cleared Eleanor took Mercer to her desk with her account book open. None of my business."),
    f("I left first, at ten o'clock. I open the shop at seven on Saturdays.", undefined, "robert_departure"),
    f("When I left, Patricia's little Datsun was outside with Mercer's big green Buick behind it. Margaret walks, so her car wasn't there."),
    f("Two years ago, after Harold died, I put the bolt on Eleanor's kitchen door myself: a thumb-turn on the inside and no keyhole outside, the way she asked. She bolted it every night."),
    f("Nobody can open that bolt from the yard without breaking the door or the frame."),
    f("A window screen bends the way the blade pushes it. Cut from the yard, the mesh bends in toward the sink. Cut from the kitchen, it bends out."),
    f("Mercer brings his car here: a green 1981 Buick LeSabre. He backed it into a pole a couple of months ago and crumpled the rear fender. I quoted him two hundred and forty dollars in June. He declined and never came back.", fenderKnown, "robert_cars"),
    f("He said he hit a pole in a parking structure downtown.", fenderKnown),
    f("I don't speculate about people. I fix cars."),
  ],
  patricia: [
    f("I'm Eleanor's niece. I'm thirty-one and a loan officer at Pacific Crest Savings & Loan on Vermont Avenue."),
    f("Aunt Eleanor half raised me. Saturday mornings at her kitchen table, homework and pancakes."),
    f("On Friday I arrived at about a quarter past seven. I left at about twenty past ten because I had to open the branch on Saturday. Aunt Eleanor walked me to the door. Daniel was still there, carrying cups into the kitchen.", undefined, "patricia_evening"),
    f("I was home by a quarter to eleven. My downstairs neighbor heard me drop my keys on the landing."),
    f("I inherit most of the estate. I know how that sounds."),
    f("At a quarter past nine Aunt Eleanor took Daniel to her desk with her ledger. She had told me she meant to ask him about the statements. When she came back she was pale, and he was smiling.", undefined, "patricia_desk"),
    f("Daniel is charming. She used to call him 'my Mr. Mercer'. Lately she stopped."),
    f("Aunt Eleanor had been quiet and distracted lately. I told the police I thought she was tired."),
    f("I'd rather not discuss family money with someone I don't know.", { not: { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }, { asked: "margaret_eleanor_mood" }] } }),
    f("About three weeks before she died, Aunt Eleanor asked me to pull the statements for Uncle Harold's estate account, which my bank holds. Her own ledger didn't match what Daniel's reports told her. I made copies but hadn't finished going through them.", { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }, { asked: "margaret_eleanor_mood" }] }, "patricia_money"),
    f("Her ledger's first column is what Daniel's reports said; the second is what she worked out from the bank's statements.", { hasEvidence: "E03" }),
    f("The estate folder in her desk drawer held Daniel's quarterly reports. She showed it to me three weeks ago.", { hasEvidence: "E08" }),
    f("The checks I saw were made out to D. Mercer Management, and none had her signature on the authorization.", { deduction: "D_MOTIVE" }),
    f("Mr. Albright was Uncle Harold's attorney. If she was taking the papers to him, she had made up her mind.", { deduction: "D_LAWYER" }),
    f("The torn statement page was folded in the inside pocket of her handbag when the police returned her things.", { eventState: "RE03", is: ["active", "completed"] }),
  ],
  bennett: [
    f("I'm Detective Frank Bennett, LAPD Northeast Division, twenty-two years on the job. My captain wants this filed as a burglary gone wrong. I want it right."),
    f("Mrs. Whitmore was found on the living room carpet between the sofa and an overturned chair, with a single stab wound. The carving knife was on the floor beside her and is in our property room."),
    f("At the scene: broken crystal glass near the chair, a cut screen over the kitchen sink, the back door unbolted, the front door locked. Nothing was taken: her purse, jewelry and a hundred and forty dollars were all there."),
    f("I took recorded statements from all four guests on Saturday the 17th. They hang together a little too well. The tapes are on the investigator's desk."),
    f("By their own accounts the guests left between ten and half past ten: Hale first, then Mrs. Ellis, then the niece, then Mercer. Mercer says he spent the night at a diner on Sunset.", undefined, "bennett_timeline"),
    f("The coroner's preliminary estimate puts the death between about eleven on Friday night and one on Saturday morning, one wound consistent with a blade like the recovered knife. I won't go beyond what the reports say.", undefined, "bennett_forensics"),
    f("Nothing has gone to the lab yet. A shard of the broken glass is bagged at the scene; if the investigator wants the blood typed, I'll take it to the lab myself.", { not: { labStarted: "glass" } }),
    f("I'll take the glass to the lab and have the blood typed. The results go to the investigator's desk.", { hasEvidence: "E02" }, "bennett_send_glass"),
    f("Typing only says whether the blood is Eleanor's. To know whose it is, I'd need blood samples from the four guests. I'll ask them if the investigator wants.", { labStarted: "glass" }, "bennett_samples"),
    f("The lab typed the blood. Eleanor is Group A. The broken edge of the glass is Group B, somebody else's.", { hasEvidence: "E11" }, "bennett_glass"),
    f("All four guests gave samples. Ellis O, Wells A, Hale B, Mercer B. So it's Hale or Mercer, as far as typing goes.", { hasEvidence: "E16" }),
    f("The lab found Group B inside the windbreaker's right cuff and Group A on the outside of the sleeve. Somebody washed it. Not well enough.", { hasEvidence: "E05" }),
    f("Mercer's right hand was bandaged when he gave his statement. He said a jar broke in it that morning.", { hasEvidence: "E14" }, "bennett_hand"),
    f("There's a dark green 1981 Buick LeSabre registered to D. Mercer Management on Griffith Park Boulevard.", { all: [{ asked: "margaret_sedan_more" }, { any: [{ flag: "fender_identified" }, { inspected: "g_orders" }] }] }),
    f("My officers recovered a tan windbreaker from the dumpster behind Mercer's building, under a sack of grass clippings. The lab has had it.", { flag: "jacket_search" }),
    f("The diner's evening waitress, Linda, went home at eleven. She remembers a man in a tan jacket still in the window booth when she left.", { deduction: "D_ALIBI" }),
    f("Mr. Albright, Harold's attorney, says Mrs. Whitmore called the week before and asked for an hour on Monday.", { deduction: "D_LAWYER" }),
    f("I'll help with searches and checks when you give me a reason. I don't work from theories."),
  ],
  rosa: [
    f("I work the night shift at the Maple Street Diner, eleven to seven, every Friday."),
    f("Linda works the evening shift and clocks out at eleven on the dot.", undefined, "rosa_friday"),
    f("The week's staff schedule hangs by the kitchen pass. I hand it over when the investigator asks to see it.", undefined, "rosa_schedule"),
    f("When I came on Friday night, a man in a tan jacket in the window booth was finishing up. He left about five past eleven without paying for his refill.", undefined, "rosa_customer"),
    f("I wrote the unpaid refill on a ticket for the manager and kept it on the spike by the register. I give it to the investigator when they ask about him.", undefined, "rosa_ticket"),
    f("He didn't come back on my shift. It was dead after midnight."),
  ],
};

