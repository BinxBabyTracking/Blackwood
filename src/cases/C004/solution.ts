import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C004. Server-only. Nothing here reaches the
 * browser until the player earns it (a confirmed deduction) or closes the case.
 *
 * The board connects two items at a time; where the design names three or
 * four items for one deduction, the connection counts only once all of them
 * are in hand (`requires`), so the reasoning still needs every piece.
 */

const all = (...ids: string[]): Condition => ({ all: ids.map((id) => ({ hasEvidence: id })) });

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    code: "D01",
    title: "Arthur Was Preparing an Announcement",
    text: "Arthur Vale counted the Blue Lantern's advertisements against the air: forty-six billed in September, six read. He wrote to his sister that he would say so into the microphone on Friday night. The 10:35 'special announcement' was that.",
    connections: [["E12", "E13"], ["E12", "E14"], ["E13", "louise"], ["E12", "E04"]],
  },
  {
    id: "D02",
    code: "D02",
    title: "The Broadcast Schedule Changed",
    text: "The schedule printed in the papers had Arthur Vale live in Studio A at 10:15. At 9:05 the control room's card for 10:15 was rewritten by hand: his opening and letters by transcription, disc A-114, the curtain drawn, not for the log.",
    connections: [["E04", "E05"], ["E05", "samuel"], ["E05", "E09"]],
  },
  {
    id: "D03",
    code: "D03",
    title: "The 10:15 Voice Was Probably a Recording",
    text: "What went out at 10:15 matches the 7:10 rehearsal disc word for word, down to the stumble on 'bell' and a sky 'clear as a bell' when it had been raining for an hour. The disc was signed out of the workshop at 9:10 and never signed back. Listeners almost certainly heard a recording, not a living man.",
    connections: [["E06", "E07"], ["E07", "E08"], ["E06", "E08"], ["E07", "E21"]],
    requires: all("E06", "E07", "E08"),
  },
  {
    id: "D04",
    code: "D04",
    title: "The Control Room Played the Disc",
    text: "The line register, which runs by itself, shows the transmitter fed by PHONO 2, a turntable, from 10:15 to 10:27. Turntable 2 is where the workshop's discs are played to the air. Studio A was not on the air at all after 10:00.",
    connections: [["E08", "E09"], ["E09", "E05"], ["E09", "samuel"]],
  },
  {
    id: "D05",
    code: "D05",
    title: "The Locked Room Could Have Been Staged",
    text: "The bar could only be set from inside, but a cable crawlway behind the amplifier rack runs through to equipment storage, and its turn-buttons close from the storage side. At 10:02 a man came out of that storage room wiping his hands. Someone could have barred the door and left that way.",
    connections: [["E03", "E17"], ["E03", "clara"], ["E03", "E18"]],
  },
  {
    id: "D06",
    code: "D06",
    title: "Henry Mercer: a Motive, but an Alibi",
    text: "Henry Mercer owed Arthur Vale four thousand dollars and shouted at him over it. But he signed in at Doyle's on South Halsted at 9:20 PM, soaked, and played rummy in the parlor until after midnight behind a chained door. His one lie was about where he lives.",
    connections: [["E10", "E11"], ["E11", "henry"], ["E11", "E22"]],
  },
  {
    id: "D07",
    code: "D07",
    title: "The Weapon Came From the Studio",
    text: "The nine-pound brass base weight belongs on Studio A's floor stand and was missing from it. It turned up wiped and hidden in a cable crate in equipment storage, its rounded edge the size the coroner describes, with human blood of Arthur Vale's group in the thread.",
    connections: [["E18", "E20"], ["E18", "E02"], ["E19", "E20"], ["E19", "E02"]],
  },
  {
    id: "D08",
    code: "D08",
    title: "Victor Harlan's Account Doesn't Hold",
    text: "Victor Harlan says he was in his office with the door shut from 9:30 to 10:10. His own book says '9:50 P.M. A.V., Studio A,' struck through. His secretary saw him leave the equipment storage room at 10:02, wiping his hands.",
    connections: [["E16", "E17"], ["E16", "E22"], ["E17", "E22"], ["E17", "victor"]],
  },
  {
    id: "D09",
    code: "D09",
    title: "The Station Hid Payments",
    text: "WCRB billed the Blue Lantern for forty-six spots it never aired, had the invoice made payable to Lakeshore Novelty, and paid Lakeshore 'production' fees. Lakeshore, in turn, pays Riverside Shipping for 'radio cabinets' that are Canadian rye. The station's books were washing liquor money.",
    connections: [["E13", "E14"], ["E14", "E15"], ["E13", "E15"]],
    requires: all("E13", "E14", "E15"),
  },
  {
    id: "D10",
    code: "D10",
    title: "Russo Was Part of It",
    text: "Dominic Russo's own note: 'V.H. squares the books. V.H. pays Riverside.' The Blue Lantern's rye comes through Riverside Shipping, charged to Lakeshore. Russo is the money behind the scheme.",
    connections: [["E15", "E23"], ["E23", "russo"], ["E23", "E14"]],
  },
  {
    id: "D11",
    code: "D11",
    title: "Victor Harlan Profited From the Scheme",
    text: "Riverside's private book shows every load paid by Lakeshore checks signed 'V. Harlan,' with a column for V.H. Harlan's own reconciliation sheet squares the money month by month and the share he kept. Lakeshore Novelty is Victor Harlan.",
    connections: [["E23", "E24"], ["E24", "E28"], ["E28", "victor"]],
    requires: all("E23", "E24", "E28"),
  },
  {
    id: "D12",
    code: "D12",
    title: "Victor Harlan Had the Means to Stage It",
    text: "He rewrote the 10:15 card and took the rehearsal disc. He knew the crawlway; he had it built. His book put him in Studio A at 9:50, and the weapon was hidden in the room the crawlway opens into. Everything the staging needed was in his hands.",
    connections: [["E03", "E16"], ["E05", "E18"], ["E03", "victor"]],
    requires: all("E03", "E05", "E16", "E18"),
  },
  {
    id: "D13",
    code: "D13",
    title: "The Warehouse Trap Came From the Station",
    text: "The men who held you said 'Harlan's coming himself.' The tally office held the book of loads paid by Harlan's checks, in the warehouse on Frankie Moretti's sketch. The trap was set to stop the same investigation Arthur Vale had started.",
    connections: [["E24", "E26"], ["E25", "E26"], ["E26", "E27"]],
    requires: all("E24", "E25", "E26"),
  },
  {
    id: "D14",
    code: "D14",
    title: "The First Timeline Was False",
    text: "The police assumed Arthur Vale was alive at 10:15 because they heard him. The coroner can't fix the time closer than 9:30 to 10:40, the voice was a disc cut at 7:10, and the register shows Studio A off the air after 10:00. He could have died any time after Rose Marlowe saw him at 9:35.",
    connections: [["E02", "E09"], ["E06", "E09"], ["E09", "E22"]],
    requires: all("E02", "E06", "E09"),
  },
];

const knowsRusso: Condition = { any: [{ talkedTo: "russo" }, { hasEvidence: "E13" }, { hasEvidence: "E15" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "killer",
    section: "A",
    title: "The Killer",
    question: "Who killed Arthur Vale?",
    options: [
      { id: "victor", label: "Victor Harlan" },
      { id: "henry", label: "Henry Mercer" },
      { id: "russo", label: "Dominic Russo", requires: knowsRusso },
      { id: "samuel", label: "Samuel Finch" },
      { id: "unknown", label: "Unknown / Insufficient Evidence" },
    ],
  },
  {
    id: "motive",
    section: "B",
    title: "Motive",
    question: "Why was Arthur Vale killed?",
    options: [
      { id: "exposure", label: "To stop him exposing the laundered advertising money" },
      { id: "loan", label: "Over the money he was owed" },
      { id: "quarrel", label: "A quarrel about the program" },
      { id: "robbery", label: "Robbery" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "C",
    title: "Weapon",
    question: "What was he struck with?",
    options: [
      { id: "weight", label: "The brass base weight from a microphone stand" },
      { id: "stand", label: "The nickel tube of the microphone stand" },
      { id: "bottle", label: "A bottle" },
      { id: "fall", label: "Nothing: a fall against the desk" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "time",
    section: "D",
    title: "Time of Death",
    question: "When did Arthur Vale die?",
    options: [
      { id: "t0955", label: "About 9:55 PM, before the program" },
      { id: "t1015", label: "About 10:20 PM, during the program" },
      { id: "t1035", label: "About 10:35 PM, before the announcement" },
      { id: "t1040", label: "After 10:40 PM" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "voice",
    section: "E",
    title: "The Voice at 10:15",
    question: "How is the voice heard at 10:15 explained?",
    options: [
      { id: "disc", label: "The 7:10 rehearsal disc, played to the air from the control room" },
      { id: "impersonator", label: "Someone imitating his voice" },
      { id: "alive", label: "He was alive at 10:15" },
      { id: "studio_b", label: "A broadcast from another studio" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "lock",
    section: "F",
    title: "The Barred Door",
    question: "How was the studio door barred from inside?",
    options: [
      { id: "crawlway", label: "Barred from inside; the killer left through the cable crawlway into storage" },
      { id: "key", label: "Locked from outside with a key" },
      { id: "himself", label: "He barred it himself and died later" },
      { id: "string", label: "The bar was dropped from outside with a string" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "russo",
    section: "G",
    title: "Dominic Russo",
    question: "What was Dominic Russo's part?",
    options: [
      { id: "scheme", label: "Partner in the money scheme, not in the murder" },
      { id: "killer", label: "He killed Arthur Vale" },
      { id: "ordered", label: "He ordered the killing" },
      { id: "none", label: "No part in anything" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "henry",
    section: "H",
    title: "Henry Mercer",
    question: "What was Henry Mercer's part?",
    options: [
      { id: "innocent", label: "He had a motive but is innocent" },
      { id: "killer", label: "He killed Arthur Vale" },
      { id: "helped", label: "He helped the killer" },
      { id: "hid", label: "He covered it up" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Victor Harlan killed Arthur Vale at about 9:55 PM in
 * Studio A with the brass base weight of the floor stand, to stop him exposing
 * the laundering. The voice at 10:15 was the 7:10 rehearsal disc; the door was
 * barred from inside and Harlan left by the crawlway into storage. Russo was
 * his partner in the money, not the murder. Henry Mercer is innocent.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    killer: "victor",
    motive: "exposure",
    weapon: "weight",
    time: "t0955",
    voice: "disc",
    lock: "crawlway",
    russo: "scheme",
    henry: "innocent",
  },
  standard: {
    // One key item for every 5 or 6 pieces of evidence: 28 items, 5 key, up to 9 attached (Final Report Standard).
    minItems: 5,
    maxItems: 9,
    minKey: 5,
    // What the report must show, as the player sees it. Neutral wording: none of it hints at the answer.
    claims: [
      {
        id: "tie",
        label: "Places the person you name at the scene, or ties them to that night",
        anyOf: ["E05", "E08", "E16", "E17", "E27"],
        hint: "Look at what was written in that person's own hand that night, and ask who saw whom in the back hall.",
      },
      {
        id: "why",
        label: "Shows why they did it",
        anyOf: ["E12", "E13", "E14", "E23", "E24", "E28"],
        hint: "Arthur went through the books before he died. Follow the money he found.",
      },
      {
        id: "how",
        label: "Shows how it was done or how it was covered up",
        anyOf: ["E01", "E02", "E03", "E18", "E19", "E20"],
        hint: "Go back to Studio A, and to the room on the other side of its wall.",
      },
      {
        id: "story",
        label: "Tests the story they told: an alibi, a timeline or a statement",
        anyOf: ["E06", "E07", "E09", "E21", "E22"],
        hint: "Everyone believes they heard him at 10:15. Find out what they really heard.",
      },
    ],
    lines: [
      { id: "physical", label: "Physical", anyOf: ["E01", "E02", "E03", "E18", "E19", "E20"] },
      { id: "documentary", label: "Documentary", anyOf: ["E04", "E05", "E06", "E08", "E09", "E13", "E14", "E15", "E16", "E23", "E24", "E28"] },
      { id: "testimonial", label: "Testimonial", anyOf: ["E07", "E12", "E17", "E21", "E22", "E25", "E26", "E27"] },
    ],
    minLines: 3,
    linkToSuspect: ["E05", "E08", "E16", "E17", "E27"],
    linkNote: "Nothing attached puts the person you name in Studio A, or near it, on the night of October 21.",
    supporting: ["E10", "E11"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The bureau has forwarded your report to Officer Thomas Keene, Chicago Police Detective Bureau, and through him to the State's Attorney for Cook County.",
    reconstruction: [
      {
        heading: "The books",
        body: "Since June, Dominic Russo had been paying WCRB in cash for advertisements on the air, forty-odd a month. The station read five or six of them. Victor Harlan had the invoices made payable to Lakeshore Novelty Advertising, a post-office box he ran himself, and Lakeshore's checks, signed by Harlan, paid Riverside Shipping for the Blue Lantern's rye. Russo's money came out clean. Harlan kept three hundred dollars a month for the trouble.",
      },
      {
        heading: "Arthur",
        body: "On Tuesday, October 18, Arthur Vale sat at the end of Clara Whitcomb's desk with the ledger and the program logs and counted. Forty-six billed, six read. On Wednesday he telephoned his sister and wrote her a letter. He would say it on the air on Friday, at 10:35, where nobody could cut him off. He called in his loan to Henry Mercer because he expected to lose his job.",
      },
      {
        heading: "Five past nine",
        body: "Victor Harlan knew. Arthur had written 'For 10:35: Lakeshore Novelty. Ask who owns it.' Harlan's plan was to keep him off the air. At 9:05 he rewrote the 10:15 card for the rehearsal disc Samuel Finch had cut at 7:10, told Samuel that Arthur had agreed, signed the disc out of the workshop, and drew the studio curtain. Then he went to tell Arthur there would be no announcement.",
      },
      {
        heading: "Ten to ten",
        body: "At 9:35 Arthur was alive at his door, reading Rose Marlowe his opening, rewritten because it had begun to rain. At 9:50 Victor Harlan went into Studio A. What was said is not known. Arthur would not be kept off the air. Harlan took the nine-pound brass weight off the foot of the floor stand and struck him once, on the left side of the head, at about 9:55. He set the bar in its brackets, rolled the rack aside, and went through the crawlway on his elbows and knees into the storage room, where he turned the buttons, wedged the weight in a crate of cable and wiped his hands. Clara Whitcomb saw him come out at 10:02.",
      },
      {
        heading: "A quarter past ten",
        body: "At 10:10 Harlan stood under the lobby loudspeaker with his sponsor. At 10:15 Samuel Finch put disc A-114 on turntable 2 and half of Chicago heard Arthur Vale say that the sky over the Loop was clear as a bell. It was pouring. At 10:35 Arthur did not answer his cue. At 10:40 Harlan helped break down the door.",
      },
      {
        heading: "The river",
        body: "When the investigation reached Riverside Shipping, Harlan had Russo's night men, Sal and Augie, send a note in a tally clerk's initials and hold whoever came until he arrived. He came at 11:40 in his Packard, asking where the investigator was and where the book was. By then the investigator, and the book, were gone. The next morning Officer Keene opened Harlan's safe.",
      },
    ],
    bennett: [
      "Keene. Your report's on my captain's desk and on the State's Attorney's. It holds: the disc, the register, the book in his own hand, the weight, the secretary, the warehouse, the safe.",
      "Victor Harlan is charged with murder. Russo's charged under the liquor laws, which in this city means we'll see. Mercer's name was in the papers on Saturday; it'll be in them again tomorrow, the right way round. The kid from the warehouse is going to testify, and I'm going to see nobody comes looking for him.",
      "Miss Vale telephoned me. She says to tell you Arthur would have put you on the air. Thank you.",
    ],
    caller: { characterId: "keene", name: "Officer Thomas Keene", tag: "Chicago Police · by telephone" },
  },
};
