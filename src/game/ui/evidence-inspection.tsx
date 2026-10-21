"use client";

import { useState } from "react";
import type { ClientEvidence } from "../engine/types";
import { NarrationPlayer } from "./narration-player";
import { GameButton, Overlay } from "./overlay";
import { ZoomImage } from "./zoom-image";

/**
 * Reusable close-up view for any evidence item, from a scene hotspot, the
 * notebook or the inventory. Shows the large image with zoom, the
 * investigator's observations, and the collect / pin actions.
 */
export function EvidenceInspection({
  evidence,
  observation,
  onCollect,
  onPin,
  pinned,
  onClose,
  pending,
  locked,
  closeLabel = "Return to scene",
  narration,
  onSaveNote,
}: {
  evidence: ClientEvidence;
  /** What the investigator notices in the scene before picking it up. */
  observation?: string;
  onCollect: () => void;
  onPin?: () => void;
  pinned?: boolean;
  onClose: () => void;
  pending: boolean;
  /** True when the case is closed and nothing may change. */
  locked?: boolean;
  closeLabel?: string;
  /** Narration source and volume, or null when narration is switched off. */
  narration?: { src: string; volume: number } | null;
  onSaveNote?: (text: string) => Promise<unknown>;
}) {
  const e = evidence;
  const [speaking, setSpeaking] = useState(false);
  const [note, setNote] = useState(e.note);
  const [noteState, setNoteState] = useState<"idle" | "saved" | "error">("idle");
  return (
    <Overlay title={`${e.id}  ${e.title}`} onClose={onClose} wide closeLabel={closeLabel}>
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <ZoomImage src={e.image} alt={e.title} />
        <div className="flex flex-col p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-smoke">Evidence ID</dt>
            <dd className="text-brass">{e.id}</dd>
            <dt className="text-smoke">Location</dt>
            <dd>{e.foundAt ?? e.source}</dd>
            <dt className="text-smoke">Status</dt>
            <dd className={e.collected ? "text-[color:var(--color-ok)]" : "text-smoke"}>{e.collected ? "Collected" : "Not collected"}</dd>
          </dl>
          {observation && !e.collected ? <p className="mt-5 text-sm text-smoke">{observation}</p> : null}
          <p
            className={`mt-4 border-l-2 pl-4 font-serif text-lg leading-relaxed transition-colors ${speaking ? "border-brass text-paper" : "border-brass/60 text-paper/90"}`}
          >
            {e.inspection}
          </p>
          {e.related.length ? <p className="mt-3 text-xs text-smoke">Related: {e.related.join(", ")}</p> : null}
          {narration ? <NarrationPlayer src={narration.src} volume={narration.volume} onPlayingChange={setSpeaking} /> : null}
          {e.audio ? <audio controls src={e.audio} className="mt-4 w-full" /> : null}
          {e.collected && onSaveNote ? (
            <form
              className="mt-4"
              onSubmit={async (ev) => {
                ev.preventDefault();
                const ok = await onSaveNote(note);
                setNoteState(ok ? "saved" : "error");
              }}
            >
              <label htmlFor={`note-${e.id}`} className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-smoke">
                Your notes
              </label>
              <textarea
                id={`note-${e.id}`}
                value={note}
                maxLength={4000}
                onChange={(ev) => {
                  setNote(ev.target.value);
                  setNoteState("idle");
                }}
                rows={3}
                className="mt-1 w-full resize-y border border-white/10 bg-black/30 p-2 text-sm outline-none focus:border-brass"
              />
              <div className="mt-1 flex items-center gap-3">
                <button type="submit" disabled={pending || locked || note === e.note} className="text-xs text-brass hover:underline disabled:opacity-40">
                  Save note
                </button>
                <span aria-live="polite" className="text-xs text-smoke">
                  {noteState === "saved" ? "Note saved." : noteState === "error" ? "Note was not saved." : ""}
                </span>
              </div>
            </form>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-6">
            {e.collected ? (
              <>
                <span className="text-sm text-[color:var(--color-ok)]" role="status">
                  In your notebook
                </span>
                {e.boardable && onPin ? (
                  <GameButton variant="ghost" disabled={pinned || pending || locked} onClick={onPin}>
                    {pinned ? "On the murder board" : "Add to Murder Board"}
                  </GameButton>
                ) : null}
              </>
            ) : (
              <>
                <GameButton disabled={pending || locked} onClick={onCollect}>
                  {pending ? "Collecting" : "Collect Evidence"}
                </GameButton>
                <span className="text-xs text-smoke">Adds it to your notebook and the murder board tray.</span>
              </>
            )}
            <GameButton variant="ghost" onClick={onClose}>
              Close
            </GameButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
