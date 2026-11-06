import { createPublicClient } from "@/lib/supabase/server";

/**
 * Desktop game client (Godot): sign in with the same email and password as the website.
 * POST { email, password } → { accessToken, refreshToken, expiresAt, email }.
 * The client sends the access token as `Authorization: Bearer ...` to /api/client/* and /api/voice.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return Response.json({ error: "Enter your email and password." }, { status: 400 });
  const supabase = createPublicClient();
  if (!supabase) return Response.json({ error: "Sign-in is unavailable right now." }, { status: 503 });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return Response.json({ error: "That email and password do not match our records." }, { status: 401 });
  const s = data.session;
  return Response.json({ accessToken: s.access_token, refreshToken: s.refresh_token, expiresAt: s.expires_at ?? null, email: data.user?.email ?? email });
}
