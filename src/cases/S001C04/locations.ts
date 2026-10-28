import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { LAB_DECRYPT_RECT, ROURKE_PACKET_RECT, WALLET_RECT } from "./desk";
import { reportAvailable } from "./story";

/*
 * Scene layout for S01 C04, The Informant. Hotspot rectangles are percentages
 * of a 16:9 frame, laid out for placeholder art; refit every one once its
 * painting lands. No two hotspots in a scene overlap.
 *
 * Scene items follow the build contract in docs/S001C04-timeline.md. The case
 * starts at the Wren (startLocation "cafe"). The engine treats the start
 * location as "home": the case file can only be read there, the corner map
 * and notebook are hidden there, and the lab countdown is drawn there. So the
 * café carries the case file (on your phone), a map and a notebook, and keeps
 * LAB_DECRYPT_RECT clear. The Pittsburgh office is the hub for the board,
 * the deliveries, the report and the series' rolling board.
 *
 * Claire's apartment is a sub-scene of the building (onMap false), reached by
 * its door. The cottage and the Bristow house are secret until they open.
 */

const tateKnown: Condition = { flag: "tate_known" };
const tateWarrant: Condition = { flag: "tate_warrant" };
const rescued: Condition = { flag: "claire_rescued" };
const carton: Condition = { flag: "carton_warrant" };
const prentissKnown: Condition = { any: [{ hasEvidence: "E008" }, { talkedTo: "patel" }] };
const corbettKnown: Condition = { any: [{ hasEvidence: "E009" }, { visited: "records_center" }] };
const castellKnown: Condition = { any: [{ hasEvidence: "E024" }, { hasEvidence: "E008" }] };
const langKnown: Condition = { any: [{ hasEvidence: "E012" }, { hasEvidence: "E014" }] };

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
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"], image: string): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: [{ image }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  office_notebook: "art.obj_notebook",
  office_mail: "art.obj_mailtray",
  office_phone: "art.obj_deskphone",
  cafe_notebook: "art.obj_notebook",
  cafe_halvorsen: "art.figure_halvorsen",
  bldg_patel: "art.figure_patel",
  ch_corbett: "art.figure_corbett",
  cw_castell: "art.figure_castell",
  tp_prentiss: "art.figure_prentiss",
  st_lang: "art.figure_lang",
  to_tate: "art.figure_tate",
  pd_harris: "art.figure_harris",
  pd_claire: "art.figure_claire",
  pd_tate: "art.figure_tate",
};

const PHONE_CALLS = [
  "call_patel_screwdriver",
  "call_corbett_withdraws",
  "call_lockhart",
  "call_bennett_pattern",
  "call_tate_story",
  "call_harris_moved",
  "call_collins_note",
  "call_harris_rescue",
  "call_bennett_revelation",
  "call_bennett_board",
];
const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] };
const MAP_NUDGE: Condition = { all: [{ visited: "office" }, { not: { inspected: "office_map" } }, { not: { inspected: "cafe_map" } }] };
const CAFE_MAP_NUDGE: Condition = { all: [{ event: "RE01" }, { not: { inspected: "cafe_map" } }, { not: { inspected: "office_map" } }] };

export const locations: LocationDef[] = [
  // -------------------------------------------------------------------------
  // L01 The Pittsburgh field office (hub)
  // -------------------------------------------------------------------------
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 7, y: 8 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      deskItem("office_archive", "Claire's archive, printed", "lab_archive", "E037", LAB_DECRYPT_RECT, "obj.archive_folder"),
      deskItem("office_rourke_packet", "Packet from Det. Collins", "rourke_packet", "E032", ROURKE_PACKET_RECT, "obj.police_envelope"),
      deskItem("office_wallet", "Copies from Claire's document wallet", "claire_wallet", "E039", WALLET_RECT, "obj.property_envelope"),
      {
        ...panel("office_board", "Murder board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      {
        ...panel("office_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"),
        attention: { any: PHONE_CALLS.map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("office_map", "Map of Northern Virginia and Washington", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: MAP_NUDGE,
        callout: { text: "Tap here to travel", when: MAP_NUDGE },
      },
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", {
        any: [{ deliveryOpened: "lab_archive" }, { deliveryOpened: "rourke_packet" }, { deliveryOpened: "claire_wallet" }],
      }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "December over the Point: the rivers the color of pewter, the bridges rust yellow under a low sky. Alexandria is four hours south and east, down the turnpike and across the mountains, where it is raining instead of snowing.",
      ),
      {
        ...panel("office_report", "Final report", "sprite", { x: 82, y: 72, w: 16, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
      {
        // The series' rolling board: already in the office by this case, and it stays.
        ...panel("office_rolling", "Rolling board", "sprite", { x: 56, y: 44, w: 13, h: 26 }, "rolling"),
        sprite: [{ image: "obj.rolling_board" }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L02 The Wren Coffeehouse (start location)
  // -------------------------------------------------------------------------
  {
    id: "cafe",
    area: "alexandria",
    name: "The Wren Coffeehouse",
    subtitle: "1108 King Street, Old Town Alexandria",
    mapPin: { x: 79, y: 54 },
    mapTag: "MEETING",
    background: "loc.cafe",
    ambience: "amb.cafe",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "cafe_window",
        "Front window on King Street",
        "window",
        { x: 2, y: 4, w: 16, h: 34 },
        "King Street",
        "Rain on the glass and brick sidewalks shining under it. Across the street, a red fire hydrant at the curb in front of a shuttered gallery, and a delivery van idling beside it. Further up, the King Street trolley sighs past, almost empty.",
      ),
      inspect(
        "cafe_camera",
        "Camera monitor behind the counter",
        "camera",
        { x: 32, y: 6, w: 10, h: 14 },
        "The camera monitor",
        "A small monitor on a shelf behind the counter, split four ways: the register, the back door, the dining room, and the front door with the sidewalk and King Street beyond it. The manager is the one who can print from it.",
      ),
      inspect(
        "cafe_book",
        "Host stand",
        "book",
        { x: 20, y: 50, w: 10, h: 12 },
        "The host stand",
        "A narrow wooden host stand by the door with a jar of pencils, a stack of menus and a spiral notebook open to this week.",
        { evidence: "E002" },
      ),
      person("cafe_halvorsen", "Nina Halvorsen, the manager", "halvorsen", { x: 31, y: 24, w: 11, h: 62 }),
      inspect(
        "cafe_booth",
        "The reserved booth",
        "booth",
        { x: 58, y: 26, w: 20, h: 26 },
        "The back booth",
        "The back booth under a framed print of the waterfront, a little RESERVED card propped against the sugar. Your cold coffee. The seat across from you, where Claire Donovan should have been since ten, is empty.",
        { textAfter: [{ requires: { flag: "note_given" }, text: "The back booth, the RESERVED card, your cold coffee. On the table now, where Nina set it down: a Wren Coffeehouse envelope with your agency's city written across it in blue ballpoint." }] },
      ),
      {
        ...inspect(
          "cafe_note",
          "Envelope on the booth table",
          "envelope",
          { x: 60, y: 54, w: 10, h: 8 },
          "The envelope",
          "The envelope Nina brought over, sealed, addressed in blue ballpoint. You open it.",
          { evidence: "E003", visible: { flag: "note_given" } },
        ),
        sprite: [{ image: "obj.cafe_envelope" }],
      },
      panel("cafe_phone", "Your phone: Bennett's case file", "folder", { x: 2, y: 64, w: 12, h: 18 }, "casefile"),
      panel("cafe_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("cafe_map", "Map of Northern Virginia and Washington", "map", { x: 80, y: 6, w: 18, h: 30 }, "map"),
        attention: CAFE_MAP_NUDGE,
        callout: { text: "Tap here to travel", when: CAFE_MAP_NUDGE },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L03 Cameron Mews, 1015 Cameron Street
  // -------------------------------------------------------------------------
  {
    id: "apt_building",
    area: "alexandria",
    name: "Cameron Mews",
    subtitle: "1015 Cameron Street, Alexandria",
    mapPin: { x: 75, y: 49 },
    background: "loc.apt_building",
    ambience: "amb.apt_building",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "bldg_window",
        "Management window",
        "window",
        { x: 2, y: 26, w: 16, h: 22 },
        "The management window",
        "A sliding glass window into the property manager's office off the lobby, closed, a bell on the sill. Clipped inside the glass, facing out, a printout with a yellow sticky note on it.",
        { evidence: "E006" },
      ),
      inspect(
        "bldg_mailboxes",
        "Mailboxes",
        "box",
        { x: 20, y: 30, w: 14, h: 22 },
        "The mailboxes",
        "A wall of brass mailboxes. 3C, DONOVAN, is full enough that a catalog sticks out of the slot. 3D, PATEL, has a sticky note on it in a nurse's capitals: NIGHT SHIFT, PLEASE DON'T BUZZ BEFORE 2.",
      ),
      inspect(
        "bldg_garage",
        "Garage gate",
        "door",
        { x: 36, y: 56, w: 18, h: 30 },
        "The garage gate",
        "Through the lobby's back door, the gate to the residents' garage, a fob reader on a post beside it. Space 3C, painted on the concrete, is empty. A dry patch in the shape of a small car where the rain hasn't reached.",
      ),
      person("bldg_patel", "Gwen Patel, in the third-floor hall", "patel", { x: 58, y: 22, w: 11, h: 62 }),
      door("bldg_to_apt", "Apartment 3C", "claire_apt", { x: 84, y: 10, w: 14, h: 60 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 Claire's apartment, 3C (a sub-scene of the building)
  // -------------------------------------------------------------------------
  {
    id: "claire_apt",
    area: "alexandria",
    name: "Claire Donovan's Apartment",
    subtitle: "Apartment 3C, Cameron Mews",
    background: "loc.claire_apt",
    ambience: "amb.claire_apt",
    available: { always: true },
    onMap: false,
    hotspots: [
      inspect(
        "apt_charger",
        "Laptop charger at the desk",
        "desk",
        { x: 2, y: 40, w: 14, h: 12 },
        "The desk",
        "A small desk under the window, every drawer pulled out and left hanging. A laptop charger is still plugged into the wall, its cable lying across an empty patch of desk the size of a laptop.",
      ),
      inspect(
        "apt_deskfile",
        "Folder in the bottom drawer",
        "drawer",
        { x: 2, y: 56, w: 14, h: 10 },
        "The bottom drawer",
        "The bottom desk drawer is pulled out like the others, but whoever went through it left one manila folder lying flat in the bottom.",
        { evidence: "E009" },
      ),
      inspect(
        "apt_tray",
        "Desk tray",
        "tray",
        { x: 18, y: 56, w: 10, h: 8 },
        "The desk tray",
        "A wire letter tray knocked to the floor and set back on the desk by the police. A few bills, a library notice, and a folded photocopy.",
        { evidence: "E010" },
      ),
      inspect(
        "apt_fridge",
        "Fridge door",
        "photo",
        { x: 32, y: 14, w: 12, h: 30 },
        "The fridge",
        "A grocery list in small upright letters, a dentist's reminder, and a heavy cream card held up by a magnet shaped like a lemon.",
        { evidence: "E024" },
      ),
      inspect(
        "apt_closet",
        "Bedroom closet",
        "closet",
        { x: 48, y: 8, w: 14, h: 40 },
        "The closet",
        "The top shelf holds a large and a medium suitcase in the same navy fabric, and a gap beside them where a smaller one stood. The clothes on the rail have been shoved to one end and dragged back. Whoever went through it was looking for something flat, not for clothes.",
      ),
      inspect(
        "apt_bathroom",
        "Bathroom",
        "door",
        { x: 64, y: 8, w: 12, h: 44 },
        "The bathroom",
        "The toothbrush holder is empty. Above the tub, the ceiling access panel has been pushed aside and a fine film of plaster dust lies in the tub. Nothing up there but pipes and insulation.",
      ),
      inspect(
        "apt_kickplate",
        "Bookcase kick plate",
        "panel",
        { x: 48, y: 74, w: 16, h: 8 },
        "The bookcase kick plate",
        "The board across the foot of the bookcase, behind the books the searcher stacked on the floor. Two small screws hold it. You borrow Gwen's screwdriver.",
        { evidence: "E012", visible: { flag: "screwdriver_known" } },
      ),
      inspect(
        "apt_bookcase",
        "Bookcase",
        "bookshelf",
        { x: 48, y: 52, w: 16, h: 20 },
        "The bookcase",
        "Two shelves of books pulled out and stacked on the rug: records management manuals, a row of paperback mysteries, a field guide to Virginia birds. The rest pushed back unevenly. The bottom board, at floor level, is still in place.",
      ),
      door("apt_to_building", "Back to the hall", "apt_building", { x: 86, y: 10, w: 12, h: 60 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 Meridian Records Center, Chantilly
  // -------------------------------------------------------------------------
  {
    id: "records_center",
    area: "chantilly",
    name: "Meridian Records Center",
    subtitle: "3900 Brookfield Corporate Drive, Chantilly",
    mapPin: { x: 40, y: 40 },
    background: "loc.records_center",
    ambience: "amb.records_center",
    available: { any: [{ hasEvidence: "E009" }, { hasEvidence: "E010" }] },
    onMap: true,
    hotspots: [
      inspect(
        "rc_supervisor",
        "Gina Ostrander, the duty supervisor",
        "person",
        { x: 2, y: 24, w: 12, h: 60 },
        "Gina Ostrander",
        "The duty supervisor, Gina Ostrander, a lanyard of keys and a cardigan with the sleeves pushed up. \"Mr. Sayer is out this week. I can't let you into the stacks, and I can't talk about Claire. The register and the copy room are front of house; you can look at those.\" She glances at the empty desk in the second aisle. \"She was the best of us.\"",
      ),
      inspect(
        "rc_register",
        "Stack register on the front desk",
        "ledger",
        { x: 18, y: 54, w: 14, h: 12 },
        "The stack register",
        "A bound register with numbered pages on the front desk, a pen on a chain. Every entry into the stacks is written here by hand.",
        { evidence: "E016" },
      ),
      inspect(
        "rc_desk",
        "Claire's cleared desk",
        "desk",
        { x: 38, y: 50, w: 16, h: 14 },
        "Claire's desk",
        "A steel desk at the head of the second aisle, cleared to the blotter: a pencil cup, a stapler, a strip of tape where a nameplate used to be. Behind it, the gray shelving runs back into the dark in long rows of numbered boxes.",
      ),
      inspect(
        "rc_copier",
        "Copier RM-C2",
        "printer",
        { x: 60, y: 30, w: 14, h: 34 },
        "Copier RM-C2",
        "The copy room's one copier, RM-C2, a badge reader bolted to its side and a screen that reads PRESENT BADGE TO COPY. A test sheet left in the tray carries a thin gray line of type along its bottom edge.",
      ),
      inspect(
        "rc_guide",
        "Binder on a chain",
        "binder",
        { x: 76, y: 44, w: 10, h: 14 },
        "The binder",
        "A laminated binder on a chain beside the copier.",
        { evidence: "E015" },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Alan Corbett's house, Falls Church
  // -------------------------------------------------------------------------
  {
    id: "corbett_home",
    area: "falls_church",
    name: "Alan Corbett's House",
    subtitle: "214 Hillwood Avenue, Falls Church",
    mapPin: { x: 62, y: 37 },
    secret: true,
    background: "loc.corbett_home",
    ambience: "amb.corbett_home",
    available: corbettKnown,
    onMap: true,
    hotspots: [
      person("ch_corbett", "Alan Corbett", "corbett", { x: 30, y: 22, w: 12, h: 64 }),
      inspect(
        "corbett_boxes",
        "Banker's boxes in the study",
        "box",
        { x: 56, y: 50, w: 22, h: 22 },
        "The boxes",
        "Six banker's boxes stacked against the study wall, labeled in a careful hand: COMPLIANCE 2015, 2016, 2017, 2018 (1), 2018 (2), PERSONAL. Copies of his own working files, he says, kept since the day he was let go.",
      ),
      inspect(
        "ch_window",
        "Window on Hillwood Avenue",
        "window",
        { x: 80, y: 6, w: 18, h: 34 },
        "Hillwood Avenue",
        "A quiet street of brick ramblers and bare oaks. A neighbor is stringing lights along a hedge in the rain. Corbett's own house has none up.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 Clearwater Accountability Initiative, Washington
  // -------------------------------------------------------------------------
  {
    id: "clearwater",
    area: "washington",
    name: "Clearwater Accountability Initiative",
    subtitle: "Suite 610, 1225 Nineteenth Street NW, Washington",
    mapPin: { x: 76, y: 28 },
    secret: true,
    background: "loc.clearwater",
    ambience: "amb.clearwater",
    available: castellKnown,
    onMap: true,
    hotspots: [
      inspect(
        "cw_donorwall",
        "Donor wall",
        "sign",
        { x: 2, y: 8, w: 22, h: 34 },
        "The donor wall",
        "A wall of brushed steel plaques by the reception desk: CLEARWATER ACCOUNTABILITY INITIATIVE, WITH THANKS TO OUR SUPPORTERS. A dozen family funds and small foundations. At the top, larger than the rest: FOUNDING PATRON, THE LOCKHART FOUNDATION, NEW YORK.",
        {
          textAfter: [
            {
              requires: { event: "RE04" },
              text: "A wall of brushed steel plaques by the reception desk: CLEARWATER ACCOUNTABILITY INITIATIVE, WITH THANKS TO OUR SUPPORTERS. A dozen family funds and small foundations. At the top, larger than the rest: FOUNDING PATRON, THE LOCKHART FOUNDATION, NEW YORK. Miriam has taken the Lockhart Foundation plaque down to read the date on it twice.",
            },
          ],
        },
      ),
      person("cw_castell", "Miriam Castell", "castell", { x: 34, y: 22, w: 12, h: 64 }),
      inspect(
        "cw_courier_tray",
        "Outgoing courier tray",
        "tray",
        { x: 56, y: 56, w: 12, h: 10 },
        "The outgoing tray",
        "A wire tray on the front desk marked OUTGOING, with a pad of blank Capital Courier Service waybills beside it, Clearwater's name and suite number preprinted in the sender's box. The top waybill on the pad has been torn off.",
      ),
      inspect(
        "cw_window",
        "Window over Nineteenth Street",
        "window",
        { x: 74, y: 6, w: 24, h: 34 },
        "Nineteenth Street",
        "Six floors down, Nineteenth Street in the rain: office lobbies, a food truck with its awning out, umbrellas heading toward Dupont Circle.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 Tyler Prentiss's apartment, Clarendon
  // -------------------------------------------------------------------------
  {
    id: "prentiss_apt",
    area: "arlington",
    name: "Tyler Prentiss's Apartment",
    subtitle: "The Courtland, Apt 1108, Wilson Boulevard, Clarendon",
    mapPin: { x: 66, y: 33 },
    secret: true,
    background: "loc.prentiss_apt",
    ambience: "amb.prentiss_apt",
    available: prentissKnown,
    onMap: true,
    hotspots: [
      person("tp_prentiss", "Tyler Prentiss", "prentiss", { x: 30, y: 22, w: 12, h: 64 }),
      inspect(
        "tp_server",
        "Home server under the desk",
        "computer",
        { x: 54, y: 56, w: 16, h: 16 },
        "The home server",
        "Under a standing desk with two monitors, a small black server hums with a row of blue lights. A label-maker strip on its front reads KEYS. DO NOT UNPLUG.",
      ),
      inspect(
        "tp_window",
        "Window over Wilson Boulevard",
        "window",
        { x: 76, y: 6, w: 22, h: 34 },
        "Wilson Boulevard",
        "Eleven floors up: the Clarendon bars and restaurants, the Metro entrance, traffic hissing on the wet boulevard. Across the river, the lights of Georgetown.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 Dominion Secure Records, Lorton
  // -------------------------------------------------------------------------
  {
    id: "storage",
    area: "lorton",
    name: "Dominion Secure Records",
    subtitle: "Lorton Industrial Park, Lorton",
    mapPin: { x: 68, y: 76 },
    secret: true,
    background: "loc.storage",
    ambience: "amb.storage",
    available: langKnown,
    onMap: true,
    hotspots: [
      person("st_lang", "Gerald Lang", "lang", { x: 4, y: 22, w: 12, h: 64 }),
      inspect(
        "st_aisles",
        "The vault aisles",
        "shelves",
        { x: 20, y: 6, w: 24, h: 36 },
        "The vault",
        "Behind a steel mesh gate, aisles of identical white records cartons on gray shelving, each with a barcode label, rising into the dark. A forklift parked at the end of a row. Most of the boxes, Lang says, are Meridian's.",
      ),
      inspect(
        "st_set1",
        "Carton P-0388: sleeve \"Set B / 1\"",
        "folder",
        { x: 30, y: 60, w: 10, h: 10 },
        "Set B / 1",
        "Carton P-0388, open on the inspection table, its seal cut in front of Det. Harris. On top, three clear sleeves numbered in Claire's hand. The first.",
        { evidence: "E019", visible: carton },
      ),
      inspect(
        "st_set2",
        "Carton P-0388: sleeve \"Set B / 2\"",
        "folder",
        { x: 41, y: 60, w: 10, h: 10 },
        "Set B / 2",
        "The second sleeve from Claire's carton.",
        { evidence: "E020", visible: carton },
      ),
      inspect(
        "st_set3",
        "Carton P-0388: sleeve \"Set B / 3\"",
        "folder",
        { x: 52, y: 60, w: 10, h: 10 },
        "Set B / 3",
        "The third sleeve from Claire's carton.",
        { evidence: "E021", visible: carton },
      ),
      inspect(
        "st_notebook",
        "Carton P-0388: a black pocket notebook",
        "book",
        { x: 63, y: 60, w: 9, h: 10 },
        "The pocket notebook",
        "Under the sleeves, a black pocket notebook with an elastic band around it.",
        { evidence: "E026", visible: carton },
      ),
      inspect(
        "st_register",
        "Carton P-0388: a narrow ledger",
        "ledger",
        { x: 73, y: 60, w: 9, h: 10 },
        "The ledger",
        "A narrow ledger notebook, ruled in pencil.",
        { evidence: "E038", visible: carton },
      ),
      inspect(
        "st_drive",
        "Carton P-0388: a storage drive",
        "box",
        { x: 83, y: 60, w: 9, h: 10 },
        "The drive",
        "At the bottom of the carton, in a padded envelope: a black USB storage drive. Det. Harris plugs it into his laptop. It asks for a keyfile and a passphrase, and opens for neither. \"Two halves,\" Lang says. \"She said that when she brought it in.\"",
        {
          visible: carton,
          textAfter: [{ requires: { labStarted: "decrypt" }, text: "The padded envelope is empty: the drive has gone to Bennett's people with Tyler Prentiss's keyfile and Claire's passphrase." }],
        },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 Laurel Run Cottage, Delaplane (secret)
  // -------------------------------------------------------------------------
  {
    id: "safe_house",
    area: "fauquier",
    name: "Laurel Run Cottage",
    subtitle: "3 Laurel Run Lane, Delaplane, Fauquier County",
    mapPin: { x: 6, y: 46 },
    secret: true,
    background: "loc.safe_house",
    ambience: "amb.safe_house",
    available: { hasEvidence: "E027" },
    onMap: true,
    hotspots: [
      inspect(
        "sh_keypad",
        "Keypad lock on the front door",
        "panel",
        { x: 2, y: 30, w: 10, h: 16 },
        "The front door",
        "A keypad deadbolt on the cottage's front door, a Piedmont Country Stays sticker beside it. A single button under the keys, marked with a padlock: one touch locks the door from outside. Two Fauquier County deputies stand on the porch, stamping their feet.",
      ),
      inspect(
        "sh_receipt",
        "Receipt on the counter",
        "paper",
        { x: 18, y: 52, w: 10, h: 8 },
        "The receipt",
        "A curled register receipt by the coffee maker, from a country store on Route 17: Wednesday, December 12, 9:31 AM. Bread, eggs, coffee, two cans of soup, a bag of apples, a paperback from the rack by the door. Paid cash.",
      ),
      inspect(
        "sh_kitchen",
        "The kitchen",
        "floor",
        { x: 32, y: 54, w: 26, h: 26 },
        "The kitchen",
        "The cottage kitchen, at the back of the house, the back door beyond the table.",
        { evidence: "E029" },
      ),
      inspect(
        "sh_bedroom",
        "Bedroom",
        "door",
        { x: 62, y: 8, w: 14, h: 44 },
        "The bedroom",
        "A small black travel bag on the quilt, half unpacked: folded sweaters, a toothbrush in a plastic case, the paperback from the store with a receipt for a bookmark. The bed has been sat on and not slept in. There are no papers anywhere in the room.",
      ),
      inspect(
        "sh_car",
        "Blue Subaru in the drive",
        "truck",
        { x: 80, y: 30, w: 18, h: 30 },
        "The car",
        "Through the front window, Claire's blue 2014 Subaru Impreza in the gravel drive, frost on the windshield and leaves on the roof. Locked. On the passenger seat, a road atlas open at Fauquier County, with Route 17 traced in pencil.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L11 Tate Protective Services, Arlington
  // -------------------------------------------------------------------------
  {
    id: "tate_office",
    area: "arlington",
    name: "Tate Protective Services",
    subtitle: "Suite 204, 2900 Clarendon Boulevard, Arlington",
    mapPin: { x: 69, y: 38 },
    secret: true,
    background: "loc.tate_office",
    ambience: "amb.tate_office",
    available: tateKnown,
    onMap: true,
    hotspots: [
      inspect(
        "to_fleet",
        "Fleet board",
        "corkboard",
        { x: 2, y: 8, w: 18, h: 30 },
        "The fleet board",
        "A whiteboard by the door ruled into four columns, one per vehicle, with magnets for who has the keys. 1, 2 and 4 are IN. Under 3, in black marker: OUT. CLIENT. B.T., and a date, Wednesday's.",
      ),
      person("to_tate", "Brandon Tate", "tate", { x: 30, y: 22, w: 12, h: 64 }, { all: [tateKnown, { not: tateWarrant }] }),
      inspect(
        "to_phone",
        "Desk, top drawer",
        "drawer",
        { x: 50, y: 56, w: 14, h: 8 },
        "The top drawer",
        "Tate's desk, under the warrant. In the top drawer, under a box of pens.",
        { evidence: "E031", visible: tateWarrant },
      ),
      inspect(
        "tate_office_desk",
        "Desk, center drawer",
        "drawer",
        { x: 50, y: 66, w: 14, h: 8 },
        "The center drawer",
        "Folded small at the back of the center drawer: a sheet of yellow legal paper written in black felt pen, in block capitals, with a slanting initial at the bottom. Det. Harris bags it, photographs it, and sends the photograph to Det. Collins in Washington.",
        // Inspecting it again never rings Det. Collins twice.
        { visible: tateWarrant, effects: [{ when: { not: { flag: "note_found" } }, then: [{ setFlag: "note_found" }, { incomingCall: "call_collins_note" }] }] },
      ),
      inspect(
        "to_cabinet",
        "File cabinet",
        "filing",
        { x: 70, y: 24, w: 12, h: 44 },
        "The file cabinet",
        "A two-drawer file cabinet, unlocked. Client files in the top drawer, by name. The bottom drawer holds the company's own paperwork.",
        { evidence: "E033", visible: tateWarrant },
      ),
      inspect(
        "to_window",
        "Window on Clarendon Boulevard",
        "window",
        { x: 84, y: 6, w: 14, h: 34 },
        "Clarendon Boulevard",
        "Second floor over a dry cleaner and a bank branch. Below, the building's small lot: three parking spaces marked TPS, two of them taken by gray Chevrolets.",
        { textAfter: [{ requires: tateWarrant, text: "Second floor over a dry cleaner and a bank branch. Below, an Arlington police car is parked across the building's small lot, behind three spaces marked TPS." }] },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L12 12 Saddle Ridge Lane, Bristow (secret)
  // -------------------------------------------------------------------------
  {
    id: "holding_house",
    area: "bristow",
    name: "12 Saddle Ridge Lane",
    subtitle: "Bristow, Prince William County",
    mapPin: { x: 30, y: 64 },
    secret: true,
    background: "loc.holding_house",
    ambience: "amb.holding_house",
    available: rescued,
    onMap: true,
    hotspots: [
      inspect(
        "hh_kitchen",
        "The kitchen",
        "desk",
        { x: 2, y: 40, w: 24, h: 24 },
        "The kitchen",
        "A rental kitchen with nothing on the walls. A coffee maker still warm, one mug on the counter, a carton of eggs, grocery bags folded flat. On the counter by the side door, a phone charger with no phone. Evidence tags on a box of heavy black zip ties under the sink.",
      ),
      inspect(
        "hh_duffel",
        "Empty duffel on a chair",
        "bag",
        { x: 30, y: 54, w: 14, h: 14 },
        "The duffel",
        "A black canvas duffel on a kitchen chair, unzipped and empty, an evidence tag on its handle. A Prince William County officer says a document wallet came out of it this morning and went to Det. Harris.",
      ),
      inspect(
        "hh_basement",
        "Basement stairs",
        "door",
        { x: 56, y: 14, w: 16, h: 64 },
        "The basement",
        "A narrow wooden staircase down from the kitchen to an unfinished basement: a furnace, a water heater, and under the stairs, a door.",
        { evidence: "E035" },
      ),
      inspect(
        "hh_window",
        "Front window",
        "window",
        { x: 78, y: 6, w: 20, h: 34 },
        "Saddle Ridge Lane",
        "A new cul-de-sac of identical vinyl-sided houses, half of them with SOLD signs still on the lawns. Police cars along the curb. Across the road at No. 15, a doorbell camera above a wreath.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L13 Alexandria Police Department
  // -------------------------------------------------------------------------
  {
    id: "police",
    area: "alexandria",
    name: "Alexandria Police Department",
    subtitle: "Criminal Investigations, Wheeler Avenue, Alexandria",
    mapPin: { x: 72, y: 57 },
    background: "loc.police",
    ambience: "amb.police",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "pd_board",
        "Det. Harris's whiteboard",
        "corkboard",
        { x: 0, y: 4, w: 22, h: 40 },
        "Det. Harris's whiteboard",
        "18-034417 across the top in blue marker. A printed DMV photo of Claire Donovan. MISSING ADULT, and under it VOLUNTARY? with the question mark gone over twice.",
        {
          textAfter: [
            { requires: { event: "RE07" }, text: "18-034417 across the top. The DMV photo of Claire Donovan. VOLUNTARY? has been wiped off and ABDUCTION written in its place in red. A map of western Prince William County is taped beside it, with a circle around Gainesville." },
            { requires: rescued, text: "18-034417 across the top. The DMV photo of Claire Donovan, and under it, in red, FOUND ALIVE 12/14 0610. Somebody has drawn a small check mark beside it." },
          ],
        },
      ),
      person("pd_harris", "Det. Ross Harris", "harris", { x: 28, y: 22, w: 12, h: 64 }),
      person("pd_claire", "Claire Donovan, in the family room", "donovan", { x: 50, y: 22, w: 12, h: 64 }, rescued),
      person("pd_tate", "Brandon Tate, in the interview room, with counsel", "tate", { x: 68, y: 22, w: 12, h: 64 }, rescued),
      inspect(
        "pd_window",
        "Window",
        "window",
        { x: 84, y: 6, w: 14, h: 34 },
        "Wheeler Avenue",
        "Rain on the parking lot, patrol cars nose to tail, the gray block of the courthouse beyond the trees.",
      ),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
