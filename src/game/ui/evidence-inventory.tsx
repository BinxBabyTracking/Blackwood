"use client";

import type { ClientEvidence } from "../engine/types";
import { Overlay } from "./overlay";

/** Collected evidence as a grid of tagged photographs. Selecting one reopens its inspection. */
export function EvidenceList({ items, onOpen, tone = "dark" }: { items: ClientEvidence[]; onOpen: (id: string) => void; tone?: "dark" | "paper" }) {
  if (!items.length) {
    return <p className={tone === "paper" ? "opacity-70" : "text-smoke"}>No evidence collected yet. Search the scenes for anything worth a closer look.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onOpen(e.id)}
            className={`flex w-full gap-3 p-2 text-left transition-colors ${
              tone === "paper" ? "border border-[#2a241c]/20 hover:border-[#2a241c]" : "border border-white/10 hover:border-brass"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.image} alt="" className="h-16 w-24 shrink-0 object-cover" />
            <dl className="grid min-w-0 grid-cols-[auto_1fr] content-start gap-x-3 font-mono text-[0.7rem] leading-relaxed">
              <dt className="opacity-60">Evidence ID</dt>
              <dd className={tone === "paper" ? "text-[#7d3a33]" : "text-brass"}>{e.id}</dd>
              <dt className="opacity-60">Title</dt>
              <dd className="truncate">{e.title}</dd>
              <dt className="opacity-60">Location</dt>
              <dd className="truncate">{e.foundAt ?? e.source}</dd>
              <dt className="opacity-60">Status</dt>
              <dd>{e.collected ? "Collected" : "Not collected"}</dd>
            </dl>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function EvidenceInventory({ items, onOpen, onClose }: { items: ClientEvidence[]; onOpen: (id: string) => void; onClose: () => void }) {
  return (
    <Overlay title={`Evidence collected (${items.length})`} onClose={onClose} wide>
      <div className="p-6">
        <EvidenceList items={items} onOpen={onOpen} />
      </div>
    </Overlay>
  );
}
