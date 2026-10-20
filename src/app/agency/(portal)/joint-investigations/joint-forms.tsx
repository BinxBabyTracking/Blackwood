"use client";

import { useActionState, useState } from "react";
import { joinJointInvestigation, openJointInvestigation } from "@/app/actions/joint";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";

export function OpenJointForm({ cases }: { cases: { id: string; title: string; case_number: string }[] }) {
  const [state, action] = useActionState(openJointInvestigation, IDLE);
  const none = cases.length === 0;
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        Case
        <select name="caseId" className="field mt-1.5" disabled={none} defaultValue="">
          <option value="" disabled>
            {none ? "No eligible cases" : "Choose a case"}
          </option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}: {c.title}
            </option>
          ))}
        </select>
      </label>
      {none ? (
        <p className="text-sm text-smoke">
          Joint investigations can be opened for open cases you have access to that support more than one investigator. No
          case is open for assignment yet; Case 001 opens with the investigation desk.
        </p>
      ) : null}
      <FormMessage state={state} />
      <SubmitButton pending="Opening" disabled={none}>
        Open Joint Investigation
      </SubmitButton>
    </form>
  );
}

export function JoinForm() {
  const [state, action] = useActionState(joinJointInvestigation, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Invitation code"
        name="code"
        autoComplete="off"
        spellCheck={false}
        maxLength={6}
        placeholder="K7Q2XM"
        className="field mt-1.5 font-mono uppercase tracking-[0.3em]"
        hint="Six characters, from the investigation host."
        error={errors.code}
      />
      <FormMessage state={state} />
      <SubmitButton pending="Checking code" variant="secondary">
        Join Existing Assignment
      </SubmitButton>
    </form>
  );
}

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-[2px] border border-brass/50 bg-ink px-3 py-1.5 font-mono text-lg tracking-[0.3em] text-brass">{code}</span>
      <button
        type="button"
        className="text-sm text-brass underline-offset-4 hover:underline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied("copied");
          } catch {
            setCopied("failed");
          }
        }}
      >
        Invite Investigator
      </button>
      <span aria-live="polite" className="text-xs text-smoke">
        {copied === "copied" ? "Code copied. Send it to the investigator you want to invite." : copied === "failed" ? "Copy failed. Select the code and copy it manually." : ""}
      </span>
    </div>
  );
}
