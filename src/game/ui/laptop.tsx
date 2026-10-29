"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ActionResponse, ClientView, GameAction } from "../engine/types";
import { StatementsBody } from "./panels";

/*
 * The agency laptop, for modern cases: a laptop on the desk with a desktop
 * and a dock. Recordings plays the police interview recordings as audio files,
 * Case Files opens the documents, Mail holds lab reports and anything sent to
 * the agency, and Photos holds the photographs taken at scenes. One window at
 * a time, like a small screen.
 */

type Dispatch = (a: GameAction) => Promise<ActionResponse | null>;
type App = "recordings" | "files" | "mail" | "photos";

const APPS: { id: App; label: string; color: string; icon: string }[] = [
  { id: "recordings", label: "Recordings", color: "bg-[#c2453a]", icon: "M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3" },
  { id: "files", label: "Case Files", color: "bg-[#3d7bd8]", icon: "M3 7h6l2 2h10v10H3z" },
  { id: "mail", label: "Mail", color: "bg-[#2f6fd1]", icon: "M3 6h18v12H3zM3 6l9 7 9-7" },
  { id: "photos", label: "Photos", color: "bg-[#e9e4dc]", icon: "" },
];

export function LaptopPanel({
  caseId,
  view,
  dispatch,
  pending,
  volume,
  onClose,
  onOpenEvidence,
  onLeaveFor,
}: {
  caseId: string;
  view: ClientView;
  dispatch: Dispatch;
  pending: boolean;
  volume: number;
  onClose: () => void;
  onOpenEvidence: (id: string) => void;
  /** Called just before opening a document or a delivery, so closing it comes back here. */
  onLeaveFor: () => void;
}) {
  const [app, setApp] = useState<App | null>(view.statements.length ? "recordings" : null);
  const photos = view.evidence.filter((e) => e.photo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (app) setApp(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app, onClose]);

  const open = (a: GameAction) => {
    onLeaveFor();
    void dispatch(a);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-[2px] game-fade sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="The agency laptop">
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-5xl flex-col sm:h-auto">
        {/* The screen, in its bezel */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0d10] sm:aspect-[16/10] sm:flex-none sm:rounded-t-2xl sm:border-[12px] sm:border-b-[18px] sm:border-[#17191c] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
          <MenuBar title={app ? APPS.find((a) => a.id === app)!.label : "Desktop"} clock={view.clock} onClose={onClose} />
          <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_70%_20%,#2b3640_0%,#151a20_55%,#0b0d10_100%)]">
            {/* Wallpaper: the agency's name, faint */}
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-4xl tracking-[0.18em] text-white/[0.05] sm:text-6xl" aria-hidden>
              BLACKWOOD
            </p>
            {/* Desktop icons, for the window-less view */}
            {!app ? (
              <div className="absolute left-4 top-4 grid grid-cols-2 gap-4 sm:grid-cols-1">
                {APPS.map((a) => (
                  <button key={a.id} type="button" onClick={() => setApp(a.id)} className="flex w-20 flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-white/5">
                    <AppGlyph app={a} />
                    <span className="text-[0.7rem] text-paper/90">{a.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {app ? (
              <Window title={APPS.find((a) => a.id === app)!.label} onClose={() => setApp(null)}>
                {app === "recordings" ? (
                  <div className="text-paper">
                    <StatementsBody caseId={caseId} view={view} volume={volume} digital />
                  </div>
                ) : null}
                {app === "files" ? (
                  <FileList
                    empty="No files."
                    items={view.documents.map((d) => ({ id: d.id, title: d.title, sub: d.read ? "Opened" : "New", unread: !d.read }))}
                    onOpen={(id) => open({ type: "readDocument", documentId: id })}
                    pending={pending}
                    kind="doc"
                  />
                ) : null}
                {app === "mail" ? (
                  <FileList
                    empty="No mail. Lab reports and anything sent to the agency arrive here."
                    items={[...view.deliveries].reverse().map((d) => ({ id: d.id, title: d.title, sub: "Attachment", unread: false }))}
                    onOpen={(id) => open({ type: "openDelivery", deliveryId: id })}
                    pending={pending}
                    kind="mail"
                  />
                ) : null}
                {app === "photos" ? (
                  photos.length ? (
                    <div className="grid grid-cols-3 gap-1 p-1 sm:grid-cols-5">
                      {photos.map((ph) => (
                        <button key={ph.id} type="button" onClick={() => onOpenEvidence(ph.id)} className="relative aspect-square overflow-hidden bg-white/5" title={ph.title} aria-label={ph.title}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ph.image} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-8 text-center text-sm text-smoke">No photos yet. Photograph anything you look at in a scene and it is copied here.</p>
                  )
                ) : null}
              </Window>
            ) : null}
            {/* The dock */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                {APPS.map((a) => (
                  <button key={a.id} type="button" onClick={() => setApp(a.id)} title={a.label} aria-label={a.label} className="relative transition-transform hover:-translate-y-1">
                    <AppGlyph app={a} small />
                    {app === a.id ? <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-paper/80" aria-hidden /> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* The keyboard deck, on larger screens */}
        <div className="hidden h-5 rounded-b-[1.4rem] bg-gradient-to-b from-[#3a3d42] to-[#232528] shadow-[0_18px_30px_-10px_rgba(0,0,0,0.8)] sm:block" aria-hidden>
          <div className="mx-auto h-1.5 w-28 rounded-b-lg bg-[#1a1c1f]" />
        </div>
        <button type="button" onClick={onClose} className="mx-auto mt-3 hidden text-sm text-paper/70 hover:text-paper sm:block">
          Close the laptop
        </button>
      </div>
    </div>
  );
}

function MenuBar({ title, clock, onClose }: { title: string; clock: string | null; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between bg-black/60 px-4 py-1.5 font-mono text-[0.7rem] text-paper/80">
      <span className="flex items-center gap-4">
        <span className="font-bold tracking-[0.12em] text-brass">BLACKWOOD</span>
        <span>{title}</span>
      </span>
      <span className="flex items-center gap-4">
        {clock ? <span>{clock}</span> : null}
        <button type="button" onClick={onClose} className="text-paper/70 hover:text-paper sm:hidden">
          Close
        </button>
      </span>
    </div>
  );
}

function Window({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-2 bottom-20 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#14181d] shadow-2xl sm:inset-6 sm:bottom-24">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#1b2026] px-3 py-2">
        <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="h-3 w-3 rounded-full bg-[#e0483e] hover:brightness-110" />
        <span className="h-3 w-3 rounded-full bg-[#e3a73a]" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#3db35a]" aria-hidden />
        <span className="ml-3 text-xs text-paper/70">{title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function AppGlyph({ app, small = false }: { app: (typeof APPS)[number]; small?: boolean }) {
  const size = small ? "h-11 w-11" : "h-12 w-12";
  return (
    <span className={`flex ${size} items-center justify-center rounded-xl shadow ${app.color}`}>
      {app.id === "photos" ? (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          {["#f2b233", "#e0483e", "#9b59b6", "#2f6fd1", "#2f9e57"].map((c, i) => (
            <ellipse key={c} cx="12" cy="7" rx="3" ry="5" fill={c} opacity="0.85" transform={`rotate(${i * 72} 12 12)`} />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={app.icon} />
        </svg>
      )}
    </span>
  );
}

function FileList({
  items,
  onOpen,
  pending,
  empty,
  kind,
}: {
  items: { id: string; title: string; sub: string; unread: boolean }[];
  onOpen: (id: string) => void;
  pending: boolean;
  empty: string;
  kind: "doc" | "mail";
}) {
  if (!items.length) return <p className="p-8 text-center text-sm text-smoke">{empty}</p>;
  return (
    <ul className="divide-y divide-white/5">
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" disabled={pending} onClick={() => onOpen(it.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 disabled:opacity-60">
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-paper/60" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d={kind === "mail" ? "M3 6h18v12H3zM3 6l9 7 9-7" : "M6 3h9l3 3v15H6zM15 3v3h3M9 11h6M9 15h6"} />
            </svg>
            <span className="min-w-0 flex-1">
              <span className={`block truncate text-sm ${it.unread ? "font-semibold text-paper" : "text-paper/90"}`}>{it.title}</span>
              <span className="block text-xs text-smoke">{it.sub}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
