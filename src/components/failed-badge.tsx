import { acceptAssignment } from "@/app/actions/game";

/** "Failed" in the corner of a case card: the investigator's last attempt ended in a losing ending. */
export function FailedBadge() {
  return (
    <span className="rounded-[2px] border border-[#e08a7f]/70 bg-[#8a3a33]/25 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#f0a79d]">
      Failed
    </span>
  );
}

/**
 * Under the badge: why the last attempt failed, and Try again, which starts a
 * fresh investigation of the case. Always shown, so it can be reached easily.
 */
export function FailedRetry({ caseId, title, reason }: { caseId: string; title: string; reason: string }) {
  return (
    <div className="relative z-10 mt-3 w-full rounded-[3px] border border-[#e08a7f]/40 bg-[#8a3a33]/10 p-3">
      <p className="font-serif text-base text-paper">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-smoke">{reason}</p>
      <p className="mt-2 text-xs leading-relaxed text-paper/80">The killer could do something different each time, so be prepared.</p>
      <form action={acceptAssignment} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="caseId" value={caseId} />
        <button type="submit" className="rounded-[2px] bg-brass px-3 py-1.5 text-xs font-semibold text-ink hover:bg-[#d4b585]">
          Try again
        </button>
        <span className="text-[0.7rem] text-smoke">A fresh start</span>
      </form>
    </div>
  );
}
