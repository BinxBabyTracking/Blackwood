import type { DialogueQuestion } from "./types";

/*
 * Matches a question in the player's own words to one of the authored answers
 * a character can give right now. Deterministic and free: words are reduced to
 * a small vocabulary of concepts ("saw", "noticed" and "heard" all mean
 * perceiving something; "left" and "went home" mean leaving), then compared
 * with what each entry is about. It only ever chooses between candidates the
 * engine has already allowed, so it cannot reach locked information.
 */

const STOP = new Set(
  (
    "a an the and or but if so of to in on at by for with from into onto about over after before than then as is are was were be been being am do does did " +
    "doing done have has had having i me my mine we us our you your yours he him his she her hers it its they them their this that these those there here " +
    "what which who whom whose why how can could would should will shall may might must just really very please tell ask know think say said like any anything " +
    "something some ever also too again happen happened happens happening more much many well okay ok mr mrs miss ms sir maam madam dear let lets get got gets going go s t d ll ve re m"
  ).split(" "),
);
// "go", "get" are stop words alone but carry meaning in phrases; phrases are handled first.

/** Multi-word phrases rewritten before tokenizing. */
const PHRASES: [RegExp, string][] = [
  [/\bwent home\b|\bgo(?:ne|ing)? home\b|\bgot home\b|\bget home\b|\bheaded home\b/g, " leave home "],
  [/\bwalk(?:ed)? home\b|\bdrove home\b|\bdrive home\b/g, " leave home "],
  [/\bacross the street\b/g, " neighbor "],
  [/\bcatch(?:es)? your (?:eye|attention)\b|\bcaught your (?:eye|attention)\b/g, " perceive unusual "],
  [/\bwhen did (?:she|eleanor) die\b|\btime of death\b|\bwhen was she killed\b/g, " death time coroner "],
  [/\bgets? (?:her|eleanor'?s|the) (?:money|estate|house)\b/g, " inherit money "],
  [/\bback door\b|\brear door\b|\bkitchen door\b/g, " door "],
  [/\bwhat time\b|\bhow late\b|\bhow early\b/g, " time "],
  [/\blook(?:ed|s)? like\b|\bwhat kind of\b|\bwhat sort of\b|\bdescribe\b|\bwhat colou?r\b|\bmake and model\b/g, " describe "],
  [/\bclock(?:ed)? (?:out|off)\b|\bwent off shift\b|\bend of (?:her|the) shift\b/g, " shift time "],
  [/\bget along\b|\bgot along\b/g, " relationship "],
  [/\bout of the ordinary\b|\bstrange\b|\bweird\b|\bodd\b|\bunusual\b|\bsuspicious\b/g, " unusual "],
  [/\bstep(?:ped)? aside\b|\btook .{0,20} aside\b|\bprivate(?:ly)?\b|\bone on one\b/g, " private "],
];

/** Canonical concepts. Every word in a group counts as the group's first word. */
const GROUPS = [
  "perceive see saw seen notice noticed spot spotted observe observed witness witnessed hear heard listen glimpse look looked watch watched attention awake asleep sleep slept doze dozed",
  "leave left depart departed exit gone leaving walked drove off",
  "home place apartment back",
  "evening night friday supper dinner party gathering meal",
  "car sedan vehicle automobile auto buick lesabre fender drive driving parked parking",
  "money finance finances financial account accounts estate ledger statement statements bank cheque cheques check checks funds payment payments embezzle embezzling sums balance books",
  "hand hands injury injured cut cuts bandage bandaged wound wounded hurt palm jar",
  "jacket windbreaker coat",
  "know knew relationship friend friends acquainted neighbour neighbor met",
  "death killed kill murder murdered died die dead body",
  "door doors bolt lock locked locks latch",
  "window screen mesh",
  "diner cafe restaurant coffee pie maple",
  "waitress linda server rosa shift",
  "time clock oclock late early hour minute",
  "struggle argument argue fight fought noise shout shouting scream disturbance commotion row quarrel",
  "lawyer attorney albright solicitor legal",
  "papers folder file files report reports documents document paperwork",
  "suitcase packed packing trip travel phoenix",
  "envelope letter note handbag",
  "mood feel felt seem seemed upset worried worry nervous happy quiet distracted concern concerns concerned behave behaving behaved act acting acted bother bothering bothered trouble troubled troubling mind",
  "inherit inherits inheritance heir will gets",
  "guest guests others people everyone everybody",
  "search find recover recovered look trash dumpster",
  "lab laboratory report coroner forensic forensics blood typing autopsy",
  "scene found discovered",
  "timeline order sequence",
  "after afterward afterwards later then",
];
const CANON = new Map<string, string>();
for (const g of GROUPS) {
  const words = g.split(" ");
  for (const w of words) if (!CANON.has(w)) CANON.set(w, words[0]);
}

function stem(w: string) {
  if (CANON.has(w)) return w;
  for (const suf of ["ing", "ed", "es", "s", "ly"]) {
    if (w.length > suf.length + 3 && w.endsWith(suf)) {
      const base = w.slice(0, -suf.length);
      if (CANON.has(base)) return base;
      if (suf === "ed" && CANON.has(base + "e")) return base + "e";
      return base;
    }
  }
  return w;
}

/** Concepts in a piece of text. */
export function concepts(text: string): string[] {
  let t = ` ${text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ")} `;
  for (const [re, rep] of PHRASES) t = t.replace(re, rep);
  const out: string[] = [];
  for (const raw of t.split(/\s+/)) {
    if (!raw || STOP.has(raw)) continue;
    const w = stem(raw);
    if (STOP.has(w) || w.length < 2) continue;
    out.push(CANON.get(w) ?? w);
  }
  return out;
}

export interface Match {
  id: string;
  score: number;
}

/**
 * Scores each candidate against the question. The prompt and keywords say
 * what an entry is about and count fully; the answer's own words count a
 * little, so a question about something the character mentions still finds it.
 */
export function rankCandidates(question: string, candidates: DialogueQuestion[]): Match[] {
  const q = [...new Set(concepts(question))];
  if (!q.length) return [];
  return candidates
    .map((c) => {
      const about = new Set(concepts([c.prompt, c.topic ?? "", ...(c.keywords ?? [])].join(" ")));
      const said = new Set(concepts(c.reply.join(" ")));
      let hit = 0;
      for (const w of q) hit += about.has(w) ? 1 : said.has(w) ? 0.35 : 0;
      // Share of the question explained, nudged towards entries that are specifically about it.
      const coverage = hit / q.length;
      const focus = hit / Math.max(about.size, 1);
      return { id: c.id, score: coverage * 0.85 + Math.min(focus, 1) * 0.15 };
    })
    .sort((a, b) => b.score - a.score);
}

/** The best candidate if it is a confident enough match; otherwise null. */
export function bestMatch(question: string, candidates: DialogueQuestion[], threshold = 0.42): string | null {
  const [top, second] = rankCandidates(question, candidates);
  if (!top || top.score < threshold) return null;
  // Two entries equally plausible: prefer the one not yet asked is handled by the caller's ordering.
  if (second && second.score === top.score) return top.id;
  return top.id;
}
