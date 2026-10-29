"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FaceShape, TalkingFace } from "../engine/types";
import { activeAudio } from "./audio-bus";

/*
 * A portrait that talks. Every frame is the same painting with only the mouth
 * (or, for the blink, the eyes) changed, stacked and switched in place, so
 * nothing but the mouth moves. Runs entirely in the browser: no extra
 * requests per line beyond a small timing file, and no cost per play.
 *
 * The mouth follows the line being spoken. When the voice service's timing
 * for the line is saved (when each character is spoken), it is used exactly;
 * otherwise the mouth is paced from the text across the clip's length.
 */

type Timing = { characters: string[]; starts: number[]; ends: number[] };
type Beat = { t: number; shape: FaceShape };

const timings = new Map<string, Promise<Timing | null>>();
function loadTiming(src: string): Promise<Timing | null> {
  let p = timings.get(src);
  if (!p) {
    p = fetch(`${src}&timing=1`, { credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<Timing>) : null))
      .catch(() => null);
    timings.set(src, p);
  }
  return p;
}

/** The mouth shape for one letter. Pauses close the mouth; most consonants leave it slightly open. */
function shapeOf(ch: string, hasF: boolean): FaceShape {
  const c = ch.toLowerCase();
  if ("a".includes(c)) return "ah";
  if ("eiy".includes(c)) return "ee";
  if ("o".includes(c)) return "oh";
  if ("uwq".includes(c)) return "oo";
  if ("mbp".includes(c)) return "rest";
  if ("fv".includes(c)) return hasF ? "f" : "slight";
  if (/[a-z0-9']/.test(c)) return "slight";
  return "rest";
}

/** How long a character takes, relative to a letter, when pacing from the text alone. */
function weight(ch: string) {
  if (/[.!?]/.test(ch)) return 7;
  if (/[,;:]/.test(ch)) return 4;
  if (ch === " ") return 0.8;
  return 1;
}

/**
 * Half the mouth movements: every other change of shape is skipped, so the
 * mouth moves at a natural speed rather than on every letter. A closed mouth
 * (a pause, or m, b, p) is always kept, so speech still stops and starts.
 */
function slower(beats: Beat[]): Beat[] {
  const out: Beat[] = [];
  let n = 0;
  for (const b of beats) {
    const keep = b.shape === "rest" || n++ % 2 === 0;
    if (!keep || (out.length && out[out.length - 1].shape === b.shape)) continue;
    out.push(b);
  }
  return out;
}

/** When each mouth shape starts, from the voice's timing or, without it, from the text spread over the clip. */
export function beatsFor(text: string, duration: number, timing: Timing | null, hasF: boolean): Beat[] {
  return slower(rawBeats(text, duration, timing, hasF));
}

function rawBeats(text: string, duration: number, timing: Timing | null, hasF: boolean): Beat[] {
  const out: Beat[] = [];
  const push = (t: number, shape: FaceShape) => {
    if (out.length && out[out.length - 1].shape === shape) return;
    out.push({ t, shape });
  };
  if (timing && timing.characters.length) {
    timing.characters.forEach((ch, i) => {
      // A space between words only closes the mouth if there is a real pause.
      if (ch === " " && (timing.ends[i] ?? 0) - (timing.starts[i] ?? 0) < 0.12) return;
      push(timing.starts[i], shapeOf(ch, hasF));
    });
    push(timing.ends[timing.ends.length - 1] ?? duration, "rest");
    return out;
  }
  const chars = [...text];
  const total = chars.reduce((n, ch) => n + weight(ch), 0) || 1;
  // Voice clips have a little air at each end.
  const lead = Math.min(0.15, duration * 0.05);
  const span = Math.max(0.1, duration - lead * 2);
  let at = lead;
  for (const ch of chars) {
    if (ch !== " ") push(at, shapeOf(ch, hasF));
    at += (weight(ch) / total) * span;
  }
  push(at, "rest");
  return out;
}

export function TalkingPortrait({
  face,
  alt,
  className,
  line,
}: {
  face: TalkingFace;
  alt: string;
  className: string;
  /** The line being spoken right now (its voice URL and words), or null when silent. */
  line: { src: string; text: string } | null;
}) {
  const shapes = useMemo(() => Object.keys(face) as FaceShape[], [face]);
  const [shape, setShape] = useState<FaceShape>("rest");
  const shown = useRef<FaceShape>("rest");
  const show = (sh: FaceShape) => {
    if (shown.current === sh) return;
    shown.current = sh;
    setShape(sh);
  };

  // Speaking: follow the audio clock.
  useEffect(() => {
    if (!line) {
      show("rest");
      return;
    }
    let raf = 0;
    let beats: Beat[] | null = null;
    let timing: Timing | null | undefined;
    let changedAt = 0;
    let alive = true;
    loadTiming(line.src).then((t) => {
      timing = t;
      beats = null;
    });
    const tick = () => {
      if (!alive) return;
      const a = activeAudio();
      if (a && !a.paused && Number.isFinite(a.duration) && a.duration > 0) {
        if (!beats && timing !== undefined) beats = beatsFor(line.text, a.duration, timing, Boolean(face.f));
        // Until the timing file answers (a moment), pace from the text.
        const b = beats ?? beatsFor(line.text, a.duration, null, Boolean(face.f));
        const t = a.currentTime;
        let i = 0;
        while (i + 1 < b.length && b[i + 1].t <= t) i++;
        const want = b.length && t >= b[0].t ? b[i].shape : "rest";
        // Hold each shape for at least a few frames so the mouth doesn't flutter.
        const now = performance.now();
        if (want !== shown.current && now - changedAt > 110) {
          changedAt = now;
          show(want);
        }
      } else if (shown.current !== "rest" && shown.current !== "blink") show("rest");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [line, face.f]);

  // Blinking, every few seconds, whenever the mouth is closed.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        if (shown.current === "rest") {
          show("blink");
          setTimeout(() => shown.current === "blink" && show("rest"), 140);
        }
        next();
      }, 2600 + Math.random() * 3600);
    };
    next();
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {shapes.map((sh) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={sh}
          src={face[sh]}
          alt={sh === "rest" ? alt : ""}
          aria-hidden={sh !== "rest"}
          draggable={false}
          className={`absolute inset-0 ${className}`}
          // The closed-mouth portrait always stays underneath, so a frame still decoding never shows a gap.
          style={{ opacity: sh === "rest" || sh === shape ? 1 : 0 }}
        />
      ))}
    </>
  );
}
