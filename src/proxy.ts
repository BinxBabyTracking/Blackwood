import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

const PROTECTED = ["/agency", "/play"];
const GUEST_ONLY = ["/login", "/join"];

/**
 * Refreshes the Supabase session cookie on every request and keeps signed-out
 * visitors out of the detective portal.
 */
export async function proxy(request: NextRequest) {
  // An emailed link that Supabase sent to the site's home page instead of /auth/confirm (it does that when the
  // address it was asked for isn't on its approved list): finish signing in there, then carry on as the link meant.
  const sp = request.nextUrl.searchParams;
  if (request.nextUrl.pathname !== "/auth/confirm" && !request.nextUrl.pathname.startsWith("/api") && (sp.get("code") || (sp.get("token_hash") && sp.get("type")))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }
  // The same kind of link that had already expired or been used: say so on the sign-in page instead of the home page.
  if (sp.get("error_code") && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", "link_invalid");
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims validates the JWT; do not run code between client creation and this call.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  const redirectTo = (pathname: string, keepNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (keepNext) url.searchParams.set("next", path);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!signedIn && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    return redirectTo("/login", true);
  }
  if (signedIn && GUEST_ONLY.includes(path)) {
    return redirectTo("/agency");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
