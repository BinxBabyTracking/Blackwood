"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";
import { buttonClass } from "@/components/ui";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <>
      <h1 className="font-display text-4xl">Choose a new password</h1>
      {state.status === "success" ? (
        <div className="mt-8 space-y-6">
          <FormMessage state={state} />
          <Link href="/agency" className={buttonClass("primary", "w-full")}>
            Go to Agency Headquarters
          </Link>
        </div>
      ) : (
        <form action={action} className="mt-8 space-y-5" noValidate>
          <Field label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 8 characters." error={errors.password} />
          <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required error={errors.confirm} />
          <FormMessage state={state} />
          <SubmitButton pending="Updating password" className="w-full">
            Update password
          </SubmitButton>
        </form>
      )}
    </>
  );
}
