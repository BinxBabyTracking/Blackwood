import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import { LAB_PRINT_RECT, REPORT_RECT } from "./desk";
import { alive, craneAt, craneFree, dead, WITNESSES } from "./rules";
import { reportAvailable } from "./story";

/*
 * Scene layout for HALLOW001. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art; refit every one once its painting
 * lands. No two hotspots in a scene overlap.
 *
 * The estate is one area: every move is on foot. The study is on the map
 * (CRIME SCENE); the guest wing and the attic are reached from the upstairs
 * corridor, the service corridor from the wine cellar or the library's
 * service door, and the servants' stair from the study's hidden shelf or the
 * service corridor's painted-over door.
 *
 * People hotspots follow the characters' locations and moves. Lucian Marsh
 * is wherever his playbook has taken him (env "crane").
 */

const AREA = "estate";

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
  art: `art.figure_${characterId}`,
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

/** Something that arrives on the desk: shown when it arrives, gone once its evidence is collected. */
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"], sprite: string): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: [{ image: sprite }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Lucian Marsh, here while his playbook has him here. */
const crane = (id: string, loc: string, rect: HotspotDef["rect"]): HotspotDef => person(id, "Lucian Marsh", "crane", rect, { all: [craneAt(loc), { not: { flag: "crane_escaped" } }] });

const CALLS = ["call_mahoney_board", "call_mahoney_officers", "call_mahoney_attack_killed", "call_mahoney_attack_stopped", "call_mahoney_escaped", "call_mahoney_caught", "call_mahoney_lab"];
const DELIVERIES = ["lab_print", "mahoney_attack"];
const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_mahoney_board" }, { not: { boardConnections: 1 } }] };
const shelfOpen: Condition = { env: "study_shelf", is: "B" };
/** Enough is known to find the hidden shelf: its scrapes, and a reason to think it is a door. */
const shelfFindable: Condition = { all: [{ inspected: "st_shelves" }, { any: [{ flag: "passage_told" }, { hasEvidence: "HE021" }, { asked: "felix_stair" }] }] };
/** The painted-over door at the foot of the stair has been noticed, or opened from above. */
const lowerDoorFound: Condition = { any: [{ flag: "lower_door_found" }, shelfOpen] };

export const locations: LocationDef[] = [
  // -------------------------------------------------------------------------
  // The Morning Room: Blackwood's base for the night
  // -------------------------------------------------------------------------
  {
    id: "morning_room",
    area: AREA,
    name: "The Morning Room",
    subtitle: "Main floor. Blackwood's incident room for the night",
    mapPin: { x: 38, y: 47 },
    mapTag: "BLACKWOOD",
    background: "loc.morning_room",
    ambience: "amb.morning_room",
    available: { always: true },
    onMap: true,
    hotspots: [
      // The case file is carried in the corner of the screen, beside the evidence (caseFileInHud).
      // The final report: on the desk once there is enough to write it.
      {
        ...panel("mr_final_report", "Final report", "sprite", { x: 21, y: 50, w: 12, h: 17 }, "conclusion", reportAvailable),
        // Blackwood's own report folder (C001's painting), not the State Police folder Lt. Mahoney's report comes in.
        sprite: [{ image: "obj.final_report" }],
        attention: { all: [reportAvailable, { not: { flag: "case_closed" } }] },
        callout: { text: "File your final report here", when: { all: [reportAvailable, { not: { attempts: 1 } }] } },
      },
      deskItem("mr_lab", "Lab report: the shelf catch", "lab_print", "HE009", LAB_PRINT_RECT, "obj.labfolder"),
      deskItem("mr_report", "Lt. Mahoney's report", "mahoney_attack", "HE037", REPORT_RECT, "obj.report_folder"),
      {
        ...panel("mr_board", "Murder board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      { ...panel("mr_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"), attention: { any: CALLS.map((c) => ({ callPending: c })) } },
      panel("mr_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      panel("mr_map", "Plan of the estate", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
      panel("mr_mail", "Opened reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", { any: DELIVERIES.map((d) => ({ deliveryOpened: d })) }),
      inspect(
        "mr_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "Rain on the old glass, and the drive below going down through the fog to the gatehouse lights. A carved pumpkin on the sill has burned down to a stub. Somewhere in this house, somebody is waiting to see what you find.",
      ),
      person("mr_josie", "Josie Lisle", "josie", { x: 69, y: 30, w: 15, h: 56 }, { all: [{ flag: "josie_found" }, alive("josie")] }),
    ],
  },

  // -------------------------------------------------------------------------
  // The main floor
  // -------------------------------------------------------------------------
  {
    id: "entrance_hall",
    area: AREA,
    name: "Entrance Hall",
    subtitle: "Main floor. The front door, the stair and the coats",
    mapPin: { x: 48, y: 52 },
    background: "loc.entrance_hall",
    ambience: "amb.entrance_hall",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("eh_amos", "Amos Duffy", "amos", { x: 4, y: 35, w: 12, h: 58 }, alive("amos")),
      person("eh_byrne", "Everett Byrne", "byrne", { x: 61, y: 30, w: 10, h: 46 }),
      inspect(
        "eh_coats",
        "Coat stand",
        "coat",
        { x: 24, y: 28, w: 12, h: 46 },
        "The coat stand",
        "Twelve guests' coats on an oak stand by the stair, hung here since half past eight, damp at the shoulders from the walk up from the cars. Anyone at dinner could have reached them in the dark, and anyone could since.",
      ),
      inspect(
        "eh_door",
        "Front door",
        "door",
        { x: 40, y: 18, w: 16, h: 62 },
        "The front door",
        "Oak, iron-studded, with a camera in a little gray box above it, its red light steady. A Harrow Falls officer stood just inside when you came, his hat dripping. Nobody has gone out this way since 8:41, the camera says, and nobody will.",
        { textAfter: [{ requires: { flag: "police_gate" }, text: "Oak, iron-studded, the camera's red light steady above it. Through the side light you can see the cruiser's blue lights at the gate, and Officer Reyes standing in the rain beside it, where everyone in the house can see her." }] },
      ),
      inspect(
        "eh_clock",
        "Tall clock",
        "clock",
        { x: 86, y: 14, w: 10, h: 60 },
        "The tall clock",
        "A long-case clock, wound by hand, still right to the minute. It says {clock}. It did not stop at 10:13. Only the things with plugs did.",
      ),
    ],
  },
  {
    id: "dining_room",
    area: AREA,
    name: "Grand Dining Room",
    subtitle: "Main floor. Thirteen places, and the guests held here",
    mapPin: { x: 42, y: 38 },
    background: "loc.dining_room",
    ambience: "amb.dining_room",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("dr_felix", "Felix Blackthorn", "felix", { x: 0, y: 38, w: 13, h: 64 }),
      person("dr_wren", "Oscar Wren", "wren", { x: 7, y: 24, w: 10, h: 48 }),
      { ...person("dr_beatrice", "Beatrice Holloway", "beatrice", { x: 58, y: 24, w: 8, h: 38 }), behind: 48 },
      person("dr_bridget", "Bridget Duffy", "bridget", { x: 80, y: 27, w: 10, h: 50 }, alive("bridget")),
      crane("dr_crane", "dining_room", { x: 88, y: 34, w: 12, h: 63 }),
      inspect(
        "dr_thirteenth",
        "The place at the foot of the table",
        "table",
        { x: 30, y: 74, w: 34, h: 22 },
        "The thirteenth place",
        "At the foot of the table, a thirteenth setting, with a blank place card.",
        { evidence: "HE011" },
      ),
      inspect("dr_chart", "Seating chart", "card", { x: 38, y: 24, w: 8, h: 12 }, "The seating chart", "Oscar Wren's seating plan, propped on the sideboard.", { evidence: "HE013" }),
      inspect(
        "dr_head",
        "Ambrose's chair",
        "chair",
        { x: 18, y: 18, w: 10, h: 28 },
        "The head of the table",
        "Ambrose's chair, pushed back. His napkin on the floor, his glass of claret barely touched, a little silver bell beside his plate he never rang. He told them at 9:45 that at half past ten he would explain why they were here.",
      ),
      inspect(
        "dr_window",
        "Windows onto the drive",
        "window",
        { x: 44, y: 2, w: 13, h: 30 },
        "The windows",
        "The tall windows look straight down the drive to the gate and the gatehouse lot. From this table you can see every car that comes and goes.",
        { textAfter: [{ requires: { flag: "police_gate" }, text: "The tall windows look down the drive to the gate. The cruiser's blue lights are turning there now, and Officer Reyes stands beside it. Everyone at this table can see her." }] },
      ),
    ],
  },
  {
    id: "library",
    area: AREA,
    name: "The Library",
    subtitle: "Main floor. The foundation's archive",
    mapPin: { x: 56, y: 40 },
    background: "loc.library",
    ambience: "amb.library",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("lib_harriet", "Harriet Lowell", "harriet", { x: 6, y: 32, w: 11, h: 52 }, alive("harriet")),
      { ...person("lib_iris", "Iris Kettering", "iris", { x: 74, y: 31, w: 9, h: 47 }), behind: 66 },
      crane("lib_crane", "library", { x: 28, y: 39, w: 11, h: 60 }),
      inspect("lib_archive", "Archive shelf", "shelf", { x: 20, y: 10, w: 16, h: 44 }, "The archive shelf", "The foundation's bound annual accounts, year by year, in brown buckram.", { evidence: "HE020" }),
      inspect(
        "lib_globe",
        "The great globe",
        "globe",
        { x: 40, y: 50, w: 14, h: 34 },
        "The great globe",
        "A floor globe four feet high, in a walnut stand, bought for this room in 1910.",
        { evidence: "HE035", visible: { all: [{ flag: "globe_known" }, { not: { flag: "envelope_taken" } }] } },
      ),
      inspect(
        "lib_globe_empty",
        "The great globe",
        "globe",
        { x: 40, y: 50, w: 14, h: 34 },
        "The great globe",
        "The globe opens at the equator. Inside, a cream square of dust where an envelope lay until very recently, and nothing else. Someone got here first.",
        { visible: { all: [{ flag: "globe_known" }, { flag: "envelope_taken" }, { not: { hasEvidence: "HE035" } }] } },
      ),
      inspect(
        "lib_desk",
        "Writing desk",
        "desk",
        { x: 56, y: 56, w: 10, h: 18 },
        "The writing desk",
        "A lady's writing desk with a blotter and a box of the foundation's library notepaper: cream, heavy, with a faint watermark of a griffin. A pen in a tray. The box is a little lighter than it should be.",
      ),
      door("lib_service_door", "Service door", "service_corridor", { x: 92, y: 20, w: 7, h: 56 }),
    ],
  },
  {
    id: "conservatory",
    area: AREA,
    name: "The Conservatory",
    subtitle: "Main floor. Glass, palms and the terrace door",
    mapPin: { x: 62, y: 52 },
    background: "loc.conservatory",
    ambience: "amb.conservatory",
    available: { always: true },
    onMap: true,
    hotspots: [
      person("co_penrose", "Dr. Isaac Penrose", "penrose", { x: 8, y: 36, w: 15, h: 64 }),
      person("co_constance", "Constance Blackthorn", "constance", { x: 24, y: 32, w: 11, h: 52 }),
      crane("co_crane", "conservatory", { x: 74, y: 30, w: 11, h: 54 }),
      inspect(
        "co_door",
        "Garden door",
        "door",
        { x: 42, y: 16, w: 14, h: 64 },
        "The garden door to the terrace",
        "A glazed door onto the terrace, unlocked. On the tiles just inside it, a pale dried tidemark where water ran off someone and pooled, and a few grains of wet gravel from the terrace path. It rained hard from ten o'clock. Nobody from the dinner had any reason to go outside.",
      ),
      {
        id: "co_overhear",
        label: "Lucian Marsh, on the phone",
        kind: "person",
        rect: { x: 86, y: 30, w: 11, h: 54 },
        visible: { all: [craneAt("conservatory"), { flag: "crane_called" }, { not: { flag: "heard_crane_call" } }, craneFree] },
        interaction: { type: "overhear", callId: "call_crane_overheard" },
      },
      inspect(
        "co_palms",
        "Palms",
        "plant",
        { x: 58, y: 40, w: 14, h: 40 },
        "The palms",
        "Old palms in brass tubs, and orchids nobody has watered in a week. Behind them, in the dark, two people could stand together without being seen from the house.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // Upstairs
  // -------------------------------------------------------------------------
  {
    id: "upstairs_corridor",
    area: AREA,
    name: "Upstairs Corridor",
    subtitle: "Second floor. The study at its end",
    mapPin: { x: 48, y: 26 },
    background: "loc.upstairs_corridor",
    ambience: "amb.upstairs_corridor",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect("uc_glove", "Something on the runner", "glove", { x: 79, y: 69, w: 11, h: 10 }, "A glove", "A woman's black lace glove on the runner.", { evidence: "HE016" }),
      door("uc_study", "The study door", "study", { x: 40, y: 18, w: 14, h: 62 }),
      door("uc_guest_wing", "The guest wing", "guest_wing", { x: 82, y: 14, w: 12, h: 54 }),
      door("uc_attic", "The attic stair", "attic", { x: 4, y: 18, w: 10, h: 62 }, { flag: "attic_known" }),
      inspect(
        "uc_portraits",
        "Family portraits",
        "painting",
        { x: 16, y: 10, w: 20, h: 30 },
        "Portraits",
        "Three generations of Blackthorns in heavy frames. Ambrose's grandfather, H. G. Blackthorn, who built the house, in hunting tweeds, looks down the corridor toward the study as if he still expects to be obeyed. The last frame, Ambrose's, is draped in black crepe someone hung tonight.",
      ),
    ],
  },
  {
    id: "study",
    area: AREA,
    name: "Ambrose's Study",
    subtitle: "Second floor. The room bolted from inside",
    mapPin: { x: 54, y: 20 },
    mapTag: "CRIME SCENE",
    background: { env: "study_shelf", states: { A: "loc.study", B: "loc.study_open" } },
    ambience: "amb.study",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect("st_door", "The door", "door", { x: 2, y: 14, w: 12, h: 66 }, "The study door", "The study door, forced.", { evidence: "HE001" }),
      inspect("st_bookend", "Something on the floor", "object", { x: 46, y: 74, w: 10, h: 12 }, "A bookend", "A heavy brass bookend on the carpet.", { evidence: "HE002" }),
      inspect("st_clock", "Mantel clock", "clock", { x: 18, y: 26, w: 8, h: 12 }, "The mantel clock", "A small electric clock on the mantel.", { evidence: "HE007" }),
      inspect("st_desk", "The desk", "desk", { x: 28, y: 54, w: 16, h: 20 }, "The desk", "Ambrose's desk, the lamp still on.", { evidence: "HE008" }),
      inspect(
        "st_body",
        "Ambrose",
        "body",
        { x: 58, y: 76, w: 16, h: 14 },
        "Ambrose Blackthorn",
        "Under a sheet from the linen cupboard, Officer Reyes's work. A man of sixty-seven in a velvet dinner jacket, on his right side between the desk and the north shelves, head toward the shelves. His reading glasses are folded in his breast pocket. He was not reading when it happened. He had turned to look at the wall.",
      ),
      inspect("st_shelves", "North bookshelves", "shelf", { x: 60, y: 6, w: 16, h: 64 }, "The north shelves", "Floor-to-ceiling oak shelves along the north wall.", { evidence: "HE004" }),
      inspect(
        "st_hidden",
        "The fourth bookcase",
        "shelf",
        { x: 78, y: 6, w: 12, h: 64 },
        "The fourth bookcase",
        "You put your shoulder to the fourth section, where the scrapes are. It swings out on a silent, oiled hinge, books and all, onto a narrow stair going down inside the wall. Cold air, and the smell of dust and machine oil.",
        { visible: { all: [shelfFindable, { not: shelfOpen }] }, effects: [{ setEnv: "study_shelf", to: "B" }] },
      ),
      door("st_stair", "The hidden stair", "servants_stair", { x: 75.5, y: 12, w: 12, h: 66 }, shelfOpen),
      inspect(
        "st_window",
        "Windows",
        "window",
        { x: 28, y: 4, w: 16, h: 36 },
        "The windows",
        "Two sash windows, both locked with brass catches, the catches painted in. A sheer drop of thirty feet to the terrace. Nobody went out this way.",
      ),
    ],
  },
  {
    id: "guest_wing",
    area: AREA,
    name: "The Guest Wing",
    subtitle: "Second floor. The guests' rooms for the night",
    background: "loc.guest_wing",
    ambience: "amb.upstairs_corridor",
    available: { always: true },
    onMap: false,
    hotspots: [
      door("gw_back", "Back to the corridor", "upstairs_corridor", { x: 0, y: 18, w: 8, h: 62 }),
      // Where Constance and Iris say it is: the narrow opening at the far end of the hall, on the right (it also opens off the corridor).
      door("gw_attic", "The attic stair", "attic", { x: 61.5, y: 21, w: 5, h: 41 }, { flag: "attic_known" }),
      inspect("gw_felix", "Felix's room", "door", { x: 10, y: 6, w: 12, h: 79 }, "Felix's room", "Felix's room: an overnight bag on the bed.", { evidence: "HE032" }),
      inspect("gw_penrose", "Dr. Penrose's room", "door", { x: 27, y: 15, w: 7.5, h: 57 }, "Dr. Penrose's room", "Dr. Penrose's room: a medical journal on the night table.", { evidence: "HE033" }),
      inspect(
        "gw_harriet",
        "Mrs. Lowell's room",
        "door",
        { x: 37.5, y: 21, w: 5.5, h: 43 },
        "Mrs. Lowell's room",
        "A neat room: a cardigan folded on the chair, a library book on the pillow, a framed photograph of a cat. Her handbag isn't here. She keeps it with her.",
      ),
      inspect(
        "gw_rose",
        "The Rose Room",
        "door",
        { x: 70, y: 10, w: 19.5, h: 70 },
        "The Rose Room",
        "The last door, painted with faded roses. Locked from inside. You knock. Nobody answers, but you can hear someone on the other side holding their breath, and a faint smell of lilies. Whoever it is won't open the door to a stranger. If you knew who she was, you could call her by name.",
        {
          textAfter: [
            {
              requires: { any: [{ hasEvidence: "HE016" }, { asked: "beatrice_truth" }] },
              text: "You knock and say, \"Miss Lisle? We're from Blackwood. We're not the police. We'd like to hear what happened.\" A long silence. Then the key turns. A woman in black, her veil pushed back, a red-rimmed face, one glove missing. \"You know my name,\" she says. \"Nobody's said it in this house for twenty years.\"",
            },
          ],
          effects: [{ when: { any: [{ hasEvidence: "HE016" }, { asked: "beatrice_truth" }] }, then: [{ setFlag: "josie_found" }] }],
        },
      ),
    ],
  },
  {
    id: "attic",
    area: AREA,
    name: "The Attic",
    subtitle: "Top floor. The family's trunks",
    background: "loc.attic",
    ambience: "amb.attic",
    available: { flag: "attic_known" },
    // On the map's list once someone has mentioned it (no pin: the painted map has no attic), and still reached by its stair.
    onMap: true,
    secret: true,
    hotspots: [
      door("at_down", "Down to the corridor", "upstairs_corridor", { x: 0, y: 30, w: 8, h: 60 }),
      inspect("at_trunk", "A tin trunk", "trunk", { x: 40, y: 54, w: 20, h: 28 }, "A tin trunk", "His father's tin trunk, its lid unlocked.", { evidence: "HE026" }),
      inspect(
        "at_boxes",
        "Boxes",
        "boxes",
        { x: 66, y: 40, w: 24, h: 40 },
        "Boxes of papers",
        "Cardboard boxes in rows under the eaves, labeled by year in Ambrose's hand, 1971 to 2017. The one for 1998 is missing from its row. Rain drums on the slates a foot over your head.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // Below
  // -------------------------------------------------------------------------
  {
    id: "wine_cellar",
    area: AREA,
    name: "The Wine Cellar",
    subtitle: "Lower level. The main switch, and the port",
    mapPin: { x: 46, y: 64 },
    background: "loc.wine_cellar",
    ambience: "amb.wine_cellar",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect("wc_panel", "Electrical panel", "panel", { x: 5, y: 19, w: 23, h: 25 }, "The electrical panel", "The house's electrical panel, on the cellar wall.", { evidence: "HE006" }),
      inspect(
        "wc_bins",
        "Port bins",
        "rack",
        { x: 50, y: 26, w: 28, h: 44 },
        "The port bins",
        "Brick bins of old port at the back of the cellar, under a crust of dust.",
        { evidence: "HE027", visible: { any: [{ not: { flag: "records_moved" } }, { inspected: "wc_bins" }] } },
      ),
      inspect(
        "wc_bins_empty",
        "Port bins",
        "rack",
        { x: 50, y: 26, w: 28, h: 44 },
        "The port bins",
        "Brick bins of old port under a crust of dust. Behind the 1985 bin the dust has been scraped away in a long narrow stripe, the shape of a letter file, and there is a smear of fresh mud on the brick. Whatever was there has been taken out again, not long ago.",
        { visible: { all: [{ flag: "records_moved" }, { not: { inspected: "wc_bins" } }] } },
      ),
      inspect(
        "wc_areaway",
        "Outside cellar door",
        "door",
        { x: 79, y: 6, w: 20, h: 68 },
        "The outside cellar door",
        "Stone steps up to an areaway door onto the terrace. Its bolt is drawn back. Rain has blown in across the bottom steps, and on the dry top step, clear in the dust, are the wet prints of a man's smooth-soled dress shoe going out.",
      ),
      door("wc_corridor", "Door to the service corridor", "service_corridor", { x: 29, y: 16, w: 12, h: 47 }),
      crane("wc_crane", "wine_cellar", { x: 41, y: 28, w: 9, h: 56 }),
    ],
  },
  {
    id: "service_corridor",
    area: AREA,
    name: "Service Corridor",
    subtitle: "Lower level. The old passage under the house",
    background: "loc.service_corridor",
    ambience: "amb.service_corridor",
    available: { always: true },
    onMap: false,
    hotspots: [
      door("sc_cellar", "To the wine cellar", "wine_cellar", { x: 3, y: 6, w: 14, h: 82 }),
      door("sc_library", "Up to the library", "library", { x: 20, y: 8, w: 14, h: 70 }),
      inspect("sc_keys", "Key cabinet", "cabinet", { x: 35, y: 21, w: 12, h: 30 }, "The key cabinet", "A steel key cabinet on the wall, with a notebook on a string.", { evidence: "HE029" }),
      inspect(
        "sc_paneling",
        "Paneling at the end",
        "wall",
        { x: 75, y: 14, w: 11, h: 62 },
        "The end of the passage",
        "Painted tongue-and-groove paneling, the same cream as the rest of the passage. Old, and dull.",
        {
          textAfter: [
            {
              requires: { any: [{ flag: "passage_told" }, { hasEvidence: "HE021" }, { asked: "felix_stair" }, shelfOpen] },
              text: "Looking for it, you find it: a door-shaped panel in the paneling, its edges cut free of the old paint with a knife. Fresh cuts, the paint flakes still on the floor below. A flush brass latch, newly oiled.",
            },
          ],
          effects: [{ when: { any: [{ flag: "passage_told" }, { hasEvidence: "HE021" }, { asked: "felix_stair" }, shelfOpen] }, then: [{ setFlag: "lower_door_found" }] }],
        },
      ),
      door("sc_stair", "The hidden door", "servants_stair", { x: 86, y: 16, w: 9, h: 66 }, lowerDoorFound),
      inspect(
        "sc_coal",
        "Old coal room",
        "door",
        { x: 49, y: 21, w: 16, h: 56 },
        "The old coal room",
        "A low brick room off the passage, empty for fifty years: whitewashed walls gone gray, a floor of old brick, a hook in the ceiling. Cold, and very quiet. You don't want to stay in it.",
      ),
    ],
  },
  {
    id: "servants_stair",
    area: AREA,
    name: "The Servants' Stair",
    subtitle: "Inside the walls, from the study to the service corridor",
    background: "loc.servants_stair",
    ambience: "amb.servants_stair",
    available: { any: [shelfOpen, { flag: "lower_door_found" }] },
    secret: true,
    onMap: false,
    // Once anyone from Blackwood is in the stair, both ends are open and the police tape them.
    effectsOnEnter: [{ setEnv: "study_shelf", to: "B" }, { setFlag: "lower_door_found" }],
    hotspots: [
      door("ss_up", "Up to the study", "study", { x: 19, y: 0, w: 11, h: 52 }),
      door("ss_down", "Down to the service corridor", "service_corridor", { x: 45, y: 30, w: 16, h: 30 }),
      inspect("ss_dust", "Footprints in the dust", "stair", { x: 40, y: 72, w: 28, h: 26 }, "The steps", "Narrow wooden steps, thick with dust.", { evidence: "HE005" }),
      inspect(
        "ss_catch",
        "The catch inside the shelf",
        "latch",
        { x: 30, y: 28, w: 6, h: 14 },
        "The catch",
        "An iron catch on the back of the hinged shelf section, oiled and bright, with a smudge on it where a thumb pressed it down to open the shelf from this side. A partial print, maybe. Lt. Mahoney's lab could lift it.",
      ),
      inspect(
        "ss_steps",
        "The stone steps",
        "stair",
        { x: 42, y: 60, w: 24, h: 11 },
        "The stone steps at the bottom",
        "Four worn granite steps at the foot of the stair, just inside the lower door. The bottom step has a chip out of its front edge the size of a thumbnail, old and dark. In the joint below it, an old brown stain that years of cleaning have never quite reached.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // The grounds
  // -------------------------------------------------------------------------
  {
    id: "greenhouse",
    area: AREA,
    name: "The Greenhouse",
    subtitle: "Grounds. Lanterns for the procession",
    mapPin: { x: 72, y: 60 },
    background: "loc.greenhouse",
    ambience: "amb.greenhouse",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "gr_lanterns",
        "Lanterns",
        "lantern",
        { x: 0, y: 30, w: 30, h: 33 },
        "Procession lanterns",
        "Thirty paper lanterns on poles, ready for midnight, each with a candle stub and a mask tied to the pole: Oscar Wren's people have done this properly. A sign in his hand: \"PROCESSION 12:00. Through the maze to the far gate and back.\"",
      ),
      inspect(
        "gr_stove_cold",
        "Iron stove",
        "stove",
        { x: 33, y: 40, w: 13, h: 29 },
        "The iron stove",
        "A small iron stove for frost nights, cold, its grate swept clean. A box of kindling beside it and a can of lamp oil.",
        { visible: { not: { flag: "records_burned" } } },
      ),
      inspect("gr_stove", "Iron stove", "stove", { x: 33, y: 40, w: 13, h: 29 }, "The iron stove", "The greenhouse's iron stove, warm.", { evidence: "HE038", visible: { flag: "records_burned" } }),
      crane("gr_crane", "greenhouse", { x: 57, y: 28, w: 10, h: 56 }),
    ],
  },
  {
    id: "garden_maze",
    area: AREA,
    name: "The Yew Maze",
    subtitle: "Grounds. Hedges, fog, and the lane gate",
    mapPin: { x: 80, y: 38 },
    background: "loc.garden_maze",
    ambience: "amb.garden_maze",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "gm_paths",
        "The paths",
        "hedge",
        { x: 10, y: 30, w: 30, h: 50 },
        "The maze",
        "Eight-foot yew hedges black with rain. In this fog you can see ten feet down any path. Somebody could stand at the next corner and you'd never know.",
      ),
      inspect(
        "gm_gate",
        "The far gate",
        "gate",
        { x: 60, y: 24, w: 18, h: 52 },
        "The lane gate",
        "At the far side of the maze, an iron gate in the boundary wall onto a narrow lane. The padlock that Brody at the gatehouse says has been on it for years hangs open on its hasp, the shackle cut through and still bright. Somebody opened this way out tonight. Beyond it, the dark lane, and nobody watching.",
        { textAfter: [{ requires: { flag: "police_lane" }, text: "At the far side of the maze, the iron lane gate, its padlock hanging open, cut. Somewhere in the trees beyond, an officer is watching it with the lights off. You can't see her. Neither can anyone else." }] },
      ),
    ],
  },
  {
    id: "carriage_house",
    area: AREA,
    name: "The Carriage House",
    subtitle: "Grounds. Under renovation",
    mapPin: { x: 22, y: 30 },
    background: { env: "chamber", states: { A: "loc.carriage_house", B: "loc.carriage_house_open" } },
    ambience: "amb.carriage_house",
    available: { always: true },
    onMap: true,
    effectsOnEnter: [{ when: { flag: "chamber_opened" }, then: [{ setEnv: "chamber", to: "B" }] }],
    hotspots: [
      inspect("ch_plans", "Plans on a trestle", "plans", { x: 8, y: 44, w: 18, h: 26 }, "Renovation plans", "A roll of architect's plans weighted open on a trestle.", { evidence: "HE024" }),
      inspect(
        "ch_pit",
        "The inspection pit",
        "pit",
        { x: 40, y: 60, w: 24, h: 26 },
        "The inspection pit",
        "A brick-lined pit in the floor, five feet deep, where carriages were once looked at from underneath. Its floor is not the old brick of the walls but newer brick, laid flat on mortar, the joints pale. There's a chamber under it, the plans say. Someone closed it.",
        { visible: { not: { flag: "chamber_opened" } } },
      ),
      inspect("ch_chamber", "The opened chamber", "pit", { x: 40, y: 60, w: 24, h: 26 }, "The opened chamber", "Under work lights, the State Police have broken through the brick floor of the inspection pit.", { evidence: "HE025", visible: { flag: "chamber_opened" } }),
      inspect(
        "ch_doors",
        "Carriage doors",
        "door",
        { x: 72, y: 12, w: 22, h: 68 },
        "The carriage doors",
        "Tall double doors onto the yard, where a car could back right up to the pit. Twenty years ago, Amos says, one did.",
      ),
    ],
  },
  {
    id: "gatehouse",
    area: AREA,
    name: "The Gatehouse",
    subtitle: "Grounds. The estate office, the cameras and the gate",
    mapPin: { x: 20, y: 80 },
    background: "loc.gatehouse",
    ambience: "amb.gatehouse",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect("gh_monitor", "Security desk", "monitor", { x: 8, y: 34, w: 20, h: 30 }, "The security desk", "The gate and front-door camera monitors, and the guard's log printer.", { evidence: "HE015" }),
      inspect("gh_files", "Estate office files", "cabinet", { x: 34, y: 24, w: 14, h: 44 }, "The estate office files", "Gray filing cabinets for the estate works.", { evidence: "HE030" }),
      inspect(
        "gh_lot",
        "The lot",
        "window",
        { x: 54, y: 10, w: 22, h: 36 },
        "The gatehouse lot",
        "Through the window, the guests' cars nose-in along the wall in the rain. Lucian Marsh's dark gray Lincoln is nearest the gate, backed in, ready to leave.",
        { textAfter: [{ requires: { moved: "flee_gate" }, text: "Through the window, the guests' cars along the wall in the rain, and a dry rectangle on the gravel nearest the gate where Lucian Marsh's Lincoln was." }] },
      ),
      crane("gh_crane", "gatehouse", { x: 82, y: 30, w: 11, h: 54 }),
    ],
  },
];

/* Where a witness was attacked is marked on the map: a second murder, or an attack the guard stopped. */
for (const w of WITNESSES) {
  const loc = locations.find((l) => l.id === w.at);
  if (!loc) continue;
  loc.mapTags = [
    ...(loc.mapTags ?? []),
    { text: "ATTACK", when: { all: [{ flag: `attack_on_${w.id}` }, { flag: "attack_interrupted" }] } },
    { text: "SECOND MURDER", when: dead(w.id) },
  ];
}
