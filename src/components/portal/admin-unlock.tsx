"use client";

import { useActionState } from "react";
import { unlockAdmin, type UnlockState } from "@/app/actions/admin";

/** The password form on the Admin page. */
export function AdminUnlock() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlockAdmin, { error: null });
  return (
    <form action={action} className="max-w-sm space-y-3">
      <label htmlFor="admin-password" className="block text-sm text-smoke">
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded-[2px] border border-rule bg-ink-2 px-3 py-2 font-mono text-paper focus:border-brass focus:outline-none"
      />
      {state.error ? (
        <p role="alert" className="text-sm text-[color:var(--color-fault)]">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50">
        {pending ? "Checking" : "Open"}
      </button>
    </form>
  );
}
