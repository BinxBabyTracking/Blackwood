import type { SoundtrackDef } from "@/game/engine/types";

/*
 * Case C004's music and room sound, made once with ElevenLabs from the Admin
 * page and served from storage. Chicago, October 1927: a radio station, a
 * speakeasy, rain, the elevated, and the river at night.
 */
const amb = (key: string, label: string, prompt: string): SoundtrackDef => ({ key, kind: "ambience", label, seconds: 30, prompt });

export const SOUNDTRACK: SoundtrackDef[] = [
  {
    key: "music.theme",
    kind: "music",
    label: "Case theme",
    seconds: 150,
    prompt:
      "Late-1920s Chicago dance band gone sour, for a radio-station murder mystery. A slow, minor-key foxtrot: muted trumpet, clarinet, tuba bass, brushed snare, banjo plucks, a tinny upright piano, with a faint crackle as if heard on a 1927 radio. Melancholy and suspicious rather than cheerful. Even dynamics throughout, ends the way it begins so it can loop. Instrumental only.",
  },
  {
    key: "music.theme2",
    kind: "music",
    label: "Case theme 2: the river",
    seconds: 150,
    prompt:
      "Slow, dark 1920s noir underscore for a night on the Chicago River. Low bowed double bass, a lonely clarinet line, soft tremolo strings, a distant muted cornet, a slow pulse on a tom-tom. Quiet dread, wet and cold, never loud. Steady dynamics from start to end so it can loop. Instrumental only.",
  },
  amb("amb.office", "Room sound: the 1927 office", "A small Chicago detective's office in 1927 on a rainy day. Rain on a tall window, a radiator ticking and hissing, an elevated train rumbling past a block away, distant car horns of the 1920s, a wall clock ticking. Seamless loop."),
  amb("amb.studio", "Room sound: Studio A", "A heavily draped 1920s radio studio, silent and dead-sounding. A wall clock ticking, a faint electrical hum from an amplifier rack, the muffled rain against a high window. Very still. Seamless loop."),
  amb("amb.control_room", "Room sound: control room", "A 1927 radio station control room. A low transformer hum, relays clicking now and then, the faint sound of a dance band through a monitor speaker, a clockwork recorder drum ticking, switches being thrown. Seamless loop."),
  amb("amb.storage", "Room sound: equipment storage", "A cramped storage room at the back of a radio station, 1920s. A buzzing bare light bulb, water dripping in a pipe, the muffled hum of the station through the wall. Seamless loop."),
  amb("amb.station_office", "Room sound: station office", "A 1920s office. A manual typewriter clacking steadily with carriage returns, a candlestick telephone ringing once far away, papers shuffled, footsteps on a wooden floor. Seamless loop."),
  amb("amb.workshop", "Room sound: recording workshop", "A 1927 radio station's recording workshop. The low whir of a turntable motor, a cutting lathe's faint hiss, the crackle of a stylus in a groove, a clock ticking. Seamless loop."),
  amb("amb.blue_lantern", "Room sound: the Blue Lantern", "A Prohibition-era Chicago speakeasy at night. A small jazz band muffled through a curtain, glasses clinking, low talk and laughter, a cocktail shaker, a door buzzer. Warm and smoky. Seamless loop."),
  amb("amb.apartment", "Room sound: an empty apartment", "An empty, shut-up 1920s apartment. A mantel clock ticking, the radiator cold and silent, street traffic and an elevated train far below, rain in the gutter. Seamless loop."),
  amb("amb.parlor", "Room sound: a Hyde Park parlor", "A quiet 1920s Chicago parlor in the afternoon. A grandfather clock, a kettle beginning to sing in another room, a few soft notes on a piano, light rain on the windows. Seamless loop."),
  amb("amb.police", "Room sound: the Detective Bureau", "A 1920s Chicago police detective bureau. Several manual typewriters, a telegraph sounder clicking, a telephone bell, men's voices low in the next room, a radiator hissing. Seamless loop."),
  amb("amb.warehouse", "Room sound: the river warehouse", "A brick warehouse yard on the Chicago River in 1927. Water slapping against pilings, a tugboat horn far off, a chain rattling, a truck engine idling, gulls, wind. Seamless loop."),
  amb("amb.boardinghouse", "Room sound: Doyle's Rooms", "A Chicago rooming house in the 1920s. A radio playing faintly in the parlor, cards being shuffled, a creaking staircase, a pot bubbling in a kitchen, rain outside. Seamless loop."),
  amb("amb.held", "Room sound: held at the warehouse", "A dark upper storeroom in a riverside warehouse at night. River water slapping under the floor, wind through boarded gaps, a man's footsteps far below on planks, a chain clinking, a distant bridge bell. Tense and quiet. Seamless loop."),
  amb("amb.bridge", "Room sound: the Wells Street bridge", "Standing on a Chicago river bridge at night in 1927. The river rushing below, a streetcar passing over with a bell, wind, a distant elevated train, a foghorn. Seamless loop."),
];
