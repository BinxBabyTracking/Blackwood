import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { LAB_BLOOD_RECT, LAB_GLOVES_RECT, LAB_GPS_RECT, LAB_PAINT_RECT } from "./desk";
import { found, reportAvailable } from "./story";

/*
 * Scene layout for C003. Hotspot rectangles are percentages of a 16:9 frame,
 * laid out for placeholder art; refit every one once its painting lands.
 *
 * Two scenes change with the story, using condition overlays on one painting:
 * the Marsh house (A: home; B: the door open, after MID2; C: police, after MID3)
 * and the Bell Security garage (A: Unit 4 in bay 2; B: the bay empty, after RE03).
 */

const briefed: Condition = { flag: "casefile_read" };
const marshEmpty: Condition = { flag: "marsh_empty" };
const custody: Condition = { flag: "bell_custody" };

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

/** A lab report on the office desk: shown when it arrives, gone once its evidence is collected. */
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"]): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: [{ image: "obj.labfolder" }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  office_casefile: "art.obj_casefile",
  office_laptop: "art.obj_laptop",
  office_notebook: "art.obj_notebook",
  office_mail: "art.obj_mailtray",
  office_phone: "art.obj_deskphone",
  kh_rachel: "art.figure_rachel",
  mh_vivian: "art.figure_vivian",
  mh_graham: "art.figure_graham",
  ha_lena: "art.figure_lena",
  po_cross: "art.figure_cross",
  po_bell: "art.figure_bell_custody",
  lb_reed: "art.figure_reed",
  vo_voss: "art.figure_voss",
  bg_bell: "art.figure_bell",
  sy_shaw: "art.figure_shaw",
  an_owen: "art.figure_owen",
  kh_envelope: "art.obj_envelope",
};

const anyDeliveryOpened: Condition = { any: ["lab_blood", "lab_gps", "lab_paint", "lab_gloves"].map((d) => ({ deliveryOpened: d })) };

export const locations: LocationDef[] = [
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 92, y: 8 },
    mapTag: "PITTSBURGH, 40 MI",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Police file from Rachel", "folder", { x: 28, y: 66, w: 18, h: 22 }, "casefile"),
      deskItem("office_lab_blood", "Lab report: the Marsh door frame", "lab_blood", "E20", LAB_BLOOD_RECT),
      deskItem("office_lab_gps", "Lab report: Unit 4's tracker", "lab_gps", "E22", LAB_GPS_RECT),
      deskItem("office_lab_paint", "Lab report: paint comparison", "lab_paint", "E27", LAB_PAINT_RECT),
      deskItem("office_lab_gloves", "Lab report: the gloves", "lab_gloves", "E32", LAB_GLOVES_RECT),
      {
        ...panel("office_board", "Murder board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] },
        callout: { text: "Tap here to connect your evidence", when: { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] } },
      },
      {
        ...panel("office_phone", "Desk phone", "phone", { x: 2, y: 62, w: 13, h: 18 }, "phone"),
        attention: { any: ["call_lena", "call_rachel_envelope", "call_vivian", "call_cross_found", "call_reed_paint", "call_warning", "call_cross_search", "call_bennett_board"].map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 16, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("office_map", "Street map of Bellwether", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: { all: [briefed, { not: { inspected: "office_map" } }] },
        callout: { text: "Tap here to travel", when: { all: [briefed, { not: { inspected: "office_map" } }] } },
      },
      panel("office_laptop", "Laptop", "laptop", { x: 74, y: 70, w: 20, h: 24 }, "laptop", briefed),
      panel("office_mail", "Printed lab reports", "tray", { x: 66, y: 66, w: 9, h: 10 }, "delivery", anyDeliveryOpened),
      inspect("office_window", "Window", "window", { x: 40, y: 2, w: 26, h: 40 }, "The window", "Rain on the glass. Eleven floors down, the Monongahela is the color of slate, and a barge is pushing coal toward the Point."),
      {
        ...panel("office_report", "Final report", "sprite", { x: 52, y: 74, w: 18, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
    ],
  },
  {
    id: "alder_street",
    area: "alder",
    name: "Alder Street",
    subtitle: "Outside 412 Alder Street, Bellwether",
    mapTag: "CRIME SCENE",
    mapPin: { x: 38, y: 56 },
    background: "loc.alder_street",
    ambience: "amb.alder_street",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "as_oak",
        "The oak",
        "tree",
        { x: 30, y: 18, w: 18, h: 56 },
        "The oak outside 412",
        "Fresh bark has grown over a pale gash at bumper height. At its foot: candles in jars, a laminated photo of Jenna and Ethan, a stuffed rabbit soaked by the rain. You hold up the police photo set from the file and line it up with the street.",
        { evidence: "E01" },
      ),
      inspect("as_hedge", "Hedge roots under the tree", "hedge", { x: 46, y: 66, w: 14, h: 14 }, "The hedge roots", "Something black and curved is wedged deep in the roots of the hedge beside the oak, under six weeks of leaves.", { evidence: "E05" }),
      inspect("as_porch", "Steps of 409, across the street", "porch", { x: 72, y: 34, w: 12, h: 30 }, "The Marshes' porch steps", "You stand on the bottom step of 409 Alder Street, where Vivian Marsh stood that night, and take a photograph at a woman's eye level.", { evidence: "E07" }),
      inspect("as_skids", "Skid marks", "road", { x: 52, y: 78, w: 30, h: 12 }, "Skid marks", "Faint black arcs on the asphalt, most of the way gone after six weeks of rain. They start well east of the tree, swing right, then run straight into it."),
      inspect("as_bend", "The bend, east of the tree", "road", { x: 84, y: 50, w: 16, h: 30 }, "The bend", "Past the Hallorans' privet hedge the road bends out of sight. In the gutter, crumbs of window glass catch the light. This is where the second car came alongside."),
      inspect("as_halloran", "The Hallorans' hedge", "hedge", { x: 86, y: 24, w: 14, h: 30 }, "The Hallorans' hedge", "Tall, thick privet along the front of 405. From the Marshes' steps it hides everything beyond the bend."),
      door("as_to_marsh", "409 Alder Street", "marsh_house", { x: 66, y: 20, w: 8, h: 30 }),
    ],
  },
  {
    id: "marsh_house",
    area: "alder",
    name: "The Marsh House",
    subtitle: "409 Alder Street, Bellwether",
    // The same room: at home before Vivian's call; the door open and the lamp down from that night on.
    background: { env: "marsh_house", states: { A: "loc.marsh_house", B: "loc.marsh_house_after", C: "loc.marsh_house_after" } },
    ambience: "amb.marsh_house",
    available: briefed,
    onMap: false,
    hotspots: [
      person("mh_vivian", "Vivian Marsh", "vivian", { x: 3, y: 23, w: 15, h: 75 }, { not: { event: "MID1" } }),
      person("mh_graham", "Graham Marsh", "graham", { x: 68, y: 19, w: 15, h: 77 }, { not: { event: "MID1" } }),
      inspect("mh_window", "Front window", "window", { x: 9, y: 12, w: 7, h: 36 }, "The front window", "Across the street, the oak outside 412 and its little shrine of candles. From this window you can see the tree, and nothing past the Hallorans' hedge.", {
        textAfter: [{ requires: marshEmpty, text: "Across the street, the oak and its candles. The street is empty. Graham's car is in the drive, wet with rain." }],
      }),
      inspect("mh_photos", "School photos on the stairs", "photo", { x: 88, y: 0, w: 12, h: 26 }, "Photographs", "Years of school staff photos, Vivian in the front row of each, and one of Graham in a hard hat beside a surveyor's tripod, squinting into the sun."),
      inspect("mh_fridge", "Kitchen", "calendar", { x: 52, y: 10, w: 18, h: 48 }, "The kitchen", "A school district calendar on the fridge, a bowl of apples, a stack of grading. The kind of kitchen where people sit down to dinner at six.", { visible: { not: marshEmpty } }),
      inspect("mh_door", "The front door, standing open", "door", { x: 17, y: 10, w: 13, h: 56 }, "The front door", "The door is open about a foot. The porch light is on. You stop on the threshold and photograph the hall before you touch anything.", { evidence: "E19", visible: marshEmpty }),
      inspect("mh_lamp", "Hall lamp", "lamp", { x: 30, y: 30, w: 14, h: 26 }, "The hall lamp", "A ceramic lamp on its side on the runner, its shade crushed flat, as if someone fell against the table it stood on.", { visible: marshEmpty }),
      inspect("mh_reading_glasses", "Reading glasses on the floor", "glass", { x: 66, y: 86, w: 7, h: 6 }, "Reading glasses", "Vivian's reading glasses, on the runner near the stairs, one arm bent back.", { visible: marshEmpty }),
      inspect("mh_calendar", "Calendar on the fridge", "calendar", { x: 52, y: 22, w: 9, h: 18 }, "The calendar", "The school district calendar, turned to October. There is writing on today's square.", { evidence: "E17", visible: marshEmpty }),
      inspect("mh_notebook", "Notebook on the kitchen table", "notebook", { x: 63, y: 44, w: 8, h: 10 }, "Vivian's notebook", "A composition notebook beside a cold cup of tea, left open, with a pen in the fold.", { evidence: "E18", visible: marshEmpty }),
      inspect("mh_laptop", "Laptop on the dining table", "laptop", { x: 42, y: 61, w: 12, h: 8 }, "The laptop", "Vivian's school laptop, open, the screen still awake. An email is open in drafts.", { evidence: "E24", visible: marshEmpty }),
      inspect("mh_tv", "Television", "tv", { x: 0, y: 37, w: 13, h: 23 }, "The television", "The evening news, sound low, to an empty room.", { visible: marshEmpty }),
      // Out through the front door while the house is lived in; once the door stands open it is a thing to look at, and the way out is the hall floor.
      { ...door("mh_to_street", "Alder Street", "alder_street", { x: 17, y: 10, w: 13, h: 56 }), visible: { not: marshEmpty } },
      { ...door("mh_to_street_after", "Alder Street", "alder_street", { x: 0, y: 86, w: 14, h: 14 }), visible: marshEmpty },
    ],
  },
  {
    id: "police",
    area: "downtown",
    name: "Bellwether Police Department",
    subtitle: "Detective bureau, Market Street",
    mapPin: { x: 52, y: 40 },
    background: "loc.police",
    ambience: "amb.police",
    available: briefed,
    onMap: true,
    hotspots: [
      person("po_cross", "Det. Helen Cross", "cross", { x: 35, y: 24, w: 12, h: 56 }),
      person("po_bell", "Marcus Bell, in an interview room", "bell", { x: 55, y: 22, w: 7, h: 30 }, custody),
      inspect("po_board", "Case board", "corkboard", { x: 0, y: 4, w: 32, h: 40 }, "Det. Cross's case board", "Photos of the CR-V, a street map of Alder with two X's, a printout of the Hart's receipt, and a sticky note in Cross's hand: 'Why leave the wallets?'", {
        textAfter: [{ requires: found, text: "A second board has gone up beside the first: 409 Alder Street, a map of River Road, two school photos. Cross has drawn a line in red marker between the two boards." }],
      }),
      inspect("po_impound", "Window over the impound lot", "window", { x: 68, y: 12, w: 32, h: 36 }, "The impound lot", "Through the blinds, the silver CR-V under a blue tarp, its left side to the window. Even from here you can see the dent in the rear quarter."),
      inspect("po_desk", "Cross's desk", "desk", { x: 55, y: 58, w: 45, h: 40 }, "Cross's desk", "Two binders marked 18-09-1147, a cold coffee, and a child's drawing of a horse taped to the monitor. 'My niece,' Cross says, when she sees you looking."),
    ],
  },
  {
    id: "harts",
    area: "alder",
    name: "Hart's Quick Stop",
    subtitle: "1820 Furnace Street, Bellwether",
    mapPin: { x: 30, y: 50 },
    background: "loc.harts",
    ambience: "amb.harts",
    available: briefed,
    onMap: true,
    hotspots: [
      { ...person("ha_lena", "Lena Ortiz, behind the counter", "lena", { x: 45.1, y: 30.3, w: 10.2, h: 50 }), behind: 55.5 },
      inspect("ha_monitor", "Camera monitor in the back office", "tv", { x: 69, y: 31, w: 11, h: 17 }, "The camera monitor", "Through the back office door, a monitor split into four views. Lena has saved the September 14 clip to the desktop and left it ready for you.", { evidence: "E04" }),
      inspect("ha_pumps", "Pump 3", "pump", { x: 11, y: 30, w: 10, h: 22 }, "Pump 3", "Through the front windows, pump 3, under the canopy lights. Beyond them, at the far edge of the lot, the light runs out."),
      inspect("ha_lot", "The far side of the lot", "lot", { x: 0, y: 32, w: 11, h: 16 }, "The far side of the lot", "A dark strip of asphalt past the pump lights, next to the dumpster. A car parked there nose out could watch every pump and leave in either direction."),
      inspect("ha_counter", "Cigarette rack", "rack", { x: 30, y: 10, w: 33, h: 20 }, "Behind the counter", "Cigarettes, lottery tickets, phone chargers. A sign by the register: 'Cash under $5, please.'"),
    ],
  },
  {
    id: "kowalski_house",
    area: "linden",
    name: "The Kowalski House",
    subtitle: "27 Linden Court, Bellwether",
    mapPin: { x: 62, y: 66 },
    background: "loc.kowalski_house",
    ambience: "amb.kowalski_house",
    available: briefed,
    onMap: true,
    hotspots: [
      person("kh_rachel", "Rachel Kowalski", "rachel", { x: 30, y: 24, w: 12, h: 62 }),
      inspect("kh_box", "Box of Ethan's things", "box", { x: 64, y: 62, w: 14, h: 14 }, "Ethan's things", "A cardboard box the police returned: his work boots, a Steelers mug, a phone charger, a pocket notepad with a Kessel Electric logo.", { evidence: "E09" }),
      inspect("kh_envelope", "Hall desk drawer", "drawer", { x: 84, y: 40, w: 12, h: 14 }, "The hall desk", "In the top drawer, under a pile of takeout menus, a brown envelope with RACHEL written on it in Ethan's hand.", { evidence: "E15", visible: { event: "RE02" } }),
      inspect("kh_fridge", "Drawings on the fridge", "photo", { x: 48, y: 14, w: 12, h: 24 }, "The fridge", "Crayon drawings held up by magnets: a horse with a carnival ribbon, a house with three people and a very large sun. Underneath, in an adult's hand: 'SOPHIE, AGE 5.'"),
      inspect("kh_photo", "Photo on the shelf", "photo", { x: 2, y: 20, w: 10, h: 18 }, "A photograph", "Jenna and Ethan at a lake, with a toddler between them on Ethan's shoulders. They look like friends."),
      inspect("kh_window", "Window", "window", { x: 14, y: 2, w: 16, h: 36 }, "The window", "A swing set in a small wet yard. One swing moves a little in the wind."),
    ],
  },
  {
    id: "voss_office",
    area: "downtown",
    name: "Bellwether Redevelopment Group",
    subtitle: "300 Front Street, Bellwether",
    mapPin: { x: 58, y: 34 },
    secret: true,
    background: "loc.voss_office",
    ambience: "amb.voss_office",
    available: { hasEvidence: "E09" },
    onMap: true,
    hotspots: [
      person("vo_voss", "Caleb Voss", "voss", { x: 38, y: 24, w: 12, h: 62 }),
      inspect("vo_binder", "Project binder on the conference table", "binder", { x: 54, y: 58, w: 14, h: 10 }, "The project binder", "A thick binder labeled RIVERSIDE COMMONS, tabbed by permit. One tab reads 'Approvals, as filed with city portal.'", { evidence: "E11" }),
      inspect("vo_ledger", "Bookkeeper's desk", "ledger", { x: 2, y: 54, w: 16, h: 12 }, "The bookkeeper's desk", "The bookkeeper is at lunch. Her screen is locked, but a printout of vendor payments is face up in her tray.", { evidence: "E13" }),
      inspect("vo_tray", "Invoice tray", "tray", { x: 18, y: 50, w: 10, h: 8 }, "The invoice tray", "Vendor invoices waiting to be filed. A stack of them are from Bell Security Services.", { evidence: "E14" }),
      inspect("vo_credenza", "Bank folder in the credenza", "filing", { x: 80, y: 44, w: 16, h: 18 }, "The credenza", "A bank folder, half out of the credenza drawer. Wire confirmations, September.", { evidence: "E30", visible: { all: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }] } }),
      inspect("vo_rendering", "Architect's rendering", "photo", { x: 60, y: 6, w: 30, h: 30 }, "Riverside Commons", "A framed rendering: rows of townhouses on the river, a playground, a pocket park where the old plating works stood. 'RIVERSIDE COMMONS. 212 HOMES. PHASE I SPRING 2019.'"),
    ],
  },
  {
    id: "bell_garage",
    area: "mill",
    name: "Bell Security Services",
    subtitle: "Garage and office, 1150 Mill Road",
    mapPin: { x: 70, y: 48 },
    secret: true,
    background: "loc.bell_garage",
    ambience: "amb.bell_garage",
    available: { any: [{ hasEvidence: "E13" }, { hasEvidence: "E14" }] },
    onMap: true,
    hotspots: [
      person("bg_bell", "Marcus Bell", "bell", { x: 30, y: 24, w: 12, h: 62 }, { not: custody }),
      {
        ...inspect("bg_unit4", "Dark gray SUV in bay 2", "suv", { x: 50, y: 34, w: 30, h: 36 }, "Unit 4", "A dark gray Ford Explorer, 'BELL SECURITY' and 'UNIT 4' on the hatch, a black roof rack, a small amber strobe on the left of the dashboard. The black trim on the right front wheel arch is newer and less weathered than on the other three.", { visible: { env: "bell_garage", is: "A" } }),
        sprite: [{ image: "obj.unit4" }],
      },
      inspect("bg_bay_empty", "Bay 2", "floor", { x: 50, y: 34, w: 30, h: 36 }, "Bay 2", "Bay 2 is empty. An oil stain on the concrete where Unit 4 stood.", {
        visible: { env: "bell_garage", is: "B" },
        textAfter: [{ requires: found, text: "Bay 2 is empty. An oil stain on the concrete where Unit 4 stood. Unit 4 is in a police garage now." }],
      }),
      inspect("bg_fleet", "Fleet board", "corkboard", { x: 0, y: 6, w: 20, h: 40 }, "The fleet board", "A whiteboard with the fleet list and a printed duty roster for October, marked up in red marker.", { evidence: "E25" }),
      inspect("bg_repair", "Repair file in the office", "filing", { x: 84, y: 30, w: 14, h: 26 }, "The repair file", "Through the office door, a folder of vehicle repair invoices, newest on top.", { evidence: "E26" }),
      inspect("bg_magnet", "Magnet on the fridge", "photo", { x: 86, y: 8, w: 8, h: 10 }, "The fridge", "Pizza menus and a magnet: SHAW TOWING AND RECOVERY, 24 HR, ROUTE 51. A name is written under it in marker: 'TREV.'"),
      inspect("bg_strobes", "Box on the workbench", "box", { x: 20, y: 60, w: 12, h: 12 }, "The workbench", "A box of spare amber dash strobes, the kind that clip to a windshield, and a coil of wire."),
    ],
  },
  {
    id: "shaw_yard",
    area: "route51",
    name: "Shaw Towing and Recovery",
    subtitle: "4410 Route 51, Bellwether",
    mapPin: { x: 20, y: 80 },
    secret: true,
    background: "loc.shaw_yard",
    ambience: "amb.shaw_yard",
    available: { any: [{ hasEvidence: "E08" }, { inspected: "bg_magnet" }] },
    onMap: true,
    hotspots: [
      person("sy_shaw", "Trevor Shaw", "shaw", { x: 40, y: 24, w: 12, h: 62 }),
      inspect("sy_dispatch", "Dispatch computer in the trailer", "desk", { x: 70, y: 40, w: 16, h: 14 }, "The dispatch computer", "A laptop on a desk in the office trailer, logged in to the towing software. Every call, and every move the truck makes, goes into it.", { evidence: "E28" }),
      inspect("sy_truck", "The tow truck", "truck", { x: 4, y: 26, w: 30, h: 40 }, "Truck 1", "A flatbed tow truck, SHAW TOWING on the doors, a GPS antenna on the cab roof."),
      inspect("sy_rotation", "Police rotation list", "corkboard", { x: 88, y: 8, w: 10, h: 20 }, "The rotation list", "The Bellwether PD tow rotation for September, pinned to the trailer wall. Shaw Towing has the overnight on the 14th."),
    ],
  },
  {
    id: "annex",
    area: "downtown",
    name: "Municipal Records Annex",
    subtitle: "14 Court Street, Bellwether",
    mapPin: { x: 48, y: 30 },
    secret: true,
    background: "loc.annex",
    ambience: "amb.annex",
    available: { hasEvidence: "E09" },
    onMap: true,
    hotspots: [
      person("an_owen", "Owen Price, in the basement archive", "owen", { x: 70, y: 26, w: 12, h: 60 }),
      inspect("an_box", "Records box: RD-2018-044", "box", { x: 30, y: 60, w: 14, h: 12 }, "The records box", "Permit RD-2018-044, Riverside Commons. Inside, the paper filings, each with a RECEIVED stamp.", { evidence: "E10" }),
      inspect("an_drawer", "Map drawer", "drawer", { x: 46, y: 62, w: 16, h: 10 }, "The map drawer", "A wide flat-file drawer of survey sheets and plats. One folder: KERR AND LUSK, RIVERSIDE COMMONS.", { evidence: "E12" }),
      inspect("an_terminal", "Public terminal ANNEX-PUB-2", "desk", { x: 4, y: 40, w: 16, h: 20 }, "The public terminal", "An old desktop computer with a label: ANNEX-PUB-2, PUBLIC USE. On the frame of the monitor, the faint rectangle where a sticky note used to be."),
      inspect("an_signin", "Sign-in book", "ledger", { x: 22, y: 48, w: 10, h: 6 }, "The sign-in book", "This year's visitor book. The older ones are kept in the basement archive."),
    ],
  },
  {
    id: "riverside",
    area: "river",
    name: "Riverside Access Road",
    subtitle: "River Road, at the rail spur, Bellwether",
    mapTag: "CRIME SCENE",
    mapPin: { x: 80, y: 70 },
    secret: true,
    background: "loc.riverside",
    ambience: "amb.riverside",
    available: found,
    onMap: true,
    hotspots: [
      inspect("rv_suv", "The SUV behind the tape", "suv", { x: 34, y: 34, w: 30, h: 34 }, "Behind the tape", "A dark gray SUV at the end of the gravel road, beside a rusted rail spur, inside a square of police tape. An officer lets you take a photograph.", { evidence: "E21" }),
      inspect("rv_camera", "Camera on the scrapyard fence", "camera", { x: 2, y: 10, w: 10, h: 18 }, "Dudek Metals", "A camera on a pole above the scrapyard gate, pointed at River Road and the mouth of this one. The owner, Mike Dudek, prints you what it saw on Monday night.", { evidence: "E31" }),
      inspect("rv_trailer", "Site trailer at Riverside Commons", "trailer", { x: 70, y: 20, w: 26, h: 30 }, "The site trailer", "Across the field, at the edge of the Riverside Commons site, a white office trailer with a BELL SECURITY sign by the door and a dumpster behind it.", {
        textAfter: [{ requires: { flag: "search_done" }, text: "Police tape around the Bell Security trailer and the dumpster behind it. The trailer door is sealed." }],
      }),
      inspect("rv_rail", "Rail spur", "rail", { x: 0, y: 70, w: 30, h: 20 }, "The rail spur", "A rusted siding running out to nowhere. The rail crew that found the SUV was here to inspect it at seven."),
      inspect("rv_road", "The way out", "road", { x: 64, y: 70, w: 36, h: 24 }, "River Road", "One gravel road in and out, a quarter mile to River Road. It's a dead end. Anyone who walked out of here walked past the scrapyard gate."),
    ],
  },
  {
    id: "lab",
    area: "county",
    name: "Calder County Forensic Laboratory",
    subtitle: "County complex, Route 88",
    mapPin: { x: 86, y: 30 },
    background: "loc.lab",
    ambience: "amb.lab",
    available: briefed,
    onMap: true,
    hotspots: [
      person("lb_reed", "Dr. Samuel Reed", "reed", { x: 40, y: 24, w: 12, h: 62 }),
      inspect("lb_bench", "The bench", "desk", { x: 60, y: 50, w: 30, h: 16 }, "The bench", "A comparison microscope, evidence bags in neat rows, a label printer. A whiteboard reads: 'Consistent with is not the same as matches. S.R.'"),
      inspect("lb_lockers", "Evidence lockers", "filing", { x: 2, y: 20, w: 18, h: 50 }, "Evidence lockers", "Steel lockers with case numbers on tape. One reads 18-09-1147."),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
