import type { SoundtrackDef } from "@/game/engine/types";

/*
 * S01 C05's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. December 2018: a charity gala in a grand
 * Park Avenue hotel, a foundation on upper Fifth Avenue, lawyers' towers in
 * Midtown, a security firm over a tire shop in Queens. Quiet, contemporary,
 * never loud.
 */
export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Restrained contemporary crime drama score for a murder at a charity gala in a grand Manhattan hotel in December. A slow, elegant string quartet figure that keeps faltering, soft felt piano underneath, a low cello pedal, a faint analog synth pad like distant traffic. Grace with something wrong beneath it. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the structure",
    seconds: 150,
    prompt:
      "Cool, sparse modern investigation underscore for reading trust instruments and ownership charts in quiet Midtown law offices on a gray winter afternoon. A patient pulsing low synth bass, a clean, repeating electric piano motif that climbs one step at a time, soft string harmonics, a light brushed rhythm. Focused and uneasy, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  {
    key: "amb.office",
    kind: "ambience",
    label: "Room sound: Pittsburgh field office",
    seconds: 30,
    prompt:
      "Small private investigator's office high in an old downtown Pittsburgh building on a cold December morning, 2018. A radiator knocking and ticking, a computer fan, wind and light snow against a tall window, distant city traffic and a bus far below. Quiet. Seamless loop.",
  },
  {
    key: "amb.lobby",
    kind: "ambience",
    label: "Room sound: the Belgrave Grand lobby",
    seconds: 30,
    prompt:
      "The marble lobby of a grand old Park Avenue hotel late at night during an interrupted charity gala. Murmured voices of held guests, heels on marble, a revolving door turning, a police radio crackling softly near the entrance, a phone ringing at the front desk, distant city traffic outside. Hushed and tense. Seamless loop.",
  },
  {
    key: "amb.ballroom",
    kind: "ambience",
    label: "Room sound: the Grand Ballroom",
    seconds: 30,
    prompt:
      "A large hotel ballroom after a gala has been stopped. Hundreds of guests talking low at round tables, glasses and cutlery set down, chairs scraping on parquet, an air handler hum high above, a string quartet's instruments being put away in cases. Subdued, uneasy. Seamless loop.",
  },
  {
    key: "amb.conf_corridor",
    kind: "ambience",
    label: "Room sound: the mezzanine corridor",
    seconds: 30,
    prompt:
      "A carpeted hotel mezzanine corridor above a ballroom, late at night. The muffled murmur of a crowd one floor below, a low ventilation hum, a door closing softly somewhere, a camera shutter clicking now and then in a room nearby. Very quiet. Seamless loop.",
  },
  {
    key: "amb.suite",
    kind: "ambience",
    label: "Room sound: Conference Suite C",
    seconds: 30,
    prompt:
      "A small private hotel conference room with the door closed, a crime scene being worked quietly. Thick carpet, a ventilation hum, the faint crowd murmur through the walls, a camera flash recharging, a pen on a clipboard. Still and heavy. Seamless loop.",
  },
  {
    key: "amb.security_office",
    kind: "ambience",
    label: "Room sound: hotel security office",
    seconds: 30,
    prompt:
      "A cramped hotel security office behind the front desk. A wall of monitors humming, a two-way radio murmuring, a card printer whirring, a keyboard, an office chair creaking, the muffled lobby beyond a closed door. Seamless loop.",
  },
  {
    key: "amb.service_corridor",
    kind: "ambience",
    label: "Room sound: back of house and Loading Dock B",
    seconds: 30,
    prompt:
      "The concrete back-of-house corridor and loading dock of a big Manhattan hotel. A service elevator arriving with a thud and a chime, banquet carts rattling, an exhaust fan roaring, a roll-up dock door half open to a cold street with trucks idling, distant kitchen clatter. Seamless loop.",
  },
  {
    key: "amb.foundation",
    kind: "ambience",
    label: "Room sound: the Lockhart Foundation",
    seconds: 30,
    prompt:
      "The hushed reception hall of a wealthy private foundation in an old Fifth Avenue mansion. A grandfather clock ticking, a radiator hissing, soft footsteps on a carpeted stair, a phone answered quietly in another room, very distant traffic on Fifth Avenue. Calm and expensive. Seamless loop.",
  },
  {
    key: "amb.records_archive",
    kind: "ambience",
    label: "Room sound: the records archive",
    seconds: 30,
    prompt:
      "A basement records room under an old Manhattan building. Fluorescent tubes buzzing, a dehumidifier droning, a steel shelving unit creaking, cardboard boxes sliding, a pipe knocking somewhere overhead. Seamless loop.",
  },
  {
    key: "amb.ogden_office",
    kind: "ambience",
    label: "Room sound: Ogden Fiduciary Partners",
    seconds: 30,
    prompt:
      "A small investment adviser's office on a high floor of a Sixth Avenue tower, the day after its founder died. Soft air handling, a printer idle, wind against tall windows, a muffled siren far below, someone typing slowly in the next room. Quiet and sad. Seamless loop.",
  },
  {
    key: "amb.ogden_home",
    kind: "ambience",
    label: "Room sound: the Ogdens' apartment",
    seconds: 30,
    prompt:
      "A prewar Upper West Side apartment on a gray winter afternoon. A steam radiator clanking, a wall clock ticking, a kettle cooling on the stove, a bus passing on the avenue, a neighbor's piano faint through the wall. Seamless loop.",
  },
  {
    key: "amb.marchetti_office",
    kind: "ambience",
    label: "Room sound: Marchetti Law Group",
    seconds: 30,
    prompt:
      "A sleek corner law office high in a Lexington Avenue tower. Climate control hush, a glass door sighing shut, a phone buzzing once on a desk, an elevator chime down the hall, the wind at the windows. Cold and polished. Seamless loop.",
  },
  {
    key: "amb.knox_office",
    kind: "ambience",
    label: "Room sound: Knox Protective Services",
    seconds: 30,
    prompt:
      "A small second-floor office over a tire shop on a busy Queens boulevard. Impact wrenches and an air compressor from the shop below, an elevated subway train rumbling past outside, radio chargers beeping softly, rain on the window. Seamless loop.",
  },
  {
    key: "amb.halvard_office",
    kind: "ambience",
    label: "Room sound: Larchmont Corporate Services",
    seconds: 30,
    prompt:
      "A quiet corporate services office in a Madison Avenue building. A copier warming up, a fluorescent hum, mail being sorted into brass slots, a receptionist's chair rolling, the muffled traffic of Madison Avenue below. Seamless loop.",
  },
  {
    key: "amb.police",
    kind: "ambience",
    label: "Room sound: Manhattan South Homicide",
    seconds: 30,
    prompt:
      "A New York police detective squad room in 2018. Fluorescent hum, keyboards, a phone ringing in another office, a police radio murmuring, a coffee maker gurgling, a door buzzing open, city traffic outside. Seamless loop.",
  },
];
