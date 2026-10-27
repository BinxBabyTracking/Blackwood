import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for S01 C05, The Benefactor. Server-only. Nothing
 * here reaches the browser until the player earns it (a confirmed deduction)
 * or closes the case. Deductions follow the table in docs/S001C05-timeline.md:
 * pairs, with `requires` for the items and deductions the brief joins.
 *
 * No deduction says Dr. Lockhart ordered the murder or the earlier crimes. D18
 * is a working theory and says so. The closing says what the records show of
 * her and what they do not, and never says who "A." or the Architect is.
 */

const has = (...ids: string[]): Condition[] => ids.map((id) => ({ hasEvidence: id }));
const made = (...ids: string[]): Condition[] => ids.map((id) => ({ deduction: id }));

/** Gabriel Knox is known (contract). */
const knowsKnox: Condition = { any: [{ talkedTo: "porter" }, { talkedTo: "lane" }, { hasEvidence: "E001" }, { hasEvidence: "E021" }, { hasEvidence: "E022" }] };

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "Nathaniel Was Murdered",
    text: "Nathaniel Ogden died of one blow to the right side of the head from a heavy object with square-cut edges and a corner. No table edge matches it, it is not where a fall would strike, and nothing natural killed him. One of the suite's marble bookends is missing.",
    connections: [["E002", "E003"], ["E003", "E004"], ["E001", "E003"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "The Robbery Was Staged",
    text: "His wallet was emptied of about four hundred dollars and dropped by the door, but his gold watch was left on his wrist. His briefcase, with his papers and his phone in it, is gone. Someone came for what he carried, and made it look like a robbery.",
    connections: [["E002", "E010"], ["E001", "E010"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "Nathaniel Went to a Private Meeting",
    text: "Nathaniel went up to Conference Suite C for a meeting at 9:40, on a typed card \"with Dr. Lockhart's compliments.\" The meeting had been booked for the Library at 10:15 and was moved to the suite that evening, at 9:30, when Dr. Lockhart was due on stage.",
    connections: [["E006", "E007"], ["E006", "E008"], ["E001", "E006"]],
  },
  {
    id: "D04",
    code: "D04",
    title: "Knox Could Reach the Suite",
    text: "Credential EVT-SEC-07, issued to Knox Protective at counsel's request with mezzanine and VIP room access the hotel does not give contract security, opened Suite C at 9:31 PM and the conference corridor's staff door at 9:51 PM.",
    connections: [["E021", "E022"], ["E022", "E007"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "Knox's Account Is False",
    text: "Gabriel Knox says he was at ballroom east, stage side, from 9:15 to 10:30 and never on the mezzanine. His own sheet put him on the mezzanine from 9:00 to 10:00, the corridor camera has a man matching his credential photograph entering at 9:30, and the dock log has him going out to the vendor lot at 9:55.",
    connections: [["E023", "E008"], ["E021", "E008"], ["E009", "E021"]],
    requires: knowsKnox,
  },
  {
    id: "D06",
    code: "D06",
    title: "Knox Was Seen With the Briefcase",
    text: "At about 9:52 a server saw the security man who handed her the card come through the staff door carrying a brown leather briefcase with brass corners, like the one Nathaniel carried all evening, and take it to service elevator 3. Minutes later he went out to the vendor lot \"with garment bag and case.\"",
    connections: [["E029", "E010"], ["E009", "E010"]],
  },
  {
    id: "D07",
    code: "D07",
    title: "Knox Killed Nathaniel Ogden",
    text: "He let himself into Suite C at 9:31 with his credential, and Nathaniel came in at 9:37. Nathaniel died of a single blow from bookend 114 from the suite's credenza. At 9:51 the man with that credential left by the staff door with Nathaniel's briefcase, took it out through the dock, and drove it to his firm's storage unit in Queens, where it was found with the bookend wrapped in a hotel napkin inside it.",
    connections: [["knox", "E032"], ["E031", "E032"], ["E004", "E032"]],
    requires: { all: [...made("D01", "D04", "D05", "D06"), ...has("E032")] },
  },
  {
    id: "D08",
    code: "D08",
    title: "Marchetti Arranged the Confrontation",
    text: "Elena Marchetti hired Knox Protective for the gala and for \"confidential document-security matters\" to be directed orally. She moved Nathaniel's meeting to Suite C at 9:40, and at 6:02 PM texted Knox the room and the time, and when the card should go to him.",
    connections: [["E026", "E027"], ["E026", "E006"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "Marchetti Concealed What Happened",
    text: "When Knox called her at 9:56 PM she would not take the briefcase: \"Not here. Not to me.\" At 11:40 PM her firm sent the hotel a \"corrected\" post sheet that put him at the stage. The next morning her firm paid him $40,000 through a company her paralegal had formed eight days before.",
    connections: [["E025", "E028"], ["E028", "E030"]],
    requires: { all: has("E025", "E028", "E030") },
    effects: [{ incomingCall: "call_caruso_warrant" }, { setFlag: "marchetti_warrant" }, { message: "Det. Caruso has a warrant for Marchetti Law Group." }],
  },
  {
    id: "D10",
    code: "D10",
    title: "Nathaniel Was Investigating Hidden Control",
    text: "Preparing the investment committee's review, Nathaniel traced the foundation's largest private holding through Halvard Holdings to every vote in Meridian Advisory Group, and found a trust protector above it whom the board had never voted on. He asked Dr. Lockhart for twenty minutes at the gala.",
    connections: [["E011", "E019"], ["E019", "E012"], ["E011", "E038"]],
  },
  {
    id: "D11",
    code: "D11",
    title: "The Ownership Is Layered",
    text: "Who owns the structure and who controls it are in different places. The foundation is a limited partner; the partnership is run by a general partner owned by a trust; the partnership owns most of Halvard, a nominee holds the rest, and Halvard holds Meridian's votes and four other companies.",
    connections: [["E012", "E017"], ["E013", "E017"]],
  },
  {
    id: "D12",
    code: "D12",
    title: "Meridian Is Connected to the Structure",
    text: "Meridian's public filings name no owner. Its tax return to its Class B member names Halvard Holdings, with every vote, and Halvard's bank certification names Lockhart Endowment Partners as its 62% owner, with Elena Marchetti, who formed Meridian in 2007, as its control person.",
    connections: [["E016", "E034"], ["E013", "E034"]],
    requires: { all: has("E013", "E016", "E034") },
  },
  {
    id: "D13",
    code: "D13",
    title: "The Foundation Holds the Structure",
    text: "In 2009 the foundation's endowment partnership paid $18,000,000 for 62% of Halvard Holdings, whose only asset on closing was Meridian's Class B units. The foundation holds 96% of that partnership still, worth $66.1 million at November 30.",
    connections: [["E014", "E033"], ["E033", "E015"], ["E014", "E015"]],
  },
  {
    id: "D14",
    code: "D14",
    title: "Dr. Lockhart Directs the Structure",
    text: "As protector of Cardinal Point Trust, Dr. Lockhart may direct every vote held through the trust, the general partner and Halvard, down to Meridian, and the board is not to be told. She used that power in March 2014, for the amendment that lets Halvard cut off any division, and on September 17, 2018, after the risk review.",
    connections: [["E035", "E040"], ["E039", "E040"]],
    requires: { all: has("E035", "E039", "E040") },
  },
  {
    id: "D15",
    code: "D15",
    title: "Nathaniel Was Targeted for His Research",
    text: "The meeting was arranged to take Nathaniel's findings from him. He had asked for a private word about Halvard and Cardinal Point; the room was moved, the man sent to meet him was hired for document security, and the only things taken were the briefcase and the papers in it.",
    connections: [["E031", "E011"], ["E027", "E019"], ["E010", "E019"]],
    requires: { all: made("D02", "D08", "D10") },
  },
  {
    id: "D16",
    code: "D16",
    title: "The Foundation and Meridian Share a Hidden Relationship",
    text: "The foundation's endowment, through a partnership and a holding company, owns most of the company that holds every vote in Meridian Advisory Group. The foundation's statements describe it in one sentence that names neither.",
    connections: [["E041", "E033"], ["E041", "E034"]],
    requires: { all: [...made("D12", "D13"), ...has("E041")] },
  },
  {
    id: "D17",
    code: "D17",
    title: "The Relationship Predates the Crimes",
    text: "Dr. Lockhart organized Meridian in 2007, and the structure above it has existed since June 2009. Every arrest in the Meridian cases came nine years after it was built.",
    connections: [["E042", "E043"], ["E042", "E048"]],
  },
  {
    id: "D18",
    code: "D18",
    title: "Dr. Lockhart Is a Credible Candidate for the Architect",
    text: "A working theory. Marchetti's restricted index records the structure's instructions as taken from \"the Architect,\" and the structure is the one Dr. Lockhart directs as protector. That makes her a credible candidate. The records do not establish who the Architect is, or that Dr. Lockhart ordered anything.",
    connections: [["E046", "E035"], ["E045", "E046"], ["lockhart", "E046"]],
    requires: { all: [...made("D14", "D16"), ...has("E045", "E046", "E047")] },
  },
  {
    id: "D19",
    code: "D19",
    title: "The Murder Was Part of a Concealment Effort",
    text: "Nathaniel was killed in an operation meant to keep the ownership from being disclosed: a meeting arranged to take his papers, a contractor sent to take them, and a cover-up the same night and the next morning.",
    connections: [["knox", "marchetti"], ["marchetti", "E031"]],
    requires: { all: made("D07", "D08", "D09", "D15") },
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "The Killer",
    question: "Who killed Nathaniel Ogden?",
    options: [
      { id: "knox", label: "Gabriel Knox", requires: knowsKnox },
      { id: "marchetti", label: "Elena Marchetti" },
      { id: "lockhart", label: "Dr. Evelyn Lockhart" },
      { id: "bellamy", label: "Lionel Bellamy" },
      { id: "thief", label: "A thief who followed him upstairs" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "B",
    title: "The Weapon",
    question: "What was the weapon?",
    options: [
      { id: "bookend", label: "A marble bookend from the suite" },
      { id: "poison", label: "Poison in the whiskey" },
      { id: "fall", label: "A fall against the conference table" },
      { id: "baton", label: "A security officer's baton" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "taken",
    section: "C",
    title: "What Was Taken",
    question: "What was taken?",
    options: [
      { id: "briefcase", label: "His briefcase, with his research" },
      { id: "wallet", label: "His wallet and phone" },
      { id: "nothing", label: "Nothing" },
      { id: "donors", label: "The foundation's donor list" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why",
    section: "D",
    title: "The Motive",
    question: "Why was he targeted?",
    options: [
      { id: "ownership", label: "He was investigating hidden ownership linking the foundation's structure to Meridian" },
      { id: "robbery", label: "Robbery" },
      { id: "fees", label: "A personal dispute over his fees" },
      { id: "not_targeted", label: "He was not targeted" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "arranged",
    section: "E",
    title: "The Arrangement",
    question: "Who arranged the confrontation?",
    options: [
      { id: "marchetti", label: "Elena Marchetti" },
      { id: "lockhart", label: "Dr. Evelyn Lockhart" },
      { id: "bellamy", label: "Lionel Bellamy" },
      { id: "nobody", label: "Nobody: Knox acted alone" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "ordered",
    section: "F",
    title: "The Order",
    question: "Did the person who arranged it order a killing?",
    options: [
      { id: "no", label: "No: she arranged intimidation and the taking of his papers, then concealed the killing" },
      { id: "yes", label: "Yes: she ordered it" },
      { id: "nobody_arranged", label: "Nobody arranged anything" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "found",
    section: "G",
    title: "Nathaniel's Findings",
    question: "What had Nathaniel found?",
    options: [
      { id: "control", label: "Hidden ownership and control linking foundation-associated entities to Meridian" },
      { id: "embezzlement", label: "Embezzlement by the CFO" },
      { id: "tax_error", label: "A tax filing error" },
      { id: "laundering", label: "Donations being laundered" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "lockhart",
    section: "H",
    title: "Dr. Lockhart",
    question: "What do the records establish about Dr. Lockhart?",
    options: [
      { id: "control_not_murder", label: "She holds concealed control of the structure; they do not show she ordered the murder" },
      { id: "ordered_murder", label: "She ordered the murder" },
      { id: "no_connection", label: "She has no connection to the structure" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "architect",
    section: "I",
    title: "The Architect",
    question: "Is it established who the Architect is?",
    options: [
      { id: "not_established", label: "No: Dr. Lockhart is a credible candidate, but her command is not proven" },
      { id: "lockhart_proven", label: "Yes, Dr. Lockhart is proven to be the Architect" },
      { id: "marchetti", label: "Yes, Elena Marchetti" },
      { id: "not_candidate", label: "Dr. Lockhart is not a candidate" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Gabriel Knox killed Nathaniel Ogden in Conference Suite
 * C with a marble bookend from the suite, and took his briefcase of research.
 * Elena Marchetti arranged the confrontation to take his papers by
 * intimidation, did not order the killing, and concealed Knox's part. Nathaniel
 * had found hidden ownership and control linking the foundation's structure to
 * Meridian. Dr. Lockhart holds concealed control of that structure; that does
 * not show she ordered the murder, and her command is not established.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    culprit: "knox",
    weapon: "bookend",
    taken: "briefcase",
    why: "ownership",
    arranged: "marchetti",
    ordered: "no",
    found: "control",
    lockhart: "control_not_murder",
    architect: "not_established",
  },
  standard: {
    // 48 items: at least 8 key, at most 12 attached (Final Report Standard).
    minItems: 8,
    maxItems: 12,
    minKey: 8,
    claims: [
      {
        id: "scene",
        label: "Places the person you name at the scene, or ties them to that night",
        anyOf: ["E007", "E008", "E009", "E022", "E024", "E029", "E031"],
        hint: "The hotel keeps a record of every door, camera and dock on that floor. So does its staff.",
      },
      {
        id: "how",
        label: "Shows how it was done or how it was covered up",
        anyOf: ["E002", "E003", "E004", "E010", "E030", "E032"],
        hint: "Go back to the suite, the medical examiner and what the police found later.",
      },
      {
        id: "story",
        label: "Tests the story they told: an alibi, a timeline or a statement",
        anyOf: ["E021", "E023", "E024", "E029"],
        hint: "Compare where the security lead was supposed to be with where his own paperwork put him.",
      },
      {
        id: "why",
        label: "Shows why the victim was targeted",
        anyOf: ["E011", "E012", "E019", "E038", "E048"],
        hint: "Look at what Nathaniel was working on, at his office and at home.",
      },
      {
        id: "arranged",
        label: "Shows who arranged the meeting, and what was done after",
        anyOf: ["E006", "E025", "E026", "E027", "E028"],
        hint: "Follow who booked the room, who hired the security, and who paid whom the next morning.",
      },
      {
        id: "found",
        label: "Shows what the victim had found, in the records themselves",
        anyOf: ["E013", "E014", "E016", "E017", "E033", "E034", "E035", "E039", "E040", "E041", "E047"],
        hint: "The foundation's own archive and the holding company's files hold the ownership.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical and forensic", anyOf: ["E001", "E002", "E003", "E004", "E005", "E010", "E031", "E032"] },
      { id: "movement", label: "Access, witnesses and movements", anyOf: ["E006", "E007", "E008", "E009", "E021", "E022", "E023", "E024", "E029"] },
      { id: "arrangement", label: "The arrangement and the cover-up", anyOf: ["E025", "E026", "E027", "E028", "E030"] },
      {
        id: "records",
        label: "Records and ownership",
        anyOf: ["E011", "E012", "E013", "E014", "E016", "E017", "E019", "E033", "E034", "E035", "E038", "E039", "E040", "E041", "E047", "E048"],
      },
    ],
    minLines: 3,
    linkToSuspect: ["E007", "E008", "E009", "E022", "E023", "E024", "E029", "E031"],
    linkNote: "Nothing attached ties the person you name to the mezzanine of the Belgrave Grand on the night of December 20.",
    supporting: ["E015", "E018", "E020", "E036", "E037", "E042", "E043", "E044", "E045", "E046"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Anthony Caruso, NYPD Manhattan South Homicide, and through him to the Manhattan District Attorney.",
    reconstruction: [
      {
        heading: "The structure",
        body: "In 2007 Evelyn Lockhart organized Meridian Advisory Group, with Elena Marchetti as the lawyer who formed it. In June 2009 the foundation's endowment partnership paid $18,000,000 for 62% of a new holding company, Halvard, while Dr. Lockhart contributed her Meridian founder interests for the rest. She disclosed that to the investment committee and left the room for the vote. What the committee was not shown was the trust above the partnership's general partner, Cardinal Point Trust, and the instrument that made her its protector for life, able to direct every vote down to Meridian's, and kept from the board. Nothing in the structure was unlawful in itself. Who controlled it was concealed.",
      },
      {
        heading: "What Nathaniel found",
        body: "On October 15 Nathaniel Ogden began the committee's January review of the foundation's alternative investments. By November 7 he had the 62% and a nominee holding the rest; by November 14, Halvard's hold on every vote in Meridian. On November 28 he read the general partner's governance binder at its administrator and copied two protector letters. On December 10 he saw that Halvard's September risk note had named Pittsburgh, Washington and Baltimore, and that Halvard had cut each one loose in the weeks before its leader was arrested. He did not think he had proven a crime. He thought he had found control nobody had disclosed, and he wanted an independent review.",
      },
      {
        heading: "\"Elena will find us a room\"",
        body: "At 6:40 PM on Monday, December 17, he wrote to Dr. Lockhart asking for twenty minutes alone at the gala, about Halvard and Cardinal Point. At 8:12 the next morning she replied: \"Of course, Nathaniel. Elena will find us a room. E.\" At 11:02 that night someone Marchetti recorded only as \"A.\" telephoned her: he would bring his papers to the gala, and they were not to leave the hotel with him. At 11:31 she called Gabriel Knox, whom she had engaged on December 12 for the gala and for document-security matters to be directed by telephone only.",
      },
      {
        heading: "The room that moved",
        body: "On Wednesday Marchetti had the Library booked for Dr. Lockhart and Mr. Ogden at 10:15 PM, after the remarks, and got Knox's firm a credential with mezzanine access the hotel does not give contract security. At 6:02 PM on the night she texted Knox: \"Room changed. C, mezz. 9:40. Card to him about 9:20.\" Three minutes later she had Victoria Lane move the meeting to Suite C at 9:30, with no staff after setup, \"at Dr. Lockhart's request,\" and took five blank note cards. At 6:10 Knox had camera M-2 turned to face the window bay. Marchetti meant him to frighten Nathaniel into giving up his papers. She did not tell him to kill anyone.",
      },
      {
        heading: "9:24 to 9:51 PM",
        body: "At 9:24 Knox handed a server a card for table four, \"from Dr. Lockhart.\" Nathaniel read it, said \"She'll see me now,\" and left at 9:33 with his briefcase. At 9:30, as Dr. Lockhart began her remarks to four hundred people, Knox walked into the conference corridor, and at 9:31 his credential opened Suite C. Nathaniel came in at 9:37. Knox demanded the papers. Nathaniel refused and made for the door. Knox picked up one of the green marble bookends from the credenza, number 114, and struck him once. Then he wiped the bookend, wrapped it in a bar napkin and put it in the briefcase, emptied the wallet of its cash and dropped it by the door, overturned a chair and pulled open the side table drawer. At 9:51 he left by the staff door, past a server who knew his face.",
      },
      {
        heading: "The staff door, the dock and the storage unit",
        body: "Service elevator 3 took him to the dock. At 9:55 he went out to the vendor lot \"with garment bag and case,\" and told the officer on the desk he needed radio batteries. At 9:56 he called Marchetti. At 10:01 she texted: \"Not here. Not to me. Somewhere safe. Say nothing.\" He drove through the Queens-Midtown Tunnel to his firm's storage unit in Long Island City, left the briefcase there, and was back in the hotel at 10:52. At 11:30 he told the police he had been at the stage all night.",
      },
      {
        heading: "11:40 PM and 9:11 AM",
        body: "At 11:40 PM Marchetti's firm emailed the hotel a \"corrected\" post sheet that put Knox at ballroom east, stage side, from 9:15 to 10:30, and the hotel's system replaced the true one. At 7:02 the next morning she called him. At 9:04 her firm wired $40,000 to Stratford Risk Consulting, a company her paralegal had formed eight days before; at 9:11 Stratford wired the same $40,000 to Knox Protective, \"Incident response 12/20.\" At 9:15 she texted him: \"Taken care of.\" That morning she told the foundation's staff to cooperate visibly and release nothing about Halvard.",
      },
      {
        heading: "The briefcase and the bookend",
        body: "On Friday evening Knox booked a one-way flight to Panama City. On Saturday morning Port Authority police held him at the gate. That afternoon, under a warrant, Det. Caruso opened unit 3C-27 and found the briefcase with brass corners, and inside it the bookend in a Belgrave Grand napkin, Nathaniel's phone and his blue folder. The bookend carried Nathaniel's blood in the seam of its felt and the shape of the wound on its face. Knox and Marchetti were arrested that evening.",
      },
      {
        heading: "What the records say about Dr. Lockhart",
        body: "The records show Dr. Lockhart as protector of Cardinal Point Trust, with power to direct every vote in the structure and a duty on the trustees to keep that from the foundation's board. They show her directions of March 2014 and September 17, 2018. They show that Nathaniel wrote to her, that she told him Elena would find them a room, and that at 9:40 she was on stage. They do not show that she ordered anything criminal, or that she knew anyone would be hurt. Who \"A.\" is, and who the Architect is, the records seized this week do not say.",
      },
    ],
    bennett: [
      "Caruso. Your report's on my desk and the DA's, and it holds.",
      "Gabriel Knox is charged with murder in the second degree and tampering with physical evidence. Elena Marchetti is charged with conspiracy, coercion, hindering prosecution and tampering with physical evidence. She was arraigned this morning and released on bail with conditions: passport surrendered, electronic monitoring.",
      "Dr. Lockhart sent the squad a note thanking us. She isn't charged with anything, and on what we have she can't be. I don't like it any more than you do.",
      "Merry Christmas. Go home for a day.",
    ],
    caller: { characterId: "caruso", name: "Det. Anthony Caruso", tag: "NYPD Manhattan South Homicide" },
    series: {
      seriesId: "S001",
      title: "The Judas Principle",
      text: [
        "We followed the money. We found the people collecting secrets. We found the people willing to kill to protect the operation. Then we found out that someone had been feeding us the evidence.",
        "Now we know who stood to benefit. Dr. Evelyn Lockhart. The woman who sent us our first lead. The woman who stood beside us while we exposed everyone around her.",
        "We can see the structure. We can see her hand on it. But influence isn't proof of murder, and a name in a lawyer's index isn't an order.",
        "If we're going to bring her down, we need more than a theory.",
      ].join("\n\n"),
    },
  },
};
