import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C01's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. November 2018: a small brick county seat an
 * hour east of Pittsburgh, a charity's offices over Market Street, and
 * downtown Pittsburgh's towers. Quiet, contemporary, never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained contemporary crime drama score for a quiet murder in a small western Pennsylvania town in November. Soft felt piano with a patient, ledger-like repeating figure, a low cello line, a faint analog synth pad, a muted clock-like tick far in the background. Unease and grief, not action. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the money",
    seconds: 150,
    prompt:
      "Cool, sparse modern investigation underscore for following money through downtown office towers on a gray November afternoon. Pulsing low synth bass, a clean electric piano motif, soft string harmonics, a light brushed rhythm, a hint of distant city hum. Focused and tense, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building on a cold gray November morning, 2018. A radiator knocking and ticking, a computer fan, wind against a tall window, distant city traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.foundation",
    kind: "ambience",
    label: "Room sound: the foundation's reception",
    seconds: 30,
    prompt:
      "Small nonprofit office on the second floor of an old brick building in a Pennsylvania county seat, 2018. Fluorescent hum, a laser printer warming up, quiet keyboard typing, an old radiator, muffled traffic on the street below, a phone ringing once in another room. Hushed, a workplace in mourning. Seamless loop.",
  },
  {
    key: "amb.martin_office",
    kind: "ambience",
    label: "Room sound: Martin Keller's office",
    seconds: 30,
    prompt:
      "An empty corner office in an old brick building, door closed, after a death. Very quiet: the hum of a fluorescent light, a radiator ticking, wind at an old window, a car passing in the alley below, the building settling. Still and heavy. Seamless loop.",
  },
  {
    key: "amb.keller_home",
    kind: "ambience",
    label: "Room sound: the house on Orchard Street",
    seconds: 30,
    prompt:
      "A small frame house in a quiet Pennsylvania town, empty for days, a gray November afternoon. A refrigerator hum from the next room, a wall clock ticking, wind in bare trees outside, wet leaves against a window, a furnace clicking on. Seamless loop.",
  },
  {
    key: "amb.hannah_apt",
    kind: "ambience",
    label: "Room sound: Hannah's apartment",
    seconds: 30,
    prompt:
      "A graduate student's small apartment in a Pittsburgh brick duplex in November. A radiator hissing, a kettle cooling, a city bus passing on a residential street, faint voices on the sidewalk, someone raking leaves outside. Quiet. Seamless loop.",
  },
  {
    key: "amb.reddick_shop",
    kind: "ambience",
    label: "Room sound: Reddick Maintenance",
    seconds: 30,
    prompt:
      "A one-man maintenance contractor's garage bay beside a state highway on a cold day. Trucks passing on Route 30 outside, an overhead heater fan, a portable radio playing a sports talk show very low, a wrench set down on a steel bench, the bay door rattling in the wind. Seamless loop.",
  },
  {
    key: "amb.police",
    kind: "ambience",
    label: "Room sound: Carroway police",
    seconds: 30,
    prompt:
      "Small-town police detective bureau in 2018. Fluorescent hum, keyboard typing, a phone ringing in another room, a police radio murmuring quietly, a coffee maker gurgling, footsteps on linoleum. Seamless loop.",
  },
  {
    key: "amb.ames_office",
    kind: "ambience",
    label: "Room sound: Kiley and Strand",
    seconds: 30,
    prompt:
      "A small accounting firm's office in an older downtown Pittsburgh building. Heating vents humming, pages turning, a calculator printing a tape, quiet keyboard clicks, rain on a window, distant traffic on Grant Street. Seamless loop.",
  },
  {
    key: "amb.meridian",
    kind: "ambience",
    label: "Room sound: Suite 2210",
    seconds: 30,
    prompt:
      "A polished financial advisory suite high in a downtown Pittsburgh office tower. Soft air conditioning, a receptionist's muffled phone voice, a glass door sighing shut, a distant elevator chime, the faint wind against tall windows. Expensive and quiet. Seamless loop.",
  },
  {
    key: "amb.rear_lot",
    kind: "ambience",
    label: "Room sound: the rear lot, Mulberry Alley",
    seconds: 30,
    prompt:
      "A small parking lot behind an old brick office building on a narrow town alley in November. Cold wind, a dumpster lid creaking, a car idling at a bank drive-through across the alley, a dog barking once in a backyard, distant traffic on Market Street. Seamless loop.",
  },
];
