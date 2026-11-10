"use client";

import { useEffect, useRef, useState } from "react";
import { checkMeshy, startMeshy } from "@/app/actions/art";

export type MeshyRow = {
  id: string;
  /** Short name, e.g. "Time Bag". */
  name: string;
  room: string;
  prompt: string;
  /** The current reference picture, if one has been made. */
  image: string | null;
  /** A GLB has been uploaded and one is live in the game. */
  hasModel: boolean;
  /** A Meshy task is running for it. */
  running: boolean;
};

type Job = { state: "starting" | "working" | "done" | "error"; note?: string; progress?: number };
/** Meshy takes a few minutes per model; this many run at once with "Make all". */
const AT_ONCE = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Every 3D model of a case with its Meshy text prompt, ready to copy. Uploading the GLB stays on the
 * Artwork tab, beside the model's reference picture.
 */
export function MeshyPrompts({ rows, canMake }: { rows: MeshyRow[]; canMake: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [batch, setBatch] = useState(false);
  const stop = useRef(false);
  const say = (id: string, j: Job) => setJobs((m) => ({ ...m, [id]: j }));

  /** Waits for one model's Meshy task, checking every 10 seconds, until it is stored or fails. */
  const follow = async (id: string) => {
    for (let i = 0; i < 120; i++) {
      const r = await checkMeshy(id).catch(() => ({ error: "The connection dropped; checking again." }));
      if ("error" in r) say(id, { state: "working", note: r.error });
      else if (r.check.state === "done") return say(id, { state: "done", note: `Made${r.check.live ? " and live in the game" : "; choose it on the Artwork tab"}${r.check.credits ? `, ${r.check.credits} credits` : ""}.` }), true;
      else if (r.check.state === "failed") return say(id, { state: "error", note: r.check.note }), false;
      else if (r.check.state === "none") return say(id, { state: "error", note: "No Meshy task is running for it." }), false;
      else say(id, { state: "working", progress: r.check.progress });
      await sleep(10000);
    }
    say(id, { state: "error", note: "Still not finished after 20 minutes. Check again later." });
    return false;
  };
  const make = async (id: string) => {
    say(id, { state: "starting" });
    const r = await startMeshy(id).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in r) return say(id, { state: "error", note: r.error }), false;
    say(id, { state: "working", progress: 0 });
    return follow(id);
  };
  // Pick up models whose Meshy task was already running when the page opened.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    for (const r of rows) if (r.running) void follow(r.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ready = (r: MeshyRow) => Boolean(r.image) && !r.hasModel && !jobs[r.id];
  const makeAll = async () => {
    setBatch(true);
    stop.current = false;
    const queue = rows.filter(ready).map((r) => r.id);
    const worker = async () => {
      while (queue.length && !stop.current) await make(queue.shift()!);
    };
    await Promise.all(Array.from({ length: AT_ONCE }, worker));
    setBatch(false);
  };
  const [filter, setFilter] = useState<"all" | "todo">("todo");
  const shown = filter === "todo" ? rows.filter((r) => !r.hasModel) : rows;
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      setCopied(`fail:${key}`);
    }
  };
  const rooms = [...new Set(shown.map((r) => r.room))];
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="text-smoke">
          {rows.filter((r) => r.hasModel).length} of {rows.length} uploaded
        </span>
        <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => setFilter(filter === "todo" ? "all" : "todo")}>
          {filter === "todo" ? "Show all, uploaded too" : "Show only the ones still to make"}
        </button>
        {canMake ? (
          batch ? (
            <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => (stop.current = true)}>
              Stop after the ones running
            </button>
          ) : (
            <button
              type="button"
              disabled={!rows.some(ready)}
              className="rounded-[2px] bg-brass px-3 py-1.5 font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
              onClick={makeAll}
            >
              Make all missing with Meshy ({rows.filter(ready).length})
            </button>
          )
        ) : null}
        <button
          type="button"
          className="text-brass underline-offset-4 hover:underline"
          onClick={() => copy("all", shown.map((r) => `${r.name} (${r.id})\n${r.prompt}`).join("\n\n"))}
        >
          {copied === "all" ? "Copied" : `Copy all ${shown.length} shown`}
        </button>
      </div>
      {!shown.length ? <p className="mt-4 text-sm text-smoke">Every model here has been uploaded.</p> : null}
      {rooms.map((room) => (
        <div key={room} className="mt-6">
          <h3 className="font-serif text-lg text-paper">{room}</h3>
          <ul className="mt-2 divide-y divide-rule/60 border-y border-rule">
            {shown
              .filter((r) => r.room === room)
              .map((r) => (
                <li key={r.id} className="flex gap-3 py-3">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt="" className="h-16 w-16 shrink-0 rounded-[2px] bg-black/30 object-contain" loading="lazy" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[2px] bg-black/30 text-center text-[0.6rem] text-smoke">No picture yet</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <p className="text-paper">{r.name}</p>
                      <p className="font-mono text-[0.65rem] text-smoke">{r.id}</p>
                      {r.hasModel ? <p className="text-xs text-[#9fc79a]">Uploaded</p> : null}
                    </div>
                    <p className="mt-1 select-all rounded-[2px] bg-black/30 p-2 font-mono text-[0.7rem] text-paper/90">{r.prompt}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => copy(r.id, r.prompt)}>
                        {copied === r.id ? "Copied" : copied === `fail:${r.id}` ? "Couldn't copy: select the prompt and copy it by hand" : "Copy prompt"}
                      </button>
                      {canMake ? (
                        r.image ? (
                          <button
                            type="button"
                            disabled={Boolean(jobs[r.id] && jobs[r.id].state !== "error" && jobs[r.id].state !== "done")}
                            className="text-brass underline-offset-4 hover:underline disabled:opacity-50"
                            onClick={() => make(r.id)}
                          >
                            {r.hasModel || jobs[r.id]?.state === "done" ? "Make again with Meshy" : "Make with Meshy"}
                          </button>
                        ) : (
                          <span className="text-xs text-smoke">Make its reference picture on the Artwork tab first</span>
                        )
                      ) : null}
                      {jobs[r.id] ? (
                        <span className={`text-xs ${jobs[r.id].state === "error" ? "text-[#e2a7a2]" : jobs[r.id].state === "done" ? "text-[#9fc79a]" : "text-smoke"}`}>
                          {jobs[r.id].state === "starting"
                            ? "Sending to Meshy…"
                            : jobs[r.id].state === "working"
                              ? jobs[r.id].note ?? `Meshy is making it… ${jobs[r.id].progress ?? 0}% (a few minutes)`
                              : jobs[r.id].note}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
