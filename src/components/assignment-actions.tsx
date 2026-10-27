import Link from "next/link";
import { acceptAssignment } from "@/app/actions/game";
import { openParty } from "@/app/actions/party";
import { hostLobby } from "@/lib/party";
import { isPlayable } from "@/game/registry";
import { resolveAssignmentAction } from "@/lib/assignment";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { CatalogCase } from "@/lib/types";
import { buttonClass } from "./ui";

/** Reads the visitor's session, so render inside <Suspense>. */
export async function AssignmentActions({ c }: { c: CatalogCase }) {
  const supabase = await createClient();
  let signedIn = false;
  let entitled = false;
  let earlyAccess = false;
  let session: "active" | "closed" | null = null;
  let teamOpen = false;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      signedIn = true;
      const [{ data: ent }, { data: rows }] = await Promise.all([
        supabase.from("case_entitlements").select("id, source").eq("case_id", c.id).eq("user_id", data.user.id).maybeSingle(),
        supabase
          .from("investigation_participants")
          .select("session:investigation_sessions!inner(id, case_id, status, mode)")
          .eq("user_id", data.user.id)
          .eq("session.case_id", c.id)
          .eq("session.mode", "solo")
          .in("session.status", ["active", "closed"]),
      ]);
      entitled = Boolean(ent);
      const lobby = await hostLobby(data.user.id).catch(() => null);
      teamOpen = lobby?.case_id === c.id;
      earlyAccess = (ent as { source?: string } | null)?.source === "grant";
      const statuses = ((rows ?? []) as unknown as { session: { status: string } }[]).map((r) => r.session.status);
      session = statuses.includes("active") ? "active" : statuses.includes("closed") ? "closed" : null;
    }
  }

  const action = resolveAssignmentAction(c, { signedIn, entitled, playable: isPlayable(c.id), session, earlyAccess });

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
          <Link href={`/login?next=/agency/assignments/${c.id}`} className={buttonClass("primary")}>
            Sign in to accept
          </Link>
          <Link href="/join" className={buttonClass("secondary")}>
            Join the Agency
          </Link>
        </div>
      );
    case "resume":
      return (
        <div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/play/${c.id}`} className={buttonClass("primary")}>
              Resume Investigation
            </Link>
            <TeamButton caseId={c.id} open={teamOpen} />
          </div>
          <p className="mt-3 max-w-[48ch] text-sm text-smoke">As a team, friends join your investigation from their phones and pick up where you are.</p>
        </div>
      );
    case "review_closed":
      return (
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-ok)]">You closed this case.</p>
          <Link href={`/play/${c.id}`} className={buttonClass("secondary", "mt-4")}>
            Review your case file
          </Link>
        </div>
      );
    case "accept":
      return (
        <div>
          <div className="flex flex-wrap gap-3">
            <form action={acceptAssignment}>
              <input type="hidden" name="caseId" value={c.id} />
              <button type="submit" className={buttonClass("primary")}>
                Accept Assignment
              </button>
            </form>
            <TeamButton caseId={c.id} open={teamOpen} />
          </div>
          <p className="mt-3 max-w-[48ch] text-sm text-smoke">
            Accepting opens the investigation. Your progress is saved as you go. To investigate as a team, you host and show a code; up to five friends join from their phones, no accounts needed.
          </p>
        </div>
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

/** Opens a joint investigation of this case (you host and show a QR code), or goes back to the one already open. */
function TeamButton({ caseId, open }: { caseId: string; open: boolean }) {
  const icon = (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15.5c3 0 8 1 8 4.5" />
    </svg>
  );
  if (open)
    return (
      <Link href="/agency/joint-investigations" className={buttonClass("secondary", "inline-flex items-center gap-2")}>
        {icon}
        Back to the Team Lobby
      </Link>
    );
  return (
    <form action={openParty}>
      <input type="hidden" name="caseId" value={caseId} />
      <button type="submit" className={buttonClass("secondary", "inline-flex items-center gap-2")}>
        {icon}
        Investigate as a Team
      </button>
    </form>
  );
}
