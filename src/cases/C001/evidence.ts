import type { EvidenceDef } from "@/game/engine/types";

/*
 * Canonical evidence inventory for C001 (IDs and titles fixed by the brief).
 * Descriptions say what the investigator observes, never what it means.
 * The meaning lives only in deductions.ts and solution.ts.
 */
const ev = (e: EvidenceDef) => e;

export const evidence: EvidenceDef[] = [
  ev({
    id: "E01",
    title: "Cut Window Screen",
    description: "The screen over the kitchen window above the sink, slit in an L-shape.",
    sourceLocationId: "kitchen",
    image: "ev.e01",
    inspection:
      "A clean cut through the aluminium mesh, about ten inches each way. The cut edges are bent outward, toward the yard. The flower bed directly beneath the window is soft earth; the marigolds are upright and there are no footprints.",
    discovery: "Inspect the kitchen window.",
    characters: [],
    related: ["E10"],
    boardable: true,
  }),
  ev({
    id: "E02",
    title: "Bloodstained Broken Glass",
    description: "Shards of a crystal water glass on the living room carpet near the overturned chair.",
    sourceLocationId: "living_room",
    image: "ev.e02",
    inspection:
      "Heavy cut crystal, one of a set from the sideboard. The largest shard has a dried smear of blood along its broken edge, as if someone gripped it. The police collected the rest; this piece was bagged and left for you at Detective Bennett's request.",
    discovery: "Inspect the glass by the overturned chair.",
    characters: ["eleanor"],
    related: ["E11", "E14"],
    boardable: true,
  }),
  ev({
    id: "E03",
    title: "Financial Ledger Discrepancy",
    description: "Eleanor's household ledger, kept in pencil, from her writing desk.",
    sourceLocationId: "living_room",
    image: "ev.e03",
    inspection:
      "Monthly entries since 1981 in Eleanor's neat hand. Each month she records the estate income Daniel Mercer reported to her. Against the last fourteen months she has pencilled a second column, headed 'Bank says', and the two columns drift apart by thousands. At the bottom of the page: 'Ask P. to pull statements.'",
    discovery: "Inspect the writing desk in the living room.",
    characters: ["eleanor", "daniel", "patricia"],
    related: ["E08", "E09", "E15"],
    boardable: true,
  }),
  ev({
    id: "E04",
    title: "Diner Observation Note",
    description: "A guest check from the Maple Street Diner with a note in pencil on the back.",
    sourceLocationId: "diner",
    image: "ev.e04",
    inspection:
      "Front: one coffee, one cherry pie, table 6, $1.85, paid. Back, in Rosa Delgado's handwriting: 'Sat 8/17. Tbl 6 man tan jacket walked on refill 11:20. R.D.'",
    discovery: "Ask Rosa Delgado about Saturday, then take the ticket from the spike.",
    characters: ["rosa"],
    related: ["E12", "E13"],
    boardable: true,
  }),
  ev({
    id: "E05",
    title: "Bloodstained Jacket",
    description: "A tan nylon windbreaker recovered by LAPD from a dumpster behind a Silver Lake apartment building.",
    sourceLocationId: "office",
    image: "ev.e05",
    inspection:
      "Men's size large, zip front, elasticated cuffs. The right cuff and the inside of the right sleeve are stiff with a dark brown stain that someone has tried to scrub. Lab note clipped to the bag: 'Cuff stains: Type A and Type B. Sleeve lining: Type B.'",
    discovery: "Notice the jacket at Daniel's apartment; after it disappears, ask Detective Bennett to search for it.",
    characters: ["daniel"],
    related: ["E11"],
    boardable: true,
  }),
  ev({
    id: "E06",
    title: "Kitchen Knife / Murder Weapon",
    description: "An eight-inch carving knife, LAPD property tag 85-41173. Police photograph and report extract.",
    sourceLocationId: "office",
    image: "ev.e06",
    inspection:
      "A Sabatier carving knife from the set in Eleanor's kitchen. Found on the living room carpet beside her. The handle had been wiped; the coroner matched the blade to her wounds. Guests recall it was used to cut the lemon cake and left on the sideboard after dessert.",
    discovery: "Included in Detective Bennett's case file.",
    characters: ["eleanor"],
    related: ["E07"],
    boardable: true,
  }),
  ev({
    id: "E07",
    title: "Overturned Chair",
    description: "A dining chair lying on its back between the sofa and the sideboard.",
    sourceLocationId: "living_room",
    image: "ev.e07",
    inspection:
      "One of the six chairs from the dining set, carried into the living room for coffee. It lies on its back with one rear leg cracked at the joint. The rug beneath it is rucked into folds toward the sideboard.",
    discovery: "Inspect the chair in the living room.",
    characters: [],
    related: ["E06", "E02"],
    boardable: true,
  }),
  ev({
    id: "E08",
    title: "Missing Financial Folder",
    description: "An empty hanging file in Eleanor's desk drawer.",
    sourceLocationId: "living_room",
    image: "ev.e08",
    inspection:
      "Every other folder in the drawer is full and labelled in Eleanor's hand: Gas & Electric, Library Fund, Insurance. One hanging file is empty. Its tab reads 'Estate: Mercer reports 1984 to 85'. The police inventory does not list it.",
    discovery: "Inspect the filing drawer in the living room desk.",
    characters: ["eleanor", "daniel"],
    related: ["E03", "E15"],
    boardable: true,
  }),
  ev({
    id: "E09",
    title: "Eleanor's Appointment Note",
    description: "A wall calendar by Eleanor's kitchen telephone.",
    sourceLocationId: "kitchen",
    image: "ev.e09",
    inspection:
      "August 1985, from Hollister Pharmacy. Saturday the 17th: 'Supper 7:30. 5 incl. me. Lemon cake.' Monday the 19th: '9:30 Mr. Albright, Spring St. Bring ledger + P's statements.'",
    discovery: "Inspect the calendar in the kitchen.",
    characters: ["eleanor", "patricia"],
    related: ["E03", "E08"],
    boardable: true,
  }),
  ev({
    id: "E10",
    title: "Rear Door Latch",
    description: "The deadbolt and latch on the kitchen door to the back yard.",
    sourceLocationId: "kitchen",
    image: "ev.e10",
    inspection:
      "The bolt is drawn back and the latch is unlocked. No pry marks on the frame, no scratches around the keyhole. The thumb-turn is on the inside only. On the back step, a fine layer of jacaranda blossom lies undisturbed.",
    discovery: "Inspect the rear door.",
    characters: [],
    related: ["E01"],
    boardable: true,
  }),
  ev({
    id: "E11",
    title: "Blood-Type Report",
    description: "LAPD Scientific Investigation Division, ABO typing results for the Whitmore case.",
    sourceLocationId: "office",
    image: "ev.e11",
    inspection:
      "Victim, E. Whitmore: Type A. Glass shard (item 7), blood on broken edge: Type B. Comparison samples given voluntarily on 8/18 by the four guests: M. Ellis, Type A. R. Hale, Type O. P. Wells, Type A. D. Mercer, Type B.",
    discovery: "Ask Detective Bennett to have the glass analysed.",
    characters: ["eleanor", "margaret", "robert", "patricia", "daniel"],
    related: ["E02", "E05", "E14"],
    boardable: true,
  }),
  ev({
    id: "E12",
    title: "Guest Timeline Notes",
    description: "Detective Bennett's handwritten summary of when each guest says they left.",
    sourceLocationId: "office",
    image: "ev.e12",
    inspection:
      "Lined notepaper, LAPD Northeast. 'Per statements 8/18: Hale left approx 2220. Ellis approx 2235 (walked, across st). Mercer approx 2245 (drove, says Maple St Diner til 0100). Wells approx 2250 (drove). Victim found 0740 Sun by Ellis. Coroner: death between 2330 and 0130.'",
    discovery: "Included in Detective Bennett's case file.",
    characters: ["margaret", "robert", "patricia", "daniel"],
    related: ["E04", "E13"],
    boardable: true,
  }),
  ev({
    id: "E13",
    title: "Diner Employee Shift Sheet",
    description: "The Maple Street Diner's weekly schedule, pinned by the kitchen pass.",
    sourceLocationId: "diner",
    image: "ev.e13",
    inspection:
      "Week of August 12, 1985. Saturday 8/17: 'Linda P. 3 PM to 11 PM. Rosa D. 11 PM to 7 AM. Cook: Sal.' Linda's line is initialled out at 11:00.",
    discovery: "Inspect the schedule at the diner.",
    characters: ["rosa", "daniel"],
    related: ["E04", "E12"],
    boardable: true,
  }),
  ev({
    id: "E14",
    title: "Daniel's Hand Bandage",
    description: "Daniel Mercer's right palm is wrapped in a fresh gauze bandage.",
    sourceLocationId: "daniel_apartment",
    image: "ev.e14",
    inspection:
      "Your own observation. The bandage covers the heel and palm of his right hand. He says a pickle jar broke in his hand on Sunday morning, and that he did not see a doctor.",
    discovery: "Ask Daniel about his hand.",
    characters: ["daniel"],
    related: ["E02", "E11"],
    boardable: true,
  }),
  ev({
    id: "E15",
    title: "Torn Financial Document",
    description: "Half of a bank statement for the Whitmore estate account, torn top to bottom.",
    sourceLocationId: "office",
    image: "ev.e15",
    inspection:
      "Pacific Crest Savings & Loan, account ending 4471, statement for April 1985. Three withdrawals by cheque, each payable to 'D. Mercer Mgmt', total $18,400. Eleanor has circled them and written in the margin: 'Not authorised. Who signed?'",
    discovery: "Patricia sends it after she is asked about Eleanor's finances.",
    characters: ["eleanor", "daniel", "patricia"],
    related: ["E03", "E08"],
    boardable: true,
  }),
];
