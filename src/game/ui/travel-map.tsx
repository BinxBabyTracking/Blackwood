"use client";

import { useState } from "react";
import type { ClientView } from "../engine/types";
import { Overlay } from "./overlay";

/**
 * Street map of the case's locations. Pins sit on a period road map; the list
 * beside it carries the same choices for keyboard and small screens.
 * Travelling swaps the scene in place without reloading the investigation.
 */
export function TravelMap({
  view,
  onTravel,
  onClose,
  pending,
}: {
  view: ClientView;
  onTravel: (locationId: string) => void;
  onClose: () => void;
  pending: boolean;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const places = view.map;

  return (
    <Overlay title="Street map of Los Angeles" onClose={onClose} wide closeLabel="Close map">
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#d9cfb2]" aria-hidden>
          <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <rect width="100" height="75" fill="#ddd2b3" />
            <path d="M0 58 C18 52 30 60 46 54 S78 40 100 46" stroke="#b9ad8a" strokeWidth="2.2" fill="none" />
            <path d="M58 0 C56 18 62 30 60 50 S64 70 66 75" stroke="#7fa3b8" strokeWidth="1.6" fill="none" />
            {Array.from({ length: 14 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 5.5} x2="100" y2={i * 5.5 - 3} stroke="#c3b790" strokeWidth="0.35" />
            ))}
            {Array.from({ length: 18 }, (_, i) => (
              <line key={`v${i}`} x1={i * 6} y1="0" x2={i * 6 + 4} y2="75" stroke="#c3b790" strokeWidth="0.35" />
            ))}
            <path d="M40 14 Q55 4 72 12 L70 22 Q56 16 44 22 Z" fill="#a9b98f" opacity="0.7" />
            <text x="56" y="11" fontSize="2.4" fill="#5c6b48" fontFamily="Georgia, serif" textAnchor="middle">Griffith Park</text>
            <text x="20" y="62" fontSize="2.2" fill="#6d6248" fontFamily="Courier New, monospace">WILSHIRE BLVD</text>
            <text x="66" y="40" fontSize="2.2" fill="#46677a" fontFamily="Courier New, monospace">LOS ANGELES RIVER</text>
          </svg>
          {places
            .filter((p) => p.pin)
            .map((p) => (
              <span
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${p.pin!.x}%`, top: `${p.pin!.y}%` }}
              >
                <span
                  className={`block h-3.5 w-3.5 rounded-full border-2 border-[#2a241c] shadow ${
                    p.current ? "bg-brass" : p.available ? (focus === p.id ? "bg-[#b3231b] scale-125" : "bg-[#b3231b]") : "bg-[#8a8070]"
                  } transition-transform`}
                />
                <span
                  className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap bg-[#f3ead3]/90 px-1 font-mono text-[0.6rem] text-[#2a241c] ${
                    focus === p.id || p.current ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {p.name}
                </span>
              </span>
            ))}
        </div>

        <ul className="divide-y divide-white/10">
          {places.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                disabled={!m.available || m.current || pending}
                onClick={() => onTravel(m.id)}
                onMouseEnter={() => setFocus(m.id)}
                onFocus={() => setFocus(m.id)}
                onMouseLeave={() => setFocus(null)}
                className="flex w-full flex-col items-start px-5 py-3 text-left transition-colors enabled:hover:bg-white/5 disabled:cursor-not-allowed"
              >
                <span className={`font-serif text-lg ${m.available ? "text-paper" : "text-smoke/50"}`}>{m.name}</span>
                <span className="text-sm text-smoke">{m.available ? m.subtitle : "Not available yet. Read the case file first."}</span>
                <span className="mt-1 font-mono text-xs text-brass">
                  {m.current ? "You are here" : !m.available ? "Unavailable" : m.visited ? "Visited" : "Not yet visited"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Overlay>
  );
}
