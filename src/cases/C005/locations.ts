import type { Condition, Effect, HotspotDef, LocationDef } from "@/game/engine/types";
import { bellsAvailable } from "./mechanics";
import { briefed, reportAvailable } from "./story";

/*
 * Scene layout for C005. Hotspot rectangles are percentages of a 16:9 frame,
 * laid out for placeholder art; refit every one once its painting lands.
 *
 * Every place is on foot: the abbey, the mill a mile east across Fell Beck,
 * Ashcombe Hall three miles up the moor. One area, so travel is always a walk.
 *
 * Scenes that change with the story use condition overlays on one painting:
 * the cloister (Peter's folded cloak after RE03), the church (the candlestick
 * becomes evidence once the inventory is read), the cellar (the salt store
 * after RE07) and the muniment room (locked until RE08).
 */

const AREA = "wendale";
const archiveOpen: Condition = { event: "RE08" };

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

/**
 * Sister Agnes's examination takes no clock time, only a journey: once it
 * is asked for, the next walk anywhere counts, and the result waits on the
 * chamber table (event EX1).
 */
const onEnter: Effect[] = [{ when: { flag: "x1_requested" }, then: [{ setFlag: "x1_traveled" }] }];

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  ch_casefile: "art.obj_commission",
  ch_journal: "art.obj_journal",
  ch_lectern: "art.obj_lectern",
  ch_bells: "art.obj_bellstrip",
  ch_door: "art.obj_door",
  sc_thomas: "art.figure_thomas",
  cu_anselm: "art.figure_anselm",
  cl_peter: "art.figure_peter",
  ab_abbot: "art.figure_abbot",
  ce_matthias: "art.figure_matthias",
  ce_margery: "art.figure_margery",
  ga_william: "art.figure_william",
  mi_alice: "art.figure_alice",
  mi_peter: "art.figure_peter",
  ma_roland: "art.figure_roland",
  ma_geoffrey: "art.figure_geoffrey",
  in_agnes: "art.figure_agnes",
  to_simon: "art.figure_simon",
  cl_cloak: "art.obj_cloak",
  ce_salt: "art.obj_saltbin",
};

export const locations: LocationDef[] = [
  {
    id: "chamber",
    area: AREA,
    name: "Your Chamber",
    subtitle: "The guest-house, Saint Aldwyn's Abbey",
    mapPin: { x: 30, y: 52 },
    mapTag: "YOUR CHAMBER",
    background: "loc.chamber",
    ambience: "amb.chamber",
    available: { always: true },
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      panel("ch_casefile", "The archdeacon's commission", "folder", { x: 30, y: 66, w: 16, h: 20 }, "casefile"),
      {
        ...panel("ch_board", "Deduction table", "board", { x: 34, y: 44, w: 32, h: 20 }, "board"),
        attention: { all: [{ callAnswered: "letter_board" }, { not: { boardConnections: 1 } }] },
        callout: { text: "Tap here to lay out your evidence", when: { all: [{ callAnswered: "letter_board" }, { not: { boardConnections: 1 } }] } },
      },
      {
        ...panel("ch_door", "The door: letters and messengers", "door", { x: 0, y: 8, w: 14, h: 70 }, "phone"),
        attention: { any: ["letter_board", "letter_warning", "visit_abbot_archive", "visit_thomas_peter", "visit_margery", "visit_william_mill", "letter_geoffrey", "visit_abbot_search"].map((c) => ({ callPending: c })) },
      },
      panel("ch_journal", "Journal", "notebook", { x: 16, y: 70, w: 12, h: 16 }, "notebook"),
      {
        ...panel("ch_map", "Map of Wendale", "map", { x: 72, y: 8, w: 20, h: 32 }, "map"),
        attention: { all: [briefed, { not: { inspected: "ch_map" } }] },
        callout: { text: "Tap here to travel", when: { all: [briefed, { not: { inspected: "ch_map" } }] } },
      },
      {
        ...panel("ch_bells", "The bell timeline", "schedule", { x: 46, y: 8, w: 24, h: 18 }, "sequence", bellsAvailable),
        callout: { text: "Set the evening in order", when: { all: [{ hasEvidence: "E23" }, { not: { inspected: "ch_bells" } }] } },
      },
      {
        ...panel("ch_lectern", "The lectern: compare writings", "typewriter", { x: 76, y: 48, w: 18, h: 30 }, "comparison", { all: [{ hasEvidence: "E09" }, { hasEvidence: "E10" }] }),
        attention: { all: [{ hasEvidence: "E31" }, { not: { hasEvidence: "E32" } }] },
        callout: { text: "Compare the writings here", when: { all: [{ hasEvidence: "E09" }, { hasEvidence: "E10" }, { not: { inspected: "ch_lectern" } }] } },
      },
      {
        id: "ch_exam",
        label: "Sister Agnes's examination",
        kind: "sprite",
        rect: { x: 50, y: 66, w: 14, h: 18 },
        visible: { any: [{ deliveryPending: "exam_candlestick" }, { all: [{ deliveryOpened: "exam_candlestick" }, { not: { hasEvidence: "E21" } }] }] },
        sprite: [{ image: "obj.folded_letter" }],
        attention: { deliveryPending: "exam_candlestick" },
        interaction: { type: "delivery", deliveryId: "exam_candlestick" },
      },
      inspect("ch_window", "Window", "window", { x: 16, y: 6, w: 22, h: 36 }, "The window", "Rain on thick green glass. Across the outer court, the gatehouse lamp, the bell tower against a gray sky, and beyond the wall the brown moor going up into cloud."),
      {
        ...panel("ch_report", "Your finding for the archdeacon", "sprite", { x: 60, y: 76, w: 16, h: 22 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.finding" }],
      },
    ],
  },
  {
    id: "book_room",
    area: AREA,
    name: "The Book Room",
    subtitle: "Off the cloister's west walk",
    mapTag: "WHERE HE DIED",
    mapPin: { x: 46, y: 40 },
    background: "loc.book_room",
    ambience: "amb.book_room",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      inspect("br_sketch", "A sketch pinned inside the door", "photo", { x: 4, y: 20, w: 10, h: 18 }, "Thomas's sketch", "A sheet of scrap parchment pinned to the door frame, drawn in brown ink by the abbot's order before Edmund was carried away.", { evidence: "E01" }),
      inspect("br_desk", "Edmund's desk", "desk", { x: 34, y: 46, w: 30, h: 20 }, "Edmund's desk", "The oak desk under the window, ink spilled across the open register and dried. Near the left corner of the front edge, something has been struck hard.", { evidence: "E03" }),
      inspect("br_door", "The door and its bar", "door", { x: 14, y: 10, w: 12, h: 74 }, "The book room door", "The door stands open on its hinges. The iron bracket that held the bar hangs crooked from the wall.", { evidence: "E04" }),
      inspect("br_chest", "The charter chest", "drawer", { x: 72, y: 50, w: 20, h: 24 }, "The charter chest", "An iron-bound chest, its lid up. Inside, rolled and folded writings, each tagged; and a narrow leather-bound book of what came in and went out.", { evidence: "E08" }),
      inspect("br_register", "The register", "diary", { x: 44, y: 38, w: 12, h: 10 }, "The register", "The abbey's great book of copied charters, open on the desk, the ink spilled across a half-copied page. Something has been pushed into the binding at the back.", { evidence: "E14" }),
      inspect(
        "br_aumbry",
        "The candle aumbry",
        "drawer",
        { x: 26, y: 30, w: 8, h: 12 },
        "The candle aumbry",
        "A small wooden door in the wall beside the bracket, at chest height. Inside, a few candles, a pot of ink, and at the back of the cupboard another little door, set in the wall itself, shut.",
        { textAfter: [{ requires: { hasEvidence: "E05" }, text: "The back of the cupboard opens into the cellarer's passage. With both little doors open, the bar's free end is a hook's reach from the other side." }] },
      ),
      inspect("br_floor", "Where he lay", "rug", { x: 40, y: 72, w: 26, h: 14 }, "Where he lay", "The floor has been scrubbed, but not well. Between the desk and the chest the stone is darker, and a stool lies where it fell."),
      door("br_to_cloister", "Out to the cloister", "cloister", { x: 92, y: 10, w: 8, h: 70 }),
    ],
  },
  {
    id: "scriptorium",
    area: AREA,
    name: "The Scriptorium",
    subtitle: "Carrels along the cloister's north walk",
    mapPin: { x: 52, y: 30 },
    background: "loc.scriptorium",
    ambience: "amb.scriptorium",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("sc_thomas", "Brother Thomas", "thomas", { x: 58, y: 22, w: 12, h: 62 }),
      inspect("sc_carrel", "Edmund's carrel", "desk", { x: 12, y: 40, w: 24, h: 30 }, "Edmund's carrel", "A wooden carrel facing the garth, a cushion worn thin, quills in a pot. Under a weight, several sheets in Edmund's careful hand.", { evidence: "E10" }),
      inspect("sc_exemplar", "The exemplar book", "diary", { x: 40, y: 56, w: 14, h: 14 }, "The exemplar book", "The scriptorium's teaching book of hands lies open on a reading stand, a thread marking the page.", { evidence: "E13" }),
      inspect("sc_novices", "The novices' desks", "desk", { x: 76, y: 52, w: 22, h: 22 }, "The novices' desks", "Wax tablets and practice sheets. On one sheet a novice has copied the same line of a psalm eleven times, getting worse each time."),
    ],
  },
  {
    id: "church",
    area: AREA,
    name: "The Abbey Church",
    subtitle: "The choir, the Lady altar and the sacristy",
    mapPin: { x: 50, y: 18 },
    background: "loc.church",
    ambience: "amb.church",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("cu_anselm", "Brother Anselm", "anselm", { x: 62, y: 24, w: 12, h: 62 }),
      inspect("cu_sacristy", "The sacristy inventory board", "notices", { x: 84, y: 22, w: 12, h: 26 }, "The sacristy door", "Inside the sacristy door hangs a board listing the church's furnishings, with a strip of parchment below for anything lent out.", { evidence: "E19" }),
      inspect("cu_altar", "The Lady altar", "sideboard", { x: 16, y: 36, w: 22, h: 30 }, "The Lady altar", "A small side altar in the south aisle under a painted Virgin, two bronze candlesticks standing as a pair, a tall candle and a short one.", { visible: { not: { hasEvidence: "E19" } } }),
      inspect("cu_altar_b", "The Lady altar candlesticks", "sideboard", { x: 16, y: 36, w: 22, h: 30 }, "The Lady altar", "Two bronze candlesticks stand as a pair. But the sacristan's board says one of them was lent to Edmund and never returned.", { evidence: "E20", visible: { hasEvidence: "E19" } }),
      inspect("cu_stalls", "The choir stalls", "bench", { x: 40, y: 44, w: 20, h: 24 }, "The choir stalls", "Two rows of oak stalls facing each other, each with its lamp. Edmund's stall, near the end, has a wreath of rosemary laid on its desk. The cellarer's is beside the lamp the sacristan trims."),
    ],
  },
  {
    id: "cloister",
    area: AREA,
    name: "The Cloister",
    subtitle: "The walks around the garth",
    mapPin: { x: 46, y: 32 },
    background: "loc.cloister",
    ambience: "amb.cloister",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("cl_peter", "Novice Peter", "peter", { x: 40, y: 26, w: 11, h: 58 }, { not: { event: "RE03" } }),
      inspect("cl_cloak", "Peter's place on the novices' bench", "bench", { x: 36, y: 60, w: 18, h: 16 }, "The novices' bench", "On the stone bench where the novices sit, a black cloak folded square, a psalter on top of it.", { evidence: "E27", visible: { event: "RE03" } }),
      door("cl_to_book_room", "The book room door, west walk", "book_room", { x: 2, y: 20, w: 10, h: 60 }),
      inspect(
        "cl_passage_door",
        "A low door on the west walk",
        "door",
        { x: 14, y: 30, w: 8, h: 46 },
        "A low door",
        "A narrow oak door a dozen paces from the book room, iron-banded and locked. Brother Anselm says it is the cellarer's passage, and only he and the cellarer hold keys.",
        { visible: { not: { hasEvidence: "E04" } } },
      ),
      door("cl_to_passage", "The cellarer's passage", "passage", { x: 14, y: 30, w: 8, h: 46 }, { hasEvidence: "E04" }),
      inspect("cl_chapter", "The chapter house door, east walk", "doorway", { x: 80, y: 24, w: 12, h: 54 }, "The chapter house", "Where the brethren sit for chapter each morning and for the Collation reading each evening. From its door you cannot see the west walk at all; the garth and its well are in the way."),
      inspect("cl_garth", "The garth", "window", { x: 54, y: 30, w: 24, h: 30 }, "The garth", "A square of wet grass with a well in the middle. Around it the four walks, roofed and shadowed. After dark, with the brethren at their reading, the walks are empty."),
    ],
  },
  {
    id: "passage",
    area: AREA,
    name: "The Cellarer's Passage",
    subtitle: "Behind the book room",
    mapPin: { x: 40, y: 40 },
    background: "loc.passage",
    ambience: "amb.passage",
    available: { hasEvidence: "E04" },
    secret: true,
    onMap: true,
    effectsOnEnter: [...onEnter, { setFlag: "passage_opened" }],
    hotspots: [
      inspect("pa_aumbry", "A small door in the wall", "drawer", { x: 40, y: 34, w: 12, h: 16 }, "The aumbry, from behind", "Halfway along the passage, at chest height, a little wooden door is set into the wall.", { evidence: "E05" }),
      inspect("pa_frame", "The frame of the opening", "hand", { x: 52, y: 32, w: 8, h: 20 }, "The rough frame", "The opening behind the little door was cut through the wall and never finished. A nail head stands proud on the left side.", { evidence: "E06" }),
      inspect("pa_stores", "Stores along the wall", "basket", { x: 66, y: 50, w: 24, h: 30 }, "Stores", "Bundles of candles, a cask of lamp oil, rolled parchment for the scriptorium, a crate of wine for the Mass. Everything the church and the book room use passes along here."),
      door("pa_to_cellar", "The door to the kitchen court", "cellar", { x: 90, y: 14, w: 10, h: 66 }),
      door("pa_to_cloister", "The door to the cloister", "cloister", { x: 0, y: 14, w: 10, h: 66 }),
    ],
  },
  {
    id: "abbot_chamber",
    area: AREA,
    name: "The Abbot's Chamber",
    subtitle: "Above the outer parlor",
    mapPin: { x: 62, y: 46 },
    background: "loc.abbot_chamber",
    ambience: "amb.abbot_chamber",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("ab_abbot", "Abbot Benedict", "abbot", { x: 50, y: 24, w: 13, h: 62 }),
      inspect("ab_roll", "An account roll on the table", "tray", { x: 22, y: 56, w: 20, h: 16 }, "The table", "A long roll lies half unwound on the abbot's table, weighted with an inkpot. The heading reads, in Latin, the account of the cellarer at Michaelmas.", { evidence: "E15" }),
      inspect("ab_letters", "Letters on the side table", "envelope", { x: 74, y: 52, w: 16, h: 14 }, "Letters", "Letters with the seals of the bishop, the archdeacon, and Ashcombe. The abbot moves the Ashcombe one under the others when he sees you look."),
      inspect("ab_fire", "The fire", "window", { x: 6, y: 30, w: 16, h: 40 }, "The fire", "The only good fire in the abbey. On the mantel, a small carved Saint Aldwyn, seated, a book on his knee."),
    ],
  },
  {
    id: "cellar",
    area: AREA,
    name: "The Kitchen Court and Cellar",
    subtitle: "The cellarer's range, west of the cloister",
    mapPin: { x: 34, y: 38 },
    background: "loc.cellar",
    ambience: "amb.cellar",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("ce_matthias", "Brother Matthias", "matthias", { x: 44, y: 24, w: 12, h: 62 }),
      person("ce_margery", "Margery, at the kitchen door", "margery", { x: 82, y: 28, w: 11, h: 56 }),
      inspect("ce_habit", "A habit on a peg in the checker", "coatrack", { x: 6, y: 18, w: 10, h: 44 }, "The checker", "The cellarer's office, a little room of tallies and keys off the cellar. A black habit hangs on a peg by the door.", { evidence: "E07" }),
      inspect("ce_daybook", "The cellarer's day book", "diary", { x: 20, y: 54, w: 14, h: 12 }, "The checker desk", "A desk of tally sticks, a balance, a book of daily spending in a neat hand.", { evidence: "E16" }),
      inspect("ce_tally", "The tally box", "tin", { x: 34, y: 58, w: 8, h: 10 }, "The tally box", "A wooden box of notched tally sticks. Under them, something folded small.", { evidence: "E17", visible: { hasEvidence: "E16" } }),
      inspect("ce_passage_door", "The passage door in the court", "door", { x: 66, y: 22, w: 8, h: 50 }, "The passage door", "A low iron-banded door in the court's corner. From the guest kitchen's window, by the court lamp, you can see it plainly."),
      inspect("ce_salt", "The salt store", "basket", { x: 22, y: 30, w: 14, h: 22 }, "The salt store", "The abbot and the prior stand at the open door of the salt store while you go through it. Casks of salt fish, a great salt bin with a wooden lid.", { evidence: "E31", visible: { flag: "cellar_searched" } }),
    ],
  },
  {
    id: "gatehouse",
    area: AREA,
    name: "The Gatehouse",
    subtitle: "The abbey's only way in and out",
    mapPin: { x: 24, y: 62 },
    background: "loc.gatehouse",
    ambience: "amb.gatehouse",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("ga_william", "William Carter, gatekeeper", "william", { x: 46, y: 26, w: 12, h: 60 }),
      inspect("ga_roll", "The gate roll", "orders", { x: 18, y: 52, w: 16, h: 14 }, "The gate roll", "A long strip of parchment on a board by the window, a line for every comer, kept in a heavy, careful hand.", { evidence: "E25" }),
      inspect("ga_gate", "The gate", "door", { x: 70, y: 10, w: 26, h: 72 }, "The gate", "Two great oak leaves and a wicket. William bars them at Compline and opens them at first light. The precinct wall runs off either side, too high to climb except where it meets the mill-race."),
    ],
  },
  {
    id: "mill",
    area: AREA,
    name: "The Mill at Hollin Bridge",
    subtitle: "A mile east, across Fell Beck",
    mapPin: { x: 82, y: 58 },
    background: "loc.mill",
    ambience: "amb.mill",
    available: { event: "RE05" },
    secret: true,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("mi_alice", "Alice Miller", "alice", { x: 28, y: 26, w: 12, h: 60 }),
      person("mi_peter", "Novice Peter", "peter", { x: 58, y: 30, w: 11, h: 54 }),
      inspect("mi_wheel", "The wheel", "window", { x: 78, y: 18, w: 20, h: 50 }, "The wheel", "The beck runs high and brown under the wheel. A boy wading it in the dark would have been wet to the waist."),
      inspect("mi_loft", "The loft ladder", "lift", { x: 4, y: 10, w: 12, h: 60 }, "The loft", "A ladder up to the loft over the millstones. Blankets, a cup, a candle stub."),
    ],
  },
  {
    id: "manor",
    area: AREA,
    name: "Ashcombe Hall",
    subtitle: "Lord Roland's manor, three miles up the moor",
    mapPin: { x: 70, y: 10 },
    background: "loc.manor",
    ambience: "amb.manor",
    available: { any: [{ event: "RE01" }, { hasEvidence: "E17" }] },
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("ma_roland", "Lord Roland Ashcombe", "roland", { x: 34, y: 22, w: 13, h: 64 }),
      person("ma_geoffrey", "Geoffrey Hale, the steward", "geoffrey", { x: 64, y: 26, w: 12, h: 60 }),
      inspect("ma_hall", "The hall", "window", { x: 4, y: 8, w: 22, h: 50 }, "The hall", "A high hall with a fire in the middle and a hound asleep by it. On the wall, the Ashcombe arms. Through the open door, men are cutting hedge stakes in the yard."),
    ],
  },
  {
    id: "muniments",
    area: AREA,
    name: "The Muniment Room",
    subtitle: "Above the chapter house, under three keys",
    mapPin: { x: 58, y: 36 },
    background: "loc.muniments",
    ambience: "amb.muniments",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      inspect("mu_locked", "The door", "door", { x: 40, y: 12, w: 20, h: 72 }, "The muniment room door", "Three locks, three keyholes: the abbot's, the prior's, and the librarian's. The door does not move.", { visible: { not: archiveOpen } }),
      inspect("mu_seals", "The seal drawer", "drawer", { x: 14, y: 50, w: 20, h: 18 }, "The seal drawer", "A shallow drawer of loose seal impressions in wax, each with a slip. Beside it, the abbey's chronicle, its pages marked with threads.", { evidence: "E11", visible: archiveOpen }),
      inspect("mu_necrology", "The necrology", "diary", { x: 56, y: 46, w: 16, h: 16 }, "The necrology", "The book of the abbey's dead, read aloud in chapter on each one's day.", { evidence: "E12", visible: archiveOpen }),
      inspect("mu_chests", "The chests", "drawer", { x: 74, y: 40, w: 22, h: 34 }, "The chests", "Iron-bound chests of grants, leases and bulls, two hundred years of them, each labeled in a different hand.", { visible: archiveOpen }),
    ],
  },
  {
    id: "infirmary",
    area: AREA,
    name: "The Infirmary",
    subtitle: "East of the cloister",
    mapPin: { x: 66, y: 32 },
    background: "loc.infirmary",
    ambience: "amb.infirmary",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("in_agnes", "Sister Agnes", "agnes", { x: 56, y: 24, w: 12, h: 62 }),
      inspect("in_edmund", "Brother Edmund, laid out", "sofa", { x: 14, y: 52, w: 34, h: 20 }, "Brother Edmund", "Laid out on a board under a linen sheet, candles at head and foot. Sister Agnes has washed him and bound his head. She will tell you what she saw, if you ask."),
      inspect("in_odo", "Brother Odo, asleep", "chair", { x: 78, y: 46, w: 16, h: 30 }, "Brother Odo", "The abbey's old infirmarian, too ill now to rise, breathing slow under a heap of blankets. Agnes was sent from Thornholme to nurse him."),
    ],
  },
  {
    id: "tower",
    area: AREA,
    name: "The Bell Tower",
    subtitle: "Above the crossing of the church",
    mapPin: { x: 54, y: 10 },
    background: "loc.tower",
    ambience: "amb.tower",
    available: briefed,
    onMap: true,
    effectsOnEnter: onEnter,
    hotspots: [
      person("to_simon", "Brother Simon", "simon", { x: 52, y: 26, w: 12, h: 60 }),
      inspect("to_customary", "The customary on its chain", "diary", { x: 14, y: 46, w: 14, h: 16 }, "The customary", "A thick book chained to a shelf, the abbey's book of how things are done. A ribbon marks the page on the bells.", { evidence: "E22" }),
      inspect("to_rope", "The great bell's rope", "rack", { x: 32, y: 6, w: 8, h: 70 }, "The rope", "A new rope, pale and stiff, hangs beside the old one, which lies coiled on the floor with its end frayed through."),
      inspect("to_frame", "Behind a beam of the bell frame", "drawer", { x: 74, y: 30, w: 14, h: 18 }, "The bell frame", "Where the novice who helps with the ringing sits, a gap behind a beam. Something has been pushed into it.", { evidence: "E28", visible: { event: "RE03" } }),
      inspect("to_frame_a", "The bell frame", "drawer", { x: 74, y: 30, w: 14, h: 18 }, "The bell frame", "Heavy oak beams holding the great bell. A worn place on one beam where someone sits while the ringer works.", { visible: { not: { event: "RE03" } } }),
    ],
  },
];

for (const l of locations) for (const h of l.hotspots) if (ART[h.id]) h.art = ART[h.id];
