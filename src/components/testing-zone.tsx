import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/test-reset";
import { ASYLUM_TEST } from "@/game/testing/asylum";

/** The owner's Testing Zone at the bottom of Available Assignments. Renders nothing for anyone else. */
export async function TestingZone() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!isOwner(data.user?.email)) return null;
  const built = process.env.BUILD_TIME
    ? new Date(process.env.BUILD_TIME).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " ET"
    : null;
  return (
    <section className="mt-16 border-t border-dashed border-fault/60 pt-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fault">Testing Zone · only visible to you</p>
      <h2 className="mt-2 font-display text-3xl text-paper">Current Test</h2>
      <Link
        href="/agency/testing/asylum"
        className="mt-5 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <img src="/testing/asylum/ward.webp" alt="" className="h-20 w-40 shrink-0 object-cover" />
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">{ASYLUM_TEST.title}</p>
          <p className="mt-1 text-sm text-smoke">{ASYLUM_TEST.blurb}</p>
          <p className="mt-2 text-sm text-brass">Enter the room →</p>
          {built ? <p className="mt-2 font-mono text-xs text-smoke">Last updated {built}</p> : null}
        </div>
      </Link>
    </section>
  );
}
