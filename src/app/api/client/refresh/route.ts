import { createPublicClient } from "@/lib/supabase/server";

/** Desktop game client: trade a refresh token for a fresh access token. POST { refreshToken }. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const refreshToken = String(body?.refreshToken ?? "");
  const supabase = createPublicClient();
  if (!refreshToken || !supabase) return Response.json({ error: "Sign in again." }, { status: 401 });
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) return Response.json({ error: "Sign in again." }, { status: 401 });
  const s = data.session;
  return Response.json({ accessToken: s.access_token, refreshToken: s.refresh_token, expiresAt: s.expires_at ?? null, email: data.user?.email ?? "" });
}
