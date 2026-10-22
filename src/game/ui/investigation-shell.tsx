"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { playAction, restartCase } from "@/app/actions/game";
import type { ActionOutcome, ActionResponse, ClientEvidence, ClientView, GameAction, PanelId } from "../engine/types";
import { MurderBoard } from "./board";
import { DetectiveNotebook } from "./detective-notebook";
import { EvidenceInspection } from "./evidence-inspection";
import { EvidenceInventory } from "./evidence-inventory";
import { ExplorationScene } from "./exploration-scene";
import { CaseResolution } from "./case-resolution";
import { FinalReport } from "./final-report";
import {
  CallPanel,
  DeliveryPanel,
  DocumentPanel,
  IntroSequence,
  MailPanel,
  PhonePanel,
  StatementsPanel,
} from "./panels";
import { InterviewScreen } from "./interview-screen";
import { useTelephoneRing } from "./telephone-ring";
import { playTravelSound, type TravelMode } from "./travel-audio";
import { setTravelScenes, TravelScene, useTravelScenes } from "./travel-scene";
import { TravelMap } from "./travel-map";
import { EvidenceStamp } from "./evidence-stamp";

type Layer =
  | { k: "inspect"; text: string; title: string; evidence: ClientEvidence | null }
  | { k: "evidence"; id: string; back: "notebook" | "inventory" | "conclusion" }
  | { k: "panel"; panel: PanelId | "inventory" }
  | { k: "conversation"; data: Extract<ActionOutcome, { kind: "conversation" }> }
  | { k: "document"; data: Extract<ActionOutcome, { kind: "document" }> }
  | { k: "call"; data: Extract<ActionOutcome, { kind: "call" }> }
  | { k: "delivery"; data: Extract<ActionOutcome, { kind: "delivery" }> }
  | { k: "closure"; record?: Extract<ActionOutcome, { kind: "verdict" }>["record"] }
  | null;

type SaveStatus = { state: "saved" | "saving" | "failed"; at: number | null; detail?: string };

export interface GamePrefs {
  reducedMotion: boolean;
  masterVolume: number;
  musicVolume: number;
  dialogueVolume: number;
  sfxVolume: number;
}

/**
 * The full-screen investigation. Every action goes to the server, which applies
 * the case rules, saves, and returns the view the player may see. This
 * component only renders that view and routes outcomes to the right layer.
 */
export function InvestigationShell({
  caseId,
  initial,
  prefs,
  homeLocation,
  investigator,
}: {
  caseId: string;
  initial: ClientView;
  prefs: GamePrefs;
  homeLocation: string;
  investigator: string;
}) {
  const [view, setViewState] = useState(initial);
  /** Evidence collected since the page loaded, waiting to be shown with the COLLECTED stamp. */
  const [stamps, setStamps] = useState<ClientView["evidence"]>([]);
  const seenEvidence = useRef(new Set(initial.evidence.filter((e) => e.collected).map((e) => e.id)));
  const setView = useCallback((next: ClientView) => {
    const fresh = next.evidence.filter((e) => e.collected && !seenEvidence.current.has(e.id));
    for (const e of fresh) seenEvidence.current.add(e.id);
    if (fresh.length) setStamps((q) => [...q, ...fresh]);
    setViewState(next);
  }, []);
  const nextStamp = useCallback(() => setStamps((q) => q.slice(1)), []);
  const [layer, setLayer] = useState<Layer>(null);
  const [pending, setPending] = useState(false);
  const [save, setSave] = useState<SaveStatus>({ state: "saved", at: null });
  const [toast, setToast] = useState<{ text: string; tone: "info" | "error" | "deduction" } | null>(null);
  const [menu, setMenu] = useState(false);
  /** A call the player chose to let ring. It stays pending and rings again on the next visit to the office. */
  const [deferredCall, setDeferredCall] = useState<string | null>(null);
  /** The journey being shown, if any. */
  const [trip, setTrip] = useState<{ mode: TravelMode; to: string; subtitle: string } | null>(null);
  const skipTrip = useRef<(() => void) | null>(null);
  const travelScenes = useTravelScenes();
  const busy = useRef(false);

  const show = useCallback((text: string, tone: "info" | "error" | "deduction" = "info") => setToast({ text, tone }), []);

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
          setLayer({ k: "inspect", text: o.text, title: o.title, evidence: o.evidence });
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
          // A returned report is shown by the report itself; an accepted one starts the conclusion.
          if (o.correct) setLayer({ k: "closure", record: o.record });
          break;
        case "error":
          show(o.message, "error");
          break;
        case "none":
          if (action.type === "travel") setLayer(null);
          break;
      }
      // Leaving the office ends a deferral, so a waiting call rings again on the next visit.
      if (res.view.location.id !== view.location.id) setDeferredCall(null);
    },
    [show, setView, view.location.id],
  );

  const send = useCallback(
    async (action: GameAction) => {
      setSave((s) => ({ ...s, state: "saving" }));
      const res = await playAction(caseId, action);
      if ("error" in res) {
        // Rule refusals change nothing, so the last save still stands.
        setSave((s) => ({ ...s, state: res.saved === false ? "failed" : "saved", detail: res.saved === false ? res.error : undefined }));
        show(res.error, "error");
        return null;
      }
      setSave({ state: "saved", at: Date.now() });
      handle(res, action);
      return res;
    },
    [caseId, handle, show],
  );

  const dispatch = useCallback(
    async (action: GameAction): Promise<ActionResponse | null> => {
      if (busy.current && action.type !== "boardMove") return null;
      busy.current = true;
      setPending(true);
      try {
        const res = await send(action);
        if (res && res.outcome.kind === "panel" && res.outcome.panel === "casefile") {
          // The folder on the desk opens the dossier directly.
          await send({ type: "readDocument", documentId: "casefile" });
        }
        return res;
      } catch {
        setSave((s) => ({ ...s, state: "failed", detail: "Connection lost" }));
        show("The connection to the agency was lost. Your last saved progress is safe; try again.", "error");
        return null;
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [send, show],
  );

  const close = useCallback(() => setLayer(null), []);

  /**
   * Travel with a short journey scene: on foot within a neighbourhood, by car
   * between neighbourhoods. The move is saved on the server while the scene
   * plays; the scene ends when both are done, or sooner if the player skips.
   */
  const travelTo = useCallback(
    async (locationId: string) => {
      const dest = view.map.find((m) => m.id === locationId);
      if (!travelScenes || !dest || pending || dest.current) return dispatch({ type: "travel", locationId });
      const mode: TravelMode = dest.area && dest.area === view.location.area ? "walk" : "drive";
      const seconds = prefs.reducedMotion ? 1.4 : mode === "drive" ? 4.2 : 3.2;
      setLayer(null);
      setTrip({ mode, to: dest.name, subtitle: dest.subtitle });
      const stop = playTravelSound(mode, seconds, (prefs.masterVolume / 100) * (prefs.sfxVolume / 100), view.travelAudio[mode]);
      const minimum = new Promise<void>((resolve) => {
        const t = setTimeout(resolve, seconds * 1000);
        skipTrip.current = () => {
          clearTimeout(t);
          resolve();
        };
      });
      const res = await dispatch({ type: "travel", locationId });
      if (res) await minimum;
      stop();
      skipTrip.current = null;
      setTrip(null);
      return res;
    },
    [view.map, view.location.area, view.travelAudio, travelScenes, pending, prefs.reducedMotion, prefs.masterVolume, prefs.sfxVolume, dispatch],
  );

  /** A replay is a new investigation; a closed case and its report stay on file and keep their credit. */
  const replay = useCallback(async () => {
    const closedCase = view.status === "closed";
    const msg = closedCase
      ? "Start a new investigation of this case? Your closed case and its final report stay on file, and you keep the credit. The replay starts with a clean file."
      : "Restart the investigation from the beginning? Your current progress will be archived.";
    if (!window.confirm(msg)) return;
    setMenu(false);
    const res = await restartCase(caseId);
    if ("error" in res) show(res.error, "error");
    else {
      setView(res.view);
      setLayer(null);
      setSave({ state: "saved", at: Date.now() });
    }
  }, [caseId, show, setView, view.status]);

  // Ambient sound, only when a recording exists for this location.
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, (prefs.masterVolume / 100) * (prefs.musicVolume / 100)));
    if (view.location.ambience) a.play().catch(() => undefined);
  }, [view.location.ambience, prefs.masterVolume, prefs.musicVolume]);

  const panel = layer?.k === "panel" ? layer.panel : null;
  const atHome = view.location.id === homeLocation;
  // The telephone rings only in the office, and never over an interview, a document or an inspection.
  const ringing = Boolean(!trip && view.phone.ringing && atHome && view.introSeen && (layer === null || panel === "phone") && deferredCall !== view.phone.ringing.id);
  useTelephoneRing(ringing, (prefs.masterVolume / 100) * (prefs.sfxVolume / 100));
  const locked = view.status === "closed";
  const pin = (id: string) => dispatch({ type: "boardAdd", itemId: id, x: 10 + Math.random() * 70, y: 10 + Math.random() * 60 });
  const pinned = (id: string) => view.board.items.some((i) => i.id === id);
  const dialogueVolume = Math.max(0, Math.min(1, (prefs.masterVolume / 100) * (prefs.dialogueVolume / 100)));
  const narrationFor = (id: string) =>
    view.narration
      ? {
          src: `/api/narration?caseId=${encodeURIComponent(caseId)}&evidenceId=${encodeURIComponent(id)}`,
          volume: Math.max(0, Math.min(1, (prefs.masterVolume / 100) * (prefs.dialogueVolume / 100))),
        }
      : null;
  const saveNote = (id: string) => (text: string) => dispatch({ type: "saveEvidenceNote", evidenceId: id, text });

  // The evidence shown in an inspection: the collected copy if the player has it, else the scene's copy.
  const inspected =
    layer?.k === "inspect" && layer.evidence ? view.evidence.find((e) => e.id === layer.evidence!.id) ?? layer.evidence : null;
  const fromNotebook = layer?.k === "evidence" ? view.evidence.find((e) => e.id === layer.id) ?? null : null;

  return (
    <div className="fixed inset-0 flex select-none flex-col bg-black text-paper">
      {/* Top bar: where you are, whether it is saved, and the way out */}
      <div className="flex shrink-0 items-center justify-between gap-3 bg-[#0d1013] px-3 py-1.5 text-xs">
        <p className="truncate font-mono text-paper/70">
          <span className="text-brass">{view.caseId}</span> {view.title}
          <span className="hidden sm:inline">
            {" "}
            / <span className="text-paper">{view.location.name}</span>
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <SaveIndicator status={save} />
          <Link href="/agency" className="text-paper/80 underline-offset-4 hover:text-brass hover:underline">
            Return to Agency HQ
          </Link>
        </div>
      </div>

      <ExplorationScene
        location={view.location}
        disabled={pending}
        reducedMotion={prefs.reducedMotion}
        onHotspot={(id) => dispatch({ type: "hotspot", hotspotId: id })}
      />

      {/* Controls */}
      {/* One row on every screen; on a phone the buttons scroll sideways rather than stacking over the scene. */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#0d1013] px-2 py-1.5 text-sm sm:px-3 sm:py-2">
        <nav aria-label="Investigation" className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto sm:gap-1">
          <HudButton onClick={() => setLayer({ k: "panel", panel: "notebook" })}>Notebook</HudButton>
          <HudButton onClick={() => setLayer({ k: "panel", panel: "inventory" })}>
            Evidence <span className="font-mono text-xs text-brass">{view.evidence.length}</span>
          </HudButton>
          <HudButton onClick={() => setLayer({ k: "panel", panel: "map" })}>Map</HudButton>
          <HudButton onClick={() => setLayer({ k: "panel", panel: "board" })}>
            <span className="sm:hidden">Board</span>
            <span className="hidden sm:inline">Murder Board</span>
          </HudButton>
          {!atHome ? (
            <HudButton disabled={pending || !view.map.find((m) => m.id === homeLocation)?.available} onClick={() => travelTo(homeLocation)}>
              <span className="sm:hidden">Office</span>
              <span className="hidden sm:inline">Back to the office</span>
            </HudButton>
          ) : null}
          {view.phone.ringing ? (
            <span className="ml-2 hidden whitespace-nowrap font-mono text-xs text-brass/80 sm:inline" role="status">
              {atHome ? "Agency telephone ringing." : "A call is waiting at the office."}
            </span>
          ) : null}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          {view.draft ? <span className="mr-2 hidden font-mono text-[0.65rem] text-smoke sm:inline">Draft case content</span> : null}
          <div className="relative">
            <HudButton onClick={() => setMenu((m) => !m)}>Menu</HudButton>
            {menu ? (
              <div className="absolute bottom-full right-0 z-30 mb-2 w-64 border border-white/10 bg-[#161b20] p-2 shadow-xl">
                <Link href="/agency/cases" className="block px-3 py-2 hover:bg-white/5">
                  My Case Files
                  <span className="block text-xs text-smoke">Progress is saved after every action.</span>
                </Link>
                <button
                  type="button"
                  role="switch"
                  aria-checked={view.narration}
                  className="block w-full px-3 py-2 text-left hover:bg-white/5"
                  onClick={() => dispatch({ type: "setNarration", enabled: !view.narration })}
                >
                  Evidence narration: {view.narration ? "On" : "Off"}
                  <span className="block text-xs text-smoke">Shows a Read aloud control on evidence. Audio only plays when you press Play.</span>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={view.voices}
                  className="block w-full px-3 py-2 text-left hover:bg-white/5"
                  onClick={() => dispatch({ type: "setVoices", enabled: !view.voices })}
                >
                  Character voices: {view.voices ? "On" : "Off"}
                  <span className="block text-xs text-smoke">Interviews, police tapes and calls are spoken aloud, with subtitles.</span>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={travelScenes}
                  className="block w-full px-3 py-2 text-left hover:bg-white/5"
                  onClick={() => setTravelScenes(!travelScenes)}
                >
                  Travel scenes: {travelScenes ? "On" : "Off"}
                  <span className="block text-xs text-smoke">A short drive or walk, with sound, between locations. Click to skip.</span>
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-white/5"
                  onClick={replay}
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
        <div className="fixed left-1/2 top-12 z-30 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 space-y-2" role="status">
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
            toast.tone === "error"
              ? "border border-fault bg-[#2a1715]"
              : toast.tone === "deduction"
                ? "border border-brass bg-[#231d14] font-serif text-base text-brass"
                : "border border-white/10 bg-[#161b20]"
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

      {layer?.k === "inspect" && inspected ? (
        <EvidenceInspection
          key={inspected.id}
          evidence={inspected}
          observation={layer.text}
          narration={narrationFor(inspected.id)}
          onSaveNote={saveNote(inspected.id)}
          onCollect={() => dispatch({ type: "collect", evidenceId: inspected.id })}
          onPin={() => pin(inspected.id)}
          pinned={pinned(inspected.id)}
          onClose={close}
          pending={pending}
          locked={locked}
        />
      ) : null}
      {layer?.k === "inspect" && !layer.evidence ? <ObservationCard title={layer.title} text={layer.text} onClose={close} /> : null}
      {layer?.k === "evidence" && fromNotebook ? (
        <EvidenceInspection
          key={fromNotebook.id}
          evidence={fromNotebook}
          narration={narrationFor(fromNotebook.id)}
          onSaveNote={saveNote(fromNotebook.id)}
          onCollect={() => undefined}
          onPin={() => pin(fromNotebook.id)}
          pinned={pinned(fromNotebook.id)}
          onClose={() => setLayer({ k: "panel", panel: layer.back })}
          closeLabel={layer.back === "notebook" ? "Back to notebook" : layer.back === "conclusion" ? "Back to the report" : "Back to evidence"}
          pending={pending}
          locked={locked}
        />
      ) : null}

      {layer?.k === "conversation" ? (
        <InterviewScreen key={layer.data.characterId} caseId={caseId} data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} volume={dialogueVolume} />
      ) : null}
      {layer?.k === "document" ? <DocumentPanel data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {layer?.k === "call" ? <CallPanel caseId={caseId} data={layer.data} voices={view.voices} volume={dialogueVolume} onClose={() => setLayer({ k: "panel", panel: "phone" })} /> : null}
      {layer?.k === "delivery" ? (
        <DeliveryPanel caseId={caseId} data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} volume={dialogueVolume} />
      ) : null}

      {panel === "notebook" ? (
        <DetectiveNotebook view={view} dispatch={dispatch} onClose={close} onOpenEvidence={(id) => setLayer({ k: "evidence", id, back: "notebook" })} pending={pending} />
      ) : null}
      {panel === "inventory" ? (
        <EvidenceInventory items={view.evidence} onOpen={(id) => setLayer({ k: "evidence", id, back: "inventory" })} onClose={close} />
      ) : null}
      {panel === "map" ? <TravelMap view={view} onTravel={(id) => travelTo(id)} onClose={close} pending={pending} /> : null}
      {trip ? <TravelScene mode={trip.mode} to={trip.to} subtitle={trip.subtitle} reducedMotion={prefs.reducedMotion} onSkip={() => skipTrip.current?.()} /> : null}
      {stamps.length && !trip ? (
        <EvidenceStamp key={stamps[0].id} item={stamps[0]} volume={(prefs.masterVolume / 100) * (prefs.sfxVolume / 100)} reducedMotion={prefs.reducedMotion} onDone={nextStamp} />
      ) : null}
      {panel === "phone" ? (
        <PhonePanel
          view={view}
          dispatch={dispatch}
          onClose={close}
          pending={pending}
          onDefer={() => {
            if (view.phone.ringing) setDeferredCall(view.phone.ringing.id);
            close();
          }}
        />
      ) : null}
      {panel === "statements" ? <StatementsPanel caseId={caseId} view={view} onClose={close} volume={dialogueVolume} /> : null}
      {panel === "delivery" ? <MailPanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "conclusion" ? (
        <FinalReport
          view={view}
          dispatch={dispatch}
          pending={pending}
          investigator={investigator}
          onClose={close}
          onExamine={(id) => setLayer({ k: "evidence", id, back: "conclusion" })}
        />
      ) : null}
      {panel === "board" ? <MurderBoard view={view} dispatch={dispatch} onClose={close} onLocalBoard={(board) => setViewState((v) => ({ ...v, board }))} /> : null}

      {layer?.k === "closure" && view.closure ? (
        <CaseResolution
          caseId={caseId}
          view={view}
          closure={view.closure}
          record={layer.record}
          volume={dialogueVolume}
          reducedMotion={prefs.reducedMotion}
          onReviewReport={() => setLayer({ k: "panel", panel: "conclusion" })}
          onEvidence={() => setLayer({ k: "panel", panel: "inventory" })}
          onReplay={replay}
          onClose={close}
        />
      ) : null}
      {locked && layer === null ? (
        <div className="fixed right-4 top-12 z-20 max-w-xs border border-[color:var(--color-ok)] bg-[#141a17]/95 p-4 text-sm shadow-lg">
          <p className="font-serif text-lg">Case closed</p>
          <p className="mt-1 text-smoke">You can still look through the scenes, your notebook and the board.</p>
          <div className="mt-3 flex flex-col items-start gap-1.5">
            <button type="button" className="text-brass hover:underline" onClick={() => setLayer({ k: "panel", panel: "conclusion" })}>
              Review the final report
            </button>
            <button type="button" className="text-brass hover:underline" onClick={() => setLayer({ k: "closure" })}>
              Replay the conclusion
            </button>
            <button type="button" className="text-brass hover:underline" onClick={replay}>
              Start a new investigation (replay)
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ObservationCard({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center game-fade" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-xl border border-white/10 bg-[#161b20]/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif text-xl">{title}</p>
        <p className="mt-3 font-serif text-lg leading-relaxed text-paper/90">{text}</p>
        <button type="button" autoFocus onClick={onClose} className="mt-5 text-sm text-brass underline-offset-4 hover:underline">
          Return to scene
        </button>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const time = status.at ? new Date(status.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const label =
    status.state === "saving" ? "Saving" : status.state === "failed" ? `Not saved${status.detail ? `: ${status.detail}` : ""}` : time ? `Saved ${time}` : "Progress saved";
  return (
    <span role="status" aria-live="polite" className={`flex items-center gap-1.5 font-mono ${status.state === "failed" ? "text-[#e2a7a2]" : "text-paper/60"}`}>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${status.state === "saving" ? "animate-pulse bg-brass" : status.state === "failed" ? "bg-fault" : "bg-[color:var(--color-ok)]"}`}
      />
      <span className="max-w-[16rem] truncate">{label}</span>
    </span>
  );
}

function HudButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 whitespace-nowrap rounded-[2px] px-2.5 py-1.5 text-paper/80 transition-colors hover:bg-white/5 hover:text-paper disabled:opacity-40 sm:px-3"
    >
      {children}
    </button>
  );
}
