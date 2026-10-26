import type { Condition } from "@/game/engine/types";

/*
 * What each person knows, and will say, about the Kessler case. Used to
 * answer questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's version of events. Gordon Pell's facts are his
 *   account, including the parts that are untrue; nothing here confesses.
 * - A fact is gated exactly like the authored answer that reveals it, so no
 *   phrasing of a question reaches information the investigation has not earned.
 * - Times follow docs/C002-timeline.md. No forensic result beyond the reports.
 * - Laura's captivity is only what she heard and smelled: held, blindfolded,
 *   sedated, released.
 */

/**
 * `entry` names the authored answer that carries the same information. When an
 * answer in the character's own words uses this fact, that entry counts as
 * asked and its effects apply (evidence handed over, timeline, flags), so how
 * the subject comes up never decides whether the investigator gets it.
 */
type Fact = { text: string; requires?: Condition; entry?: string };
const f = (text: string, requires?: Condition, entry?: string): Fact => ({ text, requires, entry });

const home: Condition = { flag: "laura_home" };
const arrested: Condition = { flag: "gordon_arrested" };
const knowsPell: Condition = { any: [{ hasEvidence: "E14" }, { hasEvidence: "E15" }, { hasEvidence: "E17" }, { talkedTo: "gordon" }] };

export const PERSONA: Record<string, string> = {
  tom:
    "Tom Hale, 31, county land surveyor. Exhausted, flat, precise, quiet. Has been questioned for hours and suspected; answers patiently but tightens when asked about the delay or the money. Never theatrical. Deeply worried about Laura until she is home, then relieved. Does not speculate about who did it.",
  ruth:
    "Ruth Kessler, 34, bookkeeper at a Long Beach shipyard, Laura's older sister and the investigator's client. Tense, practical, protective. Short with anyone who doubts Laura or Tom. Grateful once Laura is home.",
  laura:
    "Laura Kessler, 29, junior high music teacher. Shaken but steady and clear, with a teacher's diction. Only describes what she heard and smelled; never claims to have seen anyone's face. Will not talk about anything beyond being held, blindfolded, given something to drink and released; if pressed, says she has told the investigator everything she can.",
  ferris:
    "Sgt. Walter Ferris, Mariposa Bay Police, twenty years on the job. Blunt, tired, sure of himself, defensive about his department. Believes Tom Hale is hiding something until the evidence makes that impossible; then quieter and grudging. Never apologizes outright.",
  nora:
    "Nora Pruitt, crime reporter for the Mariposa Bay Courier, in her forties. Quick, dry, skeptical, exact about times. Protective of what came to her desk. Annoyed at her own paper for running the hoax story.",
  howard:
    "Howard Lisk, 70, retired machinist across Elm Street from Tom's house. Chatty, friendly, very precise about what he saw and careful not to claim more. Keeps a sleep log. Mildly indignant that the police never called him back.",
  diane:
    "Diane Moss, 41, florist in Oak Terrace. Shaken and angry, plain-spoken, proud that she fought back. Describes only what happened in her own house.",
  gordon:
    "Gordon Pell, 38, TV and radio repairman living at his mother's cabin at Tamarack Lake. Soft-spoken, polite, helpful on the surface, a little too reasonable. Sticks to his account: home every night, van not running, the purchases are for repairs. Becomes evasive when pressed on the ledger, cornered about the pager, and asks for a lawyer when shown what the search found. Never admits anything.",
  bennett:
    "Det. Frank Bennett, LAPD, twenty-five years on the job, speaking by telephone. Calm, professional, factual. Not his case or his town, but he can get records, labs and other departments to move. Asks for evidence rather than theories and never goes beyond the reports.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  tom: [
    f("I'm a land surveyor for the County of Ventura. I own the house at 418 Elm Street."),
    f("Laura and I have been together nearly two years. She teaches music at Mariposa Bay Junior High."),
    f("On Sunday night I took the trash out through the garage at about twenty to eleven and I think I left the side door unlocked. We went to bed at a quarter past eleven.", undefined, "tom_door"),
    f("At about three a man in a knit mask woke us with a flashlight, a gun and a stun gun. He whispered everything; I never heard his real voice.", undefined, "tom_night"),
    f("He tied our wrists and ankles with black plastic ties and put swim goggles covered in tape over our eyes.", undefined, "tom_night"),
    f("He played a tape: a flat man's voice with a hiss, saying they were a crew of professionals who'd been watching the house, and that if we fought they would hurt Laura. It clicked off at the end.", undefined, "tom_tape"),
    f("He said 'Okay, go' toward the hall as if someone was there, but nobody answered. I only ever heard one set of footsteps.", undefined, "tom_others"),
    f("He made us each drink something from my kitchen glasses, sweet like orange juice and bitter underneath. The glasses are still on the nightstand.", undefined, "tom_drink"),
    f("I woke at twenty to ten, still tied, and cut myself free with the kitchen scissors at about five to ten. The phone had rung that morning but I couldn't get to it."),
    f("The letter on the kitchen table said no police, twelve thousand dollars, six by Tuesday noon, and that they would call at one o'clock. Nobody called.", undefined, "tom_letter"),
    f("I went to Harbor Federal at a quarter past eleven and took out all I had, two thousand dollars, in case they called. It's still in the envelope.", undefined, "tom_money"),
    f("I called the police at one forty, when the call never came.", undefined, "tom_delay"),
    f("I asked for my own blood test at County General on Monday evening at ten past six. It came back positive for a sedative. I'll give the investigator my copy.", undefined, "tom_blood"),
    f("Sergeant Ferris questioned me from three in the afternoon until eleven at night, and gave me a polygraph at nine the next morning while I could hardly stand."),
    f("Laura and I didn't argue on Sunday. We had dinner, she marked papers and we went to bed."),
    f("We don't have money. Nobody we know has a van.", undefined, "tom_enemies"),
    f("Laura is home at her sister's. I talked to her on the phone for an hour.", home),
    f("I've never heard of anyone called Gordon Pell.", knowsPell),
  ],
  ruth: [
    f("I'm Laura's older sister, thirty-four. I'm a bookkeeper at a shipyard in Long Beach."),
    f("I hired Blackwood because the police are only looking at Tom and nobody is looking for Laura. Detective Bennett used to work with my father.", undefined, "ruth_hire"),
    f("I last spoke to Laura on Sunday afternoon about our mother's birthday on the twenty-second. She sounded normal.", undefined, "ruth_last"),
    f("Laura checks the locks twice. Tom is quiet and people take him for cold, but he would never hurt her.", undefined, "ruth_tom"),
    f("Sergeant Ferris called me on Monday night to ask whether Tom had ever hit her. That's how I found out.", undefined, "ruth_police"),
    f("Nobody in our family has twelve thousand dollars.", undefined, "ruth_money"),
    f("I heard the tape at the Courier over the phone. It's Laura. She called me Ruthie, and only she does that.", { callAnswered: "call_nora" }, "ruth_voice"),
    f("Laura knocked on my door at half past eight on Wednesday morning, shaking, with the taped goggles in her coat pocket. Somebody left her on a bench in Alamitos Park.", home, "ruth_return"),
    f("Ferris spent ten minutes with Laura and only asked whether Tom had hit her. I typed her full statement myself from her words and she signed it; she has it.", home, "ruth_statement"),
  ],
  laura: [
    f("I teach music at Mariposa Bay Junior High. I've been with Tom for two years."),
    f("That night I woke to a light and a man whispering. He tied my wrists and put taped goggles over my eyes. A tape played, and he made us drink something sweet.", undefined, "laura_night"),
    f("I wrote down everything I heard and smelled while it was fresh. Ruth typed it and I signed it, and I'll give it to the investigator.", undefined, "laura_held"),
    f("I was put on a mattress in the back of a van and driven for about three hours. The second half was climbing and my ears popped. The air was cold there and smelled of pine trees and woodsmoke.", undefined, "laura_drive"),
    f("I was kept in a small carpeted room with a space heater that ticked. A radio or television was always on low next door. The place smelled of hot dust and burnt solder, like my father's workbench.", undefined, "laura_room"),
    f("There was only ever one man. He talked about 'the crew' and 'the others' but I never heard another voice, car or set of footsteps.", undefined, "laura_men"),
    f("On Monday he held a newspaper under a lamp, lifted the goggles a little, and recorded me reading the date and the headline. A long, steady whistle went off outside while I was speaking.", undefined, "laura_tape"),
    f("The whistle sounded on Monday and again on Tuesday around midday, like a factory or a mill.", { any: [{ asked: "laura_tape" }, { hasEvidence: "E08" }, { hasEvidence: "E12" }] }, "laura_whistle"),
    f("He gave me something to drink at night and I slept a lot."),
    f("I still have the swim goggles he made me wear, with black tape on the lenses. I'll give them to the investigator.", undefined, "laura_goggles"),
    f("Early Wednesday he drove me downhill for about two and a half hours, sat me on a bench, and told me to count to three hundred. I was in Alamitos Park, two blocks from Ruth's.", undefined, "laura_release"),
    f("I never saw his face. I only know his whisper.", undefined, "laura_voice"),
    f("Sergeant Ferris asked me whether Tom had ever hit me and whether we needed money. He didn't ask where I'd been.", undefined, "laura_ferris"),
  ],
  ferris: [
    f("I'm Sergeant Walter Ferris, twenty years with the Mariposa Bay Police. This is my case."),
    f("There was no forced entry at any door, window or lock.", undefined, "ferris_entry"),
    f("Hale waited more than ten hours to call us and withdrew two thousand dollars that morning. No ransom call came at one. His manner was flat throughout.", undefined, "ferris_case"),
    f("I'll give the investigator a copy of Hale's statement with my notes.", undefined, "ferris_statement"),
    f("The polygraph on Tuesday morning was inconclusive. I'll give the investigator the summary.", undefined, "ferris_polygraph"),
    f("The junior high rang the house at twenty past eight and quarter to nine on Monday. Nobody answered.", undefined, "ferris_school"),
    f("We photographed the bedroom. We didn't take the glasses.", { hasEvidence: "E02" }, "ferris_glasses"),
    f("Hale's blood showed a sedative by six that evening. That doesn't say who gave it to him.", { hasEvidence: "E03" }, "ferris_blood"),
    f("Pruitt at the Courier told me about a letter and a tape. I think it's part of the act.", { hasEvidence: "E07" }, "ferris_letters"),
    f("Miss Kessler came home on Wednesday without a scratch and no ransom was paid.", home),
    f("At five on Wednesday I told the press the abduction appears to have been staged. The chief wanted it said.", { hasEvidence: "E11" }, "ferris_hoax"),
    f("Nobody from patrol gave me a note from a neighbor.", { hasEvidence: "E06" }, "ferris_howard"),
    f("We're holding Gordon Pell for questioning. He says he was home every night and his van has been in the shop since September. He has a cut on his head he says came from a tailgate.", arrested, "ferris_gordon"),
    f("I had those letters on Tuesday. The department will withdraw the statement.", { hasEvidence: "E19" }, "ferris_typewriter"),
  ],
  nora: [
    f("I cover crime and the courts for the Mariposa Bay Courier."),
    f("On Tuesday afternoon a package came to my desk addressed to me by name: a typed letter from 'the crew' and a cassette, postmarked San Bernardino, Monday.", undefined, "nora_package"),
    f("Ruth Kessler heard the tape over the phone at five past three and said it's Laura."),
    f("Three calls came to my desk on Tuesday afternoon, at quarter past three, ten to four and twenty past four. The first two started with a tape saying 'Print the story tonight. The crew is waiting.' The last was a man whispering live.", undefined, "nora_calls"),
    f("On the last call I heard coins drop twice, wind, and a truck on gravel.", { asked: "nora_calls" }, "nora_voice"),
    f("On the tape Laura reads Monday's headline from the Los Angeles Daily Star, a morning paper sold all over Southern California. A long, steady whistle sounds at the end. It isn't a train.", undefined, "nora_tape"),
    f("Professionals don't write to reporters to explain themselves. It reads like one man who wants to be taken seriously.", undefined, "nora_crew"),
    f("Ferris told me it was part of the act and said he'd send someone for the package. Nobody came.", undefined, "nora_ferris"),
    f("Tuesday night's paper ran it on page one: 'Teacher Missing; Group Claims Responsibility.'", undefined, "nora_printed"),
    f("A second letter came on Thursday morning, postmarked San Bernardino, Wednesday. It says they let her go and describes the shock, the tape and the orange juice. I'll give it to the investigator.", { flag: "letter2_waiting" }, "nora_letter2"),
  ],
  howard: [
    f("I'm a retired machinist. I live across Elm Street from Tom and Laura."),
    f("My knees keep me up. I keep a sleep log for my doctor and write down anything that wakes me.", undefined, "howard_sleep"),
    f("On Monday morning at about three a dark full-size van was parked at the curb in front of 418. At twenty to four it pulled away with no headlights until the corner of Third. I'll give the investigator the page from my log.", undefined, "howard_night"),
    f("The van was dark blue or black, no side windows, no ladder rack. It had a rough idle, like a Ford six.", { asked: "howard_night" }, "howard_van"),
    f("One man driving, I think, in a cap. I'd gone for water and missed him getting in.", { asked: "howard_night" }, "howard_driver"),
    f("The plate was California and began 2K. I'm sure of that much.", { asked: "howard_night" }, "howard_plate"),
    f("I gave a copy of my note to a young patrol officer on Monday at four. Nobody called me back.", { asked: "howard_night" }, "howard_police"),
    f("Tom and Laura are good neighbors. She plays piano Sunday nights. I've never heard a raised voice from that house.", undefined, "howard_couple"),
  ],
  diane: [
    f("I'm a florist. I live alone on Sycamore Lane in Oak Terrace with my dog."),
    f("At twenty to three on Friday morning, November fourth, I woke to a flashlight. A man in a ski mask with a gun and a stun gun whispered at me to roll over. He had black plastic ties.", undefined, "diane_night"),
    f("A little tape player on my nightstand said a crew was watching the house and resistance would be punished.", undefined, "diane_tape"),
    f("I hit him on the head with my ceramic lamp. He was bleeding. He dropped the ties and the stun gun, grabbed the tape player and ran out the back gate.", undefined, "diane_lamp"),
    f("He came in through the garage side door, which I don't always lock after taking out the trash on Thursdays. My dog was at the kennel that week.", undefined, "diane_door"),
    f("He had a steel thermos. The police said it held something orange and sweet.", undefined, "diane_thermos"),
    f("A pager fell out of his jacket by the side gate. The police have it.", undefined, "diane_pager"),
  ],
  gordon: [
    f("I'm Gordon Pell. I fix televisions, radios and stereos and do house calls on the mountain.", undefined, "gordon_who"),
    f("This is my mother's cabin. She's been in a care home in Redlands since spring.", undefined, "gordon_who"),
    f("I was home here on the night of October ninth. I haven't been down the hill in a month or more.", undefined, "gordon_week"),
    f("There's no phone line out on the north shore; I take my calls at the store payphone like everyone.", undefined, "gordon_phone"),
    f("The van under the tarp is my mother's old Ford. It's been in the shop since September and it doesn't run.", { inspected: "cb_van" }, "gordon_van"),
    f("Cable ties, blank cassettes and electrical tape are ordinary repair supplies. I record test tones on cassettes.", { hasEvidence: "E15" }, "gordon_purchases"),
    f("The gas on Monday morning was for the generator.", { hasEvidence: "E15" }, "gordon_gas"),
    f("The quarters were for the laundromat in Big Bear.", { hasEvidence: "E15" }, "gordon_quarters"),
    f("I type my invoices.", { hasEvidence: "E15" }, "gordon_ribbon"),
    f("The back window broke in a windstorm and I boarded it up.", { inspected: "cb_window" }, "gordon_window"),
    f("I don't know any Laura Kessler."),
    f("On November fourth I was asleep at home.", { hasEvidence: "E16" }, "gordon_oak"),
    f("I don't know anything about a pager. My mother never used one.", { hasEvidence: "E17" }, "gordon_pager"),
    f("I cut my head on the van's tailgate.", arrested, "gordon_head"),
  ],
  bennett: [
    f("I'm Detective Frank Bennett, LAPD, twenty-five years. Mariposa Bay isn't my town, but Walt Ferris lets me see his file."),
    f("Ferris has a boyfriend, a delay and two thousand dollars. Nobody bagged anything in the bedroom and nobody canvassed the street.", undefined, "bennett_case"),
    f("Ferris is honest and stubborn. He decides early.", undefined, "bennett_ferris"),
    f("I'll get the two glasses from the bedroom to Ventura County's lab. The results go to the investigator's desk.", { hasEvidence: "E02" }, "bennett_send_glasses"),
    f("The lab found the same sleep preparation in both glasses, and both had been wiped.", { hasEvidence: "E23" }, "bennett_lab_glasses"),
    f("Lumber mills in the mountains blow a noon whistle on weekdays.", { hasEvidence: "E08" }, "bennett_whistle"),
    f("Thousands of California plates begin 2K. I need more to narrow it.", { hasEvidence: "E06" }, "bennett_plate"),
    f("Plate 2KXL418 is a dark blue 1979 Ford Econoline registered to Vera M. Pell, Cabin 14, Tamarack Lake. The registration lapsed in August.", { inspected: "cb_van" }, "bennett_plate_full"),
    f("The pager from Oak Terrace is on an account in the name of Vera M. Pell, Cabin 14, Tamarack Lake, with the store payphone as its contact number. I'll send the investigator a copy.", { hasEvidence: "E16" }, "bennett_pager"),
    f("Vera Pell is seventy-four and has been in a care home in Redlands since April. Her son Gordon, thirty-eight, lives at the cabin and fixes televisions.", { hasEvidence: "E17" }, "bennett_vera"),
    f("I'll get the three letters and the Smith-Corona from the cabin to the sheriff's lab for comparison.", { hasEvidence: "E18" }, "bennett_send_typewriter"),
    f("The three letters were typed on the Smith-Corona from Cabin 14. That names the machine, not the man.", { hasEvidence: "E19" }, "bennett_typewriter"),
    f("I'll help with records, labs and other departments when you give me a reason. I don't work from theories."),
  ],
};
