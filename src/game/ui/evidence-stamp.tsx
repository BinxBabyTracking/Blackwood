"use client";

import { useEffect } from "react";
import type { ClientEvidence } from "../engine/types";

/*
 * The moment a piece of evidence is collected, from anywhere: a scene, an
 * interview, a delivery. The item comes up as a photograph, a rubber stamp
 * lands on it reading COLLECTED EVIDENCE, and it slips away. Several in a row
 * play one after another. Click to dismiss early.
 */

const SHOW_MS = 2600;

/** A rubber stamp landing on a desk: a soft thud and a short papery slap, synthesized. */
function stampSound(volume: number) {
  if (volume <= 0 || typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return;
  }
  const t = ctx.currentTime + 0.01;
  const out = ctx.createGain();
  out.gain.value = Math.min(1, volume) * 0.5;
  out.connect(ctx.destination);
  // The thud of the handle.
  const thud = ctx.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(140, t);
  thud.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.9, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  thud.connect(tg).connect(out);
  thud.start(t);
  thud.stop(t + 0.2);
  // The rubber meeting paper.
  const len = Math.floor(ctx.sampleRate * 0.08);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1800;
  band.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.value = 0.6;
  noise.connect(band).connect(ng).connect(out);
  noise.start(t);
  setTimeout(() => ctx.close().catch(() => {}), 600);
}

export function EvidenceStamp({
  item,
  words,
  volume,
  reducedMotion,
  onDone,
}: {
  item: ClientEvidence;
  words?: { photoStamp: [string, string]; collectedStamp: [string, string]; photo: string };
  volume: number;
  reducedMotion: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    // The stamp lands a beat after the photograph appears.
    const sound = setTimeout(() => stampSound(volume), reducedMotion ? 0 : 380);
    const done = setTimeout(onDone, SHOW_MS);
    return () => {
      clearTimeout(sound);
      clearTimeout(done);
    };
  }, [item.id, volume, reducedMotion, onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center p-6" aria-live="polite" data-evidence-stamp={item.id}>
      <button
        type="button"
        onClick={onDone}
        aria-label={`${item.photo ? "Photograph filed" : "Evidence collected"}: ${item.title}. Dismiss.`}
        className={`pointer-events-auto relative w-[min(78vw,340px)] bg-[#efe6d3] p-3 pb-4 text-left text-[#2a231b] shadow-[0_24px_60px_rgba(0,0,0,0.7)] ${reducedMotion ? "evidence-card-still" : "evidence-card"}`}
        style={{ animationDuration: `${SHOW_MS}ms` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="" draggable={false} className="aspect-square w-full bg-black object-cover" />
        <p className="mt-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#7a2a22]">{item.photo ? words?.photo ?? "Photograph" : item.id}</p>
        <p className="font-display text-xl leading-tight">{item.title}</p>
        <span
          aria-hidden
          className={`absolute left-1/2 top-[38%] whitespace-nowrap rounded-[6px] border-[3px] border-[#c8382c] bg-[#efe6d3]/45 px-3 py-1.5 text-center font-mono text-[1.35rem] font-bold uppercase leading-none tracking-[0.12em] text-[#c8382c] shadow-[0_0_0_1px_rgba(0,0,0,0.25)] [text-shadow:0_1px_0_rgba(0,0,0,0.35)] ${reducedMotion ? "evidence-stamp-still" : "evidence-stamp"}`}
        >
          {(item.photo ? words?.photoStamp : words?.collectedStamp)?.[0] ?? (item.photo ? "Photo" : "Collected")}
          <br />
          <span className="text-[0.95rem] tracking-[0.3em]">{(item.photo ? words?.photoStamp : words?.collectedStamp)?.[1] ?? (item.photo ? "Filed" : "Evidence")}</span>
        </span>
      </button>
    </div>
  );
}
