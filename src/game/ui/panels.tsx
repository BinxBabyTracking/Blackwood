"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActionOutcome, ClientView, GameAction } from "../engine/types";
import { voiceSrc } from "./interview-screen";
import { NarrationPlayer } from "./narration-player";
import { GameButton, Overlay } from "./overlay";
import { useLinePlayer } from "./use-line-player";

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
export function DocumentPanel({
  caseId,
  data,
  view,
  dispatch,
  onClose,
  pending,
  volume,
}: {
  caseId: string;
  data: Out<"document">;
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
  volume: number;
}) {
  const player = useLinePlayer(volume);
  const { play } = player;
  const srcs = useMemo(() => data.pages.map((_, i) => voiceSrc(caseId, "document", data.id, i)), [caseId, data.id, data.pages]);
  // The narrator reads the file aloud the first time it is opened (when voices are on); after that, on request.
  useEffect(() => {
    if (!view.voices) return;
    const key = `bw-heard-${caseId}-${data.id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* storage unavailable: read it anyway */
    }
    play(0, srcs);
  }, [view.voices, caseId, data.id, srcs, play]);

  const reading = player.status === "playing" || player.status === "loading" || player.status === "paused";
  const btn = "rounded-[2px] border border-[#2a241c]/40 px-3 py-1 font-mono text-xs text-[#2a241c] hover:border-[#7d3a33] hover:text-[#7d3a33] disabled:opacity-50";
  return (
    <Overlay title={data.title} onClose={onClose} tone="paper" closeLabel="Close the file" wide>
      <div className="relative p-5 sm:p-8">
        {view.voices ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {player.status === "playing" ? (
              <button type="button" className={btn} onClick={player.pause}>
                Pause reading
              </button>
            ) : player.status === "paused" ? (
              <button type="button" className={btn} onClick={player.resume}>
                Resume reading
              </button>
            ) : (
              <button type="button" className={btn} disabled={player.status === "loading"} onClick={() => play(0, srcs)}>
                {player.status === "loading" ? "Listening" : "Read the file aloud"}
              </button>
            )}
            {reading ? (
              <button type="button" className={btn} onClick={player.stop}>
                Stop
              </button>
            ) : null}
            <span role="status" className="font-mono text-xs text-[#2a241c]/60">
              {player.error ? `${player.error} The text is complete.` : ""}
            </span>
          </div>
        ) : null}
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
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7d3a33]">{data.peopleHeading}</h3>
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
            <section key={i} className={`transition-opacity duration-300 ${reading && player.current !== null && player.current !== i ? "opacity-55" : ""}`}>
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

/** A delivered item: sealed on the desk until the player opens it, then the note and its enclosures. */
export function DeliveryPanel({
  caseId,
  data,
  view,
  dispatch,
  onClose,
  pending,
  volume,
}: {
  caseId: string;
  data: Out<"delivery">;
  view: ClientView;
  dispatch: Dispatch;
  onClose: () => void;
  pending: boolean;
  volume: number;
}) {
  return (
    <Overlay title={data.title} onClose={onClose} tone="paper" closeLabel={data.sealed ? "Leave it for now" : "Put it down"}>
      <div className="p-6 sm:p-8">
        {data.sealed ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#7d3a33]">Unopened</p>
            <p className="mt-2 font-serif text-lg leading-relaxed">{data.exterior}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <GameButton variant="paper" disabled={pending || view.status === "closed"} onClick={() => dispatch({ type: "openDelivery", deliveryId: data.id })}>
                Open it
              </GameButton>
              <button type="button" onClick={onClose} className="px-2 text-sm text-[#2a241c]/70 underline-offset-4 hover:underline">
                Leave it for now
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-serif text-lg italic leading-relaxed">{data.text}</p>
            {view.voices ? (
              <div className="text-paper [&>div]:border-[#2a241c]/20 [&>div]:bg-[#2a241c]/85">
                <NarrationPlayer src={voiceSrc(caseId, "delivery", data.id, 0)} volume={volume} />
              </div>
            ) : null}
            <CollectList items={data.evidence} dispatch={dispatch} pending={pending} view={view} />
          </>
        )}
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

export function CallPanel({ caseId, data, onClose, voices, volume }: { caseId: string; data: Out<"call">; onClose: () => void; voices: boolean; volume: number }) {
  const player = useLinePlayer(volume);
  const voiced = data.voiced && voices;
  const srcs = useMemo(() => data.lines.map((_, i) => voiceSrc(caseId, "call", data.id, i)), [caseId, data.id, data.lines]);
  const { play } = player;
  useEffect(() => {
    if (voiced) play(0, srcs);
  }, [voiced, srcs, play]);
  return (
    <Overlay title={data.title} onClose={onClose} closeLabel="Hang up">
      <div className="space-y-4 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-smoke">{data.from}</p>
        {data.lines.map((l, i) => (
          <p key={i} className={`font-serif text-lg leading-relaxed transition-opacity ${player.current === null || player.current === i ? "text-paper/90" : "text-paper/45"}`}>
            {l}
          </p>
        ))}
        {voiced ? (
          <div className="flex items-center gap-2 pt-2">
            {player.status === "playing" ? (
              <GameButton variant="ghost" onClick={player.pause}>Pause</GameButton>
            ) : player.status === "paused" ? (
              <GameButton variant="ghost" onClick={player.resume}>Resume</GameButton>
            ) : (
              <GameButton variant="ghost" onClick={() => play(0, srcs)} disabled={player.status === "loading"}>
                {player.status === "loading" ? "Connecting" : "Replay call"}
              </GameButton>
            )}
            <span role="status" className="text-xs text-smoke">{player.error ?? ""}</span>
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}

export function PhonePanel({ view, dispatch, onClose, pending, onDefer }: { view: ClientView; dispatch: Dispatch; onClose: () => void; pending: boolean; onDefer: () => void }) {
  const closed = view.status === "closed";
  const mobile = view.phone.mobile;
  return (
    <Overlay title={mobile ? "Phone" : "Telephone"} onClose={onClose}>
      <div className="space-y-8 p-6">
        {view.phone.ringing ? (
          <div className="border border-brass/50 bg-brass/10 p-4">
            <p className="font-serif text-lg">{mobile ? `${view.phone.ringing.from} is calling.` : "The line is ringing."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <GameButton disabled={pending || closed} onClick={() => dispatch({ type: "answerCall", callId: view.phone.ringing!.id })}>
                {mobile ? "Answer" : "Answer the telephone"}
              </GameButton>
              <button type="button" onClick={onDefer} className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
                Let it ring
              </button>
            </div>
          </div>
        ) : null}
        {view.phone.contacts.length ? (
          <div>
            {mobile ? <h3 className="text-sm text-smoke">Contacts</h3> : null}
            <ul className={mobile ? "mt-3 space-y-2" : "space-y-2"}>
              {view.phone.contacts.map((c) => (
                <li key={c.id} className="border border-white/10 p-4">
                  <p className="font-serif text-lg">{c.name}</p>
                  <p className="text-xs text-smoke">{c.note || c.role}</p>
                  <GameButton className="mt-3" disabled={pending || closed} onClick={() => dispatch({ type: "talk", characterId: c.id })}>
                    Call {c.name.startsWith("Det.") ? `Det. ${c.name.split(" ").slice(-1)[0]}` : c.name}
                  </GameButton>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {mobile && view.phone.texts.length ? (
          <div>
            <h3 className="text-sm text-smoke">Messages</h3>
            <ul className="mt-3 space-y-2">
              {view.phone.texts.map((t) => (
                <li key={t.id} className="border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="block text-xs text-smoke">{t.from}</span>
                  <span className="text-sm">{t.body}</span>
                </li>
              ))}
            </ul>
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
        {mobile && view.deliveries.length ? (
          <div>
            <h3 className="text-sm text-smoke">Inbox</h3>
            <ul className="mt-2 space-y-2">
              {view.deliveries.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => dispatch({ type: "openDelivery", deliveryId: d.id })}
                    className="w-full border border-white/10 px-4 py-3 text-left text-sm hover:border-brass disabled:opacity-50"
                  >
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}

// ---------------------------------------------------------------------------
// Police tapes
// ---------------------------------------------------------------------------

/** The police tapes: four cassettes, each with its label, status, and a transcript that follows the playback. */
export function StatementsPanel({ caseId, view, onClose, volume }: { caseId: string; view: ClientView; onClose: () => void; volume: number }) {
  const [sel, setSel] = useState(view.statements[0]?.characterId ?? "");
  const st = view.statements.find((s) => s.characterId === sel);
  const player = useLinePlayer(volume);
  const voiced = Boolean(st?.voiced && view.voices);
  const srcs = useMemo(() => (st && voiced ? st.transcript.map((_, i) => voiceSrc(caseId, "statement", st.characterId, i)) : []), [st, voiced, caseId]);
  const playing = player.status === "playing" || player.status === "loading";
  return (
    <Overlay title="Recorded police statements" onClose={onClose} wide>
      {view.statements.length === 0 ? (
        <p className="p-6 text-smoke">Read the case file first; the tapes are listed in it.</p>
      ) : (
        <div className="grid md:grid-cols-[15rem_1fr]">
          <ul className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 md:flex-col md:border-b-0 md:border-r">
            {view.statements.map((s) => (
              <li key={s.characterId} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    player.stop();
                    setSel(s.characterId);
                  }}
                  aria-current={s.characterId === sel}
                  className="w-full border border-white/10 bg-[#1b1f23] px-3 py-2.5 text-left text-sm hover:border-brass/60 aria-[current=true]:border-brass aria-[current=true]:text-brass"
                >
                  <span className="block font-mono text-[0.65rem] text-smoke">{s.tape}</span>
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
          {st ? (
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start gap-5">
                <Cassette label={st.name} spinning={player.status === "playing"} />
                <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
                  <dt className="text-smoke">Statement of</dt>
                  <dd>{st.name}</dd>
                  <dt className="text-smoke">Recorded</dt>
                  <dd>{st.recordedAt}</dd>
                  <dt className="text-smoke">Interviewing officer</dt>
                  <dd>{st.officer}</dd>
                  <dt className="text-smoke">Tape</dt>
                  <dd>{st.tape}</dd>
                  <dt className="text-smoke">Recording status</dt>
                  <dd className="text-brass">{st.status}</dd>
                </dl>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {st.audio ? (
                  <audio controls src={st.audio} className="w-full" />
                ) : voiced ? (
                  <>
                    {player.status === "playing" ? (
                      <GameButton variant="ghost" onClick={player.pause}>Pause tape</GameButton>
                    ) : player.status === "paused" ? (
                      <GameButton variant="ghost" onClick={player.resume}>Resume</GameButton>
                    ) : (
                      <GameButton onClick={() => player.play(0, srcs)} disabled={player.status === "loading"}>
                        {player.status === "loading" ? "Loading tape" : "Play tape"}
                      </GameButton>
                    )}
                    {playing || player.status === "paused" ? (
                      <button type="button" onClick={player.stop} className="px-2 text-xs text-smoke hover:text-paper">
                        Stop
                      </button>
                    ) : null}
                    <span role="status" className="text-xs text-smoke">
                      {player.error ? `${player.error} The transcript below is complete.` : ""}
                    </span>
                  </>
                ) : (
                  <p className="font-mono text-xs text-smoke">{view.voices ? "Playback unavailable. Transcript follows." : "Voices are off. Transcript follows."}</p>
                )}
              </div>
              <ol className="mt-5 space-y-3">
                {st.transcript.map((l, i) => (
                  <li key={i} className={`grid grid-cols-[8.5rem_1fr] gap-3 transition-opacity ${player.current === null || player.current === i ? "opacity-100" : "opacity-50"}`}>
                    <span className="font-mono text-xs uppercase tracking-wide text-brass">{l.speaker}</span>
                    <span className="font-mono text-sm leading-relaxed text-paper/90">
                      {l.text}
                      {voiced && !playing ? (
                        <button type="button" onClick={() => player.play(i, srcs)} className="ml-2 text-xs text-smoke hover:text-brass" aria-label="Play from this line">
                          ▸
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      )}
    </Overlay>
  );
}

function Cassette({ label, spinning }: { label: string; spinning: boolean }) {
  return (
    <div aria-hidden className="relative h-[4.5rem] w-28 shrink-0 rounded-[4px] border border-white/15 bg-[#23282d] p-1.5 shadow-inner">
      <div className="h-4 truncate bg-[#ebe2cd] px-1 font-mono text-[0.55rem] leading-4 text-[#2a241c]">{label}</div>
      <div className="mt-2 flex items-center justify-center gap-5">
        {[0, 1].map((i) => (
          <span key={i} className={`block h-6 w-6 rounded-full border-[3px] border-dashed border-paper/50 ${spinning ? "animate-spin" : ""}`} style={{ animationDuration: "2.4s" }} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conclusion and closure
// ---------------------------------------------------------------------------

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
