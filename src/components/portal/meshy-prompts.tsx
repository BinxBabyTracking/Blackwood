"use client";

import { useState } from "react";

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
};

/**
 * Every 3D model of a case with its Meshy text prompt, ready to copy. Uploading the GLB stays on the
 * Artwork tab, beside the model's reference picture.
 */
export function MeshyPrompts({ rows }: { rows: MeshyRow[] }) {
  const [copied, setCopied] = useState<string | null>(null);
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
                    <button type="button" className="mt-1.5 text-sm text-brass underline-offset-4 hover:underline" onClick={() => copy(r.id, r.prompt)}>
                      {copied === r.id ? "Copied" : copied === `fail:${r.id}` ? "Couldn't copy: select the prompt and copy it by hand" : "Copy prompt"}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
