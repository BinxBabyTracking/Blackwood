"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetCaseForOwner } from "@/app/actions/test-reset";

/** Owner-only: reset a case to retest it from Accept Assignment. Asks once before wiping it. */
export function ResetCaseButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const reset = () =>
    start(async () => {
      setError(null);
      const res = await resetCaseForOwner(caseId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // This device's first-time hints and desk layout for the case start over too.
      try {
        for (const k of Object.keys(localStorage)) if (k.startsWith("bw-") && k.endsWith(`-${caseId}`)) localStorage.removeItem(k);
      } catch {
        /* storage blocked */
      }
      setConfirm(false);
      router.refresh();
    });
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {confirm ? (
        <>
          <button type="button" disabled={pending} onClick={reset} className="rounded-[2px] bg-[#8a3a33] px-2.5 py-1 text-xs font-semibold text-paper hover:bg-[#a0463e] disabled:opacity-60">
            {pending ? "Resetting…" : "Yes, reset it"}
          </button>
          <button type="button" disabled={pending} onClick={() => setConfirm(false)} className="text-xs text-smoke hover:text-paper">
            Cancel
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="text-xs text-[#e08a7f] underline-offset-4 hover:underline" title="Owner testing: wipe this case so it can be accepted again">
          Reset case
        </button>
      )}
      {error ? <span className="text-xs text-[#e08a7f]">{error}</span> : null}
    </span>
  );
}
