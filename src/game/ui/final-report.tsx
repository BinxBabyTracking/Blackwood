"use client";

import { useEffect, useRef, useState } from "react";
import { useBackdropClose } from "./overlay";
import { type ActionResponse, type ClientView, type GameAction, type ReportDraft, type Theory } from "../engine/types";

type Dispatch = (a: GameAction) => Promise<ActionResponse | null>;
type Mode = "form" | "review" | "returned";

/** An answer as a list: one option, or several for a question that allows more than one. */
const picks = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

/**
 * The final investigative report: an agency form typed on the office
 * typewriter. Draft, review, submit. When the agency returns a report
 * its memo is clipped to the front; when it accepts one, the filed copy can be
 * read here afterwards. Nothing in this component knows the answer.
 */
export function FinalReport({
  view,
  dispatch,
  pending,
  investigator,
  onClose,
  onExamine,
  shared = false,
  guest = false,
}: {
  view: ClientView;
  dispatch: Dispatch;
  pending: boolean;
  investigator: string;
  onClose: () => void;
  /** Open an evidence item, returning to the report afterwards. */
  onExamine: (id: string) => void;
  /** A joint investigation: everyone at the table edits one draft, saved as they go. */
  shared?: boolean;
  /** A guest in a joint investigation may add to the report; only the host files it. */
  guest?: boolean;
}) {
  const c = view.conclusion;
  const filed = c.final;
  const [draft, setDraft] = useState<ReportDraft>(() => ({ ...c.draft, evidence: [...c.draft.evidence] }));
  const [mode, setMode] = useState<Mode>(c.review && !filed ? "returned" : "form");
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const top = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(c.draft);

  // Someone else at the table changed the draft: take their version unless this screen has unsaved edits.
  const lastServer = useRef(JSON.stringify(c.draft));
  const serverDraft = JSON.stringify(c.draft);
  useEffect(() => {
    if (serverDraft === lastServer.current) return;
    setDraft((mine) => (JSON.stringify(mine) === lastServer.current ? { ...c.draft, evidence: [...c.draft.evidence] } : mine));
    lastServer.current = serverDraft;
  }, [serverDraft, c.draft]);
  // Only the questions are answered by hand: every piece of evidence collected goes with the report.
  const complete = c.choices.every((ch) => picks(draft[ch.id]).length > 0);
  const label = (set: string, v?: string | string[]) => {
    const opts = c.choices.find((x) => x.id === set)?.options ?? [];
    const words = picks(v).map((id) => opts.find((o) => o.id === id)?.label ?? id);
    return words.length ? words.join("; ") : "Not answered";
  };
  /** The evidence section comes after the questions: E with four questions, G with six. */
  const evidenceSection = String.fromCharCode(65 + c.choices.length);

  // scrollIntoView returns a Promise in current browsers; an effect must not return it.
  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" });
  }, [mode]);

  // In a joint investigation each change is saved after a short pause, so the others see it.
  useEffect(() => {
    if (!shared || !dirty || filed || pending) return;
    const t = setTimeout(() => void dispatch({ type: "saveReport", draft }), 1200);
    return () => clearTimeout(t);
  }, [shared, dirty, draft, filed, pending, dispatch]);

  const save = async () => {
    if (!dirty) return true;
    const r = await dispatch({ type: "saveReport", draft });
    if (r) setSaved("saved");
    return Boolean(r);
  };
  const leave = async () => {
    if (!filed && view.status !== "closed") await save();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      void leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const submit = async () => {
    // The server attaches every piece of evidence collected.
    const theory: Theory = { evidence: [] };
    for (const ch of c.choices) theory[ch.id] = ch.multi ? picks(draft[ch.id]) : (draft[ch.id] as string);
    const r = await dispatch({ type: "submitConclusion", theory });
    if (r?.outcome.kind === "verdict" && !r.outcome.correct) setMode("returned");
  };

  const backdrop = useBackdropClose(() => void leave());
  const shown: ReportDraft = filed ? { ...filed.theory } : draft;
  const name = filed?.investigator ?? investigator;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/80 px-3 py-6 backdrop-blur-[2px] sm:px-6 game-fade" role="dialog" aria-modal="true" aria-label="Final investigative report"
      {...backdrop}>
      <div ref={top} className="relative mx-auto w-full max-w-3xl bg-[#efe8d6] text-[#231e17] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#231e17]/15 px-5 py-2.5 font-mono text-xs">
          <span className="tracking-[0.14em] text-[#231e17]/60">CASE {view.caseId} · {view.words.form}</span>
          <button type="button" onClick={leave} className="underline-offset-4 hover:underline">
            {filed ? "Close the report" : "Return to investigating"}
          </button>
        </div>

        <div className="px-6 py-8 sm:px-12 sm:py-10">
          <Letterhead />

          <h2 className="mt-8 text-center font-mono text-lg font-bold tracking-[0.22em]">FINAL INVESTIGATIVE REPORT</h2>
          <dl className="mx-auto mt-6 grid max-w-xl grid-cols-[9.5rem_1fr] gap-x-4 gap-y-1 font-mono text-[0.9rem]">
            {[
              ["Case No.", view.caseId],
              ["Case", view.title.toUpperCase()],
              ...c.header.map((h) => [h.label, h.value]),
              ["Investigator", name],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-xs uppercase tracking-[0.1em] text-[#231e17]/55">{k}</dt>
                <dd className={k === "Case No." ? "font-bold text-[#7d3a33]" : ""}>{v}</dd>
              </div>
            ))}
          </dl>

          {filed ? (
            <Stamp text="Filed and accepted" sub={`Submission ${filed.attempts}`} />
          ) : mode === "returned" && c.review ? (
            <ReturnedMemo review={c.review} reviewer={view.words.reviewer} onRevise={() => setMode("form")} onLeave={leave} />
          ) : null}

          {mode === "review" && !filed ? (
            <section className="mt-10">
              <p className="border-y border-[#231e17]/25 py-2 text-center font-mono text-xs tracking-[0.18em]">FOR SUBMISSION: PLEASE REVIEW</p>
              <dl className="mt-6 space-y-4 font-mono text-[0.92rem]">
                {c.choices.map((ch) => (
                  <div key={ch.id} className="grid gap-1 sm:grid-cols-[12rem_1fr]">
                    <dt className="text-xs uppercase tracking-[0.1em] text-[#231e17]/60">
                      {ch.section}. {ch.title}
                    </dt>
                    <dd className="font-bold">{label(ch.id, draft[ch.id])}</dd>
                  </div>
                ))}
                <div className="grid gap-1 sm:grid-cols-[12rem_1fr]">
                  <dt className="text-xs uppercase tracking-[0.1em] text-[#231e17]/60">{evidenceSection}. The Evidence</dt>
                  <dd>
                    All {view.evidence.length} {view.evidence.length === 1 ? "piece" : "pieces"} of evidence you&apos;ve collected
                  </dd>
                </div>
              </dl>
              <Signature name={name} date={c.date} />
              <p className="mt-6 font-serif text-sm leading-relaxed text-[#231e17]/75">
                Submitting files the report with {view.words.reviewer}. If it is returned, your investigation continues and you can file a revised report.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <PaperButton onClick={() => setMode("form")}>Return to Report</PaperButton>
                {guest ? (
                  <span className="self-center font-mono text-xs text-[#231e17]/70">Only the host can file the report. Your changes are saved for them.</span>
                ) : (
                  <PaperButton strong disabled={pending || !complete} onClick={() => void submit()}>
                    {pending ? "Filing" : "Submit Findings"}
                  </PaperButton>
                )}
              </div>
            </section>
          ) : (
            <form
              className={mode === "returned" && !filed ? "hidden" : ""}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!complete) return;
                await save();
                setMode("review");
              }}
            >
              {c.choices.map((ch) => (
                <fieldset key={ch.id} className="mt-10" disabled={Boolean(filed)}>
                  <legend className="w-full border-b border-[#231e17]/25 pb-1 font-mono text-sm font-bold tracking-[0.12em]">
                    SECTION {ch.section}. {ch.title.toUpperCase()}
                  </legend>
                  <p className="mt-3 font-serif text-[1.05rem] italic">{ch.question}</p>
                  {ch.multi ? <p className="mt-1 font-mono text-xs text-[#231e17]/65">Mark every answer that applies.</p> : null}
                  <ul className="mt-3 space-y-1 font-mono text-[0.95rem]">
                    {ch.options.map((o) => {
                      const on = picks(shown[ch.id]).includes(o.id);
                      return (
                        <li key={o.id}>
                          <label className={`flex cursor-pointer items-baseline gap-3 rounded-[2px] px-2 py-1 hover:bg-[#231e17]/5 ${filed ? "cursor-default" : ""}`}>
                            <input
                              type={ch.multi ? "checkbox" : "radio"}
                              name={ch.id}
                              value={o.id}
                              checked={on}
                              onChange={(ev) => {
                                setDraft((d) => {
                                  if (!ch.multi) return { ...d, [ch.id]: o.id };
                                  const cur = picks(d[ch.id]).filter((x) => x !== o.id);
                                  return { ...d, [ch.id]: ev.target.checked ? [...cur, o.id] : cur };
                                });
                                setSaved("idle");
                              }}
                              className="sr-only"
                            />
                            <span aria-hidden className="w-7 shrink-0 font-bold">{on ? "[X]" : "[ ]"}</span>
                            <span className={on ? "font-bold" : ""}>{o.label}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ))}

              <ReportEvidence
                section={evidenceSection}
                view={view}
                ids={filed ? filed.theory.evidence : view.evidence.map((e) => e.id)}
                filed={Boolean(filed)}
                onExamine={async (id) => {
                  if (!filed) await save();
                  onExamine(id);
                }}
              />

              <Signature name={name} date={c.date} />

              {filed ? null : (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PaperButton disabled={pending || !dirty} onClick={async () => void (await save())}>
                    Save draft
                  </PaperButton>
                  <PaperButton strong type="submit" disabled={pending || !complete}>
                    Review report
                  </PaperButton>
                  <button type="button" onClick={leave} className="px-1 text-sm underline-offset-4 hover:underline">
                    Return to investigating
                  </button>
                  <span role="status" className="font-mono text-xs text-[#231e17]/60">
                    {saved === "saved" && !dirty
                      ? "Draft saved."
                      : !complete
                        ? "Answer every section to review the report."
                        : ""}
                  </span>
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export function Letterhead() {
  return (
    <header className="border-b-[3px] border-double border-[#231e17]/70 pb-4 text-center">
      <p className="font-display text-3xl tracking-[0.12em] sm:text-4xl">BLACKWOOD INVESTIGATIONS</p>
      <p className="mt-1 font-mono text-[0.7rem] tracking-[0.18em] text-[#231e17]/70">
        LICENSED PRIVATE INVESTIGATORS · WILSHIRE BOULEVARD, ELEVENTH FLOOR · LOS ANGELES, CALIFORNIA
      </p>
    </header>
  );
}

function Signature({ name, date }: { name: string; date: string }) {
  return (
    <div className="mt-10 grid gap-6 font-mono text-xs sm:grid-cols-2">
      <div>
        <p className="border-b border-[#231e17]/60 pb-1 font-serif text-2xl italic">{name}</p>
        <p className="mt-1 tracking-[0.12em] text-[#231e17]/60">SIGNATURE OF INVESTIGATOR</p>
      </div>
      <div>
        <p className="border-b border-[#231e17]/60 pb-1 font-serif text-lg">{date}</p>
        <p className="mt-1 tracking-[0.12em] text-[#231e17]/60">DATE</p>
      </div>
    </div>
  );
}

function ReturnedMemo({ review, reviewer, onRevise, onLeave }: { review: NonNullable<ClientView["conclusion"]["review"]>; reviewer: string; onRevise: () => void; onLeave: () => void }) {
  return (
    <section className="mt-8 rotate-[-0.4deg] border border-[#7d3a33]/50 bg-[#f6efdd] p-5 shadow-[0_6px_14px_rgba(0,0,0,0.15)]" aria-labelledby="memo-h">
      <p id="memo-h" className="font-mono text-xs font-bold tracking-[0.16em] text-[#7d3a33]">
        {reviewer.replace(/^the /i, "").toUpperCase()} REVIEW · REPORT RETURNED · SUBMISSION {review.attempt}
      </p>
      <p className="mt-3 font-serif text-lg leading-relaxed">
        Your findings have been reviewed. The available evidence does not sufficiently support the conclusions presented. Further investigation is recommended.
      </p>
      {review.note ? (
        <p className="mt-3 font-mono text-[0.85rem] leading-relaxed">
          <span className="font-bold">Reviewer&apos;s note:</span> {review.note}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <PaperButton strong onClick={onRevise}>
          Revise the report
        </PaperButton>
        <PaperButton onClick={onLeave}>Return to the investigation</PaperButton>
      </div>
    </section>
  );
}

function Stamp({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <div className="rotate-[-6deg] border-[3px] border-[#4f6b4f]/80 px-4 py-1.5 text-center font-mono text-[#4f6b4f]/90">
        <p className="text-sm font-bold tracking-[0.22em]">{text.toUpperCase()}</p>
        <p className="text-[0.7rem] tracking-[0.12em]">{sub}</p>
      </div>
    </div>
  );
}

function PaperButton({
  children,
  onClick,
  disabled,
  strong,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  strong?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[2px] border px-4 py-2 font-mono text-sm tracking-[0.04em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        strong ? "border-[#231e17] bg-[#231e17] text-[#efe8d6] hover:bg-[#3a3227]" : "border-[#231e17]/50 hover:bg-[#231e17]/10"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The evidence section. The player no longer picks or files evidence: every
 * piece collected goes with the report. The section shows what the agency
 * needs the evidence to prove, and what is going with the report.
 */
function ReportEvidence({ section, view, ids, filed, onExamine }: { section: string; view: ClientView; ids: string[]; filed: boolean; onExamine: (id: string) => void }) {
  const c = view.conclusion;
  const claims = c.claims ?? [];
  const items = ids.map((id) => view.evidence.find((e) => e.id === id)).filter((e): e is ClientView["evidence"][number] => Boolean(e));
  return (
    <section className="mt-10" aria-labelledby="report-evidence-h">
      <h3 id="report-evidence-h" className="w-full border-b border-[#231e17]/25 pb-1 font-mono text-sm font-bold tracking-[0.12em]">
        SECTION {section}. THE EVIDENCE
      </h3>
      {claims.length ? (
        <div className="mt-4 border border-[#231e17]/30 bg-[#f6efdd] px-4 py-3">
          <p className="font-mono text-xs font-bold tracking-[0.14em] text-[#7d3a33]">WHAT {view.words.reviewer.toUpperCase()} NEEDS</p>
          <p className="mt-1 font-serif text-[1.02rem] italic">Your evidence must prove each of these points. If any is missing, the report comes back and you keep investigating.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 font-serif text-[0.98rem]">
            {claims.map((cl) => (
              <li key={cl.id}>{cl.label}</li>
            ))}
          </ol>
        </div>
      ) : null}
      <p className="mt-4 font-mono text-xs leading-relaxed text-[#231e17]/75">
        {filed
          ? `Filed with ${items.length} ${items.length === 1 ? "piece" : "pieces"} of evidence.`
          : `Everything you've collected goes with the report: ${items.length} ${items.length === 1 ? "piece" : "pieces"} so far. Evidence found: ${c.found} of ${c.total}.`}
      </p>
      {items.length ? (
        <ul className="mt-2 divide-y divide-[#231e17]/10 border-y border-[#231e17]/15 font-mono text-[0.9rem]">
          {items.map((e) => (
            <li key={e.id} className="flex items-baseline gap-3 px-2 py-1.5">
              <span className="text-[#7d3a33]">{e.label}</span>
              <span className="flex-1">{e.title}</span>
              <button type="button" onClick={() => onExamine(e.id)} className="shrink-0 text-xs underline underline-offset-4 hover:text-[#7d3a33]">
                Examine
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm">You have not collected any evidence.</p>
      )}
    </section>
  );
}
