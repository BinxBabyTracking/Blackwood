import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C002's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. October 1988, Southern California: a coastal
 * town, the city, and the mountains. The office room sound is C001's (same
 * office), so it is not listed here; see assets.ts.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Tense, restrained late-1980s Southern California crime drama score for a missing-person case. Pulsing analog synth bass, soft gated drums far in the background, a lonely fretless bass line, glassy Rhodes chords, a muted trumpet that enters and leaves. Anxious and searching rather than violent. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: up the mountain",
    seconds: 150,
    prompt:
      "Slow, cold 1980s detective underscore for a drive into pine-covered mountains at dusk. Sparse acoustic guitar harmonics, a warm analog synth pad, a distant vibraphone motif, brushed snare, a soft flugelhorn line. Quiet unease, wide and lonely, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.hale_house",
    kind: "ambience",
    label: "Room sound: Tom Hale's house",
    seconds: 30,
    prompt:
      "Quiet small suburban house interior in daytime, 1988. A refrigerator hum, a wall clock ticking, a faint lawnmower far down the street, a car passing slowly outside. Still and a little empty. Seamless loop.",
  },
  {
    key: "amb.elm_street",
    kind: "ambience",
    label: "Room sound: Elm Street",
    seconds: 30,
    prompt:
      "Quiet residential street in a California coastal town in the afternoon. Light sea breeze in palm fronds, a distant gull, a sprinkler ticking, a dog barking once far away, an occasional car. Seamless loop.",
  },
  {
    key: "amb.police_station",
    kind: "ambience",
    label: "Room sound: police station",
    seconds: 30,
    prompt:
      "Small-town 1980s police station detective bureau. Muffled police radio chatter, a typewriter in another room, a desk phone ringing twice and stopping, fluorescent light hum, footsteps on linoleum. Seamless loop.",
  },
  {
    key: "amb.newsroom",
    kind: "ambience",
    label: "Room sound: newspaper office",
    seconds: 30,
    prompt:
      "Small 1980s newspaper newsroom in the afternoon. Several typewriters, a teletype machine chattering, phones ringing, low voices, a distant printing press thumping through a wall. Seamless loop.",
  },
  {
    key: "amb.apartment",
    kind: "ambience",
    label: "Room sound: Long Beach apartment",
    seconds: 30,
    prompt:
      "Second-floor apartment in Long Beach, 1988, quiet afternoon. A kettle beginning to simmer, a radiator tick, children playing in a park across the street, a bus passing. Seamless loop.",
  },
  {
    key: "amb.mountain_store",
    kind: "ambience",
    label: "Room sound: mountain general store",
    seconds: 30,
    prompt:
      "Small general store in a pine forest mountain town, 1988. Wind in tall pines outside, a screen door creaking, a cash register drawer, a wood stove ticking, a pickup truck rolling over gravel outside. Seamless loop.",
  },
  {
    key: "amb.cabin",
    kind: "ambience",
    label: "Room sound: Cabin 14",
    seconds: 30,
    prompt:
      "Outside an isolated cabin by a mountain lake in autumn. Wind through tall pines, a creaking branch, a crow, water lapping faintly, a radio playing very quietly indoors. Lonely and still. Seamless loop.",
  },
  {
    key: "amb.moss_house",
    kind: "ambience",
    label: "Room sound: Oak Terrace house",
    seconds: 30,
    prompt:
      "Inside a quiet suburban house in the San Gabriel Valley on a gray morning. A clock ticking, a refrigerator hum, wind chimes on the porch, a car door closing down the street. Seamless loop.",
  },
];
