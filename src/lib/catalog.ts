import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/server";
import type { Achievement, AgencyNotice, AgencyRank, CatalogCase, PricingTier } from "./types";

export type Loaded<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "not_configured" | "error"; message?: string };

const CASE_SELECT = "*, tier:pricing_tiers(*)";

/** Every case in the archive with its pricing tier, in catalog order. */
export async function getCatalog(): Promise<Loaded<CatalogCase[]>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.from("cases").select(CASE_SELECT).order("catalog_order");
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data ?? []) as CatalogCase[] };
}

export async function getCase(id: string): Promise<Loaded<CatalogCase | null>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog", `case:${id}`);

  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.from("cases").select(CASE_SELECT).eq("id", id.toUpperCase()).maybeSingle();
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data as CatalogCase | null) ?? null };
}

/** The introductory case, featured on the homepage and at headquarters. */
export async function getFeaturedCase(): Promise<Loaded<CatalogCase | null>> {
  const catalog = await getCatalog();
  if (!catalog.ok) return catalog;
  const featured = catalog.data.find((c) => c.is_introductory && !c.is_preview) ?? catalog.data.find((c) => !c.is_preview);
  return { ok: true, data: featured ?? null };
}

export async function getPricingTiers(): Promise<Loaded<PricingTier[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.from("pricing_tiers").select("*").order("sort_order");
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data ?? []) as PricingTier[] };
}

export async function getRanks(): Promise<Loaded<AgencyRank[]>> {
  "use cache";
  cacheLife("hours");
  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.from("agency_ranks").select("*").order("level");
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data ?? []) as AgencyRank[] };
}

export async function getAchievements(): Promise<Loaded<Achievement[]>> {
  "use cache";
  cacheLife("hours");
  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.from("achievements").select("*").order("sort_order");
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data ?? []) as Achievement[] };
}

export async function getNotices(): Promise<Loaded<AgencyNotice[]>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("notices");
  const supabase = createPublicClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase
    .from("agency_notices")
    .select("id, category, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(10);
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: (data ?? []) as AgencyNotice[] };
}
