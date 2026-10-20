"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientView, GameAction } from "../engine/types";

type Dispatch = (a: GameAction) => Promise<unknown>;

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
}: {
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  onLocalBoard: (board: ClientView["board"]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [selectedString, setSelectedString] = useState<[string, string] | null>(null);
  const [trayOpen, setTrayOpen] = useState(true);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
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

  const items = view.board.items;
  const onBoard = new Set(items.map((i) => i.id));
  const meta = (id: string) => {
    const e = view.evidence.find((x) => x.id === id);
    if (e) return { title: e.title, image: e.image, tag: e.id, person: false };
    const c = view.characters.find((x) => x.id === id);
    return { title: c?.name ?? id, image: c?.portrait ?? "", tag: c?.role ?? "", person: true };
  };
  const tray = [
    ...view.characters.filter((c) => c.onBoard && !onBoard.has(c.id)).map((c) => c.id),
    ...view.evidence.filter((e) => e.boardable && !onBoard.has(e.id)).map((e) => e.id),
  ];

  const pct = (clientX: number, clientY: number) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };

  const pinPoint = (id: string) => {
    const it = items.find((i) => i.id === id)!;
    return { x: it.x + 5, y: it.y + 1.2 };
  };

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
      onLocalBoard({ ...view.board, connections: [...view.board.connections, [linkFrom, id]] });
      dispatch({ type: "connect", a: linkFrom, b: id });
    }
    setLinkFrom(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#2b2118] game-fade" role="dialog" aria-modal="true" aria-label="Murder board">
      <div className="flex items-center justify-between gap-3 border-b border-black/40 bg-[#1d1610] px-4 py-2 text-sm text-paper">
        <p className="font-serif text-lg">Murder Board</p>
        <p className="hidden text-xs text-smoke md:block" aria-live="polite">
          {readOnly
            ? "This case is closed. The board is kept as you left it."
            : linkFrom
              ? `Choose a second item to tie to ${meta(linkFrom).title}. Esc to cancel.`
              : "Drag to arrange. Click one item, then another, to tie them with string. Click a string to remove it."}
        </p>
        <div className="flex items-center gap-3">
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

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={ref}
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{
            backgroundColor: "#9a7650",
            backgroundImage:
              "radial-gradient(rgba(60,40,20,0.35) 1px, transparent 1.5px), radial-gradient(rgba(255,230,190,0.18) 1px, transparent 1.5px)",
            backgroundSize: "7px 7px, 11px 11px",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)",
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const p = pct(e.clientX, e.clientY);
            d.moved = true;
            onLocalBoard({
              ...view.board,
              items: items.map((i) => (i.id === d.id ? { ...i, x: Math.min(92, Math.max(0, p.x - d.dx)), y: Math.min(88, Math.max(0, p.y - d.dy)) } : i)),
            });
          }}
          onPointerUp={() => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            if (d.moved) {
              const it = items.find((i) => i.id === d.id)!;
              dispatch({ type: "boardMove", itemId: d.id, x: it.x, y: it.y });
            } else clickCard(d.id);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/plain");
            if (!id || readOnly) return;
            const p = pct(e.clientX, e.clientY);
            dispatch({ type: "boardAdd", itemId: id, x: p.x - 5, y: p.y - 5 });
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {view.board.connections.map(([a, b]) => {
              if (!onBoard.has(a) || !onBoard.has(b)) return null;
              const p = pinPoint(a);
              const q = pinPoint(b);
              const sel = selectedString && ((selectedString[0] === a && selectedString[1] === b) || (selectedString[0] === b && selectedString[1] === a));
              return (
                <g key={`${a}-${b}`}>
                  <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(0,0,0,0.35)" strokeWidth="0.45" vectorEffect="non-scaling-stroke" transform="translate(0.15 0.3)" />
                  <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={sel ? "#ffdf9e" : "#b3231b"} strokeWidth={sel ? 4 : 2.5} vectorEffect="non-scaling-stroke" />
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    stroke="transparent"
                    strokeWidth="14"
                    vectorEffect="non-scaling-stroke"
                    className={readOnly ? "" : "pointer-events-auto cursor-pointer"}
                    onClick={() => !readOnly && setSelectedString([a, b])}
                  />
                </g>
              );
            })}
          </svg>

          {items.map((it) => {
            const m = meta(it.id);
            const active = linkFrom === it.id;
            return (
              <div
                key={it.id}
                className="group absolute w-[10%] min-w-24 select-none"
                style={{ left: `${it.x}%`, top: `${it.y}%`, transform: `rotate(${((it.id.charCodeAt(it.id.length - 1) % 7) - 3) * 0.8}deg)` }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => {
                    if (readOnly) return;
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    const p = pct(e.clientX, e.clientY);
                    drag.current = { id: it.id, dx: p.x - it.x, dy: p.y - it.y, moved: false };
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      clickCard(it.id);
                    }
                  }}
                  aria-pressed={active}
                  aria-label={`${m.title}${active ? ", selected" : ""}`}
                  className={`block w-full touch-none bg-[#f0e6cf] p-1.5 pb-2 text-left shadow-[0_6px_14px_rgba(0,0,0,0.45)] ${active ? "outline outline-[3px] outline-[#ffdf9e]" : ""} ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <span className="absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b3231b] shadow" aria-hidden />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt="" draggable={false} className={`w-full object-cover ${m.person ? "aspect-[4/5]" : "aspect-[4/3]"}`} />
                  <span className="mt-1 block truncate font-mono text-[0.6rem] text-[#7d3a33]">{m.tag}</span>
                  <span className="block font-serif text-[0.72rem] leading-tight text-[#2a241c]">{m.title}</span>
                </button>
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "boardRemove", itemId: it.id })}
                    className="absolute -right-2 -top-2 hidden h-5 w-5 rounded-full bg-black/70 text-xs leading-5 text-paper hover:bg-black group-hover:block group-focus-within:block"
                    aria-label={`Unpin ${m.title}`}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            );
          })}

          {items.length === 0 ? (
            <p className="absolute inset-0 m-auto h-fit max-w-sm text-center font-serif text-lg text-[#2a1d10]">
              The board is empty. Pin evidence and the people involved from the tray.
            </p>
          ) : null}

          {selectedString ? (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 bg-[#1d1610] px-4 py-2 text-sm text-paper shadow-lg">
              <span>
                {meta(selectedString[0]).title} and {meta(selectedString[1]).title}
              </span>
              <button
                type="button"
                className="text-brass hover:underline"
                onClick={() => {
                  const [a, b] = selectedString;
                  onLocalBoard({ ...view.board, connections: view.board.connections.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a))) });
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
          <aside className="flex w-56 shrink-0 flex-col border-l border-black/40 bg-[#1d1610] text-paper sm:w-64">
            <p className="border-b border-white/10 px-4 py-2 text-xs text-smoke">Drag onto the board, or choose Pin.</p>
            <ul className="flex-1 space-y-2 overflow-y-auto p-3">
              {tray.length === 0 ? <li className="text-sm text-smoke">Everything you have is on the board.</li> : null}
              {tray.map((id) => {
                const m = meta(id);
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", id)}
                    className="flex cursor-grab items-center gap-2 border border-white/10 p-1.5"
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
                      onClick={() => dispatch({ type: "boardAdd", itemId: id, x: 8 + Math.random() * 70, y: 8 + Math.random() * 65 })}
                    >
                      Pin
                    </button>
                  </li>
                );
              })}
            </ul>
            {view.deductions.length ? (
              <div className="max-h-60 overflow-y-auto border-t border-white/10 p-3">
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
    </div>
  );
}
