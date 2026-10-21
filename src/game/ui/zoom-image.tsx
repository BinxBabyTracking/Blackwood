"use client";

import { useRef, useState } from "react";

/** Straight-on evidence view with wheel/button zoom and drag to pan. */
export function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const setZ = (z: number) => {
    const next = Math.min(4, Math.max(1, Math.round(z * 100) / 100));
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex items-center overflow-hidden bg-black lg:h-full">
      <div
        className={`aspect-[4/3] w-full touch-none select-none ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        onWheel={(e) => setZ(zoom - e.deltaY * 0.0015)}
        onDoubleClick={() => setZ(zoom > 1 ? 1 : 2.2)}
        onPointerDown={(e) => {
          if (zoom === 1) return;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const limit = (zoom - 1) * 50;
          setPan({
            x: Math.max(-limit, Math.min(limit, drag.current.px + ((e.clientX - drag.current.x) / zoom) * 0.25)),
            y: Math.max(-limit, Math.min(limit, drag.current.py + ((e.clientY - drag.current.y) / zoom) * 0.25)),
          });
        }}
        onPointerUp={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full object-contain transition-transform duration-100"
          style={{ transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)` }}
        />
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-[2px] bg-black/70 p-1 text-xs text-paper">
        <button type="button" className="px-2 py-1 hover:text-brass" onClick={() => setZ(zoom - 0.5)} aria-label="Zoom out">
          −
        </button>
        <span className="w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <button type="button" className="px-2 py-1 hover:text-brass" onClick={() => setZ(zoom + 0.5)} aria-label="Zoom in">
          +
        </button>
      </div>
    </div>
  );
}
