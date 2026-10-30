"use client";

import { useState } from "react";
import { acceptAssignment } from "@/app/actions/game";

/**
 * "Failed" in the corner of a case card when the investigator's last attempt
 * ended in a losing ending. Hover (or tap) shows why, with Try again, which
 * starts a fresh investigation of the case.
 */
export function FailedBadge({ caseId, title, reason }: { caseId: string; title: string; reason: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group/fail relative z-10" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="rounded-[2px] border border-[#e08a7f]/70 bg-[#8a3a33]/25 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#f0a79d]"
      >
        Failed
      </button>
      {open ? (
        <div className="absolute bottom-full right-0 mb-2 w-64 rounded-[3px] border border-[#e08a7f]/50 bg-[#141819] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.6)]" role="dialog" aria-label={`Failed: ${title}`}>
          <p className="font-serif text-base text-paper">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-smoke">{reason}</p>
          <form action={acceptAssignment} className="mt-3">
            <input type="hidden" name="caseId" value={caseId} />
            <button type="submit" className="rounded-[2px] bg-brass px-3 py-1.5 text-xs font-semibold text-ink hover:bg-[#d4b585]">
              Try again
            </button>
            <span className="ml-2 text-[0.7rem] text-smoke">A fresh start</span>
          </form>
        </div>
      ) : null}
    </div>
  );
}
