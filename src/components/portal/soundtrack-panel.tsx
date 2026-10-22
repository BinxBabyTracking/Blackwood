"use client";

import { useState } from "react";
import { makeTrack } from "@/app/actions/soundtrack";

type Track = { key: string; label: string; kind: "music" | "ambience"; seconds: number; made: string | null };
type Status = { state: "idle" | "making" | "done" | "error"; note?: string; v?: number };

/** One row per track: listen to it, or make (or remake) it. "Make all missing" works through them one at a time. */
export function SoundtrackPanel({ caseId, tracks }: { caseId: string; tracks: Track[] }) {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [running, setRunning] = useState(false);
  const has = (t: Track) => Boolean(t.made) || status[t.key]?.state === "done";

  const make = async (t: Track) => {
    setStatus((s) => ({ ...s, [t.key]: { state: "making" } }));
    const r = await makeTrack(caseId, t.key).catch(() => ({ error: "The connection dropped. Try again." }));
    setStatus((s) => ({
      ...s,
      [t.key]: "error" in r ? { state: "error", note: r.error } : { state: "done", note: `${Math.round(r.bytes / 1024)} KB`, v: Date.now() },
    }));
    return !("error" in r);
  };

  const makeMissing = async () => {
    setRunning(true);
    for (const t of tracks) if (!has(t)) await make(t);
    setRunning(false);
  };

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={running || tracks.every(has)}
        onClick={makeMissing}
        className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
      >
        {running ? "Making tracks" : tracks.every(has) ? "All tracks made" : `Make all missing (${tracks.filter((t) => !has(t)).length})`}
      </button>
      <ul className="mt-5 divide-y divide-rule/60 border-y border-rule text-sm">
        {tracks.map((t) => {
          const st = status[t.key] ?? { state: "idle" };
          return (
            <li key={t.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-[14rem] flex-1">
                <p className="text-paper">{t.label}</p>
                <p className="font-mono text-xs text-smoke">
                  {t.kind === "music" ? `Music, ${Math.round(t.seconds / 60 * 10) / 10} min` : `Room sound, ${t.seconds}s loop`} ·{" "}
                  {st.state === "making"
                    ? "Making… (music can take a minute or two)"
                    : st.state === "error"
                      ? <span className="text-[#e2a7a2]">{st.note}</span>
                      : st.state === "done"
                        ? `Made just now, ${st.note}`
                        : t.made
                          ? "Made"
                          : "Not made yet"}
                </p>
              </div>
              {has(t) ? (
                <audio controls preload="none" className="h-8 w-56" src={`/api/case-audio/${caseId}/${t.key}${st.v ? `?v=${st.v}` : ""}`} />
              ) : null}
              <button
                type="button"
                disabled={running || st.state === "making"}
                onClick={() => make(t)}
                className="text-brass underline-offset-4 hover:underline disabled:opacity-50"
              >
                {has(t) ? "Make again" : "Make"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
