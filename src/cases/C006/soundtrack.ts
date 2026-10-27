import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C006's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Hollow Creek, Pennsylvania, October 2018: a
 * closed steel works on the Monongahela, rain, rust, brick row houses.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  { key: "music.theme", kind: "music", label: "Case theme", seconds: 150, prompt: "Slow, restrained modern crime drama score for a cold case in a dead steel town on a river. Low felt piano, a sustained cello, a soft analog synth drone like distant machinery, faint rain-like texture, brushed snare far back. Grief, patience, unease. Even dynamics, ends as it begins so it can loop. Instrumental only." },
  { key: "music.theme2", kind: "music", label: "Case theme 2: the mill", seconds: 150, prompt: "Sparse industrial underscore: deep bowed metal, slow pulsing sub bass, a lonely muted trumpet motif, distant clanks and train horns softened into the mix. Tense and still, never loud. Steady dynamics start to end so it can loop. Instrumental only." },
  { key: "music.theme3", kind: "music", label: "Case theme 3: the conspiracy", seconds: 150, prompt: "Measured modern thriller score: ticking muted guitar ostinato, low strings, a cold electric piano, slow build that never resolves, kept quiet. Steady dynamics so it can loop. Instrumental only." },
  { key: "amb.office", kind: "ambience", label: "Room sound: field office over a hardware store", seconds: 30, prompt: "Small two-room office above a hardware store on a rainy small-town main street, 2018. Rain on old windows, a radiator ticking, a laptop fan, an occasional car passing on wet pavement below, a shop bell faintly downstairs. Seamless loop." },
  { key: "amb.mill", kind: "ambience", label: "Room sound: steel mill grounds", seconds: 30, prompt: "Abandoned steel mill grounds by a river in the rain: wind through broken windows and chain-link, loose sheet metal ticking, distant freight train, crows, dripping water. Seamless loop." },
  { key: "amb.mill_inside", kind: "ambience", label: "Room sound: inside the mill buildings", seconds: 30, prompt: "Inside a huge abandoned industrial building: cavernous echoing drips, pigeons in the rafters, wind moaning through gaps, a slow creak of steel. Seamless loop." },
  { key: "amb.house", kind: "ambience", label: "Room sound: a quiet house", seconds: 30, prompt: "Quiet small-town house on a rainy autumn afternoon: kitchen clock ticking, refrigerator hum, rain on the roof, a car passing outside. Seamless loop." },
  { key: "amb.garage", kind: "ambience", label: "Room sound: auto repair shop", seconds: 30, prompt: "Small-town auto repair shop: air compressor cycling, an impact wrench in short bursts, a radio playing classic rock far off and indistinct, rain on the bay door. Seamless loop." },
  { key: "amb.police", kind: "ambience", label: "Room sound: small police station", seconds: 30, prompt: "Small-town police station: fluorescent hum, a desk phone ringing once far off, a police radio murmuring indistinctly, keyboard typing, a door buzzer. Seamless loop." },
  { key: "amb.lab", kind: "ambience", label: "Room sound: medical examiner's office", seconds: 30, prompt: "Clean quiet medical examiner's office: ventilation hum, the soft whir of a refrigeration unit, distant footsteps on tile. Seamless loop." },
  { key: "amb.newsroom", kind: "ambience", label: "Room sound: small newsroom", seconds: 30, prompt: "Small-town newspaper newsroom: a few keyboards, a printer, a phone ringing, low indistinct conversation, rain on windows. Seamless loop." },
  { key: "amb.archive", kind: "ambience", label: "Room sound: records archive", seconds: 30, prompt: "Basement records room: humming fluorescent lights, a dehumidifier, pages turning, a metal cabinet drawer sliding. Seamless loop." },
  { key: "amb.hall", kind: "ambience", label: "Room sound: union hall", seconds: 30, prompt: "Old union hall in the afternoon: a television low in the corner, cards shuffled on a table, older men murmuring, a bottle set down on a bar. Seamless loop." },
  { key: "amb.storage", kind: "ambience", label: "Room sound: self storage facility", seconds: 30, prompt: "Self storage facility by a highway on a gray morning: wind between metal buildings, a roll-up door rattling, trucks passing on a highway, distant crows. Seamless loop." },
  { key: "amb.office_quiet", kind: "ambience", label: "Room sound: a business office", seconds: 30, prompt: "Quiet business office in an old bank building: clock ticking, a heating vent, a phone in another room, muffled street traffic. Seamless loop." },
  { key: "amb.woods", kind: "ambience", label: "Room sound: woods before dawn", seconds: 30, prompt: "Ridge woods in late October before dawn: cold wind in bare trees, dripping water, a creek far below, an engine idling faintly at a distance. Seamless loop." },
  { key: "amb.shop", kind: "ambience", label: "Room sound: photo and frame shop", seconds: 30, prompt: "Old photo and frame shop: a mat cutter sliding, a clock ticking, rain on a front window, a door bell once. Seamless loop." },
  { key: "amb.river", kind: "ambience", label: "Room sound: river gate", seconds: 30, prompt: "A wide river beside an industrial gate: water moving fast against a concrete ramp, wind, a barge horn far off, rain on a trailer roof. Seamless loop." },
];
