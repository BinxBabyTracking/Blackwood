import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C06's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. The last week of December 2018: a records
 * vault after a fire, federal offices, a bus station, a farm on a ridge in
 * the snow. Cold, procedural, a long slow build. Quiet, never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 180,
    prompt:
      "Cold, procedural contemporary crime drama score for the final chapter of a long investigation, late December. A slow felt piano figure that repeats like a register being read line by line, low sustained cello and double bass, a distant analog synth pad that very gradually thickens, a faint ticking pulse like a hard drive or a wall clock. A long, patient build in texture rather than volume, restrained and wintry, never triumphant. Even overall dynamics; ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building on a snowy late-December morning, 2018. A radiator knocking and ticking, a computer fan, soft wind and snow against a tall window, muffled holiday-week traffic far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.vault",
    kind: "ambience",
    label: "Room sound: a records vault after a fire",
    seconds: 30,
    prompt:
      "A large records storage warehouse the morning after a fire. Water dripping steadily from steel shelving into puddles, a ventilation fan droning, metal ticking as it cools, a distant generator, occasional footsteps on wet concrete and a faint radio murmur from outside. Cold and hollow. Seamless loop.",
  },
  {
    key: "amb.corporate",
    kind: "ambience",
    label: "Room sound: a corporate floor",
    seconds: 30,
    prompt:
      "A hushed modern office floor during a holiday week. Soft air handling, the hum of fluorescent and LED lighting, a distant printer, a glass door closing, muffled voices two rooms away, an elevator chime far down a corridor. Expensive and quiet. Seamless loop.",
  },
  {
    key: "amb.street",
    kind: "ambience",
    label: "Room sound: a cold suburban street",
    seconds: 30,
    prompt:
      "Inside a quiet brick house on a suburban street near Washington in late December. A refrigerator hum, a wall clock ticking, a furnace clicking on, outside a car idling at the curb for a long time, wind in bare oaks, a dog barking once far off. Still and uneasy. Seamless loop.",
  },
  {
    key: "amb.transit",
    kind: "ambience",
    label: "Room sound: a transit hall",
    seconds: 30,
    prompt:
      "A small regional bus and train transit center in Maryland early on a winter morning. A diesel bus idling at a bay, air brakes hissing, a muffled public address announcement, footsteps and rolling suitcases on tile, a coffee machine, automatic doors sliding. Seamless loop.",
  },
  {
    key: "amb.farm",
    kind: "ambience",
    label: "Room sound: a winter farm on a ridge",
    seconds: 30,
    prompt:
      "A remote farm on a wooded Pennsylvania ridge on a cold, overcast winter day. Wind through bare trees and dry grass, a crow calling, a barn door creaking, cattle lowing once in the distance, and far up a gravel lane a vehicle engine idling. Lonely and tense. Seamless loop.",
  },
  {
    key: "amb.lab",
    kind: "ambience",
    label: "Room sound: a document laboratory",
    seconds: 30,
    prompt:
      "A quiet forensic document laboratory at night. Computer workstations and drive fans humming, the soft click of a keyboard, a light table buzzing faintly, pages turning, a camera shutter on a copy stand now and then, a ventilation hood. Concentrated and calm. Seamless loop.",
  },
  {
    key: "amb.interview",
    kind: "ambience",
    label: "Room sound: a federal interview room",
    seconds: 30,
    prompt:
      "A windowless federal office interview room. Low air handling, a fluorescent light ballast humming, a chair creaking, a pen set down on a table, distant muffled phones and a door closing in a corridor. Tense, institutional silence. Seamless loop.",
  },
];
