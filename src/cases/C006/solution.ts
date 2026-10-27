import "server-only";
import type { CaseDefinition, Condition } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C006. Server-only. The final report keeps five
 * responsibilities apart: the 1996 disaster and cover-up, Emily's death and
 * concealment, Glenn's murder, and Len's abduction. Deductions live in
 * deductions.ts.
 */

const knowsStroud: Condition = { chapter: 2 };
const knowsTrent: Condition = { chapter: 3 };
const knowsLen: Condition = { any: [{ hasEvidence: "E036" }, { hasEvidence: "E038" }, { chapter: 4 }] };
const knowsGlenn: Condition = { any: [{ chapter: 3 }, { hasEvidence: "E023" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "emily_killer",
    section: "A",
    title: "Emily Lasko",
    question: "Who killed Emily Lasko?",
    options: [
      { id: "wade", label: "Wade Reeves" },
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "trent", label: "Michael Trent", requires: knowsTrent },
      { id: "glenn", label: "Glenn Sutter", requires: knowsGlenn },
      { id: "accident", label: "Nobody: she fell alone" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "emily_why",
    section: "B",
    title: "Why Emily died",
    question: "Why was Emily killed?",
    options: [
      { id: "personal", label: "A personal confrontation over their relationship and his secrets" },
      { id: "cover", label: "To stop her exposing the Gallery B cover-up" },
      { id: "robbery", label: "Robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "emily_hid",
    section: "C",
    title: "The concealment",
    question: "Who hid Emily's body in Tool Crib 4 and moved her car?",
    options: [
      { id: "wade", label: "Wade Reeves" },
      { id: "trent", label: "Michael Trent", requires: knowsTrent },
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "cover_lead",
    section: "D",
    title: "Gallery B",
    question: "Who was responsible for the 1996 safety failures in Gallery B and directed the cover-up?",
    options: [
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "glenn", label: "Glenn Sutter", requires: knowsGlenn },
      { id: "crew", label: "The crew themselves" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "cover_part",
    section: "E",
    title: "The record",
    multi: true,
    question: "Who took part in falsifying the 1996 record, on his instructions?",
    options: [
      { id: "glenn", label: "Glenn Sutter", requires: knowsGlenn },
      { id: "len", label: "Len Greer", requires: knowsLen },
      { id: "trent", label: "Michael Trent", requires: knowsTrent },
      { id: "evelyn", label: "Evelyn Dorsey", requires: knowsStroud },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "glenn_killer",
    section: "F",
    title: "Glenn Sutter",
    question: "Who killed Glenn Sutter?",
    options: [
      { id: "trent", label: "Michael Trent", requires: knowsTrent },
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "wade", label: "Wade Reeves" },
      { id: "robber", label: "An unknown robber" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "glenn_order",
    section: "G",
    title: "Behind it",
    question: "Who directed Glenn Sutter's murder?",
    options: [
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "trent", label: "Nobody: the killer acted alone" },
      { id: "robbery", label: "Nobody: it was a robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "len_taker",
    section: "H",
    title: "Len Greer",
    question: "Who abducted Len Greer?",
    options: [
      { id: "trent", label: "Michael Trent", requires: knowsTrent },
      { id: "stroud", label: "Richard Stroud", requires: knowsStroud },
      { id: "nobody", label: "Nobody: he went to be hidden" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "len_why",
    section: "I",
    title: "Why Len",
    question: "Why was Len Greer taken?",
    options: [
      { id: "cover", label: "To stop him exposing the cover-up, and find his copies" },
      { id: "protect", label: "To protect him" },
      { id: "money", label: "For money" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "emily_cover",
    section: "J",
    title: "The question everyone asks",
    question: "Was Emily killed to conceal the Gallery B cover-up?",
    options: [
      { id: "no", label: "No" },
      { id: "yes", label: "Yes" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "connection",
    section: "K",
    title: "1996 and 2018",
    question: "How are the 1996 and 2018 crimes connected?",
    options: [
      { id: "scrutiny", label: "Emily was investigating the cover-up when she died for a separate, personal reason; finding her brought new scrutiny, and the cover-up's men killed and kidnapped to keep it buried" },
      { id: "one", label: "One conspiracy killed Emily in 1996 and Glenn in 2018 for the same reason" },
      { id: "none", label: "They are not connected at all" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

export const solution: CaseDefinition["solution"] = {
  answers: {
    emily_killer: "wade",
    emily_why: "personal",
    emily_hid: "wade",
    cover_lead: "stroud",
    cover_part: ["glenn", "len"],
    glenn_killer: "trent",
    glenn_order: "stroud",
    len_taker: "trent",
    len_why: "cover",
    emily_cover: "no",
    connection: "scrutiny",
  },
  standard: {
    // 100 items: 10 key, up to 16 attached, seven points (Final Report Standard, long-form).
    minItems: 10,
    maxItems: 16,
    minKey: 10,
    claims: [
      {
        id: "emily_tie",
        label: "Places the person you name for Emily's death at the mill that night, or ties them to it",
        anyOf: ["E011", "E083", "E084", "E086", "E018", "E087", "E097", "E082", "E095"],
        hint: "Someone saw her at the gate. Someone else knew who she was meeting. Ask them again, with what you know now.",
      },
      {
        id: "emily_why",
        label: "Shows why Emily died",
        anyOf: ["E081", "E086", "E003", "E015", "E004", "E019"],
        hint: "She went to end something. Her best friend knows what, and so does a woman in Ohio.",
      },
      {
        id: "emily_how",
        label: "Shows how Emily died, or how she was hidden",
        anyOf: ["E016", "E100", "E096", "E014", "E013", "E095", "E008"],
        hint: "The building remembers. So does the shop that owned the tools.",
      },
      {
        id: "cover",
        label: "Shows who ordered the 1996 cover-up, and who carried it out",
        anyOf: ["E026", "E031", "E032", "E078", "E098", "E099", "E092", "E093", "E094", "E077", "E033", "E038"],
        hint: "Glenn kept a page. Evelyn kept copies. Len kept a box.",
      },
      {
        id: "glenn",
        label: "Ties the people you name to Glenn Sutter's death",
        anyOf: ["E045", "E046", "E052", "E080", "E057", "E058", "E060", "E048", "E050"],
        hint: "A gate that keeps a log, a truck that was seen, and a phone that only ever called one number.",
      },
      {
        id: "len",
        label: "Ties the person you name to Len Greer's abduction",
        anyOf: ["E065", "E068", "E069", "E070", "E071", "E072", "E074", "E075", "E077", "E073"],
        hint: "Follow the truck south, and look at who owns the land at the end of the road.",
      },
      {
        id: "story",
        label: "Tests the stories they told: an alibi, a timeline or a statement",
        anyOf: ["E087", "E009", "E054", "E052", "E079", "E088", "E089", "E010", "E005", "E083"],
        hint: "Put what each man said beside the logs and time cards of the same hours.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical and forensic", anyOf: ["E013", "E014", "E015", "E016", "E017", "E029", "E030", "E043", "E044", "E050", "E060", "E063", "E064", "E071", "E072", "E073", "E096", "E097", "E099", "E100"] },
      {
        id: "documents",
        label: "Documents, records and money",
        anyOf: ["E004", "E005", "E006", "E008", "E018", "E021", "E022", "E023", "E024", "E025", "E026", "E027", "E031", "E032", "E033", "E034", "E035", "E036", "E038", "E039", "E045", "E046", "E047", "E049", "E052", "E053", "E055", "E056", "E057", "E058", "E066", "E067", "E068", "E069", "E070", "E074", "E078", "E080", "E081", "E082", "E083", "E084", "E085", "E088", "E089", "E090", "E091", "E092", "E093", "E094", "E095", "E098"],
      },
      {
        id: "witnesses",
        label: "Witnesses and statements",
        anyOf: ["E001", "E002", "E003", "E007", "E009", "E010", "E011", "E019", "E020", "E028", "E037", "E040", "E041", "E042", "E048", "E051", "E054", "E059", "E061", "E062", "E065", "E075", "E076", "E077", "E079", "E086", "E087"],
      },
    ],
    minLines: 3,
    linkToSuspect: ["E086", "E095", "E081", "E080", "E060", "E074", "E077", "E045"],
    linkNote: "Nothing attached ties anyone you name to the crimes you name.",
    supporting: ["E012", "E017", "E030", "E085", "E090", "E091"],
    maxUnrelated: 3,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Dana Mitchell, Hollow Creek Police, and through her to the county District Attorney. Copies go to Sarah Lasko and, at her request, to the families of Carl Brennan, Tony Mazur and Eddie Sokol.",
    reconstruction: [
      {
        heading: "Gallery B",
        body: "In the spring of 1996 the Riverside Works was selling its dead East Mill for $4.1 million, and its general manager's $240,000 bonus depended on nothing going wrong first. Ron Lasko's grievance said the Gallery B gas monitors were failing; Glenn Sutter's memo said the same and asked for $186,000. Richard Stroud wrote \"defer\" across it, froze the repair and held Glenn's safety bulletin. On the night of June 13 the crew went down to repack valve 4 with no portable monitor, the fan tagged out and the wall monitors dead. Carl Brennan, Tony Mazur and Eddie Sokol died. Ray Dalton lived.",
      },
      {
        heading: "The cover-up",
        body: "The company blamed the crew. On Stroud's written instruction Glenn rewrote page 41 of the log and kept the real one. Len Greer, who had already buried the union's plea to the borough on Stroud's word, signed a memo saying he inspected a gallery OSHA had sealed. The buyer paid him $8,000 and the company sold him a lot for a dollar. OSHA found a training problem. The sale closed in October. That fall a young plant security officer named Michael Trent told Ray Dalton to take his settlement.",
      },
      {
        heading: "Emily's summer",
        body: "Emily Lasko photographed the memo her father had been slipped and went to Ray, to Earl Hayes, to the newspaper. Stroud heard a girl was asking questions and laughed it off. But Emily had another discovery that summer: her boyfriend, Wade Reeves, was seeing a girl in Brackett, and he spent his nights in the East Mill stripping copper his uncle Gus knew nothing about. Gus had promised Wade the garage if he stayed straight.",
      },
      {
        heading: "August 17, 1996",
        body: "Emily worked her shift, called Rebecca at the motel, and drove to the East Gate at about 8:40 with Wade's ring in her pocket to end it. Andrew Pierce saw her go in, and Wade's truck waiting. In the Maintenance Building she told Wade she knew about Denise and would tell Gus about the copper. He struck her. She fell against the steel bench and died. Wade laid her in Tool Crib 4, wedged pallets against the door, drove her car to the Brackett depot with the seat pushed back for his own legs, took a cab back to Mill Road, and threw her bag in the river on his way home. The next day he took a chain, a padlock and his uncle's welder from the closed shop and sealed the door. He never sold another pound of copper. The plant had nothing to do with it.",
      },
      {
        heading: "Twenty-two years",
        body: "The town decided Emily had run away. Her father died believing the company had killed her. On October 12, 2018, three teenagers broke the weld, and the East Mill, now the centerpiece of Stroud's Riverworks, was a crime scene with a state grant hanging on it.",
      },
      {
        heading: "Glenn",
        body: "Glenn Sutter decided to tell the truth. On Wednesday night he told Stroud so. Twenty-one minutes later Stroud called a prepaid phone in Michael Trent's truck. On Thursday night Glenn went to his storage unit for the page he had kept; Trent followed him through the gate on the override code his company held, beat him to death with a bar, took his wallet to make it look like robbery and a box of papers to make it disappear. He missed the page under the tackle box's false floor. The next morning his truck was shampooed at Reeves Auto, and $12,500 arrived from Stroud's company.",
      },
      {
        heading: "Len",
        body: "On Sunday afternoon Len Greer told Stroud he would not go down for him. Six hours later Trent took him from his front hall, drove him to his father's camp on Laurel Hollow Road and bolted him in the cellar to find out where his copies were. He found the box key, but not the bank, and Len would not give it up. Len lasted thirty-two hours. His copies, and Stroud's own note thanking him for \"the Gallery B matter,\" are now in evidence.",
      },
      {
        heading: "Two stories",
        body: "The mill joined them, and so did a summer. But Emily did not die for Gallery B, and the men of Gallery B did not die for Emily. Richard Stroud let three men die and then had one killed and another taken to keep it quiet; Michael Trent did the work. Wade Reeves killed Emily Lasko over his own lies, and hid her for twenty-two years in the same building he was stealing from.",
      },
    ],
    bennett: [
      "Mitchell. I've read it twice, and so has the DA. It holds, and it holds in separate pieces, which is the only way it would.",
      "Trent is charged with Glenn's murder and with kidnapping Len. Stroud is charged with conspiracy and solicitation in both, and the state is reopening Gallery B. Wade Reeves was arrested at his shop this morning for Emily. Nothing is a conviction until a jury says so.",
      "Sarah asked me to tell you she's going to bury her sister next to their father on Saturday. She'd like you there if you can come. So would I.",
    ],
    caller: { characterId: "mitchell", name: "Det. Dana Mitchell", tag: "Hollow Creek Police · by phone" },
  },
};
