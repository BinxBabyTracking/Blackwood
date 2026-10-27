import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C04's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. December 2018: wet brick streets in Old Town
 * Alexandria, Northern Virginia's office parks and suburbs, a records
 * warehouse, a country cottage, a new house with a basement. Quiet,
 * contemporary, never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained contemporary crime drama score for a missing woman in a small historic Virginia town on a wet December morning. Soft felt piano with a patient, searching figure, a low muted cello, a faint warm analog synth pad, distant rain textures. Worry rather than action. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the archive",
    seconds: 150,
    prompt:
      "Cool, sparse modern investigation underscore for paper trails in a vast records warehouse and a feeling of being steered. Pulsing low synth bass, a clean, slightly detuned electric piano motif, soft string harmonics, a light ticking rhythm like a copier counting pages. Tense and focused, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building on a cold December day, 2018. A radiator knocking and ticking, a computer fan, wind against a tall window, distant city traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.cafe",
    kind: "ambience",
    label: "Room sound: the Wren Coffeehouse",
    seconds: 30,
    prompt:
      "A small independent coffeehouse on a historic brick main street on a rainy weekday morning. An espresso machine hissing and knocking, cups set on saucers, low murmured conversation, soft indie music very faint from a speaker, the door chime once, rain and tires on wet street outside. Seamless loop.",
  },
  {
    key: "amb.apt_building",
    kind: "ambience",
    label: "Room sound: Cameron Mews lobby",
    seconds: 30,
    prompt:
      "The quiet lobby and carpeted hallway of a small brick condominium building, midday. A heating vent humming, an elevator motor far off, a door closing on another floor, rain against the glass front door, a car passing on a narrow street. Seamless loop.",
  },
  {
    key: "amb.claire_apt",
    kind: "ambience",
    label: "Room sound: Claire's apartment",
    seconds: 30,
    prompt:
      "An empty one-bedroom apartment after it has been searched, a rainy afternoon. A refrigerator hum, a wall clock ticking, rain on a window, a radiator clicking, the faint sound of a neighbor's television through the wall. Still and uneasy. Seamless loop.",
  },
  {
    key: "amb.records_center",
    kind: "ambience",
    label: "Room sound: Meridian Records Center",
    seconds: 30,
    prompt:
      "A huge climate-controlled records warehouse in a suburban office park. A deep steady air handling hum, fluorescent light buzz, the distant beep of a reversing pallet jack, a barcode scanner chirp, a copier warming up and feeding a page. Cavernous and quiet. Seamless loop.",
  },
  {
    key: "amb.corbett_home",
    kind: "ambience",
    label: "Room sound: Alan Corbett's study",
    seconds: 30,
    prompt:
      "The study of a quiet suburban brick house on a gray December afternoon. A mantel clock ticking, a furnace running low, rain in gutters, a dog barking once far down the street, paper being turned. Seamless loop.",
  },
  {
    key: "amb.clearwater",
    kind: "ambience",
    label: "Room sound: Clearwater's office",
    seconds: 30,
    prompt:
      "A small nonprofit office on the sixth floor of a downtown Washington office building. Keyboard typing, a printer feeding pages, a phone ringing once and answered quietly, air handling hum, muffled traffic and a siren far below. Seamless loop.",
  },
  {
    key: "amb.prentiss_apt",
    kind: "ambience",
    label: "Room sound: Tyler Prentiss's apartment",
    seconds: 30,
    prompt:
      "A modern high-rise apartment in an urban suburb at night. The soft whir of computer fans and a small server, an HVAC vent, rain on a big window, muffled traffic on a busy boulevard eleven floors down, a train passing underground faintly. Seamless loop.",
  },
  {
    key: "amb.storage",
    kind: "ambience",
    label: "Room sound: Dominion Secure Records",
    seconds: 30,
    prompt:
      "A secure document storage warehouse in an industrial park. A loud steady ventilation hum, a forklift idling far away, a steel mesh gate rattling, footsteps on concrete, a box knife cutting tape. Seamless loop.",
  },
  {
    key: "amb.safe_house",
    kind: "ambience",
    label: "Room sound: Laurel Run Cottage",
    seconds: 30,
    prompt:
      "A small country cottage in the Virginia hills on a cold December afternoon, the heat off. Wind in bare trees, a creek running nearby, crows in a field, a screen door tapping, the far hum of a highway beyond the hills. Lonely and still. Seamless loop.",
  },
  {
    key: "amb.tate_office",
    kind: "ambience",
    label: "Room sound: Tate Protective Services",
    seconds: 30,
    prompt:
      "A small second-floor office over a street of shops in an urban suburb. A ventilation hum, a police radio murmuring from someone's belt, drawers opening and closing, a camera shutter, traffic on a wet boulevard outside. Seamless loop.",
  },
  {
    key: "amb.holding_house",
    kind: "ambience",
    label: "Room sound: 12 Saddle Ridge Lane",
    seconds: 30,
    prompt:
      "A new, sparsely furnished suburban house in early morning after a police entry. A furnace running, a refrigerator hum, police radios murmuring outside, car doors closing, a coffee maker gurgling, birds at dawn. Seamless loop.",
  },
  {
    key: "amb.police",
    kind: "ambience",
    label: "Room sound: Alexandria police",
    seconds: 30,
    prompt:
      "A city police detective bureau in 2018. Fluorescent hum, keyboard typing, a phone ringing in another room, a police radio murmuring quietly, a coffee maker gurgling, footsteps on linoleum, rain on a window. Seamless loop.",
  },
];
