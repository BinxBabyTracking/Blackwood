import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { COURIER_RECT, FBI_SAFE_RECT, LAB_CARRIER_RECT, LAB_DRIVE_RECT, LAB_HURST_PHONE_RECT, WALLACE_REPORT_RECT } from "./desk";
import { briefed, chenKnown, lyonsKnown, reportAvailable } from "./story";

/*
 * Scene layout for S01 C02. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art; refit every one once its painting lands.
 *
 * Scene items follow the build contract in docs/S001C02-timeline.md. The
 * Ashcroft is one map pin (the lobby) with its sub-scenes reached on foot:
 * the guest elevators to the sixth-floor corridor and Room 614; from Chapter 2
 * the security office door in the lobby, service door S6-2 into the service
 * vestibule, and the service elevator down to the loading dock (which is also
 * on the map). The farmhouse's upstairs room opens with the entry (RE07).
 *
 * Two scenes change state: Kestrel's office after the Montgomery County Police
 * search (env `kestrel` = `searched`) and the farmhouse (env `holding` =
 * `watch`, then `cleared`).
 */

const searched: Condition = { flag: "kestrel_search" };
const entered: Condition = { event: "RE07" };

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
  lb_natalie: "art.figure_natalie",
  lb_monroe: "art.figure_monroe",
  lb_collins: "art.figure_collins",
  lb_wallace: "art.figure_wallace",
  lb_grant: "art.figure_grant",
  so_wallace: "art.figure_wallace",
  ld_hurst: "art.figure_hurst",
  eb_okoye: "art.figure_okoye",
  co_chen: "art.figure_chen",
  mh_rourke: "art.figure_rourke",
  ks_lyons: "art.figure_lyons",
  hp_collins: "art.figure_collins",
  hp_quinlan: "art.figure_quinlan",
  hp_jonathan: "art.figure_jonathan",
  hp_lyons: "art.figure_lyons",
  hp_van: "art.obj_van",
};

const DESK_DELIVERIES = ["wallace_update", "courier_client_list", "lab_carrier", "lab_hurst_phone", "lab_drive", "fbi_safe"];
const PHONE_CALLS = ["call_natalie_garage", "call_wallace_bypass", "call_rourke", "call_chen_release", "call_collins_move", "call_quinlan_safe", "call_bennett_board"];
const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] };
const MAP_NUDGE: Condition = { all: [briefed, { not: { inspected: "office_map" } }] };

export const locations: LocationDef[] = [
  // -------------------------------------------------------------------------
  // L01 The Pittsburgh field office (hub), with the series' rolling board
  // -------------------------------------------------------------------------
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 90, y: 10 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file: Jonathan Ellery", "folder", { x: 27, y: 66, w: 15, h: 22 }, "casefile"),
      deskItem("office_wallace", "Envelope from the Ashcroft's security office", "wallace_update", "E009", WALLACE_REPORT_RECT, "obj.security_envelope"),
      deskItem("office_lab_carrier", "Carrier records", "lab_carrier", "E026", LAB_CARRIER_RECT, "obj.labfolder"),
      deskItem("office_lab_hurst", "Extraction report: Hurst's phone", "lab_hurst_phone", "E030", LAB_HURST_PHONE_RECT, "obj.labfolder"),
      deskItem("office_courier", "Capital Courier envelope", "courier_client_list", "E033", COURIER_RECT, "obj.courier_sealed", "obj.courier_open"),
      deskItem("office_lab_drive", "FBI summary: the encrypted drive", "lab_drive", "E023", LAB_DRIVE_RECT, "obj.fbi_folder"),
      deskItem("office_fbi_safe", "FBI evidence envelope", "fbi_safe", "E036", FBI_SAFE_RECT, "obj.fbi_envelope"),
      {
        ...panel("office_board", "Case board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      {
        ...panel("office_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"),
        attention: { any: PHONE_CALLS.map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("office_map", "Map of Washington, D.C., and Maryland", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: MAP_NUDGE,
        callout: { text: "Tap here to travel", when: MAP_NUDGE },
      },
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", { any: DESK_DELIVERIES.map((d) => ({ deliveryOpened: d })) }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "Sleet over the Point, the rivers the color of pewter, the bridges strung with brake lights for the holiday traffic. Washington is four hours south. Natalie is waiting in the car downstairs with the engine running.",
      ),
      {
        ...panel("office_report", "Final report", "sprite", { x: 82, y: 72, w: 16, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
      {
        // The series' rolling board: wheeled in at the end of S01 C01, it stays in the office for the rest of the series.
        ...panel("office_rolling", "Rolling board", "sprite", { x: 56, y: 44, w: 13, h: 26 }, "rolling"),
        sprite: [{ image: "obj.rolling_board" }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L02 The Ashcroft Hotel, lobby
  // -------------------------------------------------------------------------
  {
    id: "lobby",
    area: "downtown_dc",
    name: "The Ashcroft Hotel",
    subtitle: "Lobby, 1214 Fifteenth Street NW, Washington, D.C.",
    mapPin: { x: 66, y: 66 },
    mapTag: "MISSING PERSON",
    background: "loc.lobby",
    ambience: "amb.lobby",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "lb_doors",
        "Doors to Fifteenth Street",
        "door",
        { x: 0, y: 10, w: 11, h: 50 },
        "The Fifteenth Street doors",
        "Brass-framed glass doors onto Fifteenth Street, a doorman's podium to one side, a camera dome above. Taxis and ride shares two deep at the curb in the sleet. Everyone who comes in this way is on the lobby camera, and so is everyone who leaves.",
      ),
      person("lb_natalie", "Natalie Ellery, on a sofa by the window", "natalie", { x: 12, y: 30, w: 9, h: 56 }),
      person("lb_monroe", "Tessa Monroe, at the front desk", "monroe", { x: 22, y: 28, w: 10, h: 58 }),
      inspect(
        "lb_camera",
        "Lobby camera",
        "camera",
        { x: 33, y: 2, w: 8, h: 10 },
        "The lobby camera",
        "A smoked-glass dome in the ceiling over the front desk, with a clear view of the desk and the Fifteenth Street doors. A second dome watches the guest elevators.",
      ),
      inspect(
        "lb_flowers",
        "Thanksgiving flowers",
        "plant",
        { x: 33, y: 60, w: 8, h: 14 },
        "The Thanksgiving arrangement",
        "A tall arrangement of rust and gold chrysanthemums, wheat stalks and small white pumpkins on a round table in the middle of the lobby. A card tucked into it: delivered Sunday afternoon. The lobby is full of luggage and families.",
      ),
      person("lb_collins", "Det. Nadia Collins", "collins", { x: 42, y: 30, w: 9, h: 56 }, { not: { event: "RE06" } }),
      person("lb_wallace", "Douglas Wallace, hotel security", "wallace", { x: 52, y: 30, w: 9, h: 56 }, { not: { chapter: 2 } }),
      door("lb_security", "Security office", "security_office", { x: 52, y: 8, w: 9, h: 18 }, { chapter: 2 }),
      person("lb_grant", "Celia Grant, at the door of the general manager's office", "grant", { x: 62, y: 26, w: 9, h: 60 }),
      door("lb_elevators", "Guest elevators to the sixth floor", "corridor_6", { x: 74, y: 14, w: 14, h: 56 }),
      inspect(
        "lb_valet",
        "Valet podium",
        "desk",
        { x: 89, y: 40, w: 10, h: 30 },
        "The valet podium",
        "A podium by the passage to the garage ramp, a board of numbered hooks behind it. Ticket 2286 is still on its hook: a 2014 Honda Accord with Virginia plates, parked Sunday afternoon and never called for.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 The sixth-floor corridor (sub-scene)
  // -------------------------------------------------------------------------
  {
    id: "corridor_6",
    area: "downtown_dc",
    name: "Sixth-Floor Corridor",
    subtitle: "The Ashcroft Hotel, sixth floor, north wing",
    background: "loc.corridor_6",
    ambience: "amb.corridor_6",
    available: briefed,
    onMap: false,
    hotspots: [
      door("c6_elevators", "Guest elevators down to the lobby", "lobby", { x: 0, y: 10, w: 12, h: 60 }),
      inspect(
        "c6_camera",
        "Camera C6-1",
        "camera",
        { x: 14, y: 2, w: 8, h: 10 },
        "Camera C6-1",
        "A smoked-glass dome above the elevator landing, facing north up the corridor. From under it you can see how far its view really goes: about sixty feet, to somewhere around 608. Past that the corridor is just a bright rectangle at the far end.",
      ),
      inspect(
        "c6_corridor",
        "The corridor",
        "hallway",
        { x: 24, y: 30, w: 18, h: 40 },
        "The corridor",
        "From the elevator landing, a long straight corridor runs north, rooms 601 to 616, patterned carpet, brass sconces. Camera C6-1 watches from a dome above the landing. The far end is a bright rectangle: the EXIT sign, the ice alcove and the gray service door S6-2 with its reader, two doors past 614.",
      ),
      inspect(
        "c6_616",
        "Room 616",
        "door",
        { x: 44, y: 24, w: 8, h: 40 },
        "Room 616",
        "A \"Do Not Disturb\" card still hangs on the handle of 616. Its guests checked out at 5 AM on Monday, and nobody has taken the card down. Wallace couldn't reach them.",
      ),
      door("c6_614", "Room 614", "room_614", { x: 54, y: 22, w: 9, h: 44 }),
      inspect(
        "c6_ice",
        "Ice alcove",
        "alcove",
        { x: 65, y: 30, w: 9, h: 30 },
        "The ice alcove",
        "A recess off the corridor with an ice machine humming to itself and a vending machine. From in here, you can't see the elevator landing, and the landing can't see you.",
      ),
      inspect(
        "c6_s6_2_locked",
        "Service door S6-2",
        "door",
        { x: 77, y: 18, w: 12, h: 52 },
        "Service door S6-2",
        "A plain gray steel door under the EXIT sign, flush with the wall, a card reader beside it and a small alarm keypad above that. STAFF ONLY. It's locked. Wallace has the only override, and on Monday he hasn't seen any reason to use it.",
        { visible: { not: { chapter: 2 } } },
      ),
      door("c6_s6_2", "Service door S6-2", "service_corridor", { x: 77, y: 18, w: 12, h: 52 }, { chapter: 2 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L03 Room 614 (sub-scene)
  // -------------------------------------------------------------------------
  {
    id: "room_614",
    area: "downtown_dc",
    name: "Room 614",
    subtitle: "The Ashcroft Hotel, sixth floor, north end",
    background: "loc.room_614",
    ambience: "amb.room_614",
    available: briefed,
    onMap: false,
    hotspots: [
      door("r6_door", "Back to the corridor", "corridor_6", { x: 0, y: 8, w: 11, h: 62 }),
      inspect(
        "r6_closet",
        "Closet",
        "closet",
        { x: 12, y: 10, w: 12, h: 50 },
        "The closet",
        "A charcoal suit, a white shirt and a blue tie on hangers, pressed for the morning, black dress shoes lined up beneath. Something stiff is folded into the suit's inside breast pocket.",
        { evidence: "E017" },
      ),
      inspect(
        "r6_bed",
        "Bed",
        "bed",
        { x: 26, y: 46, w: 26, h: 26 },
        "The bed",
        "Made, the cover rumpled on top, both pillows propped against the headboard: somebody lay on it, nobody slept in it.",
      ),
      inspect(
        "r6_bedside",
        "Bedside table",
        "table",
        { x: 53, y: 46, w: 8, h: 10 },
        "The bedside table",
        "The lamp shade is knocked crooked on its harp. A water glass lies on its side, with a dried ring on the carpet below it. Beside the lamp, face down, his phone.",
        { evidence: "E003" },
      ),
      inspect(
        "r6_drawer",
        "Nightstand drawer",
        "drawer",
        { x: 53, y: 58, w: 8, h: 8 },
        "The nightstand drawer",
        "A hotel directory, a Bible, a pad of Ashcroft notepaper. Under the directory, something small and black with an elastic band around it.",
        { evidence: "E024" },
      ),
      inspect(
        "r6_window",
        "Window",
        "window",
        { x: 63, y: 4, w: 16, h: 36 },
        "The window",
        "Fifteenth Street, six floors down: taxis, umbrellas, the bare trees of Thomas Circle. The window opens four inches and no further.",
      ),
      inspect(
        "r6_outlet",
        "Desk outlet",
        "desk",
        { x: 63, y: 56, w: 9, h: 10 },
        "The desk",
        "The desk chair is turned out from the desk, as if someone got up from it in a hurry. Under the desk lamp, a black cable runs from the outlet up onto the blotter.",
        { evidence: "E004" },
      ),
      inspect(
        "r6_wallet",
        "Wallet on the desk",
        "wallet",
        { x: 73, y: 50, w: 8, h: 8 },
        "The wallet",
        "A brown leather wallet beside a valet ticket (2286) and a Honda key fob. Driver's license, two cards, forty dollars, hotel key 1. Tucked behind the license, a cream business card.",
        { evidence: "E021" },
      ),
      inspect(
        "r6_suitcase",
        "Suitcase",
        "suitcase",
        { x: 82, y: 56, w: 16, h: 20 },
        "The suitcase",
        "Open on the luggage rack, half unpacked, packed for two nights: shirts, a sweater, socks rolled in pairs, a phone charger. Nothing obviously missing. The only shoes in the room are the dress shoes in the closet.",
      ),
      inspect(
        "r6_bathroom",
        "Bathroom",
        "door",
        { x: 82, y: 8, w: 16, h: 40 },
        "The bathroom",
        "Toiletries laid out in a row on the counter: razor, toothbrush, a travel kit zipped shut. One towel used, folded over the rail.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 Hotel security office (sub-scene, Chapter 2)
  // -------------------------------------------------------------------------
  {
    id: "security_office",
    area: "downtown_dc",
    name: "Hotel Security Office",
    subtitle: "The Ashcroft Hotel, lower lobby",
    background: "loc.security_office",
    ambience: "amb.security_office",
    available: { chapter: 2 },
    onMap: false,
    hotspots: [
      door("so_door", "Back to the lobby", "lobby", { x: 0, y: 10, w: 10, h: 60 }),
      inspect(
        "so_monitors",
        "Monitor wall",
        "screen",
        { x: 12, y: 4, w: 30, h: 30 },
        "The monitor wall",
        "Sixteen screens in a grid, cycling through the guest cameras: lobby, entrances, the garage ramp, elevators, the landings floor by floor. Page 1 of 3. Wallace shows you how to page through: page 2 is the kitchen and the ballroom corridors, page 3 the loading dock and the employee entrance.",
      ),
      inspect(
        "so_terminal",
        "Access-control terminal",
        "computer",
        { x: 12, y: 50, w: 12, h: 12 },
        "The access-control terminal",
        "The workstation for the staff access system: service doors, the dock, the employee entrance, the vendor badges. It is separate from the guest room locks. Wallace prints Sunday night for you.",
        { evidence: "E008" },
      ),
      person("so_wallace", "Douglas Wallace", "wallace", { x: 28, y: 36, w: 10, h: 56 }),
      inspect(
        "so_workorders",
        "Work-order board",
        "corkboard",
        { x: 44, y: 8, w: 14, h: 24 },
        "The work-order board",
        "A corkboard by the door, where Engineering posts its open work orders every Friday, as policy says it must.",
        { evidence: "E010" },
      ),
      inspect(
        "so_badge",
        "Badge station",
        "computer",
        { x: 44, y: 50, w: 12, h: 12 },
        "The badge station",
        "A card printer and a small screen for temporary credentials, with a binder of credential records beside it. Wallace pulls up T-07, then goes to the file cabinet and comes back with something clipped behind the printout.",
        { evidence: "E015", visible: { hasEvidence: "E008" } },
      ),
      inspect(
        "so_binder",
        "Incident binder",
        "binder",
        { x: 60, y: 52, w: 12, h: 10 },
        "The incident binder",
        "Monday's page, in Wallace's square printing: \"10:21 AM. Welfare check, 614, with housekeeping supervisor. Unoccupied. Phone on bedside table. 10:52 AM. Lock read. 11:05 AM. Ms. Grant notified emergency contact.\" Below, in a different pen: \"Service side?\"",
      ),
      inspect(
        "so_keys",
        "Key cabinet",
        "cabinet",
        { x: 76, y: 10, w: 10, h: 30 },
        "The key cabinet",
        "A locked steel key cabinet on the wall. Wallace opens it: master keys, the stair-door override, and two small round keys on a ring labeled S1/S2 IND. \"Elevator independent service. One set here, one set in Engineering.\"",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Sixth-floor service vestibule and service elevator (sub-scene, Chapter 2)
  // -------------------------------------------------------------------------
  {
    id: "service_corridor",
    area: "downtown_dc",
    name: "Sixth-Floor Service Vestibule",
    subtitle: "The Ashcroft Hotel, behind door S6-2",
    background: "loc.service_corridor",
    ambience: "amb.service_corridor",
    available: { chapter: 2 },
    onMap: false,
    hotspots: [
      door("sc_door", "Door S6-2 to the guest corridor", "corridor_6", { x: 0, y: 10, w: 12, h: 62 }),
      inspect(
        "sc_keypad",
        "S6-2 reader and alarm keypad",
        "panel",
        { x: 14, y: 30, w: 8, h: 14 },
        "The reader and the keypad",
        "On this side of S6-2, a push bar, a request-to-exit sensor above the frame, and the alarm keypad for the door: a small gray box with a numeric pad and two lights, green for armed, amber for bypass. Engineering and Security codes only.",
      ),
      inspect(
        "sc_hose",
        "Fire hose cabinet",
        "cabinet",
        { x: 24, y: 24, w: 12, h: 30 },
        "The fire hose cabinet",
        "A red-framed glass cabinet with a folded hose and an extinguisher, the inspection tag current. The concrete floor in front of it has been mopped recently, around it but not under it.",
      ),
      inspect(
        "sc_scuff",
        "Scuff on the wall",
        "wall",
        { x: 40, y: 58, w: 10, h: 8 },
        "The scuff",
        "Concrete floor, a steel service elevator, a fire hose cabinet. On the painted wall beside the elevator doors, at knee height, a black rubber scuff mark, fresh and sharp-edged, as if a shoe dragged along it. The paint around it is otherwise clean.",
      ),
      door("sc_elevator", "Service elevator S1, down to B1 and the dock", "loading_dock", { x: 52, y: 10, w: 18, h: 64 }),
      inspect(
        "sc_panel",
        "Elevator panel",
        "panel",
        { x: 72, y: 30, w: 9, h: 16 },
        "The elevator panel",
        "A locked service panel beside S1's doors. Wallace opens it with his key and prints the controller's event history on the little thermal printer inside.",
        { evidence: "E014" },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 Loading entrance and engineering shop, B1 (Chapter 2)
  // -------------------------------------------------------------------------
  {
    id: "loading_dock",
    area: "downtown_dc",
    name: "The Ashcroft Loading Dock",
    subtitle: "Loading entrance and engineering shop, B1, on the service alley",
    mapPin: { x: 69, y: 70 },
    background: "loc.loading_dock",
    ambience: "amb.loading_dock",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      door("ld_elevator", "Service elevator S1, up to six", "service_corridor", { x: 0, y: 10, w: 12, h: 60 }),
      inspect(
        "ld_locker",
        "Locker 41",
        "locker",
        { x: 14, y: 20, w: 10, h: 40 },
        "Locker 41",
        "Inside the engineering shop, a row of gray staff lockers. Wallace opens 41 with his master key, on Ms. Grant's say-so, with you watching.",
        { evidence: "E029", visible: { deduction: "D06" } },
      ),
      inspect(
        "ld_shop",
        "Engineering shop door",
        "door",
        { x: 26, y: 10, w: 10, h: 40 },
        "The engineering shop",
        "A door propped open on a cluttered shop: workbenches, a parts cage, a radio playing sports talk, a computer marked ENG-1, and a row of staff lockers along the back wall.",
      ),
      person("ld_hurst", "Kevin Hurst, at the engineering shop", "hurst", { x: 38, y: 28, w: 9, h: 58 }),
      inspect(
        "ld_office",
        "Dock office monitor",
        "screen",
        { x: 49, y: 20, w: 14, h: 22 },
        "The dock office",
        "A glassed-in dock office with a desk, a space heater and a monitor showing one camera: DOCK-1, over bays 1 and 2. The recorder underneath goes back thirty days. Nobody upstairs looked at it on Monday.",
        { evidence: "E011" },
      ),
      inspect(
        "ld_clipboard",
        "Receiving clipboard",
        "clipboard",
        { x: 49, y: 46, w: 8, h: 10 },
        "The receiving clipboard",
        "A clipboard on a nail by the dock office window, the receiving log for the week on top.",
        { evidence: "E012" },
      ),
      inspect(
        "ld_door",
        "Door D-B1-3",
        "door",
        { x: 64, y: 16, w: 8, h: 40 },
        "Dock personnel door D-B1-3",
        "A steel personnel door from the B1 service corridor onto the dock apron, a card reader on the outside, a push bar on the inside. Through it, eight steps to bay 2.",
      ),
      inspect(
        "ld_bay",
        "Bay 2",
        "bay",
        { x: 74, y: 10, w: 25, h: 40 },
        "Bay 2",
        "Two loading bays under a steel canopy, their roll-up doors open to the alley. Bay 2 is empty, swept, a florist's cardboard sleeve still caught against the bumper from Sunday afternoon.",
      ),
      inspect(
        "ld_compactor",
        "Compactor",
        "machine",
        { x: 74, y: 54, w: 12, h: 20 },
        "The compactor",
        "A green trash compactor beside bay 2, with the kitchen's wheeled bins lined up in front of it. From here you look straight into bay 2, ten feet away.",
      ),
      inspect(
        "ld_bench",
        "Smoking bench",
        "bench",
        { x: 88, y: 60, w: 11, h: 14 },
        "The smoking bench",
        "A wooden bench against the wall at the end of the dock, a coffee can of sand and a dented ashtray tin. Pinned under the tin, folded, a photocopied page with a note in pencil on the back: \"For the investigator. L.B.\"",
        { evidence: "E013" },
      ),
      inspect(
        "ld_alley",
        "The service alley",
        "road",
        { x: 60, y: 78, w: 39, h: 20 },
        "The service alley",
        "A narrow alley behind the hotel, wet and lit orange by a single wall lamp. It runs out to the street at both ends. No camera faces it from anywhere but the dock.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 Eastbridge Systems, Reston (Chapter 3)
  // -------------------------------------------------------------------------
  {
    id: "eastbridge",
    area: "reston",
    name: "Eastbridge Systems",
    subtitle: "11900 Sunrise Valley Drive, Reston, Virginia",
    mapPin: { x: 18, y: 62 },
    background: "loc.eastbridge",
    ambience: "amb.eastbridge",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      inspect(
        "eb_badge",
        "Lobby badge desk",
        "desk",
        { x: 0, y: 40, w: 16, h: 24 },
        "The badge desk",
        "A security desk under a sign about escort requirements. The guard prints you a red VISITOR badge, ESCORT REQUIRED, and a lanyard you have to wear facing out. Your phone goes in a locker.",
      ),
      inspect(
        "eb_jonathan",
        "Jonathan's office",
        "door",
        { x: 18, y: 10, w: 16, h: 40 },
        "Jonathan's office",
        "Through the glass, from the corridor: a small office, very tidy, a whiteboard wiped clean, a framed photo of an older woman and a younger one on a porch. Compliance has sealed it. You may look, not enter.",
      ),
      person("eb_okoye", "David Okoye", "okoye", { x: 40, y: 26, w: 10, h: 60 }),
      inspect(
        "eb_desk",
        "Okoye's desk",
        "desk",
        { x: 54, y: 52, w: 14, h: 10 },
        "Okoye's desk",
        "A very clean desk: a legal pad, a fountain pen, a copy of the company's code of conduct with tabs in it. Open in the middle, a thin file he has set out for you.",
        { evidence: "E019", visible: { talkedTo: "okoye" } },
      ),
      inspect(
        "eb_window",
        "Window",
        "window",
        { x: 72, y: 4, w: 26, h: 36 },
        "Sunrise Valley Drive",
        "Glass office buildings set back in landscaped lawns along the Dulles corridor, each with a parking garage the size of itself. Level 3 of Eastbridge's garage is directly across.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 Law Office of Irene Chen (Chapter 3, once Chen is known)
  // -------------------------------------------------------------------------
  {
    id: "chen_office",
    area: "downtown_dc",
    name: "Law Office of Irene Chen",
    subtitle: "Suite 402, 1150 Seventeenth Street NW, Washington, D.C.",
    mapPin: { x: 61, y: 62 },
    secret: true,
    background: "loc.chen_office",
    ambience: "amb.chen_office",
    available: { all: [{ chapter: 3 }, chenKnown] },
    onMap: true,
    hotspots: [
      inspect(
        "co_shelf",
        "Bookshelf",
        "bookshelf",
        { x: 2, y: 8, w: 18, h: 50 },
        "The bookshelf",
        "The D.C. Rules of Professional Conduct, federal sentencing guidelines, the False Claims Act annotated, rows of bound transcripts. One shelf of novels, paperbacks, very worn.",
      ),
      inspect(
        "co_safe",
        "Document safe",
        "safe",
        { x: 22, y: 50, w: 10, h: 16 },
        "The document safe",
        "A gray fire safe beside the filing cabinets, a numbered log on a clipboard on top: deposits in, deposits out, each with a seal number and two signatures.",
        { textAfter: [{ requires: { hasEvidence: "E022" }, text: "A gray fire safe beside the filing cabinets. On the log on top, under deposit 18-114, a new line in Irene Chen's hand: released to the investigator, with Det. Collins on the telephone, and a chain-of-custody number." }] },
      ),
      person("co_chen", "Irene Chen", "chen", { x: 36, y: 26, w: 10, h: 60 }),
      inspect(
        "co_desk",
        "Chen's desk",
        "desk",
        { x: 50, y: 54, w: 16, h: 12 },
        "Chen's desk",
        "Neat stacks, each squared to the edge of the desk, a yellow sticky note on each. A desk calendar open to the week: Sunday, 1:00 PM, \"J.E.\" Monday, 8:15 AM, \"J.E.\" and 9:30 AM, \"TF, Judiciary Sq.\"",
      ),
      inspect(
        "co_window",
        "Window",
        "window",
        { x: 70, y: 4, w: 28, h: 36 },
        "Seventeenth Street",
        "Four floors down, Seventeenth Street at lunch: lobbyists on phones, food trucks, a bike courier weaving through stopped traffic.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 Meridian Advisory Group headquarters, eighth floor (RE04)
  // -------------------------------------------------------------------------
  {
    id: "meridian_hq",
    area: "downtown_dc",
    name: "Meridian Advisory Group",
    subtitle: "Corporate Intelligence, eighth floor, 1620 K Street NW, Washington, D.C.",
    mapPin: { x: 63, y: 58 },
    secret: true,
    background: "loc.meridian_hq",
    ambience: "amb.meridian_hq",
    available: { event: "RE04" },
    onMap: true,
    hotspots: [
      inspect(
        "mh_plaque",
        "Lobby plaque",
        "sign",
        { x: 0, y: 14, w: 12, h: 24 },
        "The plaque",
        "A brushed-steel plaque in the ground-floor lobby, the firm's name in thin capitals: MERIDIAN ADVISORY GROUP. FLOORS 8 TO 10. Beneath it, three cities in a row: WASHINGTON. PITTSBURGH. CHANTILLY.",
      ),
      inspect(
        "mh_reception",
        "Reception desk",
        "desk",
        { x: 14, y: 52, w: 16, h: 12 },
        "Eighth-floor reception",
        "A long pale-oak reception desk with nothing on it but a phone and an orchid. The glass doors behind it need a card. The receptionist already knows your name.",
      ),
      person("mh_rourke", "Julian Rourke", "rourke", { x: 38, y: 24, w: 10, h: 62 }, { not: { event: "RE08" } }),
      inspect(
        "mh_shelf",
        "Rourke's bookshelf",
        "bookshelf",
        { x: 52, y: 8, w: 14, h: 30 },
        "Rourke's bookshelf",
        "Through his open door: a few well-chosen books on intelligence history and negotiation, a framed photograph of a sailboat, a squash trophy. No files anywhere in sight.",
      ),
      inspect(
        "mh_credenza",
        "Credenza",
        "cabinet",
        { x: 52, y: 54, w: 16, h: 12 },
        "The credenza",
        "A low walnut credenza behind Rourke's desk, its doors closed, a single crystal decanter on top.",
        { textAfter: [{ requires: { event: "RE08" }, text: "The credenza's doors stand open on an empty wall safe, its door ajar. FBI evidence tape across the office doorway." }] },
      ),
      inspect(
        "mh_window",
        "Window",
        "window",
        { x: 72, y: 4, w: 26, h: 36 },
        "K Street",
        "Eight floors down, K Street's office blocks march east toward Franklin Square, every window lit. The executive floor is two above, its elevator button behind a card reader.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L11 Kestrel Protective Group, Rockville (Chapter 3, once Lyons is known)
  // -------------------------------------------------------------------------
  {
    id: "kestrel",
    area: "rockville",
    name: "Kestrel Protective Group",
    subtitle: "Suite 210, 1100 East Gude Drive, Rockville, Maryland",
    mapPin: { x: 44, y: 38 },
    secret: true,
    background: { env: "kestrel", states: { open: "loc.kestrel", searched: "loc.kestrel_searched" } },
    ambience: "amb.kestrel",
    available: { all: [{ chapter: 3 }, lyonsKnown] },
    onMap: true,
    hotspots: [
      inspect(
        "ks_fleet",
        "Fleet board",
        "corkboard",
        { x: 0, y: 8, w: 14, h: 30 },
        "The fleet board",
        "A whiteboard grid of the company's vehicles and who has them, in marker. Four sedans, two vans. Beside the second van: \"TC-2: G.L.\"",
        { textAfter: [{ requires: searched, text: "The fleet board has been photographed and left in place, an evidence tag taped to its corner. Beside the second van, still: \"TC-2: G.L.\"" }] },
      ),
      inspect(
        "ks_whiteboard",
        "Staff whiteboard",
        "corkboard",
        { x: 16, y: 8, w: 16, h: 26 },
        "The staff whiteboard",
        "The week's assignments: guard posts, an executive protection detail, two background checks. On the bottom row, in the same hand: \"G.L.: Sun / Mon / Tue: K-112.\"",
      ),
      person("ks_lyons", "Garrett Lyons", "lyons", { x: 36, y: 26, w: 10, h: 60 }, { not: searched }),
      inspect(
        "ks_ops",
        "Ops desk",
        "computer",
        { x: 50, y: 40, w: 16, h: 14 },
        "The ops desk",
        "A small alarm-monitoring desk for Kestrel's clients: a screen listing site names and status lights, a headset, a printer. K-112 is on the list, green.",
        { textAfter: [{ requires: searched, text: "The monitoring screen is still running, site names and status lights. K-112 is on the list. The printer beside it has been left alone; its tray is full." }] },
      ),
      inspect(
        "ks_printer",
        "Printer tray",
        "printer",
        { x: 50, y: 58, w: 8, h: 8 },
        "The printer tray",
        "The monitoring desk's printer prints a daily site report for every client at six in the evening. Tonight's are still in the tray.",
        { evidence: "E031", visible: searched },
      ),
      inspect(
        "ks_cabinet",
        "File cabinet",
        "filing",
        { x: 70, y: 30, w: 10, h: 34 },
        "The file cabinet",
        "Drawers pulled out, files fanned for the photographs. A Montgomery County Police officer hands you the folder they flagged: tag 18-MC-3391.",
        { evidence: "E028", visible: searched },
      ),
      inspect(
        "ks_binder",
        "Binder labeled NORTHGATE",
        "binder",
        { x: 82, y: 50, w: 10, h: 10 },
        "The Northgate binder",
        "A black ring binder from Lyons's own desk drawer, its spine labeled NORTHGATE in tape. Loan files, monthly disbursement sheets, and at the front, a few pages on someone else's letterhead. MCPD tag 18-MC-3394.",
        { evidence: "E034", visible: searched },
      ),
      inspect(
        "ks_window",
        "Window",
        "window",
        { x: 82, y: 6, w: 16, h: 30 },
        "East Gude Drive",
        "An office park beside a rail line: low brick buildings, a parking lot, the Metro's red-line trains going by on the embankment. Two marked parking spaces out front: RESERVED KESTREL.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L12 4 Sawmill Hollow Road, Frederick County (secret until RE06)
  // -------------------------------------------------------------------------
  {
    id: "holding_property",
    area: "frederick_county",
    name: "4 Sawmill Hollow Road",
    subtitle: "Frederick County, Maryland",
    mapPin: { x: 30, y: 14 },
    secret: true,
    background: { env: "holding", states: { watch: "loc.holding_property", cleared: "loc.holding_property_cleared" } },
    ambience: "amb.holding_property",
    available: { event: "RE06" },
    onMap: true,
    hotspots: [
      person("hp_collins", "Det. Nadia Collins", "collins", { x: 2, y: 28, w: 9, h: 58 }),
      person("hp_quinlan", "Special Agent Teresa Quinlan", "quinlan", { x: 12, y: 28, w: 9, h: 58 }, entered),
      inspect(
        "hp_window",
        "Upstairs back window",
        "window",
        { x: 30, y: 8, w: 12, h: 16 },
        "The upstairs back window",
        "From the end of the lane, through Collins's binoculars: a two-story farmhouse on six acres, dark except for the porch light. At the back, upstairs, one window is boarded over from the inside, raw lumber pressed against the glass. Nobody boards up a farmhouse window from the inside.",
        { textAfter: [{ requires: entered, text: "The upstairs back window, still boarded over from the inside. A trooper's flashlight moves behind the gaps in the boards." }] },
      ),
      door("hp_door", "Front door", "holding_room", { x: 30, y: 40, w: 10, h: 30 }, entered),
      inspect(
        "hp_van",
        "The gray van",
        "truck",
        { x: 44, y: 40, w: 22, h: 30 },
        "The van",
        "A gray Ford Transit Connect cargo van, no rear windows, backed up to the porch steps with its side door open. Maryland tag 3CR7719. No signs on the doors, only clean squares where they go. A mattress is half in the side door. A man goes into the house and comes out again with a black duffel.",
        { textAfter: [{ requires: entered, text: "The gray van, still backed to the porch, its side door open and a mattress half in it. An FBI evidence technician is photographing it. A black duffel sits on the floor behind the passenger seat." }] },
      ),
      inspect(
        "hp_duffel",
        "Duffel in the van",
        "bag",
        { x: 52, y: 72, w: 10, h: 10 },
        "Lyons's duffel",
        "A black duffel in the van's side door, an FBI evidence tag on its handle (WFO-1B-0041). Agent Quinlan unzips it for you: an Eastbridge laptop in its bag, a change of clothes, a roll of cable ties, and in the side pocket some folded pages.",
        { evidence: "E035", visible: entered },
      ),
      inspect(
        "hp_lane",
        "The gravel lane",
        "road",
        { x: 24, y: 78, w: 24, h: 18 },
        "The lane",
        "A gravel lane, a quarter mile long, between a pasture fence and a line of bare trees. Unmarked cars along the verge with their lights off, troopers in the ditch. The sky over the ridge is only just going gray.",
        { textAfter: [{ requires: entered, text: "The lane is full of light now: MSP cruisers, two unmarked FBI cars, an ambulance with its back doors open. Someone has brought coffee." }] },
      ),
      inspect(
        "hp_signal",
        "Tell Det. Collins what you've seen",
        "signal",
        { x: 2, y: 88, w: 20, h: 10 },
        "Det. Collins",
        "You tell her: the window boarded from the inside, upstairs at the back, and the van being loaded at the porch in the dark. Collins listens, looks once at the house, and keys her radio. \"That's a reason. All units, go.\"",
        { effects: [{ setFlag: "entry_go" }], visible: { all: [{ inspected: "hp_window" }, { inspected: "hp_van" }, { not: { flag: "entry_go" } }] } },
      ),
      person("hp_jonathan", "Jonathan Ellery, at the ambulance", "jonathan", { x: 70, y: 28, w: 9, h: 58 }, entered),
      person("hp_lyons", "Garrett Lyons, in the back of an MSP car", "lyons", { x: 82, y: 28, w: 9, h: 58 }, entered),
    ],
  },

  // -------------------------------------------------------------------------
  // L12b The upstairs back bedroom (sub-scene, after the entry)
  // -------------------------------------------------------------------------
  {
    id: "holding_room",
    area: "frederick_county",
    name: "The Upstairs Room",
    subtitle: "4 Sawmill Hollow Road, the back bedroom",
    background: "loc.holding_room",
    ambience: "amb.holding_room",
    available: entered,
    onMap: false,
    hotspots: [
      door("hr_back", "Downstairs and out", "holding_property", { x: 0, y: 10, w: 12, h: 62 }),
      inspect(
        "hr_room",
        "The room",
        "room",
        { x: 30, y: 20, w: 40, h: 60 },
        "The upstairs room",
        "The stairs are narrow and steep. At the top, the back bedroom's door stands open, a padlock hanging open from a hasp on the outside. A trooper stands aside to let you in.",
        { evidence: "E032" },
      ),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
