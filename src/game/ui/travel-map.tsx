"use client";

import { useState } from "react";
import { paintedArt } from "@/lib/art";
import type { ClientView } from "../engine/types";
import { Overlay } from "./overlay";

/**
 * Street map of the case's locations. Pins sit on a painted period street map
 * (or a drawn stand-in until it exists), each with its name on a paper tag;
 * pins can be tapped to travel, and the list beside the map carries the same
 * choices for keyboard and screen readers.
 * Traveling swaps the scene in place without reloading the investigation.
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
  const painting = paintedArt(`${view.caseId.toLowerCase()}_map`);

  return (
    <Overlay title={view.mapTitle} onClose={onClose} wide closeLabel="Close map">
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#d9cfb2]">
          {painting ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={painting} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
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
          )}
          {places
            .filter((p) => p.pin)
            .map((p) => {
              const go = p.available && !p.current && !pending;
              // On the painted map every pin carries its name; on a phone only the current or chosen one, so tags don't pile up.
              const tag = p.current || focus === p.id ? "opacity-100" : painting ? "opacity-0 sm:opacity-100" : "opacity-0";
              return (
                <button
                  key={p.id}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  disabled={!go}
                  onClick={() => onTravel(p.id)}
                  onMouseEnter={() => setFocus(p.id)}
                  onMouseLeave={() => setFocus(null)}
                  className={`absolute -translate-x-1/2 -translate-y-full p-1.5 ${focus === p.id || p.current ? "z-10" : ""} ${go ? "cursor-pointer" : "cursor-default"}`}
                  style={{ left: `${p.pin!.x}%`, top: `${p.pin!.y}%` }}
                >
                  {p.tag ? (
                    <span
                      // Beside the pin, on the side with more room, so it never covers a neighbor's name below.
                      className={`absolute top-1 whitespace-nowrap border border-[#7a1410] bg-[#b3231b] px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#f3ead3] shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${
                        p.pin!.x < 25 ? "left-full ml-0.5" : "right-full mr-0.5"
                      }`}
                    >
                      {p.tag}
                    </span>
                  ) : null}
                  <span
                    className={`block h-3.5 w-3.5 rounded-full border-2 border-[#2a241c] shadow transition-transform ${
                      p.current ? "bg-brass" : p.available ? (focus === p.id ? "scale-125 bg-[#b3231b]" : "bg-[#b3231b]") : "bg-[#8a8070]"
                    }`}
                  />
                  <span
                    className={`absolute top-6 whitespace-nowrap px-1 font-mono text-[0.6rem] shadow-sm transition-opacity ${
                      // Tags near an edge hang inwards so they are never cut off.
                      p.pin!.x > 75 ? "right-0" : p.pin!.x < 25 ? "left-0" : "left-1/2 -translate-x-1/2"
                    } ${
                      p.current || focus === p.id ? "bg-[#f3ead3] text-[#2a241c]" : "bg-[#f3ead3]/85 text-[#2a241c]/80"
                    } ${tag}`}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
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
                <span className={`flex flex-wrap items-center gap-2 font-serif text-lg ${m.available ? "text-paper" : "text-smoke/50"}`}>
                  {m.name}
                  {m.tag ? <span className="bg-[#b3231b] px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#f3ead3]">{m.tag}</span> : null}
                </span>
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
