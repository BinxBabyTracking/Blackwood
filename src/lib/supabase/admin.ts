import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

const SECRET = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isAdminConfigured = Boolean(SUPABASE_URL && SECRET);

/**
 * Privileged client for server-owned writes: investigation saves, entitlements,
 * session membership and service records. Never import from client code.
 * Always scope queries to the authenticated user's id yourself; this client
 * bypasses Row Level Security.
 */
export function createAdminClient() {
  if (!isAdminConfigured) return null;
  return createClient(SUPABASE_URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
}
