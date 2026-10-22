import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * The password on the Admin page. The password itself is never stored: only a
 * salted scrypt hash, in site_settings 'admin_password' ({ salt, hash }).
 * A correct password sets a signed, httpOnly cookie for 12 hours, tied to the
 * signed-in investigator, so it cannot be copied to another account.
 *
 * To change the password, store a new { salt, hash } in site_settings.
 */

const COOKIE = "bw_admin";
const HOURS = 12;

function secret() {
  return process.env.SUPABASE_SECRET_KEY ?? "";
}

function sign(userId: string, exp: number) {
  return createHmac("sha256", secret()).update(`admin|${userId}|${exp}`).digest("hex");
}

async function storedHash(): Promise<{ salt: string; hash: string } | null> {
  const db = createAdminClient();
  if (!db) return null;
  const { data } = await db.from("site_settings").select("value").eq("key", "admin_password").maybeSingle();
  const v = data?.value as { salt?: string; hash?: string } | undefined;
  return v?.salt && v?.hash ? { salt: v.salt, hash: v.hash } : null;
}

export async function passwordMatches(password: string) {
  const stored = await storedHash();
  if (!stored || !password) return false;
  const given = scryptSync(password, stored.salt, 32);
  const want = Buffer.from(stored.hash, "hex");
  return want.length === given.length && timingSafeEqual(given, want);
}

/** Lets this investigator into the Admin page for the next 12 hours. */
export async function grantAdmin(userId: string) {
  const exp = Date.now() + HOURS * 3600 * 1000;
  (await cookies()).set(COOKIE, `${exp}.${sign(userId, exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/agency",
    maxAge: HOURS * 3600,
  });
}

export async function revokeAdmin() {
  (await cookies()).delete({ name: COOKIE, path: "/agency" });
}

/** Whether this investigator has entered the admin password recently. */
export async function hasAdminAccess(userId: string) {
  if (!secret()) return false;
  const raw = (await cookies()).get(COOKIE)?.value ?? "";
  const [expText, sig] = raw.split(".");
  const exp = Number(expText);
  if (!exp || !sig || exp < Date.now()) return false;
  const want = sign(userId, exp);
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

/** Wrong-password attempts per investigator, to slow down guessing. */
const attempts = new Map<string, number[]>();
export function tooManyAttempts(userId: string) {
  const now = Date.now();
  const recent = (attempts.get(userId) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  attempts.set(userId, recent);
  return recent.length >= 5;
}
export function noteFailedAttempt(userId: string) {
  attempts.set(userId, [...(attempts.get(userId) ?? []), Date.now()]);
}
