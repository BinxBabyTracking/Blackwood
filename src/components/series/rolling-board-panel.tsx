"use client";

import { useEffect, useState } from "react";
import { seriesBoard } from "@/app/actions/series";
import type { SeriesView } from "@/series/server";
import { RollingBoard } from "./rolling-board";

/**
 * The rolling board opened from the office inside a series case. It is the
 * same board as the series page: one per player per series, so a card pinned
 * here is on it everywhere. A guest at a joint investigation sees a note
 * instead: the board belongs to the host, on the host's screen.
 */
export function RollingBoardPanel({ seriesId, guest, onClose }: { seriesId: string; guest: boolean; onClose: () => void }) {
  const [state, setState] = useState<{ view: SeriesView } | { error: string } | null>(null);

  useEffect(() => {
    if (guest) return;
    let live = true;
    seriesBoard(seriesId)
      .then((r) => live && setState(r))
      .catch(() => live && setState({ error: "The rolling board could not be loaded. Check your connection and try again." }));
    return () => {
      live = false;
    };
  }, [seriesId, guest]);

  if (!guest && state && "view" in state && state.view.open) return <RollingBoard initial={state.view} onClose={onClose} />;

  const message = guest
    ? "The rolling board belongs to the host of this investigation. Look at it together on the host's screen."
    : !state
      ? "Wheeling the board over."
      : "error" in state
        ? state.error
        : "The rolling board arrives once the first case of the series is solved.";
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Rolling board" onClick={onClose}>
      <div className="w-full max-w-md rounded-[3px] bg-[#f0e6cf] p-6 text-[#2a241c] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#7d3a33]">Rolling board</p>
        <p className="mt-2 leading-relaxed" role="status">
          {message}
        </p>
        <button type="button" onClick={onClose} className="mt-5 text-sm font-semibold text-[#7d3a33] underline-offset-4 hover:underline">
          Close
        </button>
      </div>
    </div>
  );
}
