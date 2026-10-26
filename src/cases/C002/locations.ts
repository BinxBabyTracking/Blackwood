import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { LAB_GLASSES_RECT, LAB_TYPEWRITER_RECT } from "./desk";
import { reportAvailable } from "./story";

/*
 * Scene layout for C002. Hotspot rectangles are percentages of a 16:9 frame.
 * The office is the agency's own office, the same room as C001; the other
 * scenes are laid out for placeholder art until their paintings exist.
 */

const briefed: Condition = { flag: "casefile_read" };
const arrested: Condition = { flag: "gordon_arrested" };

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
  office_phone: "art.obj_phone",
  office_notebook: "art.obj_notebook",
  office_recorder: "art.obj_recorder",
  office_mail: "art.obj_mailtray",
  hb_glasses: "art.obj_glasses",
  hk_letter: "art.obj_letter",
  hk_slip: "art.obj_slip",
  hk_tom: "art.figure_tom",
  es_howard: "art.figure_howard",
  ps_ferris: "art.figure_ferris",
  ps_gordon: "art.figure_gordon_custody",
  cr_nora: "art.figure_nora",
  ra_ruth: "art.figure_ruth",
  ra_laura: "art.figure_laura",
  cb_gordon: "art.figure_gordon",
  mh_diane: "art.figure_diane",
};

const anyDeliveryOpened: Condition = {
  any: ["trace", "paper", "oak_report", "search", "lab_glasses", "lab_typewriter"].map((d) => ({ deliveryOpened: d })),
};

export const locations: LocationDef[] = [
  {
    id: "office",
    area: "wilshire",
    name: "Detective's Office",
    subtitle: "Blackwood Investigations, Wilshire Boulevard, Los Angeles",
    mapPin: { x: 52, y: 58 },
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Police file from Det. Bennett", "folder", { x: 29, y: 68, w: 20, h: 23.3 }, "casefile"),
      // Lab results arrive on the desk when the lab is done (see labs in story.ts).
      deskItem("office_lab_glasses", "Lab report: the kitchen glasses", "lab_glasses", "E23", LAB_GLASSES_RECT, "art.obj_labfolder", "art.obj_labfolder"),
      deskItem("office_lab_typewriter", "Lab report: the letters", "lab_typewriter", "E19", LAB_TYPEWRITER_RECT, "art.obj_labfolder", "art.obj_labfolder"),
      {
        ...panel("office_board", "Murder board", "board", { x: 0, y: 3, w: 22, h: 41 }, "board"),
        attention: { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] },
        callout: { text: "Tap here to connect your evidence", when: { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] } },
      },
      {
        ...panel("office_phone", "Telephone", "phone", { x: 0.5, y: 64, w: 16.7, h: 23.8 }, "phone"),
        attention: {
          any: ["call_nora", "call_bennett_trace", "call_ruth_laura", "call_nora_letter2", "call_bennett_oak", "call_bennett_arrest", "call_bennett_board"].map((c) => ({ callPending: c })),
        },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 16.5, y: 69, w: 11.4, h: 16.8 }, "notebook"),
      {
        ...panel("office_map", "Road map of Southern California", "map", { x: 70, y: 6, w: 21, h: 37 }, "map"),
        attention: { all: [{ flag: "casefile_read" }, { not: { inspected: "office_map" } }] },
        callout: { text: "Tap here to travel", when: { all: [{ flag: "casefile_read" }, { not: { inspected: "office_map" } }] } },
      },
      panel("office_recorder", "Police interview tapes", "recorder", { x: 74, y: 72, w: 22, h: 28 }, "statements", briefed),
      panel("office_mail", "Opened mail", "tray", { x: 76, y: 68, w: 11, h: 10 }, "delivery", anyDeliveryOpened),
      // Deliveries: they appear on the desk when they arrive and stay until their evidence is collected.
      deskItem("office_trace", "Pacific Bell envelope", "trace", "E09", { x: 48, y: 72, w: 22.6, h: 26 }, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_paper", "Thursday's Courier", "paper", "E11", { x: 36, y: 62, w: 16, h: 14 }, "obj.newspaper", "obj.newspaper"),
      deskItem("office_oak", "Envelope from Oak Terrace Police", "oak_report", "E16", { x: 48, y: 72, w: 22.6, h: 26 }, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_search", "Sheriff's sealed envelope", "search", "E18", { x: 66, y: 62, w: 11.3, h: 30 }, "obj.evidence_bag", "obj.evidence_bag_open"),
      panel("office_typewriter", "Typewriter: final report", "typewriter", { x: 76, y: 46, w: 9.5, h: 10 }, "conclusion", reportAvailable),
      {
        ...panel("office_report", "Final report folder", "sprite", { x: 56, y: 74, w: 20, h: 26 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
    ],
  },
  {
    id: "hale_bedroom",
    area: "mariposa",
    name: "Tom Hale's Bedroom",
    subtitle: "418 Elm Street, Mariposa Bay",
    mapTag: "CRIME SCENE",
    mapPin: { x: 14, y: 36 },
    background: "loc.hale_bedroom",
    ambience: "amb.hale_house",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect("hb_underbed", "Under the bed", "floor", { x: 36, y: 58, w: 28, h: 12 }, "Under the bed frame", "Something black and plastic has been kicked into the dust under the frame.", { evidence: "E01" }),
      inspect("hb_glasses", "Nightstand", "glass", { x: 69.5, y: 34.5, w: 4.5, h: 6.5 }, "The nightstand", "A clock radio, a paperback with a bus ticket for a bookmark, and two kitchen glasses that do not belong in a bedroom.", { evidence: "E02" }),
      inspect("hb_bed", "The bed", "bed", { x: 33, y: 28, w: 30, h: 29 }, "The bed", "The sheets have been pulled off and left in a heap on the floor. A strip of gray duct tape is stuck to the headboard on Laura's side, as if someone tore a length off and set it there to hand."),
      inspect("hb_clock", "Clock radio", "clock", { x: 64.5, y: 37.5, w: 4.5, h: 4 }, "Clock radio", "A General Electric clock radio. The alarm is still set for 6:30 AM. The switch is on; it rang into an empty room on Monday morning and nobody turned it off."),
      inspect("hb_photo", "Photograph on the dresser", "photo", { x: 94, y: 31, w: 5.5, h: 9.5 }, "Photograph", "Laura and Tom at the end of a pier, squinting into the sun. She has a music folder under her arm. Written on the back: 'Ventura, June 1987.'"),
      inspect("hb_window", "Bedroom window", "window", { x: 0, y: 0, w: 11, h: 42 }, "Bedroom window", "Latched from the inside. The screen is intact and the dust on the sill is unmarked. Nobody came in this way."),
      door("hb_to_kitchen", "Hall and kitchen", "hale_kitchen", { x: 74, y: 4, w: 16, h: 56 }),
    ],
  },
  {
    id: "hale_kitchen",
    area: "mariposa",
    name: "Tom Hale's Kitchen",
    subtitle: "418 Elm Street, kitchen, hall and garage door",
    background: "loc.hale_kitchen",
    ambience: "amb.hale_house",
    available: briefed,
    onMap: false,
    hotspots: [
      person("hk_tom", "Tom Hale", "tom", { x: 29, y: 24, w: 12, h: 62 }),
      inspect("hk_letter", "Kitchen table", "letter", { x: 5, y: 60, w: 13, h: 9 }, "The kitchen table", "A police photocopy of the ransom letter lies on the table beside the telephone, where Tom has read it until the paper went soft.", { evidence: "E04" }),
      inspect("hk_slip", "Hall table", "slip", { x: 90, y: 43, w: 8, h: 7 }, "The hall table", "Keys, the mail, and a bank envelope with a withdrawal slip tucked into it.", { evidence: "E22" }),
      inspect("hk_garage", "Door to the garage", "door", { x: 60, y: 5, w: 19, h: 59 }, "Garage and side door", "Through the kitchen door, the garage: a surveyor's tripod, a bicycle, the trash cans. The side door from the garage to the yard has a thumb lock on the inside and a keyhole outside. No marks on the lock, the frame or the strike plate."),
      inspect("hk_drawer", "Kitchen drawer", "drawer", { x: 43, y: 42, w: 14, h: 20 }, "Kitchen drawer", "The scissors Tom used to cut himself free, and a few snipped ends of black plastic tie he swept up afterward."),
      inspect("hk_phone", "Wall telephone", "wallphone", { x: 2, y: 21, w: 4, h: 27 }, "Wall telephone", "A beige wall telephone with a long cord. A pad beside it, in Laura's handwriting: 'Ruth (work)', 'Junior High office', 'Mom's birthday 10/22'."),
      door("hk_to_bedroom", "Bedroom", "hale_bedroom", { x: 6, y: 6, w: 16, h: 52 }),
      door("hk_to_street", "Front door to Elm Street", "elm_street", { x: 85, y: 2, w: 5.5, h: 60 }),
    ],
  },
  {
    id: "elm_street",
    area: "mariposa",
    name: "Elm Street",
    subtitle: "Outside 418 Elm Street, Mariposa Bay",
    background: "loc.elm_street",
    ambience: "amb.elm_street",
    available: briefed,
    onMap: false,
    hotspots: [
      person("es_howard", "Howard Lisk, on his porch across the street", "howard", { x: 77, y: 31, w: 6, h: 21 }),
      inspect("es_curb", "The curb in front of 418", "curb", { x: 28, y: 77, w: 22, h: 15 }, "The curb", "In front of Tom's house, a fresh dark oil spot on the asphalt, the size of a dinner plate. Something big was parked here long enough to drip."),
      inspect("es_corner", "Corner of Elm and 3rd", "streetlight", { x: 91, y: 8, w: 8, h: 52 }, "Elm and 3rd", "A streetlight on the corner. From Howard Lisk's porch it is the first place a car leaving Elm Street would pass under a light."),
      inspect("es_house", "418 Elm Street", "house", { x: 15, y: 22, w: 37, h: 40 }, "418 Elm Street", "A small stucco house with a one-car garage. A side door from the garage opens onto a narrow path along the fence, out of sight of the street."),
      door("es_to_house", "Front door of 418", "hale_kitchen", { x: 10, y: 36, w: 5, h: 19 }),
    ],
  },
  {
    id: "police_station",
    area: "mariposa",
    name: "Mariposa Bay Police Station",
    subtitle: "Detective bureau, Harbor Boulevard",
    mapPin: { x: 19, y: 41 },
    background: "loc.police_station",
    ambience: "amb.police_station",
    available: briefed,
    onMap: true,
    hotspots: [
      person("ps_ferris", "Sgt. Walter Ferris", "ferris", { x: 43, y: 24, w: 13, h: 62 }),
      person("ps_gordon", "Gordon Pell, in an interview room", "gordon", { x: 77, y: 13, w: 7, h: 31 }, arrested),
      inspect("ps_board", "Squad room board", "corkboard", { x: 0, y: 3, w: 22, h: 42 }, "Squad room board", "A duty roster, a wanted flyer for a bank robber in Oxnard, and a typed memo from the chief: 'Overtime on 88-10-0412 to end Wednesday.'"),
      inspect("ps_desk", "Ferris's desk", "desk", { x: 66, y: 50, w: 34, h: 22 }, "Ferris's desk", "A thick folder marked 88-10-0412, a cold cup of coffee, and a legal pad with one word written and underlined twice: 'TIMING.'"),
    ],
  },
  {
    id: "courier",
    area: "mariposa",
    name: "Mariposa Bay Courier",
    subtitle: "Newsroom, 200 Harbor Boulevard",
    mapPin: { x: 11, y: 44 },
    secret: true,
    background: "loc.courier",
    ambience: "amb.newsroom",
    available: { callAnswered: "call_nora" },
    onMap: true,
    hotspots: [
      person("cr_nora", "Nora Pruitt, crime reporter", "nora", { x: 44, y: 24, w: 13, h: 62 }),
      inspect("cr_letter", "Letters on Nora's desk", "letter", { x: 73, y: 51, w: 12, h: 9 }, "Nora's desk", "A typed letter and its envelope, laid flat under a glass paperweight so nobody handles them more than they have to.", { evidence: "E07" }),
      inspect("cr_cassette", "Cassette and transcript", "cassette", { x: 86, y: 59, w: 9, h: 9 }, "The cassette", "A plain cassette in a clear case beside a portable player, with Nora's typed transcript folded around it.", { evidence: "E08" }),
      inspect("cr_phone", "Nora's telephone", "phone", { x: 1, y: 53, w: 17, h: 16 }, "Nora's telephone", "Her direct line. A pad beside it is covered in shorthand and three times written in a column: 3:15, 3:50, 4:20."),
      inspect("cr_presses", "Window to the press room", "window", { x: 71, y: 1, w: 29, h: 43 }, "The press room", "Through the glass, the presses are quiet. Tonight's edition goes at eleven."),
    ],
  },
  {
    id: "ruth_apartment",
    area: "long_beach",
    name: "Ruth Kessler's Apartment",
    subtitle: "Second floor, near Alamitos Park, Long Beach",
    mapPin: { x: 56, y: 72 },
    background: "loc.ruth_apartment",
    ambience: "amb.apartment",
    available: briefed,
    onMap: true,
    hotspots: [
      person("ra_ruth", "Ruth Kessler", "ruth", { x: 25, y: 24, w: 12, h: 62 }),
      person("ra_laura", "Laura Kessler", "laura", { x: 49, y: 26, w: 12, h: 60 }, { flag: "laura_home" }),
      inspect("ra_typewriter", "Ruth's typewriter", "typewriter", { x: 69, y: 39, w: 12, h: 9 }, "Ruth's typewriter", "A typewriter on the dining table, a stack of the shipyard's invoices beside it. Ruth typed Laura's statement on it. Its type is clean and even, nothing like the letters."),
      inspect("ra_photo", "Photograph of the sisters", "photo", { x: 57, y: 18, w: 3.5, h: 10 }, "Photograph", "Two girls on a dock at a lake, about eight and thirteen, the younger one holding up a very small fish."),
      inspect("ra_window", "Window over the park", "window", { x: 82, y: 0, w: 18, h: 40 }, "The window", "Across the street, through the jacarandas, the benches of Alamitos Park.", { textAfter: [{ requires: { flag: "laura_home" }, text: "Across the street, through the jacarandas, the benches of Alamitos Park. Laura was left on one of them, two blocks from this window." }] }),
    ],
  },
  {
    id: "tamarack_store",
    area: "tamarack",
    name: "Tamarack Lake General Store",
    subtitle: "1 Lakeshore Road, Tamarack Lake, San Bernardino Mountains",
    mapPin: { x: 84, y: 32 },
    secret: true,
    background: "loc.tamarack_store",
    ambience: "amb.mountain_store",
    available: { hasEvidence: "E09" },
    onMap: true,
    hotspots: [
      inspect("ts_board", "Notice board", "corkboard", { x: 0, y: 2, w: 14.5, h: 44 }, "Community notice board", "Firewood for sale, a lost beagle, a church supper, and a few business cards.", { evidence: "E14" }),
      inspect("ts_ledger", "Charge ledger on the counter", "ledger", { x: 22, y: 41, w: 13, h: 7 }, "House charge ledger", "A green clothbound ledger beside the register, open to October. Locals sign for what they take and pay at the end of the month.", { evidence: "E15" }),
      inspect("ts_payphone", "Payphone outside", "payphone", { x: 93, y: 26, w: 6, h: 18 }, "The payphone", "Through the open door, a payphone on a post by the gas pumps. The number on its card is (714) 555-0391. The gravel around it is rutted by trucks."),
      inspect("ts_papers", "Newspaper rack", "rack", { x: 0, y: 52, w: 17, h: 44 }, "Newspaper rack", "The Los Angeles Daily Star and the San Bernardino Sun. No Mariposa Bay Courier; nobody up here takes it."),
      inspect("ts_window", "Window toward the lake", "window", { x: 32.5, y: 12, w: 19.5, h: 23 }, "The lake", "Pines down to the water, a lumber mill's stack across the lake, and a dirt road climbing the far shore past a row of numbered cabins."),
    ],
  },
  {
    id: "cabin14",
    area: "tamarack",
    name: "Cabin 14",
    subtitle: "North shore road, Tamarack Lake",
    mapPin: { x: 89, y: 26 },
    secret: true,
    background: "loc.cabin14",
    ambience: "amb.cabin",
    available: { any: [{ hasEvidence: "E14" }, { hasEvidence: "E15" }, arrested] },
    onMap: true,
    hotspots: [
      person("cb_gordon", "The man at the door of Cabin 14", "gordon", { x: 36, y: 32, w: 8, h: 34 }, { not: arrested }),
      inspect("cb_van", "Something under a tarp", "van", { x: 62, y: 42, w: 26, h: 31 }, "Under the tarp", "A full-size van under a brown tarp, pulled tight and weighted with firewood. One back corner has slipped: dark blue paint, and a California plate, 2KXL418.", { textAfter: [{ requires: arrested, text: "Sheriff's tape around the place where the van stood. It has been towed to the county yard." }] }),
      inspect("cb_window", "Back window", "window", { x: 12, y: 34, w: 7.5, h: 19 }, "The back window", "On the side of the cabin, one window is covered from the inside with a sheet of plywood. The others have curtains."),
      inspect("cb_antenna", "Antenna on the roof", "antenna", { x: 35, y: 2, w: 23, h: 28 }, "The roof", "An oversized television antenna and a CB whip, guyed with wire. Through the open door, a workbench with a soldering iron and the gutted chassis of a console television."),
      inspect("cb_woodpile", "Woodpile", "woodpile", { x: 5, y: 52, w: 13, h: 21 }, "Woodpile", "Split pine, stacked neatly. Smoke from the chimney smells of it."),
    ],
  },
  {
    id: "moss_house",
    area: "oak_terrace",
    name: "Diane Moss's House",
    subtitle: "1127 Sycamore Lane, Oak Terrace",
    mapPin: { x: 66, y: 46 },
    secret: true,
    background: "loc.moss_house",
    ambience: "amb.moss_house",
    available: { flag: "oak_terrace" },
    onMap: true,
    hotspots: [
      person("mh_diane", "Diane Moss", "diane", { x: 30, y: 26, w: 12, h: 60 }),
      inspect("mh_lamp", "Broken lamp", "lamp", { x: 72, y: 38, w: 9, h: 30 }, "The lamp", "The base of a ceramic bedside lamp, cracked through. A dark smear on one edge of it."),
      inspect("mh_gate", "Back gate", "gate", { x: 92, y: 16, w: 7, h: 24 }, "The back gate", "A wooden gate to the alley, its latch hanging. Beyond it, tire tracks in the dirt where a vehicle sat with its engine running."),
      inspect("mh_garage", "Door to the garage", "door", { x: 1, y: 4, w: 19, h: 60 }, "The garage", "The door through to the garage. Beyond it, the garage's side door to the yard: a thumb lock inside, no marks on it. Diane says she sometimes forgets to lock it after taking out the trash."),
      inspect("mh_yard", "Side yard", "yard", { x: 86, y: 41, w: 13, h: 18 }, "The side yard", "A wet concrete path by the gate. The police circled the spot where they picked up the pager in chalk; the rain has nearly washed it away."),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
