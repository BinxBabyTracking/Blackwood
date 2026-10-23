"use client";

import { startTransition, useActionState, useState } from "react";
import { saveCaseAlerts } from "@/app/actions/settings";
import { Field, FormMessage, IDLE } from "@/components/form";
import { buttonClass } from "@/components/ui";

/** "Get notified when a new case is available": an email address and a yes/no switch, yes by default. */
export function CaseAlerts({ email, on: initial }: { email: string; on: boolean }) {
  const [state, action, pending] = useActionState(saveCaseAlerts, IDLE);
  const [on, setOn] = useState(initial);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form
      // Submitted by hand so the form keeps what was just saved (an action-bound form resets itself afterwards).
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-5"
      noValidate
    >
      <label className="flex cursor-pointer items-center justify-between gap-6">
        <span className="text-sm">Email me when a new case is available</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className={`font-mono text-xs ${on ? "text-brass" : "text-smoke"}`}>{on ? "Yes" : "No"}</span>
          <span className="relative inline-flex">
            <input type="checkbox" role="switch" name="notify" checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full border border-rule bg-ink transition-colors peer-checked:border-brass peer-checked:bg-brass/25 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass" />
            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-smoke transition-transform peer-checked:translate-x-5 peer-checked:bg-brass" />
          </span>
        </span>
      </label>
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={email}
        readOnly={!on}
        className={`field mt-1.5 ${on ? "" : "opacity-50"}`}
        hint="Only for new-case announcements. Your sign-in email is filled in; change it to send them somewhere else."
        error={errors.email}
      />
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={buttonClass("secondary")}>
        {pending ? "Saving" : "Save"}
      </button>
    </form>
  );
}
