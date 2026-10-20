"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <>
      <h1 className="font-display text-4xl">Reset your password</h1>
      <p className="mt-3 text-smoke">Enter the email on your account and we will send a reset link.</p>
      {state.status === "success" ? (
        <div className="mt-8">
          <FormMessage state={state} />
        </div>
      ) : (
        <form action={action} className="mt-8 space-y-5" noValidate>
          <Field label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
          <FormMessage state={state} />
          <SubmitButton pending="Sending link" className="w-full">
            Send reset link
          </SubmitButton>
        </form>
      )}
      <Link href="/login" className="mt-8 inline-block text-sm text-brass underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </>
  );
}
