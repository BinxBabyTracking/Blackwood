"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ActionOutcome, ClientView } from "../engine/types";
import { ReviewForm } from "./feedback-forms";
import { LeaderboardResult } from "./leaderboard-result";
import { Letterhead } from "./final-report";
import { voiceSrc } from "./interview-screen";
import { useLinePlayer } from "./use-line-player";

type RecordInfo = Extract<ActionOutcome, { kind: "verdict" }>["record"];
type Closure = NonNullable<ClientView["closure"]>;

/**
 * The end of a case, in four stages: the agency accepts the report, the
 * events are reconstructed, Det. Bennett responds, and the file is stamped
 * closed. Narration and Bennett's voice are optional, subtitled, and only
 * exist once the server has closed the case.
 */
export function CaseResolution({
  caseId,
  view,
  closure,
  record,
  volume,
  reducedMotion,
  onReviewReport,
  onEvidence,
  onReplay,
  onClose,
  reviewed = false,
  asGuest = false,
}: {
  caseId: string;
  view: ClientView;
  closure: Closure;
  record?: RecordInfo;
  volume: number;
  reducedMotion: boolean;
  onReviewReport: () => void;
  onEvidence: () => void;
  /** Absent for a guest in a joint investigation. */
  onReplay?: () => void;
  onClose: () => void;
  /** This investigator already sent a review of the case. */
  reviewed?: boolean;
  asGuest?: boolean;
}) {
  const [review, setReview] = useState<"ask" | "sent" | "skipped">(reviewed ? "skipped" : "ask");
  const pages = closure.reconstruction.length;
  // 0 accepted, 1..pages reconstruction, pages+1 Bennett, pages+2 case closed
  const [stage, setStage] = useState(0);
  const player = useLinePlayer(volume);
  const { play, stop } = player;
  const voices = view.voices;
  // The closing call: Det. Bennett of the LAPD, unless the case names someone else.
  const caller = closure.caller ?? { characterId: "bennett", name: "Det. Frank Bennett", tag: "LAPD Northeast Division · by telephone" };
  const bennett = view.characters.find((c) => c.id === caller.characterId);
  const name = closure.final?.investigator ?? "Investigator";

  const srcs = useMemo(() => {
    if (stage === 0) return [voiceSrc(caseId, "resolution", "accepted", 0)];
    if (stage <= pages) return closure.reconstruction.map((_, i) => voiceSrc(caseId, "resolution", "reconstruction", i));
    if (stage === pages + 1) return closure.bennett.map((_, i) => voiceSrc(caseId, "resolution", "bennett", i));
    return [];
  }, [stage, pages, caseId, closure]);

  // Speak each stage as it appears, when voices are on. Leaving a stage stops it.
  useEffect(() => {
    if (!voices || !srcs.length) return;
    if (stage >= 1 && stage <= pages) play(stage - 1, srcs, stage);
    else play(0, srcs);
  }, [stage, voices, srcs, pages, play]);

  const next = () => {
    stop();
    setStage((s) => Math.min(s + 1, pages + 2));
  };

  const controls = voices && stage <= pages + 1 ? (
    <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs text-smoke">
      {player.status === "playing" ? (
        <button type="button" onClick={player.pause} className="rounded-[2px] border border-white/20 px-3 py-1 text-paper hover:border-brass hover:text-brass">
          Pause
        </button>
      ) : player.status === "paused" ? (
        <button type="button" onClick={player.resume} className="rounded-[2px] border border-white/20 px-3 py-1 text-paper hover:border-brass hover:text-brass">
          Resume
        </button>
      ) : (
        <button
          type="button"
          disabled={player.status === "loading"}
          onClick={() => (stage >= 1 && stage <= pages ? play(stage - 1, srcs, stage) : play(0, srcs))}
          className="rounded-[2px] border border-white/20 px-3 py-1 text-paper hover:border-brass hover:text-brass disabled:opacity-50"
        >
          {player.status === "loading" ? "Listening" : "Play again"}
        </button>
      )}
      <span role="status">{player.error ? `${player.error} The text is complete.` : ""}</span>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black px-5 py-10 [&>*]:my-auto" role="dialog" aria-modal="true" aria-label="Case resolution">
      {stage === 0 ? (
        <div key="accepted" className="w-full max-w-2xl bg-[#efe8d6] px-6 py-9 text-[#231e17] shadow-2xl sm:px-12 game-closure">
          <Letterhead />
          <p className="mt-8 text-center font-mono text-sm font-bold tracking-[0.24em] text-[#4f6b4f]">REPORT ACCEPTED</p>
          <p className="mt-5 text-center font-serif text-xl leading-relaxed">{closure.accepted}</p>
          <p className="mt-6 text-center font-mono text-xs tracking-[0.12em] text-[#231e17]/65">
            CASE {view.caseId} · {name.toUpperCase()}
          </p>
          {controls ? <div className="text-[#231e17] [&_button]:border-[#231e17]/40 [&_button]:text-[#231e17] [&_span]:text-[#231e17]/60">{controls}</div> : null}
          <div className="mt-8 flex justify-center">
            <StageButton onClick={next} paper>
              Continue
            </StageButton>
          </div>
        </div>
      ) : stage <= pages ? (
        <div key={`r${stage}`} className="w-full max-w-2xl text-center game-closure">
          <p className="font-mono text-xs tracking-[0.24em] text-smoke">RECONSTRUCTION · {stage} OF {pages}</p>
          <p className="mt-4 font-mono text-sm tracking-[0.2em] text-brass">{closure.reconstruction[stage - 1].heading.toUpperCase()}</p>
          <p className={`mt-6 font-serif text-2xl leading-relaxed transition-colors sm:text-[1.7rem] ${player.status === "playing" ? "text-paper" : "text-paper/90"}`}>
            {closure.reconstruction[stage - 1].body}
          </p>
          {controls}
          <div className="mt-10 flex justify-center">
            <StageButton onClick={next}>Continue</StageButton>
          </div>
        </div>
      ) : stage === pages + 1 ? (
        <div key="bennett" className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[14rem_1fr] game-closure">
          <div className="mx-auto w-40 md:w-full">
            {bennett ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bennett.portrait} alt={caller.name} className="aspect-[4/5] w-full object-cover sepia-[0.3]" />
            ) : null}
            <p className="mt-3 text-center font-display text-xl text-paper">{caller.name}</p>
            <p className="text-center font-mono text-xs text-smoke">{caller.tag}</p>
          </div>
          <div>
            <div className="space-y-4" aria-live="polite">
              {closure.bennett.map((l, i) => (
                <p
                  key={i}
                  className={`font-serif text-xl leading-relaxed transition-opacity duration-300 sm:text-2xl ${
                    player.current === null || player.current === i ? "text-paper" : "text-paper/40"
                  }`}
                >
                  {l}
                </p>
              ))}
            </div>
            {controls}
            <div className="mt-8">
              <StageButton onClick={next}>Continue</StageButton>
            </div>
          </div>
        </div>
      ) : (
        <div key="closed" className="w-full max-w-xl text-center game-closure">
          <div className="relative mx-auto border border-white/15 bg-[#14171a] px-8 py-12">
            <p className="font-mono text-sm tracking-[0.3em] text-smoke">CASE {view.caseId}</p>
            <p className="mt-3 font-display text-4xl text-paper sm:text-5xl">{view.title.toUpperCase()}</p>
            <p className="mt-6 font-mono text-sm tracking-[0.24em] text-paper/90">STATUS: CLOSED</p>
            <p className="mt-2 font-mono text-xs tracking-[0.16em] text-smoke">
              Investigator: <span className="text-paper">{name}</span>
            </p>
            <span
              aria-hidden
              className={`pointer-events-none absolute -top-5 right-4 bg-[#14171a] border-[3px] border-[#a5281f]/80 px-3 py-1 font-mono text-lg font-bold tracking-[0.2em] text-[#a5281f]/85 ${reducedMotion ? "rotate-[-10deg]" : "game-stamp"}`}
            >
              CASE CLOSED
            </span>
            {record ? (
              <div className="mt-8 border-t border-white/10 pt-5 font-mono text-xs leading-relaxed text-smoke">
                <p>Your service record has been updated.</p>
                {record.awarded.length ? <p className="text-brass">Commendation awarded: {record.awarded.join(", ")}</p> : null}
                {record.rank ? <p>Current rank: {record.rank}</p> : null}
                {!record.first ? <p>You had already closed this case; this investigation is filed as a replay.</p> : null}
              </div>
            ) : null}
          </div>
          {asGuest ? null : <LeaderboardResult caseId={caseId} title={view.title} />}
          {review === "ask" ? (
            <div className="mt-8 border border-brass/40 bg-[#14171a] px-6 py-6 text-left">
              <p className="font-display text-2xl text-paper">File your case review</p>
              <p className="mt-1 text-sm text-smoke">A minute of your time helps us make the next case better.</p>
              <div className="mt-5">
                <ReviewForm caseId={caseId} asGuest={asGuest} onDone={() => setReview("sent")} onSkip={() => setReview("skipped")} />
              </div>
            </div>
          ) : review === "sent" ? (
            <p className="mt-6 font-mono text-xs tracking-[0.12em] text-brass" role="status">
              REVIEW FILED. THANK YOU.
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <StageButton onClick={onReviewReport}>Review the final report</StageButton>
            <StageButton onClick={onEvidence} ghost>
              Review the evidence
            </StageButton>
            {onReplay ? (
              <>
                <Link href="/agency/service-record" className="rounded-[2px] border border-white/20 px-4 py-2 text-paper hover:border-brass hover:text-brass">
                  Service record
                </Link>
                <Link href="/agency" className="rounded-[2px] border border-white/20 px-4 py-2 text-paper hover:border-brass hover:text-brass">
                  {view.words.leave}
                </Link>
                <StageButton onClick={onReplay} ghost>
                  Start a replay
                </StageButton>
              </>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="mt-6 font-mono text-xs text-smoke underline-offset-4 hover:text-paper hover:underline">
            Back to the office
          </button>
        </div>
      )}
    </div>
  );
}

function StageButton({ children, onClick, ghost, paper }: { children: React.ReactNode; onClick: () => void; ghost?: boolean; paper?: boolean }) {
  const cls = paper
    ? "border border-[#231e17] bg-[#231e17] text-[#efe8d6] hover:bg-[#3a3227]"
    : ghost
      ? "border border-white/20 text-paper hover:border-brass hover:text-brass"
      : "bg-brass text-ink hover:bg-[#d4b585]";
  return (
    <button type="button" onClick={onClick} className={`rounded-[2px] px-4 py-2 text-sm font-semibold transition-colors ${cls}`}>
      {children}
    </button>
  );
}
