import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST only, so a prefetch or stray link can never sign anyone out. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
