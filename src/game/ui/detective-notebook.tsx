"use client";

import { useState } from "react";
import type { ClientView, GameAction } from "../engine/types";
import { EvidenceList } from "./evidence-inventory";
import { GameButton, Overlay } from "./overlay";

type Dispatch = (a: GameAction) => Promise<unknown>;

export const TABS = ["Objectives", "Evidence", "People", "Interviews", "Timeline", "Deductions", "My notes"] as const;

/** The detective notebook: objectives, evidence, people, interviews, timeline, deductions and private notes. */
export function DetectiveNotebook({
  view,
  dispatch,
  onClose,
  onOpenEvidence,
  pending,
  initialTab = "Objectives",
}: {
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  onOpenEvidence: (id: string) => void;
  pending: boolean;
  initialTab?: (typeof TABS)[number];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(initialTab);
  const [notes, setNotes] = useState(view.playerNotes);
  const [saved, setSaved] = useState<"idle" | "saved" | "error">("idle");
  const records = view.notebook.filter((n) => n.kind === "call" || n.kind === "document").slice().reverse();

  return (
    <Overlay title="Notebook" onClose={onClose} wide tone="paper" closeLabel="Close notebook">
      <div className="flex min-h-[70vh] flex-col md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#2a241c]/20 p-2 md:w-44 md:flex-col md:border-b-0 md:border-r">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={t === tab}
              className="whitespace-nowrap px-3 py-2 text-left font-mono text-sm hover:bg-[#2a241c]/10 aria-[current=true]:bg-[#2a241c] aria-[current=true]:text-[#ebe2cd]"
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 p-6 font-serif">
          {tab === "Objectives" ? (
            <ul className="space-y-3">
              {view.objectives.map((o) => (
                <li key={o.id} className={`flex gap-3 ${o.done ? "line-through opacity-60" : ""}`}>
                  <span aria-hidden>{o.done ? "☑" : "☐"}</span>
                  <span>
                    {o.text}
                    <span className="sr-only">{o.done ? " (done)" : ""}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "Evidence" ? <EvidenceList items={view.evidence} onOpen={onOpenEvidence} tone="paper" detailed /> : null}
          {tab === "People" ? (
            view.characters.length ? (
              <ul className="space-y-5">
                {view.characters.map((c) => (
                  <li key={c.id} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.portrait} alt="" className="h-20 w-16 shrink-0 object-cover grayscale-[30%]" />
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="font-mono text-xs opacity-70">{c.role}</p>
                      {c.bio.map((b, i) => (
                        <p key={i} className="mt-1 text-sm">
                          {b}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="opacity-70">Read the case file to learn who was there.</p>
            )
          ) : null}
          {tab === "Interviews" ? <InterviewRecords view={view} records={records} /> : null}
          {tab === "Timeline" ? (
            <ol className="space-y-3 border-l border-[#2a241c]/30 pl-5">
              {sortTimeline(view.timeline).map((t, i) => (
                <li key={i}>
                  <span className="font-mono text-sm font-bold">{t.time}</span> <span>{t.text}</span>
                  <span className="block font-mono text-xs opacity-60">Source: {t.source}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {tab === "Deductions" ? (
            view.deductions.length ? (
              <ul className="space-y-4">
                {view.deductions.map((d) => (
                  <li key={d.id}>
                    <p className="font-bold">{d.title}</p>
                    <p className="text-sm leading-relaxed">{d.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="opacity-70">Nothing established yet. Connect evidence on the murder board to test your ideas.</p>
            )
          ) : null}
          {tab === "My notes" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await dispatch({ type: "saveNotes", text: notes });
                setSaved(r ? "saved" : "error");
              }}
            >
              <label htmlFor="player-notes" className="font-mono text-xs opacity-70">
                Your own notes. Only you can see these.
              </label>
              <textarea
                id="player-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setSaved("idle");
                }}
                maxLength={20000}
                className="mt-2 h-72 w-full resize-y border border-[#2a241c]/30 bg-[#f4ecd9] p-3 font-mono text-sm outline-none focus:border-[#2a241c]"
              />
              <div className="mt-3 flex items-center gap-3">
                <GameButton type="submit" variant="paper" disabled={pending || notes === view.playerNotes}>
                  Save notes
                </GameButton>
                <span aria-live="polite" className="font-mono text-xs">
                  {saved === "saved" ? "Notes saved." : saved === "error" ? "Notes were not saved." : ""}
                </span>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </Overlay>
  );
}

/** Friday evening first, then the small hours and Saturday. Times are read from the entry, e.g. "11:05 PM" or "7:40 AM (Sat)". */
function sortTimeline<T extends { time: string }>(list: T[]) {
  const key = (t: string) => {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t);
    if (!m) return 9999;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === "PM") h += 12;
    else h += 24; // morning entries belong to the following day
    return h * 60 + Number(m[2]);
  };
  return list.map((t, i) => ({ t, i })).sort((a, b) => key(a.t.time) - key(b.t.time) || a.i - b.i).map((x) => x.t);
}

function InterviewRecords({ view, records }: { view: ClientView; records: ClientView["notebook"] }) {
  const people = view.interviews;
  const [sel, setSel] = useState<string>(people.find((p) => p.transcript.length)?.characterId ?? people[0]?.characterId ?? "records");
  const p = people.find((x) => x.characterId === sel);
  if (!people.length && !records.length) return <p className="opacity-70">Your interview notes will be written here.</p>;
  return (
    <div className="grid gap-5 lg:grid-cols-[13rem_1fr]">
      <ul className="space-y-1">
        {people.map((x) => (
          <li key={x.characterId}>
            <button
              type="button"
              onClick={() => setSel(x.characterId)}
              aria-current={x.characterId === sel}
              className="w-full px-2 py-1.5 text-left hover:bg-[#2a241c]/10 aria-[current=true]:bg-[#2a241c] aria-[current=true]:text-[#ebe2cd]"
            >
              <span className="block text-sm font-bold">{x.name}</span>
              <span className="block font-mono text-[0.65rem] opacity-75">
                {x.status}
                {x.contradictions.length ? ` · ${x.contradictions.length} inconsistenc${x.contradictions.length === 1 ? "y" : "ies"}` : ""}
              </span>
            </button>
          </li>
        ))}
        {records.length ? (
          <li>
            <button
              type="button"
              onClick={() => setSel("records")}
              aria-current={sel === "records"}
              className="w-full px-2 py-1.5 text-left text-sm hover:bg-[#2a241c]/10 aria-[current=true]:bg-[#2a241c] aria-[current=true]:text-[#ebe2cd]"
            >
              Calls and documents
            </button>
          </li>
        ) : null}
      </ul>
      <div className="min-w-0">
        {p ? (
          <article>
            <header className="flex gap-4 border-b border-[#2a241c]/20 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.portrait} alt="" className="h-20 w-16 shrink-0 object-cover grayscale-[30%]" />
              <div>
                <p className="text-lg font-bold">{p.name}</p>
                <p className="font-mono text-xs opacity-70">{p.role}</p>
                <p className="mt-1 font-mono text-xs">
                  {p.where}
                  <span aria-hidden> · </span>
                  {p.status}
                  {p.demeanor ? <> · Manner: {p.demeanor}</> : null}
                </p>
              </div>
            </header>
            {p.contradictions.length ? (
              <section className="mt-4">
                <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">Inconsistencies established</h3>
                <ul className="mt-2 space-y-2">
                  {p.contradictions.map((c) => (
                    <li key={c.id} className="border-l-2 border-[#7d3a33] pl-3 text-sm leading-relaxed">
                      {c.text}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {p.statements.length ? (
              <section className="mt-4">
                <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">Important statements</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                  {p.statements.map((x) => (
                    <li key={x.id}>{x.text}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="mt-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#7d3a33]">Transcript ({p.asked} question{p.asked === 1 ? "" : "s"} asked)</h3>
              {p.transcript.length ? (
                <ol className="mt-2 space-y-1.5 font-mono text-[0.82rem] leading-relaxed">
                  {p.transcript.map((l) =>
                    l.kind === "cue" ? (
                      <li key={l.n} className="italic opacity-70">
                        {l.text}
                      </li>
                    ) : (
                      <li key={l.n}>
                        <span className={`mr-2 text-[0.7rem] uppercase ${l.speakerId === "you" ? "text-[#7d3a33]" : "font-bold"}`}>{l.speaker}:</span>
                        {l.text}
                      </li>
                    ),
                  )}
                </ol>
              ) : (
                <p className="mt-2 text-sm opacity-70">Not interviewed yet.</p>
              )}
            </section>
          </article>
        ) : (
          <ul className="space-y-4">
            {records.map((n) => (
              <li key={n.id}>
                <p className="font-mono text-xs text-[#7d3a33]">{n.title}</p>
                <p className="mt-1 text-sm leading-relaxed">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
