/*
 * The story running in the walkable world: the in-world clock, the time loop, what has happened this loop, the
 * evidence found and kept, and the things you can look at, pick up or use. Plain TypeScript (no three.js, no React),
 * so the viewer drives it every frame and the overlay reads it.
 *
 * For now it runs in the browser and is saved there (one investigator, testing). The same state moves to the server
 * for shared, multiplayer play.
 */

/** A time of day as minutes after midnight ("11:47" is 707). */
export const at = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const clockText = (t: number) => {
  const m = Math.floor(t) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** When a spot is there, or what it shows: every part given must hold. */
export type When = {
  from?: string;
  until?: string;
  /** Aldric is dead in this loop (true) or alive (false). */
  dead?: boolean;
  /** The Chronometer has been stolen in this loop. */
  stolen?: boolean;
  /** Only in loop 1 (true) or only after it (false). */
  first?: boolean;
  /** Something that happened in this loop (a flag set by an action). */
  flag?: string;
  notFlag?: string;
};

/** What doing something at a spot gives you. */
export type Act = {
  label: string;
  /** Evidence it records (a photograph, a statement, a page, an item). */
  evidence?: string;
  /** You take the thing (it's gone from the world until the loop resets). */
  take?: boolean;
  /** A flag it sets for the rest of this loop. */
  flag?: string;
  /** What you're told. */
  say?: string;
  /** Takes this many in-world minutes before it's done. */
  minutes?: number;
};

/** Something in the world you can look at and use: anchored to a model or wall piece in a place. */
export type Spot = {
  id: string;
  /** The place (zone id); a building's rooms count as their own places. */
  zone: string;
  /** What it's on: a model id, or a wall piece's image id. */
  anchor: string;
  /** Raise or move the marker a little from the anchor's top (metres). */
  lift?: number;
  title: string;
  /** What you see. */
  text: string;
  /** A picture (art id). */
  image?: string;
  when?: When;
  acts?: Act[];
  /** The Time Bag stand or the great bell: opens their own panel. */
  opens?: "bag" | "bell";
};

/** Who or what is shown, by time and loop (anything not listed is always shown). */
export type Shown = { model?: string; person?: string; /** Only in this place (a model used in two places). */ zone?: string; when: When };

export type EvidenceInfo = { id: string; title: string; text: string; image: string | null; bag: boolean; never?: boolean };

export type StoryData = {
  caseId: string;
  /** Real seconds for one in-world minute. */
  secondsPerMinute: number;
  /** Every loop after the first starts here, then. */
  dayStart: { zone: string; time: string };
  /** Loop 1 starts here, then. */
  firstStart: { zone: string; time: string };
  /** Aldric's death in the original day, and the theft that follows it. */
  murder: string;
  theft: string;
  hidden: string;
  /** How long the Keeper's Bond holds the day open after his death (minutes). */
  countdown: number;
  /** Being here between these times stops the murder (Garrick comes up the hatch, sees you, and goes). */
  guard: { zone: string; from: string; until: string; say: string };
  spots: Spot[];
  shown: Shown[];
  evidence: EvidenceInfo[];
  /** Picture URLs by image key (ev.CE001), filled in by the page from the art live on Admin. */
  pictures?: Record<string, string>;
};

export type Found = { loop: number; how: "photo" | "statement" | "item" | "record"; at: number; zone: string };
export type Kept = { loop: number; from: string };

export type StoryState = {
  v: 1;
  loop: number;
  t: number;
  dead: boolean;
  deathAt: number | null;
  stolen: boolean;
  /** Aldric lives this loop because the murder was stopped. */
  saved: boolean;
  flags: string[];
  /** Taken this loop: gone from the world until the reset. */
  taken: string[];
  found: Record<string, Found>;
  bag: Record<string, Kept>;
  log: { loop: number; t: number; text: string }[];
  /** Waiting on something that takes time (an examination). */
  pending: { act: Act; spot: string; done: number }[];
  /** Where you last were (so a reload puts you back there). */
  where?: string;
};

/** What the overlay is showing: a spot's card, or a panel. Not saved. */
export type StoryUi = { open: string | null; panel: "notebook" | "bag" | "bell" | null; toast: { text: string; until: number } | null; near: string | null; flash: number; talk: string | null };

const fresh = (d: StoryData): StoryState => ({
  v: 1,
  loop: 1,
  t: at(d.firstStart.time),
  dead: true,
  deathAt: at(d.murder),
  stolen: true,
  saved: false,
  flags: [],
  taken: [],
  found: {},
  bag: {},
  log: [],
  pending: [],
});

export type StoryEvent = { kind: "reset" } | { kind: "say"; text: string } | { kind: "go"; zone: string };

/** The story for one investigator: ticks with the world, answers the viewer's questions, and tells the overlay. */
export class StoryRun {
  s: StoryState;
  private subs = new Set<() => void>();
  private ver = 0;
  private lastSave = 0;
  private lastMinute = -1;
  /** Where you are, as the viewer last said. */
  zone = "";
  ui: StoryUi = { open: null, panel: null, toast: null, near: null, flash: 0, talk: null };
  setUi(p: Partial<StoryUi>) {
    this.ui = { ...this.ui, ...p };
    this.changed();
  }
  say(text: string) {
    this.setUi({ toast: { text, until: performance.now() + 7000 } });
  }
  spot(id: string | null) {
    return id ? (this.d.spots.find((x) => x.id === id) ?? null) : null;
  }
  constructor(
    readonly d: StoryData,
    private key: string,
  ) {
    let s: StoryState | null = null;
    try {
      const raw = localStorage.getItem(key);
      s = raw ? (JSON.parse(raw) as StoryState) : null;
    } catch {
      s = null;
    }
    this.s = s?.v === 1 ? { ...fresh(d), ...s } : fresh(d);
  }
  subscribe = (f: () => void) => {
    this.subs.add(f);
    return () => this.subs.delete(f);
  };
  version = () => this.ver;
  private changed() {
    this.ver++;
    for (const f of this.subs) f();
  }
  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.s));
    } catch {
      /* private mode: the run just isn't kept */
    }
  }
  /** Start the whole case again from loop 1. */
  restart() {
    this.s = fresh(this.d);
    this.save();
    this.changed();
  }
  holds(w: When | undefined) {
    if (!w) return true;
    const s = this.s;
    if (w.from && s.t < at(w.from)) return false;
    if (w.until && s.t >= at(w.until)) return false;
    if (w.dead != null && s.dead !== w.dead) return false;
    if (w.stolen != null && s.stolen !== w.stolen) return false;
    if (w.first != null && (s.loop === 1) !== w.first) return false;
    if (w.flag && !s.flags.includes(w.flag)) return false;
    if (w.notFlag && s.flags.includes(w.notFlag)) return false;
    return true;
  }
  /** Spots there right now in these places (the place you're in, and a building's rooms). */
  spotsIn(zones: string[]) {
    return this.d.spots.filter((sp) => zones.includes(sp.zone) && this.holds(sp.when));
  }
  /** Is this model or person shown right now? */
  modelShown(id: string, zone?: string) {
    const rules = this.d.shown.filter((r) => r.model === id && (!r.zone || !zone || r.zone === zone));
    if (!rules.length) return !this.s.taken.some((k) => k === `model:${id}`);
    return rules.some((r) => this.holds(r.when)) && !this.s.taken.includes(`model:${id}`);
  }
  personShown(id: string) {
    const rules = this.d.shown.filter((r) => r.person === id);
    return !rules.length || rules.some((r) => this.holds(r.when));
  }
  evidence(id: string) {
    return this.d.evidence.find((e) => e.id === id);
  }
  note(text: string) {
    this.s.log.push({ loop: this.s.loop, t: this.s.t, text });
  }
  /** Do something at a spot. Returns what to tell the investigator. */
  act(spot: Spot, a: Act): string {
    const s = this.s;
    if (a.minutes) {
      s.pending.push({ act: { ...a, minutes: 0 }, spot: spot.id, done: s.t + a.minutes });
      this.save();
      this.changed();
      return a.say ?? "That will take a little while.";
    }
    const said = this.apply(spot, a);
    this.save();
    this.changed();
    return said;
  }
  private apply(spot: Spot, a: Act) {
    const s = this.s;
    if (a.flag && !s.flags.includes(a.flag)) s.flags.push(a.flag);
    if (a.take) s.taken.push(`model:${spot.anchor}`, `spot:${spot.id}`);
    let said = a.say ?? "";
    if (a.evidence) {
      const ev = this.evidence(a.evidence);
      const how: Found["how"] = a.take ? "item" : /statement/i.test(ev?.title ?? "") ? "statement" : a.label.toLowerCase().startsWith("photograph") ? "photo" : "record";
      if (!s.found[a.evidence]) s.found[a.evidence] = { loop: s.loop, how, at: s.t, zone: spot.zone };
      said = said || `${ev?.title ?? a.evidence}: added to the notebook.`;
    }
    this.note(`${spot.title}: ${a.label.toLowerCase()}.`);
    return said;
  }
  /** Is this evidence in your hands this loop (taken, not just recorded)? */
  holding(id: string) {
    return this.d.spots.some((sp) => this.s.taken.includes(`spot:${sp.id}`) && sp.acts?.some((a) => a.take && a.evidence === id));
  }
  /** Put something you're holding in the Time Bag: it keeps from now on, through every reset. */
  keep(id: string): string {
    const ev = this.evidence(id);
    if (!ev) return "";
    if (ev.never) return "The Bag will not close on it.";
    if (!ev.bag) return "That isn't something the Bag can keep.";
    if (this.s.bag[id]?.loop === this.s.loop) return "The Bag already has this one from this loop.";
    if (!this.holding(id)) return "Take it first.";
    this.s.bag[id] = { loop: this.s.loop, from: this.s.found[id]?.zone ?? "" };
    this.note(`${ev.title}: put in the Time Bag.`);
    this.save();
    this.changed();
    return `${ev.title} is in the Time Bag. Collected: loop ${this.s.loop}.`;
  }
  /** Ring the great bell: skip ahead to a time (stops early at anything that matters). */
  ringTo(t: number) {
    const s = this.s;
    const stops = [at(this.d.guard.from), at(this.d.murder), at(this.d.theft), at(this.d.hidden), ...(s.deathAt != null ? [s.deathAt + this.d.countdown] : []), ...s.pending.map((p) => p.done)].filter((x) => x > s.t);
    const to = Math.min(t, ...stops);
    s.t = Math.max(s.t, to);
    this.note(`Rang the great bell ahead to ${clockText(s.t)}.`);
    this.save();
    this.changed();
  }
  /** One frame: the clock runs, the day happens, and the loop resets when the countdown runs out. */
  tick(dt: number, zone: string): StoryEvent[] {
    const s = this.s, d = this.d;
    const out: StoryEvent[] = [];
    this.zone = zone;
    s.where = zone;
    s.t += dt / d.secondsPerMinute;
    // Standing guard in Aldric's workshop when Garrick comes up the hatch stops the murder.
    if (!s.dead && !s.saved && zone === d.guard.zone && s.t >= at(d.guard.from) && s.t < at(d.guard.until)) {
      s.saved = true;
      s.flags.push("garrick_seen");
      this.note(d.guard.say);
      out.push({ kind: "say", text: d.guard.say });
    }
    if (!s.dead && !s.saved && s.t >= at(d.murder)) {
      s.dead = true;
      s.deathAt = at(d.murder);
      this.note("Aldric died in his workshop. The words appeared: 4 HOURS REMAIN.");
    }
    if (s.dead && !s.stolen && s.t >= at(d.theft)) s.stolen = true;
    for (const p of [...s.pending]) {
      if (s.t < p.done) continue;
      s.pending = s.pending.filter((q) => q !== p);
      const sp = d.spots.find((x) => x.id === p.spot);
      if (sp) out.push({ kind: "say", text: this.apply(sp, p.act) });
    }
    if (s.dead && s.deathAt != null && s.t >= s.deathAt + d.countdown) {
      // The Chronometer rings; every bell answers; the day goes back to its first winding.
      Object.assign(s, { loop: s.loop + 1, t: at(d.dayStart.time), dead: false, deathAt: null, stolen: false, saved: false, flags: [], taken: [], pending: [] });
      this.note(`The bells rang. Loop ${s.loop} begins at ${d.dayStart.time.replace(/^0/, "")} AM.`);
      out.push({ kind: "reset" }, { kind: "go", zone: d.dayStart.zone });
      this.ui = { ...this.ui, open: null, panel: null, flash: performance.now() };
    }
    for (const e of out) if (e.kind === "say") this.ui = { ...this.ui, toast: { text: e.text, until: performance.now() + 9000 } };
    const minute = Math.floor(s.t);
    if (minute !== this.lastMinute || out.length) {
      this.lastMinute = minute;
      this.changed();
    }
    const now = performance.now();
    if (out.length || now - this.lastSave > 5000) {
      this.lastSave = now;
      this.save();
    }
    return out;
  }
}
