"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionOutcome, ClientEvidence, ClientView, GameAction, Theory } from "../engine/types";
import { GameButton, Overlay } from "./overlay";
import { ZoomImage } from "./zoom-image";

type Dispatch = (a: GameAction) => Promise<unknown>;
type Out<K extends ActionOutcome["kind"]> = Extract<ActionOutcome, { kind: K }>;

// ---------------------------------------------------------------------------
// Inspection: hotspots and collected evidence
// ---------------------------------------------------------------------------

export function InspectPanel({
  data,
  view,
  dispatch,
  onClose,
  pending,
}: {
  data: Out<"inspect">;
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
}) {
  const ev = data.evidenceId ? view.evidence.find((e) => e.id === data.evidenceId) : undefined;
  if (ev) return <EvidencePanel ev={ev} view={view} dispatch={dispatch} onClose={onClose} pending={pending} />;
  return (
    <Overlay title={data.title} onClose={onClose}>
      <div className="grid gap-0 sm:grid-cols-[1fr]">
        {data.image ? <ZoomImage src={data.image} alt={data.title} /> : null}
        <div className="p-6">
          <p className="font-serif text-lg leading-relaxed text-paper/90">{data.text}</p>
          {data.evidenceId && !ev ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <GameButton disabled={pending || view.status === "closed"} onClick={() => dispatch({ type: "collect", evidenceId: data.evidenceId! })}>
                Add to Notebook
              </GameButton>
              <GameButton variant="ghost" onClick={onClose}>
                Return to scene
              </GameButton>
            </div>
          ) : null}
        </div>
      </div>
    </Overlay>
  );
}

export function EvidencePanel({
  ev,
  view,
  dispatch,
  onClose,
  pending,
}: {
  ev: ClientEvidence;
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
}) {
  const pinned = view.board.items.some((i) => i.id === ev.id);
  return (
    <Overlay title={`${ev.id}  ${ev.title}`} onClose={onClose} wide>
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <ZoomImage src={ev.image} alt={ev.title} />
        <div className="flex flex-col p-6">
          <p className="text-xs text-smoke">Found at {ev.source}</p>
          <p className="mt-3 text-paper/90">{ev.description}</p>
          <p className="mt-4 border-l-2 border-brass/60 pl-4 font-serif leading-relaxed text-paper/90">{ev.inspection}</p>
          {ev.audio ? <audio controls src={ev.audio} className="mt-4 w-full" /> : null}
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-auto">
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ok)]">In your notebook</span>
            {ev.boardable ? (
              <GameButton
                variant="ghost"
                disabled={pinned || pending || view.status === "closed"}
                onClick={() => dispatch({ type: "boardAdd", itemId: ev.id, x: 10 + Math.random() * 70, y: 10 + Math.random() * 60 })}
              >
                {pinned ? "On the murder board" : "Add to Murder Board"}
              </GameButton>
            ) : null}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ---------------------------------------------------------------------------
// Documents, deliveries, calls
// ---------------------------------------------------------------------------

function CollectList({
  items,
  dispatch,
  pending,
  view,
  tone = "paper",
}: {
  items: { id: string; title: string; collected: boolean }[];
  dispatch: Dispatch;
  pending: boolean;
  view: ClientView;
  tone?: "paper" | "dark";
}) {
  if (!items.length) return null;
  return (
    <ul className="mt-6 space-y-2">
      {items.map((it) => {
        const have = view.evidence.some((e) => e.id === it.id);
        return (
          <li key={it.id} className={`flex flex-wrap items-center justify-between gap-3 border px-4 py-3 ${tone === "paper" ? "border-[#2a241c]/25" : "border-white/10"}`}>
            <span className="font-mono text-sm">
              {it.id} {it.title}
            </span>
            {have ? (
              <span className="text-xs opacity-70">In your notebook</span>
            ) : (
              <GameButton variant={tone === "paper" ? "paper" : "ghost"} disabled={pending || view.status === "closed"} onClick={() => dispatch({ type: "collect", evidenceId: it.id })}>
                Add to Notebook
              </GameButton>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function DocumentPanel({ data, view, dispatch, onClose, pending }: { data: Out<"document">; view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  return (
    <Overlay title={data.title} onClose={onClose} tone="paper" closeLabel="Close the file">
      <div className="space-y-6 p-6 sm:p-8">
        {data.pages.map((p, i) => (
          <section key={i}>
            {p.heading ? <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7d3a33]">{p.heading}</h3> : null}
            <p className="mt-1 font-mono text-[0.95rem] leading-relaxed">{p.body}</p>
          </section>
        ))}
        <CollectList items={data.evidence} dispatch={dispatch} pending={pending} view={view} />
      </div>
    </Overlay>
  );
}

export function DeliveryPanel({ data, view, dispatch, onClose, pending }: { data: Out<"delivery">; view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  return (
    <Overlay title={data.title} onClose={onClose} tone="paper" closeLabel="Put it down">
      <div className="p-6 sm:p-8">
        <p className="font-serif text-lg italic leading-relaxed">{data.text}</p>
        <CollectList items={data.evidence} dispatch={dispatch} pending={pending} view={view} />
      </div>
    </Overlay>
  );
}

export function MailPanel({ view, dispatch, onClose, pending }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  return (
    <Overlay title="Mail and deliveries" onClose={onClose}>
      <div className="p-6">
        {view.deliveries.length === 0 ? (
          <p className="text-smoke">Nothing has arrived.</p>
        ) : (
          <ul className="space-y-2">
            {view.deliveries.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => dispatch({ type: "openDelivery", deliveryId: d.id })}
                  className="w-full border border-white/10 px-4 py-3 text-left hover:border-brass"
                >
                  {d.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Overlay>
  );
}

export function CallPanel({ data, onClose }: { data: Out<"call">; onClose: () => void }) {
  return (
    <Overlay title={data.title} onClose={onClose} closeLabel="Hang up">
      <div className="space-y-4 p-6">
        {data.lines.map((l, i) => (
          <p key={i} className="font-serif text-lg leading-relaxed text-paper/90">
            {l}
          </p>
        ))}
      </div>
    </Overlay>
  );
}

export function PhonePanel({ view, dispatch, onClose, pending }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  const closed = view.status === "closed";
  return (
    <Overlay title="Telephone" onClose={onClose}>
      <div className="space-y-8 p-6">
        {view.phone.ringing ? (
          <div className="border border-brass/50 bg-brass/10 p-4">
            <p className="font-serif text-lg">The line is ringing.</p>
            <GameButton className="mt-3" disabled={pending || closed} onClick={() => dispatch({ type: "answerCall", callId: view.phone.ringing!.id })}>
              Answer the telephone
            </GameButton>
          </div>
        ) : null}
        <div>
          <h3 className="text-sm text-smoke">Make a call</h3>
          {view.phone.outgoing.length ? (
            <ul className="mt-3 space-y-2">
              {view.phone.outgoing.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={pending || closed}
                    onClick={() => dispatch({ type: "placeCall", callId: c.id })}
                    className="w-full border border-white/10 px-4 py-3 text-left hover:border-brass disabled:opacity-50"
                  >
                    <span className="block text-xs text-smoke">{c.to}</span>
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-smoke">There is no one you need to call right now.</p>
          )}
        </div>
        {view.phone.log.length ? (
          <div>
            <h3 className="text-sm text-smoke">Earlier calls</h3>
            <ul className="mt-2 space-y-1 text-sm text-paper/80">
              {view.phone.log.map((c, i) => (
                <li key={`${c.id}-${i}`}>{c.title}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-smoke">What was said is recorded in your notebook.</p>
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}

// ---------------------------------------------------------------------------
// Map and police tapes
// ---------------------------------------------------------------------------

export function MapPanel({ view, dispatch, onClose, pending }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  return (
    <Overlay title="Street map: where to next?" onClose={onClose} wide>
      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        {view.map.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={!m.available || m.current || pending}
            onClick={() => dispatch({ type: "travel", locationId: m.id })}
            className="flex flex-col items-start bg-[#161b20] px-5 py-4 text-left transition-colors enabled:hover:bg-[#1f262d] disabled:cursor-not-allowed"
          >
            <span className={`font-serif text-lg ${m.available ? "text-paper" : "text-smoke/50"}`}>{m.name}</span>
            <span className="text-sm text-smoke">{m.available ? m.subtitle : "You have no reason to go there yet."}</span>
            <span className="mt-2 font-mono text-xs text-brass">{m.current ? "You are here" : m.visited ? "Visited" : m.available ? "Not visited" : ""}</span>
          </button>
        ))}
      </div>
    </Overlay>
  );
}

export function StatementsPanel({ view, onClose }: { view: ClientView; onClose: () => void }) {
  const [sel, setSel] = useState(view.statements[0]?.characterId ?? "");
  const st = view.statements.find((s) => s.characterId === sel);
  return (
    <Overlay title="Recorded police statements" onClose={onClose} wide>
      {view.statements.length === 0 ? (
        <p className="p-6 text-smoke">Read the case file first; the tapes are listed in it.</p>
      ) : (
        <div className="grid md:grid-cols-[14rem_1fr]">
          <ul className="border-b border-white/10 md:border-b-0 md:border-r">
            {view.statements.map((s) => (
              <li key={s.characterId}>
                <button
                  type="button"
                  onClick={() => setSel(s.characterId)}
                  aria-current={s.characterId === sel}
                  className="w-full px-5 py-3 text-left text-sm hover:bg-white/5 aria-[current=true]:bg-white/10 aria-[current=true]:text-brass"
                >
                  {s.name}
                  <span className="block font-mono text-xs text-smoke">{s.recordedAt}</span>
                </button>
              </li>
            ))}
          </ul>
          {st ? (
            <div className="p-6">
              {st.audio ? (
                <audio controls src={st.audio} className="mb-5 w-full" />
              ) : (
                <p className="mb-5 font-mono text-xs text-smoke">Tape not yet digitised. Transcript follows.</p>
              )}
              <dl className="space-y-3">
                {st.transcript.map((l, i) => (
                  <div key={i} className="grid grid-cols-[8.5rem_1fr] gap-3">
                    <dt className="font-mono text-xs uppercase tracking-wide text-brass">{l.speaker}</dt>
                    <dd className="font-mono text-sm leading-relaxed text-paper/90">{l.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </Overlay>
  );
}

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------

export function ConversationPanel({
  data,
  view,
  dispatch,
  onClose,
  pending,
}: {
  data: Out<"conversation">;
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
}) {
  const [showing, setShowing] = useState(false);
  const person = view.characters.find((c) => c.id === data.characterId);
  const closed = view.status === "closed";
  return (
    <Overlay title={person ? `${person.name}, ${person.role}` : "Interview"} onClose={onClose} wide closeLabel="End conversation">
      <div className="grid min-h-[60vh] md:grid-cols-[16rem_1fr]">
        <div className="hidden border-r border-white/10 md:block">
          {person ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.portrait} alt="" className="aspect-[4/5] w-full object-cover" />
          ) : null}
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-6" aria-live="polite">
            {data.history.length === 0 ? <p className="text-smoke">{person?.name} waits for your first question.</p> : null}
            {data.history.map((h, i) => (
              <p key={i} className={h.speaker === "You" ? "text-right text-sm text-brass" : "font-serif text-lg leading-relaxed text-paper/90"}>
                {h.speaker === "You" ? h.text : <>{h.text}</>}
              </p>
            ))}
          </div>
          <div className="border-t border-white/10 p-4">
            {showing ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-smoke">Show {person?.name.split(" ")[0]} a piece of evidence</p>
                  <button type="button" className="text-sm text-smoke hover:text-paper" onClick={() => setShowing(false)}>
                    Back to questions
                  </button>
                </div>
                {view.evidence.length ? (
                  <ul className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                    {view.evidence.map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          disabled={pending || closed}
                          onClick={() => {
                            setShowing(false);
                            dispatch({ type: "present", characterId: data.characterId, evidenceId: e.id });
                          }}
                          className="w-full border border-white/10 px-3 py-2 text-left text-xs hover:border-brass"
                        >
                          <span className="font-mono text-brass">{e.id}</span> {e.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-smoke">You have not collected any evidence yet.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {data.questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    disabled={pending || closed}
                    onClick={() => dispatch({ type: "ask", questionId: q.id })}
                    className="block w-full border border-white/10 px-4 py-2.5 text-left text-sm hover:border-brass hover:text-brass disabled:opacity-50"
                  >
                    {q.prompt}
                  </button>
                ))}
                {data.questions.length === 0 ? <p className="text-sm text-smoke">You have nothing else to ask right now.</p> : null}
                <button type="button" onClick={() => setShowing(true)} disabled={closed} className="mt-1 text-sm text-brass underline-offset-4 hover:underline disabled:opacity-50">
                  Show evidence
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ---------------------------------------------------------------------------
// Notebook
// ---------------------------------------------------------------------------

const TABS = ["Objectives", "Evidence", "People", "Interviews", "Timeline", "Deductions", "My notes"] as const;

export function NotebookPanel({
  view,
  dispatch,
  onClose,
  onOpenEvidence,
  pending,
}: {
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  onOpenEvidence: (id: string) => void;
  pending: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Objectives");
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
          {tab === "Evidence" ? (
            view.evidence.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {view.evidence.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => onOpenEvidence(e.id)} className="flex w-full gap-3 border border-[#2a241c]/20 p-2 text-left hover:border-[#2a241c]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.image} alt="" className="h-14 w-20 shrink-0 object-cover" />
                      <span>
                        <span className="block font-mono text-xs text-[#7d3a33]">{e.id}</span>
                        <span className="text-sm">{e.title}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="opacity-70">No evidence collected yet.</p>
            )
          ) : null}
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

// ---------------------------------------------------------------------------
// Conclusion and closure
// ---------------------------------------------------------------------------

export function ConclusionPanel({
  view,
  dispatch,
  onClose,
  pending,
  feedback,
}: {
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
  feedback: string | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<string[]>([]);
  const ready = view.conclusion.choices.every((c) => answers[c.id]) && evidence.length > 0;
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [feedback, view.conclusion.attempts]);
  const theory = useMemo<Theory>(
    () => ({ culprit: answers.culprit ?? "", motive: answers.motive ?? "", weapon: answers.weapon ?? "", location: answers.location ?? "", evidence }),
    [answers, evidence],
  );

  return (
    <Overlay title="Report to the agency: conclusion" onClose={onClose} wide tone="paper" closeLabel="Keep investigating">
      <form
        className="space-y-8 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) dispatch({ type: "submitConclusion", theory });
        }}
      >
        <p className="font-serif">
          Submit only when you can support every answer. An unsupported report will be returned, and you can keep investigating.
          {view.conclusion.attempts ? <span className="font-mono text-xs"> Reports returned so far: {view.conclusion.attempts}.</span> : null}
        </p>
        {feedback ? (
          <p ref={feedbackRef} role="alert" className="border-l-4 border-[#7d3a33] bg-[#7d3a33]/10 p-4 font-serif">
            {feedback}
          </p>
        ) : null}
        {view.conclusion.choices.map((c) => (
          <fieldset key={c.id}>
            <legend className="font-mono text-sm font-bold">{c.question}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {c.options.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-3 border border-[#2a241c]/25 px-3 py-2 has-[:checked]:border-[#2a241c] has-[:checked]:bg-[#2a241c]/10">
                  <input type="radio" name={c.id} value={o.id} checked={answers[c.id] === o.id} onChange={() => setAnswers((a) => ({ ...a, [c.id]: o.id }))} className="accent-[#2a241c]" />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <fieldset>
          <legend className="font-mono text-sm font-bold">Which evidence supports your conclusion?</legend>
          {view.evidence.length ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {view.evidence.map((e) => (
                <label key={e.id} className="flex cursor-pointer items-center gap-3 border border-[#2a241c]/25 px-3 py-2 text-sm has-[:checked]:border-[#2a241c] has-[:checked]:bg-[#2a241c]/10">
                  <input
                    type="checkbox"
                    checked={evidence.includes(e.id)}
                    onChange={(ev) => setEvidence((list) => (ev.target.checked ? [...list, e.id] : list.filter((x) => x !== e.id)))}
                    className="accent-[#2a241c]"
                  />
                  <span className="font-mono text-xs">{e.id}</span> {e.title}
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm">You have not collected any evidence.</p>
          )}
        </fieldset>
        <GameButton type="submit" variant="paper" disabled={!ready || pending || view.status === "closed"}>
          {pending ? "Filing report" : "File my conclusion"}
        </GameButton>
      </form>
    </Overlay>
  );
}

export function ClosureSequence({ pages, onDone }: { pages: NonNullable<ClientView["closure"]>; onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === pages.length - 1;
  const p = pages[i];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6" role="dialog" aria-modal="true" aria-label="Case closure">
      <div key={i} className="max-w-2xl text-center game-closure">
        <p className="font-mono text-sm tracking-[0.2em] text-brass">{p.heading.toUpperCase()}</p>
        <p className="mt-6 font-serif text-2xl leading-relaxed text-paper/90 sm:text-3xl">{p.body}</p>
        <div className="mt-12 flex justify-center gap-4">
          {last ? (
            <GameButton onClick={onDone}>Close the file</GameButton>
          ) : (
            <GameButton onClick={() => setI(i + 1)}>Continue</GameButton>
          )}
        </div>
        <p className="mt-6 font-mono text-xs text-smoke">
          {i + 1} / {pages.length}
        </p>
      </div>
    </div>
  );
}

export function IntroSequence({ view, onDone, pending }: { view: ClientView; onDone: () => void; pending: boolean }) {
  const [i, setI] = useState(0);
  const last = i === view.intro.length - 1;
  const p = view.intro[i];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gradient-to-t from-black via-black/85 to-black/40 px-6 pb-16 sm:items-center sm:pb-0">
      <div key={i} className="max-w-2xl game-closure">
        {i === 0 ? <p className="font-mono text-sm tracking-[0.2em] text-brass">{view.caseId} / {view.title.toUpperCase()}</p> : null}
        {p.heading ? <p className="mt-3 font-serif italic text-brass">{p.heading}</p> : null}
        <p className="mt-4 font-serif text-2xl leading-relaxed text-paper/95 sm:text-3xl">{p.text}</p>
        <div className="mt-10 flex gap-4">
          {last ? (
            <GameButton onClick={onDone} disabled={pending}>
              Open the file
            </GameButton>
          ) : (
            <GameButton onClick={() => setI(i + 1)}>Continue</GameButton>
          )}
          {!last ? (
            <button type="button" onClick={onDone} className="text-sm text-smoke hover:text-paper">
              Skip
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
