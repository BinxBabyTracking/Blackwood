import type { Condition, Effect } from "@/game/engine/types";

/*
 * What each person knows, and will say, about The Architect (S001C06), the
 * series finale. Used to answer questions in the player's own words when no
 * authored answer fits.
 *
 * Rules for this file:
 * - Each list is that person's own account. Pike, Dr. Lockhart, Kane and
 *   Oduya (at first) keep their stories, lies included. Dr. Lockhart is
 *   composed and never confesses; she acknowledges only her signature on trust
 *   documents, that she knows Pike, and that she funds Clearwater.
 * - A fact is gated exactly like the authored answer it points to (`entry`),
 *   using the shared gates in `G` below, so no phrasing reaches what the
 *   investigation has not earned. Facts that hand over evidence, set a flag or
 *   send off a lab test carry the same effects as the answer. A fact for one of
 *   an answer's variants adds the variant's condition to the answer's own.
 * - Recovery routes (R01 to R17) are handovers like any other: offered from
 *   chapter 2, only while the record has not already been given in this case,
 *   and only when the subject is asked about. Nobody lists them.
 * - Nothing from the design's "Closing report only" list: nothing about how the
 *   fire was set or what was done in Bay C, nothing said on Dr. Lockhart's
 *   calls with Pike, no reasons of hers beyond her own papers, nothing about
 *   what she intended for Benjamin. Nobody says she is the Architect or that
 *   she ordered any killing; the murders are the killers' own acts.
 * - Times, amounts, names and numbers follow docs/S001C06-timeline.md.
 */

type Fact = { text: string; requires?: Condition; entry?: string; effects?: Effect[] };
const f = (text: string, requires?: Condition, entry?: string, effects?: Effect[]): Fact => ({ text, requires, entry, effects });

const ev = (id: string): Condition => ({ hasEvidence: id });
const all = (...c: Condition[]): Condition => ({ all: c });
const any = (...c: Condition[]): Condition => ({ any: c });
const not = (c: Condition): Condition => ({ not: c });
const give = (...ids: string[]): Effect[] => ids.map((id) => ({ giveEvidence: id }));

/** Gates shared with characters.ts, so every answer and its facts carry the same condition. */
export const G = {
  ch2: { chapter: 2 } as Condition,
  ch3: { chapter: 3 } as Condition,
  ch4: { chapter: 4 } as Condition,
  ch5: { chapter: 5 } as Condition,
  re02: { event: "RE02" } as Condition,
  re05: { event: "RE05" } as Condition,
  re07: { event: "RE07" } as Condition,
  re08: { event: "RE08" } as Condition,
  re09: { event: "RE09" } as Condition,
  re10: { event: "RE10" } as Condition,
  re11: { event: "RE11" } as Condition,
  re12: { event: "RE12" } as Condition,
  d16: { deduction: "D16" } as Condition,
  d21: { deduction: "D21" } as Condition,
  pikeKnown: any(ev("E006"), ev("E012"), ev("E013")),
  oduyaKnown: any(ev("E004"), ev("E006")),
  corbettKnown: any({ talkedTo: "donovan" }, { talkedTo: "oduya" }),
  /** Irene Chen: by phone once her number is found, and at the laboratory in chapter 4 whatever was found. */
  chenOn: any(ev("E006"), { chapter: 4 }),
  pikeAdmits: { flag: "pike_admits" } as Condition,
  pikeFirstStory: not({ flag: "pike_admits" }),
  pikeAssignmentTold: any({ flag: "pike_admits" }, ev("E017")),
  pikeExceeded: any(ev("E026"), ev("E027")),
  pikeMenAsked: any(ev("E005"), ev("E021")),
  pikeHold: any(ev("E013"), ev("E015")),
  pikeChair: any(ev("E055"), ev("E059")),
  pikeRefuses: all(any({ presented: "pike:E020" }, { asked: "pike_texts" }), not(any(ev("E055"), ev("E059")))),
  oduyaAdmitted: any({ asked: "oduya_booking" }, { presented: "oduya:E004" }, { presented: "oduya:E001" }),
  oduyaLying: not(any({ asked: "oduya_booking" }, { presented: "oduya:E004" }, { presented: "oduya:E001" })),
  oduyaBooking: any(ev("E001"), ev("E004")),
  oduyaTapeReady: any({ event: "RE08" }, ev("E029")),
  oduyaTapeWaiting: not(any({ event: "RE08" }, ev("E029"))),
  /** Benjamin at the Solvang laboratory, drive in hand, counsel beside him. */
  passphrase: all({ chapter: 4 }, { at: "exam_facility" }, ev("E029")),
  driveElsewhere: all(ev("E029"), not(all({ chapter: 4 }, { at: "exam_facility" }))),
  recover: all({ event: "RE07" }, not({ event: "RE08" })),
  recoverReady: all({ at: "ridge_property" }, ev("E026")),
  signatures: all(ev("E030"), ev("E043")),
  chain: all(ev("E031"), ev("E033"), ev("E034"), ev("E035"), ev("E036"), ev("E038"), ev("E041")),
  rourkeSafe: all({ chapter: 4 }, ev("E034")),
  kaneSafe: all({ chapter: 4 }, ev("E035")),
  witnesses: all({ chapter: 5 }, { talkedTo: "sayer" }, { talkedTo: "donovan" }, { talkedTo: "marchetti" }),
  numbersEarly: all(ev("E006"), not({ chapter: 3 })),
  number717: all({ chapter: 3 }, ev("E006")),
  claireUnderstands: all(ev("E037"), ev("E052")),
  kaneShown: any(ev("E035"), ev("E048")),
  rourkeShown: any(ev("E034"), ev("E047")),
  kaneNoForm: not(ev("E048")),
  holtNoRegister: not(ev("E031")),
  trustBefore: not(ev("E043")),
  beforeD16: not({ deduction: "D16" }),
  patuxent: any(ev("E013"), ev("E018")),
  /** A recovery route: from chapter 2, while the record has not been handed over in this case. */
  route: (r: string): Condition => all({ chapter: 2 }, not(ev(r))),
};

export const SPEECH = {
  setting:
    "Northern Virginia, Washington, D.C., Maryland, Wilmington, a farm in Fulton County, Pennsylvania, and Manhattan and Queens, from Thursday, December 27 to Sunday, December 30, 2018. A records administrator who kept the secret register of Meridian Advisory Group has vanished the morning after the records center burned, and the people who know how the register worked are scattered between law offices, federal detention and the FBI. People speak American English: federal agents brisk and exact, lawyers careful, the records people precise, the men in custody short with counsel beside them.",
  style:
    "Answer in one to four short spoken sentences, in character, in American English. No em dashes or en dashes. Never state anything the character does not know. Never confess to a crime. Never say who the Architect is, never say Dr. Lockhart ordered anything, and never say anyone ordered a killing. Never describe how the fire was set. Use only facts given; if asked something the character does not know, say so in character.",
};

export const PERSONA: Record<string, string> = {
  sayer:
    "Benjamin Sayer, 58, Records Administrator at Meridian Advisory Group from 2008 (the post from 2009) to Friday, December 21, 2018. Recovered alive by the FBI and the Pennsylvania State Police from a tenant house in Fulton County on Saturday, December 29; interviewed at the FBI Washington Field Office and later at the Solvang Document Laboratory in Baltimore, always with his lawyer, Irene Chen, present. Exhausted, exact, then resolved. Speaks slowly and precisely, corrects small errors, never overstates. Kept the Executive Authorization Register, the EX-7 forms, the A notes and the digests; from January 2014 exported the executive volume to one encrypted drive every Friday and wrote the digests by hand in a bound custody ledger. Began keeping his own copy in October 2013 after logging a form for the surveillance of a congressional staffer. 'If they were going to be kept, someone honest had to keep them.' Understood in October, from the October 4 note telling him to approve Claire Donovan's pulls, what the leaks were; did nothing then and is not proud of it. Refused the December 21 instruction in writing and resigned. Fled because he was watched, not taken. Says plainly which conclusions need corroboration: 'I can tell you what came through my hands. I can't tell you what anyone meant.' Never says who the Architect is in so many words; says only what he saw and logged.",
  lockhart:
    "Dr. Evelyn Lockhart, 52, founder of the Lockhart Foundation, 1140 Fifth Avenue, New York. Composed, gracious, precise, unhurried; increasingly guarded, then cold, then entirely composed. Her account: she founded Meridian Advisory Group in 2007 and stepped out of every role in 2009; her family trust is a passive investor; Malcolm Pryor runs the company. The restructuring is prudence after Ms. Marchetti's arrest. She funds the Clearwater Accountability Initiative proudly; what its program did was its own work. The envelope in the Keller case reached her office with no name. She barely knows Benjamin Sayer, who she is told took company property. She knows Conrad Pike as the company's security consultant. On A-1: 'I don't know what that is.' Later: 'Codes on a form are not a person.' Challenges provenance (a disgruntled man's homemade drive), credibility (Mr. Sayer stole, Ms. Marchetti is buying her freedom, Ms. Donovan copied documents for strangers) and interpretation (trusts are not crimes). Acknowledges only her signature on trust documents, that she knows Pike, and that she funds Clearwater. Never confesses and never says what she intended.",
  marchetti:
    "Elena Marchetti, 50, principal of Marchetti Law Group PLLC, 27th floor, 600 Lexington Avenue; Meridian's outside counsel; code C-5. Arrested December 22 on the Ogden matter, on bail since December 24: passport surrendered, ankle monitor, no contact with Lockhart Foundation or Meridian personnel. Interviewed at her office with her defense lawyer, who interrupts often. Controlled, then anxious, then defensive. Wants a cooperation deal and fears she is next. Says everyone who mattered knew who signed for the Chair and nobody said it. Received the December 21 note by courier at 9:10 AM, forwarded it to Benjamin at 11:40 AM as told, and wrote to her own file at 11:55 AM that it conflicted with the hold; did not countersign the new schedule. After her arrest Dr. Lockhart's office stopped taking her calls and Pike took over. Claims Dr. Lockhart told her on the telephone to have Nathaniel Ogden's research dealt with 'at any cost'; her lawyer says she will say so under oath with an agreement. Gives what protects her, never the whole structure.",
  pike:
    "Conrad Pike, 54, principal of Pike Risk Services LLC, Suite 610, Leesburg Pike, Tysons; twenty years Army military police, then corporate security; Meridian's security consultant since 2016. Professional, short sentences, never raises his voice. First story: after the fire he was reviewing security at the Records Center for the company; he has never met Benjamin Sayer beyond a phone message about company property; 'Cards get lent. Contractors need doors.' Once his assignment is out: he was lawfully retained on December 22 to recover company records a former employee took and to locate him discreetly so the company's lawyers could write to him; the December 26 disposal was a scheduled records action under counsel's instruction. Once the farm is in the record, his contractors 'may have exceeded instructions.' Shown his own texts he wants his lawyer and stops answering until his own reports or the note to him are in front of him. Never names Dr. Lockhart: 'My client is the company.' Never describes the fire.",
  donovan:
    "Claire Donovan, 34, former records analyst at Meridian's Records Center; cooperating witness. Reached at the FBI Washington Field Office or by phone after she called in about a text. Shaken by the anonymous text she received at 2:15 PM on Thursday ('Some records burn'), then steady, then angry as she understands. Copied three genuine records in the autumn and gave them to Miriam Castell at Clearwater, who said they were what the investigators needed next. Every copy carries the copier's MAG-RM footer. Met Dr. Lockhart once, for about five minutes, at Clearwater's donor breakfast on October 18: Dr. Lockhart asked what she did, said the people who keep the records are an institution's conscience, and never mentioned Meridian. Benjamin Sayer was her supervisor from 2012 and signed her pulls without a word; she thought he was protecting her. Never saw the EX series itself; saw EO-01 references on cover sheets filed behind some pages and offered three to Castell on December 1, who returned them. 'I kept copies of everything I ever touched; that was the point.' Suggests Alan Corbett on retention questions.",
  holt:
    "Adrian Holt, 49, formerly of Holt Advisory LLC, Pittsburgh; code F-2. Held without bail in Carroway County since November 15; interviewed by recorded video with his lawyer, set up from SA Quinlan's office. Polished and calculating, minimizes, wants a deal. Approvals came down on EX-7 forms; he never knew who signed A-1: 'I assumed there was money behind it older than mine.' Says nothing about Martin Keller's death beyond his account in the Carroway case. Once the register is out, his lawyer produces his yellow copy of the FY2018 Carroway authorization: 'My client kept his authority, as anyone would.'",
  rourke:
    "Julian Rourke, 46, formerly director of corporate intelligence at Meridian; code I-3. In federal detention; interviewed by recorded video with his lawyer. Contempt, then silence. Without a proffer agreement he answers nothing of substance: 'Ask the people who kept score.' Shown his program's authorization: 'My lawyer will be speaking to the U.S. Attorney.' Gives nothing.",
  kane:
    "Gideon Kane, 48, formerly president of Kane Logistics Inc., Baltimore; code L-4. Held in Baltimore since December 5; HSI's federal case is pending. Interviewed by recorded video with his lawyer. Blunt. Ran a freight business; 'Nobody gave me orders.' Has never heard of A-1. Shown the Harbor authorizations: defensive; 'Pressure is not killing. I never told anyone to kill that man.' Gives nothing.",
  chen:
    "Irene Chen, 48, white-collar and whistleblower lawyer, Washington, (202) 555-0161. Benjamin Sayer retained her by phone on Wednesday, December 26, for a proffer; she returned his call at 4:40 PM. Precise and protective. Does not know where he went. Advises that authentication is a chain, not a signature: the drive must be sealed in front of counsel and imaged at an independent laboratory with an FBI examiner present, or the defense will say the FBI wrote it. At the Solvang laboratory in chapter 4 she sits beside Benjamin when he gives the passphrase. Not an all-purpose legal authority; speaks to preservation, authentication and her client's interests.",
  ames:
    "Walter Kiley, 43, partner at Kiley and Strand CPAs, Pittsburgh; since the Baltimore case, forensic accountant to the federal prosecutors. Careful, exact, never overstates. At the Brandywine Fiduciary records room in Wilmington he explains the Cardinal Point Trust: on paper the trust and its companies own Meridian and Dr. Lockhart owns nothing; Article 4 lets the trust protector direct distributions, appoint managers and direct the business; the four 2018 directions of $1,100,000 total $4,400,000, matching the 2018 reserved budgets to the dollar. Distinguishes financial control from proof of criminal command: 'Control is not a crime by itself.' Kept his Carroway payment schedule and his freight-to-finance tracing.",
  wexler:
    "Simon Wexler, 29, analyst at Ogden Fiduciary Partners, New York; keeps Nathaniel Ogden's research copies. Nervous, earnest, jumps when the phone rings. Nathaniel thought the trust at the bottom was hers, but the paper stopped at the trustee's door. Nathaniel called Brandywine twice and was told the trustee acts on written direction and does not discuss clients. Has Nathaniel's comparison of the exposed executives, which he started on December 10, and hands it over when asked; the trust papers from Halvard's binders are with Detective Caruso.",
  caruso:
    "Det. Anthony Caruso, 49, NYPD Manhattan South Homicide, lead on the Ogden case. Dry, engaged. Gabriel Knox is charged with Nathaniel Ogden's murder; Knox says 'counsel,' meaning Marchetti, sent him to scare Ogden and take his papers, not to kill him. Holds the letters recovered from Ogden's briefcase, and the subpoena copies of the trust protector authorization and the Class B rights agreement from Halvard's binders. On Sunday morning a building superintendent in Long Island City, Vito Scarpa, called about men and boxes moved overnight into Meridian's old fourth-floor office and a shredding truck booked for Monday; Caruso's squad holds the floor for the FBI.",
  quinlan:
    "SA Teresa Quinlan, 44, FBI Washington Field Office. Brisk, plain, exact about what the law allows. Got Benjamin's email from Blackwood at 9:10 AM Thursday and asked Arlington County for a welfare check. Explains the November 26 legal hold and the line between a restructuring (legal) and destroying held records (obstruction). Sets up the video interviews with Holt, Rourke and Kane; leads the headquarters search and the recovery; sends the phones to CART and the drive and signatures to Dr. Solvang. Hands over exhibits when asked about them. Never does the player's reasoning and never says who the Architect is; after the identity is established she says 'the register says what it says, and it will have to say it to a jury.'",
  corbett:
    "Alan Corbett, 51, formerly senior compliance officer at Meridian, 214 Hillwood Avenue, Falls Church; his position was eliminated on September 28 with a severance agreement. Reached by telephone. Wary: on Thursday a man called to 'remind' him of his confidentiality agreement. Candid once talking. Compliance never had access to Bay C or the EX series; 'Benjamin was the only one who saw both halves.' Explains retention, legal holds and what a schedule change needs (the Records Administrator and counsel). Reconstructed the missing document sequence from his compliance index. Claire Donovan was his compliance liaison and is his friend.",
  oduya:
    "Caroline Oduya, 44, owner of Oduya Records Consulting, Suite 300, 1840 Sunrise Valley Drive, Reston. Built Meridian's records system, Custodia RMS, in 2010 and 2011 and kept its monthly offsite backups until Pike's office terminated the contract on December 23. Guarded at first: says she hasn't heard from Benjamin, to protect him. Once she admits it, guilty and then helpful: she booked Glenmore Court Residences, Unit 3C, Silver Spring, for him on December 26 at 10:05 AM in her firm's name, and at 3:40 PM on Thursday her office manager, Gil, read the address and code to a caller claiming to be 'Glenmore billing.' Feels responsible. Explains Custodia, the executive volume EXVOL, digests and Benjamin's Friday exports: 'Ben's drive was the only external device the system ever saw.' Still has the November 30 backup tape under the contract's 30-day return clause and will restore it only with the FBI present.",
  bennett:
    "Frank Bennett, retired LAPD detective, forty years on the job, Blackwood's records man, by phone from Pittsburgh. Dry, calm, kind underneath. Runs plates, phone numbers and backgrounds; holds the sealed Keller file in Blackwood's records room. Reminds the investigator that the people who were there in the earlier cases still have copies. Will not work the rolling board for anyone: 'That board's where the old cases talk to each other. I don't pin things for people.'",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  quinlan: [
    f("Benjamin Sayer is gone from his house, the Records Center burned overnight, and the records were under a federal hold. Bring me what you find and I'll tell you what I can do with it.", undefined, "quinlan_case"),
    f("The fire marshal calls it set, and the disposal order lifted a hold nobody had the power to lift. That's obstruction territory.", { deduction: "D04" }, "quinlan_case"),
    f("He's out and alive and the drive is sealed. Now it has to be proved genuine, on the record.", G.re08, "quinlan_case"),
    f("The register says what it says, and it will have to say it to a jury.", G.d16, "quinlan_case"),
    f("Arlington sent Ptl. Ocampo at 11:20 with the neighbor's key. No forced entry, no struggle; clothes, toothbrush and razor gone, his cell phone off in a kitchen drawer. He packed. Here's the report and the photographs.", undefined, "quinlan_welfare", give("E003")),
    f("The neighbor, Dolores Haverty, saw a gray SUV with two men in it, engine running, Sunday, Christmas Eve and Christmas night, and wrote the end of the plate on her grocery list. She saw him leave by the back alley this morning with a bag. Here's her statement.", undefined, "quinlan_neighbor", give("E005")),
    f("The U.S. Attorney's Office here sent a preservation letter on Monday, November 26, served on Meridian through its outside counsel, Elena Marchetti. Nothing it covers gets destroyed.", undefined, "quinlan_hold"),
    f("A restructuring is legal, selling positions is legal, closing accounts is legal, shredding on a normal schedule is legal. Shredding or burning records under a federal hold is obstruction, and following a witness to take records off him is witness tampering.", undefined, "quinlan_legal"),
    f("I can set up recorded video interviews with Holt, Rourke and Kane from the room down the hall, each with his lawyer. Rourke won't talk without a proffer agreement.", G.ch2, "quinlan_video"),
    f("We executed the warrant at Meridian headquarters at nine on Friday. The Chair's suite was already empty.", G.ch2, "quinlan_search"),
    f("Give me where he is and why he can't wait, and I'll have troopers there in an hour.", G.recover, "quinlan_recover"),
    f("A truck blocking the lane and a man at his back door with a pry bar is enough. State Police and my people are moving. Stay out of sight.", all(G.recover, G.recoverReady), "quinlan_recover"),
    f("CART will image the two prepaid phones from the Tahoe tonight under the warrant. You'll have the extraction when it's done.", G.re08, "quinlan_phones", [{ startLab: "phones" }]),
    f("Dr. Solvang can compare the A-1 approvals and specimen cards with signatures nobody disputes, from the trust's own file. She'll state an opinion, not a certainty.", G.signatures, "quinlan_signatures", [{ startLab: "signatures" }]),
    f("With every program, the funding, the cards and the signature opinion in hand, Dr. Solvang and our examiner will certify the chain of authority, including what it does not establish.", G.chain, "quinlan_chain", [{ startLab: "chain" }]),
    f("Lab work goes through me. When something's sent, I'll tell you; when it's back it comes to your desk.", undefined, "quinlan_lab"),
    f("CART has the contractors' phones.", { labStarted: "phones" }, "quinlan_lab"),
    f("The drive is being imaged at Solvang, write-blocked, with our examiner present.", { labStarted: "imaging" }, "quinlan_lab"),
    f("Dr. Solvang has the signatures.", { labStarted: "signatures" }, "quinlan_lab"),
    f("The chain of authority is being certified.", { labStarted: "chain" }, "quinlan_lab"),
    f("Item fourteen from Rourke's safe. We had it since November and couldn't read it: a yellow carbon form with codes and no names. Against the register it reads fine now. Here.", G.rourkeSafe, "quinlan_rourke_safe", give("E047")),
    f("Item nine from Kane's safe at Riverside, seized December 5. Another yellow carbon, 'pressure only.' It doesn't reach the killing of Hector Navarro. Here.", G.kaneSafe, "quinlan_kane_safe", give("E048")),
    f("Miriam Castell has been cooperating. She burned every note her source sent her, as the first one told her to. What she kept is Clearwater's own log of what Claire handed over and what was held back. It's yours.", G.ch5, "quinlan_castell", give("E056")),
    f("We've put every witness against the paper. Where somebody has a reason to shade it, the record carries the point. Here's the summary.", G.witnesses, "quinlan_witnesses", give("E058")),
    f("The compromising information index is an exhibit in the case against Rourke. I can release a copy for this. Here.", G.route("R03"), "quinlan_index", give("R03")),
    f("The intelligence reference on Russell Gaffney went into the federal case after Baltimore. You can have a copy. Here.", G.route("R04"), "quinlan_briggs", give("R04")),
    f("I don't do your reasoning for you. Bring me paper that says who, and paper that says the paper is real.", undefined, "quinlan_architect"),
    f("The register says what it says, and it will have to say it to a jury.", G.d16, "quinlan_architect"),
    f("Conrad Pike, Pike Risk Services, Tysons. Twenty years Army MP, then corporate security, no record, Meridian's security man since 2016. Knowing his name isn't a warrant.", G.pikeKnown, "quinlan_pike"),
    f("Elena Marchetti was arrested December 22 in New York on the Ogden matter and has been on bail since Christmas Eve: passport surrendered, ankle monitor, no contact with the foundation or Meridian. She wants a deal and she's afraid she's next.", undefined, "quinlan_marchetti"),
    f("We detained Kurt Sobczak, 44, and Travis Dunleavy, 37, both contracting for Pike Risk Services. Held on state charges, trespass and stalking, pending federal process. Neither has said a word.", G.re08, "quinlan_contractors"),
    f("Benjamin is cold, tired and very precise. He'll say nothing until his lawyer says so. When the drive goes to the laboratory, he goes with it.", G.re08, "quinlan_benjamin"),
    f("The fire marshal's preliminary finding is incendiary, deliberately set, with the one sprinkler zone for Bay C out of service. She referred it to us because of the hold. I won't go past her report.", undefined, "quinlan_fire"),
    f("Dr. Lockhart came in voluntarily, with counsel, and can leave whenever she likes. Put the paper in front of her one piece at a time. Don't expect a confession.", G.re12, "quinlan_interview"),
  ],
  bennett: [
    f("A records man who sends one page and then disappears either got scared or got careful. He picked that page.", undefined, "bennett_case"),
    f("Somebody lifted a hold they had no power to lift and then the building burned. Paper that gets burned twice is paper somebody's afraid of.", { deduction: "D04" }, "bennett_case"),
    f("Don't let a big name do your thinking. Let the paper.", G.d16, "bennett_case"),
    f("The partial plate and the dark gray Tahoe fit one Virginia plate, UFK-7731, registered to Pike Risk Services LLC in Tysons. Toll records have it out late on the 23rd, 26th and 28th. I'm sending the abstract.", ev("E005"), "bennett_plate", give("E021")),
    f("The Reston number is Oduya Records Consulting, the 202 is Irene Chen's law office, the 571 is the Records Center's manager. The 717 is a rural landline in south-central Pennsylvania he called twice in November. Give me a reason and I'll make the call.", G.numbersEarly, "bennett_numbers"),
    f("The 717 number is Lester Burkholder, a farmer in Fulton County north of McConnellsburg. A Mr. B. Sayer signed a winter lease on his tenant house on November 24, six months cash. Burkholder faxed the lease and says his trail camera caught a truck on the lane he doesn't know. I'd send someone, and not alone.", G.number717, "bennett_717", give("E025")),
    f("The Keller file is sealed in our records room with Dr. Lockhart's note and the copied invoice in it. I've pulled a copy for you and logged it.", G.route("R02"), "bennett_keller", give("R02")),
    f("Anything you didn't keep from the earlier files, the people who were there still have copies. Ask them, about the thing itself.", G.ch2, "bennett_old_files"),
    f("That board's where the old cases talk to each other. I don't pin things for people.", undefined, "bennett_rolling"),
    f("Conrad Pike: no record. Twenty years Army military police, then corporate security. Pike Risk Services, Suite 610, Leesburg Pike, Tysons. Meridian has been his biggest client since 2016.", G.pikeKnown, "bennett_pike"),
    f("Benjamin Sayer: no record. Fifty-eight. Meridian's records people since 2008. Owns the house on North 19th outright, no car registered, a cat named Dewey.", undefined, "bennett_sayer"),
    f("Oduya Records Consulting in Reston builds records systems for mid-size firms. Caroline Oduya built Meridian's around 2010. No record, pays her bills.", G.oduyaKnown, "bennett_oduya"),
    f("The Lockhart Foundation's public filings are clean. The old press releases say Dr. Lockhart founded Meridian in 2007; she's been off its paperwork since 2009.", undefined, "bennett_lockhart"),
    f("The Cardinal Point Trust is a Delaware statutory trust from 2009; the trustee is Brandywine Fiduciary in Wilmington. Delaware doesn't make a trust say who's behind it. Walter Kiley is the man for trust paper.", undefined, "bennett_trust"),
    f("Patuxent Secure Destruction is a licensed shredding company in Laurel, Maryland. Real trucks. They do what the paperwork tells them.", G.patuxent, "bennett_patuxent"),
    f("Nothing new on my side. I'm waiting on you.", undefined, "bennett_again"),
  ],
  donovan: [
    f("Thursday at a quarter past two I got a text from a number I didn't know: 'Some records burn.' I read about Chantilly an hour later. Agent Quinlan has someone outside my building.", undefined, "donovan_text"),
    f("I copied three records in the autumn and gave them to Miriam Castell at Clearwater. I've written it all down for the FBI. You should have it too.", undefined, "donovan_part", give("E051")),
    f("I pulled the originals, copied them on the Records Center copier and put them back. Every copy from that machine has a MAG-RM footer. Miriam said they were what the investigators needed next.", undefined, "donovan_copying"),
    f("The MAG-RM footer is the Records Center copier's stamp on every page: collection, box and item, the address of the original.", undefined, "donovan_footer"),
    f("Miriam told me I was helping, that the investigators needed the next thing. She never said who decided what came next. I never asked.", undefined, "donovan_castell"),
    f("I met Dr. Lockhart once, at Clearwater's donor breakfast on October 18, for about five minutes. She asked what I did and said the people who keep the records are an institution's conscience. She never mentioned Meridian.", undefined, "donovan_lockhart"),
    f("If those notes are hers, she already knew exactly what I did when she asked.", G.claireUnderstands, "donovan_lockhart"),
    f("Benjamin was my supervisor from 2012. He signed my pulls without a word. I thought he was protecting me.", undefined, "donovan_benjamin"),
    f("I never saw the EX series. Bay C was Benjamin's. I saw EO-01 references on cover sheets behind some pages, and on December 1 I offered three to Miriam. She gave them back.", undefined, "donovan_ex"),
    f("I kept copies of everything I ever touched; that was the point. Ask me for the one you need.", undefined, "donovan_copies"),
    f("Capital Courier account 20417 carried the envelopes. Miriam gave me a copy of her courier statement after I was out. Here's my copy.", G.route("R08"), "donovan_courier", give("R08")),
    f("My copy register: every page I copied, the date, the box, where it went. Here.", G.route("R10"), "donovan_register", give("R10")),
    f("I wrote a timeline when I saw the arrests came in an order. Take it.", G.route("R11"), "donovan_timeline", give("R11")),
    f("My comparison notes: my dates set against what Halvard did. Here.", G.route("R17"), "donovan_comparison", give("R17")),
    f("Alan Corbett was Meridian's senior compliance officer until September. Retention, holds, what a schedule change needs: he knows it cold.", undefined, "donovan_corbett"),
    f("Then I wasn't a whistleblower. I was a delivery service. The records were real, every one.", ev("E037"), "donovan_release"),
    f("Agent Quinlan has a car outside and a number I can call. I've stopped answering my phone to anyone else.", undefined, "donovan_safe"),
  ],
  oduya: [
    f("Oduya Records Consulting built Meridian's records system, Custodia, in 2010 and 2011, and kept their monthly offsite backups until they let us go on December 23.", undefined, "oduya_who"),
    f("I haven't heard from Ben since he left Meridian. He's a very private man.", G.oduyaLying, "oduya_benjamin"),
    f("Ben called me on Wednesday morning, the 26th, and asked me to find him somewhere for a week and not ask why. I booked Glenmore Court, Unit 3C, in Silver Spring, on my firm's card, the 27th to January 3. Here's the confirmation.", G.oduyaBooking, "oduya_booking", give("E008")),
    f("Thursday at 3:40 PM someone rang my front office as 'Glenmore Court billing,' said the card was declined and asked to confirm the address and the code. Gil read them out. Glenmore says they never called.", ev("E008"), "oduya_pretext"),
    f("Custodia RMS keeps every collection as a volume and logs every action. Meridian's executive volume was restricted to the Records Administrator's account. I built the lock; I never saw inside.", undefined, "oduya_custodia"),
    f("EXVOL is the executive volume: the register and the scans of the forms, on its own encrypted partition. I never read it.", undefined, "oduya_exvol"),
    f("Ben exported the executive volume every Friday since January 2014 to the same encrypted drive. Ben's drive was the only external device the system ever saw.", undefined, "oduya_exports"),
    f("A digest is a fingerprint of a file: the same file always gives the same long number, and one changed comma gives a different one. Custodia used MD5, then SHA-256 from 2014.", undefined, "oduya_digests"),
    f("Pike's office terminated our contract by email on Sunday the 23rd and demanded every backup tape back. The contract gives me thirty days to return media. The November 30 tape is still in my safe.", undefined, "oduya_terminated"),
    f("I have the November 30 tape. On the 24th my backup agent reported the executive volume missing. I won't restore it for anyone until there's something to compare it against and the FBI is watching.", G.oduyaTapeWaiting, "oduya_tape"),
    f("I restored the tape with the FBI's examiner beside me. Here's the audit log for the executive volume and the alert from the 24th. Ben's export every Friday, then on the 23rd at 9:14 PM the account cpike_admin deleted the volume.", G.oduyaTapeReady, "oduya_backup", give("E040")),
    f("Conrad Pike is the name on the termination email, and a voice on the phone on the 23rd asking how many tapes I had and where.", G.pikeKnown, "oduya_pike"),
    f("I've known Ben twelve years. He was Meridian's contact on the system, then my friend. He sends a Christmas card with a bird on it.", undefined, "oduya_friend"),
    f("He asked for a quiet week and in twelve years he never asked me for anything. Then I gave the address away to the first stranger who rang. I feel responsible.", ev("E008"), "oduya_why"),
    f("Alan Corbett, Meridian's old compliance officer, would understand their records rules. He and Ben argued about retention schedules for years and liked each other the whole time.", undefined, "oduya_corbett"),
  ],
  corbett: [
    f("I'm Alan Corbett. I was Meridian's senior compliance officer until September 28, when they eliminated my position and handed me a severance agreement.", undefined, "corbett_who"),
    f("On Thursday a man who wouldn't give his name called to remind me of my confidentiality agreement. He read me the clause number.", undefined, "corbett_call"),
    f("Compliance never had access to Bay C or the EX series. Benjamin was the only one who saw both halves.", undefined, "corbett_bayc"),
    f("The EX series existed. I saw EO-01 references on transmittals and cover sheets for years. I asked once and was told it was above my pay grade. I never saw a page of it.", undefined, "corbett_ex"),
    f("Every collection has a period in the schedule. When it's up, the Records Administrator signs a disposal authorization, and only then does anything go to a shredder.", undefined, "corbett_retention"),
    f("A legal hold stops all disposal of what it covers, whatever the schedule says, until the authority that issued it releases it in writing. No officer of the company can lift it.", undefined, "corbett_hold"),
    f("Changing the retention schedule takes two signatures: the Records Administrator and counsel. Section 8.", undefined, "corbett_schedule"),
    f("The December 23 revision is signed 'for' a vacant Records Administrator, has no counsel's signature, and leaves the hold clause off. That isn't a schedule. It's a permission slip.", ev("E015"), "corbett_altered"),
    f("Benjamin was exact, kind in a dry way, and kept his own counsel. He'd have made a terrible liar.", undefined, "corbett_benjamin"),
    f("Claire Donovan was my compliance liaison and she's my friend. The most careful records analyst I ever worked with.", undefined, "corbett_claire"),
    f("I reconstructed the missing document sequence from my compliance index: which pages went out and which page behind each one never did. Here's a copy.", G.route("R09"), "corbett_sequence", give("R09")),
  ],
  chen: [
    f("Benjamin Sayer called my office on December 21 and reached a holiday voicemail. I returned the call on the 26th at 4:40 and opened a file. He retained me for a proffer.", undefined, "chen_retained"),
    f("I don't know where he went. He was careful not to tell me and I was careful not to ask.", undefined, "chen_where"),
    f("Authentication is a chain, not a signature: where the records were made, who held them, and what independent record agrees with them.", undefined, "chen_authentication"),
    f("The drive has to be sealed in front of counsel and imaged at an independent laboratory with an FBI examiner present, or the defense will say the FBI wrote it.", undefined, "chen_drive"),
    f("He wants a proffer: a written agreement about how his statements are used, before he gives his account and the archive.", undefined, "chen_proffer"),
    f("He told me there was a car outside his house at night. He thought he was in danger.", undefined, "chen_danger"),
    f("He kept a copy of records under a federal preservation demand to preserve them, and he'll deliver it to the government. I'll argue that all day.", undefined, "chen_copy"),
    f("He'll give the passphrase here, on the record, with the examiner present and me beside him. Ask him.", G.ch4, "chen_passphrase"),
    f("He said he'd read my name in a court filing in November and liked that I didn't talk to reporters.", undefined, "chen_why"),
  ],
  pike: [
    f("Conrad Pike, Pike Risk Services. Twenty years Army military police, then corporate security.", undefined, "pike_who"),
    f("I've done security consulting for Meridian since 2016: facilities, travel, access control.", undefined, "pike_meridian"),
    f("After the fire I was reviewing security at the Records Center for the company. Somebody has to look at what failed.", G.pikeFirstStory, "pike_records_center"),
    f("The December 26 disposal was a scheduled records action under counsel's instruction of the 21st. I secured the site while a licensed vendor did the work.", G.pikeAdmits, "pike_disposal"),
    f("Cards get lent. Contractors need doors.", ev("E012"), "pike_card"),
    f("I never met Benjamin Sayer. I left one message about company property he took home. That's the extent of it.", G.pikeFirstStory, "pike_sayer"),
    f("My assignment was security during the restructuring.", undefined, "pike_assignment"),
    f("I was retained on December 22 to recover company records a former employee took home, and to locate him discreetly so the company's lawyers could write to him. That's lawful.", G.pikeAssignmentTold, "pike_assignment"),
    f("I wanted him located discreetly so the company's lawyers could write to him about what he took. Nobody was going to touch him.", G.pikeAdmits, "pike_locate"),
    f("My client is the company.", undefined, "pike_client"),
    f("Counsel told me the hold had been lifted. I'm not a lawyer. I follow counsel.", G.pikeHold, "pike_hold"),
    f("Men watching his house? No idea. Arlington's full of SUVs.", G.pikeMenAsked, "pike_men"),
    f("If men I engaged went past what they were told, they exceeded instructions. That's on them.", all(G.pikeMenAsked, G.pikeExceeded), "pike_men"),
    f("The Tahoe is a company vehicle. Several people drive it. I don't log every place it parks.", ev("E021"), "pike_tahoe"),
    f("I want my lawyer.", ev("E020"), "pike_texts"),
    f("The board is planning notes. A drive and a book were company property; recovering them was the job.", ev("E022"), "pike_whiteboard"),
    f("Deleting the volume was decommissioning, per the restructuring. The company gave me the access.", ev("E040"), "pike_wipe"),
    f("We booked Patuxent and billed the company. Holiday week, after hours, rush terms.", ev("E018"), "pike_shredder"),
    f("The fire marshal will tell you what caused the fire. I'm not going to guess.", undefined, "pike_fire"),
    f("The Pittsburgh file is due diligence. A company under investigation wants to know who is investigating it.", ev("E055"), "pike_pittsburgh"),
    f("Paper in somebody else's box isn't my paper. My lawyer reads it before I say a word.", ev("E059"), "pike_note"),
    f("My client is the company. The company tells me who to report to. I'm not going to help you with names.", G.pikeChair, "pike_chair"),
    f("I don't know what my men knew about that apartment or how they knew it.", ev("E023"), "pike_glenmore"),
  ],
  holt: [
    f("Approvals came back on a form, an EX-7. You asked; it came back approved or it didn't.", G.holtNoRegister, "holt_approvals"),
    f("My lawyer has my yellow copy of the FY2018 Carroway authorization, approved A-1, January 8. I kept my authority, as anyone would.", ev("E031"), "holt_yellow", give("E046")),
    f("I never knew who signed A-1. I assumed there was money behind it older than mine.", undefined, "holt_a1"),
    f("I've said what I'm going to say about Carroway and Martin Keller. My lawyer has the transcript.", undefined, "holt_keller"),
    f("F-2 was mine. Above me there was a code, and above the code I didn't ask.", undefined, "holt_code"),
    f("My position will be communicated to the U.S. Attorney, not to a private investigator. I'm a practical man.", undefined, "holt_deal"),
    f("Dr. Lockhart is the founding donor. A gracious woman. I'm told she sent you the copy that started all this.", undefined, "holt_lockhart"),
    f("Budgets came down with the approvals. I spent what I was given and accounted for it to the code above me.", ev("E033"), "holt_budget"),
    f("Conrad Pike is S-6, security. I met him twice. He doesn't make small talk.", G.pikeKnown, "holt_pike"),
    f("Whoever leaked the invoice could reach the Records Center and wanted me gone. That's a list I was never shown the top of.", undefined, "holt_leak"),
  ],
  rourke: [
    f("Not without a proffer agreement. Ask the people who kept score.", undefined, "rourke_talk"),
    f("My lawyer will be speaking to the U.S. Attorney.", G.rourkeShown, "rourke_index"),
    f("His lawyer says he will not discuss Jonathan Ellery.", undefined, "rourke_ellery"),
    f("You're asking a man in a jumpsuit to do your filing for you. No.", undefined, "rourke_a1"),
    f("I don't discuss donors. I don't discuss anything.", undefined, "rourke_lockhart"),
  ],
  kane: [
    f("Nobody gave me orders. I ran a freight business. I had customers and contracts.", undefined, "kane_orders"),
    f("Pressure is not killing. I never told anyone to kill that man.", G.kaneShown, "kane_harbor"),
    f("Fisk did what Fisk did. I've told my lawyer and my lawyer's told everybody else.", undefined, "kane_navarro"),
    f("My arrangement with Meridian was a security services agreement. Lawyers wrote it.", undefined, "kane_meridian"),
    f("A-1? Never heard of it.", G.kaneNoForm, "kane_a1"),
    f("A-1 is a box on a form. I don't know who filled it in. I had a form that said yes.", ev("E048"), "kane_form"),
    f("We're talking to the government, not to you.", undefined, "kane_deal"),
  ],
  marchetti: [
    f("No questions about the New York charges. On Meridian's records and December 21, she'll answer what her lawyer allows.", undefined, "marchetti_terms"),
    f("Everyone who mattered knew who signed for the Chair. Nobody said it.", undefined, "marchetti_chair"),
    f("The note came by courier at 9:10 on December 21. I forwarded it to Ben at 11:40 as I was told: 'Per the Chair. Please schedule.' At 11:55 I wrote to my file that it conflicted with the hold. I did not countersign the schedule.", undefined, "marchetti_dec21"),
    f("My lawyer has the note as I received it, my forward to Ben and my note to file, with my statement. Produced voluntarily.", G.re05, "marchetti_file", give("E045")),
    f("After my arrest Dr. Lockhart's office stopped taking my calls. Then Mr. Pike took the matter over. Nobody consulted me.", undefined, "marchetti_cutoff"),
    f("Pike is S-6, security: the man you call when a problem needs two men and a car, not a brief. I never instructed him.", G.pikeKnown, "marchetti_pike"),
    f("Dr. Lockhart told me on the telephone to have Nathaniel Ogden's research dealt with, 'at any cost.' I'll say so under oath, with an agreement.", undefined, "marchetti_ogden"),
    f("I'm a defendant in New York and my lawyer is talking to the U.S. Attorney here. I'd be lying if I said I wasn't afraid of being next.", undefined, "marchetti_deal"),
    f("The hold came to me on November 26 as Meridian's outside counsel and I sent it to Ben the same day. He applied it to everything, including the EX series.", undefined, "marchetti_hold"),
    f("I'll let whatever card you have speak for itself.", undefined, "marchetti_c5"),
    f("Yes. C-5 was mine. Counsel. I drafted what I was instructed to draft.", ev("E038"), "marchetti_c5"),
    f("The structure kept the foundation, the trust and the company at arm's length on paper. I drafted what I was instructed to draft; whose instruction is for a proffer.", undefined, "marchetti_structure"),
    f("Ben was the most honest man in that building. That was always going to be a problem for someone.", undefined, "marchetti_benjamin"),
  ],
  ames: [
    f("Since Baltimore I've worked for the federal prosecutors, following the money from your cases into one set of books.", undefined, "ames_role"),
    f("The Cardinal Point Trust: on paper the trust and its companies own Meridian and Dr. Lockhart owns nothing. Article 4 lets the trust protector direct distributions, appoint the managers and direct the business, and the trustee needn't ask why.", G.ch4, "ames_trust"),
    f("Four 2018 directions of $1,100,000 each, $4,400,000 in all, match the 2018 reserved budgets of $4,400,000 to the dollar.", ev("E033"), "ames_match"),
    f("Financial control is not a crime by itself. It shows who could direct the money. Whether what was directed was criminal is what the other records are for.", undefined, "ames_control"),
    f("A trust protector is the person who set up the trust, or who speaks for the settlor, and keeps certain powers. Here they are the same person.", undefined, "ames_settlor"),
    f("I kept a copy of my payment pattern schedule from the Carroway audit. Here.", G.route("R01"), "ames_carroway", give("R01")),
    f("I traced the freight money into the finance network for the prosecutors after Baltimore. Here's BPD's schedule, with my tracing on it.", G.route("R06"), "ames_freight", give("R06")),
    f("Malcolm Pryor is Meridian's managing director. He's abroad and represented.", undefined, "ames_pryor"),
  ],
  wexler: [
    f("Nathaniel thought the trust at the bottom was hers, but the paper stopped at the trustee's door.", undefined, "wexler_nathaniel"),
    f("I have every working copy Nathaniel kept. Ask me for what you need.", undefined, "wexler_copies"),
    f("Nathaniel called Brandywine in Wilmington twice. They said the trustee acts on written direction and doesn't discuss clients.", undefined, "wexler_brandywine"),
    f("I jump when the phone rings. Detective Caruso says that's normal.", undefined, "wexler_safe"),
    f("Here is Nathaniel's comparison of the three executives who were exposed this autumn.", G.route("R16"), "wexler_comparison", give("R16")),
  ],
  caruso: [
    f("Gabriel Knox is charged with the murder of Nathaniel Ogden.", undefined, "caruso_case"),
    f("Knox says 'counsel' sent him, meaning Marchetti, to scare Ogden and take his papers, not to kill him.", undefined, "caruso_knox"),
    f("The letters from Ogden's briefcase are evidence in my case, but the DA signed off on a copy for yours. Here.", G.route("R15"), "caruso_briefcase", give("R15")),
    f("The trust protector authorization came out of Halvard's binders on the subpoena returns after Ogden died. The DA signed off on a copy for you. Here.", G.route("R13"), "wexler_trustee", give("R13")),
    f("The Class B rights agreement, from the same Halvard binders on the subpoena returns. A clean copy. Here.", G.route("R14"), "wexler_control", give("R14")),
    f("Marchetti has been on bail since Christmas Eve. The DA has her for New York and the feds want her for everything else.", undefined, "caruso_marchetti"),
    f("Vito Scarpa, the super in Long Island City, called: men and boxes went up to Meridian's old fourth floor overnight and a shredding truck is booked for Monday. We're holding the floor for the FBI.", G.re11, "caruso_storage"),
    f("The FBI has a subpoena on the foundation and I have a guest pass.", G.ch5, "caruso_foundation"),
    f("Nothing new on my side.", undefined, "caruso_again"),
  ],
  sayer: [
    f("I'll give you my sworn account, with Ms. Chen here. I kept the executive's records. I was never one of them.", undefined, "sayer_account", give("E028")),
    f("The Executive Authorization Register: number, date, matter, the code that asked, the code that approved, and the digest of the scan. Four hundred and twelve entries from 2009 to December 21.", undefined, "sayer_register"),
    f("An EX-7 is a two-part carbon form. The white original went to Bay C; the yellow copy went back to the requester as his authority, to be returned when the matter closed. Most never returned them.", undefined, "sayer_ex7"),
    f("The codes were A-1, the Chair, then F-2 finance, I-3 intelligence, L-4 logistics, C-5 counsel and S-6 security. I held no code. Each code had a card with a name and a specimen signature. File copies sent outside the executive floor show EO-01 in place of the A-1 code.", undefined, "sayer_codes"),
    f("I watched the A-1 specimen card signed twice at 1140 Fifth Avenue, on April 6, 2009 and March 8, 2016. Dr. Lockhart signed it in front of me both times. I never saw her sign a reserved matter.", G.ch4, "sayer_specimen"),
    f("The A notes were the Chair's instructions: most typed and signed 'A.' in ink, a few printed and unsigned, sealed, by courier. I logged a duplicate in EX-CORR and sent the original on.", undefined, "sayer_a_notes"),
    f("Operators knew the Chair only as the Architect. In October I began an index of every A note I logged and where each was acted on. Here.", undefined, "sayer_architect", give("E050")),
    f("Every Friday I wrote that week's digests in a bound ledger in my own hand. Compare the ledger, the drive and any backup; if they agree, the records are what they were.", undefined, "sayer_digests"),
    f("I started keeping my own copy in 2013, after logging a form for the surveillance of a congressional staffer. If they were going to be kept, someone honest had to keep them.", undefined, "sayer_exports"),
    f("On October 4 a note signed 'A.' told me to approve Claire Donovan's pulls without query. When I saw which records were leaving, I understood what was being done. I did nothing then. I am not proud of that.", undefined, "sayer_october"),
    f("On December 21 Ms. Marchetti forwarded the Chair's note at 11:40. I refused in writing at 3:30, ran the last export at 3:52, resigned at 3:55 and left with the drive and the ledger.", undefined, "sayer_dec21"),
    f("I left because I was watched: a gray car with two men from Sunday night, calls with nobody on the line. I was not taken.", undefined, "sayer_fled"),
    f("A friend booked me a flat in Silver Spring. A car sat outside, so I left by the garage ramp at half past one, took the early bus to Frederick and a cab to Fulton County, to a house I'd leased in November.", undefined, "sayer_route"),
    f("Saturday at eight I saw the truck in the lane, barricaded the back door and put the drive and the ledger in the root cellar. Someone tried the door at a quarter past nine.", undefined, "sayer_siege"),
    f("The drive stays sealed until an independent laboratory, an FBI examiner and Ms. Chen are in the room, on the record.", G.driveElsewhere, "sayer_drive"),
    f("With Ms. Chen beside me and the examiner ready, I'll give the passphrase once, for the record.", G.passphrase, "sayer_passphrase", [{ setFlag: "passphrase_given" }, { startLab: "imaging" }]),
    f("I can tell you what came through my hands. I can't tell you what anyone meant.", undefined, "sayer_limits"),
    f("Ms. Marchetti was C-5, counsel. On the 21st she forwarded the Chair's note and asked me to schedule it.", undefined, "sayer_marchetti"),
    f("Conrad Pike was S-6 from November 2016. He left a message on my machine on the 23rd about company property.", undefined, "sayer_pike"),
    f("The copy our archive held of the client register is among the printed copies in my satchel. Here.", G.route("R05"), "sayer_clients", give("R05")),
    f("Gerald Lang's restored checkout log of Claire's pulls. My approvals are on the stack register that goes with it. Here.", G.route("R07"), "sayer_checkout", give("R07")),
    f("The authorization record that points above the operators. I kept a file copy of what Claire's cover sheets showed. Here.", G.route("R12"), "sayer_upward", give("R12")),
  ],
  lockhart: [
    f("The restructuring is prudence after Ms. Marchetti's arrest. We announced it publicly.", undefined, "lockhart_restructuring"),
    f("I founded Meridian in 2007 and stepped out of every role in 2009. Malcolm Pryor runs it.", undefined, "lockhart_meridian"),
    f("My family trust is a passive investor. A trustee in Wilmington administers it. I don't run anything.", G.trustBefore, "lockhart_trust"),
    f("I'm the settlor and the trust protector. Settlors sign documents; trustees act on them. Trusts are not crimes.", ev("E043"), "lockhart_settlor"),
    f("I barely know Mr. Sayer. A records man at the company who, I'm told, took company property.", undefined, "lockhart_sayer"),
    f("Mr. Pike is the company's security consultant. I've met him.", G.pikeKnown, "lockhart_pike"),
    f("I fund Clearwater proudly. What its program did was its own work.", undefined, "lockhart_clearwater"),
    f("The envelope reached my office with no name and no letter. After I read about Mr. Keller I sent it to you.", undefined, "lockhart_envelope"),
    f("A-1? I don't know what that is.", G.beforeD16, "lockhart_a1"),
    f("Codes on a form are not a person. A card with my name typed on it is a card.", G.d16, "lockhart_identity"),
    f("The Architect sounds like something from a thriller. I can't help you.", undefined, "lockhart_architect"),
    f("A word in a company's protocol is not a person either.", G.d16, "lockhart_architect"),
    f("I read about the fire. A dreadful thing, and nobody was hurt. The insurers and the fire marshal will sort it out.", undefined, "lockhart_fire"),
    f("I met Ms. Donovan once, at a Clearwater breakfast in October. A thoughtful young woman. We spoke about record keeping for five minutes.", undefined, "lockhart_donovan"),
    f("Elena was the foundation's outside counsel for many years. I haven't spoken to her since her arrest.", undefined, "lockhart_marchetti"),
    f("Holt, Rourke and Kane are men I'm told worked for a company I left long ago. The courts will deal with them.", undefined, "lockhart_operators"),
    f("I signed directions to my trustee. That's what a trust protector does. What a company does with a distribution is the company's business.", ev("E033"), "lockhart_directions"),
    f("My office sends a great deal by courier. I don't read waybills.", ev("E042"), "lockhart_courier"),
    f("After Ms. Marchetti's arrest I asked the company's security consultant whether the company's records and property were safe.", ev("E042"), "lockhart_calls"),
    f("Your examiner says 'support,' not certainty. I've signed a great many things.", ev("E041"), "lockhart_signature"),
    f("You've built a very tidy chart. I'm not going to answer for a register I've never seen.", G.d21, "lockhart_command"),
    f("You have a theory and a thief's hard drive. I have forty years of charity and no criminal record. Charge me or let me go.", G.re12, "lockhart_confess"),
  ],
};
