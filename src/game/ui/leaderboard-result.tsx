"use client";

import { useEffect, useState, useTransition } from "react";
import { getMyResult, submitLeaderboard } from "@/app/actions/leaderboard";
import { clock, LeaderboardModal } from "@/components/leaderboard";

type Result = NonNullable<Awaited<ReturnType<typeof getMyResult>>>;

const ord = (n: number) => `#${n}`;

/**
 * The closing screen's score card: the Investigator Score with what it cost,
 * where the run places, and the choice to put a name on the case's board.
 * Shown only for the player's first solve of the case.
 */
export function LeaderboardResult({ caseId, title }: { caseId: string; title: string }) {
  const [r, setR] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"ask" | "declined" | "on">("ask");
  const [board, setBoard] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    void getMyResult(caseId).then((res) => {
      if (!live || !res) return;
      setR(res);
      setName(res.entry?.name ?? res.suggestedName);
      if (res.entry && !res.entry.hidden) setState("on");
    });
    return () => {
      live = false;
    };
  }, [caseId]);

  if (!r) return null;
  const group = r.mode === "group";
  const minus = (n: number) => (n ? `-${n}` : "0");
  const lines = [
    { label: "Time investigating", value: clock(r.run.seconds), cost: Math.round((r.run.seconds / 60) * 4) },
    { label: group ? "Questions asked by the table" : "Questions asked", value: String(r.run.questions), cost: r.run.questions * 5 },
    { label: "Reports sent back", value: String(r.run.returned), cost: r.run.returned * 50 },
  ];
  const places = [
    { label: "Top score", place: r.places.score },
    { label: "Fastest solve", place: r.places.fastest },
    { label: "Sharpest interviewer", place: r.places.questions },
    ...(r.places.firsttry ? [{ label: "First try", place: r.places.firsttry }] : []),
  ];

  return (
    <div className="mt-8 border border-white/15 bg-[#14171a] px-6 py-6 text-left">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-smoke">INVESTIGATOR SCORE{group ? ` · ${r.groupSize} AT THE TABLE` : ""}</p>
          <p className="mt-1 font-display text-5xl leading-none text-paper">
            {r.run.score}
            <span className="ml-1 font-mono text-base text-smoke">/ 1000</span>
          </p>
        </div>
        <button type="button" onClick={() => setBoard(true)} className="text-sm text-brass underline-offset-4 hover:underline">
          View the leaderboard
        </button>
      </div>
      <dl className="mt-4 divide-y divide-white/10 border-y border-white/10 font-mono text-xs">
        {lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-smoke">{l.label}</dt>
            <dd className="flex gap-4">
              <span className="text-paper">{l.value}</span>
              <span className="w-12 text-right text-smoke">{minus(l.cost)}</span>
            </dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {places.map((p) => (
          <li key={p.label} className="border border-white/10 px-2.5 py-2">
            <p className="font-mono text-lg text-brass">{ord(p.place)}</p>
            <p className="text-[0.7rem] leading-tight text-smoke">{p.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-smoke">
        Out of {r.places.of} {group ? "group" : "solo"} {r.places.of === 1 ? "run" : "runs"} so far, including yours.
      </p>

      {state === "on" ? (
        <p className="mt-5 text-sm text-paper" role="status">
          On the board as <span className="font-serif text-brass">{name}</span>.
        </p>
      ) : state === "declined" ? (
        <button type="button" className="mt-5 text-sm text-smoke underline-offset-4 hover:text-paper hover:underline" onClick={() => setState("ask")}>
          Changed your mind? Add your {group ? "group" : "name"} to the board
        </button>
      ) : (
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              const res = await submitLeaderboard(caseId, name);
              if ("error" in res) setError(res.error ?? "That name can't be used.");
              else {
                setName(res.name);
                setState("on");
              }
            });
          }}
        >
          <label htmlFor="lb-name" className="block text-sm text-paper">
            {group ? "Put your group on the leaderboard?" : "Add your name to the leaderboard?"}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id="lb-name"
              className="min-w-0 flex-1 rounded-[2px] border border-white/15 bg-black/30 px-3 py-2 text-sm text-paper placeholder:text-smoke/70 focus:border-brass focus:outline-none"
              maxLength={30}
              value={name}
              placeholder={group ? "Group name" : "Your name"}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "lb-err" : undefined}
            />
            <button type="submit" disabled={pending} className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-60">
              {pending ? "Adding…" : "Add to the board"}
            </button>
            <button type="button" className="px-2 text-sm text-smoke hover:text-paper" onClick={() => setState("declined")}>
              No thanks
            </button>
          </div>
          {error ? (
            <p id="lb-err" role="alert" className="mt-1.5 text-xs text-[#e08a7f]">
              {error}
            </p>
          ) : null}
        </form>
      )}
      {board ? <LeaderboardModal caseId={caseId} title={title} initialMode={r.mode} onClose={() => setBoard(false)} /> : null}
    </div>
  );
}
