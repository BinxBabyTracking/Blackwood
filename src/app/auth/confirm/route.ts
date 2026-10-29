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
  // No `next` means the link lost its way (sent to the home page): work out below where it was going.
  const asked = url.searchParams.get("next");
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

  let recovery = type === "recovery";
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link_invalid");
    // A password reset link: the session was made by recovery, or a reset was requested in the last two hours.
    const amr = ((data.session ? (await supabase.auth.getClaims()).data?.claims?.amr : null) ?? []) as { method?: string }[];
    const sentAt = data.user?.recovery_sent_at ? Date.parse(data.user.recovery_sent_at) : 0;
    recovery ||= amr.some((m) => m.method === "recovery") || (sentAt > 0 && Date.now() - sentAt < 2 * 3600e3);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail("link_invalid");
  } else {
    return fail("link_invalid");
  }

  const next = asked ? safeNext(asked) : recovery ? "/reset-password" : "/agency/onboarding";
  return NextResponse.redirect(new URL(next, url.origin));
}
