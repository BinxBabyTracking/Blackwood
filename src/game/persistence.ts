import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { newState, progressOf } from "./engine/engine";
import type { CaseDefinition, InvestigationState } from "./engine/types";

/*
 * Save-state management. All writes go through the service-role client on the
 * server, always scoped to the signed-in user's id, so players cannot edit
 * their own saves, entitlements or service records from the browser.
 */

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export class PersistenceError extends Error {}

function admin(): Admin {
  const a = createAdminClient();
  if (!a) throw new PersistenceError("SUPABASE_SECRET_KEY is not set, so investigations cannot be saved.");
  return a;
}

export interface Loaded {
  sessionId: string;
  saveId: string;
  updatedAt: string;
  state: InvestigationState;
  sessionStatus: string;
}

/** The player's current solo investigation for a case: the open one, else the most recent closed one. */
export async function findInvestigation(userId: string, caseId: string): Promise<Loaded | null> {
  const db = admin();
  const { data: sessions, error } = await db
    .from("investigation_sessions")
    .select("id, status, created_at, investigation_participants!inner(user_id)")
    .eq("case_id", caseId)
    .eq("mode", "solo")
    .eq("investigation_participants.user_id", userId)
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false });
  if (error) throw new PersistenceError(error.message);
  const session = sessions?.find((s) => s.status === "active") ?? sessions?.[0];
  if (!session) return null;

  const { data: save, error: saveError } = await db
    .from("save_games")
    .select("id, state, updated_at")
    .eq("session_id", session.id)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (saveError) throw new PersistenceError(saveError.message);
  if (!save) return null;
  return { sessionId: session.id, saveId: save.id, updatedAt: save.updated_at, state: save.state as InvestigationState, sessionStatus: session.status };
}

/**
 * Accepts an assignment: checks the case is open and the player may play it,
 * records the entitlement for a free case, and opens a solo investigation with
 * a fresh save. Returns the existing open investigation if there is one.
 */
export async function startInvestigation(userId: string, def: CaseDefinition): Promise<Loaded> {
  const db = admin();
  const { data: c, error } = await db.from("cases").select("id, status, is_preview, tier:pricing_tiers(price_cents)").eq("id", def.id).maybeSingle();
  if (error) throw new PersistenceError(error.message);
  if (!c || c.status !== "available" || c.is_preview) throw new PersistenceError("This case is not open for assignment.");

  const existing = await findInvestigation(userId, def.id);
  if (existing && existing.sessionStatus === "active") return existing;

  const price = (c.tier as unknown as { price_cents: number } | null)?.price_cents ?? 0;
  const { data: ent } = await db.from("case_entitlements").select("id").eq("user_id", userId).eq("case_id", def.id).maybeSingle();
  if (!ent) {
    if (price > 0) throw new PersistenceError("You need to purchase this case before accepting it.");
    const { error: entError } = await db.from("case_entitlements").insert({ user_id: userId, case_id: def.id, source: "free" });
    if (entError) throw new PersistenceError(entError.message);
  }

  return createSession(db, userId, def);
}

async function createSession(db: Admin, userId: string, def: CaseDefinition): Promise<Loaded> {
  const now = new Date().toISOString();
  const { data: session, error } = await db
    .from("investigation_sessions")
    .insert({ case_id: def.id, host_user_id: userId, mode: "solo", status: "active", max_participants: 1, started_at: now, last_activity_at: now })
    .select("id, status")
    .single();
  if (error) throw new PersistenceError(error.message);

  const { error: pError } = await db.from("investigation_participants").insert({ session_id: session.id, user_id: userId, role: "host", is_ready: true });
  if (pError) throw new PersistenceError(pError.message);

  const state = newState(def);
  const { data: save, error: sError } = await db
    .from("save_games")
    .insert({ session_id: session.id, user_id: userId, schema_version: state.version, state })
    .select("id, updated_at")
    .single();
  if (sError) throw new PersistenceError(sError.message);

  const { data: rec } = await db.from("service_records").select("cases_investigated").eq("user_id", userId).maybeSingle();
  await db.from("service_records").update({ cases_investigated: (rec?.cases_investigated ?? 0) + 1, updated_at: now }).eq("user_id", userId);

  return { sessionId: session.id, saveId: save.id, updatedAt: save.updated_at, state, sessionStatus: "active" };
}

/** Archives the open investigation and starts over with a clean save. */
export async function restartInvestigation(userId: string, def: CaseDefinition): Promise<Loaded> {
  const db = admin();
  const current = await findInvestigation(userId, def.id);
  if (current && current.sessionStatus === "active") {
    await db.from("investigation_sessions").update({ status: "archived", last_activity_at: new Date().toISOString() }).eq("id", current.sessionId);
  }
  const { data: ent } = await db.from("case_entitlements").select("id").eq("user_id", userId).eq("case_id", def.id).maybeSingle();
  if (!ent) throw new PersistenceError("Accept the assignment first.");
  return createSession(db, userId, def);
}

/**
 * Writes the new state if nobody else saved in the meantime (another tab, for
 * instance). Returns false on a conflict so the caller can reload and retry.
 */
export async function saveState(def: CaseDefinition, loaded: Loaded, state: InvestigationState): Promise<boolean> {
  const db = admin();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("save_games")
    .update({ state, updated_at: now })
    .eq("id", loaded.saveId)
    .eq("updated_at", loaded.updatedAt)
    .select("id");
  if (error) throw new PersistenceError(error.message);
  if (!data?.length) return false;
  await db
    .from("investigation_sessions")
    .update({ last_activity_at: now, progress: progressOf(def, state) })
    .eq("id", loaded.sessionId);
  return true;
}

/** The investigator's name as it appears on reports. */
export async function investigatorName(userId: string): Promise<string> {
  const { data } = await admin().from("detective_profiles").select("display_name").eq("id", userId).maybeSingle();
  return data?.display_name?.trim() || "Investigator";
}

/** The filed report as stored with the closed investigation: answers in words, evidence by id and title. */
function filedReport(def: CaseDefinition, state: InvestigationState) {
  const f = state.report.final!;
  const label = (set: string, id: string) => def.conclusionChoices.find((c) => c.id === set)?.options.find((o) => o.id === id)?.label ?? id;
  return {
    caseId: def.id,
    title: def.title,
    investigator: f.investigator,
    filedAt: new Date(f.filedAt).toISOString(),
    attempts: f.attempts,
    sections: def.conclusionChoices.map((c) => ({ section: c.section, title: c.title, question: c.question, answer: label(c.id, f.theory[c.id]) })),
    evidence: f.theory.evidence.map((id) => ({ id, title: def.evidence.find((e) => e.id === id)?.title ?? id })),
  };
}

/**
 * Records a closed case against the investigator's career in one database
 * transaction (record_case_completion). Safe to call any number of times for
 * the same investigation: only the first call changes anything, and a replay
 * of a case already closed adds time spent but never a second closed case.
 */
export async function recordClosedCase(userId: string, def: CaseDefinition, loaded: Loaded, state: InvestigationState) {
  if (state.status !== "closed" || !state.report?.final) return null;
  const db = admin();
  const attempts = state.report.final.attempts;
  const accuracy = Math.max(40, 100 - 20 * (attempts - 1));
  const covered = def.solution.standard.lines.filter((l) => l.anyOf.some((id) => state.report.final!.theory.evidence.includes(id)));
  const awards = ["first_case_closed"];
  if (state.evidence.length === def.evidence.length) awards.push("thorough_investigator");
  if (covered.length === def.solution.standard.lines.length) awards.push("evidence_specialist");
  if (attempts === 1) awards.push("exceptional_deduction");

  const { data, error } = await db.rpc("record_case_completion", {
    p_user: userId,
    p_case: def.id,
    p_session: loaded.sessionId,
    p_report: filedReport(def, state),
    p_seconds: state.activeSeconds,
    p_accuracy: accuracy,
    p_attempts: attempts,
    p_awards: awards,
  });
  if (error) throw new PersistenceError(error.message);
  const r = data as { recorded: boolean; first: boolean; awarded: string[]; rank_level: number | null };

  const [{ data: titles }, { data: rank }] = await Promise.all([
    r.awarded.length ? db.from("achievements").select("id, title").in("id", r.awarded) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    r.rank_level != null ? db.from("agency_ranks").select("title").eq("level", r.rank_level).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return {
    recorded: r.recorded,
    first: r.first,
    awarded: (titles ?? []).map((t) => t.title),
    rank: (rank as { title: string } | null)?.title ?? null,
  };
}
