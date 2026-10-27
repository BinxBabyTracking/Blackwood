"use client";

import { useEffect, useMemo, useState } from "react";
import { seriesBoard } from "@/app/actions/series";
import type { SeriesView } from "@/series/server";

/*
 * The series' last shot: a slow pass across the player's own rolling board,
 * exactly as they left it. Never a prearranged board: if they pinned three
 * cards, the camera finds three cards. Drawn read-only, in the board's own
 * units (0 to 200 both ways, see board.tsx).
 */

const PAGE_W = 1600;
const PAGE_H = 1000;
const CARD_W = 150;
const CARD_H = 130;
const ux = (x: number) => (x / 100) * PAGE_W;
const uy = (y: number) => (y / 100) * PAGE_H;
const tilt = (id: string) => ((id.charCodeAt(id.length - 1) % 7) - 3) * 0.8;

export function BoardPan({ seriesId, reducedMotion }: { seriesId: string; reducedMotion: boolean }) {
  const [view, setView] = useState<SeriesView | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    seriesBoard(seriesId)
      .then((r) => live && ("view" in r ? setView(r.view) : setFailed(true)))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [seriesId]);

  const shot = useMemo(() => {
    if (!view || !view.board.items.length) return null;
    const byId = new Map(view.items.map((i) => [i.id, i]));
    const cards = view.board.items.filter((i) => byId.has(i.id));
    if (!cards.length) return null;
    // The frame: everything pinned, with a margin, at the board's aspect.
    const xs = cards.map((c) => ux(c.x));
    const ys = cards.map((c) => uy(c.y));
    const pad = 120;
    const minX = Math.max(0, Math.min(...xs) - pad);
    const minY = Math.max(0, Math.min(...ys) - pad);
    const maxX = Math.max(...xs) + CARD_W + pad;
    const maxY = Math.max(...ys) + CARD_H + pad;
    const strings = view.board.connections
      .map(([a, b]) => {
        const p = cards.find((c) => c.id === a);
        const q = cards.find((c) => c.id === b);
        if (!p || !q) return null;
        const x1 = ux(p.x) + CARD_W / 2;
        const y1 = uy(p.y) + 10;
        const x2 = ux(q.x) + CARD_W / 2;
        const y2 = uy(q.y) + 10;
        const sag = Math.min(80, Math.hypot(x2 - x1, y2 - y1) / 6);
        return { key: `${a}-${b}`, d: `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}` };
      })
      .filter(Boolean) as { key: string; d: string }[];
    return { cards, byId, minX, minY, w: maxX - minX, h: maxY - minY, strings };
  }, [view]);

  if (failed) return null;
  if (!view) return <p className="mt-6 text-sm text-smoke">The camera turns to the rolling board.</p>;
  if (!shot) return <p className="mt-6 text-sm text-smoke">The rolling board stands in the corner of the office, as bare as the day it was wheeled in.</p>;

  // Start close on the first card pinned, then pull back to the whole board.
  const first = shot.cards[0];
  const startScale = Math.min(3, shot.w / (CARD_W * 3));
  const fx = ((ux(first.x) + CARD_W / 2 - shot.minX) / shot.w) * 100;
  const fy = ((uy(first.y) + CARD_H / 2 - shot.minY) / shot.h) * 100;

  return (
    <figure className="mt-6">
      <div className="relative w-full overflow-hidden rounded-[3px] border-[6px] border-[#8f969c] bg-[#c8b28a]" style={{ aspectRatio: `${shot.w} / ${shot.h}` }}>
        <svg
          viewBox={`${shot.minX} ${shot.minY} ${shot.w} ${shot.h}`}
          className={`absolute inset-0 h-full w-full ${reducedMotion ? "" : "board-pan"}`}
          style={{ transformOrigin: `${fx}% ${fy}%`, ["--pan-start" as string]: String(startScale) }}
          role="img"
          aria-label={`Your rolling board: ${shot.cards.length} cards, ${shot.strings.length} strings.`}
        >
          {shot.cards.map((c) => {
            const it = shot.byId.get(c.id)!;
            const x = ux(c.x);
            const y = uy(c.y);
            return (
              <g key={c.id} transform={`rotate(${tilt(c.id)} ${x + CARD_W / 2} ${y + CARD_H / 2})`}>
                <rect x={x} y={y} width={CARD_W} height={CARD_H} fill="#f6f1e3" stroke="#00000033" />
                <image href={it.image} x={x + 6} y={y + 6} width={CARD_W - 12} height={CARD_H - 40} preserveAspectRatio="xMidYMid slice" />
                <text x={x + 8} y={y + CARD_H - 20} fontFamily="Georgia, serif" fontSize="13" fill="#2a241c">
                  {it.title.length > 22 ? `${it.title.slice(0, 21)}…` : it.title}
                </text>
                <text x={x + 8} y={y + CARD_H - 6} fontFamily="ui-monospace, monospace" fontSize="10" fill="#7d3a33">
                  {it.tag}
                </text>
                <circle cx={x + CARD_W / 2} cy={y + 10} r="6" fill="#a5281f" />
              </g>
            );
          })}
          {shot.strings.map((s) => (
            <path key={s.key} d={s.d} fill="none" stroke="#a5281f" strokeWidth="3" />
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm text-smoke">
        Your rolling board, as you left it: {shot.cards.length} {shot.cards.length === 1 ? "card" : "cards"} and {shot.strings.length} {shot.strings.length === 1 ? "string" : "strings"}, from six investigations.
      </figcaption>
    </figure>
  );
}
