"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "starting" | "recording" | "transcribing" | "asking";

/**
 * Ask in your own words: type and press Enter, or hold the microphone button
 * (or the Space bar) while speaking and let go to ask. Speech is turned into
 * text on the server; the question then goes through the same path as a
 * typed one.
 */
export function QuestionBar({
  name,
  disabled,
  onAsk,
  onListen,
  context,
}: {
  name: string;
  /** The case and person being questioned, so the transcription is charged to the right investigation. */
  context?: { caseId: string; characterId: string };
  disabled: boolean;
  onAsk: (text: string) => Promise<unknown>;
  /** Called when the microphone opens, so whoever is speaking stops. */
  onListen: () => void;
}) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [note, setNote] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const rec = useRef<{ recorder: MediaRecorder | null; stream: MediaStream | null; chunks: Blob[]; startedAt: number; stopWanted: boolean; timer: number | null }>({
    recorder: null,
    stream: null,
    chunks: [],
    startedAt: 0,
    stopWanted: false,
    timer: null,
  });
  const busy = disabled || phase === "transcribing" || phase === "asking";

  const ask = async (q: string) => {
    const t = q.replace(/\s+/g, " ").trim();
    if (!t || disabled) return;
    setPhase("asking");
    setNote(null);
    try {
      await onAsk(t);
      setText("");
    } finally {
      setPhase("idle");
    }
  };

  const release = () => {
    const r = rec.current;
    if (r.timer) window.clearTimeout(r.timer);
    r.stream?.getTracks().forEach((t) => t.stop());
    r.stream = null;
    r.recorder = null;
    r.timer = null;
  };

  const finish = async (blob: Blob, ms: number) => {
    if (ms < 350 || blob.size < 800) {
      setPhase("idle");
      setNote("Hold the button while you speak, then let go.");
      return;
    }
    setPhase("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, blob.type.includes("mp4") ? "question.mp4" : "question.webm");
      form.append("seconds", String(Math.round(ms / 100) / 10));
      if (context) {
        form.append("caseId", context.caseId);
        form.append("characterId", context.characterId);
      }
      const res = await fetch("/api/transcribe", { method: "POST", body: form, credentials: "same-origin" });
      const body = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? "The microphone is not available right now. Type your question instead.");
      const heard = (body.text ?? "").trim();
      if (!heard) {
        setPhase("idle");
        setNote("Didn't catch that. Try again, or type the question.");
        return;
      }
      setText(heard);
      await ask(heard);
    } catch (e) {
      setPhase("idle");
      setNote(e instanceof Error ? e.message : "The microphone is not available right now. Type your question instead.");
    }
  };

  const stop = () => {
    const r = rec.current;
    if (r.recorder && r.recorder.state === "recording") r.recorder.stop();
    else r.stopWanted = true;
  };

  const start = async () => {
    if (busy || phase === "recording" || phase === "starting") return;
    onListen();
    setNote(null);
    const r = rec.current;
    r.stopWanted = false;
    setPhase("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("This browser cannot record. Type your question instead.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      r.stream = stream;
      r.recorder = recorder;
      r.chunks = [];
      recorder.ondataavailable = (e) => e.data.size && r.chunks.push(e.data);
      recorder.onstop = () => {
        const ms = Date.now() - r.startedAt;
        const blob = new Blob(r.chunks, { type: recorder.mimeType || "audio/webm" });
        release();
        void finish(blob, ms);
      };
      recorder.start();
      r.startedAt = Date.now();
      setPhase("recording");
      // Questions are short; stop on its own after thirty seconds.
      r.timer = window.setTimeout(() => stop(), 30000);
      if (r.stopWanted) stop();
    } catch (e) {
      release();
      setPhase("idle");
      const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
      setNote(denied ? "Microphone access was blocked. Allow it in the browser, or type your question." : e instanceof Error ? e.message : "The microphone is not available.");
    }
  };

  // Hold Space to talk, when not typing in a field.
  useEffect(() => {
    const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || typing(e.target)) return;
      e.preventDefault();
      void start();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space" || typing(e.target)) return;
      e.preventDefault();
      stop();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  useEffect(() => () => release(), []);

  const status =
    phase === "recording"
      ? "Listening. Let go to ask."
      : phase === "starting"
        ? "Opening the microphone"
        : phase === "transcribing"
          ? "Writing down your question"
          : phase === "asking"
            ? `${name} is thinking`
            : note;

  return (
    <div>
      <form
        className="flex items-stretch gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(text);
        }}
      >
        <label htmlFor="interview-question" className="sr-only">
          Your question for {name}
        </label>
        <input
          ref={input}
          id="interview-question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          autoComplete="off"
          disabled={disabled}
          placeholder={`Ask ${name} a question in your own words`}
          className="min-w-0 flex-1 rounded-[2px] border border-white/15 bg-black/40 px-3 py-2.5 font-serif text-[1.05rem] text-paper outline-none placeholder:text-paper/35 focus:border-brass disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-[2px] border border-white/20 px-4 text-sm font-semibold hover:border-brass hover:text-brass disabled:opacity-40"
        >
          Ask
        </button>
        <button
          type="button"
          aria-label="Hold to speak your question"
          aria-pressed={phase === "recording"}
          data-ptt
          disabled={busy}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            void start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onContextMenu={(e) => e.preventDefault()}
          className={`flex select-none items-center gap-2 rounded-[2px] px-3 text-sm font-semibold transition-colors disabled:opacity-40 ${
            phase === "recording" ? "bg-[#a5281f] text-paper" : "bg-brass text-ink hover:bg-[#d4b585]"
          }`}
        >
          <svg viewBox="0 0 24 24" className={`h-4 w-4 ${phase === "recording" ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
          <span className="hidden sm:inline">{phase === "recording" ? "Release to ask" : "Hold to speak"}</span>
        </button>
      </form>
      <p role="status" aria-live="polite" className="mt-2 min-h-4 font-mono text-xs text-smoke">
        {status ?? "Type and press Enter, or hold the microphone (or the Space bar) while you speak."}
      </p>
    </div>
  );
}
