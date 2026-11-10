import type { SoundtrackDef } from "@/game/engine/types";

/*
 * CHR001's music, room sound and sound effects, made once with ElevenLabs from
 * the Admin page and served from storage. Christmas Eve at Santa's North Pole
 * in the polar night: warm, old-fashioned and a little magical, with a murder
 * at its heart, so never jolly-cartoonish and never horror. Clocks, bells and
 * clockwork run through everything. Sound effects (kind "sfx") are one-shots
 * for the walkable 3D client to play on events.
 */
const room = (key: string, label: string, prompt: string): SoundtrackDef => ({ key, kind: "ambience", label, seconds: 30, prompt: `${prompt} Seamless loop.` });
const sfx = (key: string, label: string, seconds: number, prompt: string): SoundtrackDef => ({ key, kind: "sfx", label, seconds, prompt });

export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Warm, old-fashioned orchestral mystery score for a murder on Christmas Eve in Santa's snowbound elf village. A celesta and music box carry a gentle, slightly sad Christmas melody over pizzicato strings that tick like a clock, soft French horn and sleigh bells far in the background, low cello underneath for a sense of something wrong. Wonder and unease together, never jolly, never horror. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.investigation",
    kind: "music",
    label: "Investigation",
    seconds: 150,
    prompt:
      "Quiet, thoughtful investigation underscore for detectives searching a snowy fairy-tale village on Christmas Eve. A steady clock-like tick on wood blocks and muted pizzicato, a soft glockenspiel figure that keeps circling back, warm low clarinet and strings, a hint of sleigh bells. Curious and focused, never tense enough to tire the ear. Steady dynamics so it can loop. Instrumental only.",
  },
  {
    key: "music.countdown",
    kind: "music",
    label: "The countdown",
    seconds: 150,
    prompt:
      "Tense underscore for the last hours of a magical countdown before time resets on Christmas Eve. A relentless ticking pulse on harpsichord and plucked strings, a celesta motif of four notes climbing, deep tolling bell notes every few bars, low strings slowly building but never peaking, a heartbeat-like bass drum. Urgent and wondrous. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "music.morning_again",
    kind: "music",
    label: "Christmas Eve, again (after a reset)",
    seconds: 90,
    prompt:
      "A gentle, uncanny morning cue for waking up on the same Christmas Eve again after time has rewound. A music box plays a simple Christmas melody slightly too slowly, then a soft string chord swells as if remembering, a single clear bell, distant children's choir humming without words, warm and strange. Calm dynamics, can loop. Instrumental only.",
  },
  {
    key: "music.sting",
    kind: "music",
    label: "The trap (waiting in hiding)",
    seconds: 150,
    prompt:
      "Hushed suspense cue for investigators hiding in a clock tower waiting to catch a killer in the act on Christmas Eve. Very quiet ticking of many clocks, a sustained low string note, soft tremolo violins, a muted horn motif that never resolves, occasional single chimes of a tiny bell. Breath-held and patient. Even, very quiet dynamics so it can loop. Instrumental only.",
  },
  {
    key: "music.restored",
    kind: "music",
    label: "Ending: Christmas Restored",
    seconds: 120,
    prompt:
      "A warm, relieved but bittersweet closing theme for Christmas Eve saved after a murder was stopped. Full gentle orchestra: strings and horns take up a Christmas melody first heard on a music box, celesta and sleigh bells join, a soft choir without words, the clock-tick motif slowing to stillness. Hopeful, with a trace of sadness for what is not yet fixed. Instrumental only.",
  },
  {
    key: "music.forever",
    kind: "music",
    label: "Ending: Christmas Restored, Forever",
    seconds: 150,
    prompt:
      "A soaring, joyful true-ending theme for the first Christmas in centuries that costs no one any years of their life. A music box Christmas melody grows into full orchestra and wordless choir, church bells and sleigh bells ringing together, horns in triumph, strings warm and wide, ending on a held chord and one clear bell. Moving and grand without being loud for its own sake. Instrumental only.",
  },

  // Room sound. Polar night everywhere: wind, snow, distant bells and clocks.
  room("amb.bureau_hall", "Room sound: the Bureau front hall", "A warm timber front hall on a snowy night in an old-fashioned village. A pot-bellied stove ticking and crackling, wind outside the heavy door, a wall clock ticking, a door bell tinkling faintly somewhere, muffled footsteps on boards."),
  room("amb.jingle_office", "Room sound: the Jingle Division office", "A quiet pine-paneled investigators' office on a snowy night. A log fire crackling, several small clocks ticking on a mantel slightly out of step, wind against the windows, the soft hiss of a brass speaking tube, papers shifting. Calm and focused."),
  room("amb.village_square", "Room sound: the village square", "Outdoors in a snowy elf village square on Christmas Eve at night. Soft wind, footsteps crunching in snow, distant cheerful voices and a carol being hummed, sleigh bells passing far off, the deep slow tick of a big outdoor clock, a market stall's canvas flapping."),
  room("amb.tower_workshop", "Room sound: Aldric's workshop", "Inside the stone base of an old clock tower. The heavy, slow tick and clunk of huge tower clock gears close by, a small iron stove crackling, wind whistling at a narrow window, tiny tinkle of brass parts. Still and echoing."),
  room("amb.gear_gallery", "Room sound: the gear gallery", "Inside a tall stone clock tower shaft. A giant pendulum swinging with a deep whoosh and tock, big gears grinding slowly overhead, wooden stairs creaking, wind moaning far above, cold echo."),
  room("amb.chronometer_chamber", "Room sound: the Chronometer chamber", "A small room at the very top of a clock tower behind its great clock faces. The huge hands moving with a soft heavy clunk each minute, wind against the glass faces, a very faint high magical shimmer like a glass harmonica, a delicate fast ticking."),
  room("amb.tower_cellar", "Room sound: the tower cellar", "A stone cellar under a clock tower. Muffled heavy ticking from the floor above, dripping water, coal shifting in a bin, a draft whistling under an iron door."),
  room("amb.tunnels", "Room sound: the steam tunnels", "A long brick steam tunnel under a snowy village. Steam pipes hissing and ticking as they expand, echoing drips, a distant rumble of a boiler, faint footsteps far down the tunnel, a low hum."),
  room("amb.clock_base", "Room sound: under the great clock", "A cramped stone space inside the base of a big outdoor clock. Heavy chains and weights creaking slowly, a deep close tick, muffled wind and village voices outside through thick stone."),
  room("amb.toy_floor", "Room sound: the toy floor", "Santa's busy toy workshop on Christmas Eve. Many elves hammering, sawing and sanding wood, a wooden roller conveyor rumbling, toy drums and bells being tested, cheerful chatter and a whistle, paper being wrapped, all at a gentle distance."),
  room("amb.santa_office", "Room sound: Santa's office", "A big wood-paneled office on a snowy night. A large fire crackling, a grand clock ticking, wind outside tall windows, reindeer bells faintly far off, a quill scratching. Warm and calm."),
  room("amb.marigold_office", "Room sound: Marigold's office", "A small tidy office next to a busy workshop. A carriage clock ticking briskly, papers being stacked, muffled workshop noise through the wall, a pen nib scratching."),
  room("amb.kitchen", "Room sound: the great kitchen", "A big warm old-fashioned kitchen on Christmas Eve. A cast-iron range crackling, pots bubbling, an oven door creaking, a kettle starting to sing, trays clattering, cheerful muffled voices next door."),
  room("amb.archives", "Room sound: the Archives", "A tall, hushed hall of old books and ledgers. Deep quiet, a heavy page turning, a rolling ladder squeaking, a slow grand clock, wind high against tall windows, a faint dry rustle."),
  room("amb.lab", "Room sound: the Engineering Lab", "A cluttered magical engineering laboratory. A crystal kiln roaring softly, glass tubes bubbling, a brass governor whirring, faint electrical crackle, a delicate glassy chime now and then, wind on a glass roof."),
  room("amb.clockmakers_row", "Room sound: Clockmakers' Row", "Outdoors on a narrow snowy street of clockmakers' shops at night. Snow underfoot, many clocks ticking and chiming faintly through shop windows, a shop bell tinkling, a glassworks furnace roaring softly down the street, wind."),
  room("amb.garrick_workshop", "Room sound: Garrick's workshop", "A small clockmaker's workshop at night. Dozens of clocks ticking out of step, a tiny lathe whirring and stopping, a small stove ticking, a tool set down on wood, wind at the window."),
  room("amb.corwin_shop", "Room sound: Corwin's clock shop", "A small shop crowded with clocks: ticking everywhere, a cuckoo clock calling once, a mantel clock chiming a quarter hour, a shop bell, a floorboard creaking."),
  room("amb.glassworks", "Room sound: the glassworks", "A small glassworks. A furnace roaring steadily, a blowpipe rolling on a steel table, glass clinking in a rack, a bellows breathing, wind outside."),
  room("amb.holly_lane", "Room sound: Holly Lane", "Outdoors on a quiet snowy lane of cottages at night. Soft wind, snow falling from a branch, a distant church-like bell, muffled carol singing from inside a cottage, footsteps in snow, a gate creaking."),
  room("amb.thorne_parlor", "Room sound: the Thornes' parlor", "A small cottage parlor at night. A low fire whispering, a single slow clock ticking, wind against a leaded window, a teacup set down. Quiet and sad."),
  room("amb.stable_yard", "Room sound: the stable yard", "Outdoors by reindeer stables and a sleigh hangar on a snowy night. Wind across open snowfields, reindeer snorting and stamping, harness bells jingling, a hangar door rattling, lantern chains creaking."),
  room("amb.stables", "Room sound: the stables", "Inside timber reindeer stables at night. Reindeer shifting in straw, snorts and soft grunts, bells on halters jingling, a hay fork, wind in the eaves, a boiler rumbling behind a wall."),
  room("amb.boiler_room", "Room sound: the boiler room", "A small boiler room. A big boiler roaring and ticking, steam hissing from a valve, pipes knocking, coal settling."),
  room("amb.hangar", "Room sound: the sleigh hangar", "A huge timber sleigh hangar on Christmas Eve. Echoing space, wind against tall doors, elves loading sacks at a distance, harness bells, a lantern creaking, a creak of timber."),
  room("amb.guard_house", "Room sound: the Guard house", "A plain timber guard house at night. A small stove ticking, a ring of keys jingling, a chair creaking, wind outside, a cell door rattling faintly."),

  // Sound effects for the 3D client.
  sfx("sfx.chronometer_chime", "Chronometer chime (the moment of death)", 6, "A single magical chime from a great golden pocket watch: a pure, clear bell tone with a shimmering glassy halo that rings out and slowly fades, then a soft deep tick. Otherworldly but beautiful."),
  sfx("sfx.writing_appears", "Glowing words appear", 4, "Magical writing appearing in light: a soft rising shimmer of tiny bells and a warm breathy whoosh, like frost spreading across glass, ending in a faint sparkle."),
  sfx("sfx.reset_bell", "The reset: the day rings back", 12, "A huge, deep magical bell tolling once, its sound swelling enormously, then time rewinding: a rushing reversed whoosh with clock ticks running backward faster and faster, ending in sudden silence and one soft music box note."),
  sfx("sfx.hour_bell", "The hour strikes (countdown)", 8, "A large old tower clock striking the hour: one deep bronze bell stroke with a long ringing tail, heard across a snowy village."),
  sfx("sfx.great_bell", "The Bureau's great bell (ringing ahead)", 5, "A silver hand bell on a frame rung once firmly by a rope: a bright, sweet, ringing silver tone with a slow shimmer."),
  sfx("sfx.badge_bell", "A badge bell (agreeing to ring ahead)", 2, "A tiny silver bell shaken once: a quick, delicate, high jingle."),
  sfx("sfx.timebag_in", "Into the Time Bag", 2, "An object dropped into a velvet sack that swallows it with a soft magical hush, a faint sparkle and a muffled clock tick."),
  sfx("sfx.timebag_out", "Out of the Time Bag", 2, "An object drawn out of a magical velvet sack: a soft fabric rustle and a quick rising shimmer."),
  sfx("sfx.belltube", "Bell-tube call", 3, "A brass speaking tube whistling to call, then a small brass bell ringing twice and a hinged cap clicking open."),
  sfx("sfx.footsteps_snow", "Footsteps: snow", 6, "Steady walking footsteps crunching in deep, dry snow, boots, even pace."),
  sfx("sfx.footsteps_wood", "Footsteps: wooden floor", 6, "Steady walking footsteps in boots on old wooden floorboards, a light creak now and then."),
  sfx("sfx.footsteps_stone", "Footsteps: stone", 6, "Steady walking footsteps in boots on stone flags, a little echo."),
  sfx("sfx.footsteps_stairs", "Footsteps: wooden stairs", 6, "Boots climbing old wooden stairs steadily, each tread creaking."),
  sfx("sfx.door_wood", "Door: wooden, opening", 3, "A heavy old wooden door opening on iron hinges with a low creak, a latch lifting first."),
  sfx("sfx.door_wood_close", "Door: wooden, closing", 2, "A heavy old wooden door closing with a solid thud and a latch clicking."),
  sfx("sfx.door_iron", "Door: iron", 3, "A heavy riveted iron door scraping open with a rusty groan and a clank."),
  sfx("sfx.hatch", "The floor hatch", 3, "An iron bolt drawn back and a heavy wooden trapdoor lifted open, thumping against the floor."),
  sfx("sfx.drawer", "Drawer opening", 2, "A wooden drawer sliding open with a soft rub and a small rattle of things inside."),
  sfx("sfx.case_open", "The Chronometer case opening", 2, "A small brass key turning in a lock with a precise click, and a glass case door swinging open."),
  sfx("sfx.clock_hatch", "The great clock's plinth hatch", 3, "A key turning in an old iron lock, a small iron hatch swinging open in stone, chains clinking inside."),
  sfx("sfx.crank", "The winding crank", 3, "A heavy brass crank lifted off a wooden peg and set down, a solid metallic clank."),
  sfx("sfx.gear_guard", "Gear guard torn loose", 3, "An iron guard wrenched from its bolts with a splintering crack of wood and a metallic clang."),
  sfx("sfx.pickup", "Picking up evidence", 1, "A small object picked up from a wooden surface, a soft slide and a light tap."),
  sfx("sfx.paper", "Paper and ledgers", 2, "Old paper pages turning and a heavy ledger cover thumping open."),
  sfx("sfx.camera", "The frost-plate camera", 2, "An old-fashioned plate camera shutter: a soft mechanical click and a faint icy crackle."),
  sfx("sfx.manacles", "Arrest", 2, "Heavy iron manacles closing with two firm clicks and a short rattle of chain."),
  sfx("sfx.cell_door", "Cell door", 3, "An iron-barred cell door swinging shut with a clang and a big key turning."),
  sfx("sfx.sleigh_bells", "Sleigh bells passing", 6, "A team of sleigh bells jingling as a sleigh passes by on snow and fades into the distance."),
  sfx("sfx.reindeer", "Reindeer", 3, "A reindeer snorting and stamping a hoof, harness bells jingling once."),
  sfx("sfx.struggle", "A struggle (heard, not seen)", 4, "A sudden scuffle in a stone room: a chair scraping, boots slipping on boards, a short grunt, a heavy metal object hitting the floor with a clang."),
  sfx("sfx.ticking_fast", "The Chronometer ticking (countdown shown)", 10, "A fine, fast, precise pocket watch ticking with a faint magical shimmer under it, close to the ear."),
];
