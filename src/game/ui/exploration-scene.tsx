"use client";

import { useState } from "react";
import type { ClientView } from "../engine/types";

type Hotspot = ClientView["location"]["hotspots"][number];

/**
 * One clickable object anchored to its place in the scene art. Feedback is
 * deliberately quiet: a faint lift in brightness and a hairline edge on hover,
 * a dashed outline for keyboard focus, and the object's name in the caption.
 */
export function SceneHotspot({
  hotspot,
  disabled,
  onSelect,
  onHover,
  reducedMotion = false,
}: {
  hotspot: Hotspot;
  disabled: boolean;
  reducedMotion?: boolean;
  onSelect: (id: string) => void;
  onHover: (label: string | null) => void;
}) {
  const r = hotspot.rect;
  const label = hotspot.collected ? `${hotspot.label} (collected)` : hotspot.inspected ? `${hotspot.label} (examined)` : hotspot.label;
  return (
    <button
      type="button"
      aria-label={label}
      data-hotspot={hotspot.id}
      data-attention={hotspot.attention || undefined}
      disabled={disabled}
      onClick={() => onSelect(hotspot.id)}
      onMouseEnter={() => onHover(label)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(label)}
      onBlur={() => onHover(null)}
      className="absolute cursor-pointer rounded-[3px] outline-none transition-[background-color,box-shadow] duration-300 hover:bg-[#f3ede3]/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(243,237,227,0.22)] focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-[#f3ede3]/70 disabled:cursor-wait"
      style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
    >
      {hotspot.sprite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hotspot.sprite} alt="" draggable={false} className={`pointer-events-none h-full w-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)] ${hotspot.figure ? "object-bottom" : ""}`} />
      ) : null}
      {hotspot.pending ? (
        // Stand-in until this object's painting is added: a faint outline with its name.
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-end overflow-hidden rounded-[3px] border border-dashed border-[#f3ede3]/40 bg-black/25">
          <span className="truncate px-1 pb-0.5 font-mono text-[0.6rem] leading-tight text-[#f3ede3]/80">{hotspot.label}</span>
        </span>
      ) : null}
      {hotspot.attention ? <span aria-hidden className={`pointer-events-none absolute inset-0 rounded-[3px] ${reducedMotion ? "shadow-[0_0_0_1px_rgba(196,163,107,0.5)]" : "game-attention"}`} /> : null}
    </button>
  );
}

/**
 * A full-bleed 16:9 location: background art, hotspots from case data, the
 * location caption, and a subtle 2.5D drift that follows the pointer.
 */
export function ExplorationScene({
  location,
  disabled,
  reducedMotion,
  onHotspot,
}: {
  location: ClientView["location"];
  disabled: boolean;
  reducedMotion: boolean;
  onHotspot: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <div
        className="relative aspect-video max-h-full w-full max-w-[calc(100dvh*16/9)] overflow-hidden"
        onMouseMove={(e) => {
          if (reducedMotion) return;
          const b = e.currentTarget.getBoundingClientRect();
          setTilt({ x: (e.clientX - b.left) / b.width - 0.5, y: (e.clientY - b.top) / b.height - 0.5 });
        }}
        onMouseLeave={() => setHover(null)}
      >
        <div
          key={location.background}
          className={`absolute inset-0 ${reducedMotion ? "" : "game-scene-in"}`}
          style={{
            transform: reducedMotion ? undefined : `scale(1.04) translate(${-tilt.x * 1.2}%, ${-tilt.y * 0.8}%)`,
            transition: "transform 400ms ease-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={location.background} alt={`${location.name}, ${location.subtitle}`} className="h-full w-full object-cover" draggable={false} />
          {location.hotspots.map((h) => (
            <SceneHotspot key={h.id} hotspot={h} disabled={disabled} onSelect={onHotspot} onHover={setHover} reducedMotion={reducedMotion} />
          ))}
        </div>

        <div key={location.id} className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-5 game-caption">
          <p className="font-display text-xl text-paper drop-shadow sm:text-3xl">{location.name}</p>
          <p className="font-mono text-[0.7rem] tracking-wide text-paper/70 sm:text-xs">{location.subtitle}</p>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center" aria-hidden>
          <span className={`rounded-[2px] bg-black/60 px-3 py-1 font-mono text-xs tracking-wide transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>
            {hover ?? ""}
          </span>
        </div>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 hidden text-center font-mono text-xs text-smoke portrait:block sm:portrait:hidden">
        Turn your phone sideways for a larger view.
      </p>
    </div>
  );
}
