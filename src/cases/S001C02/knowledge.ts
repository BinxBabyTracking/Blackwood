import type { Condition, Effect } from "@/game/engine/types";

/*
 * What each person knows, and will say, about Room 614 (S001C02). Used to
 * answer questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's own account. Hurst, Lyons, Rourke, Grant and
 *   Okoye keep their stories, lies included, until the design says they move.
 * - A fact is gated exactly like the authored answer it points to (`entry`),
 *   so no phrasing reaches what the investigation has not earned. Facts that
 *   hand over evidence, start a lab or set a flag carry the same effects as
 *   the answer.
 * - Nothing from the design doc's "Closing report only" list: not that the
 *   lobby visitor was Lyons, not how Lyons knew the hotel or picked Hurst,
 *   nothing Rourke said to Lyons, nothing about who sent the "A" card or the
 *   courier envelope. Nobody explains the copier footer or the courier account.
 * - Jonathan tells only what he saw and heard. Nobody states who arranged it
 *   or who gave the orders. Nobody above Rourke is named; nobody mentions
 *   Dr. Lockhart.
 * - Times, amounts, names and numbers follow docs/S001C02-timeline.md.
 */

type Fact = { text: string; requires?: Condition; entry?: string; effects?: Effect[] };
const f = (text: string, requires?: Condition, entry?: string, effects?: Effect[]): Fact => ({ text, requires, entry, effects });

const ev = (id: string): Condition => ({ hasEvidence: id });
const d = (id: string): Condition => ({ deduction: id });
const not = (c: Condition): Condition => ({ not: c });
const all = (...c: Condition[]): Condition => ({ all: c });
const any = (...c: Condition[]): Condition => ({ any: c });

const hurstKnown: Condition = any(ev("E009"), ev("E015"), ev("E016"));
const lyonsKnown: Condition = any(ev("E027"), ev("E028"), ev("E034"));
const rourkeKnown: Condition = any(ev("E026"), ev("E025"), { event: "RE04" });
const natalieGarage: Condition = { flag: "natalie_garage" };
const natalieTruth: Condition = any(ev("E025"), ev("E019"), { talkedTo: "jonathan" });
const hurstOpen: Condition = any({ flag: "hurst_admits" }, d("D11"));
const okoyeOpen: Condition = any(ev("E017"), d("D08"));
const carrierGate: Condition = any(d("D04"), d("D05"));
const plateGate: Condition = any(d("D07"), all(ev("E011"), ev("E013")));
const kestrelGate: Condition = all(d("D11"), { chapter: 3 });
const chenRelease: Condition = { flag: "chen_release" };

const kestrelSearch: Effect[] = [{ setFlag: "kestrel_search" }, { setEnv: "kestrel", to: "searched" }];

export const SPEECH = {
  setting:
    "Washington, D.C., with Reston, Virginia, Rockville and rural Frederick County, Maryland, on the three days before Thanksgiving, November 19 to 21, 2018. A procurement analyst who was due to talk to a federal task force has gone missing from Room 614 of a downtown hotel. People speak plain American English: hotel staff practical, the lawyers and consultants polished, the police dry.",
  style:
    "Answer in one to four short spoken sentences, in character, in American English. No em dashes. Never state anything the character does not know. Never confess to a crime and never say who took Jonathan or who gave the orders. Use only facts given; if asked something the character does not know, say so in character.",
};

export const PERSONA: Record<string, string> = {
  jonathan:
    "Jonathan Ellery, 41, senior procurement analyst at Eastbridge Systems in Reston, lives in Clarendon, Arlington. Found alive in a locked upstairs room of a Frederick County farmhouse. Exhausted, ashamed, then candid. In 2017 he was drowning in his mother's memory-care bills and a loan he'd guaranteed, and a man from Meridian offered a lifeline: 'trends' at first, then pricing, then 'anything.' He knew it was wrong from the first pricing file. Tells only what he saw and heard: Garrett Lyons at his door and in the van, a man in a gray hotel work shirt holding an elevator whose name he never knew, Lyons on the phone to 'Julian' through the door. He cannot say who arranged the hotel side, who paid whom, or what Rourke said or ordered. Does not know who is above Rourke and never heard of anyone called 'A.' Knows he will answer for what he did.",
  natalie:
    "Natalie Ellery, 37, physical therapist in Pittsburgh, Jonathan's younger sister and the investigator's client. She is Bennett's physical therapist. Frightened, then determined; practical, blunt, not easily rattled. Their mother has been in memory care in Cranberry Township since 2015; Jonathan paid most of it and in mid-2017 told her 'it's handled.' Knows he was seeing a lawyer named Irene about 'the thing at work' and had an appointment with a task force on Monday. Does not know he sold information and at first won't believe it ('He's a rule-follower. He color-codes his taxes.'). When she learns, she is angry, then steady: 'He's still my brother. Get him home.'",
  rourke:
    "Julian Rourke, 46, Director of Corporate Intelligence at Meridian Advisory Group, 1620 K Street NW. Polished, warm, unhurried; describes his work as corporate risk and open-source research. Says Jonathan was a paid independent advisor on public procurement trends from 2017, entirely above board, and that they last spoke in the summer. Has no idea where Jonathan is and is 'concerned.' Explains every document away: calls 'about his advisory work,' late calls 'wrong numbers, or a vendor,' Kestrel 'one of many' vendors, the client list 'stolen, and misread,' the funding sheet 'internal accounting,' the index 'never seen.' Reports to 'the executive committee, like anyone.' Never says 'A,' never names a superior, never mentions Dr. Lockhart. Never confesses. Defensive once pressed with records, then cold and short.",
  lyons:
    "Garrett Lyons, 39, principal of Kestrel Protective Group, Suite 210, 1100 East Gude Drive, Rockville; ex-Army military police. Relaxed, practical, a little amused. Kestrel does guard contracts, executive protection and background work. He 'did a project for Meridian once' and may have met Jonathan 'in passing.' Says that Sunday night he was home in Rockville and the van was in the lot; then that the vans go out with staff. Later tells a new story: Jonathan asked for a private meeting before his interview because he wanted out, they talked in the van, he dropped him at Union Station after midnight, and Jonathan said he needed to disappear for a while. Never says where Jonathan is. Never names Rourke beyond 'Meridian's a client.' In custody he asks for a lawyer and says nothing.",
  hurst:
    "Kevin Hurst, 32, Maintenance Engineer II at the Ashcroft Hotel since March 2016, badge 2231. Friendly, chatty, a Commanders fan, behind on money; then nervous, then frightened. First story: a normal Sunday shift, clocked out at ten, out the employee entrance, bus home by 10:15, never upstairs after his shift. Later admits he set the S6-2 alarm bypass 'for a contractor guy' who said the job was approved for overnight and paid him 'a couple hundred to make it easy,' and denies seeing or moving anyone. Later still: the man called himself Garrett, they met Thursday at a sports bar on M Street, Garrett said they only needed 'to talk to a guy,' and he held the service elevator on six with his key; the guy was walking on his own, Garrett had his arm. Never says he knew it was a kidnapping and confesses to nothing more.",
  chen:
    "Irene Chen, 48, white-collar and whistleblower attorney, Law Office of Irene Chen, PLLC, Suite 402, 1150 Seventeenth Street NW. Precise, careful, protective of her client. At first confirms Jonathan is a client and nothing else; the privilege is his. Waited for him at 8:15 Monday and went to the 9:30 task force interview alone; thought at first he'd lost his nerve. Later, believing he is in danger, she relies on D.C. Rule 1.6 and releases the sealed envelope he left with her. Does not know the drive's code. Never names anyone above Rourke and knows no one at Meridian.",
  grant:
    "Celia Grant, 44, general manager of the Ashcroft Hotel, 1214 Fifteenth Street NW. Polished hotelier; Thanksgiving week, 94% occupancy; 'our guests' privacy and safety are the same thing.' Insists there was no security failure and that nobody gets into the back of house without security, and hides her September 10 memo letting engineering issue after-hours vendor badges without security sign-off. Defensive about the bypass; candid once shown the badge record: she wrote the memo to cut security overtime and Douglas Wallace objected in writing. Called Natalie at 11:05 AM Monday from the registration card. Innocent of the disappearance.",
  wallace:
    "Douglas Wallace, 56, director of security at the Ashcroft, 22 years with MPD before that. Gruff, exact, honest about his mistakes. At first certain Jonathan left on his own ('people walk out on their lives, I've seen it a hundred times'): the guest cameras show him going up at 6:38 PM Sunday and never coming down. Read the room's lock and pulled the sixth-floor camera. Becomes troubled once the service doors are in play and engaged once he finds the S6-2 alarm bypass under an engineer's code. Objected in writing to Celia Grant's badge memo. Thinks Kevin Hurst is 'a good engineer who bets on football.' Took Luis Batista's statement about the van at 8:30 PM Monday.",
  monroe:
    "Tessa Monroe, 29, front desk supervisor at the Ashcroft, 3 to 11 PM. Bright, conscientious, helpful. Checked Jonathan in at 3:44 PM Sunday; he asked for a quiet room away from the elevators and seemed 'tired, polite, a little jumpy.' At about ten to eight a man in his late thirties, short dark hair, navy quilted jacket, a ball cap he kept on, asked for Jonathan's room number as a 'colleague'; she declined and offered to ring the room; he said not to bother and walked out to Fifteenth Street. Not sure what he looked like under the cap; shown a license photo she says only 'It could be him. I couldn't swear to it.'",
  okoye:
    "David Okoye, 52, Director of Ethics and Compliance at Eastbridge Systems, 11900 Sunrise Valley Drive, Reston. Careful, legalistic, worried about his own department. At first: Jonathan is a valued analyst, Eastbridge has no comment on any internal matter, and no task force has told him anything. Once confronted with the task force interview, he admits the internal review: the task force asked Eastbridge in October not to discuss it with Jonathan, and his office missed the leak for a year. Released Jonathan's personnel security pages because a cleared employee is missing. Jonathan's laptop is company-issued and last connected to the VPN at 10:14 PM Sunday. Has never heard of Kestrel or Northgate.",
  collins:
    "Det. Nadia Collins, 42, Metropolitan Police Department, Missing Persons Unit, case CCN 18197742. Dry, quick, decent. Starts at voluntary absence (an adult with debts who doesn't want to testify) but noted he left his shoes and his wallet. Moves with the evidence and no faster: exigent phone records once the service route or the alarm is shown, Hurst's phone with his consent once his movements are shown, the partial plate once the dock is shown, a Montgomery County warrant for Kestrel once the movement is tied together, the FBI and Maryland State Police once the farmhouse is found. Wants a reason before anyone goes through a door. Never says who did what before the report.",
  quinlan:
    "Special Agent Teresa Quinlan, 44, FBI Washington Field Office. Measured, sparing with words. The victim was carried across a state line, so it is federal; she has the case now with MPD. Took custody of Lyons's bag and the laptop from the van. Runs the drive imaging once Jonathan gives the code, and the warrant on Rourke's office. Will not speculate about 'A': 'A letter is not a name.' Confirms Adrian Holt was in a cell in Carroway when the card was written. Never says anything about Dr. Lockhart.",
  bennett:
    "Bennett, retired LAPD detective, forty years on the job, now Blackwood's records man, speaking by phone from the Pittsburgh office. Calm, dry, kind underneath. Natalie Ellery is his physical therapist: 'She fixed my knee.' Pulls background records and asks for evidence rather than theories. Never goes beyond what the records show. On courier account 20417 he can say only that it is a business account with no public listing, as he said in Carroway.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  natalie: [
    f("Bennett's my patient. When the police said grown men walk away, I called him. Jon doesn't walk away.", undefined, "natalie_hire"),
    f("Jon's forty-one, a senior procurement analyst at Eastbridge Systems in Reston. He lives in Clarendon. He's a rule-follower. He color-codes his taxes.", undefined, "natalie_jonathan"),
    f("He had his suit hanging up for Monday. And he calls me every Sunday night before anything big. He didn't call.", undefined, "natalie_walkaway"),
    f("His last texts to me were Sunday at 6:12 and 6:14 PM. Here, I printed them at the desk.", undefined, "natalie_texts", [{ giveEvidence: "E020" }]),
    f("I called him at 10:45 Sunday night and he didn't answer. I texted at 10:44 and again Monday morning.", undefined, "natalie_sunday"),
    f("Our mother has been in memory care in Cranberry Township since 2015. Jon paid most of it.", undefined, "natalie_mother"),
    f("Jon was buried in debt, Mom's bills and a loan he guaranteed for a friend. Then in mid-2017 he said 'it's handled' and wouldn't say how.", undefined, "natalie_money"),
    f("He'd seemed frightened for about three weeks. Jumpy on the phone. Distracted.", undefined, "natalie_frightened"),
    f("He was seeing a lawyer named Irene about 'the thing at work.' I don't know her last name.", undefined, "natalie_lawyer"),
    f("He had an appointment with 'a task force' on Monday morning. He said he'd tell me after.", undefined, "natalie_taskforce"),
    f("His phone code is 0411, our mother's birthday.", undefined, "natalie_passcode"),
    f("Jon never talked about work much. He would never do anything wrong at work. He's a rule-follower.", not(natalieTruth), "natalie_work"),
    f("I know now what he did at work. I'm furious with him. He's still my brother.", natalieTruth, "natalie_work"),
    f("On Saturday the 17th he asked me not to talk to anyone who called from his work. And in early November he said a man from 'the consulting people' had been waiting by his car in his office garage.", natalieGarage, "natalie_garage"),
    f("He sold his company's information? I'm angry. I'm so angry. He's still my brother. Get him home.", natalieTruth, "natalie_sold"),
    f("'Think about Natalie.' That's me. Somebody said my name to him by his car. I don't know who G.L. is.", ev("E024"), "natalie_notebook"),
    f("Detective Collins thinks he ran. She's been decent to me. She wrote down that he left his shoes.", undefined, "natalie_police"),
    f("Jon's alive. Somebody tell me when I can see him.", { event: "RE07" }, "natalie_found"),
  ],
  monroe: [
    f("I'm Tessa Monroe, front desk supervisor. I work three to eleven.", undefined, "monroe_who"),
    f("I checked Mr. Ellery in at 3:44 Sunday afternoon. Two keys. Here's his registration record.", undefined, "monroe_checkin", [{ giveEvidence: "E005" }]),
    f("He seemed tired, polite, a little jumpy.", undefined, "monroe_manner"),
    f("He asked for a quiet room, high floor, away from the elevators. 614 is at the far north end of six.", undefined, "monroe_room"),
    f("At about ten to eight Sunday a man asked for Mr. Ellery's room number and said he was a colleague. I declined and offered to ring the room. He said not to bother and walked out to Fifteenth Street.", undefined, "monroe_visitor"),
    f("Late thirties, short dark hair, a navy quilted jacket, a ball cap he kept on. I'm not sure what he looked like under the cap.", undefined, "monroe_describe"),
    f("We never give out room numbers. Never. I offer to ring the room.", undefined, "monroe_policy"),
    f("I didn't see Mr. Ellery again after he went up. I was at the desk until eleven.", undefined, "monroe_sunday"),
    f("It could be him. I couldn't swear to it.", ev("E027"), "monroe_license"),
    f("Kevin in engineering? He's friendly. Talks Commanders with everybody.", hurstKnown, "monroe_hurst"),
  ],
  wallace: [
    f("Douglas Wallace, director of security. Twenty-two years with MPD before this.", undefined, "wallace_who"),
    f("The guest cameras show him coming up to six at 6:38 Sunday and never coming back down. Here's the sixth-floor camera record.", undefined, "wallace_cameras", [{ giveEvidence: "E007" }]),
    f("I read 614's lock at 10:52 Monday morning. Opened from inside twice, nobody keyed in. Here's the audit.", undefined, "wallace_lock", [{ giveEvidence: "E006" }]),
    f("He walked out on his own. People walk out on their lives. I've seen it a hundred times.", not(d("D04")), "wallace_voluntary"),
    f("The lobby camera has a man in a cap at the desk at 7:49 PM and out the Fifteenth Street doors at 7:53. Face under the brim. Nothing useful.", undefined, "wallace_visitor"),
    f("I opened 614 with the housekeeping supervisor at 10:21 Monday. Empty. His phone on the bedside table.", undefined, "wallace_welfare"),
    f("The service doors are on cards and alarms. S6-2 at the end of six is locked, and I have the only override.", not({ chapter: 2 }), "wallace_service"),
    f("The service side is a second building inside this one. Come to my office and I'll walk you through it.", { chapter: 2 }, "wallace_service"),
    f("There's one camera on the dock, DOCK-1. It records, but it's on page three of the monitor wall. I didn't look at it Monday.", undefined, "wallace_dock"),
    f("Somebody bypassed the alarm on S6-2 at 10:19 Sunday night, user code 2231, Kevin Hurst's. Forty-five minutes. Nobody asked me, and policy 7.3 says they have to.", ev("E009"), "wallace_bypass"),
    f("Kevin Hurst is a good engineer who bets on football. He borrowed two hundred dollars from one of my guards once.", hurstKnown, "wallace_hurst"),
    f("I objected to Celia's badge memo in writing on September 11. It put a key to the back of house in anybody's hands at night.", ev("E015"), "wallace_memo"),
    f("I'm asking the staff who were on Sunday. Nobody's told me anything useful yet.", not({ chapter: 2 }), "wallace_luis"),
    f("Luis Batista, a dishwasher, saw a gray van in bay two Sunday night. I took his statement at 8:30. He left a copy for you at the smoking bench on the dock.", { chapter: 2 }, "wallace_luis"),
    f("T-07 is a temporary vendor badge, created Sunday night. The badge station in my office has the credential record.", ev("E008"), "wallace_badge"),
    f("REX is request to exit. The door logs that it opened, not who went through.", ev("E008"), "wallace_rex"),
    f("I was wrong. He didn't walk out the front of my hotel. He went out the back.", d("D04"), "wallace_changed"),
    f("I asked everybody on the two-to-ten Sunday whether they saw him. Nobody saw him after he went up.", not(hurstKnown), "wallace_staff"),
    f("Kevin Hurst told me he clocked out at ten, went out the employee door and was on the bus by ten fifteen.", hurstKnown, "wallace_staff"),
  ],
  grant: [
    f("I'm Celia Grant, general manager. It's Thanksgiving week and we're 94% booked.", undefined, "grant_who"),
    f("Our guests' privacy and safety are the same thing. I'll authorize what records the police need.", undefined, "grant_privacy"),
    f("There was no security failure. Every service door is monitored. No one gets into the back of the house without security.", not(ev("E015")), "grant_security"),
    f("A maintenance bypass is a maintenance bypass. Engineering does them every week.", ev("E009"), "grant_bypass"),
    f("I wrote the September 10 memo letting engineering issue after-hours vendor badges without security. To cut security overtime. Douglas objected in writing.", ev("E015"), "grant_memo"),
    f("Here is Kevin Hurst's HR file, his schedule and his timeclock.", hurstKnown, "grant_hurst", [{ giveEvidence: "E016" }]),
    f("I've told Douglas to open Kevin Hurst's locker, number 41, in the engineering shop.", d("D06"), "grant_locker"),
    f("I called his sister, Natalie, at 11:05 Monday morning. She was the emergency contact on his registration card.", undefined, "grant_natalie"),
    f("Security and the housekeeping supervisor opened 614 at 10:21 Monday after a caller from a task force asked for him. The room was empty.", undefined, "grant_room"),
    f("Douglas Wallace is the best security director I've worked with. He's also the most stubborn.", undefined, "grant_wallace"),
  ],
  hurst: [
    f("Kevin Hurst, Maintenance Engineer Two. Here since March 2016. Commanders, unfortunately.", undefined, "hurst_who"),
    f("Normal shift Sunday. Clocked out at ten, out the employee entrance, bus home by ten fifteen. Never went upstairs after my shift.", not(hurstOpen), "hurst_sunday"),
    f("I never saw the guest. Engineering doesn't see guests much.", undefined, "hurst_guest"),
    f("HVAC, doors, closers, door alarms, whatever breaks. Engineering carries the service elevator key.", undefined, "hurst_job"),
    f("Engineering and security have the independent service key for the service elevator. I've got one, everybody in engineering does.", undefined, "hurst_elevator"),
    f("That bypass is the S6-2 work order. I was getting a jump on it before I left.", all(ev("E009"), not(hurstOpen)), "hurst_bypass"),
    f("I set the bypass on S6-2 for a contractor guy. He said the job was approved for overnight. He paid me a couple hundred to make it easy. I didn't see anybody and I didn't move anybody.", all(ev("E009"), hurstOpen), "hurst_bypass"),
    f("The contractor was some HVAC guy. He said the job was approved. I didn't ask a lot.", all(hurstOpen, not(d("D11"))), "hurst_contractor"),
    f("The contractor called himself Garrett. That's all he ever gave me.", all(hurstOpen, d("D11")), "hurst_contractor"),
    f("Engineering does vendor badges. Ms. Grant said so in September.", ev("E015"), "hurst_badge"),
    f("I won some games.", all(ev("E029"), not(d("D11"))), "hurst_money"),
    f("It was supposed to make the debt go away. That's all I thought it was for.", all(ev("E029"), d("D11")), "hurst_money"),
    f("I deleted them because I was scared. He said they only needed to talk to a guy.", ev("E030"), "hurst_messages"),
    f("It's been a rough fall. The payroll advances got turned down.", ev("E016"), "hurst_debts"),
    f("I met Garrett Thursday at a sports bar on M Street. He said they only needed to talk to a guy.", d("D11"), "hurst_garrett"),
    f("I held the service elevator on six with my key. When the doors opened the guy was walking on his own. Garrett had his arm.", d("D11"), "hurst_elevator_six"),
    f("I never knew the guy. I didn't know his name was Jonathan until the news.", d("D11"), "hurst_name"),
    f("Detective Collins asked for my phone. I gave it to her.", { flag: "hurst_phone_seized" }, "hurst_phone"),
  ],
  okoye: [
    f("David Okoye, Director of Ethics and Compliance at Eastbridge Systems.", undefined, "okoye_who"),
    f("Jonathan is a valued senior analyst. Careful, well liked.", undefined, "okoye_jonathan"),
    f("Eastbridge has no comment on any internal matter. No task force has told me anything.", not(ev("E018")), "okoye_review"),
    f("All right. There is an internal review, IR-18-027. The task force asked us in October not to discuss it with Jonathan. My office missed the leak for a year. Here it is.", okoyeOpen, "okoye_taskforce", [{ giveEvidence: "E018" }]),
    f("I've released the relevant pages of his personnel security file because a cleared employee is missing. They're on my desk.", undefined, "okoye_file"),
    f("His laptop is company-issued; the charger has our asset tag. It last connected to our VPN at 10:14 PM Sunday.", undefined, "okoye_laptop"),
    f("I've never heard of Kestrel or Northgate.", undefined, "okoye_kestrel"),
    f("Corvane Systems is our competitor on the Logistics Support recompete. Their proposal matched our unreleased rates.", ev("E018"), "okoye_corvane"),
    f("The source file was exported once, on May 14, by user JELLERY.", ev("E018"), "okoye_export"),
    f("The market brief was on Meridian Advisory Group letterhead. I know them only as a name on that brief.", ev("E018"), "okoye_meridian"),
    f("Somebody waited by his car in our garage on November 1. Nobody reported it to us.", ev("E024"), "okoye_notebook"),
  ],
  chen: [
    f("Irene Chen. White-collar and whistleblower counsel.", undefined, "chen_who"),
    f("I can confirm Jonathan Ellery is my client. Nothing else. The privilege is his, not mine or his sister's.", undefined, "chen_client"),
    f("I waited for him at 8:15 Monday. My office called him at 8:16 and 8:31. I went to the 9:30 interview alone. At first I thought he'd lost his nerve.", undefined, "chen_monday"),
    f("Deposit 18-114 is a client matter. I can't discuss what a client leaves with me.", all(ev("E021"), not(chenRelease)), "chen_deposit"),
    f("Under D.C. Rule 1.6 I may reveal what's needed to prevent a crime likely to result in death or substantial bodily harm. I believe that's where he is. Here is the envelope he left with me.", chenRelease, "chen_release", [{ giveEvidence: "E022" }]),
    f("There's a drive and a note inside. I don't know the code. He said he'd never written it down, and I didn't want to know it.", ev("E022"), "chen_code"),
    f("He first came to me on October 31, frightened, after a meeting at Meridian.", chenRelease, "chen_first"),
    f("I advised him to tell the task force everything, his own part included. He agreed on November 14.", chenRelease, "chen_advice"),
    f("I came in on Sunday for him. He was here from 1:00 to 1:24 and left a sealed deposit.", chenRelease, "chen_sunday"),
    f("Investigator Varga runs the task force interviews. I sat with him at 9:30 Monday.", any(ev("E017"), chenRelease), "chen_varga"),
  ],
  rourke: [
    f("Julian Rourke, Director of Corporate Intelligence at Meridian. Corporate risk and open-source research.", undefined, "rourke_who"),
    f("Jonathan was a paid independent advisor on public procurement trends from 2017. Entirely above board. Here's the agreement; I've tabbed section 6.", { event: "RE04" }, "rourke_agreement", [{ giveEvidence: "E025" }]),
    f("We last spoke in the summer.", undefined, "rourke_contact"),
    f("I have no idea where Jonathan is. I'm concerned.", undefined, "rourke_whereabouts"),
    f("Corporate Intelligence is risk work: due diligence, market studies, open-source research for clients.", undefined, "rourke_work"),
    f("Our calls were about his advisory work. The 9:20 and 11:12 calls from a number I don't recognize were wrong numbers, or a vendor.", ev("E026"), "rourke_calls"),
    f("Meridian uses dozens of vendors. Kestrel is one of many.", lyonsKnown, "rourke_kestrel"),
    f("Stolen, and misread. Client lists are commercial secrets, not confessions.", ev("E033"), "rourke_clientlist"),
    f("Internal accounting, taken out of context.", ev("E034"), "rourke_funding"),
    f("I have never seen that document.", ev("E035"), "rourke_index"),
    f("I report to the executive committee, like anyone.", undefined, "rourke_superior"),
    f("Northgate is our disbursing agent for advisor fees. A convenience.", any(ev("E019"), ev("E025")), "rourke_northgate"),
    f("Corvane is a client. Competitive intelligence from public sources is a lawful business.", any(ev("E018"), ev("E033")), "rourke_corvane"),
    f("Adrian Holt was an affiliate partner of our Pittsburgh office. I read about Carroway like everyone else.", undefined, "rourke_holt"),
  ],
  lyons: [
    f("Garrett Lyons. Kestrel Protective Group: guard contracts, executive protection, background work. Army MP before that.", undefined, "lyons_who"),
    f("I did a project for Meridian once. Meridian's a client.", undefined, "lyons_meridian"),
    f("Jonathan Ellery? I may have met him in passing.", undefined, "lyons_jonathan"),
    f("Sunday night I was home in Rockville. The van was in the lot.", not(d("D11")), "lyons_sunday"),
    f("We run a few vans with magnet signs on the doors.", not(ev("E027")), "lyons_van"),
    f("The vans go out with staff. I'd have to check who had that one.", ev("E027"), "lyons_van"),
    f("Jonathan asked for a private meeting before his interview because he wanted out. We talked in the van. I dropped him at Union Station after midnight. He said he needed to disappear for a while.", d("D11"), "lyons_meeting"),
    f("Kevin's a guy who knows the building. Jonathan didn't want to walk through a lobby the night before his interview. That's all that was.", d("D11"), "lyons_hurst"),
    f("I have no idea where he is.", not(d("D11")), "lyons_where"),
    f("Last I saw him was Union Station. He said he needed to disappear for a while.", d("D11"), "lyons_where"),
    f("I carry a couple of work phones. Clients like discretion.", ev("E030"), "lyons_prepaid"),
    f("Meridian's a client. I don't discuss clients.", rourkeKnown, "lyons_rourke"),
    f("Lots of people have the initials G.L.", ev("E024"), "lyons_garage"),
  ],
  collins: [
    f("I'm working it as a possible voluntary absence. An adult with debts who doesn't want to testify. But he left his shoes and his wallet.", undefined, "collins_case"),
    f("I'm treating it as an abduction now.", carrierGate, "collins_case"),
    f("Here's the missing person report, CCN 18197742.", undefined, "collins_report", [{ giveEvidence: "E001" }]),
    f("You can have the room photographs. Ofc. Kimball took them at 1:25 Monday.", undefined, "collins_photos", [{ giveEvidence: "E002" }]),
    f("Adults are allowed to go missing. They usually take their shoes and their wallet.", not(carrierGate), "collins_voluntary"),
    f("He didn't leave on his own. Somebody came in the back.", carrierGate, "collins_voluntary"),
    f("For an exigent request I need signs he was taken, not just missing.", not(carrierGate), "collins_phone_wait"),
    f("I'm sending an exigent request to his carrier. Records come back in a few hours.", carrierGate, "collins_carrier", [{ startLab: "carrier_records" }, { setFlag: "carrier_requested" }]),
    f("Nothing's at the lab unless you give me something to send.", undefined, "collins_lab"),
    f("Hurst was at work. I need more than that before I ask for his phone.", all(hurstKnown, not(d("D06"))), "collins_hurst_wait"),
    f("I'll ask Hurst for his phone. With consent it goes to our digital evidence unit today.", d("D06"), "collins_hurst", [{ startLab: "hurst_phone" }, { setFlag: "hurst_phone_seized" }]),
    f("A partial plate and a van with no name on it isn't enough for the state's databases yet.", all(any(ev("E011"), ev("E013")), not(plateGate)), "collins_plate_wait"),
    f("I ran the partial through Maryland MVA and the plate readers. One match: MD 3CR7719, a gray Transit Connect registered to Kestrel Protective Group in Rockville.", plateGate, "collins_plate", [{ giveEvidence: "E027" }]),
    f("I can't walk into a licensed security company's office on a van and a plate reader.", all(lyonsKnown, not(kestrelGate)), "collins_warrant_wait"),
    f("Montgomery County Police will take a warrant for Kestrel's office. They'll serve it tonight.", kestrelGate, "collins_kestrel", kestrelSearch),
    f("I'm bringing in the FBI, and Maryland State Police are watching Sawmill Hollow Road.", d("D12"), "collins_fbi"),
    f("Nobody goes through that door until somebody gives me a reason. Look and tell me what you see.", { event: "RE06" }, "collins_farmhouse"),
    f("He's alive. Lyons was arrested in the driveway. Agent Quinlan has it federally now, with us.", { event: "RE07" }, "collins_rescue"),
  ],
  quinlan: [
    f("Special Agent Teresa Quinlan, FBI Washington Field Office. He was carried across a state line, so it's federal. I have the case now, with MPD.", undefined, "quinlan_who"),
    f("I took custody of Lyons's bag and the laptop from the van.", undefined, "quinlan_van"),
    f("If Mr. Ellery gives us the code, our lab images the drive write-blocked.", undefined, "quinlan_drive"),
    f("A letter is not a name.", ev("E036"), "quinlan_a"),
    f("Adrian Holt was in a cell in Carroway when that card was written. He's been held since the fifteenth.", ev("E036"), "quinlan_holt"),
    f("We served a federal warrant on Rourke's office this afternoon. The safe. He's in custody.", { event: "RE08" }, "quinlan_rourke"),
    f("Lyons asked for a lawyer. He hasn't said a word since.", undefined, "quinlan_lyons"),
    f("Mr. Ellery is cooperating. He'll answer for what he did.", undefined, "quinlan_jonathan"),
  ],
  jonathan: [
    f("I'm all right. I'm tired. I'm ashamed of a lot of things.", undefined, "jonathan_ok"),
    f("In 2017 I was drowning. A man from Meridian offered a lifeline. At first it was 'trends,' then pricing, then 'anything.' I knew it was wrong from the first pricing file.", undefined, "jonathan_2017"),
    f("On October 30 Rourke asked me for the evaluators' names, home addresses and 'anything personal.' I said no. He said, 'Everyone has a file.'", undefined, "jonathan_oct30"),
    f("On November 1 Garrett Lyons was waiting by my car in the garage at work. He said, 'Think about Natalie.'", undefined, "jonathan_garage"),
    f("Lyons called me at 9:12 Sunday night and said we should talk before tomorrow. I said no and hung up.", undefined, "jonathan_call"),
    f("At 10:31 he knocked and said, 'Five minutes, and you never see us again.' I opened the door because I'd met him a dozen times.", undefined, "jonathan_door"),
    f("He threatened my sister. He took the laptop. He tied my hands when I wouldn't say where the copies were.", undefined, "jonathan_room"),
    f("He walked me out the service door. A man in a gray hotel work shirt held an elevator and wouldn't look at me. I never knew his name.", undefined, "jonathan_out"),
    f("I was locked in the upstairs room the whole time. He brought food. I scratched the dates on the door.", undefined, "jonathan_held"),
    f("Monday morning, through the door, I heard him on the phone: 'He says there are no copies, Julian.'", undefined, "jonathan_julian"),
    f("He showed me a printed list of 'people who came around.'", undefined, "jonathan_list"),
    f("That's the list he showed me.", ev("E035"), "jonathan_index"),
    f("I don't know who's above Rourke. I never heard anyone called 'A.'", undefined, "jonathan_above"),
    f("I'll give the code to Detective Collins and Agent Quinlan. It opens everything I kept.", ev("E022"), "jonathan_code", [{ startLab: "drive_image" }, { setFlag: "passphrase_given" }]),
    f("Irene Chen has an envelope for me. The code opens what's inside.", not(ev("E022")), "jonathan_envelope"),
    f("Natalie. Tell her I'm sorry.", undefined, "jonathan_natalie"),
    f("I'll testify. I'll answer for what I sold.", undefined, "jonathan_after"),
    f("I booked the hotel because I didn't want to sleep at home the night before.", undefined, "jonathan_hotel"),
  ],
  bennett: [
    f("Collins is good. She thinks he ran, but she wrote down that he left his shoes.", undefined, "bennett_case"),
    f("Natalie fixed my knee. She doesn't rattle. If she says he didn't walk away, he didn't.", undefined, "bennett_natalie"),
    f("Meridian Advisory Group: headquarters at 1620 K Street. Julian Rourke is Director of Corporate Intelligence. Private firm, files little.", any({ chapter: 3 }, ev("E026")), "bennett_meridian"),
    f("Kestrel Protective Group is a licensed Maryland security agency in Rockville. Principal Garrett M. Lyons, ex-Army MP.", lyonsKnown, "bennett_kestrel"),
    f("Northgate Bridge Lending: a Maryland LLC formed March 2017. Resident agent Garrett M. Lyons, Kestrel's suite.", ev("E019"), "bennett_northgate"),
    f("Briarfield Holdings: Maryland LLC, same resident agent, Garrett M. Lyons.", ev("E028"), "bennett_briarfield"),
    f("Corvane Systems is a defense logistics contractor, Eastbridge's competitor on the recompete.", ev("E018"), "bennett_corvane"),
    f("Adrian Holt has been held without bail in the Carroway County Jail since Thursday the 15th.", undefined, "bennett_holt"),
    f("Courier account 20417 is a business account with no public listing. Same as I told you in Carroway.", ev("E033"), "bennett_courier"),
    f("Jonathan Ellery: no record. Cleared employee at a defense contractor. Lives in Clarendon.", undefined, "bennett_jonathan"),
    f("Kevin Hurst: no criminal record. A couple of small-claims judgments from a payday lender.", hurstKnown, "bennett_hurst"),
    f("Nothing new on my side. I'm waiting on you.", undefined, "bennett_again"),
  ],
};
