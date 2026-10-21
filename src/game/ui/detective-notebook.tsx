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
  const interviews = view.notebook.filter((n) => n.kind === "interview" || n.kind === "call" || n.kind === "document").slice().reverse();

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
          {tab === "Interviews" ? (
            interviews.length ? (
              <ul className="space-y-4">
                {interviews.map((n) => (
                  <li key={n.id}>
                    <p className="font-mono text-xs text-[#7d3a33]">{n.title}</p>
                    <p className="mt-1 text-sm leading-relaxed">{n.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="opacity-70">Your interview notes will be written here.</p>
            )
          ) : null}
          {tab === "Timeline" ? (
            <ol className="space-y-3 border-l border-[#2a241c]/30 pl-5">
              {view.timeline.map((t, i) => (
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
