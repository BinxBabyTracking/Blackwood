import type { Condition } from "@/game/engine/types";

/*
 * What each person knows, and will say, about the Alder Street case. Used to
 * answer questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's version of events. Bell, Shaw and Voss give
 *   their own accounts, lies included; nothing here confesses.
 * - A fact is gated exactly like the authored answer that reveals it, so no
 *   phrasing reaches information the investigation has not earned.
 * - Nothing about the second crime exists before the Marshes are found. Vivian
 *   and Graham know nothing after their last interview; they cannot be asked
 *   anything once Vivian has called.
 * - Times follow docs/C003-timeline.md. No forensic result beyond the reports.
 * - Sophie is spoken of gently and never as a witness.
 */

type Fact = { text: string; requires?: Condition; entry?: string };
const f = (text: string, requires?: Condition, entry?: string): Fact => ({ text, requires, entry });

const found: Condition = { flag: "marshes_found" };
const searched: Condition = { flag: "search_done" };

export const PERSONA: Record<string, string> = {
  rachel:
    "Rachel Kowalski, 37, public librarian in Bellwether, Jenna's older sister and the investigator's client. Grieving and exhausted, precise, quietly determined; now raising her five-year-old niece Sophie in Jenna's house. Talks about Sophie gently and never as a witness. After the Marshes are found she is shaken and asks plainly whether it was because of her; she does not blame the investigator.",
  vivian:
    "Vivian Marsh, 46, assistant principal at Bellwether Area High School, of 409 Alder Street. Polite, organized, careful with words, the kind of person who doesn't want to be wrong in front of anyone. Uneasy about what she saw on September 14 and increasingly frightened. Says less than she knows until she is sure; never names a company or a person outright.",
  graham:
    "Graham Marsh, 51, retired land surveyor, Vivian's husband. Friendly, dry, practical, protective of his wife. Thinks the police should handle it and that Vivian worries too much. Reads survey data at a glance. Does not know who was involved in anything.",
  lena:
    "Lena Ortiz, 42, manager of Hart's Quick Stop on Furnace Street. Busy, direct, warm, Pittsburgh-area plain speech. Remembers the little girl and the apple juice. Only describes what she saw in and from her store; could not identify anyone's face.",
  cross:
    "Det. Helen Cross, 48, Bellwether Police, lead investigator on Alder Street. Professional, tired, honest, a little defensive about how stuck the case is but glad of help. Not corrupt. Shares what is in her reports and the developments she has, explains what she can legally get. After the Marshes are found she is driven and grim, and tells the investigator plainly it was not their fault. Never speculates beyond the evidence.",
  reed:
    "Dr. Samuel Reed, 44, Calder County forensic scientist. Precise, patient, dry humor, allergic to overstatement. Explains what each test can and cannot say; never claims a unique identification from paint, color or blood type. Runs lab tests when asked.",
  voss:
    "Caleb Voss, 39, owner of Bellwether Redevelopment Group. Polished, confident, dismissive, talks like a press release about Riverside Commons bringing homes and jobs to Bellwether. Says he barely knew Ethan Cole. Explains the Bell Security payments as extra patrols and a security assessment. Becomes defensive when shown records and refers to his attorney. After the Marshes are found he is rattled about police attention but insists he knows nothing about it. Never admits anything.",
  bell:
    "Marcus Bell, 33, owner of Bell Security Services. Controlled, guarded, short answers, intimidating without ever making a threat. Ex-military bearing. Sticks to his account: home alone on September 14; Unit 4 hit a deer on Route 88 on September 15; on October 29 he worked the riverside post all night and Unit 4 was stolen from the garage overnight. Gives increasingly specific denials when pressed and asks for a lawyer when shown the lab results. Never admits anything.",
  shaw:
    "Trevor Shaw, 29, owner-operator of Shaw Towing and Recovery. Nervous, talkative, evasive, says too much and then tries to take it back. Friends with Marcus Bell. Sticks to a story that he was on a breakdown call on Route 51 on September 14, which changes when confronted with records. After the Marshes are found he is frightened, and insists, truthfully, that he was on a highway recovery job with state police that night. Never admits anything about September 14.",
  owen:
    "Owen Price, 56, retired early in September from the city records annex, now volunteers in its basement archive. Careful, anxious, decent, worried about his pension and about being blamed. Reluctant at first; once he decides to talk he is exact about dates and logins.",
  bennett:
    "Bennett, retired LAPD detective, forty years on the job, now Blackwood's records man, speaking by phone from Pittsburgh. Calm, dry, kind underneath. Pulls background records and asks for evidence rather than theories. Never goes beyond what the records show.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  rachel: [
    f("I'm a librarian at the Bellwether public library. Jenna was my younger sister, thirty-four. She was a vet tech at Northside Animal Clinic."),
    f("Jenna and Ethan split up two years ago but they were good about it. They did things together for Sophie. That Friday they took her to the fall carnival.", undefined, "rachel_night"),
    f("Sophie lives with me now, here in Jenna's house. She's five. She's seeing someone who helps kids after things like this. I don't want her asked about that night by anyone.", undefined, "rachel_sophie"),
    f("Ethan was a commercial electrician with Kessel Electric. The week before, he was jumpy. He said he'd seen something at work that wasn't right and he was going to the state about it.", undefined, "rachel_worried"),
    f("Ethan carried a gray canvas messenger bag everywhere that week. It wasn't in the car. That's the only thing that was taken.", undefined, "rachel_bag"),
    f("Detective Cross is decent. She says robbery, but she doesn't sound like she believes it.", undefined, "rachel_police"),
    f("Ethan was wiring temporary power at the Riverside Commons site, the old plating works on River Road.", { hasEvidence: "E09" }, "rachel_riverside"),
    f("Ethan came by on Thursday night, the thirteenth, and gave me a sealed envelope and said to hold onto it. I put it in the hall desk and forgot until you asked.", { event: "RE02" }, "rachel_envelope"),
    f("Vivian Marsh lives across from where it happened. She came to the funeral. She hugged me and said she was sorry she couldn't help more.", undefined, "rachel_vivian"),
    f("I saw the news about the Marshes. That woman tried to help us. I keep asking myself if it was because of us.", found, "rachel_marshes"),
  ],
  vivian: [
    f("I'm the assistant principal at Bellwether Area High School. We've lived at 409 Alder for nineteen years.", undefined, "vivian_job"),
    f("On September 14 I was reading. I heard pops, four or five, then more, then a crash. By the time I got to the porch the car was against the oak across the street.", undefined, "vivian_night"),
    f("Something dark was turning onto Furnace Street. Bigger than a car, I think. Fast. I told the officer I couldn't describe it.", undefined, "vivian_car"),
    f("From my porch you can't see past the Hallorans' hedge. I didn't see the shooting. I saw the crash, and something leaving.", undefined, "vivian_shooting"),
    f("There was a light in it. A small amber light on the dashboard, on the driver's side. I didn't tell the police that. I wasn't sure.", { deduction: "D02" }, "vivian_light"),
    f("Detective Cross talked to me the next morning. She was kind. I wasn't much help.", undefined, "vivian_police"),
    f("Graham thinks I should leave it to the police. He's probably right.", undefined, "vivian_graham"),
    f("I can't stop thinking about the little girl in the back seat.", undefined, "vivian_sophie"),
    f("Security companies do the parking at the football games. I've seen their vehicles. I'd rather not say more until I'm sure.", { any: [{ hasEvidence: "E25" }, { hasEvidence: "E26" }, { talkedTo: "bell" }] }, "vivian_bell"),
    f("I keep checking the locks at night now. I don't know why.", { deduction: "D02" }, "vivian_scared"),
  ],
  graham: [
    f("Retired surveyor. Thirty years with the county and then on my own. I fish now, mostly.", undefined, "graham_who"),
    f("September 14 I was asleep in front of the ballgame. Vivian woke me. By then the sirens were coming.", undefined, "graham_night"),
    f("Vivian hasn't been sleeping. She checks the locks twice. I tell her the police have it.", undefined, "graham_vivian"),
    f("The Sunday after the shooting, a dark SUV drove past slow, twice, down by the tree. I figured rubberneckers.", undefined, "graham_car"),
    f("Shown a survey sheet, I can tell you where a boring was drilled. If B-3 is at those coordinates, it's inside that building's slab, not out in the yard.", { hasEvidence: "E12" }, "graham_survey"),
    f("My advice: give what you've got to the police and let them carry it.", undefined, "graham_advice"),
  ],
  lena: [
    f("I manage Hart's, store 2, on Furnace. I was on the register that Friday night.", undefined, "lena_family"),
    f("The dad came in with the little girl about twenty to ten. She picked apple juice. Mom was at pump 3. He paid with her card.", undefined, "lena_receipt"),
    f("I printed the store copy of their receipt for the police and kept one. You can have it.", undefined, "lena_receipt"),
    f("There was a big dark SUV out past the pumps, by the dumpster. I didn't think anything of it then.", undefined, "lena_suv"),
    f("Before them, a guy came in for cigarettes, hood up, paid cash, didn't look at me.", undefined, "lena_man"),
    f("The outside camera saves thirty days. The owner pulled the clip for the police and I saved a copy on the computer in back. Go ahead and look.", undefined, "lena_camera"),
    f("Detective Cross came by on Sunday. I told her what I told you.", undefined, "lena_police"),
    f("About ten minutes after they left I heard sirens going down toward Alder.", undefined, "lena_after"),
    f("The cigarette guy had a work jacket, dark, with a patch on the shoulder like a uniform. I couldn't read it.", { callAnswered: "call_lena" }, "lena_patch"),
    f("The dad was nice. Tired. He had a gray bag over his shoulder, the kind with a flap.", undefined, "lena_ethan"),
  ],
  cross: [
    f("I'm the lead on Alder Street. Case 18-09-1147. Six weeks and I have two victims, two guns and no suspects.", undefined, "cross_case"),
    f("Robbery is the working theory because nothing else fits on paper. But they left the wallets, the cash and the phones. The only thing missing is his bag.", undefined, "cross_robbery"),
    f("The ME says the gunfire killed them, not the crash. I can give you the preliminary.", undefined, "cross_autopsy"),
    f("Twelve casings on the road: seven nine millimeter, five forty caliber. Two guns. State police say no match on file.", undefined, "cross_casings"),
    f("I have the property inventory. Wallets, phones, cash, all there. No bag.", undefined, "cross_inventory"),
    f("Vivian Marsh across the street came out after the shots. She couldn't describe the vehicle.", undefined, "cross_vivian"),
    f("The wreck went to impound on the rotation tow, Shaw Towing, at about half past two in the morning.", undefined, "cross_tow"),
    f("With Shaw's own log against him, I got a court order for his phone. You can see it.", { deduction: "D09" }, "cross_shaw_records"),
    f("A security company's SUV with fresh repairs three days after the shooting. I should have pulled body shop records in week one.", { deduction: "D08" }, "cross_bell"),
    f("If a developer altered a state clearance, that's a matter for the DA and the DEP. I'll make the calls.", { any: [{ deduction: "D04" }, { deduction: "D11" }] }, "cross_voss"),
    f("The Marshes were found in Bell Security's Unit 4 at the end of the riverside access road. Bell reported it stolen at six forty that morning.", found, "cross_bodies"),
    f("Graham took out twenty-five hundred in cash that morning. We found every dollar in the kitchen drawer. He was buying a boat motor. Not robbery.", found, "cross_bank"),
    f("Bell says Unit 4 was stolen from his garage overnight. I'd like to know how a stolen SUV ends up next to his own site trailer.", found, "cross_stolen"),
    f("Vivian emailed the school district at 9:20 that morning asking for the security contractor's vehicle list. Facilities forwarded her request to Bell Security at 2:14 PM.", found, "cross_facilities"),
    f("Bell's phone made no calls to Caleb Voss on October 29. The next morning Voss texted Bell, 'What the hell happened last night?'", searched, "cross_voss_text"),
    f("This happened before you ever got to that door. You didn't do this.", found, "cross_bodies"),
  ],
  reed: [
    f("Samuel Reed, Calder County Forensic Laboratory. I run trace, DNA and digital for the county.", undefined, "reed_who"),
    f("Paint can tell you a color, a manufacturer, a layer sequence. It can't tell you one car out of every car painted that color. Blood type narrows. DNA can identify. I say which is which.", undefined, "reed_limits"),
    f("A molded part number like that tells you the make and the panel. Paint on it can be compared with a vehicle if you find one.", { hasEvidence: "E05" }, "reed_trim"),
    f("Two calibers means two guns. That's as far as casings go without the guns themselves.", { hasEvidence: "E06" }, "reed_casings"),
    f("If there's blood on that door frame, I can tell you whose. Ask and I'll send a tech with Cross's people.", { flag: "cross_notified" }, "reed_blood"),
    f("Fleet vehicles usually have an insurer's tracker under the dash. I can pull it.", { hasEvidence: "E21" }, "reed_gps"),
    f("With the SUV here I can compare its paint and its trim with your fragment.", { all: [{ hasEvidence: "E05" }, { hasEvidence: "E21" }] }, "reed_paint"),
    f("Whatever Cross's search recovered, I can test it.", searched, "reed_gloves"),
  ],
  voss: [
    f("Caleb Voss. Bellwether Redevelopment Group. We take land this town gave up on and put families on it.", undefined, "voss_who"),
    f("Riverside Commons is two hundred and twelve homes on the old Keystone Plating site. Phase one breaks ground in the spring.", undefined, "voss_project"),
    f("Ethan Cole was an electrician for one of our subcontractors. I barely knew him. A terrible thing.", undefined, "voss_ethan"),
    f("The clearance is the clearance. It's on file with the city. Every permit we have is in order.", { any: [{ hasEvidence: "E10" }, { hasEvidence: "E11" }, { deduction: "D04" }] }, "voss_clearance"),
    f("Boring locations get adjusted in the field all the time. You'd have to ask the consultant.", { any: [{ hasEvidence: "E12" }, { deduction: "D04" }] }, "voss_b3"),
    f("I go to the annex for my own permits. I don't touch the city's computers.", { hasEvidence: "E16" }, "voss_annex"),
    f("Bell Security patrols the site. Copper thieves love a construction site.", undefined, "voss_bell"),
    f("The five thousand was extra patrols after we lost copper wire that week.", { hasEvidence: "E14" }, "voss_invoice"),
    f("The fifteen thousand was a site security assessment. Marcus did a full review.", { hasEvidence: "E30" }, "voss_wire"),
    f("On September 14 I was at home with my wife. You can ask her.", undefined, "voss_sept14"),
    f("On October 29 I was at the Chamber of Commerce dinner from six until ten. Two hundred people saw me.", found, "voss_oct29"),
    f("What happened to that couple is horrible. It has nothing to do with my company. I'm told the vehicle was stolen.", found, "voss_marshes"),
  ],
  bell: [
    f("Marcus Bell. I own Bell Security. Patrols, events, construction sites. Six years.", undefined, "bell_who"),
    f("Five vehicles. Two pickups, two SUVs and a van.", undefined, "bell_fleet"),
    f("Unit 4 is mine. I drive it.", undefined, "bell_unit4"),
    f("I hit a deer on Route 88 on the fifteenth. Saturday. Had it fixed Monday.", { hasEvidence: "E26" }, "bell_deer"),
    f("September 14 I was home. Alone. I live alone.", undefined, "bell_sept14"),
    f("Trevor Shaw tows for me. We go back. That's all.", undefined, "bell_shaw"),
    f("Voss is a client. Riverside Commons is a contract. That's all.", undefined, "bell_voss"),
    f("The five thousand was two extra guys on the site for three nights. Copper.", { hasEvidence: "E14" }, "bell_invoice"),
    f("Plenty of Explorers in this town.", { hasEvidence: "E05" }, "bell_trim"),
    f("I worked the riverside post on October 29, six to two. Alone. Unit 4 was in the garage when I left.", found, "bell_oct29"),
    f("Somebody took Unit 4 from the garage overnight. I reported it as soon as I found it gone.", found, "bell_stolen"),
    f("I don't know that woman.", found, "bell_vivian"),
    f("I'm done talking without a lawyer.", { hasEvidence: "E32" }, "bell_gloves"),
  ],
  shaw: [
    f("Trevor Shaw. Shaw Towing and Recovery. One truck, me, and a dispatch app.", undefined, "shaw_who"),
    f("I'm on the police rotation. I towed that car off Alder Street that night. Worst thing I ever hooked up.", undefined, "shaw_tow"),
    f("September 14 I was on a breakdown call out on Route 51. Guy's car died. Cash job.", undefined, "shaw_sept14"),
    f("Marcus and me go back to high school. I tow for his company.", undefined, "shaw_bell"),
    f("The GPS on that truck glitches. It says I'm places I'm not.", { hasEvidence: "E28" }, "shaw_dispatch"),
    f("Towers bounce around. That doesn't mean anything.", { hasEvidence: "E29" }, "shaw_tower"),
    f("Marcus paid me for some tows. Cash. That's how it works with him.", { any: [{ hasEvidence: "E29" }, { deduction: "D10" }] }, "shaw_payment"),
    f("I don't know any Voss. I tow cars.", undefined, "shaw_voss"),
    f("October 29 I was on a jackknifed tractor-trailer on 79 with the state police from six till after eleven. Ask them. Ask anybody.", found, "shaw_oct29"),
    f("Those people on the news, that's got nothing to do with me. Nothing.", found, "shaw_marshes"),
    f("I don't know whose number that is. I get calls from all kinds of numbers.", { all: [{ flag: "warned" }, { hasEvidence: "E29" }] }, "shaw_prepaid"),
    f("I'm not sleeping. I'm not talking about why.", found, "shaw_scared"),
  ],
  owen: [
    f("Owen Price. I was a records clerk at the annex for twenty-two years. I volunteer down here in the archive now.", undefined, "owen_who"),
    f("I retired early, September 7. Let's say it was suggested.", undefined, "owen_retired"),
    f("The permit portal keeps every version of a file and who touched it. Most people don't know that.", undefined, "owen_portal"),
    f("In August I noticed the Riverside Commons clearance on the portal didn't match the paper in the box. I reported it.", undefined, "owen_replaced"),
    f("I kept a copy of the portal history and the sign-in page. You can have them.", { asked: "owen_replaced" }, "owen_log"),
    f("Janet Fenn was on vacation the week of July 30. Her login was on a sticky note at the public desk. Half the building knew it.", { hasEvidence: "E16" }, "owen_jfenn"),
    f("Mr. Voss signed in at 4:20 that Friday and out at 5:05. The file was replaced at 4:47 from the public terminal.", { hasEvidence: "E16" }, "owen_voss"),
    f("An electrician came in on September 11 and asked to see the paper box for Riverside Commons. Polite. Took a lot of notes.", undefined, "owen_ethan"),
  ],
  bennett: [
    f("Forty years LAPD, retired. Blackwood keeps me on to pull records. Pennsylvania records come slower, but they come.", undefined, "bennett_case"),
    f("Cross is a good detective with a stalled case and no budget. She gave the family her file. That's her asking for help.", undefined, "bennett_cross"),
    f("Caleb Voss: no record. Two lawsuits from contractors over money, both settled.", { any: [{ talkedTo: "voss" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }] }, "bennett_voss"),
    f("Marcus Bell: Army military police, honorable discharge. Licensed security contractor. No record.", { any: [{ talkedTo: "bell" }, { hasEvidence: "E14" }] }, "bennett_bell"),
    f("Trevor Shaw: a DUI at twenty-two, nothing since. Owes money on that truck.", { any: [{ talkedTo: "shaw" }, { hasEvidence: "E28" }] }, "bennett_shaw"),
    f("A prepaid phone bought with cash is built to have no name. What it has is the numbers it called.", { flag: "warned" }, "bennett_prepaid"),
    f("A witness gets killed because somebody was afraid of what she knew, not because somebody went knocking.", found, "bennett_marshes"),
  ],
};
