import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type {
  CatalogCase,
  DetectiveProfile,
  InvestigationSession,
  Participant,
  ServiceRecord,
  UserSettings,
} from "./types";

export interface Investigator {
  id: string;
  email: string | null;
  profile: DetectiveProfile;
}

/**
 * Data access layer for the detective portal. Reads the session cookie, so call
 * it only inside a <Suspense> boundary. Redirects signed-out visitors to sign in
 * and new recruits to onboarding.
 */
const loadInvestigator = cache(async (): Promise<Investigator> => {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("detective_profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) throw new Error(`Could not load personnel file: ${error.message}`);
  if (!profile) {
    throw new Error(
      "No personnel file exists for this account. Run the database migrations so new accounts receive a profile automatically.",
    );
  }
  return { id: auth.user.id, email: auth.user.email ?? null, profile: profile as DetectiveProfile };
});

/**
 * Data access layer entry point for the detective portal. Reads the session
 * cookie, so call it only inside a <Suspense> boundary. Redirects signed-out
 * visitors to sign in and new recruits to onboarding.
 */
export async function requireInvestigator(allowUnboarded = false): Promise<Investigator> {
  const me = await loadInvestigator();
  if (!me.profile.onboarded_at && !allowUnboarded) redirect("/agency/onboarding");
  return me;
}

export async function getServiceRecord(userId: string): Promise<ServiceRecord> {
  const supabase = (await createClient())!;
  const { data, error } = await supabase.from("service_records").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load service record: ${error.message}`);
  return (
    (data as ServiceRecord | null) ?? {
      user_id: userId,
      cases_closed: 0,
      cases_investigated: 0,
      total_investigation_seconds: 0,
      accuracy: null,
    }
  );
}

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const supabase = (await createClient())!;
  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load settings: ${error.message}`);
  return data as UserSettings | null;
}

export async function getAwardedAchievementIds(userId: string): Promise<Map<string, string>> {
  const supabase = (await createClient())!;
  const { data, error } = await supabase.from("user_achievements").select("achievement_id, awarded_at").eq("user_id", userId);
  if (error) throw new Error(`Could not load commendations: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.achievement_id as string, r.awarded_at as string]));
}

export interface CaseFile extends InvestigationSession {
  case: Pick<CatalogCase, "id" | "case_number" | "title" | "status"> | null;
  latest_save_id: string | null;
  replay_eligible: boolean;
}

/** Every investigation session the investigator belongs to, newest activity first. */
export async function getCaseFiles(userId: string): Promise<CaseFile[]> {
  const supabase = (await createClient())!;
  const { data: memberships, error } = await supabase
    .from("investigation_participants")
    .select("session:investigation_sessions(*, case:cases(id, case_number, title, status))")
    .eq("user_id", userId);
  if (error) throw new Error(`Could not load case files: ${error.message}`);

  const sessions = (memberships ?? [])
    .map((m) => (m as unknown as { session: CaseFile | null }).session)
    .filter((s): s is CaseFile => Boolean(s));

  if (sessions.length === 0) return [];

  const [{ data: saves }, { data: entitlements }] = await Promise.all([
    supabase
      .from("save_games")
      .select("id, session_id, updated_at")
      .eq("user_id", userId)
      .in(
        "session_id",
        sessions.map((s) => s.id),
      )
      .order("updated_at", { ascending: false }),
    supabase.from("case_entitlements").select("case_id").eq("user_id", userId),
  ]);

  const latestSave = new Map<string, string>();
  for (const s of saves ?? []) if (!latestSave.has(s.session_id)) latestSave.set(s.session_id, s.id);
  const owned = new Set((entitlements ?? []).map((e) => e.case_id as string));

  return sessions
    .map((s) => ({
      ...s,
      latest_save_id: latestSave.get(s.id) ?? null,
      replay_eligible: (s.status === "closed" || s.status === "archived") && owned.has(s.case_id),
    }))
    .sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
}

export interface JointInvestigation extends InvestigationSession {
  case: Pick<CatalogCase, "id" | "case_number" | "title"> | null;
  participants: Participant[];
}

/** Joint investigations still forming, with their rosters. */
export async function getFormingJointInvestigations(userId: string): Promise<JointInvestigation[]> {
  const supabase = (await createClient())!;
  const { data: memberships, error } = await supabase
    .from("investigation_participants")
    .select("session_id")
    .eq("user_id", userId);
  if (error) throw new Error(`Could not load joint investigations: ${error.message}`);
  const ids = (memberships ?? []).map((m) => m.session_id as string);
  if (ids.length === 0) return [];

  const { data, error: sessionError } = await supabase
    .from("investigation_sessions")
    .select(
      "*, case:cases(id, case_number, title), participants:investigation_participants(*, profile:detective_profiles(display_name, avatar_url))",
    )
    .in("id", ids)
    .eq("mode", "joint")
    .eq("status", "forming")
    .order("created_at", { ascending: false });
  if (sessionError) throw new Error(`Could not load joint investigations: ${sessionError.message}`);
  return (data ?? []) as JointInvestigation[];
}

/** Cases the investigator could open a joint investigation for right now. */
export async function getJointEligibleCases(userId: string) {
  const supabase = (await createClient())!;
  const { data, error } = await supabase
    .from("case_entitlements")
    .select("case:cases(id, case_number, title, status, max_investigators, is_preview)")
    .eq("user_id", userId);
  if (error) throw new Error(`Could not load entitlements: ${error.message}`);
  type Row = { case: { id: string; case_number: string; title: string; status: string; max_investigators: number; is_preview: boolean } | null };
  return ((data ?? []) as unknown as Row[])
    .map((r) => r.case)
    .filter((c): c is NonNullable<Row["case"]> => Boolean(c && c.status === "available" && !c.is_preview && c.max_investigators > 1));
}

export async function getEntitlement(userId: string, caseId: string) {
  const supabase = (await createClient())!;
  const { data } = await supabase.from("case_entitlements").select("id").eq("user_id", userId).eq("case_id", caseId).maybeSingle();
  return Boolean(data);
}

/** One investigation's filed final report, if the investigator took part in it. RLS limits this to members. */
export async function getFiledReport(sessionId: string) {
  const supabase = (await createClient())!;
  const { data, error } = await supabase
    .from("investigation_sessions")
    .select("id, case_id, status, completed_at, final_report, case:cases(id, title)")
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`Could not load the report: ${error.message}`);
  return data as unknown as (Pick<InvestigationSession, "id" | "case_id" | "status" | "completed_at" | "final_report"> & { case: { id: string; title: string } | null }) | null;
}
