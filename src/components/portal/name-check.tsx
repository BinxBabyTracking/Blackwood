"use client";

import { useActionState } from "react";
import { adminTestName, type NameTest } from "@/app/actions/leaderboard";

/** Admin: type a name and see whether players could use it, and which check stopped it. */
export function NameCheck() {
  const [result, action, pending] = useActionState<NameTest, FormData>(adminTestName, null);
  return (
    <form action={action} className="mt-4 max-w-md">
      <label htmlFor="name-test" className="text-sm text-smoke">
        Test a name
      </label>
      <div className="mt-1.5 flex gap-2">
        <input id="name-test" name="name" className="field min-w-0 flex-1" maxLength={40} placeholder="e.g. Mike Hunt" />
        <button type="submit" disabled={pending} className="rounded-[2px] border border-white/20 px-3 py-2 text-sm hover:border-brass disabled:opacity-50">
          {pending ? "Checking" : "Check"}
        </button>
      </div>
      {result ? (
        <p role="status" className={`mt-2 text-sm ${result.allowed ? "text-[color:var(--color-ok)]" : "text-[#e08a7f]"}`}>
          {result.allowed ? `"${result.name}" is allowed.` : `"${result.name}" is blocked (${result.by === "words" ? "word check" : "Claude check"}).`}
        </p>
      ) : null}
    </form>
  );
}
