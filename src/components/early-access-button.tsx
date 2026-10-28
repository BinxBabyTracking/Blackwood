"use client";

import { useState, useTransition } from "react";
import { requestEarlyAccess } from "@/app/actions/early-access";
import { buttonClass } from "./ui";

type Status = "pending" | "approved" | "denied" | null;

/** Request early access to a Coming Soon case, and where the request stands. */
export function EarlyAccessButton({ caseId, initial }: { caseId: string; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (status === "pending")
    return <p className="mt-4 max-w-[44ch] text-sm text-paper">Early access requested. The agency will review it, and the case opens here if it&apos;s approved.</p>;
  if (status === "denied")
    return <p className="mt-4 max-w-[44ch] text-sm text-smoke">Early access wasn&apos;t approved this time. You can play the case once it&apos;s released.</p>;
  if (status === "approved") return null;
  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={pending}
        className={buttonClass("primary")}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await requestEarlyAccess(caseId);
            if ("error" in res) setError(res.error);
            else setStatus(res.status);
          })
        }
      >
        {pending ? "Sending…" : "Request Early Access"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#e08a7f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
