"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { playAction, restartCase } from "@/app/actions/game";
import type { ActionOutcome, ActionResponse, ClientView, GameAction, PanelId } from "../engine/types";
import { MurderBoard } from "./board";
import {
  CallPanel,
  ClosureSequence,
  ConclusionPanel,
  ConversationPanel,
  DeliveryPanel,
  DocumentPanel,
  EvidencePanel,
  InspectPanel,
  IntroSequence,
  MailPanel,
  MapPanel,
  NotebookPanel,
  PhonePanel,
  StatementsPanel,
} from "./panels";

type Layer =
  | { k: "inspect"; data: Extract<ActionOutcome, { kind: "inspect" }> }
  | { k: "evidence"; id: string }
  | { k: "panel"; panel: PanelId }
  | { k: "conversation"; data: Extract<ActionOutcome, { kind: "conversation" }> }
  | { k: "document"; data: Extract<ActionOutcome, { kind: "document" }> }
  | { k: "call"; data: Extract<ActionOutcome, { kind: "call" }> }
  | { k: "delivery"; data: Extract<ActionOutcome, { kind: "delivery" }> }
  | { k: "closure" }
  | null;

export interface GamePrefs {
  reducedMotion: boolean;
  masterVolume: number;
  musicVolume: number;
}

/** The full-screen investigation. All rules run on the server; this renders the view it returns. */
export function Game({ caseId, initial, prefs }: { caseId: string; initial: ClientView; prefs: GamePrefs }) {
  const [view, setView] = useState(initial);
  const [layer, setLayer] = useState<Layer>(null);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "info" | "error" | "deduction" } | null>(null);
  const [verdictFeedback, setVerdictFeedback] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const busy = useRef(false);
  const router = useRouter();

  const show = useCallback((text: string, tone: "info" | "error" | "deduction" = "info") => {
    setToast({ text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.tone === "deduction" ? 7000 : 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const handle = useCallback(
    (res: ActionResponse, action: GameAction) => {
      setView(res.view);
      const o = res.outcome;
      switch (o.kind) {
        case "inspect":
          setLayer({ k: "inspect", data: o });
          break;
        case "panel":
          setLayer({ k: "panel", panel: o.panel });
          break;
        case "conversation":
          setLayer({ k: "conversation", data: o });
          break;
        case "document":
          setLayer({ k: "document", data: o });
          break;
        case "call":
          setLayer({ k: "call", data: o });
          break;
        case "delivery":
          setLayer({ k: "delivery", data: o });
          break;
        case "deduction":
          show(`New deduction: ${o.title}`, "deduction");
          break;
        case "verdict":
          if (o.correct) {
            setVerdictFeedback(null);
            setLayer({ k: "closure" });
          } else setVerdictFeedback(o.feedback);
          break;
        case "error":
          show(o.message, "error");
          break;
        case "none":
          if (action.type === "travel") setLayer(null);
          break;
      }
    },
    [show],
  );

  const dispatch = useCallback(
    async (action: GameAction): Promise<ActionResponse | null> => {
      if (busy.current && action.type !== "boardMove") return null;
      busy.current = true;
      setPending(true);
      try {
        const res = await playAction(caseId, action);
        if ("error" in res) {
          show(res.error, "error");
          return null;
        }
        handle(res, action);
        if (res.outcome.kind === "panel" && res.outcome.panel === "casefile") {
          // The desk folder opens the document itself.
          const open: GameAction = { type: "readDocument", documentId: "casefile" };
          const doc = await playAction(caseId, open);
          if ("error" in doc) show(doc.error, "error");
          else handle(doc, open);
        }
        return res;
      } catch {
        show("The connection to the agency was lost. Check your network and try again.", "error");
        return null;
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [caseId, handle, show],
  );

  const close = useCallback(() => setLayer(null), []);
  const reduced = prefs.reducedMotion;

  // Ambient sound, only when a recording exists for this location.
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, (prefs.masterVolume / 100) * (prefs.musicVolume / 100)));
    if (view.location.ambience) a.play().catch(() => undefined);
  }, [view.location.ambience, prefs.masterVolume, prefs.musicVolume]);

  // 2.5D parallax on the scene.
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const panel = layer?.k === "panel" ? layer.panel : null;
  const inOffice = view.location.id === "office";

  return (
    <div className="fixed inset-0 flex select-none flex-col bg-black text-paper">
      {/* Scene */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className="relative aspect-video max-h-full w-full max-w-[calc(100dvh*16/9)] overflow-hidden"
          onMouseMove={(e) => {
            if (reduced) return;
            const r = e.currentTarget.getBoundingClientRect();
            setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
          }}
          onMouseLeave={() => setHover(null)}
        >
          <div
            key={view.location.background}
            className={`absolute inset-0 ${reduced ? "" : "game-scene-in"}`}
            style={{ transform: reduced ? undefined : `scale(1.04) translate(${-tilt.x * 1.2}%, ${-tilt.y * 0.8}%)`, transition: "transform 400ms ease-out" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={view.location.background} alt={`${view.location.name}, ${view.location.subtitle}`} className="h-full w-full object-cover" draggable={false} />
            {view.location.hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-label={h.label}
                disabled={pending}
                onClick={() => dispatch({ type: "hotspot", hotspotId: h.id })}
                onMouseEnter={() => setHover(h.label)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(h.label)}
                onBlur={() => setHover(null)}
                className="absolute cursor-pointer rounded-[2px] outline-none focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-[#f3ede3]/70 disabled:cursor-wait"
                style={{ left: `${h.rect.x}%`, top: `${h.rect.y}%`, width: `${h.rect.w}%`, height: `${h.rect.h}%` }}
              />
            ))}
          </div>

          {/* Location caption */}
          <div key={view.location.id} className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-5 game-caption">
            <p className="font-display text-xl text-paper drop-shadow sm:text-3xl">{view.location.name}</p>
            <p className="font-mono text-[0.7rem] tracking-wide text-paper/70 sm:text-xs">{view.location.subtitle}</p>
          </div>

          {/* Hover label: what the pointer is over, nothing more */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center" aria-hidden>
            <span className={`rounded-[2px] bg-black/60 px-3 py-1 font-mono text-xs tracking-wide transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>{hover ?? ""}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d1013] px-3 py-2 text-sm">
        <div className="flex flex-wrap items-center gap-1">
          <HudButton onClick={() => setLayer({ k: "panel", panel: "notebook" })}>Notebook</HudButton>
          <HudButton onClick={() => setLayer({ k: "panel", panel: "map" })}>Map</HudButton>
          <HudButton onClick={() => setLayer({ k: "panel", panel: "board" })}>Murder Board</HudButton>
          {view.phone.ringing ? (
            <span className="ml-2 font-mono text-xs text-brass" role="status">
              {inOffice ? "The telephone is ringing." : "Your office telephone is ringing."}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {view.draft ? <span className="mr-2 hidden font-mono text-[0.65rem] text-smoke sm:inline">Draft case content</span> : null}
          <div className="relative">
            <HudButton onClick={() => setMenu((m) => !m)}>Menu</HudButton>
            {menu ? (
              <div className="absolute bottom-full right-0 mb-2 w-64 border border-white/10 bg-[#161b20] p-2 shadow-xl">
                <Link href="/agency/cases" className="block px-3 py-2 hover:bg-white/5">
                  Leave investigation
                  <span className="block text-xs text-smoke">Progress is saved after every action.</span>
                </Link>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-white/5"
                  onClick={async () => {
                    if (!window.confirm("Restart the investigation from the beginning? Your current progress will be archived.")) return;
                    setMenu(false);
                    const res = await restartCase(caseId);
                    if ("error" in res) show(res.error, "error");
                    else {
                      setView(res.view);
                      setLayer(null);
                    }
                  }}
                >
                  Restart investigation
                  <span className="block text-xs text-smoke">Start the case again with a clean file.</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Agency messages */}
      {view.messages.length ? (
        <div className="fixed left-1/2 top-4 z-30 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 space-y-2" role="status">
          {view.messages.map((m) => (
            <div key={m} className="flex items-start justify-between gap-3 border border-brass/40 bg-[#161b20]/95 px-4 py-3 text-sm shadow-lg">
              <span>{m}</span>
              <button type="button" className="shrink-0 text-xs text-smoke hover:text-paper" onClick={() => dispatch({ type: "dismissMessages" })}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {toast ? (
        <div
          role={toast.tone === "error" ? "alert" : "status"}
          className={`fixed bottom-16 left-1/2 z-50 w-[min(30rem,calc(100%-2rem))] -translate-x-1/2 px-4 py-3 text-sm shadow-xl ${
            toast.tone === "error" ? "border border-fault bg-[#2a1715]" : toast.tone === "deduction" ? "border border-brass bg-[#231d14] font-serif text-base text-brass" : "border border-white/10 bg-[#161b20]"
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      <audio ref={audioRef} src={view.location.ambience ?? undefined} loop hidden />

      {/* Layers */}
      {!view.introSeen ? (
        <IntroSequence
          view={view}
          pending={pending}
          onDone={async () => {
            const r = await dispatch({ type: "dismissIntro" });
            if (r) dispatch({ type: "readDocument", documentId: "casefile" });
          }}
        />
      ) : null}
      {layer?.k === "inspect" ? <InspectPanel data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {layer?.k === "evidence" && view.evidence.find((e) => e.id === layer.id) ? (
        <EvidencePanel ev={view.evidence.find((e) => e.id === layer.id)!} view={view} dispatch={dispatch} onClose={() => setLayer({ k: "panel", panel: "notebook" })} pending={pending} />
      ) : null}
      {layer?.k === "conversation" ? <ConversationPanel data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {layer?.k === "document" ? <DocumentPanel data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {layer?.k === "call" ? <CallPanel data={layer.data} onClose={() => setLayer({ k: "panel", panel: "phone" })} /> : null}
      {layer?.k === "delivery" ? <DeliveryPanel data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "notebook" ? <NotebookPanel view={view} dispatch={dispatch} onClose={close} onOpenEvidence={(id) => setLayer({ k: "evidence", id })} pending={pending} /> : null}
      {panel === "map" ? <MapPanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "phone" ? <PhonePanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "statements" ? <StatementsPanel view={view} onClose={close} /> : null}
      {panel === "delivery" ? <MailPanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "conclusion" ? <ConclusionPanel view={view} dispatch={dispatch} onClose={close} pending={pending} feedback={verdictFeedback} /> : null}
      {panel === "board" ? <MurderBoard view={view} dispatch={dispatch} onClose={close} onLocalBoard={(board) => setView((v) => ({ ...v, board }))} /> : null}
      {layer?.k === "closure" && view.closure ? (
        <ClosureSequence
          pages={view.closure}
          onDone={() => {
            router.push("/agency/service-record");
          }}
        />
      ) : null}
      {view.status === "closed" && layer === null ? (
        <div className="fixed right-4 top-4 z-20 max-w-xs border border-[color:var(--color-ok)] bg-[#141a17]/95 p-4 text-sm shadow-lg">
          <p className="font-serif text-lg">Case closed</p>
          <p className="mt-1 text-smoke">You can still look through the scene, your notebook and the board.</p>
          <div className="mt-3 flex gap-3">
            <button type="button" className="text-brass hover:underline" onClick={() => setLayer({ k: "closure" })}>
              Replay the closing report
            </button>
            <Link href="/agency" className="text-smoke hover:text-paper">
              Headquarters
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HudButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[2px] px-3 py-1.5 text-paper/80 transition-colors hover:bg-white/5 hover:text-paper">
      {children}
    </button>
  );
}
