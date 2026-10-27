import type { ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { asker, ch, has, shown } from "./util";

/*
 * Interviews with the people of the plant: Richard Stroud, Michael Trent,
 * Glenn Sutter, Len Greer, Evelyn Dorsey, Ray Dalton, Earl Hayes. Stroud and
 * Trent give their own accounts, lies included, and never admit anything.
 * Glenn tells only what he chose to tell before he died. Len is guarded until
 * he is rescued, and then tells his part plainly.
 */

const glennDead = { event: "RE06" };
const trentArrested = { flag: "trent_arrested" };
const lenRescued = { event: "RE15" };

// ------------------------------------------------------------------ Richard Stroud
const stroud = asker("stroud");
const stroudQ: DialogueQuestion[] = [
  stroud("stroud_riverworks", "Riverworks", "Tell me about Riverworks.", ["riverworks", "development", "project", "riverfront", "plans"], [
    "Two hundred and forty homes, a riverwalk, restaurants, people living where my father's generation made steel. This town has been waiting thirty years for something to happen on that land. It's happening.",
    "Or it was, until the police tape went up. I don't say that lightly. That poor girl.",
  ]),
  stroud("stroud_1996", "1996", "What happened in Gallery B in June 1996?", ["gallery b", "1996", "accident", "three men", "deaths", "june"], [
    "A terrible night. A crew went into a gas gallery without authorization and without monitors and bypassed a lockout. Three good men died. I went to every funeral.",
    "OSHA investigated for two months. The findings are public.",
  ], { reveals: "Stroud stands by the 1996 account: the crew entered without authorization and bypassed a lockout." }),
  stroud("stroud_memo", "1996", "Glenn Sutter asked you for an immediate repair in May 1996, and you wrote \"defer.\"", ["memo", "defer", "repair", "sutter memo", "186,000", "q3"], [
    "Where did you get that? Never mind. It was a scheduling decision. Every plant manager in the valley made a dozen like it a week. Glenn never told me that gallery was unsafe to enter.",
  ], { requires: { any: [has("E006"), has("E026")] }, reveals: "Stroud calls the deferral \"a scheduling decision\" and says Glenn never told him the gallery was unsafe." }),
  stroud("stroud_emily", "Emily", "Did you know Emily Lasko?", ["emily", "lasko", "girl", "remains", "ron's daughter"], [
    "I knew her father. Ron was a union man and a good pipefitter, and we didn't agree on much. I don't believe I ever met the girl.",
    "When I heard she'd been found on the property, I was sick. Whatever happened to her, it had nothing to do with that plant.",
  ]),
  stroud("stroud_glenn", "Glenn Sutter", "Do you still talk to Glenn Sutter?", ["glenn", "sutter", "called glenn", "talk to glenn", "glenn sutter", "still talk"], [
    "I called him just last weekend. Glenn's been unwell. Nerves. When the remains were found he got it into his head that people would come asking about the old days. I called to calm him down. We worked together for fourteen years.",
  ], { requires: { all: [ch(3), { event: "RE05" }] }, variants: [{ requires: glennDead, reply: ["Glenn. God. Beaten to death for his wallet. This town isn't what it was. I called him that weekend because he was upset, and I'll regret for the rest of my life that I didn't go over there."] }] }),
  stroud("stroud_trent", "Michael Trent", "How long has Michael Trent worked for you?", ["trent", "michael", "security", "how long", "works for you"], [
    "Mike was on the gate at the Riverside Works when he was a kid. When he started his own company I was his first client. He's guarded every property I've had since. Reliable. Discreet.",
  ], { requires: ch(3) , variants: [{ requires: ch(4), reply: ["I've answered that. Mike Trent is a contractor. What he does on his own time is his business, and if you have an accusation to make, make it to my lawyer."] }] }),
  stroud("stroud_len", "1996", "What did the borough's code officer, Len Greer, do about Gallery B?", ["len", "greer", "borough", "code officer", "inspection"], [
    "Len did his job. The borough looked into the union's letter and found it was a matter for OSHA, which it was. After the accident he inspected and found nothing. That's the record.",
  ], { requires: { any: [has("E036"), has("E038")] } }),
  stroud("stroud_bonus", "1996", "Your 1996 bonus depended on the East Mill sale closing without regulatory trouble.", ["bonus", "incentive", "240,000", "sale", "closing"], [
    "Executives have incentives. That's how companies work. You're implying three men died for my bonus, and that is grotesque.",
  ], { requiresEvidence: ["E034"] }),
  stroud("stroud_aug17", "Emily", "Where were you on the night of August 17, 1996?", ["august 17", "night", "where were you", "1996", "saturday"], [
    "August of ninety-six? I'd have to think. The Steelmakers' Association dinner was that month, in Pittsburgh. I always stayed over. My old secretary could tell you. I certainly wasn't in a tool room at the East Mill, if that's the question.",
  ], { requires: ch(5) }),
  stroud("stroud_calls", "Glenn Sutter", "Glenn called you at 8:47 PM on October 24. Twenty-one minutes after he hung up, you called a prepaid phone.", ["prepaid", "burner", "0172", "phone records", "called after", "8:47", "9:14"], [
    "Glenn called me upset. I told him to sleep on it. As for the rest, I make forty calls a day, I don't memorize the numbers.",
  ], { requiresEvidence: ["E057"], reveals: "Stroud admits Glenn called him that night; he says he told him to \"sleep on it.\"" }),
  stroud("stroud_wire", "Michael Trent", "Your company wired Trent $12,500 the morning after Glenn died.", ["wire", "twelve thousand five hundred", "12,500", "payment", "special services"], [
    "Extra patrols. After the discovery the site needed round-the-clock coverage. Special services. It's on the invoice.",
  ], { requiresEvidence: ["E058"] }),
  stroud("stroud_note", "1996", "In September 1996 you wrote to Len Greer: \"Thank you for your help with the Gallery B matter. Lot 7 is yours.\"", ["note", "lot 7", "letterhead", "thank you", "len note"], [
    "I don't recall any such note. Twenty-two years ago. If you're finished, I have a meeting.",
  ], { requiresEvidence: ["E098"] }),
];

// ------------------------------------------------------------------ Michael Trent
const trent = asker("trent");
const trentQ: DialogueQuestion[] = [
  trent("trent_job", "Work", "What does Trent Protective Services do?", ["company", "business", "what do you do", "security", "protective"], [
    "Patrols, alarm response, site security. Six people. Mostly construction sites and apartment complexes.",
  ]),
  trent("trent_plant", "Work", "You worked at the Riverside Works?", ["plant", "riverside works", "gate", "1996", "plant protection", "guard"], [
    "Plant Protection, ninety-two to ninety-eight. Gate officer. Then I went on my own.",
  ]),
  trent("trent_discovery", "The mill", "Your people were at the East Mill the night Emily Lasko was found.", ["discovery", "found", "remains", "october 12", "night", "mill"], [
    "It's our site. When the police show up on our site, we show up. They kept us outside the tape. That's fine.",
  ]),
  trent("trent_oct25", "Glenn Sutter", "Where were you on Thursday night, October 25?", ["thursday", "october 25", "where were you", "that night", "alibi"], [
    "I left the Riverworks site around six and went home. I was home alone. Watched the game, went to bed. I told the detective.",
  ], { requires: glennDead }),
  trent("trent_patrol", "Glenn Sutter", "Your own patrol log has you on site until 8:20 PM and off site until 9:50.", ["patrol log", "log", "off site", "supply run", "8:20"], [
    "Then I got the time wrong. I made a supply run. Hardware store. I came back. So what.",
  ], { requiresEvidence: ["E052"] }),
  trent("trent_creekside", "Glenn Sutter", "Your company holds the override code at Creekside Self Storage.", ["creekside", "override", "code", "9000", "storage", "gate"], [
    "It's on a sticky note in our office. Half the town's been in our office. I haven't been out to Creekside in weeks.",
  ], { requiresEvidence: ["E046"] }),
  trent("trent_truck", "Glenn Sutter", "A black pickup with a roof light bar was at Creekside that night.", ["truck", "pickup", "light bar", "f-250", "detail", "detailed"], [
    "There's a hundred trucks like mine in this county. Every tow driver and plow guy has a light bar.",
  ], { requires: { any: [has("E048"), has("E055")] } }),
  trent("trent_stroud", "Work", "What's your relationship with Richard Stroud?", ["stroud", "richard", "client", "relationship", "work for"], [
    "He's a client. He was my first client. I've known him since I was twenty-six.",
  ]),
  trent("trent_aug17", "1996", "Where were you on the night of August 17, 1996?", ["august 17", "1996", "emily", "lasko", "that night"], [
    "You're asking me about the Lasko girl now? I was on the gate. Post one, West End. It's in the log. Sergeant Uhler signed me every three hours, if he's still alive. I never set foot in the East Mill on a shift in ninety-six.",
  ], { requires: ch(5) }),
  trent("trent_len", "Len Greer", "Why was Len Greer tied up in your cellar?", ["len", "greer", "cellar", "camp", "zip ties", "tied"], [
    "Len called me scared out of his mind after Glenn. He asked me to hide him. I drove him out to my dad's camp for his own safety. Nobody tied anybody up. He's sick, he's confused.",
  ], { requires: trentArrested }),
  trent("trent_camp", "Len Greer", "Your LLC owns the camp on Laurel Hollow Road.", ["camp", "laurel hollow", "llc", "cabin", "property"], [
    "It was my father's. I hunt there. That's not a secret.",
  ], { requiresEvidence: ["E070"] }),
  trent("trent_ray", "1996", "In November 1996 the company paid you $5,000 for \"security consulting.\" That fall someone from plant security told Ray Dalton to take his settlement.", ["ray", "dalton", "1996", "five thousand", "consulting", "settlement"], [
    "I don't remember any Dalton. I was twenty-six. I did a lot of overtime.",
  ], { requiresEvidence: ["E091"] }),
];

// ------------------------------------------------------------------ Glenn Sutter
const glenn = asker("glenn");
const glennQ: DialogueQuestion[] = [
  glenn("glenn_why", "Why now", "Why did you call?", ["why", "call", "now", "why talk"], [
    "Because they found that girl, and her name's in the paper next to the plant's, and I'm sixty-nine and I've had two stents. I don't know a thing about what happened to her. But I know what happened in Gallery B, and I'm tired of being the only one left who does.",
  ]),
  glenn("glenn_gallery", "Gallery B", "What happened in Gallery B?", ["gallery", "what happened", "june", "monitors", "fan", "accident"], [
    "The monitors were bad and the fan was dead, and I told Richard so in writing in May. The men went down there anyway, because nobody told the night crew not to.",
    "That's the part I'll say today.",
  ], { reveals: "Glenn says he warned Stroud in writing in May 1996 that Gallery B's monitors were bad and the fan was dead." }),
  glenn("glenn_log", "Gallery B", "What about the inspection log?", ["log", "page 41", "inspection", "records", "altered", "changed", "osha"], [
    "The log wasn't what it should have been. That's all I'll say about it here.",
    "I kept things. I kept the real thing. I'll go get it tomorrow night and bring it to your office Friday at ten, and I'll say it all once, with you writing it down.",
  ], { reveals: "Glenn admits the 1996 log \"wasn't what it should have been,\" says he kept \"the real thing,\" and will bring it Friday at ten." }),
  glenn("glenn_stroud", "Gallery B", "Who told you what to do in 1996?", ["stroud", "richard", "who told", "orders", "boss"], [
    "Richard ran that plant. Nothing happened in it he didn't know about. You'll get the rest Friday.",
  ]),
  glenn("glenn_len", "Gallery B", "What was the borough's part?", ["len", "greer", "borough", "code", "inspection"], [
    "Len Greer signed what he was handed. Len's a frightened man. Leave him to me, I'll talk to him.",
  ]),
  glenn("glenn_emily", "Emily", "Did Emily Lasko ever come to you?", ["emily", "lasko", "girl", "came to you", "asked"], [
    "No. I never heard her name in that office, not once, not from Richard, not from anybody. I'd tell you. I've got no reason left not to.",
  ]),
  glenn("glenn_ron", "Gallery B", "Was Ron Lasko right?", ["ron", "lasko", "complaint", "right", "steward"], [
    "Ron Lasko was right in March. I was right in May. Being right didn't help Carl or Tony or Eddie.",
  ]),
];

// ------------------------------------------------------------------ Len Greer
const len = asker("len");
const lenQ: DialogueQuestion[] = [
  len("len_job", "The borough", "What did you do for the borough?", ["job", "code", "officer", "borough", "work"], [
    "Code enforcement and safety, twenty-six years. Building permits, fire code, occupancy, the odd dangerous dog. I retired in 2012.",
  ]),
  len("len_complaint", "1996", "The union asked you in April 1996 to refer Gallery B to OSHA. You didn't.", ["complaint", "union", "earl", "referral", "osha", "april"], [
    "I reviewed it. It was an occupational matter, not a municipal code matter. I followed procedure.",
  ], { requiresEvidence: ["E036"], variants: [{ requires: lenRescued, reply: ["I didn't refer it because Richard Stroud called me and asked me not to before the sale. I wrote the note on my own copy. It's all in my statement."] }] }),
  len("len_inspection", "1996", "You wrote that you inspected Gallery B on June 18. OSHA had it sealed.", ["inspection", "june 18", "memo", "fire marshal", "sealed", "inspected"], [
    "I inspected what I could. I'd like you to leave now.",
  ], { requiresEvidence: ["E038"], variants: [{ requires: lenRescued, reply: ["I never went down there. Richard asked for the memo and I wrote it. I knew it was sealed when I signed it."] }] }),
  len("len_glenn", "Glenn Sutter", "Glenn Sutter is dead.", ["glenn", "sutter", "dead", "killed", "scared", "afraid"], [
    "I know. I know he is. I can't. Please. I need to think.",
  ], { requires: glennDead }),
  len("len_statement", "His statement", "Will you tell me what happened, all of it?", ["what happened", "statement", "tell me", "all of it", "everything", "trent", "taken", "1996", "tell me everything"], [
    "Yes. Detective Mitchell is here. Write it down. All of it, from April of ninety-six to Sunday night.",
    "Sunday night Mike Trent came to my door and I opened it because I knew him. He took me to his father's camp and kept asking where my copies were. In ninety-six Richard Stroud asked me to bury the union's complaint before the sale, and I did. The buyers paid me eight thousand dollars and the company sold me a lot for a dollar. After the men died I signed a memo about an inspection I never made. My copies are in box 2214 at Mon Valley Savings. You can open it.",
  ], { requires: lenRescued, effects: [{ giveEvidence: "E077" }], reveals: "Len names Trent as his abductor and Stroud as the man who had him bury the 1996 complaint; his copies are in safe deposit box 2214." }),
  len("len_emily", "Emily", "Did Stroud ever mention Emily Lasko?", ["emily", "lasko", "girl", "camera", "mention"], [
    "Once. At the Legion that August, somebody said Ron Lasko's girl was going around asking questions. Richard laughed and said the company had nothing to fear from a teenager with a camera.",
    "That's all I ever heard about her. I don't know what happened to her.",
  ], { requires: lenRescued }),
  len("len_money", "1996", "Tell me about the $8,000 and the lot.", ["money", "8,000", "check", "lot", "ridge avenue", "dollar", "paid"], [
    "Richard told me the buyers would take care of the borough's trouble. A check came in August from Mon Valley Land Partners, 'consulting.' In September the company sold me Lot 7 for a dollar. I built a house on it. I raised my sister's boy in that house.",
  ], { requires: lenRescued }),
  len("len_trent", "His statement", "What did Trent want from you?", ["trent", "want", "copies", "asked", "key", "cellar"], [
    "My copies. Over and over. He found my box key in the coffee can, but he didn't know which bank, and I wasn't going to tell him. He said he'd be back in the morning.",
  ], { requires: lenRescued }),
  len("len_testify", "His statement", "Will you testify?", ["testify", "court", "trial", "witness"], [
    "I'm sixty-four. I'll lose my pension, probably. Yes. Glenn would have. I owe Carl and Tony and Eddie that much.",
  ], { requires: { all: [lenRescued, ch(6)] } }),
];

// ------------------------------------------------------------------ Evelyn Dorsey
const evelyn = asker("evelyn");
const evelynQ: DialogueQuestion[] = [
  evelyn("evelyn_job", "The office", "You worked for Richard Stroud?", ["job", "secretary", "worked for", "stroud", "office"], [
    "Nine years, honey. I typed everything that came out of that office and I answered every call. I left in ninety-seven. I couldn't stay after that summer.",
  ]),
  evelyn("evelyn_memo", "1996", "Do you remember Glenn Sutter's memo about Gallery B in May 1996?", ["memo", "gallery", "may", "sutter", "repair", "defer"], [
    "I remember it. I logged it in. And I remember what Mr. Stroud wrote across the bottom, because he handed it back to me to file.",
  ], { requires: { any: [has("E006"), has("E031"), has("E024")] } }),
  evelyn("evelyn_ron", "1996", "Did you give Ron Lasko a copy of that memo?", ["ron", "lasko", "give", "copy", "photocopy", "you gave"], [
    "Oh. Oh, honey. Yes. In July. After the funerals I couldn't sleep. Ron was the only one who kept saying it out loud, so I made a copy and left it in his lunch pail.",
    "I've never said that to anyone.",
  ], { requiresEvidence: ["E006"], effects: [{ setFlag: "evelyn_trusts" }], reveals: "Evelyn Dorsey gave Ron Lasko the copy of the memo in July 1996." }),
  evelyn("evelyn_copies", "1996", "Did you keep copies of anything else?", ["copies", "kept", "anything else", "carbons", "files", "documents"], [
    "I kept carbons of a few things I typed that I didn't think should disappear. I'll put them in your mail slot tonight. Don't come to the house. Please.",
  ], { requiresFlags: ["evelyn_trusts"], effects: [{ delivery: "evelyn_copies" }, { text: "t_evelyn_copies" }] }),
  evelyn("evelyn_emily", "Emily", "Did Emily Lasko ever come to you?", ["emily", "lasko", "came", "visit", "girl"], [
    "Once, in August. She came to my house on a Sunday and asked if I'd talk to the newspaper about the memo. I told her I couldn't, and I told her to be careful. Not because of anything I knew. Because she was nineteen and so sure.",
    "I never told Mr. Stroud she came. Never.",
  ], { requires: ch(2) }),
  evelyn("evelyn_trent", "The office", "Did you know Michael Trent at the plant?", ["trent", "michael", "gate", "guard", "security"], [
    "Mike Trent was the gate officer Mr. Stroud liked. He'd send Mike on errands that weren't security. I didn't ask what.",
  ], { requires: ch(3) }),
  evelyn("evelyn_aug17", "Emily", "Where was Richard Stroud on the night of August 17, 1996?", ["august 17", "where was stroud", "that night", "pittsburgh", "dinner"], [
    "The Steelmakers' Association dinner in Pittsburgh. I booked the hotel myself, every year. I still have the carbon of his expense report. I'll send it.",
    "Whatever else he did, he wasn't in Hollow Creek that night.",
  ], { requires: ch(5), effects: [{ delivery: "evelyn_expense" }, { text: "t_evelyn_expense" }] }),
];

// ------------------------------------------------------------------ Ray Dalton
const ray = asker("ray");
const rayQ: DialogueQuestion[] = [
  ray("ray_night", "June 14", "What happened in Gallery B that night?", ["night", "what happened", "gallery", "june", "june 14", "gas"], [
    "Valve four was leaking at the packing. Carl asked the foreman for a portable monitor and there wasn't one. Foreman said go anyway, the wall monitors are fine. We went down at two thirty. The fan wasn't turning.",
    "Eddie went down the far end first. Then Tony. Then I couldn't think. I was by the ladder. Pete Dvorak pulled me up. I woke up in Mon Valley with a mask on my face.",
  ], { reveals: "Ray says no portable monitor was available and the foreman sent them down anyway; the fan wasn't running." }),
  ray("ray_fan", "June 14", "Was the exhaust fan working?", ["fan", "ef-3", "exhaust", "red tag", "tagged"], [
    "It had a red tag on it a week. Everybody on days knew. Nobody told the night crew it wasn't coming back on.",
  ]),
  ray("ray_lockout", "June 14", "The company says you bypassed a lockout.", ["lockout", "bypass", "bypassed", "employee error", "fault", "blame"], [
    "That's a lie. Carl put his own lock on valve four. Lou Benko saw it on when they went back down with air packs. They never asked Lou. They never asked me.",
  ]),
  ray("ray_emily", "Emily", "Emily Lasko came to see you?", ["emily", "lasko", "came", "visit", "girl", "asked"], [
    "July. The twenty-sixth, I think, a Friday. She sat on my porch with a notebook and asked me everything, and wrote down what I said. Nobody from the company ever asked me anything, and OSHA only the once.",
  ], { requires: ch(2) }),
  ray("ray_settlement", "After", "Did you sue the company?", ["sue", "lawsuit", "settlement", "settle", "lawyer"], [
    "Started to. That fall a big young fella from plant protection came by the house. Said take the company's settlement and stop talking to reporters, think about your kids. I took it in December. I had three kids.",
  ], { variants: [{ requires: has("E091"), reply: ["That fall a big young fella from plant protection came by the house and told me to take the settlement and stop talking to reporters. You've got a name for him now. Trent. Mike Trent. I'd know that face anywhere. I took the money in December."] }] }),
];

// ------------------------------------------------------------------ Earl Hayes
const earl = asker("earl");
const earlQ: DialogueQuestion[] = [
  earl("earl_grievance", "1996", "Did the union complain about Gallery B before the accident?", ["grievance", "complaint", "union", "march", "ron", "96-031"], [
    "March 11, 1996. Grievance 96-031, filed by Ron Lasko. Monitors and the fan. Here's my file copy, take it. Read the company's answer. 'Repairs to be scheduled.'",
  ], { effects: [{ giveEvidence: "E022" }] }),
  earl("earl_stroud", "1996", "Did you take it to Richard Stroud?", ["stroud", "richard", "general manager", "went to", "may"], [
    "Personally, in May. Put it on his desk. He read it standing up and said, 'Earl, I've got a sale to close. After that we fix everything.' I'll never forget it.",
  ], { reveals: "Stroud told Earl in May 1996: \"I've got a sale to close. After that we fix everything.\"" }),
  earl("earl_borough", "1996", "Did you go to anyone outside the company?", ["borough", "outside", "osha", "fire marshal", "len", "greer", "letter"], [
    "I sent the borough a copy in April and asked them to send it to OSHA. Len Greer wrote me back it was internal. Then after the funerals he says he inspected the gallery. Nobody went in that gallery. OSHA had it sealed.",
  ]),
  earl("earl_emily", "Emily", "Did Emily Lasko come to the union?", ["emily", "lasko", "came", "hall", "union", "girl"], [
    "Early August. Asked me for a copy of her dad's grievance and the men's statements. I gave her copies. She said she was going to the paper. I said good, somebody should.",
  ], { requires: ch(2) }),
  earl("earl_scrap", "The mill", "Who was buying scrap from the East Mill in the nineties?", ["scrap", "copper", "east mill", "stripping", "who bought"], [
    "Mon Valley Scrap, by the rail yard. Half the East Mill went out their gate a pickup load at a time after it shut. Their old weigh office is still standing in the rail service building. Nobody ever cleaned it out.",
  ], { requires: ch(5), effects: [{ setFlag: "scrap_lead" }] }),
  earl("earl_trent", "1996", "Do you remember Michael Trent from the plant?", ["trent", "michael", "plant protection", "guard"], [
    "Stroud's boy. Gate officer, but he did whatever Stroud wanted done. We used to say Mike Trent had a key to every door and a reason for none of them.",
  ], { requires: ch(3) }),
];

export const plantQuestions: DialogueQuestion[] = [...stroudQ, ...trentQ, ...glennQ, ...lenQ, ...evelynQ, ...rayQ, ...earlQ];

const stroudSees = shown("stroud");
const trentSees = shown("trent");
const lenSees = shown("len");

export const plantReactions: EvidenceReaction[] = [
  stroudSees("E026", ["Evelyn. Of course. She always kept everything."], { reveals: "Stroud recognized Evelyn Dorsey's copies at once." }),
  stroudSees("E090", ["That's on my wall. Is there a point?"]),
  stroudSees("E089", ["There. Pittsburgh. I told you."]),
  trentSees("E088", ["See? Post one, all night. I didn't touch that girl. I never even knew her."]),
  trentSees("E053", ["It's on my wall. So what."]),
  trentSees("E060", ["Lots of guys wear those boots. Talk to my lawyer."]),
  lenSees("E098", ["He wrote that the day the deed was recorded. I kept it because I knew someday I'd need to show someone I didn't do it alone."], { requires: lenRescued }),
];

export const plantContradictions: ContradictionDef[] = [
  { id: "x_trent_home", characterId: "trent", title: "Trent's evening of October 25", text: "Trent told police he left the Riverworks site at six and was home all evening. His company's site log has him on post at 6 PM, off site from 8:20 to 9:50 PM.", when: { all: [has("E054"), has("E052")] } },
  { id: "x_trent_willing", characterId: "trent", title: "\"For his own safety\"", text: "Trent says Len went with him willingly to be hidden. Len was found bolted in a cellar with zip ties on his wrists and restraint injuries on both arms.", when: { all: [has("E079"), has("E072"), has("E076")] } },
  { id: "x_glenn_osha", characterId: "glenn", title: "Glenn's 1996 interview", text: "In 1996 Glenn told OSHA the monitors tested OK on June 10 and the fan was running. His own page 41 for that day reads \"heads 1 and 3 failed\" and \"EF-3 still out.\"", when: { all: [has("E037"), has("E032")] } },
  { id: "x_len_inspection", characterId: "len", title: "An inspection that couldn't happen", text: "Len's borough memo says he inspected Gallery B on June 18, 1996. OSHA had sealed the gallery from June 14 to June 24.", when: { all: [has("E038"), has("E027")] } },
  { id: "x_stroud_crew", characterId: "stroud", title: "The lockout", text: "The company said the crew bypassed the valve 4 lockout. The fire marshal photographed the lockout in place that morning, and a furnace operator saw it on.", when: { all: [has("E021"), has("E029"), has("E028")] } },
  { id: "x_stroud_unsafe", characterId: "stroud", title: "\"Glenn never told me it was unsafe\"", text: "Stroud says Glenn never told him the gallery was unsafe. Glenn's May 20 memo says the gallery should not be entered without portable monitors.", when: { all: [{ asked: "stroud_memo" }, { any: [has("E006"), has("E026")] }] } },
];
