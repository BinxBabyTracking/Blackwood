import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { LAB_BOOTS_RECT, LAB_HAND_RECT } from "./desk";
import { glennDead, trentArrested } from "./story";

/*
 * C006's thirty places. Hotspot rectangles are percentages of a 16:9 frame,
 * laid out for placeholder art; refit each once its painting lands.
 *
 * Places that change with the story use the scene's environment state:
 *   office       A, B (a pickup idles outside: RE09)
 *   sutter_home  A (Glenn at home), B (sealed by police: RE07), C (released)
 *   greer_home   A (Len at home), B (a missing person scene: RE12)
 *   trent_office A, B (sealed after the arrest: RE15)
 * Every evidence hotspot stays reachable in every later state, so nothing
 * critical can be missed for good.
 */

const briefed: Condition = { flag: "casefile_read" };
const never: Condition = { not: { always: true } };
const ch = (n: number): Condition => ({ chapter: n });
const env = (place: string, state: string): Condition => ({ env: place, is: state });

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
/** An evidence item found in a scene. */
const item = (id: string, label: string, kind: string, rect: HotspotDef["rect"], evidence: string, title: string, text: string, visible?: Condition): HotspotDef =>
  inspect(id, label, kind, rect, title, text, { evidence, visible });
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

/* Positions reused across scenes. */
const PERSON = { x: 44, y: 26, w: 14, h: 62 };
const PERSON2 = { x: 62, y: 26, w: 13, h: 62 };
const EXIT = { x: 88, y: 20, w: 11, h: 54 };

const OFFICE_DELIVERIES = ["sarah_photo", "evelyn_copies", "evelyn_expense", "denise_letters", "safe_deposit"];

export const locations: LocationDef[] = [
  // ---------------------------------------------------------------- L01
  {
    id: "office",
    area: "town",
    name: "Blackwood Field Office",
    subtitle: "Above Kovar Hardware, Second Street",
    mapPin: { x: 46, y: 44 },
    mapTag: "OFFICE",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("of_casefile", "Sarah's folder", "folder", { x: 26, y: 66, w: 16, h: 20 }, "casefile"),
      {
        ...panel("of_board", "Case board", "board", { x: 0, y: 4, w: 24, h: 44 }, "board"),
        attention: { all: [{ callAnswered: "call_board" }, { not: { boardConnections: 1 } }] },
        callout: { text: "Tap here to connect your evidence", when: { all: [{ callAnswered: "call_board" }, { not: { boardConnections: 1 } }] } },
      },
      panel("of_timeline", "Two timelines, 1996 and 2018", "board", { x: 25, y: 6, w: 22, h: 36 }, "sequence", { evidenceCount: 6 }),
      panel("of_laptop", "Laptop: the 1996 tapes", "laptop", { x: 60, y: 60, w: 14, h: 16 }, "laptop"),
      panel("of_compare", "Light table: page 41", "lamp", { x: 76, y: 56, w: 12, h: 18 }, "comparison", { all: [{ hasEvidence: "E023" }, { hasEvidence: "E032" }] }),
      {
        ...panel("of_mail", "Mail slot and in-tray", "mailtray", { x: 88, y: 60, w: 11, h: 18 }, "delivery"),
        attention: { any: OFFICE_DELIVERIES.map((d) => ({ deliveryPending: d })) },
      },
      panel("of_notebook", "Notebook", "notebook", { x: 16, y: 70, w: 9, h: 14 }, "notebook"),
      deskItem("of_lab_boots", "Lab report: the boot print", "lab_boots", "E060", LAB_BOOTS_RECT),
      deskItem("of_lab_hand", "Lab report: the handwriting", "lab_hand", "E099", LAB_HAND_RECT),
      inspect(
        "of_window",
        "The window over Second Street",
        "window",
        { x: 50, y: 8, w: 22, h: 36 },
        "Across the street",
        "A black full-size pickup idles at the curb across Second Street, wipers going, a bar of lights on the roof. You can't see into the cab for the rain. As you lift the blind, it pulls away toward Mill Road without hurrying.",
        { visible: env("office", "B") },
      ),
    ],
  },

  // ---------------------------------------------------------------- L02
  {
    id: "mill_gate",
    area: "mill",
    name: "Hollow Creek Steel: East Gate",
    subtitle: "Mill Road, Riverside Works",
    mapPin: { x: 70, y: 66 },
    mapTag: "WHERE SHE WAS FOUND",
    background: "loc.mill_gate",
    ambience: "amb.mill",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect("mg_gate", "The East Gate", "gate", { x: 30, y: 30, w: 30, h: 50 }, "The East Gate",
        "A double chain-link gate on rusted posts, chained and padlocked, with fresh police tape woven through the mesh. A sign: \"RIVERWORKS. A Stroud Riverfront Development. Site patrolled by Trent Protective Services.\" Beyond it the East Mill buildings stand black against the sky. The Maintenance Building is the first one inside the gate.",
        { textAfter: [{ requires: ch(6), text: "The tape is gone and the gate stands open for the police. Work lights glow in the Maintenance Building." }] }),
      inspect("mg_shoulder", "The road shoulder", "road", { x: 4, y: 64, w: 22, h: 24 }, "Where a car could pull off",
        "A gravel shoulder beside the gate, wide enough for one car. Mill Road runs straight from here back toward the Corner Mart, half a mile off, its sign just visible over the trees. Anyone walking home from the store would pass right by this spot."),
      door("mg_breach", "The break in the north fence", "shop_floor", { x: 64, y: 34, w: 18, h: 44 }),
    ],
  },

  // ---------------------------------------------------------------- L04
  {
    id: "shop_floor",
    area: "mill",
    name: "East Mill Shop Floor",
    subtitle: "Maintenance Building, ground floor",
    background: "loc.shop_floor",
    ambience: "amb.mill_inside",
    available: briefed,
    onMap: false,
    hotspots: [
      item("sf_hasp", "The crib door: hasp, chain and pallets", "door", { x: 58, y: 24, w: 16, h: 56 }, "E014", "The Tool Crib 4 door", "A steel door in a steel mesh wall, the broken weld, the cut chain, the pallets. Police tags flutter from the hasp."),
      inspect("sf_bench", "A steel workbench", "bench", { x: 14, y: 52, w: 30, h: 24 }, "The workbench",
        "A heavy steel workbench against the brick wall, its front edge a strip of angle iron. A vise bolted to one end, a stripping jig still clamped in it. Drifts of cut insulation and bright copper shavings lie under it, under twenty years of dust. Somebody spent a lot of nights at this bench.",
        { textAfter: [{ requires: ch(6), text: "Police have ringed the bench with evidence tape for the reconstruction." }] }),
      inspect("sf_loft", "A ladder to the loft", "ladder", { x: 2, y: 10, w: 10, h: 54 }, "The loft ladder",
        "A fixed steel ladder runs up to a loft over the shop. Police have zip-tied a sign across the bottom rungs: \"DO NOT ENTER, UNSAFE FLOOR, HCPD.\""),
      door("sf_crib", "Into Tool Crib 4", "tool_crib", { x: 76, y: 24, w: 12, h: 56 }),
      door("sf_out", "Back to the gate", "mill_gate", EXIT),
    ],
  },

  // ---------------------------------------------------------------- L03
  {
    id: "tool_crib",
    area: "mill",
    name: "Tool Crib 4",
    subtitle: "East Mill Maintenance Building",
    background: "loc.tool_crib",
    ambience: "amb.mill_inside",
    available: briefed,
    onMap: false,
    hotspots: [
      item("tc_photos", "Police photographs pinned to the mesh", "photos", { x: 8, y: 18, w: 24, h: 34 }, "E013", "The scene as found", "Det. Mitchell has pinned copies of the scene sketch and photographs to the mesh for you."),
      inspect("tc_shelf", "The bottom shelf", "shelf", { x: 40, y: 54, w: 34, h: 22 }, "The bottom shelf",
        "Steel shelving along the brick wall, empty except for a coil of stripped copper wire, two feet across, its insulation peeled off in long curls. The dust on it is thick. Below the shelf the concrete is clean where the remains lay; the medical examiner's team swept it."),
      inspect("tc_floor", "The floor inside the door", "floor", { x: 40, y: 78, w: 30, h: 18 }, "Inside the door",
        "Concrete, scuffed by the responders' boots. No stains you can see. Ten by twelve feet of mesh and brick, one way in, no window. Whoever closed this door knew nobody would open it."),
      door("tc_out", "Back to the shop floor", "shop_floor", EXIT),
    ],
  },

  // ---------------------------------------------------------------- L05
  {
    id: "admin_building",
    area: "mill",
    name: "West End Administration Building",
    subtitle: "Riverside Works, abandoned since 2003",
    mapPin: { x: 58, y: 74 },
    background: "loc.admin_building",
    ambience: "amb.mill_inside",
    available: ch(2),
    onMap: true,
    hotspots: [
      item("ab_incidents", "Carton: \"Incidents 1995-97\"", "box", { x: 6, y: 58, w: 18, h: 22 }, "E021", "Incidents 1995-97", "A records carton, its lid soft with damp. On top, a stapled report with a press release clipped to it."),
      item("ab_rosters", "Carton: \"Rosters, West End 1996\"", "box", { x: 26, y: 60, w: 16, h: 20 }, "E025", "Rosters", "Turn rosters for 1996 in rubber-banded weeks. The week of June 10 has a tool room sign-out sheet clipped to it."),
      item("ab_gm", "Carton: \"GM Office, Files 1996\"", "box", { x: 46, y: 58, w: 18, h: 22 }, "E031", "The general manager's files", "Typed minutes in manila folders, every one initialed RS."),
      item("ab_hr", "Carton: \"HR, Confidential\"", "box", { x: 66, y: 60, w: 16, h: 20 }, "E034", "Human Resources", "Personnel files and compensation schedules. One folder is marked \"Executive, FY96.\""),
      inspect("ab_window", "The GM's office window", "window", { x: 30, y: 8, w: 30, h: 34 }, "The view from the top",
        "From the general manager's old office you can see the whole West End: the furnace sheds, the loading yard, the gate, and across the works the black roofs of the East Mill, a mile and a half off. In 1996 the East Mill was already five years dead."),
    ],
  },

  // ---------------------------------------------------------------- L06
  {
    id: "maint_office",
    area: "mill",
    name: "Former Maintenance Office",
    subtitle: "West End, behind No. 2 Reheat",
    mapPin: { x: 62, y: 80 },
    background: "loc.maint_office",
    ambience: "amb.mill_inside",
    available: ch(2),
    onMap: true,
    hotspots: [
      item("mo_ledger", "Shelf of bound logs", "shelf", { x: 6, y: 20, w: 20, h: 40 }, "E023", "The Gallery B log", "Green clothbound ledgers, one per year. \"GALLERY B, NO. 2 REHEAT, 1996\" has an OSHA copy tab at page 41."),
      item("mo_binder", "Open work orders binder", "binder", { x: 30, y: 60, w: 16, h: 18 }, "E024", "Open work orders", "A three-ring binder of work orders never closed when the plant shut. One for Gallery B has a red tag stub stapled to it."),
      item("mo_drawer", "The director's desk", "desk", { x: 50, y: 56, w: 24, h: 26 }, "E033", "The bottom drawer", "The maintenance director's steel desk. The bottom drawer sticks. Inside, a banded stack of printed bulletins."),
      inspect("mo_photo", "A framed crew photo", "frame", { x: 78, y: 20, w: 14, h: 22 }, "Maintenance department, 1995",
        "Thirty men in work clothes in front of No. 2 Reheat. A brass plate: \"Maintenance Dept., Riverside Works, 1995. G. Sutter, Director.\" Glenn Sutter stands at the end of the front row, the only man in a tie."),
    ],
  },

  // ---------------------------------------------------------------- L07
  {
    id: "loading_yard",
    area: "mill",
    name: "West End Loading Yard",
    subtitle: "The hatch to Gallery B",
    mapPin: { x: 54, y: 84 },
    background: "loc.loading_yard",
    ambience: "amb.mill",
    available: ch(2),
    onMap: true,
    hotspots: [
      item("ly_gallery", "The hatch to Gallery B", "hatch", { x: 36, y: 50, w: 26, h: 30 }, "E030", "Down into Gallery B", "You lift the steel hatch and climb down the ladder with a flashlight."),
      inspect("ly_plate", "Flowers by the hatch", "flowers", { x: 64, y: 66, w: 14, h: 18 }, "Somebody remembers",
        "A coffee can of plastic flowers wired to the hatch rail, faded nearly white. A laminated card: \"Carl, Tony, Eddie. We know. Local 2177.\""),
    ],
  },

  // ---------------------------------------------------------------- L08
  {
    id: "lasko_home",
    area: "town",
    name: "Lasko House",
    subtitle: "418 Fourth Street",
    mapPin: { x: 30, y: 30 },
    background: "loc.lasko_home",
    ambience: "amb.house",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("lh_sarah", "Sarah Lasko", "sarah", PERSON),
      item("lh_diary", "Emily's diary", "book", { x: 6, y: 62, w: 14, h: 16 }, "E003", "Emily's diary", "A spiral notebook from the box on Emily's bed."),
      item("lh_calendar", "The calendar on Emily's wall", "calendar", { x: 8, y: 14, w: 16, h: 30 }, "E004", "August 1996", "A bank calendar still on Emily's wall, turned to August. Sarah never turned the page."),
      item("lh_prints", "A photo studio envelope", "envelope", { x: 22, y: 64, w: 14, h: 14 }, "E006", "Emily's prints", "An orange Corso Photo envelope in Emily's box. Two 8x10 prints inside."),
      item("lh_pager", "A pager and an index card", "pager", { x: 70, y: 66, w: 12, h: 12 }, "E020", "Emily's pager", "A black pager with a dead battery, rubber-banded to an index card in Carol Lasko's handwriting."),
      inspect("lh_photos", "Family photographs", "frames", { x: 72, y: 12, w: 20, h: 26 }, "The Laskos",
        "Ron Lasko in a union jacket at a Labor Day picnic. Carol in an apron. Two dark-haired girls on a porch swing, the older one laughing at the camera, the younger one looking at her sister. Emily's high school graduation, June 1995."),
    ],
  },

  // ---------------------------------------------------------------- L09
  {
    id: "reeves_auto",
    area: "town",
    name: "Reeves Auto Repair",
    subtitle: "77 Water Street",
    mapPin: { x: 52, y: 58 },
    background: "loc.reeves_auto",
    ambience: "amb.garage",
    available: { any: [{ hasEvidence: "E009" }, { hasEvidence: "E003" }, { talkedTo: "sarah" }] },
    onMap: true,
    hotspots: [
      person("ra_wade", "Wade Reeves", "wade", PERSON),
      item("ra_orders", "Work order rack", "rack", { x: 72, y: 30, w: 14, h: 30 }, "E055", "This week's work orders", "A metal rack of carbon work orders by the register. One near the front is stamped PAID CASH.", glennDead),
      item("ra_invoices", "Invoice books in the loft", "books", { x: 4, y: 12, w: 16, h: 24 }, "E084", "Gus's invoice books", "Up the loft stairs, Gus Reeves's bound invoice books, a year to a book, back to 1979.", ch(5)),
      item("ra_ledger", "Parts ledgers in the loft", "books", { x: 20, y: 12, w: 14, h: 24 }, "E095", "The parts ledgers", "Beside the invoice books, the shop-use ledgers Gus kept by hand. July to September 1996 is a thin green book.", ch(6)),
      inspect("ra_gus", "A photo behind the register", "frame", { x: 88, y: 14, w: 11, h: 20 }, "Gus Reeves",
        "A heavy man in coveralls under the old sign, REEVES GARAGE. Handwritten on the mat: \"Gus, 1931 to 2011. Nobody fixed it better.\""),
      inspect("ra_welder", "An old welder on a shelf", "welder", { x: 4, y: 58, w: 16, h: 20 }, "On the back shelf",
        "A small red portable wire-feed welder, a Lincoln Weld-Pak, dusty, the cord wound neatly. Beside it a squat gas generator. Old equipment a lot of shops in the valley kept."),
    ],
  },

  // ---------------------------------------------------------------- L10
  {
    id: "police",
    area: "town",
    name: "Hollow Creek Police Department",
    subtitle: "Borough Building, Market Street",
    mapPin: { x: 38, y: 50 },
    background: "loc.police",
    ambience: "amb.police",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("pd_mitchell", "Det. Dana Mitchell", "mitchell", PERSON),
      person("pd_trent", "Michael Trent, in the interview room", "trent", PERSON2, trentArrested),
      item("pd_report", "1996 file: the missing person report", "folder", { x: 6, y: 64, w: 12, h: 14 }, "E001", "Case 96-1142", "The first page of the 1996 file.", { flag: "box_out" }),
      item("pd_notes", "1996 file: Granger's notes", "folder", { x: 18, y: 66, w: 12, h: 14 }, "E007", "Granger's notes", "A photocopied legal pad in a manila folder.", { flag: "box_out" }),
      item("pd_inventory", "1996 file: the Brackett tow inventory", "folder", { x: 6, y: 80, w: 12, h: 14 }, "E008", "The car", "A tow and inventory form from Brackett PD with a parking ticket stapled behind it.", { flag: "box_out" }),
      item("pd_wade96", "1996 file: Wade Reeves's statement", "folder", { x: 18, y: 82, w: 12, h: 14 }, "E009", "Statement: Wade Reeves", "A typed statement, signed.", { flag: "box_out" }),
      item("pd_rebecca96", "1996 file: Rebecca Sloan's statement", "folder", { x: 30, y: 80, w: 12, h: 14 }, "E010", "Statement: Rebecca Sloan", "A typed statement with a note in the margin.", { flag: "box_out" }),
      item("pd_andrew96", "1996 file: Andrew Pierce's statement", "folder", { x: 30, y: 64, w: 12, h: 14 }, "E011", "Statement: Andrew Pierce", "A typed statement with a little sketch of a road in the margin.", { flag: "box_out" }),
      inspect("pd_board", "Mitchell's corkboard", "board", { x: 76, y: 10, w: 22, h: 34 }, "Mitchell's board",
        "A detective's corkboard: shift schedules, a bowling league flyer, and in the middle a photograph of a nineteen-year-old girl in a graduation gown, pinned there October 18.",
        { textAfter: [{ requires: glennDead, text: "Glenn Sutter's driver's license photo is pinned beside Emily's now, with a red tack." }] }),
    ],
  },

  // ---------------------------------------------------------------- L11
  {
    id: "forensic",
    area: "county",
    name: "County Forensic Office",
    subtitle: "Medical Examiner, Greensburg Pike",
    mapPin: { x: 14, y: 22 },
    background: "loc.forensic",
    ambience: "amb.lab",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("fo_brooks", "Dr. Nathan Brooks", "brooks", PERSON),
      inspect("fo_lightbox", "A light box", "lamp", { x: 6, y: 20, w: 22, h: 32 }, "On the light box",
        "Two dental films clipped side by side, a red grease-pencil circle on the same gold onlay in each."),
      inspect("fo_table", "An exam table under a sheet", "table", { x: 66, y: 56, w: 30, h: 24 }, "Covered",
        "A steel table under a white sheet. Brooks catches you looking. \"She's not here anymore. Her family has her. That's somebody else's grandfather.\""),
    ],
  },

  // ---------------------------------------------------------------- L12
  {
    id: "newspaper",
    area: "town",
    name: "The Mon Valley Record",
    subtitle: "Main Street newsroom",
    mapPin: { x: 34, y: 42 },
    background: "loc.newspaper",
    ambience: "amb.newsroom",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("np_jessica", "Jessica Kemp", "jessica", PERSON),
      item("np_directory", "The reference shelf", "shelf", { x: 6, y: 18, w: 18, h: 40 }, "E085", "Old directories", "Telephone directories going back to 1958, one per year, fat and soft. The 1996 to 1997 book has a bookmark already in it: Jessica's.", { all: [ch(5), { hasEvidence: "E020" }] }),
      inspect("np_volumes", "Bound volumes, 1996", "books", { x: 74, y: 20, w: 20, h: 34 }, "The Record, 1996",
        "June 15: \"Steel Firm Cites Crew Error in Gallery Deaths.\" August 28, page 6: \"Hollow Creek Teen Believed to Have Left Area,\" four paragraphs and a school photo. Nobody connected the two stories in print."),
    ],
  },

  // ---------------------------------------------------------------- L13
  {
    id: "borough",
    area: "town",
    name: "Borough Municipal Records",
    subtitle: "Borough Building basement",
    mapPin: { x: 40, y: 56 },
    background: "loc.borough",
    ambience: "amb.archive",
    available: never,
    secret: true,
    onMap: true,
    hotspots: [
      item("bo_letters", "Riverside Works file: the union letter", "folder", { x: 20, y: 56, w: 18, h: 20 }, "E036", "Riverside Works, 1996", "The borough code office's file on the Riverside Works. Karen has laid it open on the table."),
      item("bo_memo", "Riverside Works file: a June memo", "folder", { x: 44, y: 56, w: 18, h: 20 }, "E038", "June 1996", "A one-page memorandum, clipped behind the letters."),
      inspect("bo_index", "The file index card", "card", { x: 70, y: 58, w: 14, h: 16 }, "The index card",
        "\"RIVERSIDE WORKS / HC STEEL. Code Enf. 1996.\" The card lists seven documents. The folder holds three."),
    ],
  },

  // ---------------------------------------------------------------- L14
  {
    id: "regulatory",
    area: "county",
    name: "County Regulatory Archive",
    subtitle: "Annex, Courthouse Square",
    mapPin: { x: 20, y: 30 },
    background: "loc.regulatory",
    ambience: "amb.archive",
    available: ch(2),
    onMap: true,
    hotspots: [
      item("rg_osha", "OSHA correspondence boxes", "box", { x: 6, y: 56, w: 18, h: 22 }, "E027", "OSHA, 1996", "Gray boxes of federal correspondence. Inspection 1996-0614-HC is in a folder near the front."),
      item("rg_fire", "Fire marshal's file", "folder", { x: 30, y: 58, w: 16, h: 20 }, "E029", "Fire marshal, Riverside Works", "The county fire marshal's file for June 1996, with a photographic contact sheet."),
      item("rg_interviews", "OSHA interview binder", "binder", { x: 52, y: 58, w: 16, h: 20 }, "E037", "Interview summaries", "A black binder of interview summaries. One is with the maintenance director."),
    ],
  },

  // ---------------------------------------------------------------- L15
  {
    id: "union_hall",
    area: "town",
    name: "Steelworkers Local 2177 Hall",
    subtitle: "Seventh Street",
    mapPin: { x: 24, y: 52 },
    background: "loc.union_hall",
    ambience: "amb.hall",
    available: ch(2),
    onMap: true,
    hotspots: [
      person("uh_earl", "Earl Hayes", "earl", PERSON),
      person("uh_ray", "Ray Dalton", "ray", PERSON2),
      item("uh_cabinet", "The grievance file cabinet", "cabinet", { x: 4, y: 26, w: 14, h: 50 }, "E028", "Grievance file, 1996", "Earl's grievance cabinet. Behind 96-031, a folder of handwritten statements.", { any: [{ hasEvidence: "E022" }, { asked: "earl_grievance" }] }),
      inspect("uh_wall", "The memorial wall", "frames", { x: 76, y: 12, w: 22, h: 34 }, "The wall",
        "Photographs of members killed on the job, going back to 1937. The newest three hang together: Carl Brennan, Tony Mazur, Eddie Sokol. Under them a brass plate: \"June 14, 1996. They were not careless.\""),
    ],
  },

  // ---------------------------------------------------------------- L16
  {
    id: "sutter_home",
    area: "town",
    name: "Sutter House",
    subtitle: "31 Orchard Lane",
    mapPin: { x: 18, y: 66 },
    mapTag: "GLENN SUTTER",
    background: "loc.sutter_home",
    ambience: "amb.house",
    available: never,
    secret: true,
    onMap: true,
    hotspots: [
      person("sh_glenn", "Glenn Sutter", "glenn", PERSON, { not: glennDead }),
      inspect("sh_tape", "Police tape across the door", "tape", { x: 30, y: 20, w: 40, h: 60 }, "Sealed",
        "Crime scene tape across the front door and a notice from Hollow Creek Police: \"ENTRY PROHIBITED.\" Through the window you can see the kitchen, a calendar on the refrigerator. Det. Mitchell would have to let you in.",
        { visible: env("sutter_home", "B") }),
      item("sh_calendar", "Calendar on the refrigerator", "calendar", { x: 70, y: 22, w: 12, h: 26 }, "E042", "Glenn's calendar", "A hardware store calendar held by a magnet shaped like a bass.", env("sutter_home", "C")),
      item("sh_desk", "The desk in the den", "desk", { x: 6, y: 56, w: 22, h: 22 }, "E051", "Glenn's desk", "Bills, a fishing license, reading glasses. An addressed, stamped envelope lies on the blotter, unsealed.", env("sutter_home", "C")),
      item("sh_bible", "The Bible on the nightstand", "book", { x: 84, y: 60, w: 12, h: 14 }, "E092", "The nightstand", "A family Bible, much read. An envelope is tucked inside the cover.", { all: [env("sutter_home", "C"), ch(5)] }),
      inspect("sh_den", "Glenn's den", "frames", { x: 30, y: 12, w: 24, h: 28 }, "The den",
        "Bass on the wall, a wedding photo, a retirement plaque from Hollow Creek Steel. A recliner with the shape of one man worn into it.",
        { visible: { not: env("sutter_home", "B") } }),
    ],
  },

  // ---------------------------------------------------------------- L17
  {
    id: "storage",
    area: "county",
    name: "Creekside Self Storage",
    subtitle: "Unit 14, Route 837",
    mapPin: { x: 10, y: 74 },
    mapTag: "CRIME SCENE",
    background: "loc.storage",
    ambience: "amb.storage",
    available: never,
    secret: true,
    onMap: true,
    hotspots: [
      item("cs_photos", "Police photo board at the unit", "photos", { x: 4, y: 18, w: 18, h: 34 }, "E043", "Unit 14, as found", "The crime scene unit's photo board, propped by the door."),
      item("cs_print", "The floor inside the door", "floor", { x: 26, y: 74, w: 22, h: 20 }, "E050", "In the oil", "Evidence marker 6 on the concrete, beside a spill of motor oil."),
      item("cs_tackle", "A green tackle box", "box", { x: 52, y: 66, w: 14, h: 16 }, "E032", "The tackle box", "Glenn's green metal tackle box, dumped and set upright again by the police. You press on the bottom tray. It moves. There is a false floor, and under it, a folded page."),
      item("cs_log", "The office: gate printout", "terminal", { x: 70, y: 30, w: 14, h: 22 }, "E045", "The gate", "In the facility office the manager has printed Thursday night's gate report for the police and for you."),
      item("cs_contract", "The office: filing cabinet", "cabinet", { x: 86, y: 28, w: 12, h: 30 }, "E046", "Contracts", "The manager's filing cabinet. \"Security\" is the first folder."),
    ],
  },

  // ---------------------------------------------------------------- L18
  {
    id: "stroud_office",
    area: "town",
    name: "Stroud Riverfront Development",
    subtitle: "The old bank building, Main and Second",
    mapPin: { x: 50, y: 36 },
    background: "loc.stroud_office",
    ambience: "amb.office_quiet",
    available: ch(2),
    onMap: true,
    hotspots: [
      person("so_stroud", "Richard Stroud", "stroud", PERSON),
      item("so_grant", "A framed letter in reception", "frame", { x: 6, y: 14, w: 18, h: 28 }, "E090", "On the reception wall", "A framed letter on state letterhead, under a small brass plate."),
      inspect("so_rendering", "Architect's rendering", "frame", { x: 70, y: 12, w: 26, h: 30 }, "Riverworks",
        "A watercolor rendering: apartments in old brick, a riverwalk, cafe tables where the East Mill stands now. \"Riverworks: Living on the Mon. Phase I 2020.\""),
    ],
  },

  // ---------------------------------------------------------------- L19
  {
    id: "trent_office",
    area: "town",
    name: "Trent Protective Services",
    subtitle: "400 Railroad Street",
    mapPin: { x: 62, y: 48 },
    background: "loc.trent_office",
    ambience: "amb.office_quiet",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      person("to_trent", "Michael Trent", "trent", PERSON, { not: trentArrested }),
      item("to_roster", "Framed roster on the wall", "frame", { x: 6, y: 14, w: 16, h: 28 }, "E053", "The wall", "A state security license and, beside it, a framed vehicle and equipment roster."),
      item("to_ledger", "A green ledger on the desk", "book", { x: 64, y: 62, w: 16, h: 14 }, "E056", "The invoice book", "A green clothbound invoice ledger on the desk.", { any: [{ talkedTo: "trent" }, trentArrested] }),
      inspect("to_seal", "Police notice on the door", "tape", { x: 84, y: 20, w: 14, h: 30 }, "Searched",
        "A State Police search notice taped to the inside of the door, dated October 30. The desk drawers stand open and empty, the computer gone.",
        { visible: env("trent_office", "B") }),
    ],
  },

  // ---------------------------------------------------------------- L20
  {
    id: "greer_home",
    area: "town",
    name: "Greer House",
    subtitle: "6 Hilltop Road",
    mapPin: { x: 12, y: 44 },
    background: "loc.greer_home",
    ambience: "amb.house",
    available: { any: [{ hasEvidence: "E036" }, { hasEvidence: "E038" }, { deduction: "D17" }] },
    onMap: true,
    hotspots: [
      person("gh_len", "Len Greer", "len", PERSON, { not: env("greer_home", "B") }),
      item("gh_hall", "The front hall", "hall", { x: 4, y: 20, w: 22, h: 60 }, "E063", "The hall", "Det. Mitchell lets you in with gloves on.", env("greer_home", "B")),
      item("gh_pills", "Kitchen counter", "counter", { x: 30, y: 58, w: 16, h: 16 }, "E064", "By the coffee maker", "A pill organizer and three prescription bottles.", env("greer_home", "B")),
      item("gh_letter", "The dining table", "table", { x: 50, y: 60, w: 18, h: 16 }, "E066", "On the table", "A letter on heavy paper, opened, with pencil on it.", env("greer_home", "B")),
      item("gh_neighbor", "Next door: the Kovach house", "door", { x: 80, y: 24, w: 14, h: 50 }, "E065", "Mrs. Kovach", "Mrs. Kovach comes to her door before you knock. \"I saw the police. I have one of those doorbell cameras. My grandson put it in. I printed what it took at the library this morning.\"", env("greer_home", "B")),
      inspect("gh_porch", "Len's porch", "porch", { x: 40, y: 20, w: 30, h: 36 }, "Hilltop Road",
        "A neat brick ranch with a porch swing and a flag. A ramp built over the steps. The house of a careful man who planned to grow old here.",
        { visible: { not: env("greer_home", "B") } }),
    ],
  },

  // ---------------------------------------------------------------- L21
  {
    id: "laurel_road",
    area: "county",
    name: "Laurel Hollow Road",
    subtitle: "Off Route 88, before dawn",
    mapPin: { x: 30, y: 92 },
    mapTag: "THE CAMP",
    background: "loc.laurel_road",
    ambience: "amb.woods",
    available: never,
    secret: true,
    onMap: true,
    hotspots: [
      item("lr_gate", "The gate across the road", "gate", { x: 30, y: 36, w: 34, h: 40 }, "E071", "The gate", "State police cruisers idle behind you with their lights off. Mitchell's flashlight finds the gate."),
      person("lr_mitchell", "Det. Mitchell", "mitchell", PERSON2),
      door("lr_up", "Up the road to the cabin", "camp", EXIT, trentArrested),
    ],
  },

  // ---------------------------------------------------------------- L22
  {
    id: "camp",
    area: "county",
    name: "The Camp",
    subtitle: "End of Laurel Hollow Road",
    background: "loc.camp",
    ambience: "amb.woods",
    available: never,
    secret: true,
    onMap: false,
    hotspots: [
      item("cp_cellar", "The trap door to the cellar", "hatch", { x: 30, y: 70, w: 24, h: 20 }, "E072", "The cellar", "The trap door stands open now. You go down the steps with Mitchell's flashlight."),
      item("cp_can", "A coffee can over the stove", "can", { x: 66, y: 30, w: 10, h: 14 }, "E073", "Over the stove", "A coffee can with its lid on, on the shelf above the wood stove."),
      inspect("cp_room", "The main room", "room", { x: 4, y: 20, w: 24, h: 46 }, "The cabin",
        "Two rooms of rough paneling. A wood stove, cold. A table with a lantern and a clipboard. Deer antlers over the door. A calendar from a feed store, 2011, never turned past March."),
      door("cp_down", "Back down the road", "laurel_road", EXIT),
    ],
  },

  // ---------------------------------------------------------------- L23
  {
    id: "medical_station",
    area: "mill",
    name: "Former Mill Medical Station",
    subtitle: "West End, by the main gate",
    mapPin: { x: 66, y: 78 },
    background: "loc.medical_station",
    ambience: "amb.mill_inside",
    available: ch(2),
    onMap: true,
    hotspots: [
      item("ms_log", "Treatment logbooks", "book", { x: 8, y: 30, w: 16, h: 26 }, "E039", "Treatment logs", "Bound treatment logs on a shelf, 1988 to 2003. The 1996 book is swollen with damp."),
      inspect("ms_oxygen", "An oxygen cabinet", "cabinet", { x: 64, y: 26, w: 18, h: 44 }, "Oxygen",
        "A glass-fronted cabinet: two green oxygen cylinders, masks in yellowed bags. A sign taped inside: \"GAS CASE: 100% O2, CALL AMBULANCE, NOTIFY GM.\""),
    ],
  },

  // ---------------------------------------------------------------- L24
  {
    id: "corso_photo",
    area: "town",
    name: "Corso Photo and Frame",
    subtitle: "211 Main Street",
    mapPin: { x: 30, y: 40 },
    background: "loc.corso_photo",
    ambience: "amb.shop",
    available: { talkedTo: "sarah" },
    onMap: true,
    hotspots: [
      item("cf_cabinet", "The back-room cabinet", "cabinet", { x: 8, y: 24, w: 16, h: 50 }, "E005", "Vince's files", "Vince Corso, seventy-four, opens the cabinet without being asked. \"Her mom came in asking in ninety-six. Nobody else ever did.\""),
      inspect("cf_darkroom", "The darkroom", "door", { x: 60, y: 18, w: 20, h: 60 }, "The darkroom",
        "A narrow room under a red safelight: enlarger, trays, a copy stand with four lamps on arms, the kind for photographing flat documents. \"Same stand,\" Vince says. \"She was good on it. Steady hands.\""),
    ],
  },

  // ---------------------------------------------------------------- L25
  {
    id: "sloan_home",
    area: "town",
    name: "Sloan House",
    subtitle: "22 Larch Street",
    mapPin: { x: 22, y: 36 },
    background: "loc.sloan_home",
    ambience: "amb.house",
    available: { any: [{ hasEvidence: "E010" }, { hasEvidence: "E019" }, { talkedTo: "sarah" }] },
    onMap: true,
    hotspots: [
      person("sl_rebecca", "Rebecca Sloan", "rebecca", PERSON),
      inspect("sl_photo", "A photo on the fridge", "frame", { x: 74, y: 20, w: 14, h: 24 }, "1995",
        "Two girls in prom dresses mugging for the camera, one dark-haired, one blond. Written on it in purple marker: \"B + E FOREVER.\""),
    ],
  },

  // ---------------------------------------------------------------- L26
  {
    id: "pierce_home",
    area: "town",
    name: "Pierce House",
    subtitle: "9 Pike Alley",
    mapPin: { x: 60, y: 60 },
    background: "loc.pierce_home",
    ambience: "amb.house",
    available: { hasEvidence: "E011" },
    onMap: true,
    hotspots: [
      person("pi_andrew", "Andrew Pierce", "andrew", PERSON),
      item("pi_shoebox", "A shoebox in the basement", "box", { x: 8, y: 62, w: 16, h: 16 }, "E083", "His mother's shoebox", "Andrew brings a shoebox up from the basement and sets it on the table. \"Mom kept everything.\"", { flag: "andrew_shoebox" }),
    ],
  },

  // ---------------------------------------------------------------- L27
  {
    id: "river_gate",
    area: "mill",
    name: "West End Gate and River Ramp",
    subtitle: "Riverside Works, the main gate",
    mapPin: { x: 50, y: 72 },
    background: "loc.river_gate",
    ambience: "amb.river",
    available: ch(3),
    onMap: true,
    hotspots: [
      item("rv_trailer", "Trent Protective site trailer", "trailer", { x: 6, y: 30, w: 22, h: 40 }, "E052", "The site trailer", "Trent Protective's site trailer, unlocked; Fike is on his rounds. A clipboard hangs on a nail inside the door.", glennDead),
      item("rv_guardhouse", "The old guardhouse", "booth", { x: 40, y: 30, w: 16, h: 42 }, "E088", "The guardhouse", "The concrete guardhouse at the old main gate. On a shelf inside, bound gate logs, 1990 to 2003, swollen and spotted.", ch(5)),
      inspect("rv_ramp", "The river ramp", "water", { x: 64, y: 56, w: 30, h: 30 }, "The ramp",
        "A concrete boat ramp running down into the Monongahela, wide and brown and fast. Plant workers used it to launch fishing boats after shift. At night there is no light here at all."),
    ],
  },

  // ---------------------------------------------------------------- L28
  {
    id: "courthouse",
    area: "county",
    name: "County Courthouse Records",
    subtitle: "Recorder of Deeds, ground floor",
    mapPin: { x: 24, y: 24 },
    background: "loc.courthouse",
    ambience: "amb.archive",
    available: ch(2),
    onMap: true,
    hotspots: [
      person("ch_karen", "Karen Novak", "karen", PERSON),
      inspect("ch_books", "Deed books", "books", { x: 6, y: 14, w: 24, h: 46 }, "The deed books",
        "Ceiling-high shelves of red deed books, numbered, a century of who owned what in the county. Karen knows them by number the way other people know songs."),
    ],
  },

  // ---------------------------------------------------------------- L29
  {
    id: "rail_building",
    area: "mill",
    name: "Abandoned Rail Service Building",
    subtitle: "Mon Valley Scrap's old weigh office",
    mapPin: { x: 78, y: 58 },
    background: "loc.rail_building",
    ambience: "amb.mill_inside",
    available: { all: [ch(5), { flag: "scrap_lead" }] },
    onMap: true,
    hotspots: [
      item("rb_ledger", "Ledgers on the weigh counter", "book", { x: 30, y: 52, w: 20, h: 20 }, "E082", "Purchase ledgers", "A row of oversized purchase ledgers on the counter, 1994 to 2003, left behind when the scrap yard moved."),
      inspect("rb_scale", "The platform scale", "scale", { x: 56, y: 66, w: 36, h: 24 }, "The scale",
        "A platform scale big enough for a pickup bed, its beam still hanging in the window of the weigh office. Hand-painted on the wall: \"NO QUESTIONS IS NOT OUR POLICY.\" Someone has added, in spray paint: \"since 98.\""),
    ],
  },

  // ---------------------------------------------------------------- L30
  {
    id: "mill_reconstruction",
    area: "mill",
    name: "East Mill: The Reconstruction",
    subtitle: "Maintenance Building, under work lights",
    background: "loc.mill_reconstruction",
    ambience: "amb.mill_inside",
    available: never,
    secret: true,
    onMap: true,
    mapPin: { x: 74, y: 64 },
    hotspots: [
      person("mr_mitchell", "Det. Mitchell", "mitchell", PERSON2),
      item("mr_bench", "The workbench, under the lights", "bench", { x: 10, y: 50, w: 30, h: 26 }, "E096", "The bench", "Under the work lights every scratch on the bench shows. A crime scene technician has just finished with a swab."),
      item("mr_loft", "The loft, ladder cleared", "ladder", { x: 2, y: 6, w: 20, h: 40 }, "E097", "The loft", "The police have shored the loft floor. You climb up behind Mitchell."),
      inspect("mr_tape", "Tape on the floor", "floor", { x: 42, y: 78, w: 34, h: 18 }, "Fourteen feet",
        "Mitchell has run yellow tape from the front edge of the bench to the crib door: fourteen feet. \"Somebody carried her that far,\" she says. \"That's all this floor will tell us.\""),
    ],
  },
];
