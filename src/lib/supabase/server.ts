import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Request-scoped client that carries the investigator's session cookie.
 * Returns null when Supabase has not been configured yet.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  // Supabase reads the clock to check token expiry; that must happen per request.
  await connection();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Cookie-free client for public catalog reads. Safe to use inside `use cache`
 * because it never touches request data.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createPlainClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
