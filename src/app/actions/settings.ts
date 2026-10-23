"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/site";
import type { ActionResult, UserSettings } from "@/lib/types";

const VOLUME_KEYS = ["master_volume", "music_volume", "dialogue_volume", "sfx_volume"] as const;
const BOOL_KEYS = [
  "subtitles",
  "reduced_motion",
  "high_contrast",
  "notify_announcements",
  "notify_new_assignments",
  "notify_joint_invites",
] as const;
const TEXT_SIZES = ["standard", "large", "x_large"];
const VISION = ["default", "protanopia", "deuteranopia", "tritanopia"];

type Section = "audio" | "accessibility" | "notifications";
const SECTION_FIELDS: Record<Section, (keyof UserSettings)[]> = {
  audio: [...VOLUME_KEYS],
  accessibility: ["subtitles", "text_size", "reduced_motion", "high_contrast", "color_vision"],
  notifications: ["notify_announcements", "notify_new_assignments", "notify_joint_invites"],
};

const LABEL: Record<Section, string> = {
  audio: "Audio settings saved.",
  accessibility: "Accessibility settings saved.",
  notifications: "Notification settings saved.",
};

/** Saves one settings section. Only reports success once the database confirms the write. */
export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const section = fd.get("section") as Section;
  const fields = SECTION_FIELDS[section];
  if (!fields) return { status: "error", message: "Unknown settings section." };

  const patch: Record<string, unknown> = {};
  for (const key of fields) {
    if ((VOLUME_KEYS as readonly string[]).includes(key)) {
      const n = Number(fd.get(key));
      if (!Number.isInteger(n) || n < 0 || n > 100) return { status: "error", message: "Volumes must be between 0 and 100." };
      patch[key] = n;
    } else if ((BOOL_KEYS as readonly string[]).includes(key)) {
      patch[key] = fd.get(key) === "on";
    } else if (key === "text_size") {
      const v = String(fd.get(key));
      if (!TEXT_SIZES.includes(v)) return { status: "error", message: "Choose a text size." };
      patch[key] = v;
    } else if (key === "color_vision") {
      const v = String(fd.get(key));
      if (!VISION.includes(v)) return { status: "error", message: "Choose a color setting." };
      patch[key] = v;
    }
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "error", message: "Your session has ended. Sign in again." };

  const { data, error } = await supabase.from("user_settings").update(patch).eq("user_id", auth.user.id).select("user_id");
  if (error) return { status: "error", message: `Settings were not saved: ${error.message}` };
  if (!data?.length) return { status: "error", message: "Settings were not saved: no settings record exists for this account." };
  refresh();
  return { status: "success", message: LABEL[section] };
}

export async function changeEmail(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address." } };
  }
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured." };
  const origin = await siteOrigin();
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${origin}/auth/confirm?next=/agency/settings` });
  if (error) return { status: "error", message: error.message };
  return {
    status: "success",
    message: `Confirmation sent. Your email changes to ${email} once you follow the link (Supabase may also ask you to confirm from your current address).`,
  };
}

export async function changePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (password.length < 8) return { status: "error", message: "Use at least 8 characters.", fieldErrors: { password: "Use at least 8 characters." } };
  if (password !== confirm) return { status: "error", message: "Passwords do not match.", fieldErrors: { confirm: "Passwords do not match." } };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: error.message };
  return { status: "success", message: "Password updated." };
}

/** The in-game volume sliders: music, sound effects and voices, each 0 to 100. Saved quietly, without reloading the page. */
export async function saveGameVolumes(v: { music: number; sfx: number; dialogue: number }): Promise<{ ok: boolean }> {
  const n = (x: unknown) => (Number.isFinite(Number(x)) ? Math.min(100, Math.max(0, Math.round(Number(x)))) : null);
  const patch = { music_volume: n(v?.music), sfx_volume: n(v?.sfx), dialogue_volume: n(v?.dialogue) };
  if (Object.values(patch).some((x) => x === null)) return { ok: false };
  const supabase = await createClient();
  if (!supabase) return { ok: false };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false };
  const { error } = await supabase.from("user_settings").update(patch).eq("user_id", auth.user.id);
  return { ok: !error };
}

/** Personnel File: whether to hear about new cases, and at which address. */
export async function saveCaseAlerts(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const on = fd.get("notify") === "on";
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (on && !email) return { status: "error", message: "Enter the email address to notify.", fieldErrors: { email: "Enter an email address." } };
  if (email && (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)))
    return { status: "error", message: "That email address doesn't look right.", fieldErrors: { email: "Check the email address." } };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "error", message: "Your session has ended. Sign in again." };
  const own = (auth.user.email ?? "").toLowerCase();
  const { data, error } = await supabase
    .from("user_settings")
    .update({ notify_new_assignments: on, new_case_email: email && email !== own ? email : null })
    .eq("user_id", auth.user.id)
    .select("user_id");
  if (error) return { status: "error", message: `Not saved: ${error.message}` };
  if (!data?.length) return { status: "error", message: "Not saved: no settings record exists for this account." };
  refresh();
  return { status: "success", message: on ? `Saved. We'll email ${email} when a new case opens.` : "Saved. You won't get new-case emails." };
}
