"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { ClientView, GameAction } from "../engine/types";

type Dispatch = (a: GameAction) => Promise<unknown>;

/** What the board needs to draw: a case's view, or the rolling board's (a series' second board), which supplies the same fields. */
export type BoardView = Pick<ClientView, "board" | "evidence" | "characters" | "deductions" | "boardSections" | "caseId" | "status" | "words" | "theme">;

/**
 * The board is drawn at a fixed size and scaled to the zoom. Positions are kept
 * in units: 0 to 100 across and down is the first page (the size the board used
 * to be, so older boards open unchanged), and the board runs to 200 both ways.
 */
const PAGE_W = 1600;
const PAGE_H = 1000;
const BOARD_W = PAGE_W * 2;
const BOARD_H = PAGE_H * 2;
const CARD_W = 150;
const MAX_ZOOM = 1.6;
/** The furthest a card's corner may go, leaving the card on the board. */
const MAX_X = 200 - (CARD_W / PAGE_W) * 100;
const MAX_Y = 200 - 14;
/** The wooden frame around the cork, in board pixels. */
const FRAME = 26;
const ux = (x: number) => (x / 100) * PAGE_W;
const uy = (y: number) => (y / 100) * PAGE_H;
const tilt = (id: string) => ((id.charCodeAt(id.length - 1) % 7) - 3) * 0.8;

/**
 * Full-screen corkboard. Pin collected evidence and the people involved, drag
 * them around, and tie red string between two items to test a connection.
 * Connections are judged on the server; a wrong one is simply left as string.
 */
export function MurderBoard({
  view,
  dispatch,
  onClose,
  onLocalBoard,
  title,
  rolling = false,
  emptyText = "The board is empty. Pin evidence and the people involved from the tray.",
  headerExtra,
}: {
  view: BoardView;
  dispatch: Dispatch;
  onClose: () => void;
  onLocalBoard: (board: ClientView["board"]) => void;
  /** The heading, when it isn't the case's own board. */
  title?: string;
  /** The rolling board: a steel frame on wheels instead of the wooden wall board. */
  rolling?: boolean;
  emptyText?: string;
  /** Extra controls in the header (the series notebook). */
  headerExtra?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [selectedString, setSelectedString] = useState<[string, string] | null>(null);
  const [trayOpen, setTrayOpen] = useState(true);
  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
    sx: number;
    sy: number;
    moved: boolean;
  } | null>(null);
  const readOnly = view.status === "closed";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (linkFrom) setLinkFrom(null);
      else if (selectedString) setSelectedString(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [linkFrom, selectedString, onClose]);

  const viewport = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [baseZoom, setBaseZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.2);
  const [panning, setPanning] = useState(false);
  const pan = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  /** Scroll to apply once the board has been drawn at a new zoom, so zooming holds the point under the pointer. */
  const anchor = useRef<{ left: number; top: number } | null>(null);
  const zoomKey = `bw-board-zoom-${view.caseId}`;

  // The opening zoom shows the first quarter of the board (where everything was pinned before the board grew) at a comfortable size.
  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const base = Math.max(Math.min(w / PAGE_W, h / PAGE_H), Math.min(0.55, h / PAGE_H));
      const min = Math.min(w / (BOARD_W + FRAME * 2), h / (BOARD_H + FRAME * 2), base);
      setBaseZoom(base);
      setMinZoom(min);
      return { base, min };
    };
    const { base, min } = measure();
    let saved = NaN;
    try {
      saved = Number(localStorage.getItem(zoomKey));
    } catch {
      /* storage blocked */
    }
    setZoom(Number.isFinite(saved) && saved > 0 ? Math.min(MAX_ZOOM, Math.max(min, saved)) : base);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoomKey]);

  useLayoutEffect(() => {
    const el = viewport.current;
    if (el && anchor.current) {
      el.scrollLeft = anchor.current.left;
      el.scrollTop = anchor.current.top;
      anchor.current = null;
    }
    try {
      localStorage.setItem(zoomKey, String(zoom));
    } catch {
      /* fine */
    }
  }, [zoom, zoomKey]);

  /** Zooms to z, keeping the board point under (ax, ay) in the viewport where it is. */
  const zoomTo = (z: number, ax?: number, ay?: number) => {
    const el = viewport.current;
    if (!el) return;
    const next = Math.min(MAX_ZOOM, Math.max(minZoom, z));
    const x = ax ?? el.clientWidth / 2;
    const y = ay ?? el.clientHeight / 2;
    const bx = (el.scrollLeft + x) / zoom;
    const by = (el.scrollTop + y) / zoom;
    anchor.current = { left: bx * next - x, top: by * next - y };
    setZoom(next);
  };
  const zoomBy = (f: number) => zoomTo(zoom * f);
  const fitAll = () => {
    anchor.current = { left: 0, top: 0 };
    setZoom(Math.abs(zoom - minZoom) < 0.001 ? baseZoom : minZoom);
  };

  const items = view.board.items;
  const onBoard = new Set(items.map((i) => i.id));
  const meta = (id: string) => {
    const e = view.evidence.find((x) => x.id === id);
    if (e) return { title: e.title, image: e.image, tag: e.label, person: false };
    const c = view.characters.find((x) => x.id === id);
    return {
      title: c?.name ?? id,
      image: c?.portrait ?? "",
      tag: c?.role ?? "",
      person: true,
    };
  };
  const tray = [
    ...view.characters.filter((c) => c.onBoard && !onBoard.has(c.id)).map((c) => c.id),
    ...view.evidence.filter((e) => e.boardable && !onBoard.has(e.id)).map((e) => e.id),
  ];

  /** A screen point in board units: 100 units across and down is the board's first page; the whole board is 200 by 200. */
  const pct = (clientX: number, clientY: number) => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 200,
      y: ((clientY - r.top) / r.height) * 200,
    };
  };

  /** Where a card's pin sits, in board pixels. */
  const pinPoint = (id: string) => {
    const it = items.find((i) => i.id === id)!;
    return {
      x: (it.x / 100) * PAGE_W + CARD_W / 2,
      y: (it.y / 100) * PAGE_H + 7,
    };
  };

  // Each string hangs pin to pin with a slight sag, as yarn does.
  const strings = view.board.connections
    .filter(([a, b]) => onBoard.has(a) && onBoard.has(b))
    .map(([a, b]) => {
      const p = pinPoint(a);
      const q = pinPoint(b);
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      const sag = Math.min(40, len * 0.06);
      const d = `M ${p.x} ${p.y} Q ${(p.x + q.x) / 2} ${(p.y + q.y) / 2 + sag} ${q.x} ${q.y}`;
      const sel = Boolean(selectedString && ((selectedString[0] === a && selectedString[1] === b) || (selectedString[0] === b && selectedString[1] === a)));
      return { a, b, d, sel };
    });

  const clickCard = (id: string) => {
    if (readOnly) return;
    if (!linkFrom) {
      setLinkFrom(id);
      return;
    }
    if (linkFrom === id) {
      setLinkFrom(null);
      return;
    }
    const exists = view.board.connections.some(([a, b]) => (a === linkFrom && b === id) || (a === id && b === linkFrom));
    if (!exists) {
      onLocalBoard({
        ...view.board,
        connections: [...view.board.connections, [linkFrom, id]],
      });
      dispatch({ type: "connect", a: linkFrom, b: id });
    }
    setLinkFrom(null);
  };

  return (
    <div className={`fixed inset-0 z-40 flex flex-col game-fade ${rolling ? "board-rolling bg-[#1b1e21]" : "bg-[#2b2118]"}`} role="dialog" aria-modal="true" aria-label={title ?? view.words.board}>
      <div className="flex items-center justify-between gap-3 border-b border-black/40 bg-[#1d1610] px-4 py-2 text-sm text-paper">
        <p className="font-serif text-lg">{title ?? (view.theme === "medieval" ? view.words.board : "Murder Board")}</p>
        <p className="hidden text-xs text-smoke md:block" aria-live="polite">
          {readOnly
            ? "This case is closed. The board is kept as you left it."
            : linkFrom
              ? `Choose a second item to tie to ${meta(linkFrom).title}. Esc to cancel.`
              : "Drag to arrange, drag the cork to move around, and zoom out for more room. Click one item, then another, to tie them with string."}
        </p>
        <div className="hidden items-center gap-3 md:flex">
          {headerExtra}
          {!readOnly ? (
            <button type="button" onClick={() => setTrayOpen((o) => !o)} className="text-smoke hover:text-paper">
              {trayOpen ? "Hide tray" : `Pin items (${tray.length})`}
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="text-smoke underline-offset-4 hover:text-paper hover:underline">
            Step back
          </button>
        </div>
      </div>

      {readOnly ? null : (
        <p
          className={`px-4 py-1.5 text-center text-xs md:hidden ${linkFrom ? "bg-[#ffdf9e] font-semibold text-[#2a1d10]" : "bg-[#1d1610] text-smoke"}`}
          aria-live="polite"
        >
          {linkFrom
            ? `Now tap a second item to tie to ${meta(linkFrom).title}.`
            : "Tap one item, then another, to tie them with string. Drag the cork to move around; pinch to zoom."}
        </p>
      )}
      {/* On a phone the tray sits along the bottom, so the board keeps the full width. */}
      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#3a2a1c]">
          <div
            ref={viewport}
            className="board-scroll absolute inset-0 overflow-auto"
            style={{
              touchAction: "none",
              cursor: panning ? "grabbing" : "grab",
            }}
            onWheel={(e) => {
              // Pinch on a trackpad, or Ctrl/Cmd and the wheel: zoom around the pointer. A plain wheel scrolls.
              if (!e.ctrlKey && !e.metaKey) return;
              e.preventDefault();
              const b = viewport.current!.getBoundingClientRect();
              zoomTo(zoom * Math.exp(-e.deltaY * 0.0025), e.clientX - b.left, e.clientY - b.top);
            }}
            onPointerDown={(e) => {
              touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
              if (touches.current.size === 2) {
                // A second finger: pinch to zoom. Whatever the first finger was doing stops.
                drag.current = null;
                pan.current = null;
                const [a, c] = [...touches.current.values()];
                pinch.current = {
                  dist: Math.hypot(a.x - c.x, a.y - c.y),
                  zoom,
                };
                return;
              }
              if ((e.target as HTMLElement).closest("[data-card],[data-string]")) return;
              const el = viewport.current!;
              pan.current = {
                x: e.clientX,
                y: e.clientY,
                left: el.scrollLeft,
                top: el.scrollTop,
              };
              setPanning(true);
              setSelectedString(null);
            }}
            onPointerMove={(e) => {
              if (touches.current.has(e.pointerId))
                touches.current.set(e.pointerId, {
                  x: e.clientX,
                  y: e.clientY,
                });
              const pz = pinch.current;
              if (pz && touches.current.size >= 2) {
                const [a, c] = [...touches.current.values()];
                const b = viewport.current!.getBoundingClientRect();
                zoomTo(pz.zoom * (Math.hypot(a.x - c.x, a.y - c.y) / Math.max(pz.dist, 1)), (a.x + c.x) / 2 - b.left, (a.y + c.y) / 2 - b.top);
                return;
              }
              const pn = pan.current;
              if (pn) {
                const el = viewport.current!;
                el.scrollLeft = pn.left - (e.clientX - pn.x);
                el.scrollTop = pn.top - (e.clientY - pn.y);
                return;
              }
              const d = drag.current;
              if (!d) return;
              // A finger always wobbles a little: only a real movement is a drag, anything less is a tap.
              if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < (e.pointerType === "mouse" ? 4 : 12)) return;
              const p = pct(e.clientX, e.clientY);
              d.moved = true;
              onLocalBoard({
                ...view.board,
                items: items.map((i) =>
                  i.id === d.id
                    ? {
                        ...i,
                        x: Math.min(MAX_X, Math.max(0, p.x - d.dx)),
                        y: Math.min(MAX_Y, Math.max(0, p.y - d.dy)),
                      }
                    : i,
                ),
              });
            }}
            onPointerUp={(e) => {
              touches.current.delete(e.pointerId);
              if (touches.current.size < 2) pinch.current = null;
              if (pan.current) {
                pan.current = null;
                setPanning(false);
              }
              const d = drag.current;
              drag.current = null;
              if (!d) return;
              if (d.moved) {
                const it = items.find((i) => i.id === d.id)!;
                dispatch({ type: "boardMove", itemId: d.id, x: it.x, y: it.y });
              } else clickCard(d.id);
            }}
            onPointerCancel={(e) => {
              touches.current.delete(e.pointerId);
              pinch.current = null;
              pan.current = null;
              drag.current = null;
              setPanning(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (!id || readOnly) return;
              const p = pct(e.clientX, e.clientY);
              dispatch({
                type: "boardAdd",
                itemId: id,
                x: p.x - 5,
                y: p.y - 5,
              });
            }}
          >
            {/* The sizer takes the board's size at this zoom, so the scrollbars match; the board itself is drawn at full size and scaled. */}
            <div
              style={{
                width: (BOARD_W + FRAME * 2) * zoom,
                height: (BOARD_H + FRAME * 2) * zoom,
              }}
              className="relative"
            >
              <div
                className="board-frame absolute left-0 top-0 origin-top-left"
                style={{
                  width: BOARD_W + FRAME * 2,
                  height: BOARD_H + FRAME * 2,
                  transform: `scale(${zoom})`,
                }}
              >
                <div
                  ref={ref}
                  className="board-cork absolute"
                  style={{
                    left: FRAME,
                    top: FRAME,
                    width: BOARD_W,
                    height: BOARD_H,
                  }}
                >
                  {/* Labeled sections, once a case opens a second one: strips of tape across the cork. Cards and string can cross them. */}
                  {view.boardSections.length > 1
                    ? view.boardSections.map((sec, i) => {
                        const w = 100 / view.boardSections.length;
                        return (
                          <div key={sec.id} className="pointer-events-none absolute inset-y-0" style={{ left: `${i * w}%`, width: `${w}%` }}>
                            {i > 0 ? <div className="absolute inset-y-0 left-0 border-l-4 border-dashed border-[#efe8d6]/45" /> : null}
                            <p className="absolute left-1/2 top-6 -translate-x-1/2 rotate-[-1deg] bg-[#efe8d6]/85 px-4 py-1 font-mono text-base uppercase tracking-[0.14em] text-[#231e17] shadow">
                              {sec.label}
                            </p>
                          </div>
                        );
                      })
                    : null}

                  {/* Under the cards: an invisible, wider copy of each string, so a string can be clicked where it crosses open cork. */}
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} aria-hidden>
                    {strings.map(({ a, b, d }) => (
                      <path
                        key={`${a}-${b}`}
                        d={d}
                        data-string
                        fill="none"
                        stroke="transparent"
                        strokeWidth={22}
                        className={readOnly ? "" : "pointer-events-auto cursor-pointer"}
                        onClick={() => !readOnly && setSelectedString([a, b])}
                      />
                    ))}
                  </svg>

                  {items.map((it) => {
                    const m = meta(it.id);
                    const active = linkFrom === it.id;
                    return (
                      <div
                        key={it.id}
                        data-card
                        className="group absolute select-none"
                        style={{
                          left: ux(it.x),
                          top: uy(it.y),
                          width: CARD_W,
                          transform: `rotate(${tilt(it.id)}deg)`,
                        }}
                      >
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            if (readOnly || touches.current.size > 1) return;
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                            const p = pct(e.clientX, e.clientY);
                            drag.current = {
                              id: it.id,
                              dx: p.x - it.x,
                              dy: p.y - it.y,
                              sx: e.clientX,
                              sy: e.clientY,
                              moved: false,
                            };
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              clickCard(it.id);
                            }
                          }}
                          aria-pressed={active}
                          aria-label={`${m.title}${active ? ", selected" : ""}`}
                          className={`block w-full touch-none bg-[#f0e6cf] p-2 pb-2.5 text-left shadow-[0_8px_16px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4)] ${active ? "outline outline-4 outline-[#ffdf9e]" : ""} ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.image} alt="" draggable={false} className={`w-full object-cover ${m.person ? "aspect-[4/5]" : "aspect-[4/3]"}`} />
                          <span className="mt-1.5 block truncate font-mono text-[0.7rem] text-[#7d3a33]">{m.tag}</span>
                          <span className="block font-serif text-[0.85rem] leading-tight text-[#2a241c]">{m.title}</span>
                        </button>
                        {!readOnly ? (
                          <button
                            type="button"
                            onClick={() => dispatch({ type: "boardRemove", itemId: it.id })}
                            className={`absolute -right-3 -top-3 z-30 h-7 w-7 rounded-full bg-black/75 text-base leading-7 text-paper hover:bg-black [.group:has(:focus-visible)_&]:block pointer-fine:group-hover:block ${active ? "block" : "hidden"}`}
                            aria-label={`Unpin ${m.title}`}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    );
                  })}

                  {/* Over the cards: the string, running pin to pin across whatever lies between, and the pins on top of it. */}
                  <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} aria-hidden>
                    <defs>
                      <radialGradient id="board-pin" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#ff8a7a" />
                        <stop offset="45%" stopColor="#c2271c" />
                        <stop offset="100%" stopColor="#5e0d08" />
                      </radialGradient>
                    </defs>
                    {strings.map(({ a, b, d, sel }) => (
                      <g key={`${a}-${b}`}>
                        <path d={d} fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth={3.2} transform="translate(3 6)" strokeLinecap="round" />
                        <path d={d} fill="none" stroke={sel ? "#ffdf9e" : "#9e1b14"} strokeWidth={sel ? 5 : 3.2} strokeLinecap="round" />
                        {/* A lighter twist along the yarn. */}
                        {sel ? null : <path d={d} fill="none" stroke="#d9473b" strokeWidth={1.4} strokeDasharray="3 4" strokeLinecap="round" opacity={0.85} />}
                      </g>
                    ))}
                    {items.map((it) => {
                      const p = pinPoint(it.id);
                      return (
                        <g key={it.id}>
                          <ellipse cx={p.x + 3} cy={p.y + 5} rx={7} ry={4.5} fill="rgba(0,0,0,0.35)" />
                          <circle cx={p.x} cy={p.y} r={8} fill="url(#board-pin)" stroke="#3d0805" strokeWidth={0.8} />
                          <circle cx={p.x - 2.5} cy={p.y - 2.5} r={2.2} fill="rgba(255,255,255,0.6)" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="pointer-events-none absolute inset-0 m-auto h-fit max-w-sm bg-[#1d1610]/80 px-4 py-3 text-center font-serif text-lg text-paper">
              {emptyText}
            </p>
          ) : null}

          {/* Zoom: out for more room, in to read. Also pinch, or Ctrl and the wheel. */}
          <div className="absolute bottom-3 right-3 z-30 flex items-center overflow-hidden rounded-[3px] border border-black/50 bg-[#1d1610]/90 text-paper shadow-lg">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomBy(1 / 1.25)}
              disabled={zoom <= minZoom + 0.001}
              className="h-9 w-9 text-lg hover:bg-white/10 disabled:opacity-35"
            >
              −
            </button>
            <button
              type="button"
              onClick={fitAll}
              className="h-9 border-x border-white/10 px-2.5 font-mono text-xs hover:bg-white/10"
              title="Show the whole board"
            >
              {Math.round((zoom / baseZoom) * 100)}%
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomBy(1.25)}
              disabled={zoom >= MAX_ZOOM - 0.001}
              className="h-9 w-9 text-lg hover:bg-white/10 disabled:opacity-35"
            >
              +
            </button>
          </div>

          {selectedString ? (
            <div className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 bg-[#1d1610] px-4 py-2 text-sm text-paper shadow-lg">
              <span>
                {meta(selectedString[0]).title} and {meta(selectedString[1]).title}
              </span>
              <button
                type="button"
                className="text-brass hover:underline"
                onClick={() => {
                  const [a, b] = selectedString;
                  onLocalBoard({
                    ...view.board,
                    connections: view.board.connections.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a))),
                  });
                  dispatch({ type: "disconnect", a, b });
                  setSelectedString(null);
                }}
              >
                Remove string
              </button>
              <button type="button" className="text-smoke hover:text-paper" onClick={() => setSelectedString(null)}>
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        {trayOpen && !readOnly ? (
          <aside className="flex max-h-[38%] shrink-0 flex-col border-t border-black/40 bg-[#1d1610] text-paper md:max-h-none md:w-64 md:border-l md:border-t-0">
            <p className="hidden border-b border-white/10 px-4 py-2 text-xs text-smoke md:block">Drag onto the board, or choose Pin.</p>
            <ul className="flex min-h-0 flex-1 gap-2 overflow-x-auto p-2 md:block md:space-y-2 md:overflow-y-auto md:overflow-x-visible md:p-3">
              {tray.length === 0 ? <li className="shrink-0 text-sm text-smoke">Everything you have is on the board.</li> : null}
              {tray.map((id) => {
                const m = meta(id);
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", id)}
                    className="flex w-48 shrink-0 cursor-grab items-center gap-2 border border-white/10 p-1.5 md:w-auto"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.image} alt="" className="h-10 w-12 shrink-0 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[0.65rem] text-brass">{m.tag}</span>
                      <span className="block truncate text-xs">{m.title}</span>
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-brass hover:underline"
                      onClick={() => {
                        // Pinned somewhere in the part of the board in view.
                        const el = viewport.current;
                        const vx = el ? (el.scrollLeft / zoom / PAGE_W) * 100 : 0;
                        const vy = el ? (el.scrollTop / zoom / PAGE_H) * 100 : 0;
                        const vw = el ? (el.clientWidth / zoom / PAGE_W) * 100 : 100;
                        const vh = el ? (el.clientHeight / zoom / PAGE_H) * 100 : 100;
                        const x = vx + vw * (0.1 + Math.random() * 0.65);
                        const y = vy + vh * (0.1 + Math.random() * 0.55);
                        dispatch({
                          type: "boardAdd",
                          itemId: id,
                          x: Math.min(MAX_X, Math.max(0, x)),
                          y: Math.min(MAX_Y, Math.max(0, y)),
                        });
                      }}
                    >
                      Pin
                    </button>
                  </li>
                );
              })}
            </ul>
            {view.deductions.length ? (
              <div className="hidden max-h-60 overflow-y-auto border-t border-white/10 p-3 md:block">
                <p className="text-xs text-smoke">Established</p>
                <ul className="mt-2 space-y-2">
                  {view.deductions.map((d) => (
                    <li key={d.id} className="text-xs">
                      <span className="block font-semibold text-brass">{d.title}</span>
                      <span className="text-paper/80">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>

      {/* Phone controls along the bottom: the way back on the left, the tray on the right. */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/40 bg-[#1d1610] px-3 py-2 text-sm text-paper md:hidden">
        <button type="button" onClick={onClose} className="rounded-[2px] border border-white/15 px-3 py-1.5 hover:bg-white/5">
          Back
        </button>
        {headerExtra}
        {!readOnly ? (
          <button type="button" onClick={() => setTrayOpen((o) => !o)} className="px-2 py-1.5 text-smoke hover:text-paper">
            {trayOpen ? "Hide tray" : `Pin items (${tray.length})`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
