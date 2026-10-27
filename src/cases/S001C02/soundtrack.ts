import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C02's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Thanksgiving week, November 2018: a busy
 * downtown Washington hotel and the corridors behind it, K Street, an office
 * park in Rockville, and a farmhouse at the end of a gravel lane in rural
 * Maryland before dawn. Quiet, contemporary, never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained contemporary thriller score for a missing man in a big downtown Washington hotel the week of Thanksgiving. Muted felt piano with a patient two-note figure like a knock on a door, a low cello drone, soft analog synth pads, a distant ticking pulse. Unease and urgency held under the surface, not action. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the second building",
    seconds: 150,
    prompt:
      "Cool, sparse modern investigation underscore for following a route through service corridors, freight elevators and a loading dock at night. Pulsing low synth bass, a clean muted electric guitar motif, soft string harmonics, a light mechanical rhythm like an elevator cable, faint industrial hum. Focused and tense, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building at midday in late November, 2018. A radiator knocking and ticking, a computer fan, sleet against a tall window, distant holiday traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.lobby",
    kind: "ambience",
    label: "Room sound: the Ashcroft lobby",
    seconds: 30,
    prompt:
      "The lobby of a busy upscale downtown Washington hotel during Thanksgiving week, 2018. Murmured conversations, rolling suitcase wheels on marble, a front desk keyboard and a soft check-in chime, revolving door swish, faint lounge piano music from a bar, a distant elevator ding. Seamless loop.",
  },
  {
    key: "amb.corridor_6",
    kind: "ambience",
    label: "Room sound: the sixth-floor corridor",
    seconds: 30,
    prompt:
      "A long carpeted hotel corridor on an upper floor in the afternoon. Very quiet: an air handler hum, an ice machine dropping ice somewhere far down the hall, a door closing softly, a muffled television through a wall. Seamless loop.",
  },
  {
    key: "amb.room_614",
    kind: "ambience",
    label: "Room sound: Room 614",
    seconds: 30,
    prompt:
      "An empty hotel room, door closed, the guest gone. The hum of the room's air unit cycling, a minibar fridge buzz, faint city traffic six floors below through the window, a siren far away, the building's pipes. Still and wrong. Seamless loop.",
  },
  {
    key: "amb.security_office",
    kind: "ambience",
    label: "Room sound: hotel security office",
    seconds: 30,
    prompt:
      "A cramped hotel security office below the lobby. Electrical hum of a wall of video monitors and recorders, a radio handset crackling with short staff calls, a keyboard, a desk fan, a printer feeding paper. Seamless loop.",
  },
  {
    key: "amb.service_corridor",
    kind: "ambience",
    label: "Room sound: the service vestibule",
    seconds: 30,
    prompt:
      "A concrete back-of-house service vestibule behind a hotel guest floor. A freight elevator's motor and cables humming in the shaft, a fluorescent tube buzzing, a ventilation duct rushing, a steel door closer clicking shut. Hard, echoing, empty. Seamless loop.",
  },
  {
    key: "amb.loading_dock",
    kind: "ambience",
    label: "Room sound: the loading dock",
    seconds: 30,
    prompt:
      "A hotel loading dock on a cold wet evening, roll-up doors open to an alley. Rain dripping from a steel canopy, a trash compactor cycling, a kitchen exhaust fan roaring, a radio playing sports talk from an engineering shop, a truck reversing beeper in the distance. Seamless loop.",
  },
  {
    key: "amb.eastbridge",
    kind: "ambience",
    label: "Room sound: Eastbridge Systems",
    seconds: 30,
    prompt:
      "A quiet corporate office floor at a defense contractor in a suburban Virginia office park. Soft air conditioning, distant muffled phone calls, a badge reader beep and a glass door closing, keyboard typing across a cubicle floor, a printer in the distance. Seamless loop.",
  },
  {
    key: "amb.chen_office",
    kind: "ambience",
    label: "Room sound: Law Office of Irene Chen",
    seconds: 30,
    prompt:
      "A small, quiet law office on the fourth floor of a downtown Washington building. A radiator ticking, pages turning, a clock, a fountain pen on paper, muffled street traffic and a bus below. Seamless loop.",
  },
  {
    key: "amb.meridian_hq",
    kind: "ambience",
    label: "Room sound: Meridian, eighth floor",
    seconds: 30,
    prompt:
      "A polished consulting firm's executive floor on K Street. Very soft air conditioning, a receptionist's muffled phone voice, a glass door sighing shut on a card reader beep, a distant elevator chime, thick carpet. Expensive and quiet. Seamless loop.",
  },
  {
    key: "amb.kestrel",
    kind: "ambience",
    label: "Room sound: Kestrel Protective Group",
    seconds: 30,
    prompt:
      "A small security company's office suite in a suburban Maryland office park at night. Fluorescent hum, an alarm-monitoring computer beeping softly now and then, a police radio murmuring, a commuter train passing on a nearby embankment, a door opening onto a parking lot. Seamless loop.",
  },
  {
    key: "amb.holding_property",
    kind: "ambience",
    label: "Room sound: Sawmill Hollow Road",
    seconds: 30,
    prompt:
      "A rural Maryland farm lane before dawn in November. Cold wind in bare trees, gravel underfoot, a dog barking far off, a police radio murmuring very low from a car, an engine idling, crows waking. Hushed and tense. Seamless loop.",
  },
  {
    key: "amb.holding_room",
    kind: "ambience",
    label: "Room sound: the upstairs room",
    seconds: 30,
    prompt:
      "A small upstairs back bedroom in an old farmhouse, its window boarded over. Wind pressing against the boards, an old house creaking, muffled voices and footsteps downstairs, a police radio far below. Close and airless. Seamless loop.",
  },
];
