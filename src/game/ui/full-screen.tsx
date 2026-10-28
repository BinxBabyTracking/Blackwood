"use client";

import { useEffect, useState } from "react";

type Mode = "standalone" | "fullscreen" | "ios" | "none";

/**
 * How this device can play without the browser's address bar:
 * - "standalone": already opened from the home screen, nothing to do;
 * - "fullscreen": the browser can go full screen (Android, tablets, computers);
 * - "ios": an iPhone, where only Add to Home Screen hides it;
 * - "none": neither.
 */
function detect(): Mode {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone || window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches) return "standalone";
  const ios = /iPhone|iPod/.test(navigator.userAgent);
  if (!ios && document.fullscreenEnabled) return "fullscreen";
  if (ios || /iPad/.test(navigator.userAgent)) return "ios";
  return "none";
}

export function useFullScreen() {
  const [mode, setMode] = useState<Mode>("none");
  const [active, setActive] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => {
      setMode(detect());
      setActive(Boolean(document.fullscreenElement));
    });
    const on = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", on);
    return () => {
      cancelAnimationFrame(f);
      document.removeEventListener("fullscreenchange", on);
    };
  }, []);
  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      /* the browser refused (no user gesture, or not allowed here) */
    }
  };
  return { mode, active, toggle };
}

/** How to add Blackwood to an iPhone's home screen, so it opens without the address bar. */
export function HomeScreenSteps() {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
      <li>
        Tap the <span className="font-semibold">Share</span> button in Safari (the square with an arrow pointing up).
      </li>
      <li>
        Choose <span className="font-semibold">Add to Home Screen</span>, then <span className="font-semibold">Add</span>.
      </li>
      <li>Open Blackwood from the new icon on your home screen. It plays full screen, with no address bar.</li>
    </ol>
  );
}

/**
 * A one-time tip on an iPhone browsing in Safari: the game plays best from the
 * home screen. Shown once ever on this device.
 */
export function HomeScreenTip({ paused = false }: { paused?: boolean }) {
  const { mode } = useFullScreen();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (mode !== "ios" || paused) return;
    let seen = true;
    try {
      seen = localStorage.getItem("bw-homescreen-tip") === "1";
    } catch {
      /* storage blocked: don't nag */
    }
    if (seen) return;
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, [mode, paused]);
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("bw-homescreen-tip", "1");
    } catch {
      /* fine */
    }
  };
  if (!show || paused) return null;
  return (
    <div className="fixed inset-x-3 top-14 z-[45] mx-auto max-w-sm rounded-[3px] border border-brass/50 bg-[#0d1013]/95 p-4 text-paper shadow-[0_10px_30px_rgba(0,0,0,0.6)] game-fade" role="status">
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg leading-snug">Play full screen</p>
        <button type="button" onClick={dismiss} aria-label="Close" className="-mr-1 -mt-1 px-1 text-xl leading-none text-smoke hover:text-paper">
          ×
        </button>
      </div>
      <p className="mt-1 text-sm text-smoke">Add Blackwood to your home screen and it opens like an app, without the address bar.</p>
      {open ? (
        <div className="mt-3">
          <HomeScreenSteps />
          <button type="button" onClick={dismiss} className="mt-3 rounded-[2px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink">
            Got it
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 rounded-[2px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink">
          Show me how
        </button>
      )}
    </div>
  );
}

/**
 * Full screen on or off, for the Agency top bar. Shown only where the browser
 * can go full screen (computers, Android, tablets). Full screen carries on into
 * a case, since moving between pages doesn't reload the site.
 */
export function FullScreenButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { mode, active, toggle } = useFullScreen();
  if (mode !== "fullscreen") return null;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => void toggle()}
      aria-label={compact ? (active ? "Exit full screen" : "Full screen") : undefined}
      className={
        compact
          ? `rounded-[2px] p-2 text-smoke hover:text-paper ${className || "inline-flex"}`
          : `items-center gap-2 rounded-[2px] border border-rule px-3 py-1.5 text-xs text-smoke hover:border-brass hover:text-brass ${className || "inline-flex"}`
      }
    >
      <svg viewBox="0 0 24 24" className={compact ? "h-5 w-5" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {active ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
      </svg>
      {compact ? null : active ? "Exit full screen" : "Full screen"}
    </button>
  );
}
