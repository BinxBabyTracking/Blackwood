"use client";

import { useState, useTransition } from "react";
import { submitReport, submitReview } from "@/app/actions/feedback";
import { Overlay } from "./overlay";

const DIFFICULTY = [
  { id: "too_easy", label: "Too easy" },
  { id: "about_right", label: "About right" },
  { id: "too_hard", label: "Too hard" },
] as const;

const field = "w-full rounded-[2px] border border-white/15 bg-black/30 px-3 py-2 text-sm text-paper placeholder:text-smoke/70 focus:border-brass focus:outline-none";

/**
 * The case review: stars, difficulty, where they got stuck, anything else.
 * Shown when a case closes, and on My Case Files for anyone who skipped it.
 */
export function ReviewForm({
  caseId,
  asGuest = false,
  onDone,
  onSkip,
  skipLabel = "Skip",
}: {
  caseId: string;
  asGuest?: boolean;
  onDone: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [stuck, setStuck] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      setError(null);
      const res = await submitReview(caseId, { rating, difficulty, stuck, message }, asGuest);
      if ("error" in res) setError(res.error);
      else onDone();
    });

  const shown = hover ?? rating ?? 0;
  return (
    <form
      className="space-y-5 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <fieldset>
        <legend className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">How was the case?</legend>
        <div className="mt-2 flex gap-1" onPointerLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onPointerEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={`text-3xl leading-none transition-colors ${n <= shown ? "text-brass" : "text-white/20 hover:text-white/40"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">Difficulty</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIFFICULTY.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={difficulty === d.id}
              onClick={() => setDifficulty(difficulty === d.id ? null : d.id)}
              className={`rounded-[2px] border px-3 py-1.5 text-sm ${difficulty === d.id ? "border-brass bg-brass text-ink" : "border-white/20 text-paper hover:border-brass"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">Where did you get stuck? (optional)</span>
        <input className={`${field} mt-2`} maxLength={500} value={stuck} onChange={(e) => setStuck(e.target.value)} placeholder="A clue, a person, a step you couldn't work out" />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">Anything else? (optional)</span>
        <textarea className={`${field} mt-2 min-h-20`} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-[#e08a7f]">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-60">
          {pending ? "Sending…" : "Send review"}
        </button>
        {onSkip ? (
          <button type="button" onClick={onSkip} className="px-2 py-2 text-sm text-smoke hover:text-paper">
            {skipLabel}
          </button>
        ) : null}
      </div>
      <p className="text-xs text-smoke">Reviews go to the agency only. They are never shown publicly.</p>
    </form>
  );
}

/** "Send feedback" from the game menu: what happened, with where the player was attached by the server. */
export function ReportDialog({
  caseId,
  asGuest,
  open,
  characterId,
  onClose,
}: {
  caseId: string;
  asGuest: boolean;
  /** What the player had open, e.g. "Interview: Rosa Delgado". */
  open: string;
  characterId: string | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Overlay title="Send feedback" onClose={onClose} closeLabel="Close">
      {sent ? (
        <div className="space-y-4">
          <p className="font-serif text-xl">Thanks. It&apos;s on the chief&apos;s desk.</p>
          <p className="text-sm text-smoke">Your note was sent along with where you were in the case, so we can find the problem.</p>
          <button type="button" onClick={onClose} className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585]">
            Back to the case
          </button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              const res = await submitReport(caseId, { message, open, characterId }, asGuest);
              if ("error" in res) setError(res.error);
              else setSent(true);
            });
          }}
        >
          <label className="block">
            <span className="font-serif text-xl">What happened?</span>
            <span className="mt-1 block text-sm text-smoke">A bug, a confusing clue, an answer that didn&apos;t make sense. Your current location and recent conversation are attached automatically.</span>
            <textarea autoFocus className={`${field} mt-3 min-h-28`} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-[#e08a7f]">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending || !message.trim()} className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-60">
            {pending ? "Sending…" : "Send feedback"}
          </button>
        </form>
      )}
    </Overlay>
  );
}
