"use client";

import { useEffect } from "react";

/*
 * A period desk telephone: a clapper striking twin bells about twenty times
 * a second, two seconds on and four off, synthesized so no recording is
 * needed. Rings a few times while the scene is free, then falls silent; the
 * visual cue on the telephone carries on until the call is answered.
 */
const RINGS = 3;

export function useTelephoneRing(active: boolean, volume: number) {
  useEffect(() => {
    if (!active || volume <= 0 || typeof window === "undefined") return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    let ctx: AudioContext;
    try {
      ctx = new Ctx();
    } catch {
      return;
    }
    const master = ctx.createGain();
    master.gain.value = Math.min(1, volume) * 0.18;
    master.connect(ctx.destination);

    const ring = (t0: number) => {
      for (const [freq, level] of [[1180, 1], [1530, 0.6], [2360, 0.25]] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const clapper = ctx.createGain();
        clapper.gain.value = 0;
        // Each clapper strike: a sharp attack and a short decay, 20 strikes a second.
        for (let i = 0; i < 40; i++) {
          const t = t0 + i * 0.05;
          clapper.gain.setValueAtTime(level, t);
          clapper.gain.exponentialRampToValueAtTime(level * 0.08, t + 0.045);
        }
        clapper.gain.setValueAtTime(0.0001, t0 + 2);
        osc.connect(clapper).connect(master);
        osc.start(t0);
        osc.stop(t0 + 2.3);
      }
    };
    const start = ctx.currentTime + 0.4;
    for (let n = 0; n < RINGS; n++) ring(start + n * 6);
    ctx.resume().catch(() => undefined);
    return () => {
      ctx.close().catch(() => undefined);
    };
  }, [active, volume]);
}
