import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { reportAvailable } from "./story";

/*
 * Scene layout for C001. Hotspot rectangles are percentages of a 16:9 frame
 * and match the placeholder art in public/cases/C001/locations. When final
 * artwork arrives, adjust the rectangles here to line up with it.
 */

const briefed: Condition = { flag: "casefile_read" };

const inspect = (
  id: string,
  label: string,
  kind: string,
  rect: HotspotDef["rect"],
  title: string,
  text: string,
  extra: Partial<Extract<HotspotDef["interaction"], { type: "inspect" }>> & { visible?: Condition } = {},
): HotspotDef => {
  const { visible, ...rest } = extra;
  return { id, label, kind, rect, visible, interaction: { type: "inspect", title, text, ...rest } };
};

const panel = (id: string, label: string, kind: string, rect: HotspotDef["rect"], p: Extract<HotspotDef["interaction"], { type: "panel" }>["panel"], visible?: Condition): HotspotDef => ({
  id,
  label,
  kind,
  rect,
  visible,
  interaction: { type: "panel", panel: p },
});

const person = (id: string, label: string, characterId: string, rect: HotspotDef["rect"], visible?: Condition): HotspotDef => ({
  id,
  label,
  kind: "person",
  rect,
  visible,
  interaction: { type: "talk", characterId },
});

const door = (id: string, label: string, locationId: string, rect: HotspotDef["rect"]): HotspotDef => ({
  id,
  label,
  kind: "doorway",
  rect,
  interaction: { type: "travel", locationId },
});

/** An item delivered to the office desk: sealed until opened, gone once its evidence is collected. */
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"], sealed: string, opened: string): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: [{ image: opened, when: { deliveryOpened: deliveryId } }, { image: sealed }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  office_casefile: "art.obj_casefile",
  office_labreport: "art.obj_labfolder",
  office_phone: "art.obj_phone",
  office_notebook: "art.obj_notebook",
  office_recorder: "art.obj_recorder",
  office_mail: "art.obj_mailtray",
  lr_chair: "art.obj_chair",
  lr_glass: "art.obj_glass",
  lr_ledger: "art.obj_ledger",
  lr_diary: "art.obj_diary",
  k_knives: "art.obj_knives",
  k_rack: "art.obj_rack",
  d_spike: "art.obj_spike",
  d_rosa: "art.figure_rosa",
  da_daniel: "art.figure_daniel",
  da_coats_a: "art.obj_coatrack_jacket",
  da_coats_b: "art.obj_coatrack_empty",
  da_waste: "art.obj_wastebasket",
  da_firstaid: "art.obj_firstaid",
  da_ashtray: "art.obj_ashtray",
  da_suitcase: "art.obj_suitcase",
  m_margaret: "art.figure_margaret",
  m_photo: "art.obj_photo",
  m_cat: "art.obj_cat",
  g_robert: "art.figure_robert",
  p_patricia: "art.figure_patricia",
  p_adder: "art.obj_adder",
};

export const locations: LocationDef[] = [
  {
    id: "office",
    area: "wilshire",
    name: "Detective's Office",
    subtitle: "Blackwood Investigations, Wilshire Boulevard",
    mapPin: { x: 34, y: 66 },
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file from Det. Bennett", "folder", { x: 38, y: 62, w: 16, h: 10 }, "casefile"),
      inspect("office_labreport", "Laboratory report folder", "labfolder", { x: 17, y: 62, w: 9, h: 8 }, "Laboratory report", "A thin folder from the LAPD laboratory, clipped to the case file's covering note.", { evidence: "E11" }),
      panel("office_board", "Murder board", "board", { x: 5, y: 12, w: 26, h: 38 }, "board"),
      { ...panel("office_phone", "Telephone", "phone", { x: 60, y: 57, w: 8, h: 9 }, "phone"), attention: { callPending: "call_margaret_sedan" } },
      panel("office_notebook", "Notebook", "notebook", { x: 27, y: 66, w: 9, h: 7 }, "notebook"),
      panel("office_map", "Street map of Los Angeles", "map", { x: 64, y: 10, w: 22, h: 28 }, "map"),
      panel("office_recorder", "Police interview tapes", "recorder", { x: 72, y: 56, w: 12, h: 10 }, "statements", briefed),
      panel("office_mail", "Opened mail", "tray", { x: 47, y: 77, w: 10, h: 7 }, "delivery", { any: [{ deliveryOpened: "jacket_recovered" }, { deliveryOpened: "patricia_envelope" }] }),
      // Event objects: they appear on the desk when a delivery arrives and stay until their evidence is collected.
      deskItem("office_envelope", "Manila envelope", "patricia_envelope", "E15", { x: 57, y: 67, w: 7, h: 7 }, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_evidencebag", "Police evidence bag", "jacket_recovered", "E05", { x: 65, y: 63, w: 6, h: 11 }, "obj.evidence_bag", "obj.evidence_bag_open"),
      panel("office_typewriter", "Typewriter: final report", "typewriter", { x: 86, y: 58, w: 11, h: 13 }, "conclusion", reportAvailable),
      // The final report folder appears on the desk once the investigation has enough substance to report on.
      {
        ...panel("office_report", "Final report folder", "sprite", { x: 76, y: 69, w: 9, h: 7 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
    ],
  },
  {
    id: "living_room",
    area: "hollister",
    name: "Eleanor's Living Room",
    subtitle: "Whitmore residence, Hollister Avenue, Los Feliz",
    mapPin: { x: 52, y: 30 },
    background: "loc.living_room",
    ambience: "amb.whitmore",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect("lr_chair", "Overturned chair", "chair", { x: 40, y: 56, w: 12, h: 24 }, "Overturned chair", "One of the dining chairs, brought in for coffee. It lies on its back.", { evidence: "E07" }),
      inspect("lr_glass", "Broken glass", "glass", { x: 53, y: 81, w: 9, h: 7 }, "Broken glass", "Crystal shards on the carpet, a bagged piece beside them with an LAPD tag.", { evidence: "E02" }),
      inspect("lr_ledger", "Writing desk", "desk", { x: 4, y: 40, w: 17, h: 14 }, "Eleanor's writing desk", "A roll-top desk. Her household ledger lies open on the blotter.", { evidence: "E03" }),
      inspect("lr_diary", "Desk diary", "diary", { x: 13, y: 30, w: 7, h: 8 }, "Desk diary", "A leather desk diary propped open on the shelf above the blotter.", { evidence: "E09" }),
      inspect("lr_drawer", "Desk filing drawer", "drawer", { x: 5, y: 56, w: 15, h: 12 }, "Filing drawer", "A deep drawer of hanging files, each labelled in Eleanor's handwriting. One gap stands out.", { evidence: "E08" }),
      inspect("lr_sideboard", "Sideboard", "sideboard", { x: 62, y: 44, w: 22, h: 22 }, "Sideboard", "A glass cake stand with a few crumbs of lemon cake, five dessert plates stacked beside it, and a tray of crystal water glasses. One place in the set is empty. A space on the runner where something long lay."),
      inspect("lr_wine", "Wine bottle", "bottle", { x: 66, y: 32, w: 4, h: 12 }, "Wine bottle", "A 1979 Burgundy, two-thirds empty. Fingerprint powder on the neck. The police lab report found only Eleanor's prints."),
      inspect("lr_poker", "Fireplace tools", "poker", { x: 88, y: 46, w: 6, h: 34 }, "Fireplace tools", "Poker, brush and shovel, hanging neatly in their stand. A film of dust on all three. The grate holds old, cold ash. No one has lit a fire here since spring."),
      inspect("lr_sofa", "Sofa", "sofa", { x: 18, y: 58, w: 20, h: 20 }, "Where she was found", "Police tape marks on the carpet between the sofa and the overturned chair show where Eleanor was found. The sofa cushions are still squared off. Nothing on this side of the room was disturbed."),
      inspect("lr_front_door", "Front door", "door", { x: 27, y: 12, w: 9, h: 42 }, "Front door", "Solid oak, with a deadbolt and a brass chain. No damage. Margaret Ellis let herself in with her spare key at 7:40 on Saturday morning; the door was locked and the chain was off."),
      door("lr_to_kitchen", "Kitchen", "kitchen", { x: 50, y: 10, w: 9, h: 42 }),
    ],
  },
  {
    id: "kitchen",
    area: "hollister",
    name: "Eleanor's Kitchen",
    subtitle: "Whitmore residence, kitchen and rear entrance",
    background: "loc.kitchen",
    ambience: "amb.whitmore",
    available: briefed,
    onMap: false,
    hotspots: [
      inspect("k_window", "Window over the sink", "window", { x: 40, y: 16, w: 20, h: 26 }, "Kitchen window", "The window over the sink stands open a few inches behind its screen.", { evidence: "E01" }),
      inspect("k_door", "Rear door", "backdoor", { x: 74, y: 10, w: 14, h: 58 }, "Rear door", "The back door to the yard. The police found it unlocked on Saturday morning.", { evidence: "E10" }),
      inspect("k_calendar", "Wall calendar", "calendar", { x: 16, y: 20, w: 9, h: 18 }, "Wall calendar", "A pharmacy calendar beside the telephone. Friday's square has a pencilled note: 'Supper, 7. M, R, P, D.'"),
      inspect("k_phone", "Kitchen telephone", "wallphone", { x: 9, y: 38, w: 5, h: 11 }, "Kitchen telephone", "A beige wall telephone with a long coiled cord. A pad beside it lists numbers: Patricia (work), Margaret, Hale Automotive, D. Mercer, Mr. Albright."),
      inspect("k_knives", "Knife block", "knives", { x: 28, y: 47, w: 6, h: 10 }, "Knife block", "A wooden block of French knives on the counter.", { evidence: "E06" }),
      inspect("k_rack", "Drying rack", "rack", { x: 42, y: 47, w: 16, h: 10 }, "Drying rack", "Five dessert plates, five coffee cups and the cake server, washed and drying. Eleanor tidied up after her guests left."),
      door("k_to_living", "Living room", "living_room", { x: 1, y: 10, w: 8, h: 60 }),
    ],
  },
  {
    id: "diner",
    area: "sunset",
    name: "Maple Street Diner",
    subtitle: "Open 24 hours, Silver Lake",
    mapPin: { x: 44, y: 44 },
    background: "loc.diner",
    ambience: "amb.diner",
    available: briefed,
    onMap: true,
    hotspots: [
      person("d_rosa", "Rosa Delgado, waitress", "rosa", { x: 44, y: 28, w: 12, h: 50 }),
      inspect("d_schedule", "Staff schedule", "schedule", { x: 76, y: 18, w: 10, h: 18 }, "Staff schedule", "The week's shifts, pinned beside the kitchen pass.", { evidence: "E13" }),
      inspect("d_spike", "Ticket spike by the register", "spike", { x: 62, y: 44, w: 7, h: 10 }, "Ticket spike", "Guest checks waiting for the manager. One near the top has writing on the back.", { evidence: "E04" }),
      inspect("d_booth", "Window booth", "booth", { x: 3, y: 38, w: 23, h: 36 }, "Window booth", "Table six. A clear view of the parking lot and the pay phone on the corner of Maple and Sunset."),
      inspect("d_pie", "Pie case", "pie", { x: 30, y: 50, w: 12, h: 12 }, "Pie case", "Cherry, apple and lemon meringue. Sixty-five cents a slice. The cherry is nearly gone."),
      inspect("d_jukebox", "Jukebox", "jukebox", { x: 88, y: 38, w: 9, h: 34 }, "Jukebox", "A chrome Seeburg, three plays for a quarter. Someone has put on the same Hall & Oates song twice."),
    ],
  },
  {
    id: "daniel_apartment",
    area: "griffith_park",
    name: "Daniel Mercer's Apartment",
    subtitle: "Second floor, Griffith Park Boulevard, Silver Lake",
    mapPin: { x: 47, y: 37 },
    background: { env: "daniel_apartment", states: { A: "loc.daniel_apartment_a", B: "loc.daniel_apartment_b" } },
    available: briefed,
    onMap: true,
    hotspots: [
      person("da_daniel", "Daniel Mercer", "daniel", { x: 40, y: 22, w: 14, h: 58 }),
      inspect("da_hand", "Daniel's right hand", "hand", { x: 50.5, y: 52, w: 4, h: 6.5 }, "Daniel's right hand", "Daniel keeps his right hand close to his side.", { evidence: "E14" }),
      inspect("da_coats_a", "Coat rack", "coatrack", { x: 7, y: 12, w: 10, h: 60 }, "Coat rack by the door", "A grey raincoat, a navy blazer and a tan nylon windbreaker. The windbreaker's right cuff looks darker than the left, and damp, as though it has been rinsed.", { visible: { env: "daniel_apartment", is: "A" }, effects: [{ setFlag: "saw_jacket" }] }),
      inspect("da_coats_b", "Coat rack", "coatrack_empty", { x: 7, y: 12, w: 10, h: 60 }, "Coat rack by the door", "A grey raincoat and a navy blazer.", { visible: { env: "daniel_apartment", is: "B" }, effects: [{ when: { flag: "saw_jacket" }, then: [{ setFlag: "jacket_missing" }] }], textAfter: [{ requires: { flag: "saw_jacket" }, text: "A grey raincoat and a navy blazer. The tan windbreaker that hung here on your last visit is gone." }] }),
      inspect("da_desk", "Desk and client files", "desk", { x: 62, y: 42, w: 18, h: 18 }, "Client files", "Neat stacks of client folders, each labelled. The one marked 'Whitmore' is thin.", { textAfter: [{ requires: { env: "daniel_apartment", is: "B" }, text: "The stacks have been gone through. The folder marked 'Whitmore' is no longer here." }] }),
      inspect("da_waste", "Wastebasket", "basket", { x: 57, y: 68, w: 6, h: 11 }, "Wastebasket", "Nearly empty. A receipt from Rexall Drugs on Sunset: 'Gauze 4in, adhesive tape, iodine. 8/17/85 9:02 AM.'", { visible: { env: "daniel_apartment", is: "A" } }),
      inspect("da_firstaid", "First aid tin", "tin", { x: 84, y: 50, w: 7, h: 8 }, "First aid tin", "Open on the kitchen counter. Gauze, tape, a half-used bottle of iodine.", { visible: { env: "daniel_apartment", is: "A" } }),
      inspect("da_ashtray", "Ashtray", "ashtray", { x: 66, y: 62, w: 8, h: 7 }, "Ashtray", "Fresh ash and the curled corner of a typed page. Legible on the scrap: '...ESTATE ACCO...'", { visible: { env: "daniel_apartment", is: "B" } }),
      inspect("da_suitcase", "Suitcase", "suitcase", { x: 19, y: 64, w: 14, h: 16 }, "Suitcase", "A packed suitcase by the door, airline tag still on the handle from a trip to Phoenix in May.", { visible: { env: "daniel_apartment", is: "B" } }),
    ],
  },
  {
    id: "margaret_house",
    area: "hollister",
    name: "Margaret Ellis's House",
    subtitle: "Across the street from the Whitmore residence",
    mapPin: { x: 55, y: 27 },
    background: "loc.margaret_house",
    available: briefed,
    onMap: true,
    hotspots: [
      person("m_margaret", "Margaret Ellis", "margaret", { x: 56, y: 20, w: 14, h: 60 }),
      inspect("m_window", "Front window", "frontwindow", { x: 9, y: 12, w: 29, h: 38 }, "Front window", "Through the lace curtains you can see Eleanor's porch and the jacaranda tree at her kerb. The streetlight is directly beside it."),
      inspect("m_tv", "Television", "tv", { x: 77, y: 44, w: 15, h: 22 }, "Television", "A Zenith console set. A TV Guide lies open at Friday: the late news on Channel 2 ended at 11:30."),
      inspect("m_photo", "Framed photograph", "photo", { x: 81, y: 16, w: 9, h: 14 }, "Framed photograph", "Opening of the reading room at the Hollister branch library, 1983. Eleanor holds the scissors at the ribbon. Margaret stands beside her."),
      inspect("m_cat", "Cat", "cat", { x: 39, y: 71, w: 9, h: 9 }, "Cat", "A large ginger tom, asleep on the rug. He has a habit of being let in late."),
    ],
  },
  {
    id: "robert_garage",
    area: "atwater",
    name: "Hale Automotive",
    subtitle: "Fletcher Drive, Atwater Village",
    mapPin: { x: 62, y: 22 },
    background: "loc.robert_garage",
    ambience: "amb.garage",
    available: briefed,
    onMap: true,
    hotspots: [
      person("g_robert", "Robert Hale", "robert", { x: 30, y: 24, w: 12, h: 54 }),
      inspect("g_lift", "Pickup on the lift", "lift", { x: 50, y: 16, w: 31, h: 36 }, "On the lift", "A 1978 Ford pickup with the oil pan off. A drop light hangs from the frame."),
      inspect("g_orders", "Work order board", "orders", { x: 84, y: 14, w: 12, h: 28 }, "Work order board", "Carbon copies of quotes and work orders on nails. One near the bottom: 'D. Mercer. 1981 Buick LeSabre, dk green. Rear L fender crumpled, quote $240. Declined 6/22.'", { effects: [{ setFlag: "knows_fender" }] }),
      inspect("g_bench", "Tool bench", "bench", { x: 3, y: 48, w: 23, h: 24 }, "Tool bench", "Sockets in labelled trays, a radio tuned to the Dodgers, a coffee can full of bolts. Everything has its place."),
    ],
  },
  {
    id: "patricia_office",
    area: "vermont",
    name: "Pacific Crest Savings & Loan",
    subtitle: "Loan department, Vermont Avenue",
    mapPin: { x: 46, y: 56 },
    background: "loc.patricia_office",
    available: briefed,
    onMap: true,
    hotspots: [
      person("p_patricia", "Patricia Wells", "patricia", { x: 44, y: 22, w: 13, h: 56 }),
      inspect("p_files", "Filing cabinets", "filing", { x: 3, y: 22, w: 15, h: 52 }, "Filing cabinets", "Four-drawer steel cabinets. The drawer marked 'Trust & Estate Accts' is locked."),
      inspect("p_adder", "Adding machine", "adder", { x: 62, y: 50, w: 14, h: 11 }, "Adding machine", "A long paper tape curls from the machine onto the floor: a column of figures, several circled in red."),
      inspect("p_notices", "Notice board", "notices", { x: 80, y: 16, w: 14, h: 24 }, "Notice board", "Rate sheet for August: 30-year fixed, 12.25%. A memo about the new IBM terminals arriving in October."),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
