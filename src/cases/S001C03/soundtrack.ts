import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C03's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Early December 2018: a container terminal on
 * the Patapsco in cold rain, East Baltimore rowhouses, a security yard in
 * Curtis Bay, a transload yard across the water. Quiet, contemporary, never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained contemporary crime drama score for a murder on a Baltimore container terminal in December. A low, slow bowed double bass, muted felt piano playing a patient figure like a checker counting numbers, a distant ship's horn folded into a soft synth pad, faint metallic percussion like a chain against steel far away. Grief and unease, not action. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the network",
    seconds: 150,
    prompt:
      "Cool, sparse modern investigation underscore for following money and paperwork from a harbor to an office suite, on a gray December afternoon. Pulsing low synth bass, a clean electric piano motif, soft string harmonics, a light brushed rhythm, a hint of distant industrial hum. Focused and tense, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building on a cold gray December morning, 2018. A radiator knocking and ticking, a computer fan, dry snow ticking against a tall window, distant city traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.terminal_gate",
    kind: "ambience",
    label: "Room sound: East Harbor Terminal, Gate 1",
    seconds: 30,
    prompt:
      "The truck gate of a busy container terminal in light cold rain. Diesel day cabs idling in a queue, air brakes hissing, a barrier arm motor whirring up and down, a guard's radio crackling, tires on wet asphalt, a reversing alarm far off, gulls. Seamless loop.",
  },
  {
    key: "amb.staging",
    kind: "ambience",
    label: "Room sound: Staging Area C",
    seconds: 30,
    prompt:
      "A fenced container staging area on a port terminal, between tall stacks of shipping containers, on a wet December day. Wind whistling through the gaps between stacks, rain dripping from steel, a loose chain tapping a container wall, a distant straddle carrier and crane motor, a chain-link fence rattling, gulls far off. Lonely and exposed. Seamless loop.",
  },
  {
    key: "amb.verification",
    kind: "ambience",
    label: "Room sound: cargo verification office",
    seconds: 30,
    prompt:
      "A small second-floor port office over a truck gate. Fluorescent hum, a laser printer, quiet keyboard typing, a handheld scanner beeping, muffled diesel engines and air brakes through the window below, a radio on low. Hushed, a workplace in mourning. Seamless loop.",
  },
  {
    key: "amb.gear_building",
    kind: "ambience",
    label: "Room sound: lashing gear building",
    seconds: 30,
    prompt:
      "Inside a steel shed full of lashing chain and container fittings on a port terminal. Rain drumming on a corrugated metal roof, a space heater fan, chain links shifting on a peg, a steel locker door creaking, wind against the door, distant crane machinery. Cold and enclosed. Seamless loop.",
  },
  {
    key: "amb.security",
    kind: "ambience",
    label: "Room sound: terminal security office",
    seconds: 30,
    prompt:
      "A port terminal security office beside the main gate. Computer fans and a bank of monitors humming, a police-style radio murmuring codes, a phone ringing once, a coffee maker gurgling, trucks passing outside the window in the rain. Seamless loop.",
  },
  {
    key: "amb.navarro_home",
    kind: "ambience",
    label: "Room sound: the house on Fait Avenue",
    seconds: 30,
    prompt:
      "A small Baltimore brick rowhouse on a quiet December afternoon, a family home in mourning. A refrigerator hum, a wall clock ticking, a radiator hissing, rain on the front window, a car passing on a narrow street, a neighbor's door closing. Very quiet. Seamless loop.",
  },
  {
    key: "amb.gaffney_office",
    kind: "ambience",
    label: "Room sound: operations supervisor's office",
    seconds: 30,
    prompt:
      "A port terminal manager's office in an administration building. Heating vents humming, a desk phone buzzing on mute, distant crane horns and container clanks through a closed window over the quay, a printer starting up in the hallway. Seamless loop.",
  },
  {
    key: "amb.kane_office",
    kind: "ambience",
    label: "Room sound: Kane Logistics, Clinton Street",
    seconds: 30,
    prompt:
      "A converted brick warehouse office in Canton, Baltimore, polished and quiet. Soft forced-air heat, a receptionist's muffled phone voice, a glass door sighing shut, an expensive coffee machine, distant traffic on Clinton Street and a tugboat horn on the harbor. Seamless loop.",
  },
  {
    key: "amb.fisk_yard",
    kind: "ambience",
    label: "Room sound: Fisk Freight Security yard",
    seconds: 30,
    prompt:
      "An office trailer in a fenced industrial yard in Curtis Bay on a gray day. A space heater, a two-way radio chirping on a charger, wind rattling the chain-link fence and gate, a truck engine ticking as it cools, distant freight trains and a coal pier conveyor. Seamless loop.",
  },
  {
    key: "amb.accounting",
    kind: "ambience",
    label: "Room sound: EHTOC accounts office",
    seconds: 30,
    prompt:
      "A small accounts payable office on the first floor of a port administration building. Fluorescent hum, a calculator printing a tape, pages turning, quiet keyboard clicks, a copier in the next room, rain on a window over a parking lot. Seamless loop.",
  },
  {
    key: "amb.police",
    kind: "ambience",
    label: "Room sound: BPD Homicide",
    seconds: 30,
    prompt:
      "A big-city police homicide unit squad room in 2018. Fluorescent hum, many phones ringing at different desks, keyboard typing, detectives talking low in the background, a police radio murmuring, a door buzzing open, city traffic outside. Busy but not loud. Seamless loop.",
  },
  {
    key: "amb.riverside",
    kind: "ambience",
    label: "Room sound: Riverside Freight Transfer Yard",
    seconds: 30,
    prompt:
      "A transload yard beside an industrial harbor on a raw December morning, with police working quietly. A roll-up bay door rattling, a forklift backing up, a generator running, wind off the water, police radios murmuring, boots on gravel, a ship's horn across the harbor. Seamless loop.",
  },
];
