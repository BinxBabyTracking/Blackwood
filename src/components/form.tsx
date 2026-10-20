"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import type { ActionResult } from "@/lib/types";
import { buttonClass } from "./ui";

export const IDLE: ActionResult = { status: "idle" };

export function Field({
  label,
  name,
  error,
  hint,
  ...input
}: { label: string; name: string; error?: string; hint?: ReactNode } & ComponentProps<"input">) {
  const id = `f-${name}`;
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-paper">
        {label}
      </label>
      <input id={id} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="field mt-1.5" {...input} />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-smoke">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-[#e2a7a2]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  pending: pendingLabel,
  variant = "primary",
  className = "",
  disabled,
}: {
  children: ReactNode;
  pending: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} aria-disabled={pending || disabled} className={buttonClass(variant, className)}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Announces the outcome of an action. Only shows success when the server confirmed it. */
export function FormMessage({ state }: { state: ActionResult }) {
  if (state.status === "idle") return <div aria-live="polite" />;
  const ok = state.status === "success";
  return (
    <div
      aria-live="polite"
      role={ok ? "status" : "alert"}
      className={`rounded-[var(--radius-file)] border px-4 py-3 text-sm ${
        ok ? "border-[color:var(--color-ok)] bg-[color:var(--color-ok)]/15 text-paper" : "border-fault bg-fault/15 text-paper"
      }`}
    >
      {state.message}
    </div>
  );
}
