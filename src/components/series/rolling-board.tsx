"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { seriesBoardAction } from "@/app/actions/series";
import type { ClientCharacter, ClientEvidence, ClientView, GameAction } from "@/game/engine/types";
import { MurderBoard, type BoardView } from "@/game/ui/board";
import { DEFAULT_WORDS } from "@/game/words";
import type { SeriesAction } from "@/series/board";
import type { SeriesView } from "@/series/server";

/**
 * The rolling board: a series' second cork board, on wheels, that carries
 * whatever the player chooses to keep from one case to the next. Drawn with
 * the case board's own component, fed from the series' save instead of a
 * case's. Nothing is pinned or strung for the player.
 */
export function RollingBoard({ initial, closeHref, onClose }: { initial: SeriesView; closeHref?: string; onClose?: () => void }) {
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [notice, setNotice] = useState<{ kind: "deduction" | "error"; title: string; text: string } | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const pending = useRef(0);

  const evidence: ClientEvidence[] = view.items
    .filter((i) => i.kind !== "person")
    .map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      inspection: i.text,
      image: i.image,
      source: i.from,
      boardable: true,
      audio: null,
      collected: true,
      foundAt: i.from,
      collectedAt: null,
      related: [],
      note: "",
      label: i.tag,
    }));
  const characters: ClientCharacter[] = view.items
    .filter((i) => i.kind === "person")
    .map((i) => ({ id: i.id, name: i.title, role: i.from, portrait: i.image, bio: i.text ? [i.text] : [], onBoard: true }));

  const boardView: BoardView = {
    board: view.board,
    evidence,
    characters,
    deductions: view.deductions,
    boardSections: [],
    caseId: `series-${view.seriesId}`,
    status: "active",
    words: { ...DEFAULT_WORDS, board: "Rolling board" },
    theme: "noir",
  };

  const dispatch = useCallback(
    async (a: GameAction) => {
      if (!["boardAdd", "boardMove", "boardRemove", "connect", "disconnect"].includes(a.type)) return;
      pending.current++;
      const res = await seriesBoardAction(view.seriesId, a as SeriesAction).catch(() => ({ error: "The board could not be saved. Check your connection and try again." }));
      pending.current--;
      if ("error" in res) {
        setNotice({ kind: "error", title: "Not saved", text: res.error });
        return;
      }
      // Moves made while this one was on its way win: only take the server's board once nothing else is pending.
      if (pending.current === 0) setView(res.view);
      else setView((v) => ({ ...res.view, board: v.board }));
      if (res.made) setNotice({ kind: "deduction", title: res.made.title, text: res.made.text });
    },
    [view.seriesId],
  );

  useEffect(() => {
    if (notice?.kind !== "error") return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const onLocalBoard = (board: ClientView["board"]) => setView((v) => ({ ...v, board }));

  return (
    <>
      <MurderBoard
        view={boardView}
        dispatch={dispatch}
        onClose={() => (onClose ? onClose() : router.push(closeHref ?? "/agency/assignments"))}
        onLocalBoard={onLocalBoard}
        title={`Rolling board · ${view.title}`}
        rolling
        emptyText="The rolling board is empty. Pin anything from your earlier cases that you want to keep in view. Nothing goes up unless you put it there."
        headerExtra={
          <button type="button" onClick={() => setNotebookOpen(true)} className="rounded-[2px] border border-white/15 px-3 py-1.5 text-smoke hover:bg-white/5 hover:text-paper">
            Series notebook
          </button>
        }
      />

      {notice ? (
        <div className="fixed inset-x-0 top-16 z-50 mx-auto w-[min(32rem,calc(100%-2rem))] rounded-[3px] border border-black/50 bg-[#f0e6cf] p-4 text-[#2a241c] shadow-2xl" role="status">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#7d3a33]">{notice.kind === "deduction" ? "Series deduction" : notice.title}</p>
          {notice.kind === "deduction" ? <p className="mt-1 font-serif text-lg leading-snug">{notice.title}</p> : null}
          <p className="mt-1 text-sm leading-relaxed">{notice.text}</p>
          {notice.kind === "deduction" ? <p className="mt-2 text-xs text-[#5c5244]">It is in the tray now, and can be pinned like any other card.</p> : null}
          <button type="button" onClick={() => setNotice(null)} className="mt-3 text-sm font-semibold text-[#7d3a33] underline-offset-4 hover:underline">
            Close
          </button>
        </div>
      ) : null}

      {notebookOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Series notebook" onClick={() => setNotebookOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[3px] bg-[#f0e6cf] p-6 text-[#2a241c] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#7d3a33]">Series notebook</p>
            <h2 className="mt-1 font-serif text-2xl">{view.title}</h2>
            <ol className="mt-4 flex flex-wrap gap-2 text-xs">
              {view.cases.map((c) => (
                <li key={c.id} className={`rounded-[2px] border px-2 py-0.5 ${c.solved ? "border-[#7d3a33] text-[#7d3a33]" : "border-[#2a241c]/25 text-[#5c5244]"}`}>
                  {c.label}
                  {c.solved ? " · solved" : ""}
                </li>
              ))}
            </ol>
            {view.notebook.length ? (
              view.notebook.map((n) => (
                <section key={n.caseLabel} className="mt-5 border-t border-[#2a241c]/15 pt-4">
                  <p className="font-mono text-xs text-[#7d3a33]">After {n.caseLabel}</p>
                  <p className="mt-1 font-serif text-lg uppercase tracking-wide">{n.title}</p>
                  {n.text.split("\n\n").map((para, i) => (
                    <p key={i} className="mt-2 font-serif italic leading-relaxed">
                      {para}
                    </p>
                  ))}
                </section>
              ))
            ) : (
              <p className="mt-5 text-sm">Nothing yet.</p>
            )}
            {view.deductions.length ? (
              <section className="mt-5 border-t border-[#2a241c]/15 pt-4">
                <p className="font-mono text-xs text-[#7d3a33]">Series deductions</p>
                <ul className="mt-2 space-y-2">
                  {view.deductions.map((d) => (
                    <li key={d.id}>
                      <p className="font-semibold">{d.title}</p>
                      <p className="text-sm">{d.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <button type="button" onClick={() => setNotebookOpen(false)} className="mt-6 text-sm font-semibold text-[#7d3a33] underline-offset-4 hover:underline">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
