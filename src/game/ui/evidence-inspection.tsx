"use client";

import type { ClientEvidence } from "../engine/types";
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
}) {
  const e = evidence;
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
          <p className="mt-4 border-l-2 border-brass/60 pl-4 font-serif text-lg leading-relaxed text-paper/90">{e.inspection}</p>
          {e.audio ? <audio controls src={e.audio} className="mt-4 w-full" /> : null}
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
              <GameButton disabled={pending || locked} onClick={onCollect}>
                {pending ? "Collecting" : "Collect Evidence"}
              </GameButton>
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
