"use client";

import { useState } from "react";
import { checkInterviewAI } from "@/app/actions/interview-ai";

type Result = Awaited<ReturnType<typeof checkInterviewAI>>;

/** One button that makes a tiny call to the interview model and shows exactly what came back. */
export function InterviewAICheck({ lastError }: { lastError: { at: string; message: string } | null }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  return (
    <div className="mt-4 space-y-3 text-sm">
      {lastError ? (
        <p className="border border-fault/60 bg-fault/10 px-3 py-2">
          Last failure, {new Date(lastError.at).toLocaleString()}: <span className="font-mono text-xs">{lastError.message}</span>
        </p>
      ) : (
        <p className="text-smoke">No failures recorded.</p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setResult(await checkInterviewAI().catch((e) => ({ ok: false, model: "", keyType: "", workspace: "", status: null, message: String(e) })));
          setBusy(false);
        }}
        className="rounded-[2px] bg-brass px-4 py-2 font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
      >
        {busy ? "Testing" : "Test the interview AI"}
      </button>
      {result ? (
        <dl className={`grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 border px-3 py-2 ${result.ok ? "border-[color:var(--color-ok)]" : "border-fault"}`}>
          <dt className="text-smoke">Result</dt>
          <dd>{result.ok ? "Working" : "Not working"}</dd>
          <dt className="text-smoke">Model</dt>
          <dd className="font-mono text-xs">{result.model}</dd>
          <dt className="text-smoke">Key type</dt>
          <dd>{result.keyType}</dd>
          <dt className="text-smoke">Workspace</dt>
          <dd>{result.workspace}</dd>
          <dt className="text-smoke">HTTP status</dt>
          <dd>{result.status ?? "no response"}</dd>
          <dt className="text-smoke">Details</dt>
          <dd className="font-mono text-xs">{result.message}</dd>
        </dl>
      ) : null}
    </div>
  );
}
