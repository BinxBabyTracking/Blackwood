"use client";

/*
 * One voice at a time. Every player in the game (evidence narration,
 * interviews, police tapes, telephone calls) claims the bus before it plays,
 * which pauses whatever was speaking. Fetched audio is kept per page session
 * so replaying a line never asks the server twice.
 */

let active: HTMLAudioElement | null = null;
const cache = new Map<string, Promise<string>>();

/*
 * Whether anyone is speaking right now (a voice on the bus, or a recording
 * played from its own controls), so background music and room sound can dip.
 */
const watched = new WeakSet<HTMLMediaElement>();
const speakingListeners = new Set<() => void>();
let speaking = false;
function recompute() {
  const domPlaying =
    typeof document !== "undefined" &&
    [...document.querySelectorAll<HTMLMediaElement>("audio, video")].some((m) => !m.paused && !m.ended && !m.muted);
  const next = Boolean((active && !active.paused && !active.ended) || domPlaying);
  if (next === speaking) return;
  speaking = next;
  speakingListeners.forEach((l) => l());
}
function watch(a: HTMLMediaElement) {
  if (watched.has(a)) return;
  watched.add(a);
  for (const ev of ["play", "playing", "pause", "ended", "emptied"]) a.addEventListener(ev, recompute);
}
if (typeof document !== "undefined") {
  // Media events don't bubble, but they can be caught on the way down.
  for (const ev of ["play", "playing", "pause", "ended", "emptied"]) document.addEventListener(ev, recompute, true);
}
export function subscribeSpeaking(l: () => void) {
  speakingListeners.add(l);
  return () => speakingListeners.delete(l);
}
export const isSpeaking = () => speaking;

export function claim(a: HTMLAudioElement) {
  if (active && active !== a) active.pause();
  active = a;
  watch(a);
  recompute();
}

export function release(a: HTMLAudioElement) {
  if (active === a) active = null;
  recompute();
}

/** Resolves to a playable object URL, or rejects with a message fit to show the player. */
export function loadAudio(src: string): Promise<string> {
  let p = cache.get(src);
  if (!p) {
    p = fetch(src, { credentials: "same-origin" }).then(async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "This recording is unavailable right now.");
      }
      return URL.createObjectURL(await res.blob());
    });
    cache.set(src, p);
    p.catch(() => cache.delete(src));
  }
  return p;
}

export type LineStatus = "idle" | "loading" | "playing" | "paused" | "error";
export interface LineState {
  current: number | null;
  status: LineStatus;
  error: string | null;
}

/**
 * Plays a run of lines in order, one clip per line, so the subtitle for the
 * line being spoken can be highlighted. Lines with no source are skipped.
 * Plain class rather than hooks so its callbacks stay stable.
 */
export class LineSequence {
  private a: HTMLAudioElement | null = null;
  private token = 0;
  private srcs: (string | null)[] = [];
  private end = 0;
  private volume = 1;

  constructor(private readonly emit: (s: LineState) => void) {}

  readonly play = (from: number, srcs?: (string | null)[], end?: number) => {
    if (srcs) this.srcs = srcs;
    this.end = Math.min(end ?? this.srcs.length, this.srcs.length);
    const token = ++this.token;
    void this.run(from, token);
  };

  readonly pause = () => this.a?.pause();

  readonly resume = () => {
    const a = this.a;
    if (!a) return;
    claim(a);
    a.play().catch(() => this.emit({ current: null, status: "error", error: "This recording could not be played." }));
  };

  readonly stop = () => {
    this.token++;
    if (this.a) {
      this.a.pause();
      release(this.a);
    }
    this.emit({ current: null, status: "idle", error: null });
  };

  readonly setVolume = (v: number) => {
    this.volume = v;
    if (this.a) this.a.volume = v;
  };

  private async run(i: number, token: number) {
    while (i < this.end && !this.srcs[i]) i++;
    if (i >= this.end) {
      if (token === this.token) this.emit({ current: null, status: "idle", error: null });
      return;
    }
    const src = this.srcs[i]!;
    this.emit({ current: i, status: "loading", error: null });
    try {
      const url = await loadAudio(src);
      if (token !== this.token) return;
      // Fetch the next line while this one plays, so there is no gap between lines.
      const next = this.srcs.slice(i + 1, this.end).find(Boolean);
      if (next) loadAudio(next).catch(() => undefined);
      const a = (this.a ??= new Audio());
      a.onended = null;
      a.onpause = null;
      a.src = url;
      a.volume = this.volume;
      a.onplay = () => token === this.token && this.emit({ current: i, status: "playing", error: null });
      a.onpause = () => token === this.token && !a.ended && this.emit({ current: i, status: "paused", error: null });
      a.onended = () => token === this.token && void this.run(i + 1, token);
      claim(a);
      await a.play();
    } catch (e) {
      if (token !== this.token) return;
      this.emit({ current: null, status: "error", error: e instanceof Error ? e.message : "This recording could not be played." });
    }
  }
}
