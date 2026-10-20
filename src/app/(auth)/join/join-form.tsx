"use client";

import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";

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
      <FormMessage state={state} />
      <SubmitButton pending="Creating account" className="w-full">
        Create account
      </SubmitButton>
      <p className="text-xs leading-relaxed text-smoke">
        By joining you agree to the <a href="/terms" className="underline underline-offset-2">Terms of Service</a> and{" "}
        <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
      </p>
    </form>
  );
}
