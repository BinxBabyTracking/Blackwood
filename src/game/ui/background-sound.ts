"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/*
 * The case's background music and each scene's room sound, looping under
 * everything else. Volumes go through Web Audio gain so they work on phones
 * too (iOS ignores an audio element's own volume), and every change fades.
 * Browsers only allow sound after the player has touched the page, so it
 * starts on the first tap or key press if it could not start sooner.
 */

const KEY = "bw-music";
const listeners = new Set<() => void>();
function readMusic() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}
export function setMusicEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable; the setting simply does not persist */
  }
  listeners.forEach((l) => l());
}
export function useMusicEnabled() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readMusic,
    () => true,
  );
}

type Channel = { el: HTMLAudioElement; gain: GainNode; src: string | null };

const FADE = 1.2;

export function useBackgroundSound({
  music,
  ambience,
  musicVolume,
  ambienceVolume,
}: {
  /** The case's music tracks, played in turn from a random starting track. */
  music: string[] | null;
  ambience: string | null;
  /** 0 to 1, already including the master volume. */
  musicVolume: number;
  ambienceVolume: number;
}) {
  const ctx = useRef<AudioContext | null>(null);
  const channels = useRef<{ music?: Channel; ambience?: Channel }>({});
  // Which track of the playlist is playing, and how many in a row have failed to load (a track not made yet).
  const track = useRef(-1);
  const failures = useRef(0);
  const playlist = useRef<string[]>([]);
  const current = () => {
    const list = playlist.current;
    if (!list.length) return null;
    if (track.current < 0) track.current = Math.floor(Math.random() * list.length);
    return list.at(track.current % list.length) ?? null;
  };
  const want = useRef<{ music: string | null; ambience: string | null; musicVolume: number; ambienceVolume: number }>({ music: null, ambience, musicVolume, ambienceVolume });

  const channel = (name: "music" | "ambience") => {
    if (!ctx.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx.current = new AC();
    }
    let c = channels.current[name];
    if (!c) {
      const el = new Audio();
      // Room sound loops; music moves on to the next track when one ends.
      el.loop = name === "ambience";
      if (name === "music") {
        const next = (failed: boolean) => {
          failures.current = failed ? failures.current + 1 : 0;
          // Every track failed: none are made yet. Stay quiet rather than retrying forever.
          if (failures.current >= playlist.current.length) return;
          track.current += 1;
          const src = current();
          // A single track (or the same one again): just start it over.
          if (src === channels.current.music?.src) {
            el.currentTime = 0;
            el.play().catch(() => undefined);
            return;
          }
          want.current = { ...want.current, music: src };
          apply();
        };
        el.addEventListener("ended", () => next(false));
        el.addEventListener("error", () => next(true));
      }
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      const gain = ctx.current.createGain();
      gain.gain.value = 0;
      ctx.current.createMediaElementSource(el).connect(gain).connect(ctx.current.destination);
      c = channels.current[name] = { el, gain, src: null };
    }
    return c;
  };

  const apply = () => {
    for (const name of ["music", "ambience"] as const) {
      const src = want.current[name];
      const level = name === "music" ? want.current.musicVolume : want.current.ambienceVolume;
      const c = src || channels.current[name] ? channel(name) : null;
      const ac = ctx.current;
      if (!c || !ac) continue;
      const now = ac.currentTime;
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setValueAtTime(c.gain.gain.value, now);
      if (src !== c.src) {
        // Fade the old sound out, then swap and fade the new one in.
        c.gain.gain.linearRampToValueAtTime(0, now + (c.src ? FADE / 2 : 0.01));
        const next = src;
        const swap = () => {
          if (want.current[name] !== next || c.src === next) return;
          c.src = next;
          if (!next) return c.el.pause();
          c.el.src = next;
          c.el.play().catch(() => undefined);
          const t = ac.currentTime;
          c.gain.gain.cancelScheduledValues(t);
          c.gain.gain.setValueAtTime(0, t);
          c.gain.gain.linearRampToValueAtTime(level, t + FADE);
        };
        if (c.src) setTimeout(swap, (FADE / 2) * 1000);
        else swap();
      } else {
        c.gain.gain.linearRampToValueAtTime(src ? level : 0, now + 0.4);
        if (src && c.el.paused) c.el.play().catch(() => undefined);
      }
    }
  };

  const musicKey = music?.join("|") ?? "";
  useEffect(() => {
    const list = musicKey ? musicKey.split("|") : [];
    if (list.join("|") !== playlist.current.join("|")) {
      playlist.current = list;
      failures.current = 0;
    }
    want.current = { music: current(), ambience, musicVolume, ambienceVolume };
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicKey, ambience, musicVolume, ambienceVolume]);

  // Start on the first touch, click or key press: browsers block sound before that.
  useEffect(() => {
    const start = () => {
      ctx.current?.resume().catch(() => undefined);
      for (const c of Object.values(channels.current)) if (c?.src && c.el.paused) c.el.play().catch(() => undefined);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    // Pause in a hidden tab; carry on when it comes back.
    const vis = () => {
      if (!ctx.current) return;
      if (document.visibilityState === "hidden") ctx.current.suspend().catch(() => undefined);
      else ctx.current.resume().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      document.removeEventListener("visibilitychange", vis);
      for (const c of Object.values(channels.current)) c?.el.pause();
      ctx.current?.close().catch(() => undefined);
      ctx.current = null;
      channels.current = {};
    };
  }, []);
}
