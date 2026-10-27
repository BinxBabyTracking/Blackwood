import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C005's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. October 1327, a Benedictine abbey in a
 * northern English dale: rain on stone, a beck in spate, bells, wind on the moor.
 */
const room = (key: string, label: string, prompt: string): SoundtrackDef => ({ key, kind: "ambience", label, seconds: 30, prompt });

export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Slow, modal early-music score for a murder in a medieval English abbey. A low wordless male drone like distant plainchant, a quiet vielle melody in the Dorian mode, a soft recorder answering it, a frame drum heard very far away. Grave, patient and uneasy, never loud. Even dynamics throughout, ends the way it begins so it can loop. No lyrics.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the bells",
    seconds: 150,
    prompt:
      "Sparse, tense medieval underscore at night: a slow hurdy-gurdy drone, plucked psaltery notes falling one at a time, a distant bronze bell struck once now and then, soft wind. Suspense without percussion. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  room("amb.chamber", "Room sound: your chamber in the guest-house", "A small stone room in a medieval guest-house: a wood fire crackling softly in a hearth, steady rain on a shuttered window, an occasional creak of an oak floor. Seamless loop, no voices."),
  room("amb.book_room", "Room sound: the book room", "A small vaulted stone room, very quiet: a slow water drip somewhere, faint rain beyond thick walls, the occasional settle of old wood. Hushed and still. Seamless loop, no voices."),
  room("amb.scriptorium", "Room sound: the scriptorium", "A medieval cloister walk used for writing: quills scratching on parchment, a page turned now and then, rain falling on the garth beyond open arches, a distant footstep on stone. Seamless loop, no speech."),
  room("amb.church", "Room sound: the abbey church", "A large stone abbey church: deep reverberant quiet, distant soft plainchant from far off in the choir, a candle guttering, the shuffle of a sandal on stone. Seamless loop, no clear words."),
  room("amb.cloister", "Room sound: the cloister in rain", "A medieval cloister around a wet grass garth: steady rain dripping from the roof edges onto stone, a well bucket chain clinking once, a crow, distant footsteps. Seamless loop, no voices."),
  room("amb.passage", "Room sound: the cellarer's passage", "A narrow stone passage: close, damp quiet, a slow drip, a faint draft whistling through a gap, a mouse scratching. Claustrophobic and still. Seamless loop."),
  room("amb.abbot_chamber", "Room sound: the abbot's chamber", "A comfortable medieval room: a good fire burning, a heavy wooden chair creaking, rain on glass, a distant bell far away. Seamless loop, no voices."),
  room("amb.cellar", "Room sound: the kitchen court and cellar", "A medieval kitchen court by a cellar: a cook's fire and a pot bubbling inside, a cask rolled on stone, hens, rain in a muddy yard, the clink of keys. Seamless loop, no clear speech."),
  room("amb.gatehouse", "Room sound: the gatehouse", "An abbey gatehouse on a rainy day: wind in the archway, a cart's wooden wheels on wet cobbles, a horse snorting, a heavy door creaking. Seamless loop, no voices."),
  room("amb.mill", "Room sound: the mill at Hollin Bridge", "A medieval watermill beside a beck in spate: the wheel turning and splashing, rushing water, the low grind of millstones inside, wind in alder trees. Seamless loop, no voices."),
  room("amb.manor", "Room sound: Ashcombe Hall", "A medieval manor hall: a big open fire in the middle of the floor, a hound sighing, men cutting wood in a yard outside, wind round the timbers. Seamless loop, no clear speech."),
  room("amb.muniments", "Room sound: the muniment room", "A locked stone record room above a chapter house: deep silence, dry parchment rustling, a chest lid creaking, faint rain far away. Seamless loop."),
  room("amb.infirmary", "Room sound: the infirmary", "A quiet medieval infirmary: a sick old man's slow breathing, a small fire, linen folded, rain outside, a candle sputtering. Gentle and hushed. Seamless loop, no speech."),
  room("amb.tower", "Room sound: the bell tower", "Inside a medieval bell tower: wind moaning through louvers, old timbers creaking, a bell rope swinging and brushing wood, rain, a pigeon. Seamless loop, no bell strikes."),
];
