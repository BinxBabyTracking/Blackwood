"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionOutcome, ClientView, GameAction, Theory } from "../engine/types";
import { GameButton, Overlay } from "./overlay";

type Dispatch = (a: GameAction) => Promise<unknown>;
type Out<K extends ActionOutcome["kind"]> = Extract<ActionOutcome, { kind: K }>;

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
    <ul className="mt-3 space-y-2">
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
                Collect Evidence
              </GameButton>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The case dossier: a manila folder with a typed summary sheet, the people involved, and the report. */
export function DocumentPanel({ data, view, dispatch, onClose, pending }: { data: Out<"document">; view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean }) {
  return (
    <Overlay title={data.title} onClose={onClose} tone="paper" closeLabel="Close the file" wide>
      <div className="relative p-5 sm:p-8">
        <span aria-hidden className="pointer-events-none absolute right-8 top-6 hidden rotate-[-8deg] border-[3px] border-[#7d3a33]/70 px-3 py-1 font-mono text-sm font-bold tracking-[0.2em] text-[#7d3a33]/70 sm:block">
          CONFIDENTIAL
        </span>
        {data.dossier.length ? (
          <dl className="grid max-w-2xl grid-cols-[9rem_1fr] gap-x-4 gap-y-1.5 border-b border-dashed border-[#2a241c]/40 pb-5 font-mono text-[0.9rem]">
            {data.dossier.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-xs uppercase tracking-[0.1em] text-[#2a241c]/60">{f.label}</dt>
                <dd className={f.label === "Case ID" ? "font-bold text-[#7d3a33]" : ""}>{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {data.people.length ? (
          <section className="mt-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7d3a33]">Persons present, Saturday evening</h3>
            <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.people.map((p) => (
                <li key={p.id} className="bg-[#f4ecd9] p-2 shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.portrait} alt="" className="aspect-[4/5] w-full object-cover grayscale" />
                  <p className="mt-2 font-serif text-sm font-bold leading-tight">{p.name}</p>
                  <p className="font-mono text-[0.68rem] leading-snug opacity-70">{p.role}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 space-y-6">
          {data.pages.map((p, i) => (
            <section key={i}>
              {p.heading ? <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7d3a33]">{p.heading}</h3> : null}
              <p className="mt-1 max-w-[70ch] font-mono text-[0.95rem] leading-relaxed">{p.body}</p>
            </section>
          ))}
        </div>
        {data.evidence.length ? (
          <section className="mt-8">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7d3a33]">Enclosed</h3>
            <CollectList items={data.evidence} dispatch={dispatch} pending={pending} view={view} />
          </section>
        ) : null}
        <div className="mt-8">
          <GameButton variant="paper" onClick={onClose}>
            Close the file
          </GameButton>
        </div>
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
// Police tapes
// ---------------------------------------------------------------------------

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
