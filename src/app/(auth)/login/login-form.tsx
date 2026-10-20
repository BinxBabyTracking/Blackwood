"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";

const LINK_ERRORS: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Request a new one.",
  not_configured: "Sign-in is unavailable because Supabase is not configured yet.",
};

export function LoginForm() {
  const params = useSearchParams();
  const [state, action] = useActionState(signIn, IDLE);
  const linkError = params.get("error");

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="next" value={params.get("next") ?? "/agency"} />
      {linkError && state.status === "idle" ? (
        <FormMessage state={{ status: "error", message: LINK_ERRORS[linkError] ?? LINK_ERRORS.link_invalid }} />
      ) : null}
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <div>
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <Link href="/forgot-password" className="mt-2 inline-block text-xs text-brass underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Signing in" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
