import type { SoundtrackDef } from "@/game/engine/types";

/*
 * HALLOW001's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Halloween night 2018 in a Victorian stone
 * house in the Berkshires, in heavy rain. Gothic and uneasy, never loud, and
 * nothing supernatural: fear comes from what people might do.
 */
const room = (key: string, label: string, prompt: string): SoundtrackDef => ({ key, kind: "ambience", label, seconds: 30, prompt: `${prompt} Seamless loop.` });

export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained gothic mystery score for a murder at a masked Halloween dinner in an old New England stone house during a rainstorm. A slow solo cello melody over a quiet harpsichord figure that repeats like a clock, soft low strings, a distant music box that never quite finishes its tune. Elegant, sad and uneasy. Nothing supernatural, no horror stings. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the clock",
    seconds: 150,
    prompt:
      "Tense, sparse investigation underscore for the last hour before midnight in a house where a killer is still among the guests. A soft ticking pulse on muted pizzicato strings, a low sustained organ note, a piano motif of three notes that climbs and falls back, faint rain-like brushed percussion. Quiet, watchful, building only very slightly. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  room("amb.morning_room", "Room sound: the Morning Room", "A small paneled sitting room in an old stone house at night in heavy autumn rain. Rain on tall old windows, a coal fire ticking in the grate, an old radiator knocking, a clock ticking on the mantel, very faint murmur of voices two rooms away. Quiet."),
  room("amb.entrance_hall", "Room sound: the entrance hall", "A high stone entrance hall in a Victorian house at night. Rain outside the heavy front door, a long-case clock ticking slowly, a log fire crackling, a police radio murmuring softly near the door, footsteps on old floorboards upstairs."),
  room("amb.dining_room", "Room sound: the dining room", "A large candlelit dining room after a masked dinner has been interrupted. Low uneasy voices of a dozen guests, a glass set down on a table, candles guttering, a chair creaking, rain on the windows, distant thunder."),
  room("amb.library", "Room sound: the library", "A quiet book-lined library in an old house at night. Rain against leaded windows, a fire settling, the creak of an old leather chair, a page turning, the deep tick of a clock. Hushed."),
  room("amb.conservatory", "Room sound: the conservatory", "A Victorian glass conservatory full of palms during a heavy rainstorm. Loud rain drumming on the glass roof, water running in gutters, a drip into a brass tub, a garden door rattling slightly in the wind."),
  room("amb.upstairs_corridor", "Room sound: the upstairs corridor", "A long carpeted upstairs corridor in an old house at night. Floorboards creaking under someone's weight, rain on a window at the end, a door clicking shut somewhere, wind moaning faintly in a chimney. Very quiet."),
  room("amb.study", "Room sound: the study", "A wood-paneled study where a death has just happened, at night. Rain on the windows, the hum of a desk lamp, a mantel clock ticking, the muffled voices of police officers outside the door. Still and heavy."),
  room("amb.attic", "Room sound: the attic", "An attic under a slate roof in a downpour. Loud rain on the slates a foot overhead, wind finding gaps under the eaves, old timbers creaking, a slow drip into a bucket."),
  room("amb.wine_cellar", "Room sound: the wine cellar", "A stone wine cellar under an old house at night. Deep quiet, an electrical hum from a panel, water trickling somewhere behind the walls, rain faint and far away above, an outside door banging softly in the wind."),
  room("amb.service_corridor", "Room sound: the service corridor", "A narrow old brick service passage under a house. Echoing drips, a pipe ticking as it cools, faint muffled footsteps on the floor above, a low draft whistling under a door."),
  room("amb.servants_stair", "Room sound: the servants' stair", "A cramped hidden stairway inside the walls of an old house. Dusty wooden steps creaking, close muffled silence, rain heard faintly through thick walls, the creak of a hinge above."),
  room("amb.greenhouse", "Room sound: the greenhouse", "A glass greenhouse on an estate at night in heavy rain. Rain hammering on glass panes, a small iron stove ticking, paper lanterns rustling on their poles in a draft."),
  room("amb.garden_maze", "Room sound: the yew maze", "Outdoors in a hedge maze at night in fog and steady rain. Rain on thick yew hedges, wet gravel underfoot, wind in tall trees beyond a wall, a far-off owl, a car idling somewhere down a lane."),
  room("amb.carriage_house", "Room sound: the carriage house", "A big empty old carriage house under renovation at night. Rain on a high roof, the hum of portable work lights, a tarp flapping, police radios and the scrape of tools on brick."),
  room("amb.gatehouse", "Room sound: the gatehouse", "A small estate gatehouse office at night in rain. The hum of security monitors and a small printer, a space heater ticking, rain on the window, a police car idling outside with its radio murmuring."),
];
