import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { COURIER_RECT, LAB_BARS_RECT, WHITAKER_PHONE_RECT } from "./desk";
import { briefed, reportAvailable } from "./story";

/*
 * Scene layout for S01 C03. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art; refit every one once its painting lands.
 *
 * Scene items follow the build contract in docs/S001C03-timeline.md. Places
 * open by chapter. Three scenes change state: Kane's office once it has been
 * searched (env `kane_office`), locker 12 once Marisol gives the combination,
 * and Kane's floor safe once the warrant is extended (both by flag). Hotspots
 * that share a rectangle are never shown together.
 */

/** Eddie Malone is known (contract): he appears in the truck queue at the same moment. */
const maloneKnown: Condition = { any: [{ hasEvidence: "E009" }, { hasEvidence: "E010" }, { asked: "sullivan_gate4" }] };
const lockerOpen: Condition = { flag: "locker_combo" };
const searched: Condition = { flag: "kane_searched" };
const safeOpen: Condition = { flag: "safe_open" };
const inCustody: Condition = { flag: "fisk_custody" };

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
  gate_sullivan: "art.figure_sullivan",
  gate_malone: "art.figure_malone",
  verif_lindqvist: "art.figure_lindqvist",
  home_marisol: "art.figure_marisol",
  go_gaffney: "art.figure_gaffney",
  ko_kane: "art.figure_kane",
  fy_fisk: "art.figure_fisk",
  fisk_truck: "art.obj_fisk_truck",
  acct_walsh: "art.figure_walsh",
  po_whitaker: "art.figure_whitaker",
  po_fisk: "art.figure_fisk",
};

const CALLS = ["call_marisol_locker", "call_kane", "call_whitaker_phone", "call_whitaker_warrants", "call_whitaker_safe", "call_bennett_board"];
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
    mapPin: { x: 6, y: 10 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file: Hector Navarro", "folder", { x: 27, y: 66, w: 15, h: 22 }, "casefile"),
      deskItem("office_lab_bars", "Lab report: the binder bars", "lab_bar", "E004", LAB_BARS_RECT, "obj.labfolder"),
      deskItem("office_courier", "Courier envelope, no return address", "courier_kane", "E022", COURIER_RECT, "obj.envelope_sealed", "obj.envelope_open"),
      deskItem("office_whitaker", "Envelope from BPD Homicide", "whitaker_phone", "E028", WHITAKER_PHONE_RECT, "obj.police_envelope"),
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
      {
        ...panel("office_map", "Map of Baltimore Harbor", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: MAP_NUDGE,
        callout: { text: "Tap here to travel", when: MAP_NUDGE },
      },
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", {
        any: [{ deliveryOpened: "lab_bar" }, { deliveryOpened: "courier_kane" }, { deliveryOpened: "whitaker_phone" }],
      }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "December over the Point: the rivers the color of pewter, the bridges rust yellow under a low sky, the first dry snow blowing sideways off the roofs. Baltimore is four hours east and south, down the turnpike and across the mountains, on a harbor that never freezes.",
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
  // L02 East Harbor Terminal, Gate 1 and the truck queue
  // -------------------------------------------------------------------------
  {
    id: "terminal_gate",
    area: "east_harbor",
    name: "East Harbor Terminal, Gate 1",
    subtitle: "The main truck gate, off Broening Highway, Baltimore",
    mapPin: { x: 70, y: 44 },
    background: "loc.terminal_gate",
    ambience: "amb.terminal_gate",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "gate_booth",
        "Guard booth",
        "booth",
        { x: 2, y: 20, w: 14, h: 40 },
        "The Gate 1 booth",
        "A steel and glass booth between the inbound lanes, a guard inside with a clipboard and a camera screen, the barrier arms rising and falling for each truck. A laminated sign on the glass: ALL PERSONNEL BADGE IN. NO EXCEPTIONS. A small bunch of grocery-store carnations is taped to the booth's corner post, the cellophane beaded with rain.",
      ),
      inspect(
        "gate_contractor_sign",
        "Contractor lane sign",
        "sign",
        { x: 18, y: 8, w: 10, h: 16 },
        "The contractor lane",
        "A newer green sign on a pole beside the main gate, its bolts still bright: CONTRACTOR LANE, GATE 4. CONTRACTOR BADGES ONLY. An arrow points down the fence line toward the far end of the terminal, away from the booth and the guards.",
      ),
      person("gate_malone", "Eddie Malone, in the truck queue", "malone", { x: 30, y: 26, w: 12, h: 62 }, maloneKnown),
      inspect(
        "gate_queue",
        "The truck queue",
        "truck",
        { x: 44, y: 18, w: 22, h: 28 },
        "The queue",
        "A line of day cabs and chassis idling back along the service road toward Broening Highway, wipers going, drivers with their elbows on the window frames and their phones in their hands. Most of the doors carry a company name. One small red Freightliner near the back says MALONE HAULING.",
      ),
      person("gate_sullivan", "Vince Sullivan", "sullivan", { x: 68, y: 26, w: 12, h: 62 }),
      inspect(
        "gate_union_trailer",
        "Union hall trailer",
        "building",
        { x: 82, y: 12, w: 16, h: 40 },
        "The hall trailer",
        "A double-wide trailer across the road from Gate 1, a local's number painted over the door and a hand-lettered sign in the window: MEMBERS AND RETIREES, COFFEE ON. Someone has hung a black ribbon on the porch rail and put Hector's terminal badge photo in a plastic sleeve beside it.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L03 Staging Area C (the crime scene)
  // -------------------------------------------------------------------------
  {
    id: "staging",
    area: "east_harbor",
    name: "Staging Area C",
    subtitle: "Export staging, East Harbor Terminal",
    mapPin: { x: 78, y: 58 },
    mapTag: "CRIME SCENE",
    background: "loc.staging",
    ambience: "amb.staging",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "staging_gate",
        "Pedestrian gate and reader",
        "gate",
        { x: 2, y: 22, w: 13, h: 44 },
        "The pedestrian gate",
        "A chain-link gate in the fence with a badge reader on a post beside it, its little light red, and a push bar on the inside. Beyond it the vehicle gate is chained, a padlock as big as a fist hanging from the links. A stenciled sign: STAGING AREA C. AUTHORIZED BADGES ONLY. ALL ENTRIES RECORDED.",
      ),
      inspect(
        "staging_tape",
        "Police tape",
        "tape",
        { x: 18, y: 4, w: 22, h: 10 },
        "Police tape",
        "Yellow tape strung between two container corner castings across the end of the C-14 lane, sagging in the wet. Det. Whitaker's crime scene unit has released the lane, but nobody from the terminal has taken the tape down yet, and the lashers walk around it rather than under it.",
      ),
      inspect(
        "staging_lane",
        "The lane at C-14",
        "floor",
        { x: 18, y: 46, w: 24, h: 30 },
        "The lane beside C-14",
        "A narrow lane of wet asphalt between two rows of stacked containers. A dark stain about eighteen inches across, thinned at the edges by Sunday's rain, a spatter of it dried on the corner casting of the nearest box. From the stain, two faint parallel scuffs run through the grit toward the north fence. At the end of the row one slot in the stack stands empty; that box has been loaded.",
      ),
      inspect(
        "staging_racks",
        "The flat rack stack",
        "crate",
        { x: 46, y: 18, w: 22, h: 38 },
        "The flat racks",
        "Six folded flat racks stacked against the north fence, a steel wall taller than a man. Behind them there is a gap a little wider than a body, out of sight of the lane and of every camera on the terminal. Fourteen feet from the stain.",
      ),
      inspect(
        "staging_print",
        "Grease by the flat racks",
        "floor",
        { x: 48, y: 62, w: 16, h: 12 },
        "The grease smear",
        "On the concrete pad in front of the flat racks, under a plastic tent the crime scene unit left behind, a black smear of lashing grease with a yellow evidence marker beside it.",
        { evidence: "E005" },
      ),
      inspect(
        "staging_cage",
        "Lashing gear cage",
        "cage",
        { x: 74, y: 14, w: 24, h: 50 },
        "The lashing gear cage",
        "A chain-link lashing gear cage at the end of C-14, gate shut but not padlocked: twistlocks in bins, coils of chain, ratchet binders, and on the wall rack twenty-two steel binder bars, all the same. Twenty-one hang hook up. The last one, at the end of the rack, hangs hook down, and it is cleaner than the rest.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 Cargo verification office
  // -------------------------------------------------------------------------
  {
    id: "verification",
    area: "east_harbor",
    name: "Cargo Verification Office",
    subtitle: "Second floor, Gate 1 building, East Harbor Terminal",
    mapPin: { x: 66, y: 50 },
    background: "loc.verification",
    ambience: "amb.verification",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "verif_window",
        "Window over the lanes",
        "window",
        { x: 2, y: 6, w: 18, h: 34 },
        "The window",
        "The office looks straight down on the Gate 1 lanes: trucks nosing up to the booth one at a time, a checker in a yellow vest walking each box, reading its number and its seal into a handheld. From up here every container looks the same. Hector's job was to make sure they weren't.",
      ),
      inspect(
        "verif_hold",
        "Hector's verification tray",
        "tray",
        { x: 6, y: 56, w: 16, h: 12 },
        "Hector's tray",
        "Hector's desk by the window, cleared by someone in a hurry except for his wire tray. In it, under a week of routine paperwork, a red folder marked in his capitals: HOLD, VERIFY.",
        { evidence: "E011" },
      ),
      person("verif_lindqvist", "Joanne Lindqvist", "lindqvist", { x: 38, y: 24, w: 12, h: 62 }),
      inspect(
        "verif_revised",
        "Joanne Lindqvist's out tray",
        "tray",
        { x: 58, y: 56, w: 10, h: 9 },
        "The clerk's out tray",
        "A plastic out tray at the end of Joanne Lindqvist's desk, a single printout in it face down. She doesn't look up while you turn it over.",
        { evidence: "E012", visible: { event: "RE02" } },
      ),
      inspect(
        "verif_screen",
        "Terminal operating system screen",
        "computer",
        { x: 72, y: 38, w: 14, h: 18 },
        "The terminal screen",
        "A monitor on the shared desk showing the terminal operating system: a grid of container numbers, seals, weights and statuses in green on gray. Anyone with the right user name can change a line. The screen keeps no paper.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 Lashing gear building
  // -------------------------------------------------------------------------
  {
    id: "gear_building",
    area: "east_harbor",
    name: "Lashing Gear Building",
    subtitle: "Beside Staging Area C, East Harbor Terminal",
    mapPin: { x: 82, y: 52 },
    background: "loc.gear_building",
    ambience: "amb.gear_building",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "gear_doorlog",
        "Clipboard by the door",
        "corkboard",
        { x: 2, y: 26, w: 10, h: 18 },
        "The clipboard",
        "A clipboard on a hook beside the steel door and its badge reader, two printed sheets under the clip, the corners curled from the damp.",
        { evidence: "E016" },
      ),
      inspect(
        "gear_bench",
        "Workbench",
        "desk",
        { x: 16, y: 48, w: 24, h: 16 },
        "The workbench",
        "A steel workbench scarred by years of chain: a vise, a grease gun, a coffee can of shackle pins, a radio with a coat hanger for an antenna. Someone has left a thermos and a lunch cooler on the end, the same kind every lasher on the terminal carries.",
      ),
      inspect(
        "gear_stores",
        "Lashing gear stores",
        "shelf",
        { x: 42, y: 10, w: 18, h: 30 },
        "The stores",
        "Racks of lashing gear to the roof: coils of chain on pegs, crates of twistlocks and bridge clamps, load binders hanging by their hooks. It smells of grease and wet steel. Nobody comes in here who doesn't have to.",
      ),
      inspect(
        "gear_locker_locked",
        "Locker 12",
        "locker",
        { x: 62, y: 20, w: 16, h: 50 },
        "Locker 12",
        "Locker 12, NAVARRO stenciled on the door, a combination padlock. Locked.",
        { visible: { not: lockerOpen } },
      ),
      {
        ...inspect(
          "gear_locker_book",
          "Shelf of locker 12",
          "sprite",
          { x: 62, y: 20, w: 8, h: 30 },
          "Locker 12: the shelf",
          "The padlock opens on 04-11-09. Inside: a spare hi-vis vest, a hard hat, a coil of lashing chain on the shelf, and under the chain something wrapped in a shop rag.",
          { evidence: "E009", visible: lockerOpen },
        ),
        sprite: [{ image: "obj.notebook_rag" }],
      },
      {
        ...inspect(
          "gear_locker_prints",
          "Door of locker 12",
          "sprite",
          { x: 70, y: 20, w: 8, h: 50 },
          "Locker 12: the door",
          "Tucked into the vent slots on the inside of the locker door, a paper photo envelope from a drugstore, bent to fit.",
          { evidence: "E010", visible: lockerOpen },
        ),
        sprite: [{ image: "obj.locker_door_open" }],
      },
      inspect(
        "gear_lockers",
        "The other lockers",
        "locker",
        { x: 80, y: 20, w: 18, h: 50 },
        "The lockers",
        "Twenty-four gray steel lockers in a row, names stenciled or taped on the doors. Most have the company's padlocks. A few have their owners' own. On one door someone has stuck a Ravens schedule and a child's drawing of a crane.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Terminal security office
  // -------------------------------------------------------------------------
  {
    id: "security",
    area: "east_harbor",
    name: "Terminal Security Office",
    subtitle: "Beside Gate 1, East Harbor Terminal",
    mapPin: { x: 74, y: 40 },
    background: "loc.security",
    ambience: "amb.security",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "sec_access",
        "Access control terminal",
        "computer",
        { x: 4, y: 40, w: 18, h: 22 },
        "The access control terminal",
        "A workstation with the badge system open, a printer beside it. The security manager pulls up the Staging Area C reader for Sunday afternoon and evening and prints it for you without being asked twice.",
        { evidence: "E007" },
      ),
      inspect(
        "sec_credentials",
        "Contractor credential binder",
        "binder",
        { x: 30, y: 46, w: 14, h: 14 },
        "The credential binder",
        "A fat black binder on the shelf: CONTRACTOR CREDENTIALS, by badge number. The security manager finds the page for C-1147 and turns the binder round so you can read it.",
        { evidence: "E018", visible: { hasEvidence: "E007" } },
      ),
      inspect(
        "sec_cameras",
        "Camera review station",
        "monitor",
        { x: 58, y: 20, w: 24, h: 36 },
        "The camera review station",
        "A bank of monitors cycling through the terminal's cameras: the gates, the stacks, the quay. A folder of stills on the desk below, pulled for the police on Monday: camera G4-2, the contractor lane, Sunday evening.",
        { evidence: "E027" },
      ),
      inspect(
        "sec_window",
        "Window on Gate 1",
        "window",
        { x: 86, y: 6, w: 12, h: 30 },
        "Gate 1",
        "Through the rain on the glass: the booth, the barrier arms, the queue of trucks. Gate 4 is a mile down the fence line, out of sight of this window and of anyone in this room.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 The Navarro home, Fait Avenue
  // -------------------------------------------------------------------------
  {
    id: "navarro_home",
    area: "highlandtown",
    name: "The Navarro Home",
    subtitle: "3214 Fait Avenue, Highlandtown, Baltimore",
    mapPin: { x: 60, y: 24 },
    background: "loc.navarro_home",
    ambience: "amb.navarro_home",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "home_photos",
        "Family photographs",
        "photo",
        { x: 2, y: 8, w: 14, h: 22 },
        "The photographs",
        "A wall of frames over the radiator: a wedding at a church in East Baltimore, Hector thinner and grinning in a rented tuxedo; Sofia's school pictures in a row, first grade to fourth; Hector in a hard hat and yellow vest in front of a ship, holding up a little girl in a matching hard hat that comes down over her eyes.",
      ),
      person("home_marisol", "Marisol Navarro", "marisol", { x: 22, y: 24, w: 12, h: 62 }),
      inspect(
        "home_fridge",
        "Kitchen refrigerator",
        "photo",
        { x: 42, y: 14, w: 12, h: 28 },
        "The refrigerator",
        "Through the kitchen doorway: a refrigerator covered in Sofia's drawings. A ship with a crane over it. A man in a yellow vest, very tall, with a speech balloon: \"CHECK THE NUMBERS.\" A school lunch menu for December with Friday circled.",
      ),
      inspect(
        "home_desk",
        "Hector's desk in the back room",
        "desk",
        { x: 64, y: 52, w: 18, h: 14 },
        "Hector's desk",
        "In the back room, a small desk wedged beside the washing machine: a home printer, a mug of pens, a pay stub, a union newsletter. A coffee mug is sitting on a sheet of paper folded in thirds.",
        { evidence: "E014" },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 Operations supervisor's office
  // -------------------------------------------------------------------------
  {
    id: "gaffney_office",
    area: "east_harbor",
    name: "Operations Supervisor's Office",
    subtitle: "Terminal Administration Building, East Harbor Terminal",
    mapPin: { x: 68, y: 36 },
    background: "loc.gaffney_office",
    ambience: "amb.gaffney_office",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "gaffney_moveplan",
        "Move plan binders",
        "binder",
        { x: 2, y: 30, w: 14, h: 22 },
        "The move plan binders",
        "A shelf of blue binders, one per staging area per month. STAGING AREA C, NOV to DEC 2018 is the newest, its spine barely creased.",
        { evidence: "E013" },
      ),
      person("go_gaffney", "Russell Gaffney", "gaffney", { x: 32, y: 24, w: 12, h: 62 }),
      inspect(
        "gaffney_personnel",
        "Desk drawer",
        "drawer",
        { x: 50, y: 62, w: 12, h: 9 },
        "The desk drawer",
        "Gaffney's desk drawer, unlocked. Among the hanging files, a manila folder labeled NAVARRO, H., 21-0613.",
        { evidence: "E015" },
      ),
      inspect(
        "gaffney_wall",
        "Framed photographs",
        "photo",
        { x: 50, y: 10, w: 16, h: 20 },
        "The wall",
        "A framed aerial photograph of East Harbor Terminal with a brass plate, a safety award from 2016, and a photo of a younger Gaffney in a hard hat on a dock that is not this one, the cranes behind him painted a different color.",
      ),
      inspect(
        "gaffney_drawer",
        "Gaffney's file drawer",
        "filing",
        { x: 72, y: 34, w: 12, h: 36 },
        "The file drawer",
        "A two-drawer steel cabinet behind the desk. The top drawer holds Gaffney's own papers: his benefits, his evaluations, his annual forms in date order.",
        { evidence: "E024" },
      ),
      inspect(
        "gaffney_window",
        "Window over the quay",
        "window",
        { x: 86, y: 4, w: 12, h: 28 },
        "The quay",
        "The cranes along the quay, a ship under them half loaded, containers coming down out of the rain. You can see Staging Area C from here, and the lashing gear building, and the long fence running down toward Gate 4.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 Kane Logistics, Clinton Street
  // -------------------------------------------------------------------------
  {
    id: "kane_office",
    area: "canton",
    name: "Kane Logistics",
    subtitle: "1900 Clinton Street, Canton, Baltimore",
    mapPin: { x: 56, y: 34 },
    background: { env: "kane_office", states: { default: "loc.kane_office", searched: "loc.kane_office_searched" } },
    ambience: "amb.kane_office",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      inspect(
        "kane_invoices",
        "Invoice file",
        "filing",
        { x: 2, y: 34, w: 14, h: 30 },
        "The invoice file",
        "A lateral file by the office door, its top drawer labeled AR, EHTOC. The receptionist leaves it open while she goes to tell Mr. Kane you are here. The newest invoice is on top.",
        { evidence: "E029" },
      ),
      person("ko_kane", "Gideon Kane", "kane", { x: 28, y: 24, w: 12, h: 62 }),
      inspect(
        "kane_wall",
        "Photographs of trucks",
        "photo",
        { x: 44, y: 8, w: 18, h: 20 },
        "The wall",
        "Framed photographs of Kane Logistics tractors lined up in a yard, all the same deep green, and one of Kane himself shaking hands with a port official at a ribbon cutting. A plaque: KANE LOGISTICS, SECURITY AND DRAYAGE.",
      ),
      inspect(
        "kane_credenza",
        "Kane's credenza",
        "cabinet",
        { x: 50, y: 50, w: 20, h: 16 },
        "The credenza",
        "The walnut credenza behind Kane's desk, its lock drilled out by the search team. An HSI agent is photographing the folders one by one before they go into boxes.",
        { evidence: "E033", visible: searched },
      ),
      {
        ...inspect(
          "kane_search_team",
          "Police search team",
          "sprite",
          { x: 74, y: 24, w: 14, h: 60 },
          "The search",
          "Two BPD detectives and an HSI agent in a navy windbreaker, boxes on a hand truck, evidence tape on the drawers. Kane sits in his own visitor's chair with his lawyer beside him, watching every folder leave the room.",
          { visible: searched },
        ),
        sprite: [{ image: "obj.search_team" }],
      },
      inspect(
        "kane_window",
        "Window on Clinton Street",
        "window",
        { x: 74, y: 2, w: 24, h: 18 },
        "Clinton Street",
        "Old warehouses turned into offices, a row of new townhouses where a cannery used to be, and past them the water and the cranes of the terminals on the far side of the harbor.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 Fisk Freight Security yard, Curtis Bay
  // -------------------------------------------------------------------------
  {
    id: "fisk_yard",
    area: "curtis_bay",
    name: "Fisk Freight Security",
    subtitle: "Yard and office trailer off Pennington Avenue, Curtis Bay",
    mapPin: { x: 50, y: 82 },
    background: "loc.fisk_yard",
    ambience: "amb.fisk_yard",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      inspect(
        "fisk_schedule",
        "Schedule board",
        "corkboard",
        { x: 2, y: 14, w: 18, h: 30 },
        "The schedule board",
        "A whiteboard on the trailer wall with a printed week taped to it, guards' names in marker, and a sign-in sheet on a bulldog clip beside it.",
        { evidence: "E017" },
      ),
      inspect(
        "fisk_desk",
        "Office desk",
        "desk",
        { x: 24, y: 56, w: 16, h: 12 },
        "The desk",
        "A metal desk with two radios charging on it, a stack of incident forms, a box of nitrile gloves and a printout under a stapler.",
        { evidence: "E020" },
      ),
      person("fy_fisk", "Dwayne Fisk", "fisk", { x: 44, y: 24, w: 12, h: 62 }, { not: inCustody }),
      inspect(
        "fisk_truck",
        "The truck",
        "truck",
        { x: 64, y: 20, w: 34, h: 40 },
        "The truck",
        "Through the trailer's open door, parked nose-out by the gate: a gray Ford F-250 Super Duty, crew cab, an amber LED light bar across the roof, FISK FREIGHT SECURITY on both front doors. Maryland plate 7FK4417.",
        { visible: { not: inCustody } },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L11 EHTOC accounts office
  // -------------------------------------------------------------------------
  {
    id: "accounting",
    area: "east_harbor",
    name: "EHTOC Accounts Office",
    subtitle: "First floor, Terminal Administration Building, East Harbor Terminal",
    mapPin: { x: 62, y: 42 },
    background: "loc.accounting",
    ambience: "amb.accounting",
    available: { chapter: 3 },
    onMap: true,
    hotspots: [
      inspect(
        "acct_contracts",
        "Contracts binder",
        "binder",
        { x: 2, y: 28, w: 14, h: 26 },
        "The contracts binder",
        "A thick binder on the shelf behind the counter: CONTRACTORS, KANE LOGISTICS INC. Terminal Services Agreement, 2016, and its amendments. A yellow sticky tab sticks out of the back.",
        { evidence: "E034" },
      ),
      person("acct_walsh", "Philip Walsh", "walsh", { x: 30, y: 24, w: 12, h: 62 }),
      inspect(
        "acct_certificate",
        "Framed certificate",
        "photo",
        { x: 48, y: 10, w: 12, h: 16 },
        "The certificate",
        "Philip Walsh's CPA certificate from the State Board of Public Accountancy, hung dead level, and beside it a small framed photo of a man and two boys on a fishing pier.",
      ),
      inspect(
        "acct_deposits",
        "Deposits ledger",
        "ledger",
        { x: 52, y: 56, w: 16, h: 12 },
        "The deposits ledger",
        "On Walsh's desk, where he left it after you spoke: a printed ledger open at September, one line highlighted.",
        { evidence: "E031", visible: { talkedTo: "walsh" } },
      ),
      inspect(
        "acct_window",
        "Window on the lot",
        "window",
        { x: 76, y: 6, w: 22, h: 32 },
        "The lot",
        "The employee lot in the rain, and past it the stacks. In the third row, a pickup with a dented tailgate and a car seat in the back is still parked where Hector Navarro left it on Sunday morning, a parking ticket nobody will pay tucked under the wiper.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L12 BPD Homicide, 601 East Fayette Street
  // -------------------------------------------------------------------------
  {
    id: "police",
    area: "downtown",
    name: "BPD Homicide",
    subtitle: "Baltimore Police Department, 601 East Fayette Street",
    mapPin: { x: 44, y: 20 },
    background: "loc.police",
    ambience: "amb.police",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "po_board",
        "Case board",
        "corkboard",
        { x: 0, y: 4, w: 22, h: 40 },
        "The case board",
        "A whiteboard among a dozen others, each with its own case number. On this one: 18-1202-118, NAVARRO, H., a terminal map with Staging Area C circled, and the word ROBBERY with a line through it in a different color of marker.",
      ),
      person("po_whitaker", "Det. Allison Whitaker", "whitaker", { x: 28, y: 24, w: 12, h: 62 }),
      inspect(
        "po_desk",
        "Whitaker's desk",
        "desk",
        { x: 44, y: 58, w: 18, h: 14 },
        "Whitaker's desk",
        "Three case files stacked crosswise, a cold coffee in an Orioles cup, a running shoe with a broken lace, a phone that has not stopped buzzing since you sat down.",
      ),
      person("po_fisk", "Dwayne Fisk, in an interview room", "fisk", { x: 70, y: 24, w: 12, h: 50 }, inCustody),
      inspect(
        "po_window",
        "Window on Fayette Street",
        "window",
        { x: 86, y: 4, w: 12, h: 30 },
        "Fayette Street",
        "Downtown in the rain: the Shot Tower's brick chimney, the jail's walls a few blocks off, and the traffic on the Jones Falls Expressway hissing past.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L13 Riverside Freight Transfer Yard, Fairfield
  // -------------------------------------------------------------------------
  {
    id: "riverside",
    area: "fairfield",
    name: "Riverside Freight Transfer Yard",
    subtitle: "Off Chesapeake Avenue, Fairfield, Baltimore",
    mapPin: { x: 60, y: 70 },
    secret: true,
    background: "loc.riverside",
    ambience: "amb.riverside",
    available: { chapter: 4 },
    onMap: true,
    hotspots: [
      inspect(
        "river_gatelog",
        "Gate shack binder",
        "binder",
        { x: 2, y: 30, w: 14, h: 22 },
        "The gate shack",
        "A plywood gate shack by the entrance with a space heater and a folding chair. On a nail by the window, a three-ring binder swollen with damp.",
        { evidence: "E035" },
      ),
      inspect(
        "river_bays",
        "Transload bays",
        "building",
        { x: 18, y: 8, w: 30, h: 40 },
        "The bays",
        "Three transload bays in a long corrugated shed, the roll-up doors numbered in white paint. Bay 3's door is up today for the police. Inside: a forklift, a loading dock at container height, a pallet jack, and a cardboard box of numbered bolt seals, still in their bags.",
      ),
      inspect(
        "river_cabinet_protocol",
        "File cabinet, top drawer",
        "filing",
        { x: 54, y: 36, w: 12, h: 12 },
        "The file cabinet",
        "The file cabinet in Kane's site office, its lock drilled out by the search team. In the \"INS.\" folder, behind the register pages, a single typed sheet.",
        { evidence: "E039", visible: searched },
      ),
      inspect(
        "river_cabinet_register",
        "File cabinet, bottom drawer",
        "filing",
        { x: 54, y: 52, w: 12, h: 12 },
        "The file cabinet",
        "The bottom drawer of the file cabinet in Kane's site office. Between the insurance certificates and the fuel receipts, a folder marked only \"INS.\"",
        { evidence: "E037", visible: searched },
      ),
      inspect(
        "river_desk",
        "Kane's desk",
        "desk",
        { x: 72, y: 44, w: 20, h: 14 },
        "Kane's site desk",
        "A plain steel desk with a radio, a calendar from a tire dealer and a heavy rubber desk mat. Everything on it is squared to the edge. It is the only tidy thing in the yard.",
      ),
      inspect(
        "river_safe_closed",
        "Floor safe",
        "safe",
        { x: 74, y: 64, w: 16, h: 12 },
        "The floor safe",
        "Under the rolled-back desk mat, a steel floor safe set into the concrete, its dial and handle flush with the floor. Locked. The warrant covers the office, not the safe, and the locksmith is waiting on a judge.",
        { visible: { not: safeOpen } },
      ),
      {
        ...inspect(
          "river_safe_open",
          "The open safe",
          "sprite",
          { x: 74, y: 64, w: 16, h: 12 },
          "The open safe",
          "The floor safe stands open, the locksmith packing his tools beside it. A detective is counting banded cash into an evidence bag. Under the cash and a passport, a plastic sleeve.",
          { evidence: "E040", visible: safeOpen },
        ),
        sprite: [{ image: "obj.safe_open" }],
      },
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
