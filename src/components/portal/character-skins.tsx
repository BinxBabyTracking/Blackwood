"use client";

import { useState } from "react";
import { chooseCharacter, finishCharacterUpload, makeCharacter, startCharacterUpload } from "@/app/actions/art";
import { getBrowserClient } from "@/lib/supabase/client";
import { ModelPreview } from "@/components/portal/model-preview";

export type SkinRow = {
  person: string;
  group: string;
  name: string;
  front: string | null;
  ready: boolean;
  base: string;
  models: { version: number; url: string; createdAt: string; bytes: number }[];
  liveModel: number | null;
};

type Job = { state: "busy" | "done" | "error"; note: string };

/**
 * People's 3D characters: each person's front, side and back views painted onto a rigged base (elf boy, elf girl,
 * man or woman). One button per person, or every person still without one.
 */
export function CharacterSkins({ rows: initial, bases }: { rows: SkinRow[]; bases: Record<string, string> }) {
  const [rows, setRows] = useState(initial);
  const [base, setBase] = useState<Record<string, string>>(() => Object.fromEntries(initial.map((r) => [r.person, r.base])));
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [open, setOpen] = useState<Record<string, number | null>>({});
  const [batch, setBatch] = useState(false);
  const say = (p: string, j: Job) => setJobs((m) => ({ ...m, [p]: j }));
  const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

  const make = async (r: SkinRow) => {
    say(r.person, { state: "busy", note: "Painting the character from the views… (about 10 seconds)" });
    const res = await makeCharacter(r.person, base[r.person]).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in res) return say(r.person, { state: "error", note: res.error }), false;
    setRows((list) =>
      list.map((x) =>
        x.person === r.person
          ? { ...x, liveModel: res.live ? res.version : x.liveModel, models: [{ version: res.version, url: res.url, createdAt: new Date().toISOString(), bytes: res.bytes }, ...x.models] }
          : x,
      ),
    );
    setOpen((o) => ({ ...o, [r.person]: res.version }));
    say(r.person, { state: "done", note: `Version ${res.version} made${res.live ? " and in use" : "; choose it below to use it"}. ${res.report.join("; ")}.` });
    return true;
  };
  const upload = async (r: SkinRow, f: File) => {
    if (!/\.glb$/i.test(f.name)) return say(r.person, { state: "error", note: "Choose a .glb file." });
    if (f.size > 50 * 1048576) return say(r.person, { state: "error", note: `That file is ${mb(f.size)}; the limit is 50 MB.` });
    say(r.person, { state: "busy", note: `Uploading ${f.name} (${mb(f.size)})…` });
    const start = await startCharacterUpload(r.person).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in start) return say(r.person, { state: "error", note: start.error });
    const sb = getBrowserClient();
    if (!sb) return say(r.person, { state: "error", note: "Storage isn't configured on this site." });
    const up = await sb.storage.from("art").uploadToSignedUrl(start.path, start.token, f, { contentType: "model/gltf-binary", upsert: true });
    if (up.error) return say(r.person, { state: "error", note: `The upload failed: ${up.error.message}` });
    const done = await finishCharacterUpload(r.person, start.version).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in done) return say(r.person, { state: "error", note: done.error });
    setRows((list) =>
      list.map((x) => (x.person === r.person ? { ...x, liveModel: done.version, models: [{ version: done.version, url: done.url, createdAt: new Date().toISOString(), bytes: done.bytes }, ...x.models] } : x)),
    );
    setOpen((o) => ({ ...o, [r.person]: done.version }));
    say(r.person, { state: "done", note: `Version ${done.version} uploaded and in use: ${done.report.join("; ")}.` });
  };
  const missing = rows.filter((r) => r.ready && !r.models.length && !jobs[r.person]);
  const makeAll = async () => {
    setBatch(true);
    for (const r of missing) await make(r);
    setBatch(false);
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="text-smoke">
          {rows.filter((r) => r.models.length).length} of {rows.length} made
        </span>
        <button
          type="button"
          disabled={batch || !missing.length}
          onClick={makeAll}
          className="rounded-[2px] bg-brass px-3 py-1.5 font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
        >
          {batch ? "Making…" : `Make all missing (${missing.length})`}
        </button>
      </div>
      <ul className="mt-3 divide-y divide-rule/60 border-y border-rule">
        {rows.map((r) => {
          const shown = open[r.person] ?? null;
          const model = shown != null ? r.models.find((m) => m.version === shown) : null;
          const job = jobs[r.person];
          return (
            <li key={r.person} className="flex gap-3 py-3">
              {r.front ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.front} alt="" className="h-24 w-16 shrink-0 rounded-[2px] bg-black/30 object-contain" loading="lazy" />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-[2px] bg-black/30 text-center text-[0.6rem] text-smoke">No views yet</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="text-paper">{r.name}</p>
                  <p className="font-mono text-[0.65rem] text-smoke">{r.person}</p>
                  {r.liveModel != null ? <p className="text-xs text-[#9fc79a]">In use: v{r.liveModel}</p> : null}
                  {r.liveModel != null ? (
                    <a
                      href={`/agency/testing/character?case=${r.group.toUpperCase()}&id=${r.person.slice(r.person.indexOf("_") + 1)}`}
                      className="text-xs text-brass underline-offset-4 hover:underline"
                    >
                      Test talking
                    </a>
                  ) : null}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <label className="text-smoke">
                    Base{" "}
                    <select
                      value={base[r.person]}
                      onChange={(e) => setBase((b) => ({ ...b, [r.person]: e.target.value }))}
                      className="rounded-[2px] border border-rule bg-black/30 px-1.5 py-0.5 text-paper"
                    >
                      {Object.entries(bases).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.ready ? (
                    <button type="button" disabled={job?.state === "busy" || batch} className="text-brass underline-offset-4 hover:underline disabled:opacity-50" onClick={() => make(r)}>
                      {r.models.length ? "Make again" : "Make 3D character"}
                    </button>
                  ) : (
                    <span className="text-xs text-smoke">Make the front, side and back views on the Artwork tab first</span>
                  )}
                  <label className={`cursor-pointer text-brass underline-offset-4 hover:underline ${job?.state === "busy" ? "pointer-events-none opacity-50" : ""}`}>
                    Upload GLB
                    <input
                      type="file"
                      accept=".glb,model/gltf-binary"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) upload(r, f);
                      }}
                    />
                  </label>
                </div>
                {job ? <p className={`mt-1 text-xs ${job.state === "error" ? "text-[#e2a7a2]" : job.state === "done" ? "text-[#9fc79a]" : "text-smoke"}`}>{job.note}</p> : null}
                {r.models.length ? (
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {r.models.slice(0, 5).map((m) => (
                      <li key={m.version} className="flex flex-wrap items-center gap-x-3">
                        <a href={m.url} className="font-mono text-paper underline-offset-4 hover:underline">
                          v{m.version}
                        </a>
                        <span className="text-smoke">
                          {mb(m.bytes)}, {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                        <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => setOpen((o) => ({ ...o, [r.person]: shown === m.version ? null : m.version }))}>
                          {shown === m.version ? "Hide 3D preview" : "Preview 3D"}
                        </button>
                        {r.liveModel === m.version ? (
                          <span className="text-brass">in use</span>
                        ) : (
                          <button
                            type="button"
                            className="text-brass underline-offset-4 hover:underline"
                            onClick={async () => {
                              const res = await chooseCharacter(r.person, m.version);
                              if ("error" in res) return say(r.person, { state: "error", note: res.error });
                              setRows((list) => list.map((x) => (x.person === r.person ? { ...x, liveModel: m.version } : x)));
                            }}
                          >
                            Use this one
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {model ? <ModelPreview url={model.url} className="mt-2 aspect-square w-full max-w-sm bg-black/30" /> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
