"use client";

import { useState } from "react";
import type { ActionResponse, ClientView, GameAction } from "../engine/types";
import { Overlay } from "./overlay";

type Dispatch = (a: GameAction) => Promise<ActionResponse | null>;
type Cmp = ClientView["comparisons"][number];

/**
 * Two documents side by side. The player chooses a passage and says what
 * differs; only true discrepancies are entered in the journal, with the
 * expert's word on each. Nothing on screen says which passages hide one.
 */
export function ComparisonPanel({ view, dispatch, onClose, pending }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  const [which, setWhich] = useState(() => (view.comparisons.find((c) => !c.done) ?? view.comparisons[0])?.id ?? "");
  const c = view.comparisons.find((x) => x.id === which) ?? view.comparisons[0];
  return (
    <Overlay title={c?.title ?? "Comparison"} onClose={onClose} wide tone="paper" closeLabel="Close">
      {view.comparisons.length > 1 ? (
        <nav className="flex flex-wrap gap-2 border-b border-[#2a241c]/20 px-4 py-2">
          {view.comparisons.map((x) => (
            <button key={x.id} type="button" onClick={() => setWhich(x.id)} aria-current={x.id === c?.id} className="px-2 py-1 font-mono text-xs underline-offset-4 hover:underline aria-[current=true]:font-bold">
              {x.title} {x.done ? "✓" : `(${x.found} of ${x.total})`}
            </button>
          ))}
        </nav>
      ) : null}
      {c ? <Lectern key={c.id} c={c} dispatch={dispatch} pending={pending || view.status === "closed"} /> : <p className="p-6 font-serif">You have nothing to compare yet.</p>}
    </Overlay>
  );
}

function Lectern({ c, dispatch, pending }: { c: Cmp; dispatch: Dispatch; pending: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [reply, setReply] = useState<{ region: string; correct: boolean; text: string } | null>(null);
  const pick = async (regionId: string, optionId: string) => {
    const r = await dispatch({ type: "compare", comparisonId: c.id, regionId, optionId });
    if (r?.outcome.kind === "compare") {
      setReply({ region: regionId, correct: r.outcome.correct, text: r.outcome.comment });
      if (r.outcome.correct) setOpen(null);
    }
  };
  return (
    <div className="space-y-5 p-4 font-serif sm:p-6">
      <p className="bw-initial text-[0.98rem] leading-relaxed">{c.intro}</p>
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#7d3a33]">
        {c.done ? `Complete. ${c.expert} has signed every point.` : `Discrepancies found: ${c.found}`}
      </p>
      <div className="hidden grid-cols-[8rem_1fr_1fr] gap-3 border-b border-[#2a241c]/25 pb-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] opacity-75 md:grid">
        <span />
        <span>{c.left}</span>
        <span>{c.right}</span>
      </div>
      <ul className="space-y-4">
        {c.regions.map((r) => (
          <li key={r.id} className={`border border-[#2a241c]/25 p-3 ${r.found ? "bg-[#e9dcb9]" : "bg-[#f8f1df]"}`}>
            <div className="grid gap-3 md:grid-cols-[8rem_1fr_1fr]">
              <p className="font-display text-lg leading-tight">
                {r.label}
                {r.found ? <span className="ml-1 text-[#4f6b4f]" aria-label="Discrepancy found"> ✓</span> : null}
              </p>
              <Passage title={c.left} text={r.leftText} image={r.leftImage} />
              <Passage title={c.right} text={r.rightText} image={r.rightImage} />
            </div>
            {r.found ? null : open === r.id ? (
              <fieldset className="mt-3 space-y-1.5" disabled={pending}>
                <legend className="mb-1 text-sm italic">What differs here?</legend>
                {r.options.map((o) => (
                  <button key={o.id} type="button" onClick={() => pick(r.id, o.id)} className="block w-full border border-[#2a241c]/30 bg-[#fbf5e6] px-3 py-2 text-left text-sm hover:border-[#7d3a33] disabled:opacity-50">
                    {o.text}
                  </button>
                ))}
                <button type="button" onClick={() => setOpen(null)} className="pt-1 text-xs underline-offset-4 hover:underline">
                  Not now
                </button>
              </fieldset>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setOpen(r.id);
                  setReply(null);
                }}
                className="mt-3 border border-[#2a241c]/40 px-3 py-1.5 text-sm hover:bg-[#2a241c] hover:text-[#ebe2cd] disabled:opacity-50"
              >
                Say what differs
              </button>
            )}
            {reply?.region === r.id ? (
              <p role="status" className={`mt-3 border-l-2 pl-3 text-sm leading-relaxed ${reply.correct ? "border-[#4f6b4f]" : "border-[#7d3a33] italic"}`}>
                {reply.text}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {c.notes.length ? (
        <section>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">Entered in the journal</h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed">
            {c.notes.map((n) => (
              <li key={n.region}>
                <span className="font-bold">{n.region}.</span> {c.expert ? `${c.expert}: ` : ""}
                {n.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Passage({ title, text, image }: { title: string; text: string; image: string | null }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] opacity-70 md:hidden">{title}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image ? <img src={image} alt="" draggable={false} className="mb-2 aspect-[4/3] w-full border border-[#2a241c]/20 object-cover" /> : null}
      <p className="text-[0.95rem] leading-relaxed">{text}</p>
    </div>
  );
}
