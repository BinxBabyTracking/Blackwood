import type { ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { asker, ch, ded, has, shown } from "./util";

/*
 * Interviews with the people of the town: Sarah, Wade, Rebecca, Andrew, and the
 * three professionals (Det. Mitchell, Dr. Brooks, Jessica Kemp, Karen Novak).
 * Written against docs/C006-timeline.md. Nobody confesses. Wade's answers are
 * his own story, lies included. Nobody states a result that is not in a report.
 */

const glennDead = { event: "RE06" };
const trentArrested = { flag: "trent_arrested" };

// ------------------------------------------------------------------ Sarah
const sarah = asker("sarah");
const sarahQ: DialogueQuestion[] = [
  sarah("sarah_emily", "Emily", "What was Emily like?", ["emily", "sister", "like", "person", "who was she"], [
    "Stubborn. Funny. She'd argue with a stop sign. She was saving up to go to Pitt in the spring, she wanted to do photography, real photography, not school pictures.",
    "She was the one who got Dad to laugh. After she was gone nobody did.",
  ], { reveals: "Emily planned to start at Pitt in the spring of 1997 and wanted to be a photographer." }),
  sarah("sarah_night", "The night", "Tell me about the night she left.", ["night", "left", "last", "august 17", "saturday", "leave", "bag", "remember", "disappeared", "disappear", "went missing", "vanished", "what happened"], [
    "I was sixteen. She came home from the studio around a quarter after six, didn't say much at dinner, and went up to Mom's room to use the phone. Maybe twenty to eight. Talking low.",
    "At eight thirty she came down with her navy overnight bag and said, 'If Wade calls, I'm at Becky's.' I asked if they broke up. She said, 'Tonight they do.' And she drove off.",
    "I wrote it all down for you. Every word I remember. Here.",
  ], { effects: [{ giveEvidence: "E019" }, { timeline: { time: "8:30 PM (Sat 8/17/96)", text: "Emily leaves home with her overnight bag: \"If Wade calls, I'm at Becky's.\"", source: "Sarah (E019)" } }], reveals: "Emily left at 8:30 PM with her overnight bag, saying she'd be at Rebecca's and that she and Wade were breaking up \"tonight.\"" }),
  sarah("sarah_father", "Dad and the plant", "Why did your father think the company was responsible?", ["father", "dad", "ron", "company", "plant", "steel", "blame", "responsible"], [
    "Dad was the union safety steward in the West End. In March of ninety-six he wrote a complaint that the gas monitors in some gallery didn't work. In June three men died down there and the company said it was their own fault.",
    "That summer somebody in the office slipped him a copy of a memo. Emily took it to the studio and photographed it. Dad always said that's why she was gone. She found something and they made her disappear.",
  ], { reveals: "Ron Lasko filed a complaint about Gallery B in March 1996; someone in the plant office gave him a memo that Emily photographed." }),
  sarah("sarah_wade", "Wade", "Tell me about Wade Reeves.", ["wade", "reeves", "boyfriend", "garage"], [
    "They went together about a year and a half. He was Gus Reeves's nephew, worked at the garage. Charming when he wanted to be. Mom didn't love him.",
    "He owns the garage now. Married, two kids. I get my oil changed in Brackett.",
  ]),
  sarah("sarah_w", "Wade", "Who is \"W.\" on Emily's calendar?", ["w", "who was w", "who is w", "w.", "calendar", "east gate", "end it", "initial", "letter w"], [
    "Wade. It has to be Wade. She was ending it, she told me so herself that night.",
    "But the East Gate? Why would she meet him at the mill? I always thought she went there because of Dad's papers.",
  ], { requiresEvidence: ["E004"], reveals: "Sarah is sure \"W.\" is Wade Reeves." }),
  sarah("sarah_rebecca", "Rebecca", "What about Rebecca Sloan?", ["rebecca", "becky", "sloan", "friend", "best friend"], [
    "Becky was her best friend since fourth grade. She told the police Emily never came, never called. After that she couldn't look at any of us.",
    "She still lives on Larch Street. She crosses the street when she sees me.",
  ]),
  sarah("sarah_job", "Emily", "Where did Emily work?", ["work", "job", "studio", "corso", "photo", "vince"], [
    "Corso Photo and Frame on Main Street. Vince Corso let her use the darkroom after hours if she paid for paper. He's still there. He's about a hundred.",
  ]),
  sarah("sarah_car", "The car", "How did Emily drive?", ["drive", "drove", "sit", "sat", "sitting", "seat", "car", "cavalier", "brackett", "bus"], [
    "Practically sitting on the steering wheel. She was five three and she hated feeling far from the pedals. Mom used to say she drove like a little old lady.",
    "And she never took a bus in her life. Brackett depot? She'd sooner have walked to Pittsburgh.",
  ], { requiresEvidence: ["E008"], reveals: "Emily, 5 ft 3 in, always drove with the seat pulled all the way forward, and never took the bus." }),
  sarah("sarah_ring", "Emily", "Do you recognize the class ring that was in her pocket?", ["ring", "class ring", "war", "pocket", "jacket"], [
    "That's Wade's. Hollow Creek High, ninety-four. She wore it on a chain around her neck for a year. That summer she took it off and kept it in her jacket.",
    "She went to give it back. Didn't she.",
  ], { requiresEvidence: ["E015"], reveals: "The class ring is Wade's; Emily had stopped wearing it that summer." }),
  sarah("sarah_prints", "Dad and the plant", "Where did your father get the memo Emily photographed?", ["memo", "prints", "photographed", "copy", "office", "who gave"], [
    "He never said. 'Somebody in the GM's office who's sick about it.' He wouldn't give the name, not even to Mom. He said she'd lose her job.",
    "So it was a woman. That's all I ever got out of him.",
  ], { requiresEvidence: ["E006"] }),
  sarah("sarah_pager", "The pager", "Do you know whose number is on Emily's pager?", ["pager", "beeper", "number", "0183", "page"], [
    "No. Mom called it from our phone. A man answered \"front desk\" and hung up on her when she asked who had paged Emily. She never found out where it was. Granger said it was probably a friend. Then he gave the card back.",
  ], { requiresEvidence: ["E020"] }),
  sarah("sarah_diary", "Emily", "Who tore the page out of Emily's diary?", ["diary", "torn", "page", "august 14"], [
    "It was like that when Mom found it. Emily must have done it herself. She did that, when she was angry. Tore things out so she wouldn't read them again.",
  ], { requiresEvidence: ["E003"] }),
  sarah("sarah_company", "Dad and the plant", "What if the company had nothing to do with Emily's death?", ["company", "nothing to do", "not the company", "two", "separate", "wade did"], [
    "Then my father died believing a lie, and the truth was somewhere else the whole time.",
    "No. I'm sorry. Go on. Show me. I said I wanted what happened, not what's convenient. I meant it.",
  ], { requiresDeductions: ["D31"], reveals: "Sarah is ready to hear that Emily's death may not be the company's doing." }),
  sarah("sarah_end", "Dad and the plant", "I think I know what happened to Emily.", ["know what happened", "tell you", "truth", "who did it"], [
    "Then write it down. All of it, the plant too.",
    "I'll read it at the kitchen table where she used to do her homework.",
  ], { requiresDeductions: ["D32"] }),
];

// ------------------------------------------------------------------ Wade
const wade = asker("wade");
const wadeQ: DialogueQuestion[] = [
  wade("wade_emily", "Emily", "You and Emily were together?", ["together", "girlfriend", "emily", "relationship", "dating"], [
    "Year and a half, about. We were kids. It was a long time ago.",
    "I'm sorry she's dead. I am. I just figured she was in Pittsburgh with three kids and a minivan.",
  ]),
  wade("wade_lastseen", "That weekend", "When did you last see Emily?", ["last see", "last saw", "last time", "when"], [
    "Friday night. At the Corner Mart. We had a fight. I told the cops all this in ninety-six.",
  ], { reveals: "Wade says he last saw Emily on Friday, August 16, at the Corner Mart." }),
  wade("wade_saturday96", "That weekend", "Where were you on Saturday night, August 17?", ["saturday", "where were you", "that night", "alibi", "home"], [
    "Worked for Gus till six. Went home. Watched a movie. Went to bed. My mother told them the same thing.",
  ]),
  wade("wade_pittsburgh", "That weekend", "Did Emily talk about leaving town?", ["leave", "leaving", "pittsburgh", "run away", "runaway"], [
    "All summer. Sick of Hollow Creek, sick of me, going to Pittsburgh. So when she was gone, what was I supposed to think?",
  ]),
  wade("wade_fight", "That weekend", "What was the fight at the Corner Mart about?", ["fight", "argument", "corner mart", "friday", "threw"], [
    "Nothing. She was wound up. She said I lied about where I went at night. She threw my ring at me, I threw it back at her. Kid stuff.",
  ], { requiresEvidence: ["E011"], reveals: "Wade says Emily accused him of lying about where he went at night; she threw his class ring at him on Friday and he threw it back." }),
  wade("wade_plant", "Emily", "Did Emily talk about the plant, or Gallery B?", ["plant", "gallery", "mill", "father", "memo", "accident"], [
    "Her dad's crusade. Every night. Gallery this, Stroud that. I told her to drop it. Those people don't play.",
  ], { variants: [{ requires: ch(2), reply: ["Her dad's crusade. Every night. Gallery this, Stroud that. Look, if you're asking did somebody from the plant want her gone, I'd look at the plant. Not at me."] }] }),
  wade("wade_eastmill", "The mill", "Did you ever go into the East Mill?", ["east mill", "inside", "maintenance building", "go in", "old shop", "tool crib"], [
    "Everybody went in there. Kids, bums, guys looking for scrap. I haven't been in there in twenty years.",
  ]),
  wade("wade_ring", "Emily", "Your class ring was in her jacket pocket.", ["ring", "class ring", "pocket", "jacket", "war"], [
    "I gave it to her in ninety-five. I guess she kept it. I don't know what you want me to say.",
  ], { requiresEvidence: ["E015"] }),
  wade("wade_truck", "The mill", "What were you driving in 1996?", ["truck", "ranger", "pickup", "drive", "ladder rack"], [
    "A Ranger. Blue. Half the guys in this town had a pickup.",
  ], { requiresEvidence: ["E011"], requires: ch(5) }),
  wade("wade_trent", "Customers", "Michael Trent brought his truck in the morning after Glenn Sutter was killed.", ["trent", "detail", "f-250", "work order", "cash"], [
    "Trent's a customer. He pays cash and he wants it yesterday. I detailed his truck. I don't ask people where they've been.",
  ], { requiresEvidence: ["E055"] }),
  wade("wade_copper", "The mill", "You sold copper to Mon Valley Scrap every week in the summer of 1996.", ["copper", "scrap", "mon valley scrap", "wire", "sold", "stripping"], [
    "Everybody stripped wire back then. So what. Gus paid me nothing, I was twenty.",
  ], { requiresEvidence: ["E082"], reveals: "Wade admits stripping and selling copper in 1996." }),
  wade("wade_denise", "Emily", "Tell me about Denise Hollins.", ["denise", "hollins", "brackett", "girl", "letters", "cheating"], [
    "That's nobody's business. That was a long time ago.",
  ], { requiresEvidence: ["E081"] }),
  wade("wade_saturday", "That weekend", "Walk me through that Saturday again. Emily called her friend at 7:40 to say she was meeting you at nine.", ["saturday again", "walk me through", "meeting you", "nine", "east gate", "motel", "rebecca"], [
    "All right. Look. I got the days mixed up in ninety-six, I was a kid.",
    "She came by the garage Saturday. Around four. She was upset, she said she needed space, she gave me my ring back. That was the last time I saw her. I didn't say so then because it made me look bad.",
  ], { requires: { event: "RE19" }, reveals: "Wade now says Emily came to the garage on Saturday at about four and gave back his ring; in 1996 he said he last saw her Friday." }),
  wade("wade_cab", "That weekend", "A tall young man took a cab from the Brackett depot to Mill Road at midnight that Saturday.", ["cab", "taxi", "brackett", "depot", "midnight"], [
    "Lots of tall guys in this valley. I was home.",
  ], { requiresEvidence: ["E018"] }),
  wade("wade_chain", "The mill", "Gus wrote down that you took chain, a padlock and his welder on Sunday the 18th.", ["chain", "padlock", "welder", "sunday", "ledger", "gus"], [
    "Gus wrote down everything. I did side jobs on Sundays. Welding a trailer hitch, whatever. I don't remember twenty-two years ago.",
  ], { requiresEvidence: ["E095"] }),
];

// ------------------------------------------------------------------ Rebecca
const rebecca = asker("rebecca");
const rebeccaQ: DialogueQuestion[] = [
  rebecca("rebecca_emily", "Emily", "Tell me about Emily.", ["emily", "friend", "best friend", "like"], [
    "She was braver than me about everything. She'd say the thing everybody was thinking. Fourth grade to the end.",
  ]),
  rebecca("rebecca_wade", "Wade", "What was going on between Emily and Wade?", ["wade", "fighting", "trouble", "relationship", "boyfriend"], [
    "They were fighting all summer. She thought he was lying to her about something. I didn't ask a lot of questions.",
  ], { variants: [{ requires: has("E086"), reply: ["They were fighting all summer. Wade had a temper when he got cornered. She told me once she was scared he'd lose it if she ever really pushed him. And that night she was going to push him."] }] }),
  rebecca("rebecca_night", "That night", "Did you hear from Emily that Saturday?", ["saturday", "hear from", "call", "page", "that night", "stay"], [
    "No. I told the police. I was home. She never called, she never came.",
  ], { variants: [{ requires: has("E086"), reply: ["You know I did. I wrote it all down for you and the detective. I'm sorry."] }] }),
  rebecca("rebecca_motel", "That night", "The last page on Emily's pager was the Valley View Motor Inn, room 12. Where were you that night?", ["valley view", "motel", "room 12", "0183", "pager", "where were you"], [
    "Oh God. Okay. Okay.",
    "I was at the Valley View. With a man who was married. He still is, and I won't give his name, it has nothing to do with Emily. I paged her so she'd know where I was. She called the room around twenty to eight.",
    "She said she was ending it with Wade that night, nine o'clock at the East Gate. He was always over at the old shop anyway. She'd found a letter from some girl in Brackett, and she was going to give him back his ring and tell Gus about the copper if he didn't leave her alone. She asked if she could stay at mine after. I said after eleven. She never came.",
    "I'll write it down. All of it. I should have done it in ninety-six.",
  ], { requiresEvidence: ["E020", "E085"], requires: ch(5), effects: [{ giveEvidence: "E086" }, { timeline: { time: "7:40 PM (Sat 8/17/96)", text: "Emily calls Rebecca at the Valley View Motor Inn: she is ending it with Wade at nine at the East Gate.", source: "Rebecca (E086)" } }], reveals: "Rebecca lied in 1996: Emily called her at 7:40 PM and said she was meeting Wade at nine at the East Gate to end it." }),
  rebecca("rebecca_denise", "Wade", "Who was the girl in Brackett?", ["girl in brackett", "denise", "letter", "other girl", "who was she"], [
    "Everybody our age figured out who, after. Denise Hollins. She worked the register at the Brackett Giant Eagle. She moved to Ohio. I think I can find her. Facebook finds everybody.",
    "Let me call her. She might talk to me.",
  ], { effects: [{ text: "t_rebecca_denise" }, { delivery: "denise_letters" }], reveals: "Wade's other girlfriend in 1996 was Denise Hollins of Brackett, now in Ohio." }),
  rebecca("rebecca_shop", "Wade", "What did Emily mean, Wade was \"always over at the old shop\"?", ["old shop", "east mill", "maintenance", "copper", "night"], [
    "The old maintenance building in the East Mill. Wade took copper out of there at night all that summer and sold it. Everybody our age knew. Gus didn't.",
  ], { requiresEvidence: ["E086"], effects: [{ setFlag: "scrap_lead" }], reveals: "Wade spent his nights that summer stripping copper in the East Mill Maintenance Building." }),
  rebecca("rebecca_who", "That night", "Who were you with at the motel?", ["who", "married man", "name", "with you"], [
    "No. I'm not going to ruin his family over this. He was with me until about eleven, he never met Emily, and I'm not saying his name. Not to you, not to the police.",
  ], { requiresEvidence: ["E086"] }),
];

// ------------------------------------------------------------------ Andrew
const andrew = asker("andrew");
const andrewQ: DialogueQuestion[] = [
  andrew("andrew_saw", "That night", "What did you see on Mill Road that Saturday?", ["saw", "see", "mill road", "east gate", "emily", "saturday", "night"], [
    "I was walking home from the Corner Mart. Emily Lasko was getting out of her car on the shoulder by the East Gate. I yelled hi, she waved. She looked, I don't know, set. Like she had somewhere to be.",
    "And there was a pickup inside the gate, parked by the first building. Dark. Ladder rack. I told the detective all this.",
  ], { reveals: "Andrew saw Emily get out of her car at the East Gate, with a dark pickup with a ladder rack parked inside." }),
  andrew("andrew_truck", "That night", "Describe the truck inside the gate.", ["truck", "pickup", "ladder rack", "color", "plate"], [
    "Small pickup. Dark blue or black, it was getting dark. A ladder rack over the bed. No plate I could see. Nobody in it.",
  ]),
  andrew("andrew_friday", "That week", "You saw Emily and Wade fighting on Friday?", ["friday", "fight", "argument", "corner mart", "threw"], [
    "In our lot, about six thirty. He was yelling. She threw something at him, a ring or a bracelet, and he threw it right back at her. Then she drove off.",
  ]),
  andrew("andrew_wade", "That week", "Did you know Wade Reeves?", ["wade", "reeves", "know him", "scrap", "copper"], [
    "A little. He'd come in for smokes. He always had copper in the bed of that truck, under a tarp. Sold it at Mon Valley Scrap by the rail yard, everybody did.",
  ], { effects: [{ setFlag: "scrap_lead" }] }),
  andrew("andrew_time", "That night", "Are you sure it was about ten when you saw her?", ["sure", "ten", "time", "what time", "clock", "when"], [
    "I always said ten. I got off at ten thirty every night that summer.",
    "Wait. No. Saturday the store closed at eight in the summer. I got off at eight thirty. So it was more like twenty to nine. God. Twenty-two years I've been saying ten.",
    "My mom kept my time cards. All of them. Hang on, they're in the basement.",
  ], { requiresEvidence: ["E011"], requires: ch(5), effects: [{ setFlag: "andrew_shoebox" }], reveals: "Andrew realizes he saw Emily at about 8:40 PM, not ten: the store closed early on Saturdays." }),
];

// ------------------------------------------------------------------ Det. Mitchell
const mitchell = asker("mitchell");
const mitchellQ: DialogueQuestion[] = [
  mitchell("mitchell_case", "The case", "Where does the case stand?", ["case", "stand", "where are we", "status", "investigation"], [
    "Remains identified on the eighteenth. Cause of death's a head injury. Manner undetermined. I've got the 1996 file, a forensic report, and a scene that's twenty-two years cold.",
    "And a department of nine officers. So, yes. I'm glad you're here.",
  ]),
  mitchell("mitchell_file", "The 1996 file", "Can I see the 1996 file?", ["1996 file", "file", "box", "granger", "old case", "statements", "records"], [
    "It's out on the table by the window. Everything Granger had. Don't take it out of the building, but read whatever you want.",
  ], { effects: [{ setFlag: "box_out" }], repeatable: true }),
  mitchell("mitchell_granger", "The 1996 file", "What kind of detective was Granger?", ["granger", "detective", "1996", "runaway"], [
    "Phil Granger was a decent man who didn't like work he couldn't finish by Friday. A nineteen-year-old with her car at a bus station was an easy box to close.",
    "He didn't search the East Mill. Plant security told him it was patrolled. That's on him.",
  ]),
  mitchell("mitchell_scene", "The scene", "Tell me about the scene in Tool Crib 4.", ["scene", "tool crib", "crib", "found", "weld", "teenagers"], [
    "Three kids with a pipe and a pair of bolt cutters. The door was welded and chained, pallets in front. Inside, her. Nothing else of hers but what she was wearing. Brooks has the effects.",
  ]),
  mitchell("mitchell_trent_site", "The scene", "Who has access to the East Mill now?", ["access", "security", "site", "who guards", "trent", "stroud"], [
    "Stroud Riverfront Development owns it. Trent Protective Services patrols it. Trent's people showed up within the hour the night of the discovery. I kept them outside the tape.",
  ]),
  mitchell("mitchell_glenn_death", "Glenn Sutter", "What happened to Glenn Sutter?", ["glenn", "sutter", "death", "killed", "murder", "storage"], [
    "Beaten in his storage unit Thursday night with something like a bar. Defensive injuries on his arms. Manager found him at seven thirty Friday. Here's the report.",
  ], { requires: glennDead, effects: [{ giveEvidence: "E059" }] }),
  mitchell("mitchell_glenn_calls", "Glenn Sutter", "Who did Glenn talk to in his last week?", ["calls", "phone", "phone records", "talked to", "called"], [
    "I pulled his lines. You'll want to see who called him on Saturday, and who he called Wednesday night after he called you.",
  ], { requires: glennDead, effects: [{ giveEvidence: "E047" }] }),
  mitchell("mitchell_witness", "Glenn Sutter", "Did anyone see anything at Creekside?", ["witness", "see anything", "saw", "creekside", "anyone", "anybody", "storage", "storage place", "seen"], [
    "One man, loading shelving out of his own unit. He saw a pickup come in about ten after nine. Read it yourself.",
  ], { requires: glennDead, effects: [{ giveEvidence: "E048" }] }),
  mitchell("mitchell_taken", "Glenn Sutter", "What was taken from Glenn?", ["taken", "stolen", "missing", "robbery", "wallet", "left"], [
    "His daughter and I went through it. Wallet, watch, and one box of old papers. Not the cash, not the car, not a four-hundred-dollar chainsaw. You tell me what kind of robbery that is.",
  ], { requires: glennDead, effects: [{ giveEvidence: "E049" }] }),
  mitchell("mitchell_trent_interview", "Glenn Sutter", "Have you talked to Michael Trent?", ["trent", "interview", "talked to trent", "michael trent", "alibi"], [
    "Friday afternoon, voluntary. Home alone all evening, he says. And he made a point of telling me his truck was at the shop getting detailed. Nobody asked him about his truck.",
  ], { requires: { all: [glennDead, { any: [{ talkedTo: "trent" }, has("E046"), has("E052")] }] }, effects: [{ giveEvidence: "E054" }] }),
  mitchell("mitchell_sutter_house", "Glenn Sutter", "Can I go into Glenn's house?", ["glenn's house", "sutter house", "orchard lane", "sealed", "let me in", "house"], [
    "We're done with it. Go ahead. Gloves on, and tell me what you take.",
  ], { requires: glennDead, requiresEvidence: ["E043", "E045"], effects: [{ setFlag: "sutter_released" }] }),
  mitchell("mitchell_len_missing", "Len Greer", "Is there any word on Len Greer?", ["len", "greer", "missing", "word", "where is"], [
    "Nothing. No card use, no calls. His car's in his driveway. Here's what I've got.",
  ], { requires: { event: "RE12" }, effects: [{ giveEvidence: "E062" }] }),
  mitchell("mitchell_len_calls", "Len Greer", "Who did Len call before he disappeared?", ["len's calls", "phone records", "called", "greer calls"], [
    "Two calls Sunday afternoon. One to you. Look at the other one.",
  ], { requires: { event: "RE12" }, effects: [{ giveEvidence: "E067" }] }),
  mitchell("mitchell_plate", "Len Greer", "Can you run plate ZKL-7184 through the plate readers for Sunday night?", ["plate", "plate reader", "zkl", "run the plate", "camera", "f-250", "route 88"], [
    "Give me five minutes. There. Route 88, southbound, twice. Then nothing till morning.",
  ], { requiresEvidence: ["E065", "E053"], effects: [{ giveEvidence: "E068" }] }),
  mitchell("mitchell_search", "Len Greer", "What did the search of the camp turn up?", ["search", "warrant", "camp", "seized", "found at the camp"], [
    "Zip ties, a new bolt on the trap door, his wallet, and a Sheetz receipt on Trent's company fuel card from that night. The return's here.",
  ], { requires: trentArrested, effects: [{ giveEvidence: "E074" }] }),
  mitchell("mitchell_recovery", "Len Greer", "How did you find Len?", ["found", "recovery", "rescue", "cellar", "how is he"], [
    "Bolted in the cellar, wrists tied, cold. First thing he said was 'Is it him? He said he'd be back.' My report.",
  ], { requires: trentArrested, effects: [{ giveEvidence: "E075" }] }),
  mitchell("mitchell_hospital", "Len Greer", "What do the doctors say about Len?", ["doctor", "hospital", "medical", "condition", "health"], [
    "Dehydrated, cold, missed his heart pills for a day and a half, rope burns, well, zip tie burns, on both wrists. He'll be okay. He's asking for you.",
  ], { requires: trentArrested, effects: [{ giveEvidence: "E076" }] }),
  mitchell("mitchell_boots", "Lab", "Can the lab compare the Unit 14 boot print with Trent's boots?", ["boots", "boot print", "compare", "lab", "footwear", "tachyon"], [
    "We seized them with his truck. I'll drive them to Greensburg myself. Give it a little while.",
  ], { requires: trentArrested, requiresEvidence: ["E050"], effects: [{ startLab: "boots" }] }),
  mitchell("mitchell_trent_custody", "Michael Trent", "What did Trent say after his arrest?", ["trent say", "after arrest", "custody", "interview", "statement"], [
    "That Len came with him willingly and asked to be hidden. With a bolt on the outside of the trap door. Then he asked for a lawyer. Here's the summary.",
  ], { requires: { all: [trentArrested, ch(5)] }, effects: [{ giveEvidence: "E079" }] }),
  mitchell("mitchell_burner", "Michael Trent", "Was there anything else in Trent's truck?", ["truck", "phone", "burner", "prepaid", "console", "found in"], [
    "A prepaid phone under the fuel receipts. Three calls in its whole life, all with one number. State police pulled it. You'll recognize the number.",
  ], { requires: { all: [trentArrested, ch(5)] }, effects: [{ giveEvidence: "E080" }] }),
  mitchell("mitchell_stroud_phone", "Richard Stroud", "Can you get Richard Stroud's phone records?", ["stroud's phone", "stroud records", "court order", "subpoena", "stroud calls"], [
    "After Greer's statement, yes. The judge signed it this morning. Here.",
  ], { requires: { all: [ch(5), has("E077")] }, effects: [{ giveEvidence: "E057" }] }),
  mitchell("mitchell_wire", "Richard Stroud", "Did Stroud's company pay Trent anything after Glenn died?", ["paid", "payment", "wire", "money", "twelve thousand five hundred", "bank"], [
    "Mon Valley Savings answered the court order. Twelve thousand five hundred, wired the morning after. No invoice.",
  ], { requires: { all: [ch(5), { any: [has("E056"), has("E077")] }] }, effects: [{ giveEvidence: "E058" }] }),
  mitchell("mitchell_payments", "Richard Stroud", "Has Stroud paid Trent like that before?", ["before", "history", "payments", "over the years", "1996", "special"], [
    "Since November 1996. I put the whole history on one page for you. Look at the first one, and then look at what Ray Dalton told you.",
  ], { requiresEvidence: ["E058"], effects: [{ giveEvidence: "E091" }] }),
  mitchell("mitchell_handwriting", "Lab", "Can the state lab compare Stroud's handwriting on the notes?", ["handwriting", "notes", "compare", "document examiner", "note to len"], [
    "Questioned documents in Greensburg owes me. I'll send the note, the memo and his county filings. Give it a little while.",
  ], { requiresEvidence: ["E098"], effects: [{ startLab: "handwriting" }] }),
  mitchell("mitchell_scrap", "The mill", "Where did people sell scrap copper in 1996?", ["scrap", "copper", "sell", "scrap yard", "mon valley scrap"], [
    "Mon Valley Scrap, by the rail yard, till they moved out to 51. Their old weigh office is still standing in the rail service building. Nobody ever cleared it.",
  ], { requires: ch(5), effects: [{ setFlag: "scrap_lead" }] }),
  mitchell("mitchell_da", "The case", "What does the DA need?", ["da", "district attorney", "charges", "grand jury", "prosecute"], [
    "Separate cases, cleanly separated. Who did what, in which year, and why. If you hand me one big conspiracy, a defense lawyer will pull one thread and it all comes apart.",
  ], { requires: ch(5) }),
];

// ------------------------------------------------------------------ Dr. Brooks
const brooks = asker("brooks");
const brooksQ: DialogueQuestion[] = [
  brooks("brooks_id", "Identification", "How were the remains identified?", ["identified", "identification", "dental", "who", "id", "sure it's emily"], [
    "Dental comparison against her 1996 records, which the family gave the police when she went missing. Fourteen points of agreement, including a gold onlay. It's her. A sibling DNA test is at the state lab for completeness, but that will take weeks.",
  ], { effects: [{ giveEvidence: "E017" }] }),
  brooks("brooks_cause", "Cause of death", "How did she die?", ["cause", "die", "died", "death", "injury", "skull", "fracture"], [
    "One injury that matters: a depressed fracture on the right side of the skull with one straight edge, about four centimeters, pushed in. It happened at or around the time of death. Nothing else.",
    "I'll tell you what I can't tell you, because people always want it: I can't say whether she fell against something or was struck with it, I can't give you a date or an hour, and I can't tell you who was there.",
  ], { effects: [{ giveEvidence: "E016" }], reveals: "Emily died of a single depressed skull fracture with a straight edge; the bone can't say fall or blow." }),
  brooks("brooks_effects", "Effects", "What was found with her?", ["found with", "effects", "jacket", "pockets", "belongings", "clothes"], [
    "A denim jacket, jeans, sneakers, a watch. In her pockets: fourteen dollars, a key to the photo studio, a folded newspaper clipping, and in the buttoned breast pocket, a man's class ring. No wallet, no car keys.",
  ], { effects: [{ giveEvidence: "E015" }] }),
  brooks("brooks_edge", "Cause of death", "What kind of edge could make that fracture?", ["edge", "what kind", "weapon", "object", "straight edge"], [
    "Something narrow and straight with real mass behind it, or real mass in her falling onto it. The edge of a steel table. A length of angle iron. A pipe with a squared end. A lot of things in a steel mill.",
  ], { requiresEvidence: ["E016"] }),
  brooks("brooks_glenn", "Glenn Sutter", "What did Glenn Sutter's autopsy show?", ["glenn", "sutter", "autopsy", "pathologist", "how did he die"], [
    "Dr. Osei did him. Four blows to the head with something bar-shaped, about an inch wide. A broken forearm from trying to block it. Here's her summary.",
  ], { requires: glennDead, effects: [{ giveEvidence: "E044" }] }),
  brooks("brooks_bench", "Cause of death", "Could the workbench in the East Mill have caused Emily's fracture?", ["bench", "workbench", "angle iron", "consistent", "opinion"], [
    "I measured it with Mitchell's casts. Consistent, yes. Not unique. I put it in writing, with the height it would take for a woman her size to hit it falling backward. That's as far as bone can go.",
  ], { requiresEvidence: ["E096"], effects: [{ giveEvidence: "E100" }] }),
];

// ------------------------------------------------------------------ Jessica Kemp
const jessica = asker("jessica");
const jessicaQ: DialogueQuestion[] = [
  jessica("jessica_story", "The story", "What have you written about Emily?", ["story", "article", "wrote", "written", "remains"], [
    "Eight hundred words on the nineteenth, which is all my editor would give a twenty-two-year-old missing person story. Nobody in this town ever connected her to the plant in print. I'd like to.",
  ]),
  jessica("jessica_gallery", "Gallery B", "Why do you care so much about Gallery B?", ["gallery", "why", "care", "uncle", "eddie", "sokol"], [
    "Eddie Sokol was my uncle. I was seventeen. The company told my aunt he broke the rules and killed himself and two other men. I've been collecting every scrap about that night since college.",
  ], { requires: ch(2), reveals: "Jessica's uncle, Eddie Sokol, died in Gallery B." }),
  jessica("jessica_tape", "Gallery B", "Do you have any interviews about Gallery B?", ["interview", "tape", "recording", "earl", "union", "cassette"], [
    "I taped Earl Hayes in ninety-eight for a piece the paper never ran. Take a copy. Listen to what Stroud said to him in May.",
  ], { requires: ch(2), effects: [{ giveEvidence: "E040" }] }),
  jessica("jessica_emily_call", "The story", "Did Emily ever contact the paper?", ["contact", "called the paper", "emily called", "newsroom", "tip"], [
    "She did. I found it last week in the newsroom's 1996 call book. August third: 'E. Lasko, re: gallery deaths, says co. lied, has documents.' Somebody wrote 'follow up' next to it. Nobody did.",
  ], { requires: ch(2) }),
  jessica("jessica_stroud", "Richard Stroud", "What do you know about Richard Stroud?", ["stroud", "richard", "riverworks", "developer"], [
    "Hospital board, Rotary, the man who's going to save the riverfront. He was the GM at the Riverside Works in ninety-six and he's never given me an interview about it. His lawyer has my editor's cell number.",
  ], { requires: ch(2) }),
  jessica("jessica_directory", "The story", "Do you have old phone directories?", ["directory", "phone book", "directories", "1996 phone", "listing"], [
    "Every year since 1958, on the reference shelf by the window. The older reporters swear by them. What are you looking up?",
  ], { requires: ch(5) }),
];

// ------------------------------------------------------------------ Karen Novak
const karen = asker("karen");
const karenQ: DialogueQuestion[] = [
  karen("karen_intro", "Records", "What records do you keep here?", ["records", "keep", "what do you have", "deeds", "help"], [
    "Deeds, mortgages, liens, corporations, the old taxi and peddler licenses, you name it. If it was ever filed in this county, I know where it went. Ask me for the thing, not the folder.",
  ]),
  karen("karen_sale", "The plant", "Was the East Mill land sold in 1996?", ["sale", "sold", "east mill", "parcel", "1996", "land", "mon valley land"], [
    "October 1996, to Mon Valley Land Partners, four point one million. Here's the agreement of sale. Read section nine. Stroud signed for the company.",
  ], { requires: ch(2), effects: [{ giveEvidence: "E035" }] }),
  karen("karen_borough", "The plant", "Would the borough have records about the plant in 1996?", ["borough", "municipal", "code", "inspection", "file"], [
    "The borough kept its own code enforcement files in the basement of the Borough Building. I have the key. Let me look. If there's a Riverside Works file, I'll find it.",
  ], { requires: ch(2) }),
  karen("karen_cab", "Records", "Would there be cab records from 1996?", ["cab", "taxi", "brackett", "yellow cab", "trip sheet", "1996"], [
    "Cab companies had to file a sample of trip sheets with their license renewal. Brackett Yellow Cab renewed in 1997. Give me ten minutes in the basement. Here: August 17, 1996. Driver seven.",
  ], { requires: ch(5), requiresEvidence: ["E007"], effects: [{ giveEvidence: "E018" }] }),
  karen("karen_len_land", "Len Greer", "Has Len Greer ever owned property from the steel company?", ["len", "greer", "property", "lot", "ridge avenue", "deed"], [
    "Lot 7, Ridge Avenue. Bought from Hollow Creek Steel in September 1996 for one dollar. Every other lot on that plan went at auction three years later for twenty-five to thirty-one thousand. Here's the deed.",
  ], { requires: ch(4), effects: [{ giveEvidence: "E093" }] }),
  karen("karen_trent_land", "Michael Trent", "What land does Trent's company pay taxes on?", ["trent", "land", "property", "taxes", "llc", "laurel hollow", "camp"], [
    "Laurel Hollow Holdings LLC. Set up by his father in 1989; Michael's been the only member since 2012. It owns one thing: thirty-eight acres at the end of Laurel Hollow Road with a two-room cabin and a cellar. Here's the filing and the parcel.",
  ], { requires: { event: "RE13" }, effects: [{ giveEvidence: "E069" }, { giveEvidence: "E070" }], reveals: "Trent's LLC owns a cabin with a cellar at the end of Laurel Hollow Road." }),
];

export const townQuestions: DialogueQuestion[] = [...sarahQ, ...wadeQ, ...rebeccaQ, ...andrewQ, ...mitchellQ, ...brooksQ, ...jessicaQ, ...karenQ];

const sarahSees = shown("sarah");
const wadeSees = shown("wade");
const rebeccaSees = shown("rebecca");
const mitchellSees = shown("mitchell");

export const townReactions: EvidenceReaction[] = [
  sarahSees("E006", ["Those are Dad's. The memo. She printed them at the studio, she was so proud of how sharp they came out."]),
  sarahSees("E002", ["I found that last night. Look at her. Knees under the dashboard."]),
  sarahSees("E087", ["She was at the studio until six. Vince has the time card. He's lying. He's lying right now, in 2018."]),
  wadeSees("E082", ["So I sold some scrap. Arrest me."]),
  wadeSees("E084", ["Gus put a rack on my truck. Gus put racks on half the trucks in this town."]),
  wadeSees("E081", ["Where did you get those? Those are private."], { reveals: "Wade recognized the letters to Denise as his." }),
  wadeSees("E095", ["That's Gus's book. Gus wrote down when I took a can of oil."]),
  rebeccaSees("E020", ["Where did you get that? I don't know that number. I don't."]),
  rebeccaSees("E010", ["I was nineteen. I was scared."]),
  mitchellSees("E087", ["Read Corso's time card next to that. Then read where the ring was."]),
  mitchellSees("E032", ["That's the page. Glenn died for that page, and they didn't even find it."]),
];

export const townContradictions: ContradictionDef[] = [
  { id: "x_wade_day", characterId: "wade", title: "Wade's two accounts of the last time he saw Emily", text: "In 1996 Wade said he last saw Emily on Friday, August 16. In 2018 he says Saturday at about four, at the garage.", when: { all: [has("E009"), has("E087")] } },
  { id: "x_wade_studio", characterId: "wade", title: "Emily was at the studio", text: "Wade now says Emily came to the garage at about four on Saturday. Her time card has her at Corso Photo from 9:58 AM to 6:04 PM.", when: { all: [has("E087"), has("E005")] } },
  { id: "x_wade_ring", characterId: "wade", title: "The ring", text: "Wade says Emily gave him his ring back on Saturday afternoon. The ring was in her buttoned jacket pocket when she was found.", when: { all: [has("E087"), has("E015")] } },
  { id: "x_wade_truck", characterId: "wade", title: "\"My truck was home all night\"", text: "Wade said his truck was home all Saturday night. A dark pickup with a ladder rack was inside the East Gate at about 8:40 PM, and his blue Ranger had a black ladder rack.", when: ded("D10") },
  { id: "x_rebecca_1996", characterId: "rebecca", title: "Rebecca's 1996 statement", text: "In 1996 Rebecca said she was home alone and never heard from Emily. In 2018 she says she was at the Valley View Motor Inn and spoke to Emily at about 7:40 PM.", when: { all: [has("E010"), has("E086")] } },
  { id: "x_andrew_time", characterId: "andrew", title: "Andrew's \"about ten\"", text: "Andrew told police he saw Emily at about ten. His time card shows he clocked out at 8:30 PM that Saturday.", when: { all: [has("E011"), has("E083")] } },
];

export const townChapterNotes = { glennDead, trentArrested };
