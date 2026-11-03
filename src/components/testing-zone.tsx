import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/test-reset";
import { CURRENT_TEST } from "@/game/testing/current-test";

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
        href="/agency/testing/room"
        className="mt-5 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <img src="/rooms/office-80s/thumb.webp" alt="" className="h-20 w-40 shrink-0 object-cover" />
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">{CURRENT_TEST.title}</p>
          <p className="mt-1 text-sm text-smoke">{CURRENT_TEST.blurb}</p>
          <p className="mt-2 text-sm text-brass">Enter the room →</p>
          {built ? <p className="mt-2 font-mono text-xs text-smoke">Last updated {built}</p> : null}
        </div>
      </Link>
      <Link
        href="/agency/testing/walk"
        className="mt-3 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <div className="grid h-20 w-40 shrink-0 place-items-center border border-rule font-mono text-2xl text-brass">WASD</div>
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">Walk Eleanor&apos;s House</p>
          <p className="mt-1 text-sm text-smoke">The living room, kitchen and back hall as one 3D space: WASD on a computer, the stick on a phone.</p>
          <p className="mt-2 text-sm text-brass">Walk in →</p>
        </div>
      </Link>
      <Link
        href="/agency/testing/walk/diner"
        className="mt-3 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <div className="grid h-20 w-40 shrink-0 place-items-center border border-rule font-mono text-2xl text-brass">WASD</div>
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">Walk the Maple Street Diner</p>
          <p className="mt-1 text-sm text-smoke">Daniel&apos;s alibi: the counter, the window booth and Rosa on the night shift.</p>
          <p className="mt-2 text-sm text-brass">Walk in →</p>
        </div>
      </Link>
      <Link
        href="/agency/testing/walk/apartment"
        className="mt-3 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <div className="grid h-20 w-40 shrink-0 place-items-center border border-rule font-mono text-2xl text-brass">WASD</div>
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">Walk Daniel Mercer&apos;s Apartment</p>
          <p className="mt-1 text-sm text-smoke">Both visits: the windbreaker on the rack, then gone. Daniel at home with his bandaged hand.</p>
          <p className="mt-2 text-sm text-brass">Walk in →</p>
        </div>
      </Link>
      <Link
        href="/agency/testing/walk/margaret"
        className="mt-3 flex max-w-xl items-center gap-4 border border-rule bg-card p-4 transition hover:border-brass"
      >
        <div className="grid h-20 w-40 shrink-0 place-items-center border border-rule font-mono text-2xl text-brass">WASD</div>
        <div className="min-w-0">
          <p className="font-display text-xl text-paper">Walk Margaret Ellis&apos;s House</p>
          <p className="mt-1 text-sm text-smoke">The neighbor&apos;s front window, looking across the street at Eleanor&apos;s porch and the streetlight.</p>
          <p className="mt-2 text-sm text-brass">Walk in →</p>
        </div>
      </Link>
    </section>
  );
}
