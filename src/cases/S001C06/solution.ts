import "server-only";
import type { CaseDefinition, ClaimDef, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for S01 C06, The Architect. Server-only. Nothing here
 * reaches the browser until the player earns it (a confirmed deduction) or
 * closes the case. Deductions follow the table in docs/S001C06-timeline.md.
 *
 * A pair "with" a third item in hand (the C003 and C004 way) is written as the
 * pairs plus every item of the brief's requirement in hand, so either order of
 * discovery works. The case is solved on this board alone: the series
 * deductions S001-D011 to S001-D016 live on the rolling board.
 *
 * The closing follows the design's limits: the evidence shows command,
 * selective disclosure and concealment, never an order to kill. The fire is
 * described only by the fire marshal's conclusion.
 */

const held = (...ids: string[]): Condition => ({ all: ids.map((id) => ({ hasEvidence: id })) });
const made = (...ids: string[]): Condition => ({ all: ids.map((id) => ({ deduction: id })) });

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "Benjamin Left Voluntarily",
    text: "No forced entry and no struggle. Clothes, a suitcase and his glasses case gone, the cat's feeder set for a week, a note on the refrigerator, and a plan written out the night before: a booked apartment, a new phone, cash. He was seen walking out the back with his bags. He left on his own.",
    connections: [["E003", "E004"], ["E004", "E005"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "Benjamin Was Being Watched",
    text: "A dark gray SUV with two men in it sat outside his house three nights running, engine on, from the night after a message about \"items you took home.\" Silent hang-ups followed on the nights the car was there. Someone was watching the house and the man in it.",
    connections: [["E005", "E006"], ["E005", "E021"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "Benjamin Preserved the Executive Records",
    text: "The former Records Administrator kept a copy of the restricted executive series: the register, the notes, the budgets, the specimen cards and a handwritten custody ledger, on one encrypted drive, because the originals were under a legal hold he did not believe they would survive.",
    connections: [["E002", "E007"], ["E007", "E028"]],
  },
  {
    id: "D04",
    code: "D04",
    title: "The Records Were Being Destroyed Outside Procedure",
    text: "Three collections were shredded and the caged executive series burned while a federal legal hold covered all of them. The disposal order claimed the hold was \"lifted per Counsel,\" the schedule was rewritten without counsel's signature and without the hold clause, and the fire marshal found the fire deliberately set.",
    connections: [["E011", "E013"], ["E013", "E015"]],
    requires: held("E011", "E013", "E015"),
  },
  {
    id: "D05",
    code: "D05",
    title: "The Destruction Was Coordinated",
    text: "The shredding crew was told not to enter Bay C and was off the premises by 10:05 PM. Thirty-three minutes later the same security card opened the dock again, then the Bay C cage, the only card that did. The camera on the cage went dark; the alarm came after the two men left. The purge and the fire were one operation.",
    connections: [["E012", "E016"], ["E016", "E018"]],
    requires: held("E012", "E016", "E018"),
  },
  {
    id: "D06",
    code: "D06",
    title: "Pike Was Assigned to Recover the Archive",
    text: "On December 22 Conrad Pike's firm was engaged \"at the request of the Office of the Chair\" to recover the former administrator's media, locate him and report to the Chair alone. His own board names the package: the drive and the ledger.",
    connections: [["E017", "E022"], ["E013", "E017"]],
  },
  {
    id: "D07",
    code: "D07",
    title: "Benjamin's Hiding Route",
    text: "Silver Spring, in an apartment a friend booked; the early bus to Frederick; a cab paid in cash to Juniper Gap Road in Fulton County, where he had leased a tenant house in November. A route chosen long before he needed it.",
    connections: [["E008", "E009"], ["E009", "E025"]],
    requires: held("E008", "E009", "E025"),
  },
  {
    id: "D08",
    code: "D08",
    title: "Pike's Men Tracked Benjamin",
    text: "The same two men followed him at every step: into the apartment on his guest code an hour after he left, to the transit center with his photograph, and up the lane in Pike's Tahoe at dawn. They were never more than a few hours behind.",
    connections: [["E021", "E023"], ["E023", "E026"], ["E024", "E026"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "Benjamin Was in Danger",
    text: "Two men in Pike's vehicle had the tenant house penned in, a pry bar at the back door, under an order to recover the drive \"whatever it takes.\" The man inside had no phone and no way out.",
    connections: [["E020", "E026"], ["E026", "E027"]],
    requires: made("D02", "D06", "D08"),
  },
  {
    id: "D10",
    code: "D10",
    title: "The Archive Has Verifiable Provenance",
    text: "The drive's contents match Benjamin's handwritten custody ledger, Meridian's own last offsite backup and the paper fragments recovered from Bay C. The executive volume was wiped on the live system on December 23; his copy is the one that survived, and it can be believed.",
    connections: [["E029", "E030"], ["E030", "E040"]],
    requires: held("E029", "E030", "E040"),
  },
  {
    id: "D11",
    code: "D11",
    title: "The Authorization System Was Structured",
    text: "Every reserved matter was requested by an operating code and approved in ink by the code above it, logged and filed. The codes F-2, I-3, L-4, C-5 and S-6 had names. At the top sat a single code, A-1, the Chair, with authority that could not be delegated.",
    connections: [["E031", "E038"], ["E031", "E039"]],
    requires: held("E031", "E038", "E039"),
  },
  {
    id: "D12",
    code: "D12",
    title: "Evelyn Controlled the Operational Funding",
    text: "The 2018 reserved budgets, $4,400,000, were paid for by four directions to the Cardinal Point Trust, each releasing $1,100,000 and each signed by Evelyn Lockhart as the trust's Trust Protector. On paper she owns nothing. In fact she paid for every reserved program.",
    connections: [["E033", "E043"], ["E033", "E041"]],
    requires: held("E033", "E041", "E043"),
  },
  {
    id: "D13",
    code: "D13",
    title: "Evelyn Authorized Coercive Intelligence",
    text: "The index of compromising information and the leverage program against Jonathan Ellery were approved by A-1, and the operator kept his own copy of that approval. The authorization covers surveillance and coercion; it does not cover his abduction.",
    connections: [["E034", "E042"], ["E034", "E047"]],
    requires: held("E034", "E042", "E047"),
  },
  {
    id: "D14",
    code: "D14",
    title: "Evelyn Authorized Criminal Enforcement",
    text: "The Harbor program, the pressure on terminal staff and the effort to silence Nathaniel Ogden were approved by A-1, each with its own limit: \"pressure only,\" \"no physical harm.\" This is intimidation and concealment authorized from the top. It is not an order to kill, and no record makes it one.",
    connections: [["E035", "E042"], ["E035", "E048"]],
    requires: held("E035", "E042", "E048"),
  },
  {
    id: "D15",
    code: "D15",
    title: "Evelyn Directed Legal Concealment",
    text: "In 2014 the Chair told counsel to keep the foundation, the trust and the company apart on paper and to show the trustee, never the settlor. The trust file shows exactly that structure, and her own counsel's file shows the Chair's instructions reaching her.",
    connections: [["E036", "E045"], ["E036", "E043"]],
  },
  {
    id: "D16",
    code: "D16",
    title: "Evelyn Was the Architect",
    text: "Operating Protocol No. 1 makes the Chair, code A-1, \"the Architect,\" who writes notes signed \"A.\" The specimen card for A-1 bears Evelyn R. Lockhart's name, signed in front of the administrator in 2009 and 2016; her undisputed signatures match the approvals, and the notes signed \"A.\" were acted on wherever they went.",
    connections: [["E049", "E050"], ["E038", "E041"]],
    requires: held("E038", "E041", "E049", "E050"),
  },
  {
    id: "D17",
    code: "D17",
    title: "The Earlier Disclosures Were Deliberate",
    text: "The three records that reached Blackwood this autumn were released under a program the Chair approved for herself: genuine records against finance, then intelligence, then logistics, copied under a standing approval nobody questioned. Pages that pointed above the operators were offered once and refused.",
    connections: [["E037", "E051"], ["E037", "E056"]],
    requires: held("E037", "E051", "E056"),
  },
  {
    id: "D18",
    code: "D18",
    title: "Evelyn Selected the Targets",
    text: "In August she judged that three of her own operators now cost more than they protected. In September she wrote the order in which they would be exposed, through outside investigators following genuine records, with nothing above the operators. Then she sent the first record to herself, so she could pass it on.",
    connections: [["E052", "E053"], ["E053", "E054"]],
    requires: held("E052", "E053", "E054"),
  },
  {
    id: "D19",
    code: "D19",
    title: "Blackwood Was Monitored",
    text: "While the records were being fed to the agency, the agency was being watched and reported on, case by case, to one reader: the Chair. The feeding and the watching ran side by side.",
    connections: [["E055", "E056"], ["E055", "E052"]],
  },
  {
    id: "D20",
    code: "D20",
    title: "Evelyn Directed the Destruction of Evidence",
    text: "The day she learned of the weekly copies, the Chair ordered the Records Center cleared under a legal hold and the copy recovered, \"not to bargain with it,\" and then telephoned the man doing it through the pursuit. The destruction and the hunt for the keeper were done on her authority.",
    connections: [["E020", "E059"], ["E042", "E059"]],
  },
  {
    id: "D21",
    code: "D21",
    title: "Evelyn Exercised Criminal Command",
    text: "Authenticated records, a named code and a matching hand: she approved and paid for specific unlawful programs of intelligence, pressure and concealment, and her operators carried them out on her authority. The command is proved. The killings are not part of it; no record authorizes any of them.",
    connections: [["E057", "lockhart"], ["E057", "E031"]],
    requires: made("D10", "D11", "D12", "D13", "D14", "D16"),
  },
  {
    id: "D22",
    code: "D22",
    title: "The Judas Principle",
    text: "She built the network, ran it from a paper system only she could sign, gave up three of her own people with true evidence in the order that suited her, watched the investigators carry it, and then tried to burn the one record that pointed up and to take back the man who kept a copy.",
    connections: [["E052", "E057"], ["E057", "E060"]],
    requires: made("D17", "D18", "D19", "D20", "D21"),
  },
];

const knowsPike: Condition = { any: [{ hasEvidence: "E006" }, { hasEvidence: "E012" }, { hasEvidence: "E013" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "architect",
    section: "A",
    title: "The Architect",
    question: "Who is the Architect?",
    options: [
      { id: "lockhart", label: "Dr. Evelyn Lockhart" },
      { id: "pike", label: "Conrad Pike", requires: knowsPike },
      { id: "sayer", label: "Benjamin Sayer" },
      { id: "pryor", label: "Malcolm Pryor" },
      { id: "superior", label: "An unknown superior" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "network",
    section: "B",
    title: "What She Controlled",
    question: "What did she control?",
    options: [
      { id: "meridian", label: "The criminal network operating through Meridian Advisory Group and related entities" },
      { id: "charity", label: "Only the Lockhart Foundation's charity" },
      { id: "passive", label: "Nothing: she was a passive investor" },
      { id: "lawful", label: "Meridian's lawful consulting only" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "control",
    section: "C",
    title: "How She Kept Control",
    question: "How did she keep control?",
    options: [
      { id: "register", label: "Compartmentalized executive authority recorded in a sealed register, funded through her family trust" },
      { id: "daily", label: "By managing Meridian day to day" },
      { id: "personally", label: "By taking part in each crime herself" },
      { id: "bribes", label: "By paying bribes" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "operators",
    multi: true,
    section: "D",
    title: "Her Operators",
    question: "Which of her operators had Blackwood's cases brought down before this one?",
    options: [
      { id: "holt", label: "Adrian Holt (finance)" },
      { id: "rourke", label: "Julian Rourke (intelligence)" },
      { id: "kane", label: "Gideon Kane (logistics)" },
      { id: "marchetti", label: "Elena Marchetti (legal concealment)" },
      { id: "pike", label: "Conrad Pike (security)", requires: knowsPike },
      { id: "sayer", label: "Benjamin Sayer" },
      { id: "donovan", label: "Claire Donovan" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why",
    section: "E",
    title: "Why She Exposed Them",
    question: "Why did she expose her own associates?",
    options: [
      { id: "liabilities", label: "They had become liabilities to her control and the organization's survival" },
      { id: "police", label: "To help the police" },
      { id: "betrayed", label: "They had betrayed her" },
      { id: "debt", label: "To cover a debt" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "manip",
    section: "F",
    title: "The Investigations",
    question: "How did she manipulate Blackwood?",
    options: [
      { id: "selective", label: "She directed the release of genuine, selected records that implicated the targets while concealing her role" },
      { id: "fabricated", label: "She fabricated evidence against them" },
      { id: "bribed", label: "She bribed the agency" },
      { id: "none", label: "She did not: Blackwood acted alone" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "genuine",
    section: "G",
    title: "The Earlier Findings",
    question: "Were the earlier crimes fabricated, and do the earlier findings stand?",
    options: [
      { id: "stand", label: "The evidence was genuine and every earlier finding stands" },
      { id: "invented", label: "The crimes were invented" },
      { id: "wrong", label: "The earlier findings were wrong" },
      { id: "cannot", label: "It cannot be said" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "murders",
    section: "H",
    title: "The Murders",
    question: "Does the evidence prove she ordered the murders?",
    options: [
      { id: "no", label: "No: it establishes command over specified criminal operations, not the killings" },
      { id: "all", label: "Yes, she ordered all of them" },
      { id: "some", label: "Yes, she ordered some" },
      { id: "never", label: "The murders never happened" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "conceal",
    section: "I",
    title: "Once Exposed",
    question: "What did she do once the network was exposed?",
    options: [
      { id: "destroy", label: "She directed the destruction of records and the pursuit of the witness" },
      { id: "cooperated", label: "She cooperated fully" },
      { id: "nothing", label: "She did nothing" },
      { id: "fled", label: "She fled the country" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "fate",
    section: "J",
    title: "What the Evidence Supports",
    question: "What does the evidence support?",
    options: [
      { id: "arrest", label: "Her arrest on evidence of criminal command, selective disclosure and concealment" },
      { id: "murder", label: "Her conviction for murder" },
      { id: "sentence", label: "A guaranteed sentence" },
      { id: "nothing", label: "Nothing chargeable" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/** The points the report must show. Story uses these to know when the report could be made (RE12). */
export const CLAIMS: ClaimDef[] = [
  {
    id: "identity",
    label: "Names the person behind the authority",
    anyOf: ["E038", "E041", "E049", "E050", "E031"],
    hint: "The signature on the forms and the card the administrator signed in 2009 should point to one person.",
  },
  {
    id: "command",
    label: "Shows that authority over specific criminal operations",
    anyOf: ["E031", "E033", "E034", "E035", "E036", "E057", "E046", "E047", "E048"],
    hint: "Set the register and the operators' own copies of their authorizations side by side.",
  },
  {
    id: "steering",
    label: "Shows how the investigations were steered",
    anyOf: ["E037", "E052", "E053", "E054", "E055", "E056"],
    hint: "Look at who chose which records Blackwood received, and who was watching what you did with them.",
  },
  {
    id: "burial",
    label: "Shows the attempt to bury the evidence",
    anyOf: ["E011", "E012", "E013", "E015", "E017", "E018", "E020", "E059"],
    hint: "Go back over the fire, the disposal order and what the contractors were told.",
  },
  {
    id: "authenticity",
    label: "Shows the records can be believed",
    anyOf: ["E028", "E030", "E040", "E058", "E019"],
    hint: "The drive is only as good as what proves it genuine; the backup and the custody book matter.",
  },
];

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `E${String(from + i).padStart(3, "0")}`);

/*
 * Canonical solution: Dr. Evelyn Lockhart is the Architect. She controlled the
 * criminal network operating through Meridian Advisory Group by compartmentalized
 * executive authority recorded in a sealed register and funded through her
 * family trust; Holt, Rourke, Kane and Marchetti were her operators. She exposed
 * three of them as liabilities by directing the release of genuine, selected
 * records. The earlier findings stand; the evidence does not show she ordered the
 * murders. She directed the destruction of records and the pursuit of the witness.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    architect: "lockhart",
    network: "meridian",
    control: "register",
    operators: ["holt", "rourke", "kane", "marchetti"],
    why: "liabilities",
    manip: "selective",
    genuine: "stand",
    murders: "no",
    conceal: "destroy",
    fate: "arrest",
  },
  standard: {
    // Long form (Final Report Standard): 10 to 14 attached, at least 10 key.
    minItems: 10,
    maxItems: 14,
    minKey: 10,
    claims: CLAIMS,
    lines: [
      { id: "pursuit", label: "Disappearance and pursuit", anyOf: [...range(3, 10), ...range(20, 27)] },
      { id: "destruction", label: "Destruction", anyOf: [...range(11, 20), "E059"] },
      { id: "command", label: "Command and identity", anyOf: [...range(31, 50), "E057"] },
      { id: "betrayal", label: "Betrayal", anyOf: ["E037", "E044", ...range(51, 56)] },
      { id: "authenticity", label: "Authenticity", anyOf: ["E028", "E030", "E040", "E058"] },
    ],
    minLines: 4,
    linkToSuspect: ["E038", "E041", "E049", "E057", "E059", "E052"],
    linkNote: "Nothing attached connects Dr. Lockhart to the authority behind these operations.",
    supporting: ["E001", "E002", "E004", "E005", "E006", "E008", "E009", "E010", "E021", "E022", "E023", "E024", "E025", "E026", "E028", "E029", "E039", "E042", "E043", "E045", "E046", "E047", "E048", "E060"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report, with the final evidentiary reconstruction, to SA Teresa Quinlan, FBI Washington Field Office, and through her to the United States Attorney.",
    reconstruction: [
      {
        heading: "The register",
        body: "In 2009 Evelyn Lockhart stepped out of every public role at the company she had founded and put it under a Delaware trust of which she alone held the reserved powers. From then on every reserved matter at Meridian, every payment through intermediaries, every program of coercion, every structure meant to hide who owned what, was requested on a numbered form and approved in ink by the code with authority over it. The highest code, A-1, was hers. Operators knew her only as the Architect. Benjamin Sayer, the Records Administrator, logged every form and every note signed \"A.\", wrote their digests in a book in his own hand, and filed the originals in a locked cage in Chantilly. The system made every operator's crimes a matter of record. That was how she controlled them.",
      },
      {
        heading: "The sacrifice",
        body: "On August 20, 2018 she reviewed her operators and concluded that Adrian Holt, Julian Rourke and Gideon Kane now cost more than they protected. On September 7 she wrote the order in which they would be exposed: finance, then intelligence, then logistics, each reached by outside investigators following genuine records, with nothing above the operators. Counsel and security were to be kept. The object, in her own words, was a cleaner organization, not a confession.",
      },
      {
        heading: "The leaks, steered",
        body: "On September 10 she approved the release program for herself, and the same day her foundation gave Clearwater $250,000. Through Miriam Castell she had Claire Donovan copy three genuine records, and she ordered Benjamin in writing to approve the pulls without question. On October 11 an unsigned note of hers told Castell to send the first item to the Lockhart Foundation, so that she could appear to have received it. The next two went straight to Blackwood. When Claire offered three pages that pointed upward, the answer was \"not now, not ever.\" Conrad Pike reported Blackwood's progress to her, case by case.",
      },
      {
        heading: "Why the earlier findings stand",
        body: "Nothing was fabricated. The invoice, the index and the freight records were real, and so were the crimes they exposed. Paul Reddick killed Martin Keller. Dwayne Fisk killed Hector Navarro. Gabriel Knox killed Nathaniel Ogden. No entry in the register authorizes any of those acts, or the taking of Jonathan Ellery, or Claire Donovan's detention. She chose which true things Blackwood would learn, and when. She did not invent them.",
      },
      {
        heading: "The fire and the hunt",
        body: "On December 21 the Chair's note to counsel told her to clear the Records Center and end the executive series, though a federal legal hold covered every record in it. Benjamin refused in writing, resigned, and went home with his copy. On December 22 she learned that he had been exporting the executive volume every Friday for five years, and gave the whole job to Pike in a signed note: clear the Center, recover the copy, he is not to bargain with it. Pike wiped the volume on the 23rd, had three collections shredded on the night of the 26th, and went into Bay C with Kurt Sobczak. The fire marshal found the fire deliberately set, with the one sprinkler zone protecting the records out of service. Benjamin heard about it at 1:14 AM and was gone by 8:10. Pike's men followed him to Silver Spring, to Frederick and to the ridge.",
      },
      {
        heading: "The archive authenticated",
        body: "Brought out alive on December 29, Benjamin gave the passphrase at an independent laboratory with his counsel and an FBI examiner present. The volume matched his handwritten ledger, Meridian's own last backup and the burned originals recovered from Bay C. The specimen card for A-1 bears Evelyn Lockhart's name, and the document examiner found strong support that her hand signed the approvals and the notes.",
      },
      {
        heading: "What it proves, and what it does not",
        body: "The records prove that she commanded specific criminal operations of intelligence, pressure and concealment and paid for them through her trust; that she directed the release of selected genuine records to bring down three of her own people while hiding her part; and that she ordered the destruction of the evidence and the recovery of the witness's copy. They do not prove that she ordered any killing, and this report does not say she did. Benjamin Sayer fled because he was watched, and was then hunted. He was never taken.",
      },
    ],
    bennett: [
      "It's Quinlan. Your report is with the U.S. Attorney, and it holds.",
      "Evelyn Lockhart was arrested as she left 26 Federal Plaza at 6:40 this evening, on federal charges of conspiracy, obstruction of justice, witness tampering and related counts. Conrad Pike was arrested at his home in Vienna at 5:15: arson, obstruction, witness tampering. Sobczak and Dunleavy are charged. Holt, Rourke, Kane and Marchetti's cases go on, and every one of the earlier findings stands.",
      "Arrest isn't conviction. Nobody's promising a sentence, and her lawyers will fight every page. But the pages are real, and they're in our custody now, not hers.",
      "Benjamin asked me to tell you something. He said someone honest had to keep the records, and someone honest had to read them. Thank you.",
    ],
    caller: { characterId: "quinlan", name: "SA Teresa Quinlan", tag: "FBI" },
    series: {
      seriesId: "S001",
      title: "The Judas Principle",
      text: [
        "Six investigations. Six cases that began in different places: an accountant killed over a ledger in Carroway, a contractor taken from a hotel room in Washington, a dockworker killed for asking questions in Baltimore, an informant who found she was being used, a financial adviser killed for following the money, and a records keeper who held the original orders.",
        "We followed the evidence every time, and every time it was true. We were right about who did each thing. What we did not see was that someone had chosen where each trail began.",
        "Evelyn Lockhart built the network and ran it from the top of a paper system only she could sign. When three of her own people became a danger to her, she did not silence them. She handed us the truth about them, in the order that suited her, and let us do the rest. Then she tried to burn the one record that pointed up, and to take back the man who kept a copy.",
        "The record survived, because he kept it honestly, and because we found him first. It proves what she commanded and what she concealed. It does not prove she ordered the killings, and we have not said she did. The men who killed are the men who killed.",
        "She gave us the truth because it served her. She believed it would never reach her. It did.",
        "Series S001 is closed.",
      ].join("\n\n"),
      finale: true,
    },
  },
};
