"use client";

import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";
import { MIN_AGE } from "@/lib/legal";

export function JoinForm() {
  const [state, action] = useActionState(signUp, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  if (state.status === "success") {
    return (
      <div className="mt-8">
        <FormMessage state={state} />
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <Field label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={errors.password}
      />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={errors.confirm} />
      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-paper">
          <input type="checkbox" name="agree" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brass,#c4a36b)]" aria-describedby="agree-error" />
          <span>
            I am {MIN_AGE} or older, and I agree to the{" "}
            <a href="/terms" target="_blank" className="text-brass underline underline-offset-2">Terms of Service</a>,{" "}
            <a href="/privacy" target="_blank" className="text-brass underline underline-offset-2">Privacy Policy</a> and{" "}
            <a href="/billing" target="_blank" className="text-brass underline underline-offset-2">Billing and Refund Policy</a>.
          </span>
        </label>
        {errors.agree ? (
          <p id="agree-error" className="mt-1.5 text-sm text-[#e08a7f]">
            {errors.agree}
          </p>
        ) : null}
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Creating account" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
