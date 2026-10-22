import type { EvidenceDef } from "@/game/engine/types";

/*
 * Canonical evidence inventory for C001. IDs and titles are fixed by the
 * brief. Descriptions record only what the investigator can physically see.
 * They state no conclusions, motives, dates or forensic results; documents
 * use placeholder layouts until canonical text is supplied. What the evidence
 * means lives only in solution.ts.
 *
 * Locations follow the Step 4 brief. E05 and E15 are reserved for reactive
 * events and cannot be collected before those events happen.
 */
const ev = (e: EvidenceDef) => e;

/** Shown wherever a document's canonical text has not been written yet. */
export const PENDING = "Placeholder document: canonical text to be supplied.";

export const evidence: EvidenceDef[] = [
  ev({
    id: "E01",
    title: "Cut Window Screen",
    description: "The screen over the kitchen window has been cut.",
    sourceLocationId: "kitchen",
    image: "ev.e01",
    inspection:
      "An L-shaped cut runs through the aluminium mesh of the screen above the sink. The edges of the cut are bent away from the room. The flower bed below the window is undisturbed.",
    discovery: "Inspect the window over the kitchen sink.",
    characters: [],
    related: ["E10"],
    boardable: true,
  }),
  ev({
    id: "E02",
    title: "Bloodstained Broken Glass",
    description: "Shards of a broken crystal glass on the living room carpet.",
    sourceLocationId: "living_room",
    image: "ev.e02",
    inspection:
      "Pieces of a heavy crystal water glass lie on the carpet near the overturned chair. The largest shard carries a dried bloodstain along its broken edge. It has been bagged and tagged by the police and left at the scene for review.",
    discovery: "Inspect the broken glass near the overturned chair.",
    characters: ["eleanor"],
    related: ["E11", "E14"],
    boardable: true,
  }),
  ev({
    id: "E03",
    title: "Financial Ledger Discrepancy",
    description: "Eleanor's household ledger, open on her writing desk.",
    sourceLocationId: "living_room",
    image: "ev.e03",
    inspection: `A handwritten household ledger in pencil. On the most recent pages a second column of figures has been added beside the first, and the two do not agree. ${PENDING}`,
    discovery: "Inspect the writing desk in the living room.",
    characters: ["eleanor"],
    related: ["E08", "E09", "E15"],
    boardable: true,
  }),
  ev({
    id: "E04",
    title: "Diner Observation Note",
    description: "A note written on the back of a Maple Street Diner guest check.",
    sourceLocationId: "diner",
    image: "ev.e04",
    inspection: `A guest check from the ticket spike by the register, with a short handwritten note on the back describing a customer. ${PENDING}`,
    discovery: "Inspect the ticket spike by the diner register.",
    characters: ["rosa"],
    related: ["E12", "E13"],
    boardable: true,
  }),
  ev({
    id: "E05",
    title: "Bloodstained Jacket",
    description: "A tan nylon windbreaker recovered by the police.",
    sourceLocationId: "office",
    image: "ev.e05",
    inspection:
      [
        "A men's tan windbreaker, delivered in a police evidence bag. The right cuff and sleeve are stiff with dark staining, and look as though someone has tried to scrub them.",
        "Laboratory notes attached (Serology, Lab No. 85-S-4471, supplementary): Inside of the right cuff: human blood, Group B. Outside of the right sleeve: human blood, Group A. Both stains have been washed but not removed.",
        "So the jacket carries both types found on the broken glass: Group A, the victim's, and Group B, the second person's.",
      ].join("\n\n"),
    discovery: "Reserved for the apartment-change and police recovery event (RE02). Delivered to the office after Det. Bennett recovers it.",
    characters: [],
    related: ["E11"],
    boardable: true,
  }),
  ev({
    id: "E06",
    title: "Kitchen Knife",
    description: "Eleanor's kitchen knife block, with one slot empty.",
    sourceLocationId: "kitchen",
    image: "ev.e06",
    inspection:
      "A wooden block of matching kitchen knives. The largest slot is empty. A police property tag on the block notes that the matching carving knife was taken into evidence from the house.",
    discovery: "Inspect the knife block in the kitchen.",
    characters: ["eleanor"],
    related: ["E07"],
    boardable: true,
  }),
  ev({
    id: "E07",
    title: "Overturned Chair",
    description: "A wooden chair overturned near the seating area in Eleanor's living room.",
    sourceLocationId: "living_room",
    image: "ev.e07",
    inspection:
      "A wooden chair lies overturned near the seating area. Its position suggests the room was disturbed during the incident, although the precise sequence of events remains unclear.",
    discovery: "Inspect the chair in the living room.",
    characters: [],
    related: ["E06", "E02"],
    boardable: true,
  }),
  ev({
    id: "E08",
    title: "Missing Financial Folder",
    description: "An empty hanging file in the drawer of Eleanor's writing desk.",
    sourceLocationId: "living_room",
    image: "ev.e08",
    inspection:
      "Every hanging file in the drawer holds papers except one. Its label refers to the estate accounts. The folder that belongs in it is not in the drawer, and it does not appear on the police inventory of the room.",
    discovery: "Inspect the filing drawer of the writing desk (the empty space where the folder should be).",
    characters: ["eleanor"],
    related: ["E03", "E15"],
    boardable: true,
  }),
  ev({
    id: "E09",
    title: "Eleanor's Appointment Note",
    description: "A desk diary page with an appointment written in Eleanor's hand.",
    sourceLocationId: "living_room",
    image: "ev.e09",
    inspection: `Eleanor's desk diary, open at the current week. An upcoming appointment is written in ink and underlined, with a reminder to bring papers. ${PENDING}`,
    discovery: "Inspect the desk diary in the living room.",
    characters: ["eleanor"],
    related: ["E03", "E08"],
    boardable: true,
  }),
  ev({
    id: "E10",
    title: "Rear Door Latch",
    description: "The latch and bolt on the kitchen door to the back yard.",
    sourceLocationId: "kitchen",
    image: "ev.e10",
    inspection:
      "The bolt is drawn back and the latch is open. The thumb-turn is on the inside only. The frame and keyhole show no scratches or pry marks, and the blossom on the back step lies undisturbed.",
    discovery: "Inspect the rear door.",
    characters: [],
    related: ["E01"],
    boardable: true,
  }),
  ev({
    id: "E11",
    title: "Blood-Type Report",
    description: "A police laboratory report on blood samples from the case.",
    sourceLocationId: "office",
    image: "ev.e11",
    inspection: [
      "LAPD Scientific Investigation Division, Serology Unit. Lab No. 85-S-4471, Whitmore. Received August 17, reported August 23, 1985. Typing by ABO group.",
      "Item 1. Victim's blood, taken at autopsy: Group A.",
      "Item 2. Stain on the living room carpet beside the body: Group A. Consistent with the victim.",
      "Item 3. Stain along the broken edge of the largest crystal glass shard: Group B. Not the victim's. A small trace of Group A at the base of the same shard.",
      "Item 4. Carving knife recovered from the house: human blood, Group A. Consistent with the victim.",
      "Comparison samples, given voluntarily at Northeast Division on August 17: Margaret Ellis, Group O. Robert Hale, Group B. Patricia Wells, Group A. Daniel Mercer, Group B.",
      "Remarks: The blood on the glass's broken edge came from a second person, of Group B. Of the four guests, Ellis and Wells are excluded as its source. Typing cannot distinguish between Hale and Mercer.",
    ].join("\n\n"),
    discovery: "Inspect the laboratory report folder on the office desk.",
    characters: ["eleanor"],
    related: ["E02", "E05", "E14"],
    boardable: true,
  }),
  ev({
    id: "E12",
    title: "Guest Timeline Notes",
    description: "Det. Bennett's handwritten notes on when each guest says they left.",
    sourceLocationId: "office",
    image: "ev.e12",
    inspection: `A sheet of lined notepaper in Det. Bennett's handwriting, listing the four guests and the times they gave in their statements. ${PENDING}`,
    discovery: "Enclosed in Det. Bennett's case file.",
    characters: ["margaret", "robert", "patricia", "daniel"],
    related: ["E04", "E13"],
    boardable: true,
  }),
  ev({
    id: "E13",
    title: "Diner Employee Shift Sheet",
    description: "The Maple Street Diner's weekly staff schedule.",
    sourceLocationId: "diner",
    image: "ev.e13",
    inspection: `A typed weekly schedule pinned beside the kitchen pass, listing each waitress and cook with their shift times. Names have been initialled as shifts ended. ${PENDING}`,
    discovery: "Inspect the staff schedule in the diner.",
    characters: ["rosa"],
    related: ["E04", "E12"],
    boardable: true,
  }),
  ev({
    id: "E14",
    title: "Daniel's Hand Bandage",
    description: "Daniel Mercer's right palm is wrapped in a fresh bandage.",
    sourceLocationId: "daniel_apartment",
    image: "ev.e14",
    inspection: "A clean gauze bandage covers the heel and palm of Daniel Mercer's right hand. It looks recently applied.",
    discovery: "Look at Daniel's hand in his apartment, or ask him about it.",
    characters: ["daniel"],
    related: ["E02", "E11"],
    boardable: true,
  }),
  ev({
    id: "E15",
    title: "Torn Financial Document",
    description: "Half of a bank statement, torn from top to bottom.",
    sourceLocationId: "office",
    image: "ev.e15",
    inspection: `The left half of a typed bank statement for an estate account, torn top to bottom. Several lines have been circled in pencil and there is a handwritten note in the margin. ${PENDING}`,
    discovery: "Reserved for Patricia's envelope event (RE03). Arrives at the office.",
    characters: ["eleanor", "patricia"],
    related: ["E03", "E08"],
    boardable: true,
  }),
];
