"use client";

import { useEffect, useRef, useState } from "react";
import type { AgencyNotice } from "@/lib/types";

const CATEGORY: Record<AgencyNotice["category"], string> = {
  assignment: "Assignments",
  archive: "Case archive",
  announcement: "Announcement",
};

/** Header popover for agency-wide notices. These are platform content, not personal alerts. */
export function NoticesMenu({ notices, unavailable }: { notices: AgencyNotice[]; unavailable?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="notices-panel"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-[2px] p-2 text-smoke hover:text-paper"
      >
        <span className="sr-only">Agency notices</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 20.5a2.2 2.2 0 004 0" />
        </svg>
      </button>
      {open ? (
        <div
          id="notices-panel"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-file)] border border-rule bg-ink-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
        >
          <p className="border-b border-rule px-4 py-3 text-sm font-semibold">Agency notices</p>
          {unavailable ? (
            <p className="px-4 py-5 text-sm text-smoke">Notices are unavailable until the backend is configured.</p>
          ) : notices.length === 0 ? (
            <p className="px-4 py-5 text-sm text-smoke">No notices have been posted.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-rule overflow-y-auto">
              {notices.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <p className="text-xs text-brass">{CATEGORY[n.category]}</p>
                  <p className="mt-0.5 text-sm text-paper">{n.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-smoke">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
