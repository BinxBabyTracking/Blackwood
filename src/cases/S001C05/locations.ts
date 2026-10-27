import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { BRIEFCASE_RECT, LAB_BOOKEND_RECT, LAB_GLASS_RECT, REGISTER_RECT, VEHICLE_RECT } from "./desk";
import { reportAvailable } from "./story";

/*
 * Scene layout for S01 C05. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art; refit every one once its painting
 * lands. No two hotspots in a scene overlap, even ones never shown together.
 *
 * Scene items follow the build contract in docs/S001C05-timeline.md. The
 * hotel is one map stop (the lobby); the ballroom, the mezzanine corridor,
 * Suite C, the security office and the back of house are sub-scenes reached
 * by their doors. The records archive is a sub-scene of the foundation.
 *
 * People hotspots follow the characters' locations and moves (contract):
 * chapter 1 at the gala, chapter 2 on at their own places.
 */

const ch2: Condition = { chapter: 2 };
const ch1Only: Condition = { not: ch2 };
const knoxHeld: Condition = { flag: "knox_held" };
/** Gabriel Knox is known (contract). His firm's office opens on the map with chapter 2 once he is. */
const knoxKnown: Condition = { any: [{ talkedTo: "porter" }, { talkedTo: "lane" }, { hasEvidence: "E001" }, { hasEvidence: "E021" }, { hasEvidence: "E022" }] };
const warrant: Condition = { flag: "marchetti_warrant" };

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

const door = (id: string, label: string, locationId: string, rect: HotspotDef["rect"], visible?: Condition): HotspotDef => ({
  id,
  label,
  kind: "doorway",
  rect,
  visible,
  interaction: { type: "travel", locationId },
});

/** Something that arrives on the office desk: shown when it arrives, gone once its evidence is collected. */
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"], sealed: string, opened?: string): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: opened ? [{ image: opened, when: { deliveryOpened: deliveryId } }, { image: sealed }] : [{ image: sealed }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  office_casefile: "art.obj_casefile",
  office_notebook: "art.obj_notebook",
  office_mail: "art.obj_mailtray",
  office_phone: "art.obj_deskphone",
  lb_knox: "art.figure_knox",
  lb_bellamy: "art.figure_bellamy",
  lb_marchetti: "art.figure_marchetti",
  lb_lane: "art.figure_lane",
  br_lockhart: "art.figure_lockhart",
  br_claudia: "art.figure_claudia",
  br_lane: "art.figure_lane",
  so_porter: "art.figure_porter",
  sc_mendes: "art.figure_mendes",
  fd_lockhart: "art.figure_lockhart",
  fd_bellamy: "art.figure_bellamy",
  oo_wexler: "art.figure_wexler",
  oh_claudia: "art.figure_claudia",
  mo_marchetti: "art.figure_marchetti",
  ko_knox: "art.figure_knox",
  po_caruso: "art.figure_caruso",
  po_knox: "art.figure_knox",
};

const CALLS = ["call_lockhart_records", "call_wexler", "call_bennett_lawyer", "call_caruso_jfk", "call_caruso_briefcase", "call_donovan", "call_caruso_warrant", "call_bennett_board"];
const DELIVERIES = ["lab_glass", "lab_bookend", "lockhart_register", "knox_vehicle", "briefcase"];
const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] };

export const locations: LocationDef[] = [
  // -------------------------------------------------------------------------
  // L01 The Pittsburgh field office (hub)
  // -------------------------------------------------------------------------
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 8, y: 10 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file: Nathaniel Ogden", "folder", { x: 27, y: 66, w: 15, h: 22 }, "casefile"),
      deskItem("office_lab_glass", "Lab report: the whiskey glass", "lab_glass", "E005", LAB_GLASS_RECT, "obj.labfolder"),
      deskItem("office_lab_bookend", "Lab report: the bookend and the briefcase", "lab_bookend", "E032", LAB_BOOKEND_RECT, "obj.labfolder"),
      deskItem("office_register", "Envelope from the Lockhart Foundation", "lockhart_register", "E033", REGISTER_RECT, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_vehicle", "Envelope from Det. Caruso", "knox_vehicle", "E024", VEHICLE_RECT, "obj.police_envelope"),
      deskItem("office_briefcase", "Property invoice, unit 3C-27", "briefcase", "E031", BRIEFCASE_RECT, "obj.property_envelope"),
      {
        ...panel("office_board", "Murder board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      {
        ...panel("office_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"),
        attention: { any: CALLS.map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      panel("office_map", "Map of Manhattan and Queens", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", {
        any: DELIVERIES.map((d) => ({ deliveryOpened: d })),
      }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "December over the Point, and the first snow of the week going gray on the bridges. Three hundred and seventy miles east, the case is in Manhattan. The board, the desk and the lab reports are here.",
      ),
      {
        ...panel("office_report", "Final report", "sprite", { x: 82, y: 72, w: 16, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
      {
        // The series' rolling board, wheeled in when S01 C01 closed. Always here from now on.
        ...panel("office_rolling", "Rolling board", "sprite", { x: 68, y: 44, w: 13, h: 26 }, "rolling"),
        sprite: [{ image: "obj.rolling_board" }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L02 The Belgrave Grand, lobby (the hotel's map stop)
  // -------------------------------------------------------------------------
  {
    id: "lobby",
    area: "midtown",
    name: "Belgrave Grand Hotel",
    subtitle: "The lobby, Park Avenue at East 53rd Street, Manhattan",
    mapPin: { x: 55, y: 58 },
    mapTag: "CRIME SCENE",
    background: "loc.lobby",
    ambience: "amb.lobby",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "lb_signage",
        "Gala signage",
        "sign",
        { x: 2, y: 30, w: 10, h: 22 },
        "The gala sign",
        "A brass easel by the ballroom doors, white card in a gilt frame: THE LOCKHART FOUNDATION WINTER GALA. Thursday, December 20. Reception 6:30. Dinner 7:30. Remarks by Dr. Evelyn Lockhart, 9:30. Under it, in smaller script: \"For the children of New York, and the work still to do.\"",
      ),
      person("lb_marchetti", "A woman in a black dress with a phone, by the columns", "marchetti", { x: 14, y: 24, w: 10, h: 62 }, ch1Only),
      person("lb_bellamy", "A man with reading glasses and a program, on a bench", "bellamy", { x: 26, y: 24, w: 10, h: 62 }, ch1Only),
      inspect(
        "lb_seating",
        "Seating chart",
        "corkboard",
        { x: 38, y: 30, w: 10, h: 18 },
        "The seating chart",
        "A long framed board of forty round tables, names in calligraphy. Table 1: Dr. Evelyn Lockhart and the foundation's board. Table 4, near the stage: Mr. and Mrs. Nathaniel Ogden, with four other couples. Table 9: Ms. Elena Marchetti, Mr. Lionel Bellamy. Your own name is at table 2, a guest of the chair.",
      ),
      door("lb_to_ballroom", "The Grand Ballroom", "ballroom", { x: 38, y: 54, w: 12, h: 40 }),
      person("lb_knox", "The event security lead, by the doors", "knox", { x: 52, y: 24, w: 10, h: 62 }, { all: [ch1Only, { not: knoxHeld }] }),
      person("lb_lane", "Victoria Lane, at the event office door", "lane", { x: 64, y: 26, w: 10, h: 60 }, ch2),
      door("lb_to_security", "Hotel security office", "security_office", { x: 76, y: 20, w: 10, h: 56 }),
      inspect(
        "lb_window",
        "Doors to Park Avenue",
        "window",
        { x: 88, y: 4, w: 11, h: 30 },
        "Park Avenue",
        "Through the revolving doors, Park Avenue in the cold: two NYPD cruisers at the curb with their lights turning, a line of black cars waiting for guests who are not allowed to leave yet, and the Christmas trees down the median strung with white lights.",
        { textAfter: [{ requires: ch2, text: "Park Avenue in daylight, the trees down the median still lit. The cruisers are gone. A doorman sweeps salt off the steps as if nothing happened here." }] },
      ),
      inspect(
        "lb_desk",
        "Front desk",
        "desk",
        { x: 88, y: 50, w: 11, h: 20 },
        "The front desk",
        "A long marble desk under a gilt clock. The night manager is on two phones at once. A printed card on the counter: PRIVATE EVENT IN THE GRAND BALLROOM THIS EVENING. WE APOLOGIZE FOR ANY INCONVENIENCE.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L03 The Grand Ballroom (sub-scene of the lobby)
  // -------------------------------------------------------------------------
  {
    id: "ballroom",
    area: "midtown",
    name: "The Grand Ballroom",
    subtitle: "Belgrave Grand Hotel, main floor",
    background: { env: "ballroom", states: { A: "loc.ballroom", B: "loc.ballroom_cleared" } },
    ambience: "amb.ballroom",
    available: { always: true },
    onMap: false,
    hotspots: [
      inspect(
        "br_displays",
        "The charity displays",
        "photo",
        { x: 2, y: 10, w: 12, h: 40 },
        "The foundation's displays",
        "Tall framed panels along the wall, one for each program: a reading room in a Bronx school, a community lender's storefront in Brownsville, a hospital lab with a new sequencer. Small brass plates: \"A grant of the Lockhart Foundation.\" The photographs are good, and the work in them looks real.",
      ),
      person("br_lockhart", "Dr. Evelyn Lockhart", "lockhart", { x: 16, y: 24, w: 10, h: 62 }, ch1Only),
      inspect(
        "br_stage",
        "The stage",
        "stage",
        { x: 28, y: 4, w: 30, h: 26 },
        "The stage",
        "A low stage hung with deep blue velvet, a lectern with the foundation's crest, the auctioneer's stand pushed to one side. Four hundred chairs face it. From the stage you can see every table in the room, and nobody at any of them can see the mezzanine stairs behind the service screens.",
        { textAfter: [{ requires: ch2, text: "The velvet is down and folded. The lectern has gone back to wherever lecterns go. A man on a ladder is unhooking the lights." }] },
      ),
      person("br_claudia", "Claudia Ogden, at table 4", "claudia", { x: 30, y: 34, w: 10, h: 56 }, ch1Only),
      inspect(
        "br_table4",
        "Table 4",
        "desk",
        { x: 42, y: 58, w: 14, h: 14 },
        "Table 4",
        "Ten places near the stage. At one of them, a dessert nobody touched, a chocolate dome going soft under its gold leaf, and the place card: MR. NATHANIEL OGDEN. A pale gray wrap is folded over the back of the next chair. On the cloth between them, the faint ring where a glass stood.",
        { textAfter: [{ requires: ch2, text: "The table is stripped to the bare wood. Somebody has left the place cards in a neat stack for the foundation, MR. NATHANIEL OGDEN on top." }] },
      ),
      person("br_lane", "Victoria Lane", "lane", { x: 58, y: 30, w: 10, h: 58 }, ch1Only),
      door("br_stairs", "Stairs to the mezzanine", "conf_corridor", { x: 72, y: 10, w: 12, h: 60 }),
      door("br_to_lobby", "Back to the lobby", "lobby", { x: 86, y: 30, w: 13, h: 62 }),
      panel("br_casefile", "Det. Caruso's notes and Bennett's file, on your phone", "phone", { x: 2, y: 72, w: 12, h: 18 }, "casefile"),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 The mezzanine conference corridor (sub-scene of the ballroom)
  // -------------------------------------------------------------------------
  {
    id: "conf_corridor",
    area: "midtown",
    name: "Mezzanine Conference Corridor",
    subtitle: "Belgrave Grand Hotel, mezzanine",
    background: "loc.conf_corridor",
    ambience: "amb.conf_corridor",
    available: { always: true },
    onMap: false,
    hotspots: [
      inspect(
        "cc_cam_m1",
        "Camera at the landing",
        "camera",
        { x: 2, y: 4, w: 10, h: 14 },
        "Camera M-1",
        "A small black dome on the ceiling above the top of the stairs, labeled M-1 on a strip of tape, looking straight down the corridor. Nobody comes into this corridor from the ballroom without passing under it.",
      ),
      door("cc_to_ballroom", "Stairs down to the ballroom", "ballroom", { x: 2, y: 30, w: 12, h: 60 }),
      inspect(
        "cc_pantry",
        "Mezzanine pantry door",
        "door",
        { x: 16, y: 30, w: 10, h: 40 },
        "The pantry door",
        "A swinging door with a porthole window, just off the landing: the mezzanine pantry, where servers stage trays for the private rooms. From its threshold you can see the top of the stairs and the first few yards of the corridor.",
      ),
      inspect(
        "cc_suites",
        "Suite doors A, B and D",
        "door",
        { x: 28, y: 26, w: 16, h: 30 },
        "Conference Suites A, B and D",
        "Walnut doors with brass card readers and small engraved plates: A, B, D. All three locked, all three dark. Suite D is next to C, and its reader shows red.",
      ),
      door("cc_to_suite", "Conference Suite C", "suite", { x: 46, y: 22, w: 12, h: 60 }),
      inspect(
        "cc_cam_m2",
        "Camera mid-corridor",
        "camera",
        { x: 60, y: 4, w: 12, h: 14 },
        "Camera M-2",
        "A second dome halfway along the ceiling, labeled M-2. It is not looking at the suite doors. It is looking past them, at the window bay at the far end of the corridor and the view of Park Avenue.",
      ),
      inspect(
        "cc_staff_seal",
        "Police seal on the staff door",
        "tape",
        { x: 74, y: 10, w: 12, h: 12 },
        "The staff door",
        "Sealed by NYPD Crime Scene Unit. A strip of evidence tape across the jamb of the plain door at the far end of the corridor, signed and timed. Nobody goes through it tonight.",
        { visible: ch1Only },
      ),
      door("cc_staff_door", "Staff door to the service corridor", "service_corridor", { x: 74, y: 26, w: 12, h: 60 }, ch2),
      inspect(
        "cc_window",
        "Window bay",
        "window",
        { x: 88, y: 10, w: 11, h: 40 },
        "The window bay",
        "Two armchairs and a potted palm in the bay at the end of the corridor, and below, Park Avenue. The best-watched corner of the floor, as of Thursday night.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 Conference Suite C (the crime scene, sub-scene of the corridor)
  // -------------------------------------------------------------------------
  {
    id: "suite",
    area: "midtown",
    name: "Conference Suite C",
    subtitle: "Belgrave Grand Hotel, mezzanine",
    background: "loc.suite",
    ambience: "amb.suite",
    available: { always: true },
    onMap: false,
    hotspots: [
      inspect(
        "st_credenza",
        "The credenza",
        "desk",
        { x: 2, y: 40, w: 22, h: 22 },
        "The credenza",
        "A long walnut credenza against the wall, under a framed engraving of Grand Central.",
        { evidence: "E004" },
      ),
      inspect(
        "suite_glass",
        "The whiskey glass",
        "glass",
        { x: 34, y: 40, w: 8, h: 10 },
        "The whiskey glass",
        "A heavy crystal tumbler on the table with about an inch of Scotch still in it, a numbered evidence tent beside it. The second glass sits upside down on the tray, unused. The decanter is two-thirds full. Det. Caruso's crime scene people have not bagged them yet; if you want them tested, he is the one to ask.",
      ),
      inspect(
        "st_table",
        "Conference table",
        "desk",
        { x: 28, y: 52, w: 24, h: 14 },
        "The conference table",
        "A walnut table for eight, bare except for the cocktail tray: the decanter, two tumblers, folded linen napkins. Two napkins. The banquet setup card tucked under the tray says three were laid.",
      ),
      inspect(
        "st_chair",
        "Overturned chair",
        "chair",
        { x: 56, y: 56, w: 12, h: 20 },
        "The chair",
        "One of the leather conference chairs is on its back, one arm resting on the carpet. Another has been shoved against the wall. Nothing else in the room is broken or knocked over. For a struggle, it is a tidy one.",
      ),
      inspect(
        "st_drawer",
        "Side table drawer",
        "drawer",
        { x: 62, y: 38, w: 12, h: 12 },
        "The side table",
        "A small side table by the window, its single drawer pulled all the way out. Inside: a hotel notepad and a pen. Nothing else, and nothing that could ever have been worth looking for.",
      ),
      inspect(
        "st_floor",
        "Where he lay",
        "floor",
        { x: 26, y: 72, w: 26, h: 14 },
        "Between the table and the credenza",
        "Nathaniel Ogden lies on his left side between the table and the credenza, under a sheet the medical examiner's people have drawn up to his shoulders. A gold watch shows at his wrist. His dinner jacket is buttoned. Whatever happened to him happened close to the credenza.",
        { textAfter: [{ requires: ch2, text: "The carpet between the table and the credenza, where he lay, has been cut away in two neat squares by the crime scene unit. A gold watch, a buttoned jacket: you remember both." }] },
      ),
      inspect(
        "st_wallet",
        "By the door",
        "floor",
        { x: 76, y: 60, w: 10, h: 20 },
        "By the door",
        "A numbered tent on the carpet just inside the door, where his wallet lay open and face down: cards still in it, the bill fold empty. Two steps from the door. Whoever emptied it did so on the way out.",
      ),
      door("st_to_corridor", "Back to the corridor", "conf_corridor", { x: 88, y: 10, w: 11, h: 80 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Hotel security office (sub-scene of the lobby)
  // -------------------------------------------------------------------------
  {
    id: "security_office",
    area: "midtown",
    name: "Hotel Security Office",
    subtitle: "Belgrave Grand Hotel, behind the front desk",
    background: "loc.security_office",
    ambience: "amb.security_office",
    available: { always: true },
    onMap: false,
    hotspots: [
      inspect(
        "so_monitors",
        "Bank of monitors",
        "monitor",
        { x: 2, y: 6, w: 30, h: 36 },
        "The monitors",
        "Sixteen screens in a grid: the lobby, the ballroom doors, the loading dock, the garage, two corridors on the mezzanine. The mezzanine views are labeled M-1 and M-2. On M-2, a window bay, two armchairs and a potted palm.",
      ),
      person("so_porter", "James Porter", "porter", { x: 40, y: 24, w: 12, h: 62 }),
      inspect(
        "so_printer",
        "Credential printer",
        "printer",
        { x: 60, y: 54, w: 14, h: 14 },
        "The credential printer",
        "A small card printer beside a box of blank event credentials and a ring binder of photographs, one sleeve per contractor. The access levels are chosen from a list on the screen. Mezzanine and VIP is a separate box to tick, and it needs a manager's code.",
      ),
      door("so_to_lobby", "Back to the lobby", "lobby", { x: 86, y: 20, w: 13, h: 70 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 Back of house: service corridor and Loading Dock B (chapter 2 on)
  // -------------------------------------------------------------------------
  {
    id: "service_corridor",
    area: "midtown",
    name: "Service Corridor and Loading Dock B",
    subtitle: "Belgrave Grand Hotel, back of house",
    background: "loc.service_corridor",
    ambience: "amb.service_corridor",
    available: ch2,
    onMap: false,
    hotspots: [
      door("sc_to_corridor", "Staff door to the mezzanine", "conf_corridor", { x: 2, y: 20, w: 12, h: 66 }),
      person("sc_mendes", "Olivia Mendes", "mendes", { x: 18, y: 24, w: 10, h: 62 }),
      inspect(
        "sc_elevator",
        "Service elevator 3",
        "door",
        { x: 34, y: 20, w: 14, h: 50 },
        "Service elevator 3",
        "Scuffed steel doors, a padded interior for moving banquet carts, a card reader beside the call button. From the staff door to here is thirty steps. From here to B1, and the dock, is one ride.",
      ),
      inspect(
        "sc_dock_desk",
        "The dock desk",
        "desk",
        { x: 54, y: 56, w: 16, h: 14 },
        "The dock desk",
        "A steel desk by the roll-up door of Loading Dock B, a space heater under it and a clipboard on top. The dock officer is on his break. Thursday's sheet is still on the clipboard.",
        { evidence: "E009" },
      ),
      inspect(
        "sc_vendor_lot",
        "The vendor lot",
        "road",
        { x: 74, y: 10, w: 24, h: 40 },
        "The vendor lot",
        "Through the open dock door: a gated lot off East 52nd Street, a florist's van, a linen truck, a plate reader on the gatepost. A truck parked here is out on the street in a minute, and in Queens in fifteen.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 The Lockhart Foundation, 1140 Fifth Avenue (chapter 2 on)
  // -------------------------------------------------------------------------
  {
    id: "foundation",
    area: "upper_east",
    name: "The Lockhart Foundation",
    subtitle: "1140 Fifth Avenue, New York",
    mapPin: { x: 62, y: 24 },
    background: "loc.foundation",
    ambience: "amb.foundation",
    available: ch2,
    onMap: true,
    hotspots: [
      inspect(
        "fd_shelf",
        "Annual report shelf",
        "bookshelf",
        { x: 2, y: 20, w: 14, h: 50 },
        "The annual reports",
        "Glass-fronted shelves in the reception hall: twenty years of annual reports in matching blue covers, each with a child's drawing on the front. On the shelf below, bound in the same blue, the audited financial statements, the newest at the end.",
        { evidence: "E015" },
      ),
      person("fd_lockhart", "Dr. Evelyn Lockhart, in her office", "lockhart", { x: 20, y: 22, w: 11, h: 64 }),
      inspect(
        "fd_evelyn_office",
        "Dr. Lockhart's office",
        "photo",
        { x: 34, y: 6, w: 18, h: 30 },
        "Dr. Lockhart's office",
        "Through the open double doors: a room the color of weak tea, a Hudson River painting over the fireplace, a desk with nothing on it but a pen and a single folder. On the wall by the door, framed letters from three mayors. On the desk, in a silver frame, a photograph of a girls' school in the Bronx on its opening day.",
      ),
      person("fd_bellamy", "Lionel Bellamy", "bellamy", { x: 56, y: 24, w: 11, h: 62 }),
      inspect(
        "fd_bellamy_office",
        "Bellamy's office",
        "desk",
        { x: 70, y: 52, w: 14, h: 16 },
        "The CFO's office",
        "A small office off the hall, all binders and two monitors. A grant schedule taped to the wall, every line ticked in green. A coffee mug from a 2011 auditors' conference. Lionel Bellamy keeps his desk the way he keeps his books.",
      ),
      door("fd_to_archive", "Stairs down to the records archive", "records_archive", { x: 86, y: 14, w: 13, h: 70 }, { flag: "archive_open" }),
    ],
  },

  // -------------------------------------------------------------------------
  // L13 The foundation's records archive (sub-scene of the foundation, RE04)
  // -------------------------------------------------------------------------
  {
    id: "records_archive",
    area: "upper_east",
    name: "Foundation Records Archive",
    subtitle: "Lower level, 1140 Fifth Avenue",
    background: "loc.records_archive",
    ambience: "amb.records_archive",
    available: { flag: "archive_open" },
    onMap: false,
    hotspots: [
      inspect(
        "ra_compliance",
        "Bank compliance box",
        "box",
        { x: 2, y: 50, w: 14, h: 16 },
        "The compliance box",
        "A gray archive box on the bottom shelf of the first rack, its label typed: LEP: GP ANNUAL COMPLIANCE PACKAGE, 2018.",
        { evidence: "E013" },
      ),
      inspect(
        "ra_subscription",
        "Subscription binder",
        "binder",
        { x: 18, y: 26, w: 12, h: 18 },
        "The subscription binder",
        "A black binder with a faded spine: HALVARD HOLDINGS LLC. SUBSCRIPTION, 2009. It has not been opened in a long time; the rings are stiff.",
        { evidence: "E014" },
      ),
      inspect(
        "ra_gp_report",
        "GP annual report",
        "binder",
        { x: 32, y: 26, w: 12, h: 18 },
        "The general partner's report",
        "A spiral-bound report on heavy paper: FIFTH AVENUE ENDOWMENT GP LLC. ANNUAL REPORT TO LIMITED PARTNERS, 2017. The schedules are at the back.",
        { evidence: "E017" },
      ),
      inspect(
        "ra_tax",
        "Tax files",
        "filing",
        { x: 50, y: 20, w: 14, h: 46 },
        "The tax files",
        "A steel cabinet of tax returns by year, each drawer with its own index card. The 2017 drawer has a red folder near the front: 990-T SUPPORT: LEP LOOK-THROUGH.",
        { evidence: "E034" },
      ),
      inspect(
        "ra_minutes",
        "Minutes binder",
        "binder",
        { x: 68, y: 26, w: 12, h: 18 },
        "The committee minutes",
        "A row of binders, one for each year, INVESTMENT COMMITTEE MINUTES. The 2009 binder sits a little proud of the others.",
        { evidence: "E042" },
      ),
      door("ra_to_foundation", "Back upstairs", "foundation", { x: 86, y: 14, w: 13, h: 76 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 Ogden Fiduciary Partners (chapter 3 on)
  // -------------------------------------------------------------------------
  {
    id: "ogden_office",
    area: "midtown",
    name: "Ogden Fiduciary Partners",
    subtitle: "31st floor, 1185 Sixth Avenue, Manhattan",
    mapPin: { x: 43, y: 60 },
    background: "loc.ogden_office",
    ambience: "amb.ogden_office",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      inspect(
        "oo_drafting",
        "Drafting board by the window",
        "desk",
        { x: 2, y: 10, w: 18, h: 40 },
        "The drafting board",
        "An old-fashioned tilting drafting board by the window, the kind architects used to have, with a sheet of graph paper taped to it at the corners.",
        { evidence: "E012" },
      ),
      person("oo_wexler", "Simon Wexler", "wexler", { x: 24, y: 24, w: 10, h: 62 }),
      inspect(
        "oo_desk",
        "Nathaniel's desk",
        "drawer",
        { x: 38, y: 58, w: 16, h: 12 },
        "Nathaniel's desk",
        "A plain oak desk, a green-shaded lamp, a fountain pen in a tray. The left drawer sticks, then gives.",
        { evidence: "E011" },
      ),
      inspect(
        "oo_diploma",
        "His father's diploma",
        "photo",
        { x: 58, y: 8, w: 12, h: 18 },
        "The diploma",
        "A framed diploma on the wall above the desk: Columbia, Bachelor of Science, 1958, in the name of Nathaniel's father. The frame sits a quarter inch off the wall at the bottom. You lift it down and turn it over.",
        { evidence: "E020", visible: { flag: "backup_known" } },
      ),
      inspect(
        "oo_shelves",
        "Bookshelves",
        "bookshelf",
        { x: 74, y: 10, w: 24, h: 44 },
        "The shelves",
        "Graham and Dodd, three editions. Bound annual reports of a dozen foundations. A photograph of Nathaniel and Claudia on a sailboat, both squinting into the sun. The shelves of a man who read the footnotes.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 The Ogdens' apartment (chapter 2 on)
  // -------------------------------------------------------------------------
  {
    id: "ogden_home",
    area: "upper_west",
    name: "The Ogdens' Apartment",
    subtitle: "312 West 87th Street, Apt. 4, Upper West Side",
    mapPin: { x: 36, y: 30 },
    background: "loc.ogden_home",
    ambience: "amb.ogden_home",
    available: ch2,
    onMap: true,
    hotspots: [
      inspect(
        "oh_window",
        "Window on West 87th Street",
        "window",
        { x: 2, y: 6, w: 18, h: 34 },
        "West 87th Street",
        "Brownstone stoops and bare ginkgo trees, a doorman across the street hosing down the sidewalk. A neighbor has left a pot of white flowers on the Ogdens' landing with no card.",
      ),
      person("oh_claudia", "Claudia Ogden", "claudia", { x: 24, y: 24, w: 10, h: 62 }),
      inspect(
        "oh_study",
        "Nathaniel's study desk",
        "desk",
        { x: 40, y: 54, w: 16, h: 14 },
        "The study desk",
        "A small study off the living room, the door left open. On the desk, squared to the edge of the blotter, a single typed memorandum in a clear sleeve, as if he meant to take it with him and changed his mind.",
        { evidence: "E019" },
      ),
      inspect(
        "oh_photos",
        "Photographs on the piano",
        "photo",
        { x: 62, y: 20, w: 16, h: 20 },
        "The photographs",
        "A wedding picture from 1986, both of them laughing at something outside the frame. Beside it, Nathaniel holding up a new brown leather briefcase with brass corners, a ribbon still on its handle. Tucked in the corner of the frame, in Claudia's hand: \"Twenty-five years. 2011.\"",
      ),
      inspect(
        "oh_coats",
        "The hall closet",
        "door",
        { x: 82, y: 20, w: 16, h: 56 },
        "The hall closet",
        "His overcoat, his umbrella, a pair of galoshes. On the shelf above, an empty space the shape of a briefcase, and the dust around it.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L11 Marchetti Law Group (chapter 2 on; under warrant after D09)
  // -------------------------------------------------------------------------
  {
    id: "marchetti_office",
    area: "midtown",
    name: "Marchetti Law Group",
    subtitle: "27th floor, 600 Lexington Avenue, Manhattan",
    mapPin: { x: 62, y: 52 },
    background: "loc.marchetti_office",
    ambience: "amb.marchetti_office",
    available: ch2,
    onMap: true,
    hotspots: [
      inspect(
        "mo_reception",
        "Reception",
        "desk",
        { x: 2, y: 50, w: 16, h: 16 },
        "Reception",
        "A white marble reception counter and one orchid. The paralegal's desk behind it has a nameplate, J. HADDAD, and a coat still on the chair.",
        { textAfter: [{ requires: warrant, text: "The reception counter is covered in NYPD evidence boxes. Joyce Haddad's chair is empty, her coat gone." }] },
      ),
      person("mo_marchetti", "Elena Marchetti", "marchetti", { x: 22, y: 24, w: 10, h: 62 }),
      inspect(
        "mo_window",
        "Window on Lexington",
        "window",
        { x: 36, y: 4, w: 24, h: 34 },
        "Lexington Avenue",
        "Twenty-seven floors up, the Chrysler Building close enough to count its windows. Two blocks west, the green copper roof of the Belgrave Grand.",
      ),
      inspect(
        "mo_message_pad",
        "Telephone message book",
        "ledger",
        { x: 40, y: 56, w: 12, h: 10 },
        "The message book",
        "Under the warrant, Det. Caruso's people go through Ms. Marchetti's desk while she watches from the doorway with her own lawyer. In the center drawer, a leather-bound telephone message book with carbon copies.",
        { evidence: "E045", visible: warrant },
      ),
      inspect(
        "mo_credenza",
        "Locked credenza",
        "filing",
        { x: 64, y: 50, w: 16, h: 20 },
        "The credenza",
        "A locked walnut credenza behind the desk. A detective with a locksmith's kit opens it in under a minute. Inside, one black binder.",
        { evidence: "E046", visible: warrant },
      ),
      inspect(
        "mo_diplomas",
        "Diplomas and photographs",
        "photo",
        { x: 84, y: 10, w: 14, h: 30 },
        "The wall",
        "Georgetown Law. Admission to the bars of New York and Delaware. A photograph of Ms. Marchetti beside Dr. Lockhart at a ribbon cutting, both in hard hats, both smiling at the same camera.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L12 Knox Protective Services, Long Island City (chapter 2 on, once Knox is known)
  // -------------------------------------------------------------------------
  {
    id: "knox_office",
    area: "queens",
    name: "Knox Protective Services",
    subtitle: "38-14 Northern Boulevard, Long Island City, Queens",
    mapPin: { x: 84, y: 56 },
    secret: true,
    background: "loc.knox_office",
    ambience: "amb.knox_office",
    available: { all: [ch2, knoxKnown] },
    onMap: true,
    hotspots: [
      inspect(
        "ko_clipboard",
        "Clipboard by the door",
        "corkboard",
        { x: 2, y: 26, w: 10, h: 16 },
        "The clipboard",
        "A clipboard on a hook by the door, a sheet of lined paper on top in square block capitals.",
        { evidence: "E023" },
      ),
      person("ko_knox", "Gabriel Knox", "knox", { x: 16, y: 24, w: 10, h: 62 }, { not: knoxHeld }),
      inspect(
        "ko_rack",
        "Radio charging rack",
        "panel",
        { x: 30, y: 20, w: 14, h: 18 },
        "The charging rack",
        "A wall rack of twelve handheld radios in their chargers. Every light on the rack is green. Every battery is charged.",
      ),
      inspect(
        "ko_desk",
        "The desk",
        "desk",
        { x: 46, y: 56, w: 16, h: 14 },
        "The desk",
        "A metal desk with a laptop, two radio chargers and a framed photograph of a squad of soldiers in desert camouflage. Printouts under the chargers.",
        { evidence: "E025" },
      ),
      inspect(
        "ko_cabinet",
        "File cabinet",
        "filing",
        { x: 66, y: 24, w: 12, h: 44 },
        "The file cabinet",
        "A two-drawer steel cabinet, unlocked. The top drawer is clients, alphabetical. The folder under M is thin.",
        { evidence: "E027" },
      ),
      inspect(
        "ko_window",
        "Window on Northern Boulevard",
        "window",
        { x: 82, y: 6, w: 16, h: 34 },
        "Northern Boulevard",
        "Below the window, the tire shop's sign and a stack of used tires in the rain. Beyond the elevated tracks, the towers of Midtown across the river, fifteen minutes away through the tunnel.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L14 Halvard Holdings, care of Larchmont Corporate Services (secret until open)
  // -------------------------------------------------------------------------
  {
    id: "halvard_office",
    area: "midtown",
    name: "Larchmont Corporate Services",
    subtitle: "For Halvard Holdings LLC, 19th floor, 410 Madison Avenue",
    mapPin: { x: 50, y: 64 },
    secret: true,
    background: "loc.halvard_office",
    ambience: "amb.halvard_office",
    available: { any: [{ flag: "lp_demand" }, { flag: "subpoena_halvard" }] },
    onMap: true,
    hotspots: [
      inspect(
        "ho_front_desk",
        "Front desk",
        "desk",
        { x: 2, y: 50, w: 18, h: 16 },
        "Corinne Rhee's desk",
        "A corporate services office that is mostly a front desk and a wall of brass mail slots, each with a company name on a small plate. The office manager, Corinne Rhee, reads the paper you hand her twice, telephones someone, and then brings out three binders without a word. She does not offer coffee.",
      ),
      inspect(
        "ho_correspondence",
        "Correspondence file",
        "filing",
        { x: 26, y: 54, w: 14, h: 12 },
        "The correspondence file",
        "A red expanding file from the first binder, tabbed by month.",
        { evidence: "E018" },
      ),
      inspect(
        "ho_trust",
        "Trust binder",
        "binder",
        { x: 44, y: 54, w: 14, h: 12 },
        "The trust binder",
        "A slim black binder labeled CARDINAL POINT TRUST: GOVERNING INSTRUMENTS. The first tab is marked ARTICLE 4.",
        { evidence: "E035" },
      ),
      inspect(
        "ho_agreements",
        "Agreements binder",
        "binder",
        { x: 62, y: 54, w: 14, h: 12 },
        "The agreements binder",
        "A thick gray binder: HALVARD HOLDINGS LLC. MATERIAL AGREEMENTS. Flagged near the front, CLASS B.",
        { evidence: "E039" },
      ),
      inspect(
        "ho_mail_slots",
        "Wall of mail slots",
        "panel",
        { x: 30, y: 6, w: 40, h: 30 },
        "The mail slots",
        "Two hundred brass slots, two hundred companies with one address between them. HALVARD HOLDINGS LLC is on one. FIFTH AVENUE ENDOWMENT GP LLC is on the one beside it.",
      ),
      inspect(
        "ho_window",
        "Window on Madison",
        "window",
        { x: 80, y: 6, w: 18, h: 34 },
        "Madison Avenue",
        "Madison Avenue nineteen floors down, buses nose to tail in the slush. A block east, Park Avenue and the Belgrave Grand.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L15 NYPD Manhattan South Homicide
  // -------------------------------------------------------------------------
  {
    id: "police",
    area: "midtown",
    name: "NYPD Manhattan South Homicide",
    subtitle: "The squad room",
    mapPin: { x: 40, y: 86 },
    background: "loc.police",
    ambience: "amb.police",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "po_board",
        "Case board",
        "corkboard",
        { x: 0, y: 4, w: 22, h: 42 },
        "Det. Caruso's board",
        "A whiteboard with 2018-018-04417 across the top, a floor plan of the Belgrave Grand's mezzanine, and a photograph of a gold wristwatch with a question mark beside it in red marker.",
      ),
      person("po_caruso", "Det. Anthony Caruso", "caruso", { x: 30, y: 24, w: 12, h: 62 }),
      inspect(
        "po_desk",
        "Caruso's desk",
        "desk",
        { x: 46, y: 58, w: 18, h: 16 },
        "Caruso's desk",
        "Three case folders squared to the corner, a takeout coffee gone cold, a framed photograph of two teenage girls on a Coney Island boardwalk. A sticky note on the monitor: CALL THE ME BACK.",
      ),
      person("po_knox", "Gabriel Knox, in the interview room", "knox", { x: 68, y: 24, w: 12, h: 62 }, knoxHeld),
      inspect(
        "po_window",
        "Window",
        "window",
        { x: 84, y: 4, w: 14, h: 34 },
        "The window",
        "Wire glass and a radiator, and a view of the building next door. Somewhere below, a siren winds down.",
      ),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
