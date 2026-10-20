import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveAssignmentAction } from "@/lib/assignment";
import { formatPrice } from "@/lib/format";
import type { CatalogCase } from "@/lib/types";
import { buttonClass } from "./ui";

/** Reads the visitor's session, so render inside <Suspense>. */
export async function AssignmentActions({ c }: { c: CatalogCase }) {
  const supabase = await createClient();
  let signedIn = false;
  let entitled = false;
  let activeSessionId: string | null = null;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      signedIn = true;
      const [{ data: ent }, { data: sessions }] = await Promise.all([
        supabase.from("case_entitlements").select("id").eq("case_id", c.id).eq("user_id", data.user.id).maybeSingle(),
        supabase
          .from("investigation_participants")
          .select("session:investigation_sessions!inner(id, case_id, status)")
          .eq("user_id", data.user.id)
          .eq("session.case_id", c.id)
          .in("session.status", ["forming", "active"])
          .limit(1),
      ]);
      entitled = Boolean(ent);
      const first = (sessions?.[0] as unknown as { session: { id: string } } | undefined)?.session;
      activeSessionId = first?.id ?? null;
    }
  }

  const action = resolveAssignmentAction(c, { signedIn, entitled, activeSessionId });

  switch (action.kind) {
    case "in_preparation":
      return (
        <Notice title="File in preparation">
          The archive has not released this case yet. It cannot be accepted or purchased.
        </Notice>
      );
    case "coming_soon":
      return (
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brass">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
            Coming Soon
          </p>
          <p className="mt-3 max-w-[44ch] text-sm text-smoke">
            The investigation desk for this case is being prepared. It will open here when it is ready.
          </p>
          {!signedIn ? (
            <Link href="/join" className={buttonClass("secondary", "mt-5")}>
              Join the Agency
            </Link>
          ) : null}
        </div>
      );
    case "retired":
      return <Notice title="Archived">This case has been withdrawn from active assignment.</Notice>;
    case "sign_in":
      return (
        <div className="flex flex-wrap gap-3">
          <Link href={`/login?next=/investigations/${c.id}`} className={buttonClass("primary")}>
            Sign in to accept
          </Link>
          <Link href="/join" className={buttonClass("secondary")}>
            Join the Agency
          </Link>
        </div>
      );
    case "resume":
      return (
        <Link href={`/play/${c.id}`} className={buttonClass("primary")}>
          Resume Investigation
        </Link>
      );
    case "accept":
      return (
        <Link href={`/play/${c.id}`} className={buttonClass("primary")}>
          Accept Assignment
        </Link>
      );
    case "purchase":
      return (
        <div>
          <button type="button" disabled className={buttonClass("primary")}>
            Purchase Case, {formatPrice(c.tier)}
          </button>
          <p className="mt-3 text-sm text-smoke">Purchasing is not open yet. Payment processing arrives in a later phase.</p>
        </div>
      );
  }
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-[44ch]">
      <p className="text-sm font-semibold text-paper">{title}</p>
      <p className="mt-1 text-sm text-smoke">{children}</p>
    </div>
  );
}
