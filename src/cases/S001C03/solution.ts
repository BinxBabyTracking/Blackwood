import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for S01 C03, Dead Freight. Server-only. Nothing here
 * reaches the browser until the player earns it (a confirmed deduction) or
 * closes the case. Deductions follow the table in docs/S001C03-timeline.md.
 *
 * D06 brings Delivery 3 (the courier copy of the Kane agreement, E022). The
 * closing says nothing about who sent it or why, and nothing about its copier
 * footer or its waybill. D09 never says Kane did it; D10 and D11 never say
 * Kane ordered a death.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "The Robbery Was Staged",
    text: "A robber who takes sixty dollars and a phone, and leaves a gold ring, a watch and the cards, inside a fenced area you have to badge into. Hector fell in the lane and was dragged fourteen feet behind the flat racks afterward. His phone went dark at 6:44 PM and was never found. Somebody wanted the phone, and dressed the rest up.",
    connections: [["E001", "E006"], ["E002", "E006"], ["E001", "E002"]],
    requires: { all: [{ hasEvidence: "E001" }, { hasEvidence: "E002" }, { hasEvidence: "E006" }] },
  },
  {
    id: "D02",
    code: "D02",
    title: "Hector Was Documenting the Shipments",
    text: "From November 15 Hector kept dated notes and photographs of containers that left Staging Area C at night and came back with new seals and four tons heavier. On November 29 he put it in writing to his supervisor.",
    connections: [["E009", "E014"], ["E010", "E014"], ["E009", "E010"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "The Shipping Records Were Altered",
    text: "The paper dock receipt Hector signed at Gate 1 on November 26 shows TMCU 482771-6 with seal 2287415 at 9,640 kg. The terminal's record, re-issued Tuesday morning under Gaffney's user name, now says it arrived with seal 3301962 at 14,220 kg. The same gate-in, described two ways.",
    connections: [["E011", "E012"], ["E010", "E012"]],
  },
  {
    id: "D04",
    code: "D04",
    title: "The Night Moves Were Off the Books",
    text: "The move plans show nothing after 10:00 PM. Malone's log shows night legs out Gate 4 to the Riverside yard and back, on the same nights and for the same containers Hector wrote about, with no bill of lading and no checker.",
    connections: [["E013", "E026"], ["E009", "E026"], ["E010", "E013"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "Gaffney Buried Hector's Report",
    text: "Hector reported four containers, seals, weights and night moves. Gaffney answered within twelve hours with a verbal warning and an order not to contact outside agencies. Nobody looked into the containers.",
    connections: [["E014", "E015"], ["E009", "E015"]],
  },
  {
    id: "D06",
    code: "D06",
    title: "Fisk Could Get Into Staging Area C",
    text: "Contractor badge C-1147 opened the Staging Area C gate at 6:21 PM on Sunday, 23 minutes after Hector went in. It belongs to Dwayne Fisk of Fisk Freight Security, Kane Logistics' subcontractor. The Staging Area C zone was added to it in October, on Gaffney's phone call.",
    connections: [["E007", "E018"]],
    effects: [{ delivery: "courier_kane" }, { message: "A courier envelope has arrived at the office." }],
  },
  {
    id: "D07",
    code: "D07",
    title: "Fisk's Account Is False",
    text: "Fisk says he worked the Riverside yard gate himself all Sunday evening. His own schedule put L. Pagano on that gate and Fisk off, and from 6:12 to 7:03 PM his truck was in the East Harbor contractor lane.",
    connections: [["E017", "E027"], ["E017", "E021"]],
  },
  {
    id: "D08",
    code: "D08",
    title: "The Truck by the Fence Was Fisk's",
    text: "The gray Super Duty with the amber roof bar that Otis Mabry saw by the C-row fence at 6:30 is the truck registered to Fisk Freight Security.",
    connections: [["E008", "E019"], ["E008", "E027"]],
    requires: { hasEvidence: "E019" },
  },
  {
    id: "D09",
    code: "D09",
    title: "Fisk Killed Hector Navarro",
    text: "Fisk's badge opened the gate 23 minutes after Hector's. His truck was in and out of the contractor lane around the time of death, his account of the evening is false, and the robbery was staged. Hector died of one blow from a hooked steel bar; the bar was wiped and hung back in the cage among twenty-one others. The person who killed Hector Navarro is the person who was there: Dwayne Fisk.",
    connections: [["fisk", "E004"], ["fisk", "E028"], ["E003", "E004"]],
    requires: {
      all: [{ deduction: "D01" }, { deduction: "D06" }, { deduction: "D07" }, { deduction: "D08" }, { hasEvidence: "E003" }, { hasEvidence: "E004" }],
    },
  },
  {
    id: "D10",
    code: "D10",
    title: "Kane Sent Fisk",
    text: "When Hector put it in writing, Gaffney told Kane. Kane said 'Leave him to me,' asked what shift Hector worked Sunday, and talked to Fisk, his own listed field man, the next morning. Kane sent Fisk to Hector.",
    connections: [["E021", "E023"], ["E022", "E023"], ["E023", "E028"], ["E022", "E028"]],
    requires: { all: [{ any: [{ hasEvidence: "E021" }, { hasEvidence: "E028" }] }, { hasEvidence: "E022" }] },
  },
  {
    id: "D11",
    code: "D11",
    title: "Kane Covered for Fisk",
    text: "After the murder Fisk and Kane talked twice that night and again Monday morning, and at 9:40 Monday Patapsco Freight Services, the company that pays Kane's people, wired Fisk $12,000 for a 'special escort' that appears on no schedule.",
    connections: [["E020", "E029"], ["E020", "E021"], ["E020", "E028"]],
    requires: {
      all: [{ hasEvidence: "E020" }, { any: [{ hasEvidence: "E029" }, { hasEvidence: "E032" }] }, { any: [{ hasEvidence: "E021" }, { hasEvidence: "E028" }] }],
    },
  },
  {
    id: "D12",
    code: "D12",
    title: "Gaffney Was Coerced",
    text: "Gaffney has lied about a 2012 repayment deal on every disclosure since he was hired, and a false answer costs him his job and his pension. Meridian's intelligence practice had it all on paper, and Kane showed it to him in October 2017. Gaffney's cooperation was bought with that file.",
    connections: [["E024", "E033"], ["gaffney", "E033"]],
    requires: { hasEvidence: "E024" },
  },
  {
    id: "D13",
    code: "D13",
    title: "The Freight Operation Was Organized",
    text: "Amendment No. 2 let Kane move containers at night with no plan and no checker; Patapsco took the payments; and the Riverside yard's own log shows each container arriving at bay 3, being transloaded, and leaving with a new seal. It was a system, not a series of mistakes.",
    connections: [["E034", "E035"], ["E030", "E035"], ["E035", "E036"]],
    requires: { all: [{ hasEvidence: "E030" }, { hasEvidence: "E034" }, { hasEvidence: "E035" }] },
  },
  {
    id: "D14",
    code: "D14",
    title: "Meridian Money Ran the Freight Network",
    text: "Meridian posted Kane's $150,000 performance security, and Patapsco, the company that receives Kane's money and pays his people, is managed by Holt Advisory and run from the same Pittsburgh suite as Meridian's office. Meridian-linked money supported the freight operation.",
    connections: [["E031", "E032"], ["E030", "E031"], ["E022", "E032"]],
    requires: { all: [{ any: [{ hasEvidence: "E031" }, { hasEvidence: "E022" }] }, { any: [{ hasEvidence: "E032" }, { hasEvidence: "E030" }] }] },
  },
  {
    id: "D15",
    code: "D15",
    title: "Meridian's Operations Were Connected",
    text: "Holt's financial practice structured Patapsco, Rourke's intelligence practice supplied the file on Gaffney, and Kane's logistics practice used both. The same accounts appear across all three. These are not separate operations.",
    connections: [["E033", "E037"], ["E037", "E038"], ["E033", "E038"]],
    requires: { all: [{ hasEvidence: "E033" }, { hasEvidence: "E037" }, { hasEvidence: "E038" }] },
  },
  {
    id: "D16",
    code: "D16",
    title: "A Higher Authority Exists",
    text: "Each of these operators reports through a 'designated channel,' and the channel answers to someone the documents will not name. One calls that person the Architect. Nothing here says who it is.",
    connections: [["E039", "E040"], ["E033", "E040"]],
    requires: { hasEvidence: "E040" },
  },
];

/* Who the player knows (the build contract's `known` conditions), so the report never names someone they have not met. */
const knowsFisk: Condition = { any: [{ hasEvidence: "E018" }, { hasEvidence: "E027" }, { hasEvidence: "E022" }] };
const knowsKane: Condition = { any: [{ hasEvidence: "E009" }, { hasEvidence: "E022" }, { asked: "sullivan_kane" }, { flag: "gaffney_admits" }, { chapter: 3 }] };
const knowsMalone: Condition = { any: [{ hasEvidence: "E009" }, { hasEvidence: "E010" }, { asked: "sullivan_gate4" }] };
const knowsRourke: Condition = { hasEvidence: "E033" };
const knowsHolt: Condition = { any: [{ hasEvidence: "E030" }, { hasEvidence: "E032" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "The Killer",
    question: "Who killed Hector Navarro?",
    options: [
      { id: "fisk", label: "Dwayne Fisk", requires: knowsFisk },
      { id: "kane", label: "Gideon Kane", requires: knowsKane },
      { id: "gaffney", label: "Russell Gaffney" },
      { id: "malone", label: "Eddie Malone", requires: knowsMalone },
      { id: "robber", label: "A robber with terminal access" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "B",
    title: "The Weapon",
    question: "What was the weapon?",
    options: [
      { id: "binder_bar", label: "A steel binder bar from the lashing gear cage" },
      { id: "tire_iron", label: "A tire iron" },
      { id: "twistlock", label: "A container twist-lock" },
      { id: "pipe", label: "A length of pipe from the scene" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "purpose",
    section: "C",
    title: "The Confrontation",
    question: "Why did the killer confront Hector?",
    options: [
      { id: "records", label: "To frighten him and take his notebook and phone" },
      { id: "rob", label: "To rob him" },
      { id: "dispute", label: "A dispute between dockworkers" },
      { id: "union", label: "To deliver a warning from the union" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "sender",
    section: "D",
    title: "Who Sent Him",
    question: "Who sent him?",
    options: [
      { id: "kane", label: "Gideon Kane", requires: knowsKane },
      { id: "gaffney", label: "Russell Gaffney" },
      { id: "rourke", label: "Julian Rourke", requires: knowsRourke },
      { id: "holt", label: "Adrian Holt", requires: knowsHolt },
      { id: "nobody", label: "Nobody: he acted alone" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "ordered",
    section: "E",
    title: "The Order",
    question: "Did the person who sent him order the killing?",
    options: [
      { id: "no", label: "No: he ordered Hector frightened and his records taken; the killing was the killer's own act" },
      { id: "yes", label: "Yes: he ordered it" },
      { id: "nobody_sent", label: "Nobody sent him" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "concealed",
    section: "F",
    title: "The Concealment",
    question: "How was the crime concealed?",
    options: [
      { id: "staged_paid", label: "The killer staged a robbery; Kane paid him and gave him an alibi" },
      { id: "gaffney_moved", label: "Gaffney moved the body" },
      { id: "cameras", label: "Terminal security erased the cameras" },
      { id: "robbery", label: "It was not concealed: it was a robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "targeted",
    section: "G",
    title: "Why Hector",
    question: "Why was Hector targeted?",
    options: [
      { id: "documenting", label: "He was documenting night moves, seal changes and weight changes on export containers" },
      { id: "debt", label: "He owed money" },
      { id: "union", label: "A union dispute" },
      { id: "theft", label: "He had seen a theft from a car" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "gaffney",
    section: "H",
    title: "The Supervisor",
    question: "What was Russell Gaffney's role?",
    options: [
      { id: "coerced", label: "He approved and covered up the night moves because he was being coerced" },
      { id: "planned", label: "He planned the murder" },
      { id: "unaware", label: "He knew nothing" },
      { id: "ran_it", label: "He ran the operation" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "meridian",
    section: "I",
    title: "Meridian",
    question: "How was Meridian involved?",
    options: [
      { id: "money_intel", label: "Meridian money and a Meridian intelligence file kept the freight operation running" },
      { id: "unwitting", label: "Meridian was an unwitting client of Kane Logistics" },
      { id: "ordered", label: "Meridian ordered the murder" },
      { id: "none", label: "Meridian was not involved" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "architect",
    section: "J",
    title: "Above Them",
    question: "Who do the operators answer to?",
    options: [
      { id: "unidentified", label: "Someone above the operators, called the Architect, not identified by the evidence" },
      { id: "kane", label: "Gideon Kane" },
      { id: "holt", label: "Adrian Holt", requires: knowsHolt },
      { id: "rourke", label: "Julian Rourke", requires: knowsRourke },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Dwayne Fisk killed Hector Navarro with a steel binder
 * bar from the lashing gear cage at Staging Area C, while trying to take his
 * notebook and phone. Gideon Kane sent him to intimidate Hector and take his
 * records, did not order the killing, and paid Fisk and coached his alibi
 * afterward. Hector was targeted because he was documenting the night moves
 * and seal changes. Russell Gaffney approved and covered for the moves under
 * coercion from a Meridian intelligence file. Meridian money and Meridian
 * intelligence kept the freight operation running. Above them all is someone
 * the records call the Architect, who is not identified.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    culprit: "fisk",
    weapon: "binder_bar",
    purpose: "records",
    sender: "kane",
    ordered: "no",
    concealed: "staged_paid",
    targeted: "documenting",
    gaffney: "coerced",
    meridian: "money_intel",
    architect: "unidentified",
  },
  standard: {
    // 40 items: at least 7 key, at most 10 attached (Final Report Standard).
    minItems: 7,
    maxItems: 10,
    minKey: 7,
    claims: [
      {
        id: "scene",
        label: "Places the person you name at the scene that night",
        anyOf: ["E007", "E008", "E018", "E019", "E021", "E027", "E028"],
        hint: "Find out whose badge and whose truck were at Staging Area C on Sunday evening.",
      },
      {
        id: "why",
        label: "Shows why the victim was confronted",
        anyOf: ["E009", "E010", "E011", "E012", "E013", "E014", "E015", "E026", "E036"],
        hint: "Follow what Hector was writing down, and where he kept it.",
      },
      {
        id: "how",
        label: "Shows how it was done and dressed up",
        anyOf: ["E001", "E002", "E003", "E004", "E005", "E006"],
        hint: "Go back over the staging area, the gear cage, and what the police and the medical examiner recorded.",
      },
      {
        id: "story",
        label: "Tests the story they told: an alibi, a timeline or a statement",
        anyOf: ["E017", "E021", "E027"],
        hint: "Compare where the contractor says he was with his own paperwork and the terminal's cameras.",
      },
      {
        id: "sent",
        label: "Shows who directed it, and what was done afterward",
        anyOf: ["E020", "E022", "E023", "E028", "E029"],
        hint: "Look at who the supervisor reported to, and who paid whom on Monday morning.",
      },
      {
        id: "network",
        label: "Shows how the operation was run and paid for",
        anyOf: ["E024", "E030", "E031", "E032", "E033", "E034", "E035", "E037", "E038", "E039", "E040"],
        hint: "The money and the paperwork lead off the terminal. Follow the contracts and the company with no trucks.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical and forensic", anyOf: ["E001", "E002", "E003", "E004", "E005", "E006"] },
      { id: "movement", label: "Access, witnesses and movements", anyOf: ["E007", "E008", "E017", "E018", "E019", "E021", "E027", "E028"] },
      {
        id: "records",
        label: "Records and money",
        anyOf: [
          "E009", "E010", "E011", "E012", "E013", "E014", "E015", "E016", "E020", "E022", "E023", "E024", "E025", "E026",
          "E029", "E030", "E031", "E032", "E033", "E034", "E035", "E036", "E037", "E038", "E039", "E040",
        ],
      },
    ],
    minLines: 3,
    linkToSuspect: ["E018", "E019", "E021", "E027", "E028"],
    linkNote: "Nothing attached ties the person you name to Staging Area C on the evening of December 2.",
    supporting: ["E016", "E025"],
    maxUnrelated: 1,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Allison Whitaker, Baltimore Police Department Homicide, and through her to the Office of the State's Attorney for Baltimore City.",
    reconstruction: [
      {
        heading: "The checker's notebook",
        body: "On Tuesday, November 13, Hector Navarro checked in TMCU 390154-2 at Gate 1 and photographed its seal, 2271160, as he photographed every seal. Two days later it wore 3300847, with no Customs hold and no exam record, and he started a black notebook. On November 19 Kane's security man, in a gray pickup with a yellow light bar, asked him what he was always writing; from the next night Hector locked the notebook in his gear locker at the end of every shift. On Sunday the 25th Vince Sullivan told him nobody re-keys a seal. On November 26 he checked in TMCU 482771-6, used tires, seal 2287415, 9,640 kg; on the 28th it wore 3301962 and lifted at 14.2 tons. That night he watched Gate 4 from Broening Highway and photographed a MALONE HAULING tractor taking another box out at 1:05 AM. On Thursday the 29th he had the prints made and, at 9:47 PM, emailed it all to Russell Gaffney.",
      },
      {
        heading: "The supervisor and the file",
        body: "In March 2012 Gaffney had signed a confidential Separation and Repayment Agreement with Elizabeth River Stevedoring in Norfolk, repaying $64,000 in vendor kickbacks. He has answered \"No\" to the misconduct question on every EHTOC disclosure since. Meridian Advisory Group's corporate intelligence practice found it and wrote it up in September 2017 for \"Logistics (Baltimore)\": leverage assessment HIGH. On October 17, 2017, Gideon Kane showed him the file. From then on Gaffney approved Kane's night moves by phone, first as repair moves, then, from September 2018, as special handling under Amendment No. 2, with nothing on the move plan and no checker, and had the seals and weights re-keyed the next morning.",
      },
      {
        heading: "Friday and Saturday",
        body: "At 9:10 on Friday morning Gaffney answered Hector's report with a verbal warning: \"You are a checker, not an auditor.\" At 6:48 that evening he texted Kane that Navarro had put it in writing. Kane asked who else had it, and said: \"Keep it that way. Leave him to me.\" At 9:14 on Saturday Kane asked what Hector's shift was on Sunday; Gaffney told him: days, off at 6. At 11:20 Kane called Dwayne Fisk for six minutes, and at 11:31 he texted him the job: a checker named Navarro, a notebook and pictures on his phone. \"Get both. Make him understand. Nothing that brings police.\"",
      },
      {
        heading: "Sunday evening",
        body: "Hector's shift ended at 5:30. At 5:36 he texted Marisol that he had one more thing to check and would be home by 7. At 5:44 he locked the notebook in locker 12, and at 5:58 he badged into Staging Area C to photograph 4827's seal one more time before the ship's cutoff. At 6:12 Fisk's truck came in the Gate 4 contractor lane. At 6:21 Fisk's own badge, C-1147, opened the staging area gate; at about 6:30 Otis Mabry saw the truck idling on the service road with its lights off. Hector took his last pictures at 6:31 and 6:33: the seal, and headlights and an amber light bar between the stacks. At about 6:35, in the lane at C-14, Fisk demanded the notebook and the phone. Hector refused. They struggled. Fisk took a binder bar from the open gear cage and struck him once on the head. Hector raised his arm and it did not help. He died there.",
      },
      {
        heading: "The robbery that wasn't",
        body: "Fisk powered off Hector's phone at 6:44 and kept it. He emptied the wallet of its sixty dollars and left the cards, turned out the jacket, upended the lunch cooler, and dragged Hector fourteen feet behind the flat racks, stepping in the lashing grease as he went. He wiped the bar with a blue rag and hung it back on the rack among twenty-one others, the only one hook down. The gate opened from inside at 6:52, and the truck left by Gate 4 at 7:03. He never found the notebook.",
      },
      {
        heading: "After",
        body: "At 7:06 Fisk texted Kane: \"Got the phone. No book. It went bad.\" Kane told him not to text, and they talked at 7:09 and again at 7:31. At 7:40 Kane wrote: \"Keep it off. Keep it with you. I'll send for it.\" He never did. At 10:50 he told Gaffney to clean up the paper on 4827 first thing. At 8:02 on Monday he texted Fisk: \"Paid. Stay home today. You were on the Riverside gate all night.\" At 9:40 Patapsco Freight Services wired Fisk Freight Security $12,000 for a \"special escort\" on December 2. On Tuesday at 7:52 AM Gaffney re-issued 4827's record himself, with the new seal and five more tons, as a clerical correction.",
      },
      {
        heading: "The freight",
        body: "Under Amendment No. 2 Kane's trucks took export containers out the contractor lane at night to bay 3 at the Riverside yard, where cargo was swapped or topped up behind closed doors and a new seal applied, and brought them back before dawn: fourteen containers since September 10. Malone was paid $650 a leg by Patapsco, not Kane. Patapsco, organized in Pittsburgh by Holt Advisory's office manager, took the terminal's payments and Meridian's money, $188,000 from Meridian's Pittsburgh account on Adrian Holt's login until November 7 and $46,000 from Meridian's Washington account after his arrest, and paid Kane, Fisk and Malone. Meridian itself posted Kane's $150,000 performance security. TMCU 482771-6 sailed on the Tidemark Halcyon on Monday afternoon. HSI has it held at transshipment in Algeciras: stolen generators and survey instruments from a September warehouse theft in Delaware, and $380,000 in cash in a false floor.",
      },
      {
        heading: "The safe",
        body: "Kane kept insurance. In his site office at the Riverside yard he filed Meridian's client register and its practice coordination protocol in a folder marked \"INS.\", and in the floor safe, under the cash and his passport, a memorandum declining his request for a meeting. Meridian's operators report through a designated channel and may not refer by name to any authority above it. The memorandum to Kane does it anyway, by the only name any of them was given: the Architect. Nothing in Kane's office says who that is.",
      },
    ],
    bennett: [
      "Whitaker. Your report's with me and the State's Attorney, and it holds.",
      "Dwayne Fisk is charged with first-degree murder. Gideon Kane is charged with conspiracy, witness intimidation and accessory after the fact, and HSI has him on the cargo thefts. Russell Gaffney has a lawyer and a deal on the table, and he's taking it.",
      "Agent Quinlan at the FBI has the Gaffney file. She says it fits a federal case she's already building.",
      "Marisol asked me to tell you Hector would have wanted the notebook to go to Vince. It's going to court first. Then it's going to Vince.",
    ],
    caller: { characterId: "whitaker", name: "Det. Allison Whitaker", tag: "BPD Homicide" },
    series: {
      seriesId: "S001",
      title: "The Judas Principle",
      text: [
        "Three investigations. Three different crimes. Stolen money in Carroway. Blackmail and a kidnapping in Washington. A dead checker on the Baltimore docks.",
        "The names change. The businesses change. But the same connections keep appearing: the same consulting firm, the same Pittsburgh suite, the same files on the same kind of people.",
        "The men we have put away gave the orders we could see. Each of them answered to a channel, and the channel answered to someone none of them was allowed to name.",
        "For the first time, we have a word for whoever is directing them. The Architect.",
      ].join("\n\n"),
      board: "The rolling board is where you left it, with whatever you chose to keep. Nothing on it has been moved.",
    },
  },
};
