"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { playAction, restartCase, syncView } from "@/app/actions/game";
import { saveGameVolumes } from "@/app/actions/settings";
import { paintedArt } from "@/lib/art";
import type { ActionOutcome, ActionResponse, ClientEvidence, ClientView, GameAction, PanelId } from "../engine/types";
import { MurderBoard } from "./board";
import { RollingBoardPanel } from "@/components/series/rolling-board-panel";
import { SERIES } from "@/series";
import { GameButton } from "./overlay";
import { DetectiveNotebook } from "./detective-notebook";
import { EvidenceInspection } from "./evidence-inspection";
import { EvidenceInventory } from "./evidence-inventory";
import { ExplorationScene } from "./exploration-scene";
import { CaseResolution } from "./case-resolution";
import { ChapterOpening, CheckpointScreen, ResumeScreen } from "./chapter-screens";
import { ReportDialog } from "./feedback-forms";
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
import { SequencePanel } from "./sequence-panel";
import { ComparisonPanel } from "./comparison-panel";
import { useTelephoneRing } from "./telephone-ring";
import { playTravelSound, type TravelMode } from "./travel-audio";
import { setTravelScenes, TravelScene, useTravelScenes } from "./travel-scene";
import { TravelMap } from "./travel-map";
import { EvidenceStamp } from "./evidence-stamp";
import { isSpeaking, subscribeSpeaking } from "./audio-bus";
import { setMusicEnabled, useBackgroundSound, useMusicEnabled } from "./background-sound";

type Layer =
  | { k: "inspect"; text: string; title: string; evidence: ClientEvidence | null; photo: { hotspotId: string; taken: boolean } | null }
  | { k: "evidence"; id: string; back: "notebook" | "inventory" | "conclusion" | "scene"; prev?: Layer }
  | { k: "panel"; panel: PanelId | "inventory" }
  | { k: "conversation"; data: Extract<ActionOutcome, { kind: "conversation" }> }
  | { k: "document"; data: Extract<ActionOutcome, { kind: "document" }> }
  | { k: "call"; data: Extract<ActionOutcome, { kind: "call" }> }
  | { k: "delivery"; data: Extract<ActionOutcome, { kind: "delivery" }> }
  | { k: "closure"; record?: Extract<ActionOutcome, { kind: "verdict" }>["record"] }
  | null;

type SaveStatus = { state: "saved" | "saving" | "failed"; at: number | null; detail?: string };

/** A joint investigation played in the same room on one shared save. */
export interface PartyInfo {
  /** Shown in the top bar, e.g. "Joint investigation · 3 at the table". */
  label: string;
  /** This screen belongs to a guest, who helps the host but cannot file the report or restart. */
  guest: boolean;
  /** The save's last-changed time when the page loaded. */
  stamp: string;
}

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
  prefs: basePrefs,
  homeLocation,
  investigator,
  party,
  reviewed = false,
  lastPlayed = null,
}: {
  /** When the save last changed, for the resume screen of a case told in chapters. */
  lastPlayed?: string | null;
  /** This investigator already sent a review of the case. */
  reviewed?: boolean;
  caseId: string;
  initial: ClientView;
  prefs: GamePrefs;
  homeLocation: string;
  investigator: string;
  party?: PartyInfo;
}) {
  // Music, sound-effect and voice levels from the in-game menu. Signed-in players' levels are saved to their
  // settings; a guest at a joint investigation keeps theirs in this browser.
  const [levels, setLevels] = useState(() => {
    const base = { musicVolume: basePrefs.musicVolume, sfxVolume: basePrefs.sfxVolume, dialogueVolume: basePrefs.dialogueVolume };
    if (!party?.guest || typeof window === "undefined") return base;
    try {
      return { ...base, ...(JSON.parse(localStorage.getItem("bw-guest-volumes") ?? "{}") as Partial<typeof base>) };
    } catch {
      return base;
    }
  });
  const prefs = { ...basePrefs, ...levels };
  const saveLevels = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setLevel = (key: keyof typeof levels, value: number) => {
    const next = { ...levels, [key]: value };
    setLevels(next);
    if (saveLevels.current) clearTimeout(saveLevels.current);
    saveLevels.current = setTimeout(() => {
      if (party?.guest) {
        try {
          localStorage.setItem("bw-guest-volumes", JSON.stringify(next));
        } catch {
          /* storage unavailable; the levels last for this visit */
        }
      } else void saveGameVolumes({ music: next.musicVolume, sfx: next.sfxVolume, dialogue: next.dialogueVolume }).catch(() => undefined);
    }, 600);
  };
  const [view, setViewState] = useState(initial);
  /** Coming back to a case told in chapters: where things stand, before carrying on. */
  const [resuming, setResuming] = useState(() => Boolean(initial.chapter && initial.introSeen && initial.status === "active" && !initial.chapter.checkpoint));
  /** The chapter that has just opened, shown as a title card. */
  const [opening, setOpening] = useState<{ number: number; title: string; intro: string } | null>(null);
  /** When each lab test's results are due, by this browser's clock. */
  const [labDue, setLabDue] = useState<Record<string, number>>(() => Object.fromEntries(initial.labs.map((l) => [l.id, Date.now() + l.remainingMs])));
  /** Evidence collected since the page loaded, waiting to be shown with the COLLECTED stamp. */
  const [stamps, setStamps] = useState<ClientView["evidence"]>([]);
  const seenEvidence = useRef(new Set(initial.evidence.filter((e) => e.collected).map((e) => e.id)));
  /** Evidence collected somewhere that could not show it in full (an interview, a call): opened once the player is back in the scene. */
  const revealQueue = useRef<string[]>([]);
  const layerRef = useRef<Layer>(null);
  const setView = useCallback((next: ClientView) => {
    const fresh = next.evidence.filter((e) => e.collected && !seenEvidence.current.has(e.id));
    for (const e of fresh) seenEvidence.current.add(e.id);
    if (fresh.length) setStamps((q) => [...q, ...fresh]);
    // Picked up while looking at it in the scene: the details are already on screen.
    const cur = layerRef.current;
    const onScreen = cur?.k === "inspect" ? cur.evidence?.id : cur?.k === "evidence" ? cur.id : undefined;
    for (const e of fresh) if (e.id !== onScreen && !revealQueue.current.includes(e.id)) revealQueue.current.push(e.id);
    setLabDue(Object.fromEntries(next.labs.map((l) => [l.id, Date.now() + l.remainingMs])));
    setViewState(next);
  }, []);
  const nextStamp = useCallback(() => setStamps((q) => q.slice(1)), []);
  const [layer, setLayer] = useState<Layer>(null);
  useEffect(() => {
    layerRef.current = layer;
  }, [layer]);
  const [pending, setPending] = useState(false);
  const [save, setSave] = useState<SaveStatus>({ state: "saved", at: null });
  const [toast, setToast] = useState<{ text: string; tone: "info" | "error" | "deduction" } | null>(null);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState<{ open: string; characterId: string | null } | null>(null);
  // Things on the desk (and anywhere else) stack in the order they were last picked up: the latest lies on top.
  const stackKey = `bw-stack-${caseId}`;
  const [stack, setStack] = useState<string[]>([]);
  // Read after mount: the server render has no saved order, and the first client render must match it.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(stackKey) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(v)) setStack(v.filter((x): x is string => typeof x === "string").slice(-40));
    } catch {
      /* nothing saved */
    }
  }, [stackKey]);
  const handled = useCallback(
    (id: string) =>
      setStack((cur) => {
        const next = [...cur.filter((x) => x !== id), id].slice(-40);
        try {
          localStorage.setItem(stackKey, JSON.stringify(next));
        } catch {
          /* storage unavailable: the order lasts until the page reloads */
        }
        return next;
      }),
    [stackKey],
  );
  /** A call the player chose to let ring. It stays pending and rings again on the next visit to the office. */
  const [deferredCall, setDeferredCall] = useState<string | null>(null);
  /** The journey being shown, if any. */
  const [trip, setTrip] = useState<{ mode: TravelMode; to: string; subtitle: string; area: string | null } | null>(null);
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
      // Collected from a delivery or a document: show it in full at once, then back to where it came from.
      if (action.type === "collect" && o.kind !== "error" && o.kind !== "inspect") {
        const id = action.evidenceId;
        revealQueue.current = revealQueue.current.filter((x) => x !== id);
        setLayer((cur) => (cur?.k === "inspect" ? cur : { k: "evidence", id, back: "scene", prev: cur }));
        return;
      }
      switch (o.kind) {
        case "inspect":
          setLayer({ k: "inspect", text: o.text, title: o.title, evidence: o.evidence, photo: o.photo });
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
      const res = await playAction(caseId, action, Boolean(party?.guest));
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
    [caseId, handle, show, party?.guest],
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

  // The evidence bag glows while it holds things the player has not looked through yet.
  // The first time ever, it also says so, to teach where the full details live.
  const bagKey = `bw-evidence-seen-${caseId}`;
  const [bagSeen, setBagSeen] = useState<number | null>(null);
  const [bagOpened, setBagOpened] = useState(true);
  useEffect(() => {
    let seen = initial.evidence.length;
    let opened = false;
    try {
      const v = localStorage.getItem(bagKey);
      if (v !== null && Number.isFinite(Number(v))) seen = Number(v);
      opened = localStorage.getItem("bw-evidence-bag-opened") === "1";
    } catch {
      /* nothing saved */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBagSeen(seen);
    setBagOpened(opened);
  }, [bagKey, initial.evidence.length]);
  const newEvidence = bagSeen !== null && view.evidence.length > bagSeen;
  const openBag = useCallback(() => {
    setLayer({ k: "panel", panel: "inventory" });
    setBagSeen(view.evidence.length);
    setBagOpened(true);
    try {
      localStorage.setItem(bagKey, String(view.evidence.length));
      localStorage.setItem("bw-evidence-bag-opened", "1");
    } catch {
      /* storage unavailable: the glow clears for this visit */
    }
  }, [bagKey, view.evidence.length]);

  // Evidence handed over in an interview or a call is shown in full once the player is back in the scene.
  useEffect(() => {
    if (layer || trip) return;
    const id = revealQueue.current.shift();
    if (id) setLayer({ k: "evidence", id, back: "scene" });
  }, [layer, trip, view.evidence]);

  // Lab countdowns: tick once a second, and when one runs out, let the server deliver the results.
  const waiting = view.labs.filter((l) => !l.done);
  const [clock, setClock] = useState(0);
  useEffect(() => {
    if (!waiting.length) return;
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, [waiting.length]);
  const asked = useRef(new Set<string>());
  useEffect(() => {
    if (view.status === "closed" || !clock) return;
    const due = waiting.filter((l) => (labDue[l.id] ?? 0) <= clock && !asked.current.has(l.id));
    if (!due.length || busy.current) return;
    for (const l of due) asked.current.add(l.id);
    void dispatch({ type: "checkLabs" }).then((r) => {
      // Not back yet by the server's clock (a slow device clock): try again shortly.
      if (r?.view.labs.some((l) => due.some((d) => d.id === l.id) && !l.done)) for (const l of due) asked.current.delete(l.id);
    });
  }, [clock, waiting, labDue, view.status, dispatch]);
  const labLeft = (id: string) => {
    const ms = Math.max(0, (labDue[id] ?? 0) - (clock || labDue[id] || 0));
    const sec = Math.ceil(ms / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  // Agency notices clear themselves after a few seconds; the notebook keeps anything worth keeping.
  const messageKey = view.messages.join("|");
  useEffect(() => {
    if (!messageKey) return;
    const t = setTimeout(() => {
      if (!busy.current) void playAction(caseId, { type: "dismissMessages" }, Boolean(party?.guest)).then((r) => !("error" in r) && setView(r.view));
    }, 6000);
    return () => clearTimeout(t);
  }, [messageKey, caseId, party?.guest, setView]);

  // Joint investigation: everyone plays one save, so each screen picks up what the others did.
  const stamp = useRef(party?.stamp ?? "");
  const tripRef = useRef(false);
  const statusRef = useRef(view.status);
  useEffect(() => {
    statusRef.current = view.status;
    tripRef.current = Boolean(trip);
  }, [view.status, trip]);
  useEffect(() => {
    if (!party) return;
    let stopped = false;
    const tick = async () => {
      if (stopped || busy.current || tripRef.current || document.visibilityState !== "visible") return;
      const r = await syncView(caseId, stamp.current, party.guest).catch(() => null);
      if (stopped || !r || busy.current) return;
      if ("error" in r) {
        if (party.guest) window.location.replace("/party/ended");
        return;
      }
      if (r.changed) {
        stamp.current = r.stamp;
        // The host filed the report and it was accepted: play the conclusion for everyone.
        if (r.response.view.status === "closed" && statusRef.current !== "closed") setLayer({ k: "closure" });
        setView(r.response.view);
      }
    };
    const t = setInterval(tick, 2500);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [party, caseId, setView]);
  const guest = Boolean(party?.guest);

  /**
   * Travel with a short journey scene: on foot within a neighborhood, by car
   * between neighborhoods. The move is saved on the server while the scene
   * plays; the scene ends when both are done, or sooner if the player skips.
   */
  const travelTo = useCallback(
    async (locationId: string) => {
      const dest = view.map.find((m) => m.id === locationId);
      if (!travelScenes || !dest || pending || dest.current) return dispatch({ type: "travel", locationId });
      const mode: TravelMode = dest.area && dest.area === view.location.area ? "walk" : "drive";
      const seconds = prefs.reducedMotion ? 1.4 : mode === "drive" ? 4.2 : 3.2;
      setLayer(null);
      setTrip({ mode, to: dest.name, subtitle: dest.subtitle, area: dest.area });
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

  // Background music for the case and room sound for each scene. Music dips while someone is speaking.
  const musicOn = useMusicEnabled();
  // Half volume during an interview, a call or the ending, and whenever a recording or the narrator is playing.
  const voicePlaying = useSyncExternalStore(subscribeSpeaking, isSpeaking, () => false);
  const ducked = voicePlaying || layer?.k === "conversation" || layer?.k === "call" || layer?.k === "delivery" || layer?.k === "closure";
  const duck = ducked ? 0.5 : 1;
  const master = prefs.masterVolume / 100;
  useBackgroundSound({
    music: musicOn && view.music.length ? view.music : null,
    ambience: trip ? null : view.location.ambience,
    musicVolume: master * (prefs.musicVolume / 100) * 0.35 * duck,
    ambienceVolume: master * (prefs.sfxVolume / 100) * 0.6 * duck,
  });

  const panel = layer?.k === "panel" ? layer.panel : null;
  const atHome = view.location.id === homeLocation;
  // The telephone rings only in the office (anywhere, with a mobile phone), and never over an interview, a document or an inspection.
  const phoneHere = atHome || view.phone.mobile;
  const ringing = Boolean(!trip && view.phone.ringing && phoneHere && view.introSeen && (layer === null || panel === "phone") && deferredCall !== view.phone.ringing.id);
  useTelephoneRing(ringing, (prefs.masterVolume / 100) * (prefs.sfxVolume / 100), view.theme === "medieval" ? "knock" : "telephone");
  const words = view.words;
  const locked = view.status === "closed";
  const pin = (id: string) => dispatch({ type: "boardAdd", itemId: id, x: 10 + Math.random() * 70, y: 10 + Math.random() * 60 });
  const pinned = (id: string) => view.board.items.some((i) => i.id === id);
  const dialogueVolume = Math.max(0, Math.min(1, (prefs.masterVolume / 100) * (prefs.dialogueVolume / 100)));
  const narrationFor = (id: string) =>
    view.narration && !view.evidence.find((e) => e.id === id)?.photo
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
    <div className="fixed inset-0 flex select-none flex-col bg-black text-paper" data-theme={view.theme}>
      {/* Top bar: where you are, whether it is saved, and the way out */}
      <div className="flex shrink-0 items-center justify-between gap-3 bg-[#0d1013] px-3 py-1.5 text-xs">
        <p className="truncate font-mono text-paper/70">
          <span className="text-brass">{view.caseId}</span> {view.title}
          {view.chapter ? <span className="hidden text-paper/70 lg:inline"> · Chapter {view.chapter.number}: {view.chapter.title}</span> : null}
          {view.caseStatus ? <span className="hidden text-fault md:inline"> · {view.caseStatus}</span> : null}
          <span className="hidden sm:inline">
            {" "}
            / <span className="text-paper">{view.location.name}</span>
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          {waiting.length ? (
            <span className="font-mono text-brass" role="timer">
              <span className="hidden sm:inline">Lab results in </span>
              <span className="sm:hidden">Lab </span>
              {labLeft(waiting[0].id)}
            </span>
          ) : null}
          {party ? <span className="hidden font-mono text-brass/80 md:inline">{party.label}</span> : null}
          {view.phone.ringing ? (
            <span className="hidden whitespace-nowrap font-mono text-brass sm:inline" role="status">
              {view.phone.mobile ? `${view.phone.ringing.from} calling` : atHome ? words.callRinging : words.callWaiting}
            </span>
          ) : null}
          <SaveIndicator status={save} />
          {guest ? (
            <Link href="/party/leave" prefetch={false} className="text-paper/80 underline-offset-4 hover:text-brass hover:underline">
              Leave
            </Link>
          ) : (
            <Link href="/agency" className="text-paper/80 underline-offset-4 hover:text-brass hover:underline">
              {words.leave}
            </Link>
          )}
          <div className="relative">
            <button
              type="button"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="rounded-[2px] border border-white/15 px-2.5 py-1 text-paper/90 hover:border-brass hover:text-brass"
            >
              Menu
            </button>
            {menu ? (
              <div className="absolute right-0 top-full z-50 mt-1.5 max-h-[calc(100dvh-3rem)] overflow-y-auto w-72 max-w-[calc(100vw-1rem)] border border-white/10 bg-[#161b20] p-2 shadow-xl">
                {guest ? (
                  <p className="px-3 py-2 text-xs text-smoke">You are helping the host. Everything you do is saved to their investigation.</p>
                ) : (
                  <Link href="/agency/cases" className="block px-3 py-2 hover:bg-white/5">
                    My Case Files
                    <span className="block text-xs text-smoke">Progress is saved after every action.</span>
                  </Link>
                )}
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
                <div className="space-y-2 border-b border-white/10 px-3 pb-3 pt-2">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-smoke">Volume</p>
                  <VolumeSlider label="Music" value={levels.musicVolume} onChange={(v) => setLevel("musicVolume", v)} />
                  <VolumeSlider label="Sound effects" value={levels.sfxVolume} onChange={(v) => setLevel("sfxVolume", v)} />
                  <VolumeSlider label="Voices" value={levels.dialogueVolume} onChange={(v) => setLevel("dialogueVolume", v)} />
                </div>
                <button type="button" role="switch" aria-checked={musicOn} className="block w-full px-3 py-2 text-left hover:bg-white/5" onClick={() => setMusicEnabled(!musicOn)}>
                  Music: {musicOn ? "On" : "Off"}
                  <span className="block text-xs text-smoke">Background score for the case. Room sounds stay on.</span>
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
                  onClick={() => {
                    setMenu(false);
                    setReport(describeLayer(layer, panel));
                  }}
                >
                  Send feedback
                  <span className="block text-xs text-smoke">Found a bug or a confusing clue? Tell us what happened.</span>
                </button>
                {guest ? null : (
                  <button type="button" className="block w-full px-3 py-2 text-left hover:bg-white/5" onClick={replay}>
                    Restart investigation
                    <span className="block text-xs text-smoke">Start the case again with a clean file.</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ExplorationScene
        introKey={`bw-swipe-${caseId}`}
        overlays={
          atHome
            ? waiting.map((l) => (
                <div
                  key={l.id}
                  className="pointer-events-none absolute flex flex-col items-center justify-center"
                  style={{ left: `${l.rect.x}%`, top: `${l.rect.y}%`, width: `${l.rect.w}%`, height: `${l.rect.h}%` }}
                  data-lab-countdown={l.id}
                >
                  <span className="relative whitespace-nowrap border border-brass/60 bg-[#0d1013]/90 px-2 py-1 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brass shadow-lg sm:text-[0.7rem]">
                    Lab results
                    <span className="block text-sm tracking-[0.1em] text-paper sm:text-base">{labLeft(l.id)}</span>
                  </span>
                </div>
              ))
            : null
        }
        underlays={
          atHome
            ? waiting.map((l) =>
                l.image ? (
                  // Where the results will land: the folder, grayed out, until the lab is done.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={l.id}
                    src={l.image}
                    alt=""
                    draggable={false}
                    className="absolute object-contain opacity-45 grayscale brightness-75"
                    style={{ left: `${l.rect.x}%`, top: `${l.rect.y}%`, width: `${l.rect.w}%`, height: `${l.rect.h}%` }}
                  />
                ) : null,
              )
            : null
        }
        location={view.location}
        disabled={pending}
        reducedMotion={prefs.reducedMotion}
        stack={stack}
        onHotspot={(id) => {
          handled(id);
          if (view.location.hotspots.find((h) => h.id === id)?.local === "rolling") {
            setLayer({ k: "panel", panel: "rolling" });
            return Promise.resolve(null);
          }
          return dispatch({ type: "hotspot", hotspotId: id });
        }}
      />

      {/* Map, notebook and evidence: painted objects in the corner of the scene. The murder board is on the office wall. */}
      <nav aria-label="Investigation" className="pointer-events-none fixed bottom-3 left-3 z-20 flex items-end gap-2 sm:bottom-4 sm:left-4 sm:gap-3">
        {/* In the office the map and notebook are in the room itself; only the evidence stays in the corner. */}
        {atHome ? null : (
          <>
            {/* Someone being held has no map to follow: the way out is in the scenes. */}
            {view.captivity?.role === "captive" ? null : (
              <HudObject label={words.map} image={hudArt(caseId, "map", view.theme, view.caseArt)} fallback="map" onClick={() => setLayer({ k: "panel", panel: "map" })} />
            )}
            <HudObject label={words.notebook} image={hudArt(caseId, "obj_notebook", view.theme, view.caseArt)} fallback="notebook" onClick={() => setLayer({ k: "panel", panel: "notebook" })} />
          </>
        )}
        <HudObject
          label={words.evidence}
          image={hudArt(caseId, "obj_evidence_bag", view.theme, view.caseArt)}
          fallback="evidence"
          count={view.evidence.length}
          glow={newEvidence}
          callout={newEvidence && !bagOpened ? (view.theme === "medieval" ? "Something new. Open your satchel to study it." : "New evidence. Open the bag to study it.") : undefined}
          onClick={() => openBag()}
        />
        {/* A case with a mobile phone carries it everywhere; it shakes while a call is coming in. */}
        {view.phone.mobile ? (
          <HudObject
            label="Phone"
            image={hudArt(caseId, "obj_phone", view.theme, view.caseArt)}
            fallback="phone"
            alert={Boolean(view.phone.ringing)}
            onClick={() => setLayer({ k: "panel", panel: "phone" })}
          />
        ) : null}
      </nav>

      {/* Someone is being held: each screen's part in it, and a way forward if a screen goes quiet */}
      {view.captivity && view.introSeen ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-20 w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 sm:bottom-6" role="status">
          <div className="pointer-events-auto border border-fault/60 bg-[#1c1412]/95 px-4 py-3 text-sm shadow-lg">
            <p>
              {view.captivity.role === "captive"
                ? view.captivity.mode === "rescue"
                  ? "You are being held. The others are out there looking for you. Find a way to tell them where you are."
                  : "You are being held. Nobody knows where you are. Find a way out."
                : `${view.captivity.who} went to the meeting and has not come back.`}
            </p>
            {view.captivity.quiet ? (
              <p className="mt-1 text-smoke">
                {view.captivity.role === "captive" ? "The others have gone quiet." : `${view.captivity.who}'s screen has gone quiet.`}
              </p>
            ) : null}
            {view.captivity.canTakeOver ? (
              <div className="mt-2">
                <GameButton variant="ghost" disabled={pending} onClick={() => dispatch({ type: "takeCaptiveRole" })}>
                  Take their place
                </GameButton>
              </div>
            ) : null}
            {view.captivity.canGoAlone ? (
              <div className="mt-2">
                <GameButton variant="ghost" disabled={pending} onClick={() => dispatch({ type: "goAlone" })}>
                  Go it alone
                </GameButton>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Agency messages: shown for a few seconds, never in the way of the scene */}
      {view.messages.length ? (
        <div className="pointer-events-none fixed left-1/2 top-12 z-30 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 space-y-2 game-fade" role="status">
          {view.messages.map((m) => (
            <div key={m} className="pointer-events-auto flex items-start justify-between gap-3 border border-brass/40 bg-[#161b20]/95 px-4 py-3 text-sm shadow-lg">
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

      {view.chapter?.checkpoint && view.introSeen && view.status === "active" ? (
        <CheckpointScreen
          chapter={view.chapter}
          pending={pending}
          onContinue={async () => {
            const next = view.chapter?.checkpoint?.next ?? null;
            const r = await dispatch({ type: "chapterContinue" });
            if (r && next) setOpening(next);
          }}
          onExit={async () => {
            // The checkpoint is already saved; this only marks the screen as seen before leaving.
            await dispatch({ type: "chapterContinue" });
            window.location.href = guest ? "/party/leave" : "/agency/cases";
          }}
        />
      ) : null}
      {opening && !view.chapter?.checkpoint ? <ChapterOpening chapter={opening} onBegin={() => setOpening(null)} /> : null}
      {resuming && view.chapter && !view.chapter.checkpoint && !opening ? (
        <ResumeScreen
          chapter={view.chapter}
          location={view.location.name}
          lastPlayed={lastPlayed}
          onResume={() => setResuming(false)}
          onNotebook={() => {
            setResuming(false);
            setLayer({ k: "panel", panel: "notebook" });
          }}
          exitHref={guest ? "/party/leave" : "/agency/cases"}
        />
      ) : null}

      {layer?.k === "inspect" && inspected ? (
        <EvidenceInspection
          key={`inspect-${inspected.id}`}
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
          boardName={words.board}
        />
      ) : null}
      {layer?.k === "inspect" && !layer.evidence ? (
        <ObservationCard
          words={words}
          title={layer.title}
          text={layer.text}
          onClose={close}
          photo={layer.photo}
          pending={pending}
          locked={locked}
          onPhoto={async () => {
            if (!layer.photo) return;
            const r = await dispatch({ type: "photograph", hotspotId: layer.photo.hotspotId });
            if (r) {
              if (view.theme === "medieval") quillScratch((prefs.masterVolume / 100) * (prefs.sfxVolume / 100));
              else cameraShutter((prefs.masterVolume / 100) * (prefs.sfxVolume / 100));
              setLayer((l) => (l?.k === "inspect" && l.photo ? { ...l, photo: { ...l.photo, taken: true } } : l));
            }
          }}
        />
      ) : null}
      {layer?.k === "evidence" && fromNotebook ? (
        <EvidenceInspection
          key={`evidence-${fromNotebook.id}`}
          evidence={fromNotebook}
          narration={narrationFor(fromNotebook.id)}
          onSaveNote={saveNote(fromNotebook.id)}
          onCollect={() => undefined}
          onPin={() => pin(fromNotebook.id)}
          pinned={pinned(fromNotebook.id)}
          onClose={() => setLayer(layer.back === "scene" ? (layer.prev ?? null) : { k: "panel", panel: layer.back })}
          closeLabel={
            layer.back === "scene"
              ? layer.prev?.k === "delivery"
                ? "Back to the delivery"
                : layer.prev?.k === "document"
                  ? "Back to the document"
                  : "Return to scene"
              : layer.back === "notebook"
                ? "Back to notebook"
                : layer.back === "conclusion"
                  ? "Back to the report"
                  : "Back to evidence"
          }
          boardName={words.board}
          pending={pending}
          locked={locked}
        />
      ) : null}

      {layer?.k === "conversation" ? (
        <InterviewScreen key={`interview-${layer.data.characterId}`} caseId={caseId} data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} volume={dialogueVolume} />
      ) : null}
      {layer?.k === "document" ? <DocumentPanel caseId={caseId} data={layer.data} view={view} dispatch={dispatch} onClose={close} pending={pending} volume={dialogueVolume} /> : null}
      {layer?.k === "call" ? (
        <CallPanel
          caseId={caseId}
          data={layer.data}
          voices={view.voices}
          volume={dialogueVolume}
          closeLabel={layer.data.overheard ? "Step back" : words.callClose}
          replayLabel={layer.data.overheard ? "Listen again" : view.theme === "medieval" ? "Hear it again" : "Replay call"}
          onClose={() => (layer.data.overheard ? setLayer(null) : setLayer({ k: "panel", panel: "phone" }))}
        />
      ) : null}
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
      {trip ? <TravelScene caseId={caseId} theme={view.theme} art={view.caseArt} area={trip.area} mode={trip.mode} to={trip.to} subtitle={trip.subtitle} reducedMotion={prefs.reducedMotion} onSkip={() => skipTrip.current?.()} /> : null}
      {stamps.length && !trip ? (
        <EvidenceStamp key={`stamp-${stamps[0].id}`} item={stamps[0]} words={words} volume={(prefs.masterVolume / 100) * (prefs.sfxVolume / 100)} reducedMotion={prefs.reducedMotion} onDone={nextStamp} />
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
          shared={Boolean(party)}
          guest={guest}
          onClose={close}
          onExamine={(id) => setLayer({ k: "evidence", id, back: "conclusion" })}
        />
      ) : null}
      {panel === "sequence" ? <SequencePanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "comparison" ? <ComparisonPanel view={view} dispatch={dispatch} onClose={close} pending={pending} /> : null}
      {panel === "rolling" ? <RollingBoardPanel seriesId={SERIES.find((x) => x.cases.some((c) => c.caseId === caseId))?.id ?? ""} guest={guest} onClose={close} /> : null}
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
          onReplay={guest ? undefined : replay}
          onClose={close}
          reviewed={reviewed}
          asGuest={guest}
        />
      ) : null}
      {report ? <ReportDialog caseId={caseId} asGuest={guest} open={report.open} characterId={report.characterId} onClose={() => setReport(null)} /> : null}
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
            {guest ? null : (
              <button type="button" className="text-brass hover:underline" onClick={replay}>
                Start a new investigation (replay)
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ObservationCard({
  words,
  title,
  text,
  onClose,
  photo,
  onPhoto,
  pending,
  locked,
}: {
  words: ClientView["words"];
  title: string;
  text: string;
  onClose: () => void;
  photo: { hotspotId: string; taken: boolean } | null;
  onPhoto: () => void;
  pending: boolean;
  locked: boolean;
}) {
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
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {photo && !locked ? (
            photo.taken ? (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[color:var(--color-ok)]">
                <CameraIcon /> {words.photoTaken}
              </span>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={onPhoto}
                className="inline-flex items-center gap-2 rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
              >
                <CameraIcon /> {words.photoAction}
              </button>
            )
          ) : null}
          <button type="button" autoFocus onClick={onClose} className="text-sm text-brass underline-offset-4 hover:underline">
            Return to scene
          </button>
        </div>
      </div>
    </div>
  );
}

/** One labeled 0 to 100 slider in the game menu. Sound effects covers room sound, travel, the phone and stamps. */
function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = `vol-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-sm">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--color-brass)]"
      />
      <span className="text-right font-mono text-xs text-smoke">{value}</span>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

/** A 1980s camera: the shutter's click and the film advance, synthesized, with a quick white flash on screen. */
function cameraShutter(volume: number) {
  if (typeof window === "undefined") return;
  const flash = document.createElement("div");
  flash.style.cssText = "position:fixed;inset:0;z-index:80;background:#fff;opacity:.85;pointer-events:none;transition:opacity .45s ease-out";
  document.body.append(flash);
  requestAnimationFrame(() => requestAnimationFrame(() => (flash.style.opacity = "0")));
  setTimeout(() => flash.remove(), 600);
  if (volume <= 0) return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const out = ctx.createGain();
  out.gain.value = Math.min(1, volume) * 0.6;
  out.connect(ctx.destination);
  const click = (t: number, len: number, freq: number, level: number) => {
    const n = Math.floor(ctx.sampleRate * len);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(f).connect(g).connect(out);
    src.start(t);
  };
  const t = ctx.currentTime + 0.01;
  click(t, 0.03, 3200, 1);
  click(t + 0.06, 0.04, 1800, 0.8);
  // Film advance: a short ratchet.
  for (let i = 0; i < 6; i++) click(t + 0.22 + i * 0.035, 0.02, 2400, 0.35);
  setTimeout(() => ctx.close().catch(() => undefined), 800);
}

/** A quill on parchment: a few quick scratches, synthesized, for a sketch made in a medieval case. */
function quillScratch(volume: number) {
  if (typeof window === "undefined" || volume <= 0) return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const out = ctx.createGain();
  out.gain.value = Math.min(1, volume) * 0.35;
  out.connect(ctx.destination);
  const t = ctx.currentTime + 0.02;
  for (let i = 0; i < 5; i++) {
    const len = 0.09 + (i % 2) * 0.05;
    const n = Math.floor(ctx.sampleRate * len);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < n; j++) d[j] = (Math.random() * 2 - 1) * Math.sin((Math.PI * j) / n) * 0.8;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 2600 + i * 300;
    src.connect(f).connect(out);
    src.start(t + i * 0.13);
  }
  setTimeout(() => ctx.close().catch(() => undefined), 1200);
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

/** A painted object in the corner of the scene that opens a panel (the map, the notebook, the evidence). */
/** The agency's own things (map, notebook, evidence bag, phone): the case's painting if it has one, otherwise the agency's usual one. */
function hudArt(caseId: string, name: string, theme: ClientView["theme"] = "noir", caseArt: Record<string, string> = {}) {
  // A medieval case never borrows the agency's modern things: until its own are painted, a drawn icon stands in.
  return caseArt[name] ?? paintedArt(`${caseId.toLowerCase()}_${name}`) ?? (theme === "medieval" ? null : paintedArt(`c001_${name}`));
}

function HudObject({
  label,
  image,
  fallback,
  count,
  alert,
  glow,
  callout,
  onClick,
}: {
  label: string;
  image: string | null;
  fallback: "map" | "notebook" | "evidence" | "phone";
  count?: number;
  alert?: boolean;
  /** Something new inside: a warm pulsing light behind it. */
  glow?: boolean;
  /** A note pointing at it, for players who have never opened it. */
  callout?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count !== undefined ? `${label}, ${count} items` : label}
      className="group pointer-events-auto relative flex w-14 flex-col items-center gap-1 sm:w-[4.5rem]"
    >
      {callout ? (
        <span className="pointer-events-none absolute bottom-full left-0 mb-2 w-44 rounded-[3px] border border-brass/60 bg-[#161b20]/95 px-2.5 py-2 text-left text-xs normal-case leading-snug tracking-normal text-paper shadow-lg game-fade">
          {callout}
          <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-brass/60 bg-[#161b20]" aria-hidden />
        </span>
      ) : null}
      <span className={`relative block h-12 w-14 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105 sm:h-16 sm:w-[4.5rem] ${alert ? "animate-bounce" : ""}`}>
        {glow ? <span className="absolute -inset-2 animate-pulse rounded-full bg-brass/50 blur-md" aria-hidden /> : null}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            draggable={false}
            className={`relative h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.75)] ${fallback === "map" ? "rotate-[-6deg] rounded-[3px] border-2 border-[#e8dcc0] object-cover" : "object-contain"}`}
          />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center rounded-[4px] border border-white/20 bg-[#161b20]/90 text-paper">
            <HudIcon kind={fallback} />
          </span>
        )}
        {count !== undefined ? (
          <span className="absolute -right-1 -top-1 z-10 min-w-5 rounded-full border border-[#0d1013] bg-brass px-1 text-center font-mono text-[0.65rem] font-bold leading-5 text-ink">{count}</span>
        ) : null}
      </span>
      <span className="rounded-[2px] bg-[#0d1013]/80 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/90 group-hover:text-brass sm:text-[0.65rem]">{label}</span>
    </button>
  );
}

function HudIcon({ kind }: { kind: "map" | "notebook" | "evidence" | "phone" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      {kind === "phone" ? <path d="M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2" /> : kind === "map" ? <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" /> : kind === "notebook" ? <path d="M6 3h11a1 1 0 011 1v16a1 1 0 01-1 1H6zM6 3v18M9 8h6M9 12h6" /> : <path d="M5 8h14v12H5zM9 8V5h6v3M9 13h6" />}
    </svg>
  );
}

/** What the player had open when they sent feedback, for the report's context. */
function describeLayer(layer: Layer, panel: string | null): { open: string; characterId: string | null } {
  if (layer?.k === "conversation") {
    return { open: `Interview: ${layer.data.name}`, characterId: layer.data.characterId };
  }
  if (layer?.k === "evidence") return { open: `Evidence ${layer.id}`, characterId: null };
  if (layer?.k === "inspect") return { open: `Looking at: ${layer.title}`, characterId: null };
  if (layer?.k === "document") return { open: "Document", characterId: null };
  if (layer?.k === "call") return { open: "Phone call", characterId: null };
  if (layer?.k === "closure") return { open: "Case resolution", characterId: null };
  if (panel) return { open: `Panel: ${panel}`, characterId: null };
  return { open: "Scene", characterId: null };
}
