import type { Condition, Effect } from "@/game/engine/types";

/*
 * What each person knows, and will say, about the Vale case. Used to answer
 * questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's version of events. Victor Harlan's facts are
 *   his account, including the parts that are untrue; Samuel Finch's are his
 *   lie until his card reaches the investigator; nothing here confesses.
 * - A fact is gated exactly like the authored answer that reveals it, so no
 *   phrasing of a question reaches information the investigation has not earned.
 * - Times follow docs/C004-timeline.md. October 1927: nobody knows about
 *   fingerprints matched to anyone, modern blood work, or anything later.
 */

type Fact = { text: string; requires?: Condition; entry?: string; effects?: Effect[] };
const f = (text: string, requires?: Condition, entry?: string, effects?: Effect[]): Fact => ({ text, requires, entry, effects });

const held: Condition = { flag: "held" };
const over: Condition = { flag: "captivity_over" };
const rescue: Condition = { env: "captivity", is: "rescue" };
const samuelClean: Condition = { deliveryOpened: "samuel_card" };
const moneyKnown: Condition = { any: [{ hasEvidence: "E12" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }] };

export const PERSONA: Record<string, string> = {
  louise:
    "Louise Vale, 38, piano teacher in Hyde Park, Chicago, October 1927; the murdered radio announcer Arthur Vale's sister and the investigator's client. Composed, precise, grieving, increasingly angry. Loved her brother and saw his faults. Does not believe Henry Mercer did it. Speaks in clean, educated sentences; no modern idiom.",
  victor:
    "Victor Harlan, 45, manager of radio station WCRB, Chicago, October 1927. Polished, gracious, controlled, condescending; corrects other people's facts. Sticks to his account: in his office 9:30 to 10:10, in the lobby with the sponsor when Arthur Vale went on 'live' at 10:15, Lakeshore Novelty is an outside production house he doesn't know the owner of, he has never met Russo. Points suspicion at Henry Mercer. Turns cold when pressed with documents in his own hand, and refers questions to his attorney. Never admits anything.",
  henry:
    "Henry Mercer, 43, Arthur Vale's business partner in Vale and Mercer Productions, Chicago, 1927. Bitter, quick, defensive, ashamed of being broke; honest except for the one lie he told the police about going 'home.' Grieving under the sarcasm. Never threatens anyone.",
  samuel:
    "Samuel Finch, 27, radio engineer at WCRB, 1927. Earnest, technical, nervous, says 'sir.' Until his card reaches the investigator he insists Arthur Vale was live at 10:15 and that he never left the board, and gets flustered about the pen recorder; afterward he is candid, wretched, and precise about times. Never knew Arthur was dead behind the curtain.",
  clara:
    "Clara Whitcomb, 32, secretary at WCRB, 1927. Careful, soft-spoken, exact about times and paperwork; frightened of the station manager but honest and increasingly brave. Only says what she saw herself.",
  russo:
    "Dominic Russo, 39, runs the Blue Lantern speakeasy behind a cigar store on North Clark Street, Chicago, 1927. Amused, unhurried, polite, quietly dangerous; calls himself a businessman. Admits nothing until shown his own note, then admits the money business plainly but insists he had nothing to do with any killing, and says Harlan once asked if his men could 'have a word' with the announcer, which he refused. Never threatens the investigator directly.",
  rose:
    "Rose Marlowe, 29, singer with the Starlight Orchestra on WCRB and at the Blue Lantern on Saturdays, Chicago, 1927. Warm, husky, wry, calls people 'honey'; grieving for Arthur Vale under the wit. Only says what she saw and heard.",
  keene:
    "Officer Thomas Keene, 49, Chicago Police Detective Bureau, 1927. Gravelly, patient, plain-spoken, dry. Doubts his captain's theory about Henry Mercer. Shares records and gets the City Chemist to test things, and will act on evidence, not feelings. Never goes beyond the reports. Never suggests the investigator brought any danger on themselves.",
  agnes:
    "Agnes Doyle, 54, widow, keeps a rooming house on South Halsted Street, Chicago, 1927. Brisk, sharp, practical, a faint Irish lilt; fiercely protective of her lodgers and her register. Indignant the police never asked her.",
  frankie:
    "Frankie Moretti, 24, night tally clerk at Riverside Shipping on Kinzie Street, Chicago, 1927. Jumpy, fast-talking, decent, scared of the men who run bay 6 and ashamed of the job. Says 'mister.' Helps when he can do it quietly; after Monday night he decides to tell the police everything he counted.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  louise: [
    f("I teach piano from my house at 5418 Dorchester Avenue, Hyde Park. Arthur was my only family."),
    f("I hired the bureau because the police have decided it was Henry Mercer and stopped looking.", undefined, "louise_hire"),
    f("On Wednesday night, October nineteenth, Arthur telephoned and said to listen on Friday at twenty-five to eleven; he would make an announcement about money at the station that would cost some people their jobs.", undefined, "louise_announcement"),
    f("I last saw Arthur at Sunday dinner, the sixteenth. He said Victor Harlan was 'getting grand.'", undefined, "louise_lastsaw"),
    f("Henry borrowed money from Arthur and they shouted about it, but Henry would sooner cry than hit anyone.", undefined, "louise_henry"),
    f("Lately Arthur called Victor Harlan 'the Accountant,' and said he had started taking money from places that didn't make any noise.", undefined, "louise_victor"),
    f("Arthur took me once to hear Rose Marlowe sing at a club behind a cigar store on Clark Street.", undefined, "louise_rose"),
    f("A letter from Arthur came on Thursday and I didn't open it until Monday. It's on my piano.", { flag: "letter_found" }, "louise_letter"),
    f("I had never heard of Lakeshore Novelty before Arthur's letter.", { any: [{ hasEvidence: "E12" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }] }, "louise_lakeshore"),
    f("Officer Keene told me what happened at the warehouse and that it wasn't my fault, or the investigator's.", over, "louise_warehouse"),
  ],
  victor: [
    f("I have managed WCRB since 1924. I gave Arthur Vale his first microphone.", undefined, "victor_arthur"),
    f("On Friday I was in my office with the accounts and the door shut from half past nine until ten past ten.", undefined, "victor_evening"),
    f("At ten past ten I went to the lobby to meet our sponsor, Mr. Gerald Hollister of Hollister's Fine Coffees.", undefined, "victor_evening"),
    f("At a quarter past ten Mr. Hollister and I heard Arthur open his program, live, on the lobby loudspeaker. He was in fine voice.", undefined, "victor_broadcast"),
    f("At twenty-five to eleven Finch came for me; Arthur hadn't answered his cue and the door was barred. We forced it at about twenty to eleven.", undefined, "victor_found"),
    f("Arthur liked the control room curtain drawn when he was doing something special.", undefined, "victor_curtain"),
    f("I assumed the announcement was a new sponsor.", undefined, "victor_announcement"),
    f("Henry Mercer shouted at Arthur in our lobby at a quarter past eight and told him he'd be sorry.", undefined, "victor_henry"),
    f("At nine Arthur asked to save his voice for the announcement, so I rewrote the 10:15 card for his rehearsal disc. He agreed.", { hasEvidence: "E05" }, "victor_card"),
    f("Not announcing the recording was an oversight.", { any: [{ hasEvidence: "E05" }, { hasEvidence: "E08" }] }, "victor_unannounced"),
    f("I signed disc A-114 out of the workshop to give it to Finch at the board.", { hasEvidence: "E08" }, "victor_disc"),
    f("I meant to look in on Arthur at ten to ten and didn't; the accounts ran long, so I crossed it out of my book.", { hasEvidence: "E16" }, "victor_diary"),
    f("I went into the storage room only to put out a lamp that had been left burning; Miss Whitcomb is mistaken about the time.", { hasEvidence: "E17" }, "victor_storage"),
    f("I had the storage room lock changed on Saturday because tubes and discs go missing.", { any: [{ hasEvidence: "E16" }, { flag: "clara_panel" }, { inspected: "st_lock" }] }, "victor_locksmith"),
    f("The Blue Lantern is a supper club and a good customer that buys announcements.", moneyKnown, "victor_bluelantern"),
    f("Lakeshore Novelty is an outside production house; I don't remember who owns it.", moneyKnown, "victor_lakeshore"),
    f("I have never met Dominic Russo. Our business is done by mail.", { any: [{ talkedTo: "russo" }, { hasEvidence: "E23" }, { hasEvidence: "E15" }] }, "victor_russo"),
    f("On Monday night I was at home in bed.", over, "victor_warehouse"),
  ],
  henry: [
    f("I'm Arthur's partner in Vale and Mercer Productions. We make Vale After Dark and sell it to sponsors."),
    f("The argument at a quarter past eight was about four thousand dollars I owed Arthur. I said 'You'll be sorry if you do this to me, Arthur, I'll go under.'", undefined, "henry_argument"),
    f("Arthur lent me four thousand dollars in March. This month he wanted it all back by November first, because he said he wouldn't be at WCRB much longer.", undefined, "henry_loan"),
    f("I left WCRB at twenty to nine and walked to Doyle's on South Halsted, arriving at twenty past nine, soaked. I played rummy in the parlor with Kowal and Briggs until after midnight.", undefined, "henry_evening"),
    f("I told the police I went 'home' because I was ashamed to say I live in a rooming house.", undefined, "henry_police"),
    f("My landlord, Mr. Szabo, padlocked my apartment at 1140 North Dearborn on October fifteenth; my letters are still on my desk there.", undefined, "henry_apartment"),
    f("At Doyle's on Friday I heard Arthur's opening on the radio at a quarter past ten: he said the sky was clear as a bell, stumbling on it, while it was pouring.", undefined, "henry_broadcast"),
    f("Hollister's agency, Crane and Ward, has a stenographer take down every program word for word, and our company gets a copy every Monday. I have Friday's, and the investigator can have it.", undefined, "henry_transcript", [{ giveEvidence: "E07" }]),
    f("Last week Arthur went through every September program log and asked me how many Blue Lantern spots I'd heard him read.", undefined, "henry_arthur"),
    f("Harlan and Arthur had been at each other since September. On Friday at twenty to nine Harlan was standing in the hall outside Studio A, looking at the door.", undefined, "henry_victor"),
    f("The Blue Lantern is behind the cigar store on North Clark; you ask the man at the counter for a box of Havanas, the blue label.", undefined, "henry_lantern"),
  ],
  samuel: [
    f("I'm WCRB's engineer: the control board, the transmitter line, and the recording workshop at the back.", undefined, "samuel_workshop"),
    f("I was at the control board all Friday evening.", undefined, "samuel_evening"),
    f("At ten past seven Arthur Vale rehearsed his opening and letters and I cut it on disc A-114, twelve minutes. He laughed at himself for stumbling on 'bell.'", undefined, "samuel_rehearsal"),
    f("Mr. Vale was live on the air from Studio A at a quarter past ten.", { not: samuelClean }, "samuel_1015"),
    f("Arthur Vale was not live at 10:15. I played disc A-114 to the air from turntable 2 on Mr. Harlan's card, and told the police he was live to keep my license.", samuelClean, "samuel_1015"),
    f("At five past nine Mr. Harlan gave me the 10:15 card rewritten in his own hand, drew the curtain himself from the studio side at about ten past nine, and brought me disc A-114.", samuelClean, "samuel_evening"),
    f("At twenty-five to eleven Mr. Vale didn't answer his cue light; the door was barred, I fetched Mr. Harlan from the front, and we forced it at twenty to eleven.", undefined, "samuel_cue"),
    f("Federal Radio Commission rules require any program by recording to be announced as one; a station can lose its license and an engineer his ticket.", undefined, "samuel_rules"),
    f("The pen recorder on the wall is the line register; it writes down which key feeds the transmitter, minute by minute, by itself.", undefined, "samuel_recorder"),
    f("Disc A-114 is back in the workshop rack; the log shows Mr. Harlan took it out at ten past nine and nobody signing it back.", { any: [{ hasEvidence: "E06" }, { hasEvidence: "E08" }] }, "samuel_disc"),
    f("The nine-pound brass base weight from the Studio A floor stand is missing.", { any: [{ hasEvidence: "E20" }, { hasEvidence: "E01" }] }, "samuel_weight"),
    f("Behind the amplifier rack is a cable crawlway to the storage room; its turn-buttons are on the storage side. Only Mr. Harlan, the builder and I know it's there.", { any: [{ hasEvidence: "E03" }, { inspected: "sa_rack" }] }, "samuel_panel"),
    f("I didn't see Mr. Harlan between ten past nine and twenty-five to eleven, when he came from the front.", samuelClean, "samuel_victor"),
  ],
  clara: [
    f("I've been the secretary at WCRB for six years; I type the invoices from the program logs and keep the carbons."),
    f("At a quarter past eight Henry Mercer told Mr. Vale, 'You'll be sorry if you do this to me, Arthur, I'll go under,' and left about twenty to nine.", undefined, "clara_argument"),
    f("At twenty to eleven Samuel and Mr. Harlan forced the studio door, and I telephoned the police at eight minutes to eleven.", undefined, "clara_discovery"),
    f("On Tuesday the eighteenth Mr. Vale spent two hours at my desk with the advertising ledger and the September program logs.", undefined, "clara_books"),
    f("Samuel and Mr. Harlan have keys to the equipment storage room; it was never locked until Saturday.", undefined, "clara_keys"),
    f("At about two minutes past ten I saw Mr. Harlan come out of the equipment storage room wiping his hands, his right cuff wet. I've written it down and signed it.", { any: [{ hasEvidence: "E03" }, { hasEvidence: "E16" }, { hasEvidence: "E20" }, { hasEvidence: "E22" }] }, "clara_victor"),
    f("I typed the September Blue Lantern invoice for six announcements; Mr. Harlan had me retype it for forty-six, payable to Lakeshore Novelty. I kept the carbon.", { any: [{ hasEvidence: "E13" }, { hasEvidence: "E12" }, { asked: "clara_books" }] }, "clara_invoice"),
    f("Lakeshore Novelty's invoices come from a post-office box, and Mr. Harlan opens them and signs their checks himself.", { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }, { hasEvidence: "E12" }] }, "clara_lakeshore"),
    f("I didn't tell the police because Mr. Harlan was standing beside me with his hand on my shoulder.", { hasEvidence: "E17" }, "clara_police"),
    f("On Saturday Mr. Harlan had the storage room lock changed and kept the only key, and the turn-buttons on the cable panel had been oiled.", { flag: "clara_panel" }, "clara_panel"),
  ],
  russo: [
    f("I'm Dominic Russo and this is the Blue Lantern, a supper club.", undefined, "russo_who"),
    f("On Friday I was here from six until four in the morning in front of forty customers.", undefined, "russo_friday"),
    f("Arthur Vale came on Saturday nights to hear Rose sing; lately he asked my waiters how much the club spends on the radio.", undefined, "russo_arthur"),
    f("The club advertises on WCRB because radio is good for business.", moneyKnown, "russo_spots"),
    f("Lakeshore Novelty is advertising, as far as I'm concerned.", moneyKnown, "russo_lakeshore"),
    f("The crates are radio cabinets, it says so. All right: it's rye, and rye didn't kill anybody.", { hasEvidence: "E15" }, "russo_cabinets"),
    f("I've never met Victor Harlan.", { not: { hasEvidence: "E23" } }, "russo_victor"),
    f("Harlan and I do business: he squares the books at the station and pays the warehouse, and I pay the station for my spots.", { hasEvidence: "E23" }, "russo_victor"),
    f("Two weeks ago Harlan asked if my men could 'have a word' with a nosy announcer; I told him I'm in the supper business.", { any: [{ hasEvidence: "E23" }, { deduction: "D10" }] }, "russo_suspicion"),
    f("Sal and Augie work for whoever pays them; Monday night wasn't my idea, and the ledger in that office was mine.", over, "russo_warehouse"),
  ],
  rose: [
    f("I sang with the Starlight Orchestra in Studio B from nine to half past on Friday.", undefined, "rose_friday"),
    f("At twenty-five to ten Arthur opened the Studio A door for me, read me his opening, said to listen at twenty-five to eleven, and barred the door after me.", undefined, "rose_door"),
    f("Arthur always barred the studio door when he was on the air.", undefined, "rose_bar"),
    f("Arthur sat at the front table at the Blue Lantern on Saturday nights; we had dinner some Sundays.", undefined, "rose_arthur"),
    f("On Friday at half past nine Victor Harlan was walking up and down in the hall outside his own office.", undefined, "rose_victor"),
    f("To get into the Blue Lantern you go to Lantern Cigars, 818 North Clark, and ask for a box of Havanas, the blue label.", undefined, "rose_lantern"),
    f("Dominic Russo pays the band on time; he isn't nice, he's polite.", undefined, "rose_russo"),
    f("The week before, Arthur asked me how many times I'd heard him say the Blue Lantern's name on the air. Never.", undefined, "rose_announcement"),
    f("At the door Arthur read me 'and it's raining on the Loop'; he'd crossed out 'clear as a bell' and never stumbled.", { callAnswered: "call_rose" }, "rose_raining"),
  ],
  keene: [
    f("My captain likes Henry Mercer because he shouted, owed money and lied about going home.", undefined, "keene_mercer"),
    f("A dead man doesn't bar a door, and a man who barred himself in doesn't hit himself on the side of the head.", undefined, "keene_case"),
    f("I have the Bureau photographer's prints and sketch of Studio A, and the investigator can have a copy.", undefined, "keene_photos", [{ giveEvidence: "E01" }]),
    f("I have the coroner's physician's report, and the investigator can have it.", undefined, "keene_coroner", [{ giveEvidence: "E02" }]),
    f("I have a summary of the statements taken on Friday night, and the investigator can have it.", undefined, "keene_statements", [{ giveEvidence: "E22" }]),
    f("Nothing in the room fit the coroner's description of the weapon.", undefined, "keene_weapon"),
    f("The City Chemist, Tessaro, can test a weight for human blood and its group, but not whose hand held it.", { hasEvidence: "E18" }, "keene_send_weight"),
    f("Tessaro found human blood of Vale's group on the brass weight, wiped with the rag.", { labReady: "weight" }, "keene_lab"),
    f("Dominic Russo runs rye through the Blue Lantern; I've never known him near a killing.", { any: [{ talkedTo: "russo" }, { hasEvidence: "E13" }, { hasEvidence: "E15" }] }, "keene_russo"),
    f("Victor Harlan gave a statement that was too smooth.", undefined, "keene_victor"),
    f("I can't raid a warehouse on a note. Find which door and somebody with a key.", { all: [held, rescue] }, "keene_partner"),
    f("With the ledger and the Packard I can open Harlan's safe. None of Monday night is the investigator's fault.", over, "keene_after"),
  ],
  agnes: [
    f("Henry Mercer came in on Friday at twenty past nine, soaked, had supper at half past and played rummy until a quarter past twelve. It's in my register, and the investigator can have the page.", undefined, "agnes_friday", [{ giveEvidence: "E11" }]),
    f("I chain the front door at ten and the key's on my belt; the back stairs creak and my room's at the bottom of them.", undefined, "agnes_door"),
    f("Mr. Mercer has had Room 4 since the fifteenth.", undefined, "agnes_henry"),
    f("At a quarter past ten on Friday Mr. Vale said on the radio the sky was clear as a bell, and Mr. Mercer laughed because it was pouring.", undefined, "agnes_radio"),
    f("The police have never come to ask me anything.", undefined, "agnes_police"),
  ],
  frankie: [
    f("I'm the night tally clerk at Riverside Shipping. I count what comes in and goes out.", undefined, "frankie_job"),
    f("Bay 6 is Mr. Russo's people; a man called Sal at nights and sometimes Augie.", undefined, "frankie_who"),
    f("The radio cabinets are Canadian rye, paid for by checks from some advertising company.", { hasEvidence: "E15" }, "frankie_cabinets"),
    f("I'll draw the warehouse for the investigator: twelve bays, river doors chained from the yard at night, my tally office upstairs, visible from the Wells Street bridge.", { any: [{ hasEvidence: "E15" }, { asked: "frankie_cabinets" }] }, "frankie_sketch", [{ giveEvidence: "E25" }]),
    f("Sometimes a Packard comes late and a man in a gray coat goes upstairs to the book.", { any: [{ hasEvidence: "E15" }, { hasEvidence: "E23" }] }, "frankie_harlan"),
    f("I didn't write the note; somebody used my initials.", { any: [held, over] }, "frankie_note"),
    f("I don't know which room upstairs they're using; I have the keys to the river doors if I knew which one.", { all: [held, rescue] }, "frankie_where"),
    f("Six flashes from my window means bay 6; I'll unchain the river door there.", { all: [held, rescue, { flag: "signal_seen" }] }, "frankie_door", [{ setFlag: "door_unchained" }]),
    f("I'm quitting, and I'll tell Officer Keene everything I counted.", over, "frankie_after"),
  ],
};
