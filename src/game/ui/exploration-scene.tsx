"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ClientView } from "../engine/types";

type Hotspot = ClientView["location"]["hotspots"][number];

/** Each painted object's opacity, sampled small, so a click on its transparent corners reaches what lies beneath. */
type Mask = { w: number; h: number; a: Uint8ClampedArray };
const masks = new Map<string, Mask | "loading">();
function loadMask(url: string, done: () => void) {
  if (masks.has(url)) return;
  masks.set(url, "loading");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const k = Math.min(1, 160 / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k));
      const h = Math.max(1, Math.round(img.naturalHeight * k));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.drawImage(img, 0, 0, w, h);
      const px = g.getImageData(0, 0, w, h).data;
      const a = new Uint8ClampedArray(w * h);
      for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3];
      masks.set(url, { w, h, a });
      done();
    } catch {
      /* unreadable image: the whole rectangle stays clickable */
    }
  };
  img.src = url;
}

/** Whether a point (fractions of the hotspot's box) lands on the painted object, drawn contained in that box. */
function onPaint(h: Hotspot, fx: number, fy: number, box: { w: number; h: number }) {
  const m = h.sprite ? masks.get(h.sprite) : undefined;
  if (!m || m === "loading") return true;
  // object-contain: the image fills one dimension of the box and is centered (people stand on the bottom edge).
  const s = Math.min(box.w / m.w, box.h / m.h);
  const iw = (m.w * s) / box.w;
  const ih = (m.h * s) / box.h;
  const ox = (1 - iw) / 2;
  const oy = h.figure ? 1 - ih : (1 - ih) / 2;
  const x = (fx - ox) / iw;
  const y = (fy - oy) / ih;
  if (x < 0 || y < 0 || x >= 1 || y >= 1) return false;
  // A little forgiveness around the edges, so thin parts are not fiddly to hit.
  const cx = Math.floor(x * m.w);
  const cy = Math.floor(y * m.h);
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const px = cx + dx;
      const py = cy + dy;
      if (px >= 0 && py >= 0 && px < m.w && py < m.h && m.a[py * m.w + px] > 40) return true;
    }
  return false;
}

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
  z,
  hot = false,
}: {
  hotspot: Hotspot;
  disabled: boolean;
  reducedMotion?: boolean;
  /** Stacking order for painted objects: the one handled last lies on top. */
  z?: number;
  /** The pointer is over this object's painted pixels (painted objects only). */
  hot?: boolean;
  onSelect: (id: string) => void;
  onHover: (label: string | null) => void;
}) {
  const r = hotspot.rect;
  const painted = Boolean(hotspot.sprite);
  const label = hotspot.collected ? `${hotspot.label} (collected)` : hotspot.inspected ? `${hotspot.label} (examined)` : hotspot.label;
  return (
    <button
      type="button"
      aria-label={label}
      data-hotspot={hotspot.id}
      data-attention={hotspot.attention || undefined}
      disabled={disabled}
      onClick={() => onSelect(hotspot.id)}
      onMouseEnter={painted ? undefined : () => onHover(label)}
      onMouseLeave={painted ? undefined : () => onHover(null)}
      onFocus={() => onHover(label)}
      onBlur={() => onHover(null)}
      className={`absolute rounded-[3px] outline-none transition-[background-color,box-shadow,filter] duration-300 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-[#f3ede3]/70 disabled:cursor-wait ${
        painted
          ? `pointer-events-none ${hot ? "brightness-[1.12]" : ""}`
          : "cursor-pointer hover:bg-[#f3ede3]/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(243,237,227,0.22)]"
      }`}
      style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, zIndex: z }}
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
      {hotspot.attention ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[3px] ${
            hotspot.callout
              ? reducedMotion
                ? "shadow-[0_0_0_2px_rgba(196,163,107,0.8)]"
                : "game-guide"
              : reducedMotion
                ? "shadow-[0_0_0_1px_rgba(196,163,107,0.5)]"
                : "game-attention"
          }`}
        />
      ) : null}
      {hotspot.callout ? <Callout text={hotspot.callout} reducedMotion={reducedMotion} align={r.x + r.w / 2 < 18 ? "left" : r.x + r.w / 2 > 82 ? "right" : "center"} /> : null}
    </button>
  );
}

/** A pointer under a hotspot for a first-time player. "Tap" reads "Click" where there is a mouse. */
function Callout({ text, reducedMotion, align }: { text: string; reducedMotion: boolean; align: "left" | "center" | "right" }) {
  const tap = /^Tap\b/.test(text);
  const rest = tap ? text.slice(3) : text;
  // Near the edge of the scene the label hangs from that side instead of the middle, so it stays on screen.
  const place = align === "left" ? "left-10 items-start" : align === "right" ? "right-10 items-end" : "left-1/2 -translate-x-1/2 items-center";
  return (
    <span aria-hidden className={`pointer-events-none absolute top-full z-10 mt-2 flex flex-col ${place} ${reducedMotion ? "" : align === "center" ? "game-callout" : "game-callout-side"}`}>
      <span className={`h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent border-b-brass ${align === "left" ? "ml-6" : align === "right" ? "mr-6" : ""}`} />
      <span className="whitespace-nowrap rounded-[2px] bg-brass px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink shadow-[0_4px_14px_rgba(0,0,0,0.6)] sm:text-xs">
        {tap ? (
          <>
            <span className="pointer-fine:hidden">Tap</span>
            <span className="hidden pointer-fine:inline">Click</span>
          </>
        ) : null}
        {rest}
      </span>
    </span>
  );
}

/**
 * A full-bleed 16:9 location: background art, hotspots from case data, the
 * location caption, and a subtle 2.5D drift that follows the pointer.
 *
 * On a tall screen (a phone held upright, a tablet in portrait) the room is
 * shown at full height and the player swipes sideways to look around it,
 * the way you would turn your head in the room.
 */
export function ExplorationScene({
  location,
  disabled,
  reducedMotion,
  onHotspot,
  overlays,
  underlays,
  stack = [],
}: {
  /** Pinned to the scene surface, under any painted object placed on top (a grayed-out spot for lab results). */
  underlays?: React.ReactNode;
  /** Hotspot ids in the order they were last handled; later ones lie on top. */
  stack?: string[];
  location: ClientView["location"];
  disabled: boolean;
  reducedMotion: boolean;
  onHotspot: (id: string) => void;
  /** Extra things pinned to the scene, positioned in scene percentages (lab countdowns). */
  overlays?: React.ReactNode;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [hotId, setHotId] = useState<string | null>(null);
  const [, setMasksLoaded] = useState(0);
  const layer = useRef<HTMLDivElement>(null);

  // Painted objects stack like things on a desk: nearer the front (lower on screen) lies over what is behind,
  // and anything handled goes on top, the most recent highest.
  const painted = location.hotspots.filter((h) => h.sprite);
  const zOf = new Map(
    [...painted]
      .sort((a, b) => {
        const sa = stack.indexOf(a.id);
        const sb = stack.indexOf(b.id);
        if (sa !== sb) return sa - sb;
        return a.rect.y + a.rect.h - (b.rect.y + b.rect.h);
      })
      .map((h, i) => [h.id, i + 1]),
  );
  const spriteKey = painted.map((h) => h.sprite).join("|");
  useEffect(() => {
    for (const url of spriteKey ? spriteKey.split("|") : []) loadMask(url, () => setMasksLoaded((n) => n + 1));
  }, [spriteKey]);

  /** The topmost painted object under a screen point, judged by its pixels rather than its rectangle. */
  const paintedAt = (clientX: number, clientY: number): Hotspot | null => {
    const el = layer.current;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const px = ((clientX - b.left) / b.width) * 100;
    const py = ((clientY - b.top) / b.height) * 100;
    const byZ = [...painted].sort((a, c) => (zOf.get(c.id) ?? 0) - (zOf.get(a.id) ?? 0));
    for (const h of byZ) {
      const r = h.rect;
      if (px < r.x || py < r.y || px >= r.x + r.w || py >= r.y + r.h) continue;
      if (onPaint(h, (px - r.x) / r.w, (py - r.y) / r.h, { w: (r.w * b.width) / 100, h: (r.h * b.height) / 100 })) return h;
    }
    return null;
  };
  const labelOf = (h: Hotspot) => (h.collected ? `${h.label} (collected)` : h.inspected ? `${h.label} (examined)` : h.label);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  /** Look-around mode: the screen is too narrow to show the whole room at a useful size. */
  const [pan, setPan] = useState(false);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setPan(el.clientWidth / Math.max(el.clientHeight, 1) < 1.4);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 8, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8 });
  };

  // Each room opens looking at its middle.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // A first-time pointer (the map on the wall) is brought into view; otherwise the room opens at its middle.
    const guide = location.hotspots.find((h) => h.callout);
    el.scrollLeft = !pan ? 0 : guide ? ((guide.rect.x + guide.rect.w / 2) / 100) * el.scrollWidth - el.clientWidth / 2 : (el.scrollWidth - el.clientWidth) / 2;
    updateEdges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan, location.id]);

  const look = (dir: -1 | 1) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const caption = (
    <div key={location.id} className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-5 game-caption">
      <p className="font-display text-xl text-paper drop-shadow sm:text-3xl">{location.name}</p>
      <p className="font-mono text-[0.7rem] tracking-wide text-paper/70 sm:text-xs">{location.subtitle}</p>
    </div>
  );
  const label = (
    <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center" aria-hidden>
      <span className={`rounded-[2px] bg-black/60 px-3 py-1 font-mono text-xs tracking-wide transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>
        {hover ?? ""}
      </span>
    </div>
  );

  return (
    <div ref={wrap} className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={scroller}
        onScroll={updateEdges}
        data-look-around={pan || undefined}
        className={`absolute inset-0 flex items-center ${pan ? "no-scrollbar justify-start overflow-x-auto overflow-y-hidden overscroll-x-contain" : "justify-center overflow-hidden"}`}
      >
        <div
          className={pan ? "relative h-full flex-none overflow-hidden" : "relative aspect-video max-h-full w-full max-w-[calc(100dvh*16/9)] overflow-hidden"}
          style={pan ? { aspectRatio: "16 / 9" } : undefined}
          onMouseMove={(e) => {
            if (reducedMotion || pan) return;
            const b = e.currentTarget.getBoundingClientRect();
            setTilt({ x: (e.clientX - b.left) / b.width - 0.5, y: (e.clientY - b.top) / b.height - 0.5 });
          }}
          onMouseLeave={() => setHover(null)}
        >
          <div
            key={location.background}
            ref={layer}
            onClickCapture={(e) => {
              // A click on a painted object goes to the topmost one actually painted there.
              if (disabled || e.detail === 0) return;
              const h = paintedAt(e.clientX, e.clientY);
              if (!h) return;
              e.stopPropagation();
              e.preventDefault();
              onHotspot(h.id);
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const h = paintedAt(e.clientX, e.clientY);
              if ((h?.id ?? null) !== hotId) {
                setHotId(h?.id ?? null);
                if (h) setHover(labelOf(h));
                else setHover(null);
              }
            }}
            onPointerLeave={() => setHotId(null)}
            style={{
              transform: reducedMotion || pan ? undefined : `scale(1.04) translate(${-tilt.x * 1.2}%, ${-tilt.y * 0.8}%)`,
              transition: "transform 400ms ease-out",
              cursor: hotId ? "pointer" : undefined,
            }}
            className={`absolute inset-0 ${reducedMotion ? "" : "game-scene-in"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={location.background} alt={`${location.name}, ${location.subtitle}`} className="h-full w-full object-cover" draggable={false} />
            {/* Pinned extras (lab countdowns) lie on the surface, under anything placed on top of them. */}
            <div className="pointer-events-none absolute inset-0">{underlays}</div>
            {location.hotspots.map((h) => (
              <SceneHotspot
                key={h.id}
                hotspot={h}
                disabled={disabled}
                onSelect={onHotspot}
                onHover={setHover}
                reducedMotion={reducedMotion}
                z={zOf.get(h.id)}
                hot={hotId === h.id}
              />
            ))}
            <div className="pointer-events-none absolute inset-0" style={{ zIndex: painted.length + 1 }}>
              {overlays}
            </div>

          </div>
          {pan ? null : caption}
          {pan ? null : label}
        </div>
      </div>

      {pan ? (
        <>
          {caption}
          {label}
          {/* Edge cues: a soft shade and an arrow that turns the view, shown while there is more room that way. */}
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-label={side === "left" ? "Look left" : "Look right"}
              onClick={() => look(side === "left" ? -1 : 1)}
              className={`absolute inset-y-0 ${side === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} flex w-10 items-center justify-center from-black/55 to-transparent text-paper/80 transition-opacity duration-300 ${edges[side] ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <span aria-hidden className="font-mono text-2xl leading-none">{side === "left" ? "\u2039" : "\u203a"}</span>
            </button>
          ))}
          <p key={`hint-${location.id}`} className="pointer-events-none absolute inset-x-0 bottom-28 text-center font-mono text-xs text-paper/80 look-hint">
            <span className="rounded-[2px] bg-black/55 px-3 py-1">Swipe to look around</span>
          </p>
        </>
      ) : null}
    </div>
  );
}
