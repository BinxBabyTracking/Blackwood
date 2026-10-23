"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionOutcome, ActionResponse, ClientLine, ClientView, GameAction } from "../engine/types";
import { useBackdropClose } from "./overlay";
import { QuestionBar } from "./question-bar";
import { useLinePlayer } from "./use-line-player";

type Conversation = Extract<ActionOutcome, { kind: "conversation" }>;

export function voiceSrc(caseId: string, kind: "conversation" | "statement" | "call" | "delivery" | "resolution", id: string, n: number) {
  return `/api/voice?caseId=${encodeURIComponent(caseId)}&kind=${kind}&id=${encodeURIComponent(id)}&n=${n}`;
}

/**
 * The interview room. Full screen and lit like a film still: the witness on
 * the left, the words on the right, and a line for your own questions, typed or spoken.
 * Every new answer is spoken in the character's own voice (when voices are
 * on) and the line being spoken is highlighted in the subtitles.
 */
export function InterviewScreen({
  caseId,
  data,
  view,
  dispatch,
  onClose,
  pending,
  volume,
}: {
  caseId: string;
  data: Conversation;
  view: ClientView;
  dispatch: (a: GameAction) => Promise<ActionResponse | null>;
  onClose: () => void;
  pending: boolean;
  volume: number;
}) {
  const [mode, setMode] = useState<"questions" | "evidence" | "transcript">("questions");
  const player = useLinePlayer(volume);
  const voiced = data.voiced && view.voices;
  const closed = view.status === "closed";
  const first = data.name.split(" ")[0].endsWith(".") ? data.name.split(" ").slice(-1)[0] : data.name.split(" ")[0];

  const srcs = useMemo(
    () => data.history.map((l) => (l.kind === "question" || l.kind === "present" || l.kind === "cue" ? null : voiceSrc(caseId, "conversation", data.characterId, l.n))),
    [data.history, data.characterId, caseId],
  );

  // Speak each new answer as it arrives. Opening the interview does not speak.
  const { play, stop } = player;
  useEffect(() => {
    if (voiced && data.latest.length) play(data.latest[0], srcs, data.latest[data.latest.length - 1] + 1);
  }, [data.latest, voiced, srcs, play]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mode !== "questions") setMode("questions");
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  // The exchange on stage: from the investigator's last question to the end.
  const lastAsk = findLastIndex(data.history, (l) => l.kind === "question" || l.kind === "present");
  const stage = lastAsk >= 0 ? data.history.slice(lastAsk) : data.history.filter((l) => l.kind === "cue");
  const speaking = player.status === "playing" || player.status === "loading";

  const ask = async (a: GameAction) => {
    stop();
    setMode("questions");
    await dispatch(a);
  };

  const backdrop = useBackdropClose(onClose);
  return (
    <div className="fixed inset-0 z-40 flex bg-black/70 backdrop-blur-[2px] game-fade md:p-6 lg:p-10" {...backdrop}>
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden bg-[#08090a] text-paper md:border md:border-white/10 md:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" role="dialog" aria-modal="true" aria-label={`Interview with ${data.name}`}>
      {/* Letterbox: case, place, manner, and the way out */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black px-4 py-2.5 sm:px-6">
        <p className="min-w-0 truncate font-mono text-[0.7rem] uppercase tracking-[0.18em] text-smoke">
          <span className="text-brass">Interview</span>
          <span aria-hidden> · </span>
          {view.caseId} {view.title}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "transcript" ? "questions" : "transcript")}
            aria-pressed={mode === "transcript"}
            className="rounded-[2px] px-3 py-1.5 text-xs text-paper/80 hover:bg-white/5 hover:text-paper aria-pressed:text-brass"
          >
            Transcript
          </button>
          <button type="button" onClick={onClose} className="rounded-[2px] border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-brass hover:text-brass">
            End Interview
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1">
        {/* The witness */}
        <section className="relative overflow-hidden border-b border-white/5 md:border-b-0 md:border-r">
          <div className="flex items-center gap-4 p-4 md:block md:h-full md:p-0">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden md:absolute md:inset-0 md:h-auto md:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.portrait}
                alt={`Portrait of ${data.name}`}
                className={`h-full w-full object-cover sepia-[0.35] transition-[filter] duration-700 ${speaking ? "brightness-105" : "brightness-[0.82]"}`}
                draggable={false}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_at_40%_35%,transparent_35%,rgba(0,0,0,0.85)_100%)] md:block" />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent md:block" />
            </div>
            <div className="min-w-0 md:absolute md:inset-x-0 md:bottom-0 md:p-8">
              <p className="font-display text-2xl leading-tight text-paper sm:text-3xl md:text-4xl">{data.name}</p>
              <p className="mt-1 font-mono text-xs text-paper/70">{data.role}</p>
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-smoke">
                {data.medium === "telephone" ? "On the line" : "Location"}
                <span className="ml-2 normal-case tracking-normal text-paper/80">{data.where}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {data.demeanor ? (
                  <span className="border border-brass/50 px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brass">Manner: {data.demeanor}</span>
                ) : null}
                {voiced ? <VoiceMeter active={player.status === "playing"} /> : null}
              </div>
            </div>
          </div>
        </section>

        {/* The words */}
        <section className="flex min-h-0 flex-col">
          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10" aria-live="polite">
            {mode === "transcript" ? (
              <Transcript lines={data.history} current={player.current} voiced={voiced} onReplay={(n) => play(n, srcs, n + 1)} />
            ) : stage.length === 0 ? (
              <p className="font-serif text-xl italic text-paper/60">
                {data.medium === "telephone" ? `${data.name} is on the line. Ask what you need to know.` : `${first} waits for your first question.`}
              </p>
            ) : (
              <div className="max-w-3xl space-y-5">
                {stage.map((l) => (
                  <StageLine key={l.n} line={l} current={player.current === l.n} dim={player.current !== null && player.current !== l.n} />
                ))}
              </div>
            )}
          </div>

          {/* Voice controls and status */}
          <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-2 border-t border-white/5 px-5 py-2 sm:px-10">
            {voiced ? (
              <>
                {player.status === "playing" ? (
                  <SmallButton onClick={player.pause}>Pause</SmallButton>
                ) : player.status === "paused" ? (
                  <SmallButton onClick={player.resume}>Resume</SmallButton>
                ) : (
                  <SmallButton
                    disabled={player.status === "loading" || lastAsk < 0}
                    onClick={() => play(lastAsk + 1, srcs)}
                  >
                    {player.status === "loading" ? "Listening" : "Replay answer"}
                  </SmallButton>
                )}
                <span className="font-mono text-xs text-smoke" role="status">
                  {player.error ? `${player.error} The subtitles are complete.` : ""}
                </span>
              </>
            ) : (
              <span className="font-mono text-xs text-smoke">{data.voiced ? "Voices are off. Subtitles only." : "Subtitles only."}</span>
            )}
            <button
              type="button"
              onClick={() => {
                stop();
                void dispatch({ type: "setVoices", enabled: !view.voices });
              }}
              disabled={pending || !data.voiced}
              className="ml-auto font-mono text-xs text-smoke underline-offset-4 hover:text-paper hover:underline disabled:hidden"
            >
              Voices: {view.voices ? "On" : "Off"}
            </button>
          </div>

          {/* Questions, or the evidence tray */}
          <div className="max-h-[38vh] shrink-0 overflow-y-auto border-t md:max-h-[46vh] border-white/10 bg-[#0f1215] px-5 py-4 sm:px-10">
            {mode === "evidence" ? (
              <EvidenceTray
                view={view}
                who={data.medium === "telephone" ? `Read Det. ${data.name.split(" ").slice(-1)[0]} a piece of evidence` : `Show ${first} a piece of evidence`}
                disabled={pending || closed || !data.available}
                onPick={(id) => ask({ type: "present", characterId: data.characterId, evidenceId: id })}
                onBack={() => setMode("questions")}
              />
            ) : (
              <>
                {!data.available ? <p className="mb-3 text-sm text-smoke">{data.name} is not here. You can read the transcript, but not ask anything new.</p> : null}
                {data.questions.exhausted && data.available && !closed ? (
                  <OutOfTime
                    first={first}
                    q={data.questions}
                    pending={pending}
                    onExtend={() => ask({ type: "extendInterview", characterId: data.characterId, requestId: newRequestId() })}
                  />
                ) : (
                  <>
                    <QuestionBar
                      name={first}
                      context={{ caseId, characterId: data.characterId }}
                      disabled={pending || !data.canAsk}
                      onListen={stop}
                      onAsk={(text) => ask({ type: "askFree", characterId: data.characterId, text })}
                    />
                    <p className="mt-2 text-xs leading-snug text-smoke">
                      {data.characterId === "bennett"
                        ? "Det. Bennett only knows what is in the police file."
                        : "Witnesses only know what they saw, heard and did around the case."}{" "}
                      Ask about the people, the night and the evidence. Questions about anything else get short answers.
                    </p>
                    {data.questions.limited && data.available && !closed ? (
                      <QuestionCount
                        q={data.questions}
                        pending={pending}
                        onExtend={() => ask({ type: "extendInterview", characterId: data.characterId, requestId: newRequestId() })}
                      />
                    ) : null}
                  </>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={() => setMode("evidence")}
                    disabled={closed || !data.available || data.questions.exhausted}
                    className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-40"
                  >
                    Present Evidence
                  </button>
                  <button type="button" onClick={onClose} className="rounded-[2px] border border-white/20 px-4 py-2 text-sm hover:border-brass hover:text-brass">
                    End Interview
                  </button>
                  {data.refusing ? <span className="font-mono text-xs text-[#e2a7a2]">{data.name.split(" ").slice(-1)[0]} is declining to answer.</span> : null}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}

type Questions = Conversation["questions"];

/** A unique id for one request, so a retried extension is never charged twice. */
function newRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** A quiet count of questions left, and the offer of more time once it runs low. */
function QuestionCount({ q, pending, onExtend }: { q: Questions; pending: boolean; onExtend: () => void }) {
  const low = q.left <= 5;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] tracking-wide">
      <span className={low ? "text-[#e2b98a]" : "text-smoke/80"}>Questions remaining: {q.left}</span>
      {q.mode === "standard" ? <span className="text-smoke/60">Expense money: ${q.expense}</span> : null}
      {low && q.extend ? (
        <button type="button" disabled={pending} onClick={onExtend} className="text-brass underline-offset-4 hover:underline disabled:opacity-40">
          {q.extend.offer}
        </button>
      ) : null}
    </div>
  );
}

/** The person has given all the time they will for now. */
function OutOfTime({ first, q, pending, onExtend }: { first: string; q: Questions; pending: boolean; onExtend: () => void }) {
  return (
    <div className="space-y-3" role="status">
      <p className="font-serif text-lg italic text-paper/80">{first} has nothing more to say for now.</p>
      {q.extend ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onExtend}
            className="rounded-[2px] border border-brass/70 px-4 py-2 text-sm text-brass hover:bg-brass/10 disabled:opacity-40"
          >
            {q.extend.offer}
          </button>
          <span className="font-mono text-xs text-smoke">Expense money: ${q.expense}</span>
        </div>
      ) : q.mode === "standard" ? (
        <p className="text-sm text-smoke">
          New evidence may give you a reason to come back. Expense money for more of {first}&apos;s time: ${q.expense} of $5.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled className="rounded-[2px] border border-white/20 px-4 py-2 text-sm text-paper/60">
            Buy more questions with real money
          </button>
          <span className="text-sm text-smoke">Purchases are not available yet. New evidence may still give you a reason to come back.</span>
        </div>
      )}
    </div>
  );
}

function StageLine({ line, current, dim }: { line: ClientLine; current: boolean; dim: boolean }) {
  if (line.kind === "cue") return <p className="font-serif text-base italic text-brass/80">{line.text}</p>;
  if (line.kind === "question" || line.kind === "present") {
    return (
      <p className="font-mono text-sm leading-relaxed text-brass">
        <span className="mr-2 text-[0.68rem] uppercase tracking-[0.16em] text-smoke">You</span>
        {line.text}
      </p>
    );
  }
  return (
    <p className={`font-serif text-xl leading-relaxed transition-opacity duration-300 sm:text-2xl ${dim ? "text-paper/45" : "text-paper"} ${current ? "drop-shadow-[0_0_14px_rgba(196,163,107,0.15)]" : ""}`}>
      {line.text}
    </p>
  );
}

function Transcript({ lines, current, voiced, onReplay }: { lines: ClientLine[]; current: number | null; voiced: boolean; onReplay: (n: number) => void }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines.length]);
  if (!lines.length) return <p className="font-mono text-sm text-smoke">Nothing has been said yet.</p>;
  return (
    <div className="max-w-3xl">
      <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-smoke">Transcript, as recorded in your notebook</p>
      <ol className="space-y-2 font-mono text-[0.9rem] leading-relaxed">
        {lines.map((l) =>
          l.kind === "cue" ? (
            <li key={l.n} className="pl-[7.5rem] italic text-brass/70">
              {l.text}
            </li>
          ) : (
            <li key={l.n} className={`grid grid-cols-[7rem_1fr] gap-2 ${current === l.n ? "text-paper" : "text-paper/80"}`}>
              <span className={`truncate text-xs uppercase tracking-wide ${l.speakerId === "you" ? "text-brass" : "text-smoke"}`}>{l.speaker}</span>
              <span>
                {l.text}
                {voiced && l.speakerId !== "you" ? (
                  <button type="button" onClick={() => onReplay(l.n)} className="ml-2 text-xs text-smoke hover:text-brass" aria-label={`Play this line again`}>
                    ▸ play
                  </button>
                ) : null}
              </span>
            </li>
          ),
        )}
      </ol>
      <div ref={end} />
    </div>
  );
}

function EvidenceTray({ view, who, disabled, onPick, onBack }: { view: ClientView; who: string; disabled: boolean; onPick: (id: string) => void; onBack: () => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-smoke">{who}</p>
        <button type="button" onClick={onBack} className="text-sm text-smoke hover:text-paper">
          Back to questions
        </button>
      </div>
      {view.evidence.some((e) => !e.photo) ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {view.evidence.filter((e) => !e.photo).map((e) => (
            <li key={e.id}>
              <button
                type="button"
                data-present={e.id}
                disabled={disabled}
                onClick={() => onPick(e.id)}
                className="group block w-full bg-[#ebe2cd] p-1.5 pb-2 text-left text-[#2a241c] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 hover:rotate-[-0.6deg] disabled:opacity-40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image} alt="" className="aspect-[4/3] w-full bg-black object-cover" />
                <span className="mt-1.5 block font-mono text-[0.65rem] text-[#7d3a33]">{e.id}</span>
                <span className="block font-serif text-xs leading-tight">{e.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-smoke">You have not collected any evidence yet.</p>
      )}
    </div>
  );
}

function VoiceMeter({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] bg-brass/80 ${active ? "animate-pulse" : ""}`}
          style={{ height: active ? `${[60, 100, 45, 80][i]}%` : "20%", animationDelay: `${i * 120}ms`, transition: "height 200ms" }}
        />
      ))}
    </span>
  );
}

function SmallButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[2px] border border-white/20 px-3 py-1 text-xs hover:border-brass hover:text-brass disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function findLastIndex<T>(list: T[], f: (x: T) => boolean) {
  for (let i = list.length - 1; i >= 0; i--) if (f(list[i])) return i;
  return -1;
}
