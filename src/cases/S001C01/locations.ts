import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { AMES_SCHEDULE_RECT, LAB_FOOTWEAR_RECT, LOCKHART_NOTE_RECT } from "./desk";
import { briefed, reportAvailable } from "./story";

/*
 * Scene layout for S01 C01. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art; refit every one once its painting lands.
 *
 * Scene items follow the build contract in docs/S001C01-timeline.md. Martin's
 * office is a sub-scene of the foundation (onMap false), reached by its door.
 * No scene changes state: Det. Bowman released the office on Sunday and it is
 * as the police left it.
 */

/** Paul Reddick is known (contract): his shop opens on the map at the same moment. */
const reddickKnown: Condition = { any: [{ hasEvidence: "E022" }, { hasEvidence: "E026" }, { talkedTo: "avery" }, { hasEvidence: "E021" }] };
/** Walter Ames is known (contract). */
const amesKnown: Condition = { any: [{ hasEvidence: "E009" }, { hasEvidence: "E010" }, { talkedTo: "hannah" }] };
const bookKnown: Condition = { flag: "book_known" };

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
  fd_morris: "art.figure_morris",
  fd_whitfield: "art.figure_whitfield",
  ha_hannah: "art.figure_hannah",
  rs_reddick: "art.figure_reddick",
  rs_van: "art.obj_van",
  po_bowman: "art.figure_bowman",
  ao_ames: "art.figure_ames",
  me_holt: "art.figure_holt",
  rl_avery: "art.figure_avery",
};

const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] };
const MAP_NUDGE: Condition = { all: [briefed, { not: { inspected: "office_map" } }] };

export const locations: LocationDef[] = [
  // -------------------------------------------------------------------------
  // L01 The Pittsburgh field office (hub)
  // -------------------------------------------------------------------------
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 14, y: 30 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file: Martin Keller", "folder", { x: 27, y: 66, w: 15, h: 22 }, "casefile"),
      deskItem("office_lab_footwear", "Lab report: footwear comparison", "lab_footwear", "E007", LAB_FOOTWEAR_RECT, "obj.labfolder"),
      deskItem("office_lockhart", "Courier envelope from New York", "lockhart_note", "E030", LOCKHART_NOTE_RECT, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_ames", "Envelope from Ames and Kiley", "ames_schedule", "E029", AMES_SCHEDULE_RECT, "obj.schedule_envelope"),
      {
        ...panel("office_board", "Murder board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      {
        ...panel("office_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"),
        attention: { any: ["call_hannah_book", "call_lockhart", "call_bowman_bank", "call_bennett_board"].map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("office_map", "Map of Carroway and Pittsburgh", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: MAP_NUDGE,
        callout: { text: "Tap here to travel", when: MAP_NUDGE },
      },
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", {
        any: [{ deliveryOpened: "lab_footwear" }, { deliveryOpened: "lockhart_note" }, { deliveryOpened: "ames_schedule" }],
      }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "November over the Point. The Allegheny and the Monongahela run together into the Ohio under a low gray lid of cloud, and the bridges are all the same rust yellow. Carroway is an hour east, past the last of the suburbs.",
      ),
      {
        ...panel("office_report", "Final report", "sprite", { x: 82, y: 72, w: 16, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
      {
        // Wheeled in when the report is accepted; it stays in the office for the rest of the series.
        ...panel("office_rolling", "Rolling board", "sprite", { x: 56, y: 44, w: 13, h: 26 }, "rolling", { flag: "case_closed" }),
        sprite: [{ image: "obj.rolling_board" }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L02 The foundation (reception, Angela, Susan's office, the files)
  // -------------------------------------------------------------------------
  {
    id: "foundation",
    area: "downtown_carroway",
    name: "Carroway Community Foundation",
    subtitle: "Second floor, Mercantile Building, 118 Market Street, Carroway",
    mapPin: { x: 72, y: 50 },
    mapTag: "CRIME SCENE",
    background: "loc.foundation",
    ambience: "amb.foundation",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "fd_window",
        "Window on Market Street",
        "window",
        { x: 2, y: 4, w: 16, h: 32 },
        "Market Street",
        "Two stories down, Market Street on a Monday: a pharmacy, a pizza shop, a hardware store with a hand-lettered sign, two empty storefronts with brokers' signs in the glass. A Carroway PD cruiser rolls past slowly and doesn't stop.",
      ),
      inspect(
        "fd_poster",
        "Framed poster",
        "photo",
        { x: 30, y: 4, w: 14, h: 20 },
        "The Recovery Fund poster",
        "A framed poster above the reception desk: SMALL BUSINESS RECOVERY FUND. REBUILDING MAIN STREET SINCE 2014. A grid of storefront photographs, new awnings and fresh paint. Along the bottom, in smaller type: \"With thanks to our founding donor, the Lockhart Foundation.\"",
      ),
      person("fd_morris", "Angela Morris, at the reception desk", "morris", { x: 22, y: 26, w: 11, h: 60 }),
      inspect(
        "fd_outbox",
        "Martin's outbox tray",
        "tray",
        { x: 2, y: 58, w: 10, h: 10 },
        "Martin's outbox",
        "A wire tray on the reception counter with a strip of label tape: M. KELLER, OUT. Angela hasn't been able to bring herself to empty it. On top, a letter Martin signed the week before he died, with a pink message slip stapled behind it.",
        { evidence: "E028" },
      ),
      inspect(
        "fd_files",
        "Angela's grant files",
        "filing",
        { x: 34, y: 62, w: 10, h: 10 },
        "The grant files",
        "Angela keeps the fund's paperwork in neat color-coded folders beside her keyboard. On top is a disbursement register for 2018 that she printed on Monday for Mrs. Whitfield.",
        { evidence: "E015" },
      ),
      inspect(
        "fd_binder",
        "Reimbursement binder",
        "binder",
        { x: 46, y: 30, w: 12, h: 16 },
        "The reimbursement binder",
        "A thick black binder on the shelf behind reception, labeled RECOVERY FUND, REIMBURSEMENTS 2018. Payment requests, each with its supporting papers clipped behind it.",
        { evidence: "E016" },
      ),
      inspect(
        "fd_cashbox",
        "Petty cash box",
        "box",
        { x: 46, y: 62, w: 8, h: 8 },
        "The petty cash box",
        "A gray steel cash box under the reception counter, its key on a hook beside it in plain sight. Angela says nobody has touched it since Thursday. Nobody touched it on Thursday night either.",
      ),
      person("fd_whitfield", "Susan Whitfield", "whitfield", { x: 60, y: 24, w: 11, h: 62 }),
      inspect(
        "fd_fundbinder",
        "Fund binder in Susan's office",
        "binder",
        { x: 72, y: 44, w: 10, h: 12 },
        "Susan's fund binder",
        "Through Susan Whitfield's open door, on the corner of her desk: a blue binder labeled SBRF, AUTHORIZATIONS. She doesn't object when you open it. \"It's all Adrian's paperwork,\" she says. \"He sends the forms and we file them.\"",
        { evidence: "E018", visible: { talkedTo: "whitfield" } },
      ),
      door("fd_to_martin", "Martin's office", "martin_office", { x: 86, y: 10, w: 13, h: 60 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L03 Martin's office (the crime scene, a sub-scene of the foundation)
  // -------------------------------------------------------------------------
  {
    id: "martin_office",
    area: "downtown_carroway",
    name: "Martin Keller's Office",
    subtitle: "The corner office, Carroway Community Foundation",
    background: "loc.martin_office",
    ambience: "amb.martin_office",
    available: briefed,
    onMap: false,
    hotspots: [
      inspect(
        "mo_textbook",
        "Montgomery's Auditing",
        "book",
        { x: 6, y: 16, w: 10, h: 14 },
        "Montgomery's Auditing",
        "Third shelf from the top, in the row of reference books: the old one with the worn, faded green jacket. Montgomery's Auditing, 1957. It is lighter than it should be. You slide the jacket off.",
        { evidence: "E011", visible: bookKnown },
      ),
      inspect(
        "mo_shelf",
        "Bookshelf",
        "bookshelf",
        { x: 2, y: 36, w: 18, h: 38 },
        "The bookshelf",
        "The police stacked the books from the lower shelf on the carpet beside it: annual reports, nonprofit tax guides, a Pennsylvania statutes binder, all pulled out and dropped, none of them opened. Above, the shelves are untouched. Ring binders of board minutes. A row of accounting reference books, newer spines mostly, a few older ones among them, one in a jacket worn soft at the edges. A small framed photo of Hannah at about ten, holding up a fish.",
        { textAfter: [{ requires: bookKnown, text: "The lower shelf's books are stacked on the carpet where the police left them, pulled out and dropped, none of them opened. Whoever did it never reached the upper shelves, where the old Montgomery's sits in its worn green jacket among the newer reference books." }] },
      ),
      inspect(
        "mo_window",
        "Window over the rear lot",
        "window",
        { x: 22, y: 4, w: 18, h: 30 },
        "The rear lot",
        "The corner window looks down on Mulberry Alley and the building's rear lot: the dumpsters, a few parking spaces, the steel service door. Directly across the alley is the drive-through lane of First Allegheny Bank, with a camera on a pole pointed this way.",
      ),
      inspect(
        "mo_blotter",
        "Desk blotter calendar",
        "calendar",
        { x: 36, y: 56, w: 14, h: 10 },
        "The desk calendar",
        "A paper desk-pad calendar for November under a spill of pens and stamps from the forced drawer. You brush them aside.",
        { evidence: "E009" },
      ),
      inspect(
        "mo_desk",
        "Corner of the desk",
        "desk",
        { x: 52, y: 52, w: 12, h: 10 },
        "The corner of the desk",
        "The right-hand corner of the desk, under a framed newspaper photograph on the wall.",
        { evidence: "E004" },
      ),
      inspect(
        "mo_drawer",
        "Forced center drawer",
        "drawer",
        { x: 38, y: 68, w: 14, h: 8 },
        "The center drawer",
        "The center drawer hangs open, its lock torn out of the wood and fresh pry marks in the varnish. Inside: rubber bands, a stapler, a spare tie. Nothing in this drawer was worth forcing it for.",
      ),
      inspect(
        "mo_cabinet",
        "Filing cabinet",
        "filing",
        { x: 70, y: 24, w: 12, h: 44 },
        "The filing cabinet",
        "A gray four-drawer steel cabinet beside the desk, black fingerprint powder still dusted along its handles.",
        { evidence: "E005" },
      ),
      inspect(
        "mo_toner",
        "Stain on the carpet",
        "floor",
        { x: 70, y: 72, w: 14, h: 10 },
        "The carpet by the cabinet",
        "A gray-black smear of toner powder in front of the cabinet, mostly vacuumed up. A neat square of carpet has been cut out of the middle of it and taken away by the crime scene unit. The empty cartridge sits on the shelf above.",
      ),
      inspect(
        "mo_printer",
        "The back printer",
        "printer",
        { x: 86, y: 40, w: 12, h: 18 },
        "The back printer",
        "A small laser printer on a side table at the back of the office. A sticky note on its lid in Martin's capitals: FRONT ONE JAMS. USE THIS. There are still pages in the output tray.",
        { evidence: "E013" },
      ),
      inspect(
        "mo_tape",
        "Police tape on the door",
        "tape",
        { x: 88, y: 2, w: 11, h: 10 },
        "Police tape",
        "Yellow tape cut and left hanging from the door frame. Det. Bowman released the scene on Sunday. Nobody at the foundation has been able to face cleaning the room yet, so it is as the police left it.",
      ),
      door("mo_to_foundation", "Back to reception", "foundation", { x: 88, y: 62, w: 11, h: 34 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 Martin's house
  // -------------------------------------------------------------------------
  {
    id: "keller_home",
    area: "orchard",
    name: "Martin Keller's House",
    subtitle: "23 Orchard Street, Carroway",
    mapPin: { x: 60, y: 70 },
    background: "loc.keller_home",
    ambience: "amb.keller_home",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "kh_window",
        "Window on Orchard Street",
        "window",
        { x: 2, y: 6, w: 18, h: 34 },
        "Orchard Street",
        "A street of small frame houses with deep porches. Wet leaves in the gutters. Across the way, a neighbor has left a covered casserole dish on the porch rail, as if Martin might still come out for it.",
      ),
      inspect(
        "kh_accordion",
        "Accordion file on the desk",
        "box",
        { x: 40, y: 54, w: 14, h: 12 },
        "The accordion file",
        "Martin's spare room is his home office: a plain desk, a lamp, an adding machine older than you are. In the middle of the desk, squared to the edge, a brown accordion file.",
        { evidence: "E012" },
      ),
      inspect(
        "kh_drawer",
        "Top desk drawer",
        "drawer",
        { x: 40, y: 68, w: 14, h: 8 },
        "The top drawer",
        "Pencils sorted by hardness, a box of staples, a checkbook. Under them, a sealed envelope with Hannah's name on it in Martin's hand.",
        { evidence: "E014" },
      ),
      inspect(
        "kh_photos",
        "Photographs on the wall",
        "photo",
        { x: 60, y: 10, w: 14, h: 20 },
        "Photographs",
        "Hannah in a cap and gown at Pitt, Martin beside her in a tie, beaming. Next to it, an older print: a man in a green eyeshade at a big adding machine, a cigarette in his mouth. On the back of the frame, in pencil: \"Dad, 1958.\"",
      ),
      inspect(
        "kh_mail",
        "Mail on the kitchen counter",
        "tray",
        { x: 78, y: 40, w: 16, h: 20 },
        "The mail",
        "Through the doorway, a week of mail on the kitchen counter that nobody has opened: a Carroway Chamber newsletter, a dentist's reminder, a seed catalog, a sympathy card that has come to the wrong house. Martin's reading glasses sit on top of the pile.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 Hannah's apartment
  // -------------------------------------------------------------------------
  {
    id: "hannah_apt",
    area: "pittsburgh",
    name: "Hannah Keller's Apartment",
    subtitle: "5612 Darlington Road, Squirrel Hill, Pittsburgh",
    mapPin: { x: 30, y: 38 },
    background: "loc.hannah_apt",
    ambience: "amb.hannah_apt",
    available: briefed,
    onMap: true,
    hotspots: [
      person("ha_hannah", "Hannah Keller", "hannah", { x: 38, y: 22, w: 12, h: 64 }),
      inspect(
        "ha_desk",
        "Desk by the window",
        "desk",
        { x: 4, y: 48, w: 20, h: 16 },
        "Hannah's desk",
        "A laptop, a stack of course readers on municipal finance, highlighters, a half-written paper on property tax abatements. Taped to the lamp, a sticky note in a neat square hand that isn't hers: \"Proud of you. Eat something. D.\"",
      ),
      inspect(
        "ha_fridge",
        "Fridge door",
        "photo",
        { x: 66, y: 14, w: 12, h: 30 },
        "The fridge",
        "A Pitt football schedule, a takeout menu, and a photo booth strip: Hannah and her father pulling faces, four frames, the last one both of them laughing too hard to look at the camera.",
      ),
      inspect(
        "ha_window",
        "Window over Darlington Road",
        "window",
        { x: 82, y: 6, w: 16, h: 34 },
        "Darlington Road",
        "Brick duplexes and bare oaks. A bus sighs past toward Murray Avenue. Somebody is raking leaves into a tarp in the cold.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Reddick Maintenance Services
  // -------------------------------------------------------------------------
  {
    id: "reddick_shop",
    area: "carroway_east",
    name: "Reddick Maintenance Services",
    subtitle: "2207 Route 30 East, Carroway",
    mapPin: { x: 88, y: 44 },
    secret: true,
    background: "loc.reddick_shop",
    ambience: "amb.reddick_shop",
    available: reddickKnown,
    onMap: true,
    hotspots: [
      inspect(
        "rs_clipboard",
        "Clipboard on the wall",
        "corkboard",
        { x: 4, y: 26, w: 10, h: 16 },
        "The clipboard",
        "A clipboard on a nail by the office door, this week's job sheet on top in block capitals.",
        { evidence: "E021" },
      ),
      inspect(
        "rs_invoices",
        "Invoice book on the shelf",
        "ledger",
        { x: 16, y: 40, w: 10, h: 10 },
        "The invoice book",
        "A carbon-copy invoice book, the top copies torn out, the yellow ones left. Walk-in coolers, unit heaters, a furnace at a church, a lot of small jobs for small money.",
      ),
      person("rs_reddick", "Paul Reddick", "reddick", { x: 30, y: 24, w: 12, h: 62 }),
      inspect(
        "rs_desk",
        "Desk in the office corner",
        "desk",
        { x: 50, y: 58, w: 14, h: 10 },
        "The desk",
        "A steel desk in the corner of the bay, under a calendar from a plumbing supply house. Coffee rings, a parts catalog, and a bank statement out of its envelope, left open on the blotter.",
        { evidence: "E024" },
      ),
      inspect(
        "rs_mailtray",
        "Mail tray",
        "tray",
        { x: 66, y: 58, w: 10, h: 8 },
        "The mail tray",
        "A plastic tray of bills, catalogs and junk mail. The phone bill is on top, opened, the call pages folded back.",
        { evidence: "E025" },
      ),
      inspect(
        "rs_bench",
        "Workbench",
        "desk",
        { x: 44, y: 34, w: 20, h: 14 },
        "The workbench",
        "Pipe wrenches on a pegboard, a vise, a box of gauges, a coffee can of fittings. An empty canvas tool bag hangs from a hook at the end of the bench.",
      ),
      inspect(
        "rs_van",
        "The van",
        "truck",
        { x: 80, y: 14, w: 19, h: 36 },
        "The van",
        "Through the open bay door: a white 2015 Ford Transit 250, high roof, a ladder rack, REDDICK MAINTENANCE in blue letters on both sides. Pennsylvania plate ZRK-1186.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 Carroway Police Department
  // -------------------------------------------------------------------------
  {
    id: "police",
    area: "downtown_carroway",
    name: "Carroway Police Department",
    subtitle: "Detective bureau, 40 Court Street, Carroway",
    mapPin: { x: 66, y: 44 },
    background: "loc.police",
    ambience: "amb.police",
    available: briefed,
    onMap: true,
    hotspots: [
      person("po_bowman", "Det. Curtis Bowman", "bowman", { x: 40, y: 24, w: 13, h: 62 }),
      inspect(
        "po_board",
        "Case board",
        "corkboard",
        { x: 0, y: 4, w: 22, h: 42 },
        "Det. Bowman's case board",
        "A whiteboard with 18-1108-022 written across the top: a floor plan of the second floor, a photo of the Mercantile Building's front doors, and BURGLARY? in red marker with the question mark added in a different pen.",
      ),
      inspect(
        "po_desk",
        "Bowman's desk",
        "desk",
        { x: 62, y: 54, w: 34, h: 20 },
        "Bowman's desk",
        "Two case binders, a cold coffee in a Penn State mug, a stack of overtime slips. A photo of a boy in a Little League uniform, swinging and missing.",
      ),
      inspect(
        "po_window",
        "Window on Court Street",
        "window",
        { x: 62, y: 4, w: 26, h: 34 },
        "Court Street",
        "Across the street, the county courthouse and its annex, where the medical examiner works. Flags at half-staff for a veteran, not for Martin.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 Ames and Kiley, CPAs
  // -------------------------------------------------------------------------
  {
    id: "ames_office",
    area: "pittsburgh",
    name: "Ames and Kiley, CPAs",
    subtitle: "4th floor, 310 Grant Street, Pittsburgh",
    mapPin: { x: 20, y: 24 },
    secret: true,
    background: "loc.ames_office",
    ambience: "amb.ames_office",
    available: amesKnown,
    onMap: true,
    hotspots: [
      inspect(
        "ao_shelves",
        "Shelves of tax code",
        "bookshelf",
        { x: 2, y: 8, w: 18, h: 56 },
        "The shelves",
        "Floor to ceiling: the Internal Revenue Code in fat paperback volumes by year, nonprofit audit guides, a row of binders labeled by client. The newest spines are the most worn.",
      ),
      person("ao_ames", "Walter Ames", "ames", { x: 40, y: 24, w: 12, h: 62 }),
      inspect(
        "ao_table",
        "Conference table",
        "desk",
        { x: 56, y: 58, w: 26, h: 14 },
        "The conference table",
        "A small round table with two chairs, a legal pad and two pens laid square. Ames says it was set up exactly like this for nine o'clock on Friday, and he hasn't had the heart to move it.",
      ),
      inspect(
        "ao_window",
        "Window over Grant Street",
        "window",
        { x: 70, y: 6, w: 26, h: 34 },
        "Grant Street",
        "Downtown Pittsburgh in the rain: the courthouse towers, office windows lighting up one floor at a time, and two blocks down, the tall limestone mass of the Gulf Tower.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 Suite 2210, 600 Grant Street (Holt Advisory and Meridian's Pittsburgh office)
  // -------------------------------------------------------------------------
  {
    id: "meridian",
    area: "pittsburgh",
    name: "Suite 2210, 600 Grant Street",
    subtitle: "Holt Advisory LLC, Pittsburgh",
    mapPin: { x: 18, y: 18 },
    background: "loc.meridian",
    ambience: "amb.meridian",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "me_nameplate",
        "Nameplates by the door",
        "sign",
        { x: 2, y: 20, w: 12, h: 18 },
        "The nameplates",
        "Two brushed-steel plates beside the glass door of Suite 2210. The top one: HOLT ADVISORY LLC. Directly below it, the same size: MERIDIAN ADVISORY GROUP, PITTSBURGH OFFICE. One door, one reception desk, two firms.",
      ),
      inspect(
        "me_reception",
        "Reception desk",
        "desk",
        { x: 16, y: 54, w: 16, h: 12 },
        "The reception desk",
        "A curved walnut reception desk with a bowl of mints and a nameplate: C. DUNMORE, OFFICE MANAGER. She is on the phone and waves you through to Mr. Holt without covering the receiver.",
      ),
      person("me_holt", "Adrian Holt", "holt", { x: 38, y: 24, w: 12, h: 62 }),
      inspect(
        "me_outtray",
        "Out tray on Holt's desk",
        "tray",
        { x: 58, y: 54, w: 10, h: 8 },
        "Holt's out tray",
        "A leather out tray on the corner of Holt's desk, a coffee cup sitting on the papers in it. While he steps out to take a call, you lift the cup.",
        { evidence: "E019", visible: { deduction: "D09" } },
      ),
      inspect(
        "me_window",
        "Window over the city",
        "window",
        { x: 70, y: 4, w: 28, h: 38 },
        "The view",
        "Twenty-two floors up. The rivers, the stadiums on the North Shore, the hills going blue in the distance. A view that costs a good deal of money every month.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 The rear lot and service entrance, Mulberry Alley
  // -------------------------------------------------------------------------
  {
    id: "rear_lot",
    area: "downtown_carroway",
    name: "Rear Lot and Service Entrance",
    subtitle: "Mercantile Building, Mulberry Alley, Carroway",
    mapPin: { x: 76, y: 56 },
    background: "loc.rear_lot",
    ambience: "amb.rear_lot",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "rl_dumpsters",
        "Dumpsters",
        "dumpster",
        { x: 2, y: 44, w: 20, h: 28 },
        "The dumpsters",
        "Two green dumpsters against the back wall, and beside them a stretch of empty asphalt wide enough for a truck. The spot can't be seen from Market Street, or from any window but the corner one on the second floor.",
      ),
      inspect(
        "rl_reader",
        "Card reader by the service door",
        "panel",
        { x: 30, y: 34, w: 7, h: 10 },
        "The rear service door",
        "A steel door with a push bar on the inside and a card reader on the outside, its little light glowing red. A sign: AUTHORIZED PERSONNEL. DOOR IS ALARMED AND MONITORED.",
      ),
      person("rl_avery", "Stanley Avery, at the security desk inside", "avery", { x: 46, y: 26, w: 12, h: 60 }),
      inspect(
        "rl_camera",
        "Camera across the alley",
        "camera",
        { x: 76, y: 4, w: 12, h: 16 },
        "The bank camera",
        "Across Mulberry Alley, on a pole above First Allegheny Bank's drive-through lane, a camera. It points at the drive-through, and past it, at this lot.",
      ),
      inspect(
        "rl_alley",
        "Mulberry Alley",
        "road",
        { x: 64, y: 66, w: 34, h: 26 },
        "Mulberry Alley",
        "A narrow brick alley running behind Market Street toward Third Street, a few houses at its far end. Somebody's dog has left its mark on every pole. It's quiet enough that a van parked here at night would be noticed.",
      ),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
