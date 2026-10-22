"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { safeNext, siteOrigin } from "@/lib/site";
import type { ActionResult } from "@/lib/types";

const NOT_CONFIGURED: ActionResult = {
  status: "error",
  message: "Sign-in is unavailable because Supabase is not configured yet. See README.md for setup.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVITE_ONLY: ActionResult = {
  status: "error",
  message: "Blackwood Investigations is open to invited testers only for now. Ask the agency for an invitation, then sign up with that email address.",
};

/** Whether this email may create an account: always, unless sign-up is invite-only and it isn't on the list. */
async function invited(email: string) {
  const admin = createAdminClient();
  if (!admin) return true;
  const { data: setting } = await admin.from("site_settings").select("value").eq("key", "invite_only").maybeSingle();
  if (setting?.value !== true) return true;
  const { data } = await admin.from("signup_invites").select("email").eq("email", email.trim().toLowerCase()).maybeSingle();
  return Boolean(data);
}

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function signUp(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  if (password !== confirm) fieldErrors.confirm = "Passwords do not match.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Check the highlighted fields.", fieldErrors };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  // While Blackwood is invite-only, say so before anything is sent. The database enforces it regardless.
  if (!(await invited(email))) return INVITE_ONLY;

  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/agency/onboarding` },
  });
  if (error) return /database error saving new user/i.test(error.message) ? INVITE_ONLY : { status: "error", message: error.message };

  // Email confirmation disabled in Supabase: the session exists already.
  if (data.session) redirect("/agency/onboarding");

  return {
    status: "success",
    message: `We sent a confirmation link to ${email}. Open it to activate your account and complete onboarding.`,
  };
}

export async function signIn(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Enter your email and password." };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Confirm your email address first. Check your inbox for the link."
        : "That email and password do not match our records.";
    return { status: "error", message };
  }
  redirect(safeNext(fd.get("next")));
}

export async function requestPasswordReset(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const email = str(fd, "email");
  if (!EMAIL_RE.test(email)) return { status: "error", message: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address." } };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error && error.status !== 429) return { status: "error", message: error.message };
  if (error) return { status: "error", message: "Too many requests. Wait a minute and try again." };
  return {
    status: "success",
    message: `If an account exists for ${email}, a reset link is on its way. The link expires after one hour.`,
  };
}

export async function updatePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (password.length < 8) return { status: "error", message: "Use at least 8 characters.", fieldErrors: { password: "Use at least 8 characters." } };
  if (password !== confirm) return { status: "error", message: "Passwords do not match.", fieldErrors: { confirm: "Passwords do not match." } };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "error", message: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: error.message };
  return { status: "success", message: "Password updated." };
}
