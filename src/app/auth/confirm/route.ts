import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site";

/**
 * Landing point for links in Supabase auth emails (sign-up confirmation and
 * password reset). Handles both the PKCE `code` flow and the `token_hash` flow.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const fail = (reason: string) => {
    const target = new URL("/login", url.origin);
    target.searchParams.set("error", reason);
    return NextResponse.redirect(target);
  };

  const supabase = await createClient();
  if (!supabase) return fail("not_configured");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link_invalid");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail("link_invalid");
  } else {
    return fail("link_invalid");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
