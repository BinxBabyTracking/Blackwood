"use client";

/*
 * Travel sound. When the case supplies a recording it is played; otherwise
 * the sound is synthesized: a car door, an old V8 pulling away, road noise and
 * a slow-down for a drive; heel-and-toe footsteps over a quiet street for a
 * walk. Returns a stop function that fades out cleanly.
 */

export type TravelMode = "drive" | "walk";

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    // Slightly brown noise: softer and more like distance than pure white noise.
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
    d[i] = last * 3.5;
  }
  return buf;
}

function thump(ctx: AudioContext, out: AudioNode, t: number, freq: number, level: number, length: number, noise: AudioBuffer) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + length + 0.05);
}

function drive(ctx: AudioContext, out: AudioNode, seconds: number) {
  const t0 = ctx.currentTime + 0.05;
  const end = t0 + seconds;
  const noise = noiseBuffer(ctx, 2);

  // Door shutting, then the engine.
  thump(ctx, out, t0, 180, 0.9, 0.25, noise);

  const engineGain = ctx.createGain();
  engineGain.gain.setValueAtTime(0.0001, t0 + 0.25);
  engineGain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.7);
  engineGain.gain.setValueAtTime(0.5, end - 0.8);
  engineGain.gain.exponentialRampToValueAtTime(0.0001, end);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 320;
  tone.Q.value = 3;
  tone.connect(engineGain).connect(out);

  const freq = (o: OscillatorNode, mul: number) => {
    o.frequency.setValueAtTime(34 * mul, t0 + 0.25);
    o.frequency.exponentialRampToValueAtTime(70 * mul, t0 + 1.3); // pulling away
    o.frequency.exponentialRampToValueAtTime(58 * mul, t0 + 2); // cruising
    o.frequency.setValueAtTime(58 * mul, end - 1);
    o.frequency.exponentialRampToValueAtTime(38 * mul, end); // slowing to the kerb
  };
  for (const [type, mul, level] of [["sawtooth", 1, 0.6], ["square", 2, 0.18], ["sine", 0.5, 0.5]] as const) {
    const o = ctx.createOscillator();
    o.type = type;
    freq(o, mul);
    const g = ctx.createGain();
    g.gain.value = level;
    o.connect(g).connect(tone);
    o.start(t0 + 0.25);
    o.stop(end + 0.1);
  }
  // Cylinder pulse: a slight flutter on the engine.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 11;
  const depth = ctx.createGain();
  depth.gain.value = 0.12;
  lfo.connect(depth).connect(engineGain.gain);
  lfo.start(t0 + 0.25);
  lfo.stop(end + 0.1);

  // Tyres on asphalt.
  const road = ctx.createBufferSource();
  road.buffer = noise;
  road.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 650;
  band.Q.value = 0.6;
  const rg = ctx.createGain();
  rg.gain.setValueAtTime(0.0001, t0 + 0.6);
  rg.gain.exponentialRampToValueAtTime(0.22, t0 + 1.6);
  rg.gain.setValueAtTime(0.22, end - 0.9);
  rg.gain.exponentialRampToValueAtTime(0.0001, end);
  road.connect(band).connect(rg).connect(out);
  road.start(t0 + 0.6);
  road.stop(end + 0.1);
}

function walk(ctx: AudioContext, out: AudioNode, seconds: number) {
  const t0 = ctx.currentTime + 0.05;
  const end = t0 + seconds;
  const noise = noiseBuffer(ctx, 2);
  // Leather soles on a concrete sidewalk: a heel click and a softer toe, about two steps a second.
  for (let t = t0 + 0.15, n = 0; t < end - 0.2; t += 0.52, n++) {
    const lvl = n % 2 ? 0.55 : 0.7;
    thump(ctx, out, t, 2600, lvl, 0.07, noise);
    thump(ctx, out, t, 140, lvl * 0.8, 0.12, noise);
    thump(ctx, out, t + 0.08, 1800, lvl * 0.35, 0.05, noise);
  }
  // A quiet street.
  const amb = ctx.createBufferSource();
  amb.buffer = noise;
  amb.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.6);
  g.gain.setValueAtTime(0.06, end - 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  amb.connect(lp).connect(g).connect(out);
  amb.start(t0);
  amb.stop(end + 0.1);
}

/** Starts the travel sound. Returns a function that fades it out. Never throws. */
export function playTravelSound(mode: TravelMode, seconds: number, volume: number, recording: string | null): () => void {
  if (typeof window === "undefined" || volume <= 0) return () => undefined;
  if (recording) {
    const a = new Audio(recording);
    a.volume = Math.min(1, volume);
    a.play().catch(() => undefined);
    return () => {
      const v0 = a.volume;
      let i = 0;
      const t = setInterval(() => {
        i++;
        a.volume = Math.max(0, v0 * (1 - i / 8));
        if (i >= 8) {
          clearInterval(t);
          a.pause();
        }
      }, 40);
    };
  }
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return () => undefined;
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return () => undefined;
  }
  const master = ctx.createGain();
  master.gain.value = Math.min(1, volume) * 0.5;
  master.connect(ctx.destination);
  try {
    if (mode === "drive") drive(ctx, master, seconds);
    else walk(ctx, master, seconds);
  } catch {
    // Sound is a nicety; the scene still plays without it.
  }
  ctx.resume().catch(() => undefined);
  let closed = false;
  return () => {
    if (closed) return;
    closed = true;
    try {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    } catch {
      /* already closed */
    }
    setTimeout(() => ctx.close().catch(() => undefined), 400);
  };
}
