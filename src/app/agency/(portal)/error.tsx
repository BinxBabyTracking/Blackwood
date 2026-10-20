"use client";

import { buttonClass } from "@/components/ui";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-[var(--radius-file)] border border-fault/60 bg-fault/10 p-8">
      <p className="font-serif text-2xl">This file could not be retrieved.</p>
      <p className="mt-2 max-w-[60ch] text-smoke">
        {error.message || "The agency system returned an error."} Try again, and if it keeps happening check the Supabase
        project and migrations.
      </p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-smoke">Reference {error.digest}</p> : null}
      <button type="button" onClick={reset} className={buttonClass("secondary", "mt-6")}>
        Try again
      </button>
    </div>
  );
}
