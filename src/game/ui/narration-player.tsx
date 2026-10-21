"use client";

import { useEffect, useRef, useState } from "react";
import { claim, loadAudio, release } from "./audio-bus";

/*
 * Player-initiated narration. Audio is fetched only when the player presses
 * Play, cached per page session, and only one narration plays at a time.
 * If anything fails, the text is still on screen and nothing else is affected.
 */

function rewind(el: HTMLAudioElement) {
  el.currentTime = 0;
}

type Status = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export function NarrationPlayer({ src, volume, onPlayingChange }: { src: string; volume: number; onPlayingChange?: (playing: boolean) => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      audio.current?.pause();
      if (audio.current) release(audio.current);
    },
    [],
  );

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    onPlayingChange?.(status === "playing");
  }, [status, onPlayingChange]);

  async function load() {
    setStatus("loading");
    const url = await loadAudio(src);
    const a = new Audio(url);
    a.volume = volume;
    a.onplay = () => setStatus("playing");
    a.onpause = () => setStatus((s) => (s === "ended" ? s : "paused"));
    a.onended = () => setStatus("ended");
    a.onerror = () => {
      setStatus("error");
      setError("This recording could not be played.");
    };
    audio.current = a;
    return a;
  }

  async function play(fromStart = false) {
    setError(null);
    try {
      const a = audio.current ?? (await load());
      claim(a);
      if (fromStart) rewind(a);
      await a.play();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Narration is unavailable right now.");
    }
  }

  return (
    <div className="mt-4 border border-white/10 bg-black/20 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-smoke">Read aloud</span>
        {status === "playing" ? (
          <button type="button" onClick={() => audio.current?.pause()} className="rounded-[2px] border border-white/20 px-3 py-1 text-xs hover:border-brass hover:text-brass">
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={() => play(status === "ended")}
            disabled={status === "loading"}
            className="rounded-[2px] border border-white/20 px-3 py-1 text-xs hover:border-brass hover:text-brass disabled:opacity-50"
          >
            {status === "loading" ? "Preparing" : status === "paused" ? "Resume" : "Play"}
          </button>
        )}
        <button
          type="button"
          onClick={() => play(true)}
          disabled={status === "idle" || status === "loading" || status === "error"}
          className="rounded-[2px] px-2 py-1 text-xs text-smoke hover:text-paper disabled:opacity-40"
        >
          Replay
        </button>
        <span aria-live="polite" className="text-xs text-smoke">
          {status === "playing" ? "Playing" : error ?? ""}
        </span>
      </div>
    </div>
  );
}
