import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C001's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Late summer 1985, Los Angeles. Change a
 * prompt and generate that track again to replace it.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Slow, brooding 1980s Los Angeles detective noir score for a murder investigation. Muted trumpet melody, brushed drums, walking upright bass, soft Rhodes electric piano, a little tape saxophone, warm analog synth pad underneath. Late night, rain-slicked streets, quiet tension, never dramatic or loud. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the legwork",
    seconds: 150,
    prompt:
      "Understated 1980s Los Angeles crime drama underscore for a detective doing legwork. A patient pulse of muted electric bass and soft analog synth, vibraphone motifs, light brushed hi-hat, a lonely flugelhorn line drifting in and out. Curious and quietly tense, never loud or dramatic, steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "music.theme3",
    kind: "music",
    label: "Case theme 3: after midnight",
    seconds: 150,
    prompt:
      "Melancholy late-night 1985 Los Angeles noir: solo piano with a soft tenor saxophone answering it, upright bass, the faint hush of rain, very sparse brushed drums. Reflective and sad, like a detective going over the file alone at night. Gentle, even dynamics, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Detective's office",
    seconds: 30,
    prompt:
      "Inside a quiet private detective's office at night, high above a city boulevard: distant traffic through a closed window, an occasional far-off siren, a ticking wall clock, the faint hum of a desk lamp. Calm room tone, no voices.",
  },
  {
    key: "amb.whitmore",
    kind: "ambience",
    label: "Whitmore house",
    seconds: 30,
    prompt:
      "Inside an empty, still house at night in a quiet Los Angeles neighborhood: soft refrigerator hum, a mantel clock ticking slowly, crickets outside an open window, a dog barking very far away once. Eerie, hushed room tone, no voices.",
  },
  {
    key: "amb.diner",
    kind: "ambience",
    label: "Maple Street Diner",
    seconds: 30,
    prompt:
      "A 24-hour 1980s American diner late at night: low murmur of a few customers, coffee being poured, plates and cutlery clinking, a griddle sizzling in the kitchen, the faint sound of a jukebox song from across the room, an order bell once.",
  },
  {
    key: "amb.apartment",
    kind: "ambience",
    label: "Daniel's apartment",
    seconds: 30,
    prompt:
      "A small second-floor apartment in the city: muffled traffic on the street below, a neighbor's television murmuring through the wall, an old refrigerator buzzing, a faucet dripping now and then. Close, slightly uneasy room tone.",
  },
  {
    key: "amb.margaret",
    kind: "ambience",
    label: "Margaret's house",
    seconds: 30,
    prompt:
      "A tidy suburban living room on a warm afternoon: birds chirping outside, a lawn sprinkler ticking across the street, a mantel clock, a car passing slowly on a quiet residential street. Peaceful, no voices.",
  },
  {
    key: "amb.garage",
    kind: "ambience",
    label: "Hale Automotive",
    seconds: 30,
    prompt:
      "A busy 1980s auto repair garage: short bursts of a pneumatic impact wrench, metal tools set down on a workbench, an air compressor cycling, a car engine idling, a small radio playing faintly in the back. No clear voices.",
  },
  {
    key: "amb.bank",
    kind: "ambience",
    label: "Pacific Crest Savings & Loan",
    seconds: 30,
    prompt:
      "A 1980s savings and loan office: electric typewriters clacking, telephones ringing at distant desks, an adding machine, papers shuffling, soft indistinct office chatter, air conditioning hum.",
  },
];
