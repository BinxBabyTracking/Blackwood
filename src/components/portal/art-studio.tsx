"use client";

import { useMemo, useRef, useState } from "react";
import { generateArt, saveArtSubject, setArtLive, uploadArt } from "@/app/actions/art";

export type StudioRow = {
  id: string;
  kind: string;
  subject: string;
  defaultSubject: string;
  edited: boolean;
  current: string | null;
  committed: string | null;
  live: number | null;
  versions: { version: number; url: string; createdAt: string; source: string; model: string | null; cost: number }[];
  prompt: string;
};

type Status = { state: "idle" | "busy" | "done" | "error"; note?: string };

const KIND: Record<string, string> = {
  background: "Scene",
  portrait: "Portrait",
  figure: "Figure",
  sprite: "Object",
  evidence: "Evidence",
  site: "Site",
  strip: "Travel strip",
  panorama: "Panorama",
  pov: "Point of view",
  map: "Map",
  face: "Talking frame",
};

/** Rough price of one image of this kind, matching the server's estimate. */
const price = (kind: string) => ({ sprite: 0.042, evidence: 0.042, portrait: 0.25, figure: 0.25, face: 0.25 } as Record<string, number>)[kind] ?? 0.25;

/**
 * One case's artwork: every image's picture and prompt. Make one, make all the
 * missing ones (one after another), upload your own, and choose which version
 * players see. Nothing changes for players until a version is made live.
 */
export function ArtStudio({ rows: initial, keyNote }: { rows: StudioRow[]; keyNote: string | null }) {
  const [rows, setRows] = useState(initial);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [running, setRunning] = useState<null | { done: number; total: number; current: string }>(null);
  const [stopNote, setStopNote] = useState<string | null>(null);
  const stopNow = useRef<(() => void) | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "review">("all");
  const [autoLive, setAutoLive] = useState(true);
  const stop = useRef(false);

  const missing = rows.filter((r) => !r.current);
  const toReview = rows.filter((r) => r.versions.length && r.versions[0].version !== r.live);
  const shown = filter === "missing" ? missing : filter === "review" ? toReview : rows;
  const spent = useMemo(() => rows.reduce((n, r) => n + r.versions.reduce((m, v) => m + v.cost, 0), 0), [rows]);

  const patch = (id: string, f: (r: StudioRow) => StudioRow) => setRows((rs) => rs.map((r) => (r.id === id ? f(r) : r)));
  const say = (id: string, s: Status) => setStatus((st) => ({ ...st, [id]: s }));

  const make = async (r: StudioRow, live: boolean) => {
    say(r.id, { state: "busy", note: "Painting… (30 to 90 seconds)" });
    const res = await generateArt(r.id, live).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in res) {
      say(r.id, { state: "error", note: res.error });
      return false;
    }
    patch(r.id, (x) => ({
      ...x,
      versions: [{ version: res.version, url: res.url, createdAt: new Date().toISOString(), source: "generated", model: res.model, cost: res.cost }, ...x.versions],
      ...(live ? { live: res.version, current: res.url } : {}),
    }));
    say(r.id, { state: "done", note: live ? `Made with ${res.model} and live.` : `Made with ${res.model}. Review it below.` });
    return true;
  };

  const makeMany = async (list: StudioRow[], liveIfEmpty: boolean) => {
    stop.current = false;
    setStopNote(null);
    // Stop ends the run at once: nothing new is started, and the page stops waiting on the image in progress.
    const stopped = new Promise<"stop">((resolve) => (stopNow.current = () => resolve("stop")));
    let done = 0;
    for (let i = 0; i < list.length; i++) {
      if (stop.current) break;
      setRunning({ done, total: list.length, current: list[i].id });
      const r = await Promise.race([make(list[i], liveIfEmpty && !list[i].current), stopped]);
      if (r === "stop") break;
      done = i + 1;
    }
    stopNow.current = null;
    setRunning(null);
    if (stop.current)
      setStopNote(`Stopped after ${done} of ${list.length}. The image that was being painted still finishes on the server and shows up here when it's done.`);
  };
  const halt = () => {
    stop.current = true;
    stopNow.current?.();
  };

  const choose = async (r: StudioRow, version: number | null) => {
    say(r.id, { state: "busy", note: "Updating…" });
    const res = await setArtLive(r.id, version);
    if ("error" in res) return say(r.id, { state: "error", note: res.error });
    patch(r.id, (x) => ({ ...x, live: version, current: version ? x.versions.find((v) => v.version === version)?.url ?? x.current : x.committed }));
    say(r.id, { state: "done", note: version ? `Version ${version} is live.` : "Back to the original painting." });
  };

  return (
    <div className="mt-4">
      {keyNote ? <p className="mb-3 text-sm text-[#e2a7a2]">{keyNote}</p> : null}
      {stopNote ? (
        <p role="status" className="mb-3 text-sm text-paper">
          {stopNote}
        </p>
      ) : null}
      {running ? (
        // Always on screen while a run is going, wherever you've scrolled.
        <div role="status" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-wrap items-center gap-3 rounded-[2px] border border-brass/60 bg-[#14171a] px-4 py-3 shadow-2xl sm:inset-x-auto sm:right-4">
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-paper">
              Generating {running.done + 1} of {running.total}
            </p>
            <p className="truncate font-mono text-xs text-smoke">{running.current}</p>
          </div>
          <button type="button" onClick={halt} className="rounded-[2px] bg-[#e2a7a2] px-4 py-2 text-sm font-semibold text-ink hover:bg-[#f0c0bb]">
            Stop
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={Boolean(running) || !missing.length}
          onClick={() => {
            if (window.confirm(`Make ${missing.length} missing image(s)? About $${missing.reduce((n, r) => n + price(r.kind), 0).toFixed(2)} at OpenAI's prices.`)) void makeMany(missing, autoLive);
          }}
          className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
        >
          {missing.length ? `Generate all missing (${missing.length})` : "Nothing missing"}
        </button>
        <button
          type="button"
          disabled={Boolean(running)}
          onClick={() => {
            if (window.confirm(`Make a new version of all ${rows.length} images? About $${rows.reduce((n, r) => n + price(r.kind), 0).toFixed(2)}. They wait for review; nothing players see changes until you choose one.`)) void makeMany(rows, false);
          }}
          className="rounded-[2px] border border-white/20 px-4 py-2 text-sm hover:border-brass disabled:opacity-50"
        >
          Generate all again
        </button>
        {running ? (
          <button type="button" onClick={halt} className="rounded-[2px] border border-[#e2a7a2] px-4 py-2 text-sm font-semibold text-[#e2a7a2] hover:bg-[#e2a7a2] hover:text-ink">
            Stop generating
          </button>
        ) : null}
        <label className="flex items-center gap-2 text-xs text-smoke">
          <input type="checkbox" checked={autoLive} onChange={(e) => setAutoLive(e.target.checked)} />
          Make missing images live straight away
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {(
          [
            ["all", `All (${rows.length})`],
            ["missing", `Missing (${missing.length})`],
            ["review", `Waiting for review (${toReview.length})`],
          ] as const
        ).map(([f, label]) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-[2px] border px-2.5 py-1 ${filter === f ? "border-brass bg-brass text-ink" : "border-white/15 text-paper hover:border-brass"}`}>
            {label}
          </button>
        ))}
        <span className="ml-auto font-mono text-smoke">Spent on this case so far: about ${spent.toFixed(2)}</span>
      </div>

      <ul className="mt-4 divide-y divide-rule/60 border-y border-rule">
        {shown.map((r) => (
          <ArtRowView key={r.id} r={r} status={status[r.id]} busy={Boolean(running) || status[r.id]?.state === "busy"} onMake={() => make(r, false)} onChoose={(v) => choose(r, v)} onPatch={(f) => patch(r.id, f)} onSay={(s) => say(r.id, s)} />
        ))}
      </ul>
    </div>
  );
}

function ArtRowView({
  r,
  status,
  busy,
  onMake,
  onChoose,
  onPatch,
  onSay,
}: {
  r: StudioRow;
  status?: Status;
  busy: boolean;
  onMake: () => void;
  onChoose: (version: number | null) => void;
  onPatch: (f: (r: StudioRow) => StudioRow) => void;
  onSay: (s: Status) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(r.subject);
  const [full, setFull] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const latest = r.versions[0];
  const waiting = latest && latest.version !== r.live;

  return (
    <li className="grid gap-4 py-4 sm:grid-cols-[9rem_1fr]">
      <div>
        {r.current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.current} alt="" loading="lazy" className="aspect-square w-36 rounded-[2px] border border-white/10 bg-[repeating-conic-gradient(#222_0_25%,#2b2b2b_0_50%)] bg-[length:16px_16px] object-contain" />
        ) : (
          <div className="flex aspect-square w-36 items-center justify-center rounded-[2px] border border-dashed border-white/20 text-xs text-smoke">Not made yet</div>
        )}
        <p className="mt-1 font-mono text-[0.65rem] text-smoke">{r.live ? `Live: version ${r.live}` : r.committed ? "Original painting" : ""}</p>
      </div>
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-xs text-brass">{r.id}</span>
          <span className="text-xs text-smoke">{KIND[r.kind] ?? r.kind}</span>
          {r.edited ? <span className="text-xs text-smoke">prompt edited</span> : null}
        </p>
        {editing ? (
          <div className="mt-2">
            <textarea className="field min-h-28 w-full text-sm" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="text-brass underline-offset-4 hover:underline"
                onClick={async () => {
                  const res = await saveArtSubject(r.id, text);
                  if ("error" in res) return onSay({ state: "error", note: res.error });
                  onPatch((x) => ({ ...x, subject: text.trim() || x.defaultSubject, edited: Boolean(text.trim()) && text.trim() !== x.defaultSubject }));
                  setEditing(false);
                  onSay({ state: "done", note: "Prompt saved. Generate to use it." });
                }}
              >
                Save prompt
              </button>
              <button type="button" className="text-smoke hover:text-paper" onClick={() => setText(r.defaultSubject)}>
                Back to the original wording
              </button>
              <button type="button" className="text-smoke hover:text-paper" onClick={() => (setEditing(false), setText(r.subject))}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-paper/90">{r.subject}</p>
        )}
        {full ? <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-[2px] bg-black/30 p-2 font-mono text-[0.7rem] text-smoke">{r.prompt}</pre> : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <button type="button" disabled={busy} onClick={onMake} className="font-semibold text-brass underline-offset-4 hover:underline disabled:opacity-50">
            {r.current || r.versions.length ? "Generate again" : "Generate"}
          </button>
          {!editing ? (
            <button type="button" className="text-smoke hover:text-paper" onClick={() => setEditing(true)}>
              Edit prompt
            </button>
          ) : null}
          <button type="button" className="text-smoke hover:text-paper" onClick={() => setFull((f) => !f)}>
            {full ? "Hide full prompt" : "Full prompt"}
          </button>
          <button type="button" disabled={busy} className="text-smoke hover:text-paper disabled:opacity-50" onClick={() => file.current?.click()}>
            Upload my own
          </button>
          <input
            ref={file}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              onSay({ state: "busy", note: "Uploading…" });
              const fd = new FormData();
              fd.set("id", r.id);
              fd.set("file", f);
              const res = await uploadArt(fd).catch(() => ({ error: "The upload failed." }));
              if ("error" in res) return onSay({ state: "error", note: res.error });
              onPatch((x) => ({ ...x, versions: [{ version: res.version, url: res.url, createdAt: new Date().toISOString(), source: "uploaded", model: null, cost: 0 }, ...x.versions] }));
              onSay({ state: "done", note: "Uploaded. Review it below." });
            }}
          />
          {status?.note ? (
            <span role="status" className={`text-xs ${status.state === "error" ? "text-[#e2a7a2]" : "text-smoke"}`}>
              {status.note}
            </span>
          ) : null}
        </div>

        {r.versions.length ? (
          <div className="mt-3">
            <p className="text-xs text-smoke">{waiting ? "New version waiting for review. Choose which one players see:" : "Versions:"}</p>
            <ul className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
              {r.committed ? (
                <li className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.committed} alt="" loading="lazy" className={`h-20 w-20 rounded-[2px] border object-contain ${!r.live ? "border-brass" : "border-white/10"}`} />
                  <button type="button" disabled={busy || !r.live} onClick={() => onChoose(null)} className="mt-0.5 block text-[0.65rem] text-brass underline-offset-4 hover:underline disabled:text-smoke disabled:no-underline">
                    {!r.live ? "Original, live" : "Use original"}
                  </button>
                </li>
              ) : null}
              {r.versions.slice(0, 8).map((v) => (
                <li key={v.version} className="shrink-0">
                  <a href={v.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.url} alt={`Version ${v.version}`} loading="lazy" className={`h-20 w-20 rounded-[2px] border object-contain ${r.live === v.version ? "border-brass" : "border-white/10"}`} />
                  </a>
                  <button type="button" disabled={busy || r.live === v.version} onClick={() => onChoose(v.version)} className="mt-0.5 block text-[0.65rem] text-brass underline-offset-4 hover:underline disabled:text-smoke disabled:no-underline">
                    {r.live === v.version ? `v${v.version}, live` : `Use v${v.version}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  );
}
