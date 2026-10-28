import type {
  CallDef,
  CaseDefinition,
  ChapterDef,
  Condition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  ObjectiveDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
  TextDef,
} from "@/game/engine/types";
import { LAB_BARS_RECT } from "./desk";

/*
 * S01 C03 story content. Times follow docs/S001C03-timeline.md exactly.
 *
 * Four chapters (C006's chapter system). Eight engine events (RE01 to RE08).
 * Delivery 3, the courier copy of the Kane agreement (E022), is an effect of
 * deduction D06 (solution.ts), not an event. Nothing here comments on its
 * copier footer or its waybill, or on who sent it.
 */

export const briefed: Condition = { flag: "casefile_read" };

export const intro: CaseDefinition["intro"] = [
  {
    heading: "Monday, December 3, 2018",
    text: "Blackwood Investigations, Pittsburgh field office. 9:00 AM. The rolling board stands where you left it. The phone is already ringing.",
  },
  {
    text: "Marisol Navarro, calling from Baltimore. Her husband Hector, a cargo checker at East Harbor Terminal, was found dead on the terminal last night. The police told her this morning it was a robbery.",
  },
  {
    text: "'He carried sixty dollars and he never fought anybody for anything. He was scared of something at work, and he wrote it all down. I read about your agency in the paper last month. Please come.'",
  },
  {
    text: "Det. Allison Whitaker of Baltimore Homicide has faxed over what she can, and Bennett has added his notes. The file is on your desk. Read it, then it's four hours to Broening Highway.",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "Evening (Sun 12/2)", text: "Hector Navarro finishes his shift at East Harbor Terminal.", source: "Case file" },
  { time: "9:22 PM (Sun 12/2)", text: "A terminal security officer finds Hector Navarro dead behind a stack of flat racks in Staging Area C.", source: "Case file" },
  { time: "Morning (Mon 12/3)", text: "Baltimore police tell Marisol Navarro that her husband was robbed.", source: "Case file" },
  { time: "9:00 AM (Mon 12/3)", text: "Marisol Navarro hires Blackwood Investigations.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Case file: Hector Navarro, Baltimore, Maryland",
    dossier: [
      { label: "Case ID", value: "S01 C03" },
      { label: "Case title", value: "Dead Freight" },
      { label: "Classification", value: "Homicide" },
      { label: "Location", value: "Baltimore, Maryland" },
      { label: "Year", value: "2018" },
      { label: "Victim", value: "Hector Navarro, 39" },
      { label: "Client", value: "Marisol Navarro, his wife" },
      { label: "Police", value: "Det. Allison Whitaker, BPD Homicide, case 18-1202-118" },
      { label: "Contact", value: "Bennett, Blackwood records, by phone" },
    ],
    people: ["hector", "marisol", "gaffney", "lindqvist", "sullivan", "whitaker"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (from Det. Whitaker's fax)",
        spoken:
          "Baltimore Police Department, Homicide. Case eighteen, twelve oh two, one eighteen. On Sunday, December second, twenty eighteen, at nine twenty-two in the evening, a terminal security officer found Hector Navarro, thirty-nine, a cargo checker for the East Harbor Terminal Operating Company, dead behind a stack of folded flat racks in Staging Area C at East Harbor Terminal, Baltimore. His wife had called terminal security at eight fifty-one when he did not come home. His wallet had been emptied, and his phone is missing. The working theory is a robbery, possibly by someone with access to the terminal. Lead investigator: Detective Allison Whitaker.",
        body: "BALTIMORE POLICE DEPARTMENT, Homicide. Case 18-1202-118. On Sunday, December 2, 2018, at 9:22 PM, a terminal security officer found Hector Navarro, 39, a cargo checker for the East Harbor Terminal Operating Company, dead behind a stack of folded flat racks in Staging Area C, East Harbor Terminal, Baltimore. His wife had called terminal security at 8:51 PM when he did not come home. Wallet emptied; phone missing. Working theory: robbery, possibly by a person with terminal access. Lead investigator: Det. Allison Whitaker.",
      },
      {
        heading: "The victim",
        spoken:
          "The victim. Hector Navarro, thirty-nine, of thirty-two fourteen Fait Avenue, Highlandtown, Baltimore. A cargo checker at East Harbor Terminal for eleven years, badge twenty-one, oh six thirteen. A checker records every container that comes through the gate: its number, its seal, its weight. He leaves his wife, Marisol, and their daughter Sofia, who is nine.",
        body: "Hector Navarro, 39, 3214 Fait Avenue, Highlandtown, Baltimore. Cargo checker at East Harbor Terminal for eleven years, badge 21-0613: he recorded every container that came through the gate, its number, its seal and its weight. Wife: Marisol Navarro. Daughter: Sofia, 9.",
      },
      {
        heading: "The terminal",
        spoken:
          "The terminal. East Harbor Terminal is a container terminal off Broening Highway, on the north side of the Patapsco River, run by the East Harbor Terminal Operating Company. Trucks come and go through Gate One, the main truck gate. Gate Four is a contractor lane. Staging Area C is a fenced area where export containers wait for their ship. Its pedestrian gate opens only with a badge.",
        body: "East Harbor Terminal: a container terminal off Broening Highway on the north side of the Patapsco River, run by the East Harbor Terminal Operating Company (EHTOC). Gate 1 is the main truck gate. Gate 4 is a contractor lane. Staging Area C is a fenced export staging area; its pedestrian gate opens only with a badge.",
      },
      {
        heading: "People",
        spoken:
          "People. Marisol Navarro, Hector's wife, and our client. Russell Gaffney, the terminal operations supervisor, Hector's boss. Joanne Lindqvist, the cargo documentation clerk Hector worked with in the verification office. Vince Sullivan, a retired checker and Hector's old union steward, usually at the hall trailer across from Gate One. And Detective Allison Whitaker, Baltimore Homicide.",
        body: "Marisol Navarro, Hector's wife, client. Russell Gaffney, terminal operations supervisor, EHTOC: Hector's supervisor. Joanne Lindqvist, cargo documentation clerk, cargo verification office: worked with Hector. Vince Sullivan, retired checker and Hector's old union steward, usually at the hall trailer across from Gate 1. Det. Allison Whitaker, BPD Homicide, 601 East Fayette Street.",
      },
      {
        heading: "Note (Bennett)",
        spoken:
          "A note from Bennett. A robbery inside a fence you need a badge for. Whitaker's good and she's busy, and she hasn't bought it either. Her number's in your phone, and so is mine. If you need a company or a plate looked up, ask. B.",
        body: "A robbery inside a fence you need a badge for. Whitaker's good and she's busy, and she hasn't bought it either. Her number's in your phone, and so is mine. If you need a company or a plate looked up, ask. B.",
      },
    ],
  },
];

/* No recorded police interviews in this case: what people say is in the interviews and the notebook. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "call_marisol_locker",
    from: "marisol",
    title: "Call from Marisol Navarro",
    lines: [
      "It's Marisol. I'm sorry. I keep going over everything he said to me those last weeks.",
      "When I asked him where the notebook went, he said it was with the chains. 'The only place nobody looks.' I thought he was being funny. He meant his gear locker, in the lashing building, by the staging area.",
      "It has his own padlock, not the company's. The combination is Sofia's birthday. 04-11-09.",
    ],
    effects: [{ setFlag: "locker_combo" }],
  },
  {
    id: "call_kane",
    from: "kane",
    title: "Call from Gideon Kane, Kane Logistics",
    lines: [
      "Good afternoon. Gideon Kane, Kane Logistics. We run drayage and security at East Harbor.",
      "I hear Blackwood has been asking about my contractors. People at a terminal talk, and they get things wrong.",
      "My door on Clinton Street is open. Come by and ask me whatever you like. Better you hear it from me.",
    ],
    effects: [
      {
        note: {
          id: "call:kane_intro",
          kind: "call",
          title: "Gideon Kane: an open door",
          text: "Gideon Kane, president of Kane Logistics, called to say he has heard about the questions on his contractors. He invited you to his office on Clinton Street, Canton, and can be telephoned.",
          characterId: "kane",
        },
      },
    ],
  },
  {
    id: "call_whitaker_phone",
    from: "whitaker",
    title: "Call from Det. Whitaker",
    lines: [
      "Whitaker. Fisk's story about the Riverside gate and the truck by the fence got me in front of a judge this afternoon. He signed a warrant for the truck.",
      "We served it at his yard on Pennington Avenue at 6:40. Under the driver's seat, wrapped in a blue shop rag, there was an iPhone, powered off. The carrier matched the serial number. It's Hector Navarro's.",
      "Fisk is in an interview room downtown with a lawyer. We took his own phone too. The extraction summary is on its way to your desk.",
    ],
    effects: [
      {
        note: {
          id: "call:whitaker_phone",
          kind: "call",
          title: "Det. Whitaker: the missing phone",
          text: "On a warrant for Dwayne Fisk's truck, the police found Hector Navarro's phone under the driver's seat. Fisk is being held at BPD Homicide.",
          characterId: "whitaker",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_whitaker_warrants",
    from: "whitaker",
    title: "Call from Det. Whitaker",
    lines: [
      "Whitaker. What you put together on Kane, the texts and the money on Monday morning, was enough for the judge.",
      "We're serving warrants at Kane Logistics on Clinton Street tonight, with HSI. The Riverside yard in Fairfield gets a team and a locksmith first thing in the morning.",
      "You can come into his office while we work. Don't touch anything we haven't photographed.",
    ],
    effects: [
      {
        note: {
          id: "call:whitaker_warrants",
          kind: "call",
          title: "Det. Whitaker: warrants for Kane",
          text: "BPD and HSI are serving search warrants at Kane Logistics tonight and at the Riverside Freight Transfer Yard in the morning.",
          characterId: "whitaker",
          important: true,
        },
      },
    ],
  },
  {
    id: "call_whitaker_safe",
    from: "whitaker",
    title: "Call from Det. Whitaker",
    lines: [
      "Whitaker. You tied the money, the file and that register together, and the judge read it twice.",
      "She extended the warrant to the floor safe in Kane's site office at Riverside. The locksmith is done.",
      "It's open. Go and look before we box it up.",
    ],
    effects: [
      {
        note: {
          id: "call:whitaker_safe",
          kind: "call",
          title: "Det. Whitaker: Kane's safe",
          text: "The warrant was extended to the floor safe in Kane's site office at the Riverside yard, and the safe has been opened.",
          characterId: "whitaker",
        },
      },
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Bennett",
    lines: [
      "It's Bennett. I know what an empty board looks like, even from here.",
      "Pin what you've got on the murder board in the office. When two things belong together, run string between them. The board will tell you when you're onto something.",
      "Costs you nothing to be wrong.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Bennett: use the board",
          text: "Pin the evidence on the murder board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

export const texts: TextDef[] = [
  { id: "t_marisol_locker", from: "marisol", body: "Call me when you can. I remembered something Hector said about his locker. M." },
  { id: "t_lindqvist_file", from: "lindqvist", body: "The record for 4827 changed this morning. I put what it says now in my tray. Don't call the desk line. J." },
  { id: "t_whitaker_lab", from: "whitaker", body: "Lab's back on the bars. One of them. Copy on your desk. A.W." },
  { id: "t_whitaker_truck", from: "whitaker", body: "Extraction summary from Fisk's truck and phone is on your desk. Read the Saturday message. A.W." },
];

/* The one lab test: Det. Whitaker sends all twenty-two bars from the lashing gear cage. Real time from the moment she does. */
export const labs: LabDef[] = [
  {
    id: "bars",
    label: "Binder bars: the lashing gear cage, Staging Area C",
    seconds: 180,
    rect: LAB_BARS_RECT,
    image: "obj.labfolder",
    onReady: [
      { delivery: "lab_bar" },
      { text: "t_whitaker_lab" },
      { message: "The BPD laboratory's report on the binder bars is back. It's on your phone and your desk." },
    ],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "courier_kane",
    title: "Courier envelope, no return address",
    exterior: "A Capital Courier envelope addressed by label to Blackwood Investigations, Pittsburgh field office. No return address.",
    text: "No letter. Eleven photocopied pages and the courier's waybill.",
    evidence: ["E022"],
  },
  {
    id: "lab_bar",
    title: "Lab report: the binder bars",
    exterior: "A Baltimore Police Department Laboratory Section folder, sent on by Det. Whitaker, and the same report in your email.",
    text: "Det. Whitaker's note: \"One bar out of twenty-two. It tells us what, not who. A.W.\"",
    evidence: ["E004"],
  },
  {
    id: "whitaker_phone",
    title: "Envelope from BPD Homicide",
    exterior: "A BPD Homicide interoffice envelope, sent on by Det. Whitaker, with a yellow sticky note on the front.",
    text: "Det. Whitaker's note: \"Search return on the truck and the extraction summary from both phones. A.W.\"",
    evidence: ["E028"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "S001C03",
    title: "Marisol remembers the locker",
    characterId: "marisol",
    requires: { any: [{ deduction: "D01" }, { hasEvidence: "E014" }] },
    onActivate: [{ incomingCall: "call_marisol_locker" }, { text: "t_marisol_locker" }, { message: "Your phone is ringing: Marisol Navarro." }],
    complete: { flag: "locker_combo" },
    evidence: ["E009", "E010"],
    notebook: {
      call: "call_marisol_locker",
      learned: [
        { text: "Hector kept his notes \"with the chains, the only place nobody looks\": his gear locker in the lashing gear building, under his own padlock, combination 04-11-09.", requires: { flag: "locker_combo" } },
        { text: "In locker 12 were Hector's notebook and the prints of his photographs.", requires: { all: [{ hasEvidence: "E009" }, { hasEvidence: "E010" }] } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "S001C03",
    title: "A manifest is replaced",
    characterId: "lindqvist",
    requires: { hasEvidence: "E011" },
    onActivate: [{ text: "t_lindqvist_file" }, { message: "A text from Joanne Lindqvist, at the cargo verification office." }],
    complete: { hasEvidence: "E012" },
    evidence: ["E012"],
    notebook: {
      learned: [
        { text: "Joanne Lindqvist texted: the terminal's record for 4827 changed on Tuesday morning, and she left a printout of it in her tray." },
        { text: "The re-issued record lists seal 3301962 and 14,220 kg at gate-in, re-issued Tuesday at 7:52 AM under user RGAFFNEY. Worth setting beside the paper receipt Hector signed.", requires: { hasEvidence: "E012" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "S001C03",
    title: "Gaffney changes his statement",
    characterId: "gaffney",
    requires: { any: [{ deduction: "D03" }, { presented: "gaffney:E011" }, { presented: "gaffney:E012" }] },
    onActivate: [{ setFlag: "gaffney_admits" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "With the altered record in front of him, Russell Gaffney admitted approving the night moves himself, by phone, with no entry on the move plan, and re-issuing 4827's record on Tuesday morning." },
        { text: "He denies knowing what was in the containers." },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "S001C03",
    title: "Fisk stops talking",
    characterId: "fisk",
    requires: { deduction: "D07" },
    onActivate: [{ setFlag: "fisk_refuses" }],
    complete: { always: true },
    notebook: {
      learned: [
        { text: "Dwayne Fisk's account of Sunday evening does not hold, and he has stopped answering questions." },
        { text: "He may talk again if you find something new he has to explain." },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "S001C03",
    title: "Kane calls",
    characterId: "kane",
    requires: { chapter: 3 },
    onActivate: [{ incomingCall: "call_kane" }, { message: "Your phone is ringing: Gideon Kane, Kane Logistics." }],
    complete: { callAnswered: "call_kane" },
    notebook: {
      call: "call_kane",
      learned: [
        { text: "Gideon Kane of Kane Logistics called, having heard about the questions on his contractors. His office on Clinton Street is open to you." },
        { text: "He can be telephoned from now on.", requires: { callAnswered: "call_kane" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "S001C03",
    title: "The police recover the missing phone",
    characterId: "whitaker",
    requires: { all: [{ deduction: "D07" }, { deduction: "D08" }] },
    onActivate: [{ incomingCall: "call_whitaker_phone" }, { message: "Your phone is ringing: Det. Whitaker." }],
    complete: { callAnswered: "call_whitaker_phone" },
    onComplete: [{ delivery: "whitaker_phone" }, { text: "t_whitaker_truck" }, { setFlag: "fisk_custody" }],
    evidence: ["E028"],
    notebook: {
      call: "call_whitaker_phone",
      delivery: "whitaker_phone",
      learned: [
        { text: "On the strength of Fisk's false account and the truck by the fence, a judge signed a warrant for Fisk's truck.", requires: { callAnswered: "call_whitaker_phone" } },
        { text: "Hector's phone was under the driver's seat. Fisk is being held at BPD Homicide.", requires: { callAnswered: "call_whitaker_phone" } },
        { text: "Det. Whitaker sent the search return and the extraction summary from both phones.", requires: { hasEvidence: "E028" } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "S001C03",
    title: "The freight network is exposed",
    characterId: "whitaker",
    requires: { all: [{ deduction: "D10" }, { deduction: "D11" }] },
    onActivate: [{ incomingCall: "call_whitaker_warrants" }, { message: "Your phone is ringing: Det. Whitaker." }],
    complete: { callAnswered: "call_whitaker_warrants" },
    onComplete: [
      { setFlag: "kane_searched" },
      { setEnv: "kane_office", to: "searched" },
      { message: "Police and HSI are searching Kane Logistics. Kane's office is open to you." },
    ],
    evidence: ["E033", "E037", "E039"],
    notebook: {
      call: "call_whitaker_warrants",
      learned: [
        { text: "BPD and HSI served search warrants at Kane Logistics on Clinton Street, and at the Riverside Freight Transfer Yard the next morning.", requires: { callAnswered: "call_whitaker_warrants" } },
        { text: "Kane's credenza at Clinton Street held a Meridian intelligence profile of Russell Gaffney.", requires: { hasEvidence: "E033" } },
        { text: "Kane's file cabinet at the Riverside yard held Meridian papers in a folder marked \"INS.\"", requires: { any: [{ hasEvidence: "E037" }, { hasEvidence: "E039" }] } },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "S001C03",
    title: "The Architect reference",
    characterId: "kane",
    requires: { all: [{ deduction: "D15" }, { hasEvidence: "E039" }] },
    onActivate: [{ incomingCall: "call_whitaker_safe" }, { message: "Your phone is ringing: Det. Whitaker." }],
    complete: { callAnswered: "call_whitaker_safe" },
    onComplete: [
      { setFlag: "safe_open" },
      {
        note: {
          id: "event:architect",
          kind: "event",
          title: "The Architect",
          text: "A memorandum in Kane's safe refers to someone called the Architect. It does not say who.",
        },
      },
    ],
    evidence: ["E040"],
    notebook: {
      call: "call_whitaker_safe",
      learned: [
        { text: "The judge extended the warrant to the floor safe in Kane's site office at the Riverside yard, and it has been opened.", requires: { callAnswered: "call_whitaker_safe" } },
        { text: "A memorandum in Kane's safe refers to someone called the Architect. It does not say who.", requires: { hasEvidence: "E040" } },
      ],
    },
  },
];

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Body at the Dock
  { id: "o1_file", text: "Read the case file on your desk", visible: { always: true }, done: briefed },
  { id: "o1_scene", text: "Examine Staging Area C", visible: { always: true }, done: { visited: "staging" } },
  { id: "o1_marisol", text: "Talk to Marisol Navarro", visible: { always: true }, done: { talkedTo: "marisol" } },
  { id: "o1_police", text: "Get the police file from Det. Whitaker", visible: { always: true }, done: { hasEvidence: "E001" } },
  { id: "o1_concerns", text: "Find out what was worrying Hector at work", visible: { always: true }, done: { hasEvidence: "E014" } },
  { id: "o1_robbery", text: "Test the robbery theory", visible: { always: true }, done: { deduction: "D01" } },
  { id: "o1_opt_vince", text: "Optional: talk to Hector's old steward at the gate", visible: { always: true }, done: { talkedTo: "sullivan" } },
  { id: "o_board", text: "Connect evidence on the murder board", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },

  // Chapter 2: The Altered Manifest
  { id: "o2_notebook", text: "Find Hector's notebook", visible: { chapter: 2 }, done: { hasEvidence: "E009" } },
  { id: "o2_hector", text: "Establish what Hector was documenting", visible: { chapter: 2 }, done: { deduction: "D02" } },
  { id: "o2_manifests", text: "Compare the shipping records", visible: { chapter: 2 }, done: { deduction: "D03" } },
  { id: "o2_moves", text: "Reconstruct the night moves", visible: { chapter: 2 }, done: { deduction: "D04" } },
  { id: "o2_supervisor", text: "Find out what happened to Hector's report", visible: { chapter: 2 }, done: { deduction: "D05" } },
  { id: "o2_access", text: "Find out who could get into Staging Area C that night", visible: { chapter: 2 }, done: { deduction: "D06" } },

  // Chapter 3: The Enforcement Network
  { id: "o3_alibi", text: "Test the contractor's account of Sunday evening", visible: { chapter: 3 }, done: { deduction: "D07" } },
  { id: "o3_vehicle", text: "Identify the vehicle by the fence", visible: { chapter: 3 }, done: { deduction: "D08" } },
  { id: "o3_direct", text: "Find out who sent him", visible: { chapter: 3 }, done: { deduction: "D10" } },
  { id: "o3_after", text: "Follow what happened after the murder", visible: { chapter: 3 }, done: { deduction: "D11" } },
  { id: "o3_coercion", text: "Find out why the supervisor went along", visible: { chapter: 3 }, done: { deduction: "D12" } },
  { id: "o3_money", text: "Find out where the money came from", visible: { chapter: 3 }, done: { deduction: "D14" } },
  { id: "o3_opt_holt", text: "Optional: put Patapsco to its manager", visible: { chapter: 3 }, done: { talkedTo: "holt" } },
  { id: "o3_opt_rourke", text: "Optional: put the file to the man who reviewed it", visible: { chapter: 3 }, done: { talkedTo: "rourke" } },

  // Chapter 4: The Architect's Shadow
  { id: "o4_killer", text: "Establish who killed Hector Navarro", visible: { chapter: 4 }, done: { deduction: "D09" } },
  { id: "o4_yard", text: "Show how the freight operation worked", visible: { chapter: 4 }, done: { deduction: "D13" } },
  { id: "o4_network", text: "Connect the operations", visible: { chapter: 4 }, done: { deduction: "D15" } },
  { id: "o4_authority", text: "Find out who they answer to", visible: { chapter: 4 }, done: { deduction: "D16" } },
  { id: "o4_report", text: "File your final report", visible: { chapter: 4 }, done: { flag: "case_closed" } },
];

export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Body at the Dock",
    intro: "A cargo checker was found dead behind a stack of flat racks at East Harbor Terminal on Sunday night. The police say robbery. His wife says he was killed for something he found.",
    objectives: ["o1_file", "o1_scene", "o1_marisol", "o1_police", "o1_concerns", "o1_robbery"],
    optional: ["o1_opt_vince", "o_board"],
    conclusion: "Hector Navarro was not killed for sixty dollars. Somebody wanted what he knew. But what had he found?",
    summary: "The robbery was staged. Hector had been documenting something at work, and his supervisor knew it.",
  },
  {
    number: 2,
    title: "The Altered Manifest",
    intro: "Tuesday morning. Hector's report named containers, seals and weights. The terminal says the paperwork is in order. Somebody at East Harbor is about to make sure of it.",
    objectives: ["o2_notebook", "o2_hector", "o2_manifests", "o2_moves", "o2_supervisor", "o2_access"],
    conclusion: "The records were changed, the night moves were real, and the gate that should have kept everyone out let one contractor in. Who does he work for?",
    summary: "Containers left the terminal at night and came back changed. The records were rewritten to match. A contractor's badge opened Staging Area C on Sunday evening.",
  },
  {
    number: 3,
    title: "The Enforcement Network",
    intro: "The contractor's name leads off the terminal: to a security yard in Curtis Bay, a logistics office in Canton, and an accounts ledger that pays a company with no trucks.",
    objectives: ["o3_alibi", "o3_vehicle", "o3_direct", "o3_after", "o3_coercion", "o3_money"],
    optional: ["o3_opt_holt", "o3_opt_rourke"],
    conclusion: "Someone sent him, someone paid him, and the money came from further away than Baltimore. The warrants are out. What's in the yard across the river?",
    summary: "The man who was there, the man who sent him, the money that paid him, and the file that kept his supervisor quiet.",
  },
  {
    number: 4,
    title: "The Architect's Shadow",
    intro: "Wednesday. The police are at the Riverside yard with a warrant, and a locksmith is standing by for Kane's safe, waiting on a judge. Everything that moved at night went through those gates.",
    objectives: ["o4_killer", "o4_yard", "o4_network", "o4_authority", "o4_report"],
    conclusion: "Case closed.",
    summary: "Hector's killer is named. The people who ran the freight answer to someone the records never name.",
  },
];

/* The report opens in the last chapter, once the killer is established. */
export const reportAvailable: CaseDefinition["reportAvailable"] = { all: [{ chapter: 4 }, { deduction: "D09" }] };
