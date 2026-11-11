import type { EvidenceDef } from "@/game/engine/types";

/*
 * CHR001 evidence, CE001 to CE032 (CE032 exists only once a sting catches Garrick), from the case design's evidence table.
 * "Bag" items can be kept in Santa's Time Bag across resets; the Chronometer
 * (CE029) never can. Pictures: art/manifest.json chr001_ev_ce001 and on.
 */

type Row = [id: string, title: string, where: string, characters: string[], text: string, discovery: string];

const ROWS: Row[] = [
  ["CE001", "Aldric's body", "tower_workshop", ["aldric"], "Aldric lies face down under the gear train, his spectacles beside his hand, the gear guard hanging loose above him.", "In any loop where Aldric dies, from 11:47. Photograph only."],
  ["CE002", "The glowing words", "tower_workshop", ["aldric"], "Silver-gold elvish script on the floorboards beside his hand, and below it, in plain capitals of the same light: 4 HOURS REMAIN.", "Appears the moment Aldric dies. Photograph only."],
  ["CE003", "Note on the wound", "tower_workshop", ["aldric", "glint"], "\"One blow, back of the head, round and heavy, about two inches across. No marks of teeth or gears. Not an accident. H. Glint\"", "Ask Dr. Glint (or Mrs. Claus) to look at the body."],
  ["CE004", "The clean gear train", "tower_workshop", [], "The gears are clean and oiled: no blood, no cloth. The guard's bolts were pulled out of fresh splintered holes, by hand.", "Inspect the gear train after the murder. Photograph."],
  ["CE005", "The winding crank", "tower_workshop", ["garrick"], "The tower's heavy brass winding crank, hung back on the wrong peg. Traces in the knurled grip.", "Hangs clean on the right peg before 11:47, on the wrong one after."],
  ["CE006", "The burned rag", "tower_workshop", ["garrick"], "A polishing rag half burned in the stove. On the unburned hem, a tiny clock face embroidered in red with a T in it: the Thorne workshop mark.", "In the stove after 11:50."],
  ["CE007", "Aldric's keys", "tower_workshop", ["aldric", "garrick"], "The hook marked KEEPER'S KEYS is empty. Later found in Garrick's coat, or with the Chronometer.", "Missing after 11:55."],
  ["CE008", "The empty case", "chronometer_chamber", [], "The Chronometer's glass case stands open. The lock was turned with a key, not forced. Only the round dent of the watch remains in the velvet.", "In the chamber after 11:55. Photograph."],
  ["CE009", "Pip's statement", "tower_workshop", ["pip"], "Aldric sent Pip to the glassworks at 11:30. The tunnel hatch was bolted when he left.", "Ask Pip, in any loop."],
  ["CE010", "The unbolted hatch", "tower_workshop", ["garrick"], "The floor hatch to the tower cellar, bolted from above, now unbolted, with coal soot on the ladder rungs.", "After 11:33. Photograph."],
  ["CE011", "The toy floor shift board", "toy_floor", ["garrick", "bertram"], "Chalked on the board: G. THORNE, STABLE CLOCK, 11:10.", "On the toy floor's right wall, in any loop."],
  ["CE012", "Dasha's statement", "stables", ["dasha", "garrick"], "Garrick came into the stables at 11:15 to check the stable clock, went into the boiler room, and did not come back out.", "Ask Dasha, in any loop after 11:15."],
  ["CE013", "Soot on the plinth hatch", "village_square", ["garrick"], "Fresh black soot around the iron hatch in the great clock's plinth, and boot marks in the snow.", "After 12:12, in a loop where the Chronometer was stolen."],
  ["CE014", "The slow square clock", "village_square", [], "The great clock on the square is running exactly four minutes slow.", "Compare it with any good watch after 12:12."],
  ["CE015", "The square clock key ledger", "garrick_workshop", ["garrick"], "KEEPERS OF THE SQUARE CLOCK. The last line: Garrick Thorne, sole key.", "In the locked cabinet in Garrick's workshop."],
  ["CE016", "The Archives visitor log", "archives", ["garrick", "quill"], "Dec 20. G. Thorne. Tithe Register.", "On the desk by the Archives door."],
  ["CE017", "The Tithe Register", "archives", ["garrick", "mira"], "The great ledger of the twelve founding families. The Thorne entry, circled in pencil: House of Thorne, twelve turnings.", "On the lectern in the Archives."],
  ["CE018", "Mira's letters from the healer", "thorne_parlor", ["mira"], "\"Dear Mira, I am sorry to tell you your years are passing far too quickly.\"", "On the side table in the Thornes' parlor."],
  ["CE019", "The Keeper's Bond", "archives", ["aldric", "santa"], "A page of Santa's founding charter: if the Keeper dies on Christmas Eve, the Chronometer holds the day open four hours, then rings it back to its first winding.", "On the Archives shelves; Quill can find it."],
  ["CE020", "The Thorne gear", "archives", ["garrick"], "A guild record of the Chronometer's rebuilding, about 400 years ago: The Thorne gear, cut by Edwin Thorne, with one tooth marked.", "On the Archives shelves."],
  ["CE021", "Aldric's notebook", "chronometer_chamber", ["aldric", "garrick"], "\"The Thorne gear slips. Twelve turnings, not one. It was never their fault.\"", "Behind the carved panel in the Chronometer chamber."],
  ["CE022", "The Evergreen blueprints", "chronometer_chamber", ["aldric"], "Drawings of THE EVERGREEN CHRONOMETER: a new chronometer drawing on a reservoir of time banked through the year, not on anyone's life.", "Behind the carved panel in the Chronometer chamber."],
  ["CE023", "The glassworks order", "glassworks", ["aldric", "pip"], "ESCAPEMENT CRYSTAL, WINTER GLASS, ONE. FOR COLLECTION DEC 24. ALDRIC.", "On the spike on the glassworks desk."],
  ["CE024", "The escapement crystal", "glassworks", ["aldric", "pip"], "A small clear crystal in a brass escapement cradle.", "In the glassworks case until Pip collects it at about 11:40."],
  ["CE025", "The winter-glass globe", "lab", ["glint", "aldric"], "A great glass globe in the Lab, frosted inside as if full of fine silver snow. Too big to carry.", "Under a dust sheet in the Lab. Photograph only."],
  ["CE026", "Santa's appointment book", "marigold_office", ["aldric", "santa", "marigold"], "DECEMBER 24. 2:00 Aldric. To show you what I have made.", "On Marigold's desk."],
  ["CE027", "Garrick's note", "garrick_workshop", ["garrick", "aldric"], "\"He says not tonight. There is always a tonight.\"", "On Garrick's workbench."],
  ["CE028", "Garrick's sketches", "garrick_workshop", ["garrick"], "Sketches of the Chronometer with its twelve bloodline gears, and one word beside them: return?", "Pinned on the wall of Garrick's workshop."],
  ["CE029", "The Christmas Chronometer", "clock_base", ["aldric", "garrick"], "The great golden watch that makes Christmas Eve long enough. Once in hand, its face shows exactly how long remains.", "Hidden inside the great clock after 12:12 in a loop where it was stolen; otherwise in its case in the chamber. Never fits in the Time Bag."],
  ["CE030", "Corwin's letter of complaint", "corwin_shop", ["corwin", "aldric"], "\"To the Keeper of Time: for the third time this year you have retuned my clocks to run fast.\"", "On Corwin's counter."],
  ["CE032", "Caught in the act", "tower_workshop", ["garrick", "aldric"], "The Bureau's own report of the moment Garrick Thorne was stopped: where, when, what he held and who saw it.", "Made when a sting catches Garrick in the act."],
  ["CE031", "The gear puller", "tower_workshop", ["glint", "aldric"], "Dr. Glint's missing gear puller, borrowed by Aldric. PROPERTY OF THE LAB. RETURN TO H. GLINT.", "On the shelves in Aldric's workshop."],
];

export const EVIDENCE_IDS = ROWS.map(([id]) => id);

export const evidence: EvidenceDef[] = ROWS.map(([id, title, where, chars, text, discovery]) => ({
  id,
  title,
  description: text,
  sourceLocationId: where,
  image: `ev.${id}`,
  inspection: text,
  discovery,
  characters: chars,
  related: [],
  boardable: true,
}));
