import type { Spot, StoryData, Shown } from "@/game/walk/story";
import { evidence } from "./evidence";

/*
 * CHR001 in the walkable North Pole: what you can look at, take and use, where, and when. Times and facts follow the
 * build contract (project doc "CHR001 Timeline and Build Contract"). Interviews (Pip's and Dasha's statements, Quill
 * finding the charter pages, Garrick's account) come with the talking; Garrick's own moves (holding off, the evening
 * attempt, fleeing) with his planner. Until then the day runs as the original day, and the murder is stopped only by
 * being in Aldric's workshop when Garrick comes up the hatch.
 */

const M = (room: string, model: string) => `chr001_${room}_model_${model}`;
const P = (room: string, piece: string) => `chr001_${room}_piece_${piece}`;

const BAG = new Set(["CE003", "CE005", "CE006", "CE007", "CE015", "CE016", "CE018", "CE019", "CE020", "CE021", "CE022", "CE023", "CE024", "CE026", "CE027", "CE028", "CE030", "CE031"]);

const spots: Spot[] = [
  // The Jingle Division office.
  { id: "bag", zone: "jingle_office", anchor: M("jingle_office", "timebag"), title: "Santa's Time Bag", text: "A small sack of deep red velvet on a brass stand, its silver clasp faintly glowing. Whatever it holds keeps through every reset.", opens: "bag" },
  { id: "bell", zone: "jingle_office", anchor: M("jingle_office", "bell"), title: "The great bell", text: "The Bureau's great silver bell. Ring it to let the day run ahead to a time you choose; it stops early at anything that matters.", opens: "bell" },

  // Aldric's workshop, at the foot of the clock tower.
  {
    id: "body", zone: "tower_workshop", anchor: M("tower_workshop", "body"), title: "Aldric", image: "ev.CE001",
    text: "Aldric lies face down under the gear train, his spectacles beside his hand, the gear guard hanging loose above him.",
    when: { dead: true },
    acts: [
      { label: "Photograph the body", evidence: "CE001" },
      { label: "Ask Dr. Glint to examine him", say: "A runner goes for Dr. Glint. She'll be a while.", minutes: 20, evidence: "CE003" },
    ],
  },
  {
    id: "words", zone: "tower_workshop", anchor: M("tower_workshop", "body"), lift: 0.3, title: "The glowing words", image: "ev.CE002",
    text: "Silver-gold elvish script glows on the floorboards beside his hand, and below it, in plain capitals of the same light: 4 HOURS REMAIN.",
    when: { dead: true },
    acts: [{ label: "Photograph the words", evidence: "CE002" }],
  },
  {
    id: "geartrain", zone: "tower_workshop", anchor: M("tower_workshop", "geartrain"), title: "The gear train", image: "ev.CE004",
    text: "The great gears of the tower clock turn slowly behind their guard.",
    when: { dead: false },
  },
  {
    id: "geartrain_after", zone: "tower_workshop", anchor: M("tower_workshop", "geartrain"), title: "The gear train", image: "ev.CE004",
    text: "The gears are clean and oiled: no blood, no cloth. The guard's bolts were pulled out of fresh splintered holes, by hand.",
    when: { dead: true },
    acts: [{ label: "Photograph the gear train", evidence: "CE004" }],
  },
  {
    id: "crank", zone: "tower_workshop", anchor: M("tower_workshop", "crank"), title: "The winding crank",
    text: "The tower's heavy brass winding crank hangs clean on its own peg, under the label CRANK.",
    when: { until: "11:52" },
  },
  {
    id: "crank_alive", zone: "tower_workshop", anchor: M("tower_workshop", "crank"), title: "The winding crank",
    text: "The tower's heavy brass winding crank hangs clean on its own peg, under the label CRANK.",
    when: { from: "11:52", dead: false },
  },
  {
    id: "crank_after", zone: "tower_workshop", anchor: M("tower_workshop", "crank"), title: "The winding crank", image: "ev.CE005",
    text: "The crank hangs on the wrong peg. There are traces in the knurled grip.",
    when: { dead: true, from: "11:52" },
    acts: [{ label: "Take the crank", evidence: "CE005", take: true }],
  },
  {
    id: "stove", zone: "tower_workshop", anchor: M("tower_workshop", "stove"), title: "The stove", image: "ev.CE006",
    text: "A polishing rag, half burned, is pushed into the stove. On the unburned hem, a tiny clock face embroidered in red with a T in it.",
    when: { dead: true, from: "11:52" },
    acts: [{ label: "Take the rag", evidence: "CE006", take: true }],
  },
  {
    id: "keys", zone: "tower_workshop", anchor: P("tower_workshop", "pegboard"), title: "The keys hook",
    text: "Aldric's key ring hangs on the hook marked KEEPER'S KEYS.",
    when: { until: "11:53" },
  },
  {
    id: "keys_alive", zone: "tower_workshop", anchor: P("tower_workshop", "pegboard"), title: "The keys hook",
    text: "Aldric's key ring hangs on the hook marked KEEPER'S KEYS.",
    when: { from: "11:53", dead: false },
  },
  {
    id: "keys_gone", zone: "tower_workshop", anchor: P("tower_workshop", "pegboard"), title: "The keys hook", image: "ev.CE007",
    text: "The hook marked KEEPER'S KEYS is empty.",
    when: { dead: true, from: "11:53" },
    acts: [{ label: "Photograph the empty hook", evidence: "CE007" }],
  },
  {
    id: "hatch", zone: "tower_workshop", anchor: M("tower_workshop", "hatch"), title: "The floor hatch",
    text: "A square hatch in the floor down to the tower cellar, bolted from above.",
    when: { until: "11:33" },
  },
  {
    id: "hatch_after", zone: "tower_workshop", anchor: M("tower_workshop", "hatch"), title: "The floor hatch", image: "ev.CE010",
    text: "The hatch is unbolted. There's coal soot on the ladder rungs below it.",
    when: { from: "11:33" },
    acts: [{ label: "Photograph the hatch", evidence: "CE010" }],
  },
  {
    id: "puller", zone: "tower_workshop", anchor: M("tower_workshop", "shelves"), title: "The workshop shelves", image: "ev.CE031",
    text: "Among the jars of screws and springs: a three-armed gear puller, tagged PROPERTY OF THE LAB. RETURN TO H. GLINT.",
    acts: [{ label: "Take the gear puller", evidence: "CE031", take: true }],
  },

  // The Chronometer chamber.
  {
    id: "case", zone: "chronometer_chamber", anchor: M("chronometer_chamber", "pedestal"), title: "The Chronometer's case",
    text: "Under the glass, on deep red velvet, the Christmas Chronometer ticks: a great golden watch about eight inches across.",
    when: { stolen: false },
  },
  {
    id: "case_empty", zone: "chronometer_chamber", anchor: M("chronometer_chamber", "pedestal"), title: "The Chronometer's case", image: "ev.CE008",
    text: "The glass case stands open. The lock was turned with a key, not forced. Only the round dent of the watch remains in the velvet.",
    when: { stolen: true },
    acts: [{ label: "Photograph the empty case", evidence: "CE008" }],
  },
  {
    id: "panel", zone: "chronometer_chamber", anchor: P("chronometer_chamber", "panel"), title: "The carved panel",
    text: "A walnut panel carved with holly, clock hands and stars. One star is a little more worn than the rest.",
    when: { notFlag: "panel_open" },
    acts: [{ label: "Press the worn star", flag: "panel_open", say: "Something clicks. The panel swings open on a little cupboard." }],
  },
  {
    id: "panel_open", zone: "chronometer_chamber", anchor: P("chronometer_chamber", "panel"), title: "Behind the panel", image: "ev.CE022",
    text: "A small cupboard: a worn leather notebook, and a roll of drawings headed THE EVERGREEN CHRONOMETER.",
    when: { flag: "panel_open" },
    acts: [
      { label: "Take Aldric's notebook", evidence: "CE021", take: true },
      { label: "Take the blueprints", evidence: "CE022", take: true },
    ],
  },

  // Santa's Workshop.
  {
    id: "shiftboard", zone: "toy_floor", anchor: P("toy_floor", "shiftboard"), title: "The shift board", image: "ev.CE011",
    text: "Chalked on the board, among the pegs: G. THORNE, STABLE CLOCK, 11:10.",
    when: { from: "11:10" },
    acts: [{ label: "Photograph the shift board", evidence: "CE011" }],
  },
  {
    id: "appointments", zone: "marigold_office", anchor: M("marigold_office", "desk"), title: "Santa's appointment book", image: "ev.CE026",
    text: "DECEMBER 24. 2:00 Aldric. To show you what I have made.",
    acts: [{ label: "Take the page", evidence: "CE026", take: true }],
  },

  // The Archives, the Lab.
  {
    id: "visitorlog", zone: "archives", anchor: M("archives", "logdesk"), title: "The visitor log", image: "ev.CE016",
    text: "Dec 20. G. Thorne. Tithe Register. And further back: Apr 3. Aldric. Guild records, the rebuilding.",
    acts: [{ label: "Take the page", evidence: "CE016", take: true }],
  },
  {
    id: "register", zone: "archives", anchor: M("archives", "lectern"), title: "The Tithe Register", image: "ev.CE017",
    text: "The great ledger of the twelve founding families. The Thorne entry is circled in pencil: House of Thorne, twelve turnings.",
    acts: [{ label: "Photograph the Register", evidence: "CE017" }],
  },
  {
    id: "globe", zone: "lab", anchor: M("lab", "globe"), title: "The winter-glass globe", image: "ev.CE025",
    text: "A great glass globe under a dust sheet, frosted inside as if full of fine silver snow. Far too big to carry.",
    acts: [{ label: "Photograph the globe", evidence: "CE025" }],
  },

  // Clockmakers' Row.
  {
    id: "garricknote", zone: "garrick_workshop", anchor: M("garrick_workshop", "bench"), title: "A note on the bench", image: "ev.CE027",
    text: "In Garrick's hand: \"He says not tonight. There is always a tonight.\"",
    acts: [{ label: "Take the note", evidence: "CE027", take: true }],
  },
  {
    id: "sketches", zone: "garrick_workshop", anchor: P("garrick_workshop", "sketches"), title: "Sketches on the wall", image: "ev.CE028",
    text: "Pencil sketches of the Chronometer with its twelve bloodline gears, and one word beside them: return?",
    acts: [{ label: "Take the sketches", evidence: "CE028", take: true }],
  },
  {
    id: "cabinet", zone: "garrick_workshop", anchor: M("garrick_workshop", "cabinet"), title: "The cabinet",
    text: "A tall locked cabinet. It needs Garrick's key, or Santa's order to open it.",
  },
  {
    id: "corwinletter", zone: "corwin_shop", anchor: M("corwin_shop", "counter"), title: "A letter on the counter", image: "ev.CE030",
    text: "\"To the Keeper of Time: for the third time this year you have retuned my clocks to run fast.\"",
    acts: [{ label: "Take the letter", evidence: "CE030", take: true }],
  },
  {
    id: "order", zone: "glassworks", anchor: M("glassworks", "orderdesk"), title: "The order spike", image: "ev.CE023",
    text: "ESCAPEMENT CRYSTAL, WINTER GLASS, ONE. FOR COLLECTION DEC 24. ALDRIC.",
    acts: [{ label: "Take the order slip", evidence: "CE023", take: true }],
  },
  {
    id: "crystal", zone: "glassworks", anchor: M("glassworks", "crystalcase"), title: "The crystal case", image: "ev.CE024",
    text: "A small clear crystal in a brass escapement cradle, waiting for collection.",
    when: { until: "11:40" },
    acts: [{ label: "Take the crystal", evidence: "CE024", take: true }],
  },
  {
    id: "crystal_gone", zone: "glassworks", anchor: M("glassworks", "crystalcase"), title: "The crystal case",
    text: "Empty. Pip collected the crystal for Aldric.",
    when: { from: "11:40" },
  },

  // Holly Lane.
  {
    id: "letters", zone: "thorne_parlor", anchor: M("thorne_parlor", "sidetable"), title: "Letters on the side table", image: "ev.CE018",
    text: "\"Dear Mira, I am sorry to tell you your years are passing far too quickly.\"",
    acts: [{ label: "Take the letters", evidence: "CE018", take: true }],
  },
  {
    id: "bookofages", zone: "thorne_parlor", anchor: M("thorne_parlor", "bookofages"), title: "The family book of ages",
    text: "The Thornes, generation by generation. Few lived past 500. Garrick's grandmother died at 410, his father at 380. Elsbeth Thorne, 241, \"worn out early.\"",
  },

  // The square and the old well.
  {
    id: "wellgrate", zone: "village_square", anchor: M("village_square", "well"), title: "The old well", image: "ev.CE013",
    text: "Fresh black soot on the padlocked iron grate, and boot marks in the snow around it. The little clock in the well-house gable is running four minutes slow.",
    when: { stolen: true, from: "12:12" },
    acts: [
      { label: "Photograph the grate", evidence: "CE013" },
      { label: "Photograph the clock", evidence: "CE014" },
    ],
  },
  {
    id: "chronometer", zone: "clock_base", anchor: M("chronometer_chamber", "chronometer"), title: "The Christmas Chronometer", image: "ev.CE029",
    text: "Wrapped in sacking at the bottom of the shaft: the great golden watch. Its face shows exactly how long remains.",
    when: { stolen: true, from: "12:12" },
    acts: [{ label: "Take the Chronometer", evidence: "CE029", take: true }],
  },
];

/** What shows when: the body only after the murder, Aldric only while he lives, the Chronometer where it is. */
const shown: Shown[] = [
  { model: M("tower_workshop", "body"), when: { dead: true } },
  // Who is where (build contract): each person is in their own place only at the times they're there.
  { person: "aldric", when: { dead: false, from: "08:20", until: "10:00" } },
  { person: "aldric", when: { dead: false, from: "10:30", until: "14:00" } },
  { person: "pip", when: { from: "08:20", until: "11:30" } },
  { person: "pip", when: { from: "12:02" } },
  { person: "garrick", when: { from: "08:40", until: "10:15" } },
  { person: "garrick", when: { from: "12:30" } },
  { person: "garrick", when: { from: "11:50", flag: "garrick_seen" } },
  { person: "mira", when: { from: "09:00" } },
  { person: "corwin", when: { until: "09:20" } },
  { person: "corwin", when: { from: "09:45" } },
  { person: "vell", when: { until: "12:05" } },
  { person: "vell", when: { from: "12:05", dead: false } },
  { model: M("chronometer_chamber", "chronometer"), zone: "chronometer_chamber", when: { stolen: false } },
  { model: M("chronometer_chamber", "chronometer"), zone: "clock_base", when: { stolen: true, from: "12:12" } },
];

export const CHR001_WALK: StoryData = {
  caseId: "CHR001",
  secondsPerMinute: 5,
  dayStart: { zone: "jingle_office", time: "08:00" },
  firstStart: { zone: "tower_workshop", time: "12:20" },
  murder: "11:47",
  theft: "11:56",
  hidden: "12:12",
  countdown: 240,
  guard: {
    zone: "tower_workshop",
    from: "11:33",
    until: "11:47",
    say: "11:33: the floor hatch lifts and Garrick Thorne climbs up into the workshop. He sees you, stops, says he came to have a word with Aldric, and goes back down the way he came. Aldric is alive.",
  },
  spots,
  shown,
  evidence: evidence.map((e) => ({ id: e.id, title: e.title, text: e.description, image: e.image ?? null, bag: BAG.has(e.id), never: e.id === "CE029" })),
};
