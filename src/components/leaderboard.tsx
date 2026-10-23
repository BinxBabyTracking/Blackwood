"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { getLeaderboard, setMyEntryHidden } from "@/app/actions/leaderboard";

type Data = Extract<Awaited<ReturnType<typeof getLeaderboard>>, { boards: unknown }>;
type Mode = "solo" | "group";
type Board = "score" | "fastest" | "questions" | "firsttry";

const BOARDS: { id: Board; label: string; note: string }[] = [
  { id: "score", label: "Top score", note: "Investigator Score out of 1,000: points come off for time, questions asked and returned reports." },
  { id: "fastest", label: "Fastest solve", note: "Shortest time spent actively investigating." },
  { id: "questions", label: "Sharpest interviewer", note: "Fewest questions asked across every interview and call." },
  { id: "firsttry", label: "First try", note: "Solved without a single report sent back, by score." },
];

/** 1:02:05 or 42:10, from seconds. */
export function clock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/** A "Leaderboard" button that opens the case's boards in a window. */
export function LeaderboardButton({ caseId, title, className }: { caseId: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={className ?? "relative z-10 text-sm text-brass underline-offset-4 hover:underline"}
      >
        Leaderboard
      </button>
      {open ? <LeaderboardModal caseId={caseId} title={title} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function LeaderboardModal({ caseId, title, onClose, initialMode = "solo" }: { caseId: string; title: string; onClose: () => void; initialMode?: Mode }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [board, setBoard] = useState<Board>("score");
  const [pending, start] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const down = useRef(false);

  const load = () =>
    getLeaderboard(caseId).then((r) => {
      if ("error" in r) setError(r.error ?? "The leaderboard is unavailable right now.");
      else setData(r);
    });
  useEffect(() => {
    void load();
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const b = data?.boards[mode];
  const rows = b?.[board] ?? [];
  const mine = b?.mine.find((m) => m.board === board) ?? null;
  const mineAny = data ? [...data.boards.solo.mine, ...data.boards.group.mine][0] ?? null : null;
  const note = BOARDS.find((x) => x.id === board)!.note;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-[2px] sm:p-6"
      onPointerDown={(e) => {
        down.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (down.current && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Leaderboard: ${title}`}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-file)] border border-rule bg-ink-2 text-paper shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
          <div>
            <p className="font-mono text-xs tracking-[0.14em] text-brass">{caseId} / LEADERBOARD</p>
            <h2 className="mt-1 font-display text-2xl leading-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
            Close
          </button>
        </div>

        <div className="border-b border-rule px-5 pt-3">
          <div role="tablist" aria-label="Who solved it" className="flex gap-1">
            {(["solo", "group"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm ${mode === m ? "border-brass text-paper" : "border-transparent text-smoke hover:text-paper"}`}
              >
                {m === "solo" ? "Solo" : "With friends"}
                {data ? <span className="ml-1.5 font-mono text-xs text-smoke">{data.boards[m].total}</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 px-5 pt-4">
          {BOARDS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={board === x.id}
              onClick={() => setBoard(x.id)}
              className={`rounded-[2px] border px-2.5 py-1 text-xs ${board === x.id ? "border-brass bg-brass text-ink" : "border-white/15 text-paper hover:border-brass"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <p className="px-5 pt-2 text-xs text-smoke">{note}</p>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="text-sm text-smoke">{error}</p>
          ) : !data ? (
            <p className="text-sm text-smoke" role="status">
              Opening the ledger…
            </p>
          ) : rows.length === 0 ? (
            <p className="border-y border-rule py-6 text-center text-sm text-smoke">
              {board === "firsttry" && b?.total ? "Nobody has solved it on the first try yet." : mode === "solo" ? "No solo investigator is on the board yet. Be the first." : "No group is on the board yet. Be the first."}
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-smoke">
                <tr className="border-b border-rule">
                  <th scope="col" className="w-8 py-2 pr-2 font-normal">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-2 font-normal">
                    {mode === "solo" ? "Investigator" : "Group"}
                  </th>
                  <th scope="col" className="py-2 pr-2 text-right font-normal">
                    Score
                  </th>
                  <th scope="col" className="py-2 pr-2 text-right font-normal">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-2 text-right font-normal">
                    Questions
                  </th>
                  <th scope="col" className="hidden py-2 text-right font-normal sm:table-cell">
                    Reports filed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {rows.map((r, i) => (
                  <tr key={r.id} className={r.mine ? "bg-brass/10" : ""}>
                    <td className={`py-2 pr-2 font-mono ${i < 3 ? "text-brass" : "text-smoke"}`}>{i + 1}</td>
                    <td className="py-2 pr-2">
                      <span className="font-serif">{r.name}</span>
                      {r.mode === "group" ? <span className="ml-1.5 text-xs text-smoke">{r.groupSize} investigators</span> : null}
                      {r.mine ? <span className="ml-1.5 font-mono text-[0.65rem] text-brass">YOU</span> : null}
                    </td>
                    <td className={`py-2 pr-2 text-right font-mono ${board === "score" || board === "firsttry" ? "text-paper" : "text-smoke"}`}>{r.score}</td>
                    <td className={`py-2 pr-2 text-right font-mono ${board === "fastest" ? "text-paper" : "text-smoke"}`}>{clock(r.seconds)}</td>
                    <td className={`py-2 pr-2 text-right font-mono ${board === "questions" ? "text-paper" : "text-smoke"}`}>{r.questions}</td>
                    <td className="hidden py-2 text-right font-mono text-smoke sm:table-cell">{r.returned + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-5 py-3 text-sm">
            <p className="text-smoke">
              {mine ? (
                <>
                  Your place: <span className="font-mono text-paper">#{mine.place}</span> of {board === "firsttry" ? "first-try solvers" : b?.total}
                </>
              ) : mineAny ? (
                "You are on the board in the other list."
              ) : (
                "Close the case on your first try at it to earn a place."
              )}
            </p>
            {mineAny ? (
              <button
                type="button"
                disabled={pending}
                className="text-xs text-smoke underline-offset-4 hover:text-paper hover:underline disabled:opacity-50"
                onClick={() =>
                  start(async () => {
                    await setMyEntryHidden(caseId, true);
                    await load();
                  })
                }
              >
                Remove my name
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
