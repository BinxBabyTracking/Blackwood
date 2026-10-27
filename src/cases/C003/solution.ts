import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C003. Server-only. Nothing here reaches the
 * browser until the player earns it (a confirmed deduction) or closes the case.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    title: "Shooting Caused the Crash",
    text: "The medical examiner found the gunfire killed Jenna and Ethan, and the crash came after. Glass on the road starts before the skid marks end. They were dead or dying before the car hit the tree.",
    connections: [["E01", "E02"], ["E02", "E06"]],
  },
  {
    id: "D02",
    title: "A Second Vehicle Followed",
    text: "The family left Hart's at 9:51 PM. A dark SUV that had been waiting at the edge of the lot left a minute after them, two people inside. Gray paint on their rear quarter and a Ford trim piece in the hedge say it caught up.",
    connections: [["E03", "E04"], ["E04", "E05"]],
  },
  {
    id: "D03",
    title: "Ethan's Documents Were Targeted",
    text: "The wallets, cash and phones were left. The only thing taken was the bag Ethan carried everywhere that week, and Ethan had copied records he meant to take to the state. Whoever stopped the car came for the documents.",
    connections: [["E08", "E09"], ["E08", "E15"], ["E09", "E15"]],
  },
  {
    id: "D04",
    title: "The Clearance Was Altered",
    text: "The paper original says boring B-3 is far over the limit and remediation is required. The version filed on the portal moves B-3 140 feet north, lowers the number and lifts every restriction. The surveyor's coordinates put B-3 inside the plating building.",
    connections: [["E10", "E11"], ["E10", "E12"], ["E11", "E12"]],
  },
  {
    id: "D05",
    title: "The Alteration Has an Access Trail",
    text: "The clearance was replaced on the portal at 4:47 PM on August 3 from the annex public terminal, using a clerk's login that was on a sticky note at the desk. Caleb Voss was signed in at the annex from 4:20 to 5:05.",
    connections: [["E16", "E11"], ["E16", "E10"], ["E16", "owen"]],
  },
  {
    id: "D06",
    title: "Vivian Had Identified a Threat",
    text: "Vivian wrote down the amber dash light and the roof rack after seeing a Bell Security SUV at the football game, thought the unit number was 4, asked the school district for the company's vehicle list on October 29, and drafted an email to Det. Cross she meant to send after meeting you.",
    connections: [["E17", "E18"], ["E17", "E24"], ["E18", "E24"]],
  },
  {
    id: "D07",
    title: "The Marshes Were Attacked at Home",
    text: "The front door open, a lamp knocked over, Vivian's glasses on the floor, Graham's blood on the frame and along the hall. They were taken from their house, and found in Bell Security's SUV at the end of the river road.",
    connections: [["E19", "E20"], ["E19", "E21"], ["E20", "E21"]],
  },
  {
    id: "D08",
    title: "Bell's SUV Struck the Victims' Car",
    text: "The trim fragment from the hedge is a right front wheel-arch molding for a 2016 to 2018 Explorer. Three days after the shooting, Bell Security's Unit 4 had exactly that part replaced, paid in cash, with silver paint on the corner and no sign of a deer.",
    connections: [["E05", "E26"], ["E26", "E27"], ["E05", "E27"]],
  },
  {
    id: "D09",
    title: "Shaw's Account Is Contradicted",
    text: "Trevor Shaw says he was on a breakdown call on Route 51. His own truck sat at the Bell Security garage from 9:15 to 10:38 PM, through the whole time the SUV was waiting at Hart's and on Alder Street, and the 'call' has no customer and no payment.",
    connections: [["E28", "E04"], ["E28", "shaw"]],
  },
  {
    id: "D10",
    title: "Bell and Shaw Worked Together",
    text: "Bell called Shaw the evening before. On the night, Shaw's truck was parked at Bell's garage while his phone touched the tower two blocks from Alder Street at 10:05 PM. A prepaid phone called him before and after.",
    connections: [["E28", "E29"], ["E29", "E04"]],
  },
  {
    id: "D11",
    title: "Voss Paid Bell Around the Attack",
    text: "Voss paid Bell Security $5,000 on September 13 for unnamed 'supplemental services, two personnel', and wired $15,000 on September 17, the day of the repair, telling his bookkeeper not to put it 'under patrol'.",
    connections: [["E13", "E14"], ["E13", "E30"], ["E14", "E30"]],
  },
  {
    id: "D12",
    title: "Both Crimes Are Connected",
    text: "The SUV Vivian described is Unit 4, Marcus Bell's own vehicle. On October 29 its tracker took it from his garage to the Marsh house and on to the river road, the scrapyard camera saw one man walk out and a Bell Security pickup leave, and Bell's DNA is inside the gloves with Graham Marsh's blood on them.",
    connections: [["E18", "E25"], ["E22", "E25"], ["E31", "E25"], ["E32", "bell"]],
  },
];

const knowsVoss: Condition = { any: [{ talkedTo: "voss" }, { hasEvidence: "E13" }, { hasEvidence: "E14" }, { hasEvidence: "E30" }] };
const knowsShaw: Condition = { any: [{ talkedTo: "shaw" }, { hasEvidence: "E08" }, { hasEvidence: "E28" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "organizer",
    section: "A",
    title: "Organizer",
    question: "Who organized the attack on Alder Street?",
    options: [
      { id: "voss", label: "Caleb Voss", requires: knowsVoss },
      { id: "bell", label: "Marcus Bell" },
      { id: "shaw", label: "Trevor Shaw", requires: knowsShaw },
      { id: "nobody", label: "Nobody: it was a robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "attackers",
    section: "B",
    title: "Attackers",
    multi: true,
    question: "Who carried out the attack on Alder Street?",
    options: [
      { id: "bell", label: "Marcus Bell" },
      { id: "shaw", label: "Trevor Shaw", requires: knowsShaw },
      { id: "voss", label: "Caleb Voss", requires: knowsVoss },
      { id: "robber", label: "An unknown robber" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "motive",
    section: "C",
    title: "Motive",
    question: "Why were Jenna and Ethan attacked?",
    options: [
      { id: "documents", label: "To take Ethan's documents and bury the falsified clearance" },
      { id: "robbery", label: "Robbery" },
      { id: "grudge", label: "A grudge against Ethan" },
      { id: "jenna", label: "A dispute with Jenna" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "second_killer",
    section: "D",
    title: "The Marshes",
    question: "Who killed Vivian and Graham Marsh?",
    options: [
      { id: "bell", label: "Marcus Bell, alone" },
      { id: "bell_shaw", label: "Marcus Bell and Trevor Shaw", requires: knowsShaw },
      { id: "shaw", label: "Trevor Shaw", requires: knowsShaw },
      { id: "voss", label: "Caleb Voss", requires: knowsVoss },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "second_motive",
    section: "E",
    title: "Why the Marshes",
    question: "Why were the Marshes killed?",
    options: [
      { id: "witness", label: "Vivian was about to tie Bell's SUV to Alder Street" },
      { id: "cash", label: "Robbery of Graham's cash" },
      { id: "ordered", label: "Voss ordered it to protect the project", requires: knowsVoss },
      { id: "unrelated", label: "Unrelated to Alder Street" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "connection",
    section: "F",
    title: "The Connection",
    question: "How are the two crimes connected?",
    options: [
      { id: "cover", label: "Bell killed the Marshes to stop exposure of the first attack and the scheme behind it" },
      { id: "none", label: "They are not connected" },
      { id: "voss_both", label: "Voss ordered both", requires: knowsVoss },
      { id: "shaw_cover", label: "Shaw covered for Bell", requires: knowsShaw },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Caleb Voss organized the first attack; Marcus Bell and
 * Trevor Shaw carried it out, to take Ethan's documents and bury the falsified
 * clearance. Marcus Bell alone killed Vivian and Graham Marsh, because Vivian
 * was about to tie his SUV to Alder Street. Shaw had no part in it; Voss did
 * not order it.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    organizer: "voss",
    attackers: ["bell", "shaw"],
    motive: "documents",
    second_killer: "bell",
    second_motive: "witness",
    connection: "cover",
  },
  standard: {
    // One key item for every 5 or 6 pieces of evidence: 32 items, 6 key, up to 10 attached (Final Report Standard).
    minItems: 6,
    maxItems: 10,
    minKey: 6,
    // What the report must show, as the player sees it. Neutral wording: none of it hints at the answer.
    claims: [
      {
        id: "tie",
        label: "Places the people you name at the first shooting, or ties them to that night",
        anyOf: ["E04", "E05", "E25", "E26", "E27", "E28", "E29"],
        hint: "Go back to Hart's, and to the ground under the tree on Alder Street.",
      },
      {
        id: "why",
        label: "Shows why the first victims were attacked",
        anyOf: ["E08", "E09", "E10", "E11", "E12", "E15", "E16"],
        hint: "Follow what Ethan was carrying, and where the original paperwork is kept.",
      },
      {
        id: "behind",
        label: "Shows who was behind the first attack",
        anyOf: ["E13", "E14", "E30"],
        hint: "Follow the money between the developer and the security company.",
      },
      {
        id: "second",
        label: "Ties the person you name to the second deaths",
        anyOf: ["E21", "E22", "E25", "E31", "E32"],
        hint: "Find where that vehicle went on the night of October 29, and what was thrown away afterward.",
      },
      {
        id: "second_why",
        label: "Shows why the second victims were killed",
        anyOf: ["E07", "E17", "E18", "E24"],
        hint: "Vivian wrote things down. Look at what she left at home.",
      },
      {
        id: "story",
        label: "Tests the story they told: an alibi, a timeline or a statement",
        anyOf: ["E04", "E25", "E26", "E28", "E29"],
        hint: "Check what each man says he was doing against the records of where he actually was.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical and forensic", anyOf: ["E01", "E02", "E05", "E06", "E19", "E20", "E21", "E27", "E32"] },
      { id: "documents", label: "Documents and money", anyOf: ["E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E25", "E26", "E30"] },
      { id: "witnesses", label: "Witnesses, communications and movements", anyOf: ["E03", "E04", "E07", "E17", "E18", "E22", "E24", "E28", "E29", "E31"] },
    ],
    minLines: 3,
    linkToSuspect: ["E22", "E31", "E32"],
    linkNote: "Nothing attached ties anyone to what happened at 409 Alder Street on October 29.",
    supporting: ["E23"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Helen Cross, Bellwether Police, and through her to the Calder County District Attorney.",
    reconstruction: [
      {
        heading: "The clearance",
        body: "Riverside Commons could not be built on the old plating works as long as boring B-3 said what it said. On August 3, Caleb Voss sat at the annex's public terminal with a clerk's login from a sticky note and replaced the clearance on the city portal with a version that moved B-3 and lifted every restriction. Owen Price noticed and was told to leave it alone.",
      },
      {
        heading: "Ethan",
        body: "In September Ethan Cole was wiring temporary power at the site and dug into orange soil. On the 11th he read the paper original at the annex; on the 12th he copied it and the survey, and called Voss's site manager about B-3. On the 13th Bell Security billed Voss $5,000 for 'two personnel', and that evening Voss met Marcus Bell and Trevor Shaw at the site trailer. Get the bag, he told them. Scare him. Nobody gets hurt. That night Ethan left an envelope with Rachel, just in case.",
      },
      {
        heading: "Alder Street",
        body: "On Friday night Shaw parked his tow truck at Bell's garage and rode in Unit 4. They followed the family from the carnival and waited at Hart's. At 10:04 on Alder Street Bell clipped the CR-V's rear quarter; when Jenna kept driving he pulled alongside, and both men fired. The car went into the oak. They took Ethan's bag and left toward Furnace Street, the amber light on the dash glowing as they turned. Across the street, Vivian Marsh saw it. Sophie, asleep in the back, was not hurt.",
      },
      {
        heading: "Cleaning up",
        body: "Shaw logged a breakdown call on Route 51 that never happened, then towed the wreck on the police rotation. On Monday Bell had Unit 4's right front corner replaced and paid cash, and told the body shop it was a deer. That day Voss wired him $15,000 and told his bookkeeper not to call it patrol. None of them knew Ethan had made a second copy.",
      },
      {
        heading: "The witness",
        body: "On September 28, doing the gate at a high school football game, a Bell Security SUV showed the same amber light Vivian had seen. She wrote it down. On October 29 she asked the school district for the security company's vehicle list, so she could be sure before she bothered anyone. At 2:14 PM the district forwarded her request to Bell Security. That evening Bell drove Unit 4 to Alder Street. He killed Vivian and Graham Marsh in their home before eight, put them in the SUV, drove it to the end of the river road and tried to burn it. The rain put the fire out. He walked to his own site trailer and left in a company pickup. In the morning he reported Unit 4 stolen.",
      },
      {
        heading: "What held",
        body: "The tracker the insurer had installed, the only camera on River Road, and a pair of gloves in a dumpster. Shaw was on a highway with state troopers that night. Voss was at a dinner in front of two hundred people, and texted Bell the next morning to ask what had happened. Neither of them ordered the second killing. Marcus Bell did it to keep the first one buried.",
      },
    ],
    bennett: [
      "Your report is on my desk and on the DA's. It holds: the clearance, the money, the SUV, the tracker, the gloves.",
      "Voss and Shaw are charged for Alder Street. Bell is charged for all four. The state has stopped work at Riverside Commons and is testing the ground. After that it's up to a court. Nothing on paper is a conviction.",
      "Rachel called me. Sophie starts first grade next fall. She wanted you to know somebody looked. Thank you.",
    ],
    caller: { characterId: "cross", name: "Det. Helen Cross", tag: "Bellwether Police · by phone" },
  },
};
