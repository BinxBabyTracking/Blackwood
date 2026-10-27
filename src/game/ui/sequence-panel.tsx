"use client";

import { useState } from "react";
import type { ActionResponse, ClientView, GameAction } from "../engine/types";
import { GameButton, Overlay } from "./overlay";

type Dispatch = (a: GameAction) => Promise<ActionResponse | null>;
type Seq = ClientView["sequences"][number];

/**
 * A timeline the player assembles: cards from what they have learned, laid
 * into the spaces of the day, then tested. Testing never says where a card
 * belongs; it only reports contradictions the cards as placed now show.
 */
export function SequencePanel({ view, dispatch, onClose, pending }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  const [which, setWhich] = useState(view.sequences[0]?.id ?? "");
  const q = view.sequences.find((x) => x.id === which) ?? view.sequences[0];
  return (
    <Overlay title={q?.title ?? "Timeline"} onClose={onClose} wide tone="paper" closeLabel="Close">
      {q ? <Strip key={q.id} q={q} dispatch={dispatch} pending={pending || view.status === "closed"} /> : <p className="p-6 font-serif">You have nothing to set in order yet.</p>}
      {view.sequences.length > 1 ? (
        <div className="flex gap-2 border-t border-[#2a241c]/20 p-3">
          {view.sequences.map((x) => (
            <button key={x.id} type="button" onClick={() => setWhich(x.id)} className="px-2 py-1 font-mono text-xs underline-offset-4 hover:underline aria-[current=true]:font-bold" aria-current={x.id === q?.id}>
              {x.title}
            </button>
          ))}
        </div>
      ) : null}
    </Overlay>
  );
}

function Strip({ q, dispatch, pending }: { q: Seq; dispatch: Dispatch; pending: boolean }) {
  const [held, setHeld] = useState<string | null>(null);
  const [result, setResult] = useState<{ found: { title: string; text: string }[]; message: string } | null>(null);
  const loose = q.cards.filter((c) => !q.placed[c.id]);
  const inSpace = (space: string) =>
    q.cards
      .filter((c) => q.placed[c.id]?.space === space)
      .sort((a, b) => q.placed[a.id].pos - q.placed[b.id].pos);

  const place = async (cardId: string, space: string | null, pos = 0) => {
    setHeld(null);
    setResult(null);
    await dispatch({ type: "sequencePlace", sequenceId: q.id, cardId, space, pos });
  };
  const putAtEnd = (space: string) => {
    if (!held) return;
    const cards = inSpace(space).filter((c) => c.id !== held);
    const last = cards.length ? q.placed[cards[cards.length - 1].id].pos : -1;
    return place(held, space, Math.min(99, last + 1));
  };
  /** Moves a card one step earlier or later within its space, renumbering the space so positions stay distinct. */
  const nudge = async (space: string, id: string, by: -1 | 1) => {
    const list = inSpace(space).map((c) => c.id);
    const i = list.indexOf(id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setResult(null);
    for (let n = 0; n < list.length; n++) {
      if (q.placed[list[n]]?.pos !== n) await dispatch({ type: "sequencePlace", sequenceId: q.id, cardId: list[n], space, pos: n });
    }
  };
  const test = async () => {
    const r = await dispatch({ type: "sequenceTest", sequenceId: q.id });
    if (r?.outcome.kind === "sequence") setResult({ found: r.outcome.found, message: r.outcome.message });
  };

  return (
    <div className="space-y-5 p-4 font-serif sm:p-6">
      <p className="bw-initial text-[0.98rem] leading-relaxed">{q.intro}</p>

      <section aria-label="Cards not yet placed">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">What you know ({loose.length} to place)</h3>
        {loose.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {loose.map((c) => (
              <li key={c.id}>
                <Card card={c} held={held === c.id} onClick={() => setHeld(held === c.id ? null : c.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm opacity-70">Every card you have is on the timeline. More come as you learn more.</p>
        )}
        <p className="mt-2 text-xs opacity-70">{held ? "Now choose where it belongs." : "Choose a card, then choose where it belongs. A claim goes where the speaker says it does."}</p>
      </section>

      <ol className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]">
        {q.spaces.map((sp) => {
          const cards = inSpace(sp.id);
          return (
            <li key={sp.id} className="flex flex-col border border-[#2a241c]/30 bg-[#f4ecd9]/60">
              <button
                type="button"
                disabled={!held || pending}
                onClick={() => putAtEnd(sp.id)}
                className={`border-b border-[#2a241c]/25 px-2 py-2 text-left font-display text-base leading-tight ${held ? "bg-[#d7aa45]/25 hover:bg-[#d7aa45]/45" : ""} disabled:cursor-default`}
              >
                {sp.label}
                {held ? <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] opacity-70">Place here</span> : null}
              </button>
              <ul className="flex flex-1 flex-col gap-1.5 p-1.5">
                {cards.map((c, i) => (
                  <li key={c.id} className="flex flex-col gap-1">
                    <Card card={c} held={held === c.id} onClick={() => setHeld(held === c.id ? null : c.id)} />
                    <span className="flex justify-end gap-1 font-mono text-[0.65rem]">
                      <button type="button" disabled={pending || i === 0} onClick={() => nudge(sp.id, c.id, -1)} aria-label={`Earlier: ${c.text}`} className="px-1 disabled:opacity-30">
                        ▲
                      </button>
                      <button type="button" disabled={pending || i === cards.length - 1} onClick={() => nudge(sp.id, c.id, 1)} aria-label={`Later: ${c.text}`} className="px-1 disabled:opacity-30">
                        ▼
                      </button>
                      <button type="button" disabled={pending} onClick={() => place(c.id, null)} aria-label={`Take off: ${c.text}`} className="px-1 disabled:opacity-30">
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <GameButton variant="paper" disabled={pending || !Object.keys(q.placed).length} onClick={test}>
          Test the timeline
        </GameButton>
        <span className="text-sm" role="status" aria-live="polite">
          {result ? (result.found.length ? `${result.found.length} new finding${result.found.length === 1 ? "" : "s"}.` : result.message) : ""}
        </span>
      </div>

      {q.findings.length ? (
        <section>
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">Findings</h3>
          <ul className="mt-2 space-y-3">
            {q.findings.map((f) => (
              <li key={f.id} className={`border-l-2 border-[#7d3a33] pl-3 ${result?.found.some((x) => x.title === f.title) ? "game-fade" : ""}`}>
                <p className="font-bold">{f.title}</p>
                <p className="text-sm leading-relaxed">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Card({ card, held, onClick }: { card: Seq["cards"][number]; held: boolean; onClick: () => void }) {
  const claim = card.kind === "claimed";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={held}
      className={`w-full max-w-[16rem] border px-2.5 py-2 text-left text-sm leading-snug shadow-sm transition-transform ${
        claim ? "border-[#7d3a33]/60 bg-[#f6e3d6] italic" : "border-[#2a241c]/35 bg-[#fbf5e6]"
      } ${held ? "-translate-y-0.5 ring-2 ring-[#d7aa45]" : "hover:-translate-y-0.5"}`}
    >
      <span className="mb-0.5 block font-mono text-[0.58rem] not-italic uppercase tracking-[0.14em] text-[#7d3a33]">{claim ? `As told by ${card.source}` : card.source}</span>
      {card.text}
    </button>
  );
}
