"use client";

import Link from "next/link";
import type { ClientChapter } from "../engine/types";
import { GameButton } from "./overlay";

/** "3h 42m", "48m". */
export function investigationTime(seconds: number) {
  const m = Math.max(0, Math.floor(seconds / 60));
  const h = Math.floor(m / 60);
  return h ? `${h}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`;
}

function Backdrop({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-gradient-to-t from-black via-black/90 to-black/60 px-4 pb-10 pt-16 sm:items-center sm:px-6 sm:pb-0"
    >
      <div className="w-full max-w-2xl game-closure">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-brass/30 pt-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">{label}</p>
      <p className="mt-1 font-serif text-xl text-paper">{value}</p>
    </div>
  );
}

/**
 * The checkpoint screen at the end of a chapter. By the time it shows, the
 * checkpoint is already saved on the server: closing the browser here loses nothing.
 */
export function CheckpointScreen({
  chapter,
  pending,
  onContinue,
  onExit,
}: {
  chapter: ClientChapter;
  pending: boolean;
  onContinue: () => void;
  onExit: () => void;
}) {
  const c = chapter.checkpoint!;
  return (
    <Backdrop label={`Chapter ${c.number} complete`}>
      <p className="font-mono text-sm tracking-[0.25em] text-brass">CHAPTER {c.number} COMPLETE</p>
      <h2 className="mt-3 font-display text-4xl text-paper sm:text-5xl">{c.title}</h2>
      <p className="mt-6 font-serif text-xl italic leading-relaxed text-paper/90 sm:text-2xl">&ldquo;{c.conclusion}&rdquo;</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Investigation time" value={investigationTime(c.activeSeconds)} />
        <Stat label="Evidence found" value={String(c.evidence)} />
        <Stat label="Deductions" value={String(c.deductions)} />
        <Stat label="New places" value={String(c.locations.length)} />
      </div>
      {c.locations.length ? <p className="mt-4 text-sm text-smoke">Opened: {c.locations.join(", ")}</p> : null}
      <p className="mt-6 text-paper/80">{c.summary}</p>
      {c.next ? (
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
          Next: Chapter {c.next.number}, <span className="text-brass">{c.next.title}</span>
        </p>
      ) : null}
      <p className="mt-2 text-xs text-smoke">Progress saved. You can stop here and pick up exactly where you left off.</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <GameButton onClick={onContinue} disabled={pending}>
          Continue Investigation
        </GameButton>
        <GameButton variant="ghost" onClick={onExit} disabled={pending}>
          Save and Exit
        </GameButton>
      </div>
    </Backdrop>
  );
}

/** The title card as a new chapter opens. */
export function ChapterOpening({ chapter, onBegin }: { chapter: { number: number; title: string; intro: string }; onBegin: () => void }) {
  return (
    <Backdrop label={`Chapter ${chapter.number}`}>
      <p className="font-mono text-sm tracking-[0.25em] text-brass">CHAPTER {chapter.number}</p>
      <h2 className="mt-3 font-display text-4xl text-paper sm:text-5xl">{chapter.title}</h2>
      <p className="mt-6 font-serif text-xl leading-relaxed text-paper/90 sm:text-2xl">{chapter.intro}</p>
      <div className="mt-10">
        <GameButton onClick={onBegin}>Begin</GameButton>
      </div>
    </Backdrop>
  );
}

/** Shown when a player comes back to a case told in chapters. */
export function ResumeScreen({
  chapter,
  location,
  lastPlayed,
  onResume,
  onNotebook,
  exitHref,
}: {
  chapter: ClientChapter;
  location: string;
  lastPlayed: string | null;
  onResume: () => void;
  onNotebook: () => void;
  exitHref: string;
}) {
  const when = lastPlayed ? new Date(lastPlayed) : null;
  return (
    <Backdrop label="Continue investigation">
      <p className="font-mono text-sm tracking-[0.25em] text-brass">CONTINUE INVESTIGATION</p>
      <h2 className="mt-3 font-display text-4xl text-paper sm:text-5xl">
        Chapter {chapter.number}: {chapter.title}
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Last location" value={location} />
        <Stat label="Investigation time" value={investigationTime(chapter.activeSeconds)} />
        <Stat
          label="Last played"
          value={when && !Number.isNaN(when.getTime()) ? when.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Earlier"}
        />
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <GameButton onClick={onResume}>Resume Investigation</GameButton>
        <GameButton variant="ghost" onClick={onNotebook}>
          Review Case Notebook
        </GameButton>
        <Link href={exitHref} className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
          Return to Case Selection
        </Link>
      </div>
    </Backdrop>
  );
}
