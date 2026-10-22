import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Reading the spending ledger for the owner's Spending page: rates, who may
 * see it, and the cost of each case and playthrough. Costs are worked out here
 * from the raw usage (tokens, characters, seconds) and the current rates.
 */

export interface Rates {
  claude_input_per_mtok: number;
  claude_output_per_mtok: number;
  tts_per_1k_chars: number;
  stt_per_hour: number;
  /** Share of the price kept after these costs, for the suggested price (0.7 = 70%). */
  target_margin: number;
}

export const DEFAULT_RATES: Rates = { claude_input_per_mtok: 0.1, claude_output_per_mtok: 0.5, tts_per_1k_chars: 0.1, stt_per_hour: 0.22, target_margin: 0.7 };

export async function isOwner(userId: string) {
  const db = createAdminClient();
  if (!db) return false;
  const { data } = await db.from("site_settings").select("value").eq("key", "admins").maybeSingle();
  return Array.isArray(data?.value) && (data!.value as unknown[]).includes(userId);
}

export async function getRates(): Promise<Rates> {
  const db = createAdminClient();
  if (!db) return DEFAULT_RATES;
  const { data } = await db.from("site_settings").select("value").eq("key", "cost_rates").maybeSingle();
  const v = (data?.value ?? {}) as Partial<Rates>;
  const num = (k: keyof Rates) => (typeof v[k] === "number" && Number.isFinite(v[k]) && v[k]! >= 0 ? (v[k] as number) : DEFAULT_RATES[k]);
  return {
    claude_input_per_mtok: num("claude_input_per_mtok"),
    claude_output_per_mtok: num("claude_output_per_mtok"),
    tts_per_1k_chars: num("tts_per_1k_chars"),
    stt_per_hour: num("stt_per_hour"),
    target_margin: Math.min(0.95, num("target_margin")),
  };
}

export async function saveRates(r: Rates) {
  const db = createAdminClient();
  if (!db) throw new Error("The server is not configured to save settings.");
  const { error } = await db.from("site_settings").upsert({ key: "cost_rates", value: r, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

type UsageRow = {
  at: string;
  user_id: string | null;
  session_id: string | null;
  case_id: string;
  character_id: string | null;
  service: "claude" | "tts" | "stt";
  input_tokens: number;
  output_tokens: number;
  characters: number;
  audio_seconds: number | string;
  saved: boolean;
};

export interface Money {
  claude: number;
  tts: number;
  stt: number;
  total: number;
  /** What reused answers and recordings would have cost. */
  saved: number;
  questions: number;
}

const zero = (): Money => ({ claude: 0, tts: 0, stt: 0, total: 0, saved: 0, questions: 0 });

export interface Playthrough {
  sessionId: string;
  caseId: string;
  player: string;
  startedAt: string;
  status: string;
  money: Money;
}

export interface CaseSpend {
  caseId: string;
  title: string;
  playthroughs: number;
  completed: number;
  money: Money;
  perPlaythrough: number;
  perCompleted: number | null;
  suggestedPrice: number | null;
}

export async function getSpending() {
  const db = createAdminClient();
  if (!db) return null;
  const rates = await getRates();
  const { data, error } = await db
    .from("api_usage")
    .select("at, user_id, session_id, case_id, character_id, service, input_tokens, output_tokens, characters, audio_seconds, saved")
    .order("at", { ascending: false })
    .limit(50000);
  if (error) throw new Error(`Could not read the spending ledger: ${error.message}`);
  const rows = (data ?? []) as UsageRow[];

  const claudeCost = (r: UsageRow) => (r.input_tokens * rates.claude_input_per_mtok + r.output_tokens * rates.claude_output_per_mtok) / 1e6;
  const ttsCost = (r: UsageRow) => (r.characters / 1000) * rates.tts_per_1k_chars;
  const sttCost = (r: UsageRow) => (Number(r.audio_seconds) / 3600) * rates.stt_per_hour;
  // A reused interview answer saves what an average fresh one costs.
  const fresh = rows.filter((r) => r.service === "claude" && !r.saved);
  const avgClaude = fresh.length ? fresh.reduce((n, r) => n + claudeCost(r), 0) / fresh.length : 0;

  const add = (m: Money, r: UsageRow) => {
    if (r.service === "claude") {
      m.questions++;
      if (r.saved) m.saved += avgClaude;
      else m.claude += claudeCost(r);
    } else if (r.service === "tts") {
      if (r.saved) m.saved += ttsCost(r);
      else m.tts += ttsCost(r);
    } else if (!r.saved) m.stt += sttCost(r);
    m.total = m.claude + m.tts + m.stt;
  };

  const all = zero();
  const week = zero();
  const today = zero();
  const weekAgo = Date.now() - 7 * 86400000;
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const byCase = new Map<string, Money>();
  const bySession = new Map<string, { caseId: string; userId: string | null; money: Money; first: string }>();
  for (const r of rows) {
    add(all, r);
    const t = new Date(r.at).getTime();
    if (t >= weekAgo) add(week, r);
    if (t >= midnight.getTime()) add(today, r);
    add(byCase.get(r.case_id) ?? byCase.set(r.case_id, zero()).get(r.case_id)!, r);
    if (r.session_id) {
      const s = bySession.get(r.session_id) ?? bySession.set(r.session_id, { caseId: r.case_id, userId: r.user_id, money: zero(), first: r.at }).get(r.session_id)!;
      add(s.money, r);
      if (r.at < s.first) s.first = r.at;
    }
  }

  const sessionIds = [...bySession.keys()];
  const userIds = [...new Set([...bySession.values()].map((s) => s.userId).filter(Boolean))] as string[];
  const [sessions, profiles, cases] = await Promise.all([
    sessionIds.length ? db.from("investigation_sessions").select("id, status, created_at").in("id", sessionIds) : Promise.resolve({ data: [] }),
    userIds.length ? db.from("detective_profiles").select("id, display_name").in("id", userIds) : Promise.resolve({ data: [] }),
    db.from("cases").select("id, title"),
  ]);
  const sessionInfo = new Map(((sessions.data ?? []) as { id: string; status: string; created_at: string }[]).map((s) => [s.id, s]));
  const names = new Map(((profiles.data ?? []) as { id: string; display_name: string | null }[]).map((p) => [p.id, p.display_name?.trim() || "Investigator"]));
  const titles = new Map(((cases.data ?? []) as { id: string; title: string }[]).map((c) => [c.id, c.title]));

  const playthroughs: Playthrough[] = [...bySession.entries()]
    .map(([id, s]) => ({
      sessionId: id,
      caseId: s.caseId,
      player: s.userId ? names.get(s.userId) ?? "Investigator" : "Unknown",
      startedAt: sessionInfo.get(id)?.created_at ?? s.first,
      status: sessionInfo.get(id)?.status ?? "unknown",
      money: s.money,
    }))
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));

  const caseSpend: CaseSpend[] = [...byCase.entries()]
    .map(([caseId, money]) => {
      const mine = playthroughs.filter((p) => p.caseId === caseId);
      const done = mine.filter((p) => p.status === "closed");
      const perPlaythrough = mine.length ? mine.reduce((n, p) => n + p.money.total, 0) / mine.length : 0;
      const perCompleted = done.length ? done.reduce((n, p) => n + p.money.total, 0) / done.length : null;
      const basis = perCompleted ?? (mine.length ? perPlaythrough : null);
      return {
        caseId,
        title: titles.get(caseId) ?? caseId,
        playthroughs: mine.length,
        completed: done.length,
        money,
        perPlaythrough,
        perCompleted,
        suggestedPrice: basis === null ? null : basis / (1 - rates.target_margin),
      };
    })
    .sort((a, b) => a.caseId.localeCompare(b.caseId));

  return { rates, all, week, today, caseSpend, playthroughs: playthroughs.slice(0, 60), rowCount: rows.length };
}
