import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C003's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. October 2018, a steel town on a river west of
 * Pittsburgh: rain, brick row houses, a riverfront that used to be industry.
 * C003 has its own office (a Pittsburgh field office), so it has its own room sound.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained modern crime drama score for a small-town double homicide in western Pennsylvania. Low felt piano, a slow cello line, soft analog synth pulse, distant processed guitar swells, brushed percussion far in the background. Grief and unease rather than action. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the river road",
    seconds: 150,
    prompt:
      "Cold, sparse modern detective underscore for a rainy industrial riverfront at night. Deep sustained synth bass, a muted electric piano motif, metallic textures like distant rail yards, a lonely viola line, very soft kick drum. Tense and patient, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office in an old downtown Pittsburgh building on a rainy afternoon, 2018. Rain against a tall window, a radiator ticking, a computer fan, distant city traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.alder_street",
    kind: "ambience",
    label: "Room sound: Alder Street",
    seconds: 30,
    prompt:
      "Quiet residential street of brick houses in a small Pennsylvania steel town on a cold, wet autumn day. Light rain dripping from gutters, wet leaves, a car passing slowly on wet asphalt, a dog barking once far off, a distant freight train horn. Seamless loop.",
  },
  {
    key: "amb.police",
    kind: "ambience",
    label: "Room sound: Bellwether police",
    seconds: 30,
    prompt:
      "Small-town police detective bureau in 2018. Fluorescent hum, keyboard typing, a phone ringing in another room, a police radio murmuring quietly, a coffee machine, footsteps on linoleum. Seamless loop.",
  },
  {
    key: "amb.harts",
    kind: "ambience",
    label: "Room sound: Hart's Quick Stop",
    seconds: 30,
    prompt:
      "Inside a small gas station convenience store at night. Refrigerator cases humming, a door chime once, a soda fountain, faint pop music from a ceiling speaker, cars at the pumps outside in the rain. Seamless loop.",
  },
  {
    key: "amb.kowalski_house",
    kind: "ambience",
    label: "Room sound: the Kowalski house",
    seconds: 30,
    prompt:
      "Quiet family home in the afternoon, a little too quiet. Rain on the roof, a refrigerator hum, a wall clock, a child's cartoon very faint from a television in another room. Seamless loop.",
  },
  {
    key: "amb.marsh_house",
    kind: "ambience",
    label: "Room sound: the Marsh house",
    seconds: 30,
    prompt:
      "Inside a comfortable older brick house in the evening. A television murmuring low in the next room, rain on the windows, a furnace running, a clock ticking. Seamless loop.",
  },
  {
    key: "amb.voss_office",
    kind: "ambience",
    label: "Room sound: Bellwether Redevelopment Group",
    seconds: 30,
    prompt:
      "Modern small-business office in a renovated industrial building. Air conditioning hum, a printer running briefly, keyboard clicks, a muffled phone conversation behind glass, soft footsteps on polished concrete. Seamless loop.",
  },
  {
    key: "amb.bell_garage",
    kind: "ambience",
    label: "Room sound: Bell Security garage",
    seconds: 30,
    prompt:
      "Small commercial vehicle garage on a rainy day. Ceiling bay fans, rain on a metal roof, an air compressor kicking on and off, a radio scanner crackling quietly, a tool dropped on concrete. Seamless loop.",
  },
  {
    key: "amb.shaw_yard",
    kind: "ambience",
    label: "Room sound: Shaw Towing yard",
    seconds: 30,
    prompt:
      "Tow truck yard beside a highway in the rain. Trucks passing on wet road, a chain-link gate rattling in the wind, a diesel engine idling nearby, a dispatch radio chirping. Seamless loop.",
  },
  {
    key: "amb.annex",
    kind: "ambience",
    label: "Room sound: records annex",
    seconds: 30,
    prompt:
      "Quiet municipal records room in an old brick building. Fluorescent hum, pages turning, a flat-file drawer sliding shut, an old computer fan, rain against a window. Seamless loop.",
  },
  {
    key: "amb.riverside",
    kind: "ambience",
    label: "Room sound: riverside access road",
    seconds: 30,
    prompt:
      "Dead-end gravel road by a river in an old industrial district, overcast morning after rain. Wind across open ground, water lapping, crows, a freight train passing slowly in the distance, a police radio faintly. Seamless loop.",
  },
  {
    key: "amb.lab",
    kind: "ambience",
    label: "Room sound: county forensic lab",
    seconds: 30,
    prompt:
      "Clean modern forensic laboratory. Ventilation hood hum, a centrifuge spinning down, soft beeps from an instrument, a freezer compressor, quiet footsteps. Seamless loop.",
  },
];
