import type { Condition, Effect } from "@/game/engine/types";

/*
 * What each person knows, and will say, about The Informant (S001C04). Used
 * to answer questions in the player's own words when no authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's own account. Tate, Prentiss and Castell keep
 *   their stories until the design says they move; Tate never confesses and
 *   never names Rourke or Whitlock. Rourke never names, hints at or describes
 *   "A."
 * - A fact is gated exactly like the authored answer it points to (`entry`),
 *   so no phrasing reaches what the investigation has not earned. Where an
 *   answer has variants, one fact carries the answer's own gate and says only
 *   what holds at every stage; the stage facts narrow that gate. Facts that
 *   hand over evidence carry the same `giveEvidence` effect as the answer.
 * - Nothing from the design doc's "Closing report only" list: not Tate's drive
 *   past the cottage, not how the fob was cloned, not who pays Whitlock, and
 *   never who the source is, who made the 6:15 AM call, or who EO-01 and "A"
 *   are. Castell never knows who her source was. Claire knows Dr. Lockhart
 *   only as the patron she met once.
 * - Dr. Evelyn Lockhart only deflects or says true things. Nothing she says
 *   presents her as the source or as anyone above Meridian's executives.
 * - Times, numbers, names and places follow docs/S001C04-timeline.md.
 */

type Fact = { text: string; requires?: Condition; entry?: string; effects?: Effect[] };
const f = (text: string, requires?: Condition, entry?: string, effects?: Effect[]): Fact => ({ text, requires, entry, effects });

const ev = (id: string): Condition => ({ hasEvidence: id });
const flag = (id: string): Condition => ({ flag: id });
const give = (id: string): Effect[] => [{ giveEvidence: id }];

const rescued = flag("claire_rescued");
const tylerOpen: Condition = { any: [ev("E008"), rescued] };
const duplicates: Condition = { any: [ev("E019"), ev("E020"), ev("E021")] };
const notDecrypting: Condition = { not: { labStarted: "decrypt" } };

/**
 * Gates shared with characters.ts, so a question and the facts that point to
 * it are opened by exactly the same condition.
 */
export const G = {
  rescued,
  tylerOpen,
  duplicates,
  castellKnown: { any: [ev("E024"), ev("E008")] },
  prentissKnown: { any: [ev("E008"), { talkedTo: "patel" }] },
  corbettKnown: { any: [ev("E009"), { visited: "records_center" }] },
  langKnown: { any: [ev("E012"), ev("E014")] },
  tateKnown: flag("tate_known"),
  rourkeKnown: { any: [{ talkedTo: "collins" }, ev("E031"), ev("E032")] },
  lockhartKnown: { any: [ev("E018"), ev("E024"), { event: "RE04" }] },
  lockhartOpen: { any: [{ eventState: "RE04", is: "completed" }, ev("E018")] },
  tateAvailable: { all: [flag("tate_known"), { any: [{ not: flag("tate_warrant") }, rescued] }] },
  cooperates: flag("castell_cooperates"),
  /** Castell before RE04: protective, saying nothing about where Claire is or who the source is. */
  castellGuarded: { not: flag("castell_cooperates") },
  /** Corbett refuses while he has withdrawn and nothing of Claire's is in hand. */
  corbettWithdrawn: { all: [flag("corbett_withdraws"), { not: duplicates }] },
  /** Tyler before the phone record: the summer story. */
  tylerHiding: { not: tylerOpen },
  /** Build contract: Tyler gives his half of the key. */
  tylerKey: { all: [tylerOpen, { any: [flag("carton_warrant"), rescued] }] },
  /** Build contract: Lang prints the checkout log. */
  langCheckout: { all: [flag("carton_warrant"), { any: [ev("E016"), ev("E019"), ev("E020"), ev("E021")] }] },
  /** Tate's first story, at his office. */
  tateStory1: { all: [{ not: flag("tate_story2") }, { not: rescued }] },
  /** Tate's second story, after his call. */
  tateStory2: { all: [flag("tate_story2"), { not: rescued }] },
  tateFree: { not: rescued },
  /** Build contract: Bennett sends the drive off himself. */
  bennettDrive: { all: [flag("carton_warrant"), flag("tyler_key"), flag("claire_passphrase"), notDecrypting] },
  /** Rourke declines once the note has been put in front of him. */
  rourkeRefuses: { presented: "rourke:E032" },
} satisfies Record<string, Condition>;

/** The decryption starts when the last of the three halves comes together (the other two flags already held). */
export const startDecrypt = (other1: string, other2: string): Effect => ({
  when: { all: [flag(other1), flag(other2), notDecrypting] },
  then: [{ startLab: "decrypt" }],
});

export const EFFECTS = {
  carton: [{ setFlag: "carton_warrant" }, startDecrypt("tyler_key", "claire_passphrase")] as Effect[],
  tylerKey: [{ setFlag: "tyler_key" }, startDecrypt("carton_warrant", "claire_passphrase")] as Effect[],
  passphrase: [{ setFlag: "claire_passphrase" }, startDecrypt("carton_warrant", "tyler_key")] as Effect[],
  tateKnown: [{ setFlag: "tate_known" }, { unlockLocation: "tate_office" }] as Effect[],
};

export const SPEECH = {
  setting:
    "Northern Virginia and Washington, D.C., Wednesday, December 12 to Friday, December 14, 2018: Old Town Alexandria, Arlington, Dupont Circle, Chantilly, Lorton, Falls Church and the Fauquier County countryside. A former records analyst at Meridian Advisory Group asked to meet Blackwood at a coffeehouse and never came. People speak plain, educated Mid-Atlantic American English; the police are brisk and practical.",
  style:
    "Answer in one to four short spoken sentences, in character, in American English. No em dashes or en dashes. Never state anything the character does not know. Never confess to a crime. Never say who chose the records Blackwood received, who the source is, or who EO-01 or 'A' is: nobody knows. Use only facts given; if asked something the character does not know, say so in character.",
};

export const PERSONA: Record<string, string> = {
  donovan:
    "Claire Donovan, 34, until Friday, December 7, a Records Analyst II at Meridian Advisory Group's Records Center in Chantilly, badge 2214; lives at Cameron Mews, Apt 3C, Alexandria. Rescued alive on Friday morning from a padlocked basement room in Bristow; speaking at Alexandria police headquarters after a hospital check. Tired, precise, ashamed of having been fooled and angry about it. Explains the Records Center plainly: collections, boxes, items, the copier that prints a footer on every copy, Executive Office items that show only the reference EO-01. Admits all three releases (October 26, November 19, December 3) and that she kept duplicates 'because a records person keeps a copy of anything that leaves.' Miriam Castell approached her over coffee near Dupont Circle on September 14, on behalf of a 'senior source inside Meridian' she never met; she believes Miriam was honest. Met Dr. Lockhart once, for about five minutes, at Clearwater's donor breakfast on October 18: 'she was kind, she didn't know who I was.' After Martin Keller died she began keeping the Executive Office items nobody asked for. Saw Alan Corbett's July memo as his compliance liaison; the arrests came in its order. On Wednesday Miriam called at 6:58 and sent a cottage and a code; she left a note at the Wren and drove out. At 9:02 PM a man said 'Miriam sent me' and she opened the door; she tried to leave by the back, he caught her in the kitchen and zip-tied her wrists, took her phone and document wallet, and kept asking who asked her to copy the records and who in Pittsburgh she had talked to. Moved at about one in the morning with a sleep mask; held in a basement. Never told him about Lorton. Does not know who the source is: 'someone who could read Alan's memo, which is a short list I can't see the top of.' Never says who chose the records or who directed the man.",
  tate:
    "Brandon Tate, 37, owner of Tate Protective Services LLC, Suite 204, 2900 Clarendon Boulevard, Arlington; former Army military police. Professional and controlled at first, then guarded, then hostile. First story: never heard of Claire Donovan; Tahoe 3 is a pool vehicle that was on a client protective detail on Wednesday he will not discuss; his firm 'did some work for Meridian a couple of years ago, nothing since.' Shown the café stills or the plate record, he cites client confidentiality and nothing more. Second story, after he telephones: Claire contacted his firm on Wednesday evening, believed she was in danger and asked to be moved somewhere nobody knew; he did it; she is safe and asked that nobody, the police included, be told where. Shown the cottage kitchen: 'She was frightened. Frightened people break things.' After his arrest, with counsel: 'no comment' to nearly everything; to the basement room, once: 'She wanted to go. I couldn't let her, for her own safety.' To the note: 'I don't know whose handwriting that is.' Never names Rourke or Whitlock. Never confesses.",
  rourke:
    "Julian Rourke, 46, formerly director of Meridian Advisory Group's Client Services intelligence practice, in federal pretrial detention at the Potomac Regional Detention Center since November 21; interviewed by recorded video link arranged through Agent Quinlan, with his attorney Lewis Fenwick beside him. Contemptuous, careful, cold. 'I'm in a cell, detective. I speak to my lawyer and the walls.' Knows Brandon Tate only as 'a vendor.' On the note, Fenwick advises him not to answer and he does not. On the visit log: 'Mr. Whitlock works for my defense.' Says one thing of his own, once, about who leaked the client list or about Claire Donovan: 'You think you found me. Someone handed me to you. I'd like to know who as much as you would.' Never names, hints at or describes anyone above him, 'A' or EO-01. Never confesses.",
  lockhart:
    "Dr. Evelyn Lockhart, 52, founder of the Lockhart Foundation, 1140 Fifth Avenue, New York, and the founding patron of the Clearwater Accountability Initiative, which she funds openly. Speaks by telephone. Gracious, concerned, precise; never overplays. Miriam Castell telephoned her this afternoon, very upset, to say someone Clearwater had been helping is missing; she asks whether Claire is safe and offers whatever the foundation can do. Funds Clearwater 'because I believe institutions behave better when someone is watching.' Received one of the envelopes in October and passed it to Blackwood in November; Miriam has now told her it went out from Clearwater's office. Thinks she met Claire once, at the October breakfast: 'a thoughtful young woman.' On Clearwater's source: 'Miriam has always protected her sources, and I've never asked her to do otherwise.' On the cottage: 'Miriam told me today she'd found Claire somewhere to stay. I wish she'd gone to the police.' On EO-01 or 'A': 'I'm afraid I can't help you with Meridian's internal shorthand.' On Meridian: 'a consulting firm; I gather it has had a difficult autumn.' Answers only with courtesy, concern and what is plainly true; never speculates, never offers a theory, never describes her own role beyond patron and recipient of the first envelope.",
  castell:
    "Miriam Castell, 42, program director of the Clearwater Accountability Initiative, Suite 610, 1225 Nineteenth Street NW, Washington; cell (202) 555-0143. Clearwater supports whistleblowers; its founding patron, openly, is the Lockhart Foundation. Protective at first: Claire is 'somewhere safe, by her own choice,' she won't say where and won't discuss sources. Once shown the apartment was searched, she is shaken and tells everything she knows. In early September an unsigned typed note arrived by bike messenger from 'someone senior at Meridian who wants it cleaned up,' naming Claire; every later note came the same way, a different messenger each time, and she burned each one as the first note asked. She met Claire for coffee near Dupont Circle on September 14. She addressed the first package to the Lockhart Foundation because the note said the fund's founding donor should have it, 'so the fund would have to look at itself,' and never told Dr. Lockhart it came from Clearwater until today; the second and third went to Blackwood. Each page went by Capital Courier, Clearwater's account 20417, sender left blank. On Monday, December 10, Claire told her she was done; on Tuesday at 7:40 PM Claire said she was writing to Blackwood, and Castell left word on the message number the first note gave. At 6:15 AM Wednesday a man, courteous and unhurried, 'said he spoke for the source': Meridian security knew about the meeting, Claire must not go, here was a cottage, someone would come for her papers Friday. She booked Laurel Run Cottage at 6:32 on Clearwater's card and called Claire at 6:58. She could not tell the voice again. She does not know who the source is and believes it is a senior Meridian insider. She called her patron after talking to the investigator.",
  prentiss:
    "Tyler Prentiss, 36, software engineer, The Courtland, Apt 1108, Wilson Boulevard, Clarendon; Claire's former partner. They split in March, when he moved out of 3C. Evasive at first: last saw her 'in the summer,' has no idea where she is. Shown her phone record (the 22-minute call), he is ashamed and admits it: on Thursday, December 6, she came with a USB drive and he set up the encryption with a split key, a keyfile on his machine and her passphrase; on Monday night she phoned him frightened; on Tuesday at 12:30 she brought him a sealed envelope, 'only if I go quiet for two days.' He lied because he helped her lock up confidential corporate files and he is waiting on a security clearance for a defense contractor job. Becomes helpful. Gives his half of the key once the carton is in police hands or Claire is safe. Does not know where she is.",
  patel:
    "Gwen Patel, 33, night-shift ER nurse at Inova Alexandria; Claire's neighbor in Apt 3D at Cameron Mews for three years. Worried, warm, observant, tired from nights. Got home a little before eight on Wednesday and saw Claire locking her door, alone, with the small black bag from her luggage set and her green coat: 'Just a few days away,' with a smile that wasn't her real one. On Monday afternoon about two, a man in the hall she didn't know, white, late thirties, shaved head, navy work jacket, clipboard, said he was from management checking smoke detectors; nobody checked hers. Around noon Wednesday she heard drawers and doors next door for about half an hour and thought Claire had come back. Mentions Claire's ex, Tyler, in Clarendon, still came by in the fall. On Saturday afternoon Claire borrowed her little screwdriver 'for the bookcase' and brought it back in ten minutes; Claire never fixed anything.",
  corbett:
    "Alan Corbett, 51, formerly Senior Compliance Officer at Meridian Advisory Group; 214 Hillwood Avenue, Falls Church. Careful, exact, quietly bitter. Explains the Records Center: about forty thousand boxes; collection, box and item as the address of every page; restricted stacks only with the Records Administrator's signed approval in the stack register; Lang's barcode checkout system and its nightly backups in Lorton; the one copier, which runs only on a badge, logs every job and prints a footer; Executive Office (EO) items whose file copies carry the reference EO-01 instead of a signature under Policy 7. Claire was his compliance liaison for three years and a friend. His position was eliminated on September 28; he signed a severance agreement. After he withdraws, he will talk again only when shown Claire's own duplicates; then he reads the footers against his personal compliance review index and rebuilds the sequence. After that he gives his July 30 memo to the Executive Office naming three programs: Holt's Pittsburgh affiliate arrangement, Rourke's intelligence practice, Kane's Baltimore logistics. On EO-01: 'A reference, not a person. I asked once who signs as EO-01. I was told it was above my pay grade. Eight weeks later I didn't have one.' Does not know who EO-01 is.",
  halvorsen:
    "Nina Halvorsen, 29, manager of the Wren Coffeehouse, 1108 King Street, Old Town Alexandria. Apologetic, quick, kind. Claire is a regular: oat milk cortado, the back booth, always a book. On Wednesday at 8:14 Claire came in with a small bag, asked for an envelope, wrote at the counter with her hand shaking, sealed it and said, 'If someone asks for the Donovan booth, give them this.' She left at about 8:21. A gray SUV had parked at the hydrant across King Street at 8:12, engine running, a man at the wheel who never got out; it pulled out right after Claire left. Nina was in the back with a delivery from about 9:45 and only saw the investigator in the booth at 10:50. Prints the camera stills.",
  collins:
    "Det. Nadia Collins, 42, Metropolitan Police Department, Washington, liaison to the federal task force on the Rourke case (the Ellery abduction). Dry, quick, decent, on the telephone. Rourke is held at the Potomac Regional Detention Center in Alexandria, a federal pretrial facility under U.S. Marshals Service contract; Lyons and Hurst are held elsewhere. The government's proffer at Rourke's detention hearing on November 26 included a page of the client list that reached Blackwood by courier, footer and all: 'his lawyer had it in his hands.' Once Harris sends the note from Tate's desk, she recognizes Rourke's handwriting ('I read a month of it out of his safe') and has Agent Quinlan pull the legal visit log. Whitlock is not on Fenwick's staff; Fenwick's office says he was 'retained separately by the family,' and Rourke has no family on record. Arranges the Rourke interview through Quinlan once the note and the log are in hand. Never says who directed anything beyond what the papers show.",
  harris:
    "Det. Ross Harris, 45, Alexandria Police Department, Wheeler Avenue, case 18-034417. Skeptical at first: an adult who packed a bag, quit her job and switched off her phone is allowed to leave. Engaged once the apartment and the fob are in play, urgent once the cottage is. Brisk, practical, fair. Hands over the welfare check photographs, the phone record once the apartment has been seen, runs the partial plate from the café camera (Tate Protective Services), gets a court order for Claire's carton at Dominion once the receipt is found, gets the cottage lock log and the plate-reader hits once the cottage has been seen, the Saddle Ridge alarm history and doorbell clips once the lease is found, and leads the entry. On fobs: 'Those clone in a second with a forty-dollar reader.' Never states a conclusion before the evidence does.",
  lang:
    "Gerald Lang, 44, owner of Lang Records Systems (which built the Meridian Records Center's barcode checkout system in 2014) and Dominion Secure Records, Lorton Industrial Park. Reluctant: Meridian is most of his business and private customers' cartons are private, released only to the depositor in person or on court order. Explains the checkout system and the copier log. Signed Claire's receipt for carton P-0388 on Saturday, December 8, at 10:12 AM. Once Det. Harris's court order is served he brings the carton to the inspection table; shown the stack register or a footer, he restores badge 2214's history from the nightly backup, including the audit of reports run by SEC-RM: 'I don't know who SEC-RM is this month. It's a shared account.' Cooperative once the order is served.",
  bennett:
    "Bennett, retired LAPD detective, forty years on the job, now Blackwood's records man in Pittsburgh, speaking by phone. Calm, dry, kind underneath. Booked the 5 AM drive. Pulls records and backgrounds and asks for evidence rather than theories. Has the agency's own files from the autumn: the two courier packets of November 20 and December 4 and Dr. Lockhart's invoice copy, all with the same copier footer and the Capital Courier account 20417. Never goes beyond what the records show.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  donovan: [
    f("I'm all right. They checked me over in Manassas. My wrists are the worst of it.", undefined, "claire_how"),
    f("I was a records analyst at Meridian's Records Center in Chantilly for six years. Badge 2214. My job was knowing where every page in that building was.", undefined, "claire_job"),
    f("Every copy from the Records Center copier carries a footer: collection, box and item. Executive Office items show only the reference EO-01, never a signature. That's Policy 7.", undefined, "claire_records"),
    f("I copied three pages: the Tri-County invoice on October 26, the client list on November 19, the Kane agreement on December 3. Each went to Miriam. I kept duplicates, because a records person keeps a copy of anything that leaves.", undefined, "claire_releases"),
    f("Miriam Castell asked me to coffee near Dupont Circle on September 14. She said a senior source inside Meridian had given her my name. I never met that person. I believe Miriam was honest with me.", undefined, "claire_castell"),
    f("I met Dr. Lockhart once, at Clearwater's breakfast on October 18, for about five minutes. She was kind. She didn't know who I was.", undefined, "claire_lockhart"),
    f("After Martin Keller died I started keeping what nobody asked for. Nobody ever wanted the cover sheet. The cover sheet is the only page that says who said yes.", undefined, "claire_eo"),
    f("I saw Alan's July memo as his compliance liaison. Three programs, in an order. The arrests came in that order.", undefined, "claire_memo"),
    f("I resigned on Friday, December 7, and left my badge on Benjamin's desk with the letter.", undefined, "claire_resign"),
    f("Miriam called me at about seven on Wednesday morning. She said Meridian security knew about the meeting and sent me a cottage and a code. I went because I wanted to.", undefined, "claire_wednesday"),
    f("I couldn't stand you up with nothing, and I couldn't write more in a café with that car outside. I didn't know the car was there until I left.", undefined, "claire_note"),
    f("At nine that night a man said through the door that Miriam had sent him. That's the only reason I opened it.", undefined, "claire_door"),
    f("I wanted to call Miriam first. He took my phone. I ran for the back door and he caught me in the kitchen and put plastic ties on my wrists. He took my document wallet.", undefined, "claire_kitchen"),
    f("He kept asking who asked me to copy them, and who in Pittsburgh I'd talked to. He talked on the phone to someone he called W.", undefined, "claire_questions"),
    f("About one in the morning he put a sleep mask on me and drove maybe half an hour. A basement room, a padlock on the outside. I never told him about Lorton.", undefined, "claire_basement"),
    f("I didn't know him. He never gave me a name.", undefined, "claire_man"),
    f("He wanted to know who asked me to copy them. Whoever sent him didn't know either.", undefined, "claire_sent"),
    f("I don't know who the source is. Someone who could read Alan's memo, which is a short list I can't see the top of.", undefined, "claire_source"),
    f("Tyler set up the drive with a split key, his keyfile and my passphrase. I gave him a sealed envelope on Tuesday.", undefined, "claire_tyler"),
    f("The wallet had the three things nobody asked for, my timeline, and how it started. He took it.", undefined, "claire_wallet"),
    f("I'll give you my passphrase. Tyler has the other half, and the drive is in Lorton, in carton P-0388.", rescued, "claire_passphrase", EFFECTS.passphrase),
    f("'A' and EO-01 are all the file copies ever show. I don't know who they are.", undefined, "claire_a"),
    f("Forty-seven pages from three boxes, and three were asked for.", ev("E037"), "claire_archive"),
    f("Same reference, two divisions, above both men.", ev("E040"), "claire_coversheets"),
    f("Alan rebuilt the boxes from memory and his own index. Of course he did.", ev("E022"), "claire_sequence"),
  ],
  tate: [
    f("Brandon Tate. I own Tate Protective Services. Former Army MP.", undefined, "tate_who"),
    f("We do protective details, site security and investigations support.", undefined, "tate_firm"),
    f("I've never heard of Claire Donovan.", G.tateStory1, "tate_claire"),
    f("Tahoe 3 is a pool vehicle. Where it was on Wednesday is a client's business.", G.tateFree, "tate_tahoe"),
    f("We did some work for Meridian a couple of years ago. Nothing since.", G.tateFree, "tate_meridian"),
    f("On Wednesday I was working. I don't discuss clients.", G.tateFree, "tate_wednesday"),
    f("Ms. Donovan contacted my firm on Wednesday evening. She believed she was in danger and asked to be moved somewhere nobody knew. We did that. She's safe.", G.tateStory2, "tate_client"),
    f("She asked that nobody be told where she is, the police included. I'm respecting a client's wishes.", G.tateStory2, "tate_where"),
    f("She was frightened. Frightened people break things.", { all: [G.tateStory2, ev("E029")] }, "tate_struggle"),
    f("No comment.", rescued, "tate_counsel"),
    f("No comment.", rescued, "tate_sent"),
    f("She wanted to go. I couldn't let her, for her own safety.", ev("E035"), "tate_basement"),
    f("I don't know whose handwriting that is.", ev("E032"), "tate_note"),
    f("No comment.", ev("E031"), "tate_phone"),
    f("No comment.", ev("E033"), "tate_lease"),
  ],
  rourke: [
    f("I'm in a cell, detective. I speak to my lawyer and the walls.", undefined, "rourke_who"),
    f("Brandon Tate was a vendor. Meridian used a great many vendors.", undefined, "rourke_contact"),
    f("Mr. Whitlock works for my defense.", undefined, "rourke_whitlock"),
    f("On my attorney's advice, I won't answer questions about that note.", undefined, "rourke_note"),
    f("You think you found me. Someone handed me to you. I'd like to know who as much as you would.", undefined, "rourke_handed"),
    f("My attorney won't let me discuss my detention hearing.", undefined, "rourke_hearing"),
    f("I'm not here to discuss Meridian's internal records.", undefined, "rourke_meridian"),
    f("Ask Mr. Whitlock who he calls. I don't have a telephone.", ev("E031"), "rourke_calls"),
    f("Mr. Lyons is in custody, as you know. So is his phone.", ev("E031"), "rourke_lyons"),
  ],
  lockhart: [
    f("Miriam Castell telephoned me this afternoon, very upset. Someone Clearwater has been helping is missing. Is she safe? Is there anything the foundation can do?", undefined, "lockhart_call"),
    f("I've heard she's been found, and that she's safe.", { all: [rescued] }, "lockhart_call"),
    f("I fund Clearwater openly, because I believe institutions behave better when someone is watching.", undefined, "lockhart_clearwater"),
    f("I received one of these envelopes in October and passed it to your colleague in November. Miriam tells me now that it went out from her own office. She never told me so at the time.", undefined, "lockhart_envelope"),
    f("When I read about Martin Keller, I thought the people looking into his death should have it.", undefined, "lockhart_why_sent"),
    f("I think I met Claire once, at the October breakfast. A thoughtful young woman.", undefined, "lockhart_claire"),
    f("Miriam has always protected her sources, and I've never asked her to do otherwise.", undefined, "lockhart_source"),
    f("Miriam told me today she'd found Claire somewhere to stay. I wish she'd gone to the police.", undefined, "lockhart_cottage"),
    f("I'm afraid I can't help you with Meridian's internal shorthand.", undefined, "lockhart_eo"),
    f("Meridian is a consulting firm. I gather it has had a difficult autumn.", undefined, "lockhart_meridian"),
    f("If there's anything the foundation can do, my office will put you through to me.", undefined, "lockhart_help"),
    f("So Miriam tells me. Clearwater's account. I'd rather she had told me at the time.", ev("E018"), "lockhart_courier"),
    f("I'm not able to judge a company's internal memoranda. I'm glad she wrote it down, and gladder that she's safe.", ev("E039"), "lockhart_timeline"),
  ],
  castell: [
    f("I'm Miriam Castell, program director of the Clearwater Accountability Initiative. We support people who report wrongdoing inside institutions.", undefined, "castell_who"),
    f("Claire is somewhere safe, by her own choice. I won't say where.", G.castellGuarded, "castell_whereabouts"),
    f("I don't discuss sources. That's the only promise this office makes.", G.castellGuarded, "castell_sources"),
    f("Claire is someone Clearwater has been helping.", undefined, "castell_claire"),
    f("We met for coffee near Dupont Circle on Friday, September 14. The first note had named her.", G.cooperates, "castell_claire"),
    f("The Lockhart Foundation is our founding patron. It's on the wall and on every program card. There's nothing hidden about it.", undefined, "castell_lockhart"),
    f("Claire came to our donor breakfast on October 18. I wanted her to see the people who keep us going.", undefined, "castell_breakfast"),
    f("In early September an unsigned typed note came by bike messenger, from someone senior at Meridian who wants it cleaned up. It named Claire. Every later note came the same way, a different messenger each time. I burned each one, as the first note asked.", G.cooperates, "castell_notes"),
    f("I don't know who the source is. I've never met them. I believed it was someone senior inside Meridian. I still don't know otherwise.", G.cooperates, "castell_identity"),
    f("Here are my messages with Claire, printed and initialed.", G.cooperates, "castell_messages", give("E025")),
    f("I booked Laurel Run Cottage at 6:32 on Wednesday morning on Clearwater's card. Here's the confirmation.", G.cooperates, "castell_booking", give("E027")),
    f("The pages went by Capital Courier on Clearwater's account, 20417, sender left blank. Here's the statement.", G.cooperates, "castell_courier", give("E018")),
    f("The first note said the fund's founding donor should have the first page, so the fund would have to look at itself. I never told Dr. Lockhart it came from us, until today. The second and third were for the investigators.", G.cooperates, "castell_first"),
    f("At 6:15 on Wednesday a man called, blocked number. Courteous, unhurried. He said he spoke for the source, that Meridian security knew about the meeting, gave me the cottage listing, and said someone would come for Claire's papers Friday. I couldn't tell his voice again.", G.cooperates, "castell_call"),
    f("I called Claire at 6:58 and sent her the booking and the code. She said she was leaving a note for you first.", G.cooperates, "castell_claire_call"),
    f("On Monday the tenth Claire came here and told me she was done and would talk to the investigators herself. I asked her to wait while I asked the source.", G.cooperates, "castell_monday"),
    f("On Tuesday at 7:40 PM Claire called to say she was writing to you that night. I left word on the message number the first note gave me.", G.cooperates, "castell_tuesday"),
    f("Because one true page is a lead and fifty is a leak. The note said it and I said it to her as if it were mine.", G.cooperates, "castell_one_page"),
    f("I called Dr. Lockhart after we spoke. She ought to hear it from me.", G.cooperates, "castell_patron"),
    f("I didn't send anyone to her. The man on the phone said Friday, not Wednesday night.", { all: [G.cooperates, ev("E029")] }, "castell_sent"),
    f("Each time she handed me an envelope I sent it the way the note said, the same day or the next.", ev("E038"), "castell_register"),
  ],
  prentiss: [
    f("Tyler Prentiss. I'm a software engineer.", undefined, "prentiss_who"),
    f("Claire and I split up in March. I moved out of 3C.", undefined, "prentiss_split"),
    f("I last saw her in the summer.", G.tylerHiding, "prentiss_last_contact"),
    f("I don't know where she is.", undefined, "prentiss_where"),
    f("Her phone's been off since Wednesday morning. My last three texts never delivered.", tylerOpen, "prentiss_where"),
    f("She came on Thursday, December 6, with a USB drive. She phoned me Monday night frightened. On Tuesday at 12:30 she brought a sealed envelope.", tylerOpen, "prentiss_admit"),
    f("Here's her envelope. 'Only if I go quiet for two days.' It's been two days.", tylerOpen, "prentiss_envelope", give("E011")),
    f("You can photograph our thread.", tylerOpen, "prentiss_texts", give("E013")),
    f("The drive has a split key: a keyfile on my machine and her passphrase. Neither half opens it alone.", tylerOpen, "prentiss_drive"),
    f("I lied because I helped her lock up confidential corporate files, and I'm waiting on a security clearance for a defense contractor job.", tylerOpen, "prentiss_lied"),
    f("On Monday she said she'd told M. she was done. She said if she disappeared it wasn't because she wanted to.", tylerOpen, "prentiss_monday"),
    f("I'll give my half of the key to your people.", G.tylerKey, "prentiss_key", EFFECTS.tylerKey),
  ],
  patel: [
    f("I'm Gwen Patel, in 3D. I work nights in the ER at Inova Alexandria.", undefined, "patel_who"),
    f("Claire's quiet, kind, always reading. We've been neighbors three years.", undefined, "patel_claire"),
    f("I got home a little before eight Wednesday. Claire was locking her door, alone, with the small black bag and her green coat. She said, 'Just a few days away.' It wasn't her real smile.", undefined, "patel_wednesday"),
    f("I gave Detective Harris a statement. Here's my copy.", undefined, "patel_statement", give("E007")),
    f("On Monday about two there was a man in the hall I didn't know. White, late thirties, shaved head, a navy work jacket, a clipboard. He said he was checking smoke detectors. Nobody checked mine.", undefined, "patel_smoke"),
    f("Around noon on Wednesday I heard drawers and doors next door for about half an hour. I thought Claire had come back.", undefined, "patel_noises"),
    f("Her ex, Tyler, lives in Clarendon. He still came by in the fall.", undefined, "patel_tyler"),
    f("Saturday afternoon Claire borrowed my little screwdriver for the bookcase and brought it back in ten minutes. She's never fixed anything in her life.", { flag: "screwdriver_known" }, "patel_screwdriver"),
  ],
  corbett: [
    f("Alan Corbett. I was Senior Compliance Officer at Meridian.", undefined, "corbett_who"),
    f("I'll write down how the Records Center works, for you and Detective Harris.", undefined, "corbett_records", give("E014")),
    f("The copier prints COPY, MAG-RM, then collection, box and item on every page. It runs only on a badge and logs every job.", undefined, "corbett_footer"),
    f("EO items are Executive Office records: cover sheets, routing slips, approvals. Under Policy 7 their file copies carry the reference EO-01, never a signature.", undefined, "corbett_eo"),
    f("Claire was my compliance liaison for three years, and a friend. The most careful records analyst I've worked with.", undefined, "corbett_claire"),
    f("Claire's badge was R3: restricted collections, only with the Records Administrator's signed approval in the stack register.", undefined, "corbett_badge"),
    f("Benjamin Sayer runs the Records Center. Nothing goes into a restricted stack without his signature in the register.", undefined, "corbett_sayer"),
    f("Gerald Lang built the checkout system and keeps the nightly backups at his storage company in Lorton.", undefined, "corbett_lang"),
    f("My position was eliminated on September 28. There's a severance agreement.", { not: ev("E022") }, "corbett_left"),
    f("In each box the page that went out names the division man; the page filed behind it, an EO item, never left. Here's my reconstruction.", duplicates, "corbett_sequence", give("E022")),
    f("On July 30 I sent the Executive Office a memo naming three programs: Holt's Pittsburgh affiliate arrangement, Rourke's intelligence practice, Kane's Baltimore logistics. Here's my copy.", ev("E022"), "corbett_memo", give("E023")),
    f("Holt, Rourke, Kane. That's the order I wrote them in.", ev("E023"), "corbett_order"),
    f("SEC-RM is Meridian Security's records account. Somebody wanted to know who'd pulled those boxes.", ev("E017"), "corbett_secrm"),
  ],
  halvorsen: [
    f("I'm Nina Halvorsen. I manage the Wren.", undefined, "halvorsen_who"),
    f("Claire's a regular. Oat milk cortado, the back booth, always a book.", undefined, "halvorsen_claire"),
    f("She booked the back booth by voicemail Tuesday at 9:31 PM: 'A meeting, might run long.'", undefined, "halvorsen_booking"),
    f("At 8:14 on Wednesday she came in with a bag, asked for an envelope, wrote at the counter, sealed it and said, 'If someone asks for the Donovan booth, give them this.'", undefined, "halvorsen_morning"),
    f("Her hand was shaking. She's usually the calmest person in here.", undefined, "halvorsen_seemed"),
    f("A gray SUV parked at the hydrant across the street with the engine running. A man at the wheel who never got out. It pulled out right after she left.", undefined, "halvorsen_suv"),
    f("I printed the camera stills for you.", undefined, "halvorsen_camera", give("E004")),
    f("I was in the back with a delivery from about 9:45. I didn't see you in the booth until 10:50.", undefined, "halvorsen_missed"),
    f("Gray, big, a little white 3 in the back window. I'd know it again.", ev("E030"), "halvorsen_tahoe"),
  ],
  collins: [
    f("I'm MPD's liaison to the federal task force on the Rourke case.", undefined, "collins_who"),
    f("Rourke is at the Potomac Regional Detention Center in Alexandria. Lyons and Hurst are held elsewhere.", undefined, "collins_rourke"),
    f("The government's proffer at Rourke's detention hearing on November 26 included a page of the client list that came to Blackwood by courier, footer and all. His lawyer had it in his hands.", undefined, "collins_hearing"),
    f("Agent Quinlan can set up an interview with Rourke, with his lawyer, if you bring a reason.", undefined, "collins_interview"),
    f("Quinlan has the Rourke interview set up. Fenwick will be in the room.", ev("E032"), "collins_interview"),
    f("That note is Rourke's handwriting. I read a month of it out of his safe.", { flag: "note_found" }, "collins_note"),
    f("Whitlock isn't on Fenwick's staff. Fenwick's office says he was retained separately by the family. Rourke has no family on record.", ev("E032"), "collins_whitlock"),
    f("Lyons's cell was taken off him on November 21.", ev("E031"), "collins_lyons"),
    f("Agent Quinlan has the federal side. She pulls the detention records.", undefined, "collins_quinlan"),
  ],
  harris: [
    f("I'm the lead on case 18-034417. An adult who packed a bag, quit her job and switched off her phone is allowed to leave.", undefined, "harris_case"),
    f("Somebody has been in her apartment on a copy of her fob.", ev("E006"), "harris_case"),
    f("Here are Ofc. Ridley's welfare check photographs from 1:20.", undefined, "harris_welfare", give("E005")),
    f("Here's her phone record, on an exigent request.", { visited: "claire_apt" }, "harris_phone", give("E008")),
    f("The partial plate and the fleet decal come back to a gray Tahoe registered to Tate Protective Services LLC, Clarendon Boulevard, Arlington.", ev("E004"), "harris_plate", EFFECTS.tateKnown),
    f("On that receipt I can get a court order for her carton at Dominion: missing person, possible indication of whereabouts.", ev("E012"), "harris_carton", EFFECTS.carton),
    f("Here's the cottage's smart lock log, through the Fauquier County Sheriff's Office.", { visited: "safe_house" }, "harris_lock", give("E028")),
    f("Here's the vehicle record on the Tahoe, with the plate-reader hits.", { all: [ev("E004"), { visited: "safe_house" }] }, "harris_vehicle", [{ giveEvidence: "E030" }, ...EFFECTS.tateKnown]),
    f("Here's the alarm history for Saddle Ridge Lane and the doorbell camera across the road.", ev("E033"), "harris_alarm", give("E034")),
    f("Here's Claire's statement.", rescued, "harris_statement", give("E036")),
    f("Fobs clone in a second with a forty-dollar reader.", ev("E006"), "harris_fob"),
    f("Brandon Tate: licensed security business on Clarendon Boulevard, former Army MP. Nothing on him with us.", G.tateKnown, "harris_tate"),
    f("A warrant needs more than a car at a hydrant.", G.tateKnown, "harris_warrant"),
    f("The warrant for Tate's office is signed.", { all: [G.tateKnown, { flag: "tate_warrant" }] }, "harris_warrant"),
    f("Miriam Castell is with the Clearwater Accountability Initiative in D.C. Tyler Prentiss is in Arlington.", ev("E008"), "harris_numbers"),
    f("When you know where she is, call me and we go.", ev("E033"), "harris_entry"),
    f("She's alive. She was checked over at the hospital in Manassas and she's here with us.", rescued, "harris_claire"),
  ],
  lang: [
    f("Gerald Lang. Lang Records Systems and Dominion Secure Records.", undefined, "lang_who"),
    f("Meridian is most of my business.", undefined, "lang_meridian"),
    f("I built the Records Center's barcode checkout system in 2014. Every box out and in, and every copier job, logged to a badge. The nightly backup is here.", undefined, "lang_system"),
    f("Private cartons are released to the depositor in person or on court order.", undefined, "lang_carton"),
    f("The order's served. I'll bring the carton to the table.", { flag: "carton_warrant" }, "lang_carton"),
    f("I don't talk about private customers.", undefined, "lang_claire"),
    f("I signed that receipt. Carton P-0388, Saturday, December 8, 10:12 AM.", ev("E012"), "lang_claire"),
    f("I'll print badge 2214's history from the backup.", G.langCheckout, "lang_checkout", give("E017")),
    f("I don't know who SEC-RM is this month. It's a shared account.", ev("E017"), "lang_secrm"),
    f("The drive's sealed in a static bag. Not my business to try it.", { flag: "carton_warrant" }, "lang_drive"),
  ],
  bennett: [
    f("Forty years LAPD. A woman who books a booth and leaves a note didn't plan to vanish.", undefined, "bennett_case"),
    f("Claire Donovan: no record. An Alexandria address and a blue 2014 Subaru.", undefined, "bennett_claire"),
    f("Meridian Advisory Group is a private consulting firm. Private companies don't file much worth reading.", undefined, "bennett_meridian"),
    f("Clearwater is a Washington nonprofit. Its founding patron is the Lockhart Foundation. That's on its own website.", G.castellKnown, "bennett_clearwater"),
    f("Miriam Castell testifies on the Hill and files complaints with inspectors general. Respectable.", G.castellKnown, "bennett_castell"),
    f("Tate Protective Services LLC is a licensed security business in Arlington. Tate is a former Army MP.", G.tateKnown, "bennett_tate"),
    f("Our two courier packets and the Lockhart invoice copy all carry the same footer and came on Capital Courier account 20417.", { flag: "courier_known" }, "bennett_packets"),
    f("Dean Whitlock: no investigator's license I can find in Virginia, Maryland or the District.", { any: [ev("E031"), ev("E032")] }, "bennett_whitlock"),
    f("The Lockhart Foundation is the same foundation that sent us the Keller invoice.", G.lockhartKnown, "bennett_lockhart"),
    f("Send me the drive and both halves and I'll have it opened.", G.bennettDrive, "bennett_drive", [{ startLab: "decrypt" }]),
    f("Nothing new on my side. I'm waiting on you.", undefined, "bennett_again"),
  ],
};
