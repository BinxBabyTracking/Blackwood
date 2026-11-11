import type { CharacterDef, Condition } from "@/game/engine/types";

/*
 * CHR001 people, from the project doc "CHR001 Case Design - The Christmas That
 * Never Happened" (v0.1, a draft for approval). This is the production
 * scaffold: who they are, where they are found, how they sound and look.
 * Interviews (questions and knowledge) are written once the design and its
 * timeline are approved; until then nobody can be questioned.
 *
 * Voices: each voiceId is only a stand-in until a voice is designed on the
 * Admin page from the direction. North Pole elves are small, gnome-like folk
 * with bright, lively, characterful voices and a light Scandinavian lilt, like
 * an animated Christmas film; Santa and Mrs. Claus are full-sized and speak
 * warm American English.
 */

const never: Condition = { not: { always: true } };
const LILT = "A North Pole elf: small, round, gnome-like folk, so a bright, slightly higher, lively voice with a twinkle of mischief and a light, musical Scandinavian lilt in warm American English, like a character in an animated Christmas film; never squeaky, sped up or chipmunk-like.";

type Person = {
  id: string;
  name: string;
  role: string;
  bio: string[];
  locationId: string | null;
  voiceId: string;
  direction: string;
  persona: string;
  onBoard?: boolean;
};

const PEOPLE: Person[] = [
  {
    id: "aldric",
    name: "Aldric",
    role: "Keeper of Time; custodian of the Christmas Chronometer. The victim",
    bio: [
      "Nearly nine hundred. Keeper of Time to Santa for centuries, and the only one who truly understands the Christmas Chronometer. Lives and works in the clock tower.",
      "Found dead in his workshop at the foot of the tower on Christmas Eve. The Chronometer is gone.",
    ],
    locationId: "tower_workshop",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    direction: `Very old elf, gentle, dry, twinkly and a little amused, a craftsman's precise way of speaking, slow and creaky like an old clock but never frail, a soft chuckle in his voice. ${LILT}`,
    persona: "Kind, exact, secretive about his work, tired of carrying a weight alone. Speaks in short, careful sentences and dislikes being hurried.",
  },
  {
    id: "garrick",
    name: "Garrick Thorne",
    role: "Senior Christmas Clock technician",
    bio: [
      "143. Senior technician of the North Pole's clocks, as his family has been for generations. Lives on Holly Lane with his daughter, Mira; his workshop is on Clockmakers' Row.",
      "A widower: his wife, Elsbeth, died decades ago.",
    ],
    locationId: "garrick_workshop",
    voiceId: "CYw3kZ02Hs0563khs1Fj",
    direction: `Middle-aged elf, gruff and low for an elf, a tradesman's plain, steady speech, polite, grief held tightly under the surface, becoming clipped and hard when pushed. ${LILT}`,
    persona: "Proud, quiet, devoted to his daughter, carrying a terrible plan. Gives his own account and never volunteers it.",
  },
  {
    id: "mira",
    name: "Mira Thorne",
    role: "Toy painter; Garrick's daughter",
    bio: ["Sixty-two, young for an elf, but she looks very old. Paints toys at the workshop. Lives with her father on Holly Lane."],
    locationId: "toy_floor",
    voiceId: "pMsXgVXv3BLzUgSXRplE",
    direction: `Elf woman who sounds young but tired and a little breathless, gentle, warm and wry, a soft laugh, never self-pitying. ${LILT}`,
    persona: "Gentle, funny, worried about her father. Knows she is aging too fast, does not know why, and does not know what he plans.",
  },
  {
    id: "pip",
    name: "Pip Larkspur",
    role: "Aldric's apprentice",
    bio: ["Forty, very young for an elf. Apprentice to the Keeper of Time for six years. Found Aldric's body."],
    locationId: "tower_workshop",
    voiceId: "bIHbv24MWmeRgasZH58o",
    direction: `Young elf, very eager, quick and nervous, talks a little too fast and trips over his words, bright and earnest, devoted to his master. ${LILT}`,
    persona: "Earnest, anxious, observant about clocks and careless about everything else. Knows Aldric was building something, not what.",
  },
  {
    id: "santa",
    name: "Santa Claus",
    role: "Head of the North Pole",
    bio: ["The final authority at the North Pole. Prepares for his journey on Christmas Eve from his office off the toy floor."],
    locationId: "santa_office",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    direction: "Santa Claus: a big, elderly man with a deep, rich, warm, rumbling American voice, kind, twinkly and wise, a soft hearty chuckle, with real authority and, today, a weight of worry.",
    persona: "Warm, wise, responsible for everyone. Trusts his Bureau. Recognizes his own Time Bag's magic when he sees it.",
  },
  {
    id: "mrsclaus",
    name: "Mrs. Claus",
    role: "Runs the great kitchen",
    bio: ["Knows everyone at the North Pole and most of their business. An old friend of Mira Thorne."],
    locationId: "kitchen",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    direction: "Mrs. Claus: an elderly woman, warm, cozy, brisk, shrewd and teasing, a merry laugh, warm American English, a voice used to running a busy Christmas kitchen.",
    persona: "Kind, sharp, a little nosy, protective of Mira. Notices who comes and goes.",
  },
  {
    id: "marigold",
    name: "Marigold Tinsel",
    role: "Santa's chief of staff",
    bio: ["Runs Santa's day. Keeps his appointment book."],
    locationId: "marigold_office",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    direction: `Elf woman, brisk, crisp and efficient, precise, a little bossy, impatient with anything off schedule, dry humor. ${LILT}`,
    persona: "Efficient, protective of Santa's time, exact about appointments.",
  },
  {
    id: "vell",
    name: "Captain Sigrid Vell",
    role: "Captain of the North Pole Guard",
    bio: ["Commands the Guard. Posts guards and holds anyone detained in the Guard house cells."],
    locationId: "guard_house",
    voiceId: "FGY2WhTYpPnrIDTdsKH5",
    direction: `Elf woman, a guard captain: lower and steadier than most elves, level, dry, direct and skeptical, few words, a hint of a smile underneath. ${LILT}`,
    persona: "Practical and skeptical. Acts only on grounds she can see in front of her; evidence from another timeline only confuses her.",
  },
  {
    id: "quill",
    name: "Tobias Quill",
    role: "Archivist of the Magical Archives",
    bio: ["Keeps the Archives, the Tithe Register and the visitor log."],
    locationId: "archives",
    voiceId: "GBv7mTt0atIp3Br8iCZE",
    direction: `Very old elf, dry, fussy, exact and soft spoken, a bookish wheeze, fond of the precise word and delighted by old records. ${LILT}`,
    persona: "Meticulous, a stickler for the log, delighted when someone takes an interest in old records.",
  },
  {
    id: "glint",
    name: "Dr. Hesper Glint",
    role: "Head of the Engineering Lab",
    bio: ["Runs the Lab on the square. Built a large glass globe to Aldric's drawings."],
    locationId: "lab",
    voiceId: "pFZP5JQG7iQjIQuC4Bku",
    direction: `Elf woman, quick, clever and scatterbrained, talks fast when excited, exact, a little impatient, warm underneath. ${LILT}`,
    persona: "Brilliant and busy. Annoyed that her gear puller has gone missing. Does not know what the globe is for.",
  },
  {
    id: "corwin",
    name: "Corwin Sleet",
    role: "Clockmaker",
    bio: ["Keeps a clock shop on Clockmakers' Row. Has a long-running grievance with the Keeper of Time."],
    locationId: "corwin_shop",
    voiceId: "pqHfZKP75CvOlQylNhV4",
    direction: `Elf man, fussy, aggrieved and nasal, quick to complain, pompous and theatrical, huffs and sniffs. ${LILT}`,
    persona: "Petty, proud of his clocks, furious that Aldric keeps retuning them. Loud but harmless.",
  },
  {
    id: "dasha",
    name: "Dasha Rime",
    role: "Stable master",
    bio: ["Runs the reindeer stables and the stable yard."],
    locationId: "stables",
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    direction: `Young elf woman, outdoorsy, frank and cheerful, practical, warm with animals and blunt with people, a hearty laugh. ${LILT}`,
    persona: "Straightforward and observant about who comes through her stables.",
  },
  {
    id: "bertram",
    name: "Bertram Nog",
    role: "Foreman of the toy floor",
    bio: ["Runs the toy floor and its shift board."],
    locationId: "toy_floor",
    voiceId: "iP95p4xoKVk53GoZ742B",
    direction: `Big, round elf, booming, hearty and jolly, harried, a foreman's voice that carries across a busy workshop. ${LILT}`,
    persona: "Busy, friendly, proud of his floor, knows who signed out and when.",
  },
  {
    id: "juniper",
    name: "Chief Inspector Juniper Ashby",
    role: "Head of the Jingle Division",
    bio: ["Heads the Jingle Division of the Silver Bell Bureau. Briefs the investigators."],
    locationId: "jingle_office",
    voiceId: "XrExE9yKIg1WjnnlVkGX",
    direction: `Elf woman, calm, dry and serious, authoritative and economical, a senior detective, a rare dry wit. ${LILT}`,
    persona: "The investigators' chief and contact. Serious, fair, never gives answers away.",
  },
  {
    id: "guard",
    name: "Guard",
    role: "North Pole Guard",
    bio: ["One of Captain Vell's guards. Can be posted where the investigators ask."],
    locationId: "guard_house",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
    direction: `Young elf, formal, brief and polite, by the book, trying hard to sound official. ${LILT}`,
    persona: "Formal and brief. Follows orders.",
    onBoard: false,
  },
];

export const characters: CharacterDef[] = PEOPLE.map((p) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  portrait: `char.${p.id}`,
  bio: p.bio.map((text) => ({ text })),
  // Interviews are not written yet: nobody can be questioned in the scaffold.
  available: never,
  locationId: p.locationId,
  onBoard: p.onBoard ?? true,
  defaultEvidenceReply: "",
  idleLine: "",
  persona: p.persona,
  voice: { voiceId: p.voiceId, direction: p.direction, settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 } },
}));
