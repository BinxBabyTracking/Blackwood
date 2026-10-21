import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonClass } from "@/components/ui";
import { Seal } from "@/components/wordmark";
import { normalizeState, respond } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { InvestigationShell } from "@/game/ui/investigation-shell";
import { getSettings, requireInvestigator } from "@/lib/investigator";
import { isAdminConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Investigation" };

/**
 * Dedicated full-screen gameplay route, separate from the agency portal.
 * The case definition never leaves the server; the client gets a view.
 */
export default function PlayPage({ params }: PageProps<"/play/[caseId]">) {
  return (
    <Suspense fallback={<Opening />}>
      <Desk params={params} />
    </Suspense>
  );
}

function Opening() {
  return (
    <main id="main" className="fixed inset-0 flex items-center justify-center bg-black" role="status">
      <div className="text-center">
        <Seal className="mx-auto h-12 w-12 animate-pulse text-brass" />
        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-smoke">OPENING THE FILE</p>
      </div>
    </main>
  );
}

function Notice({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <Seal className="mx-auto h-14 w-14 text-brass" />
        <h1 className="mt-6 font-display text-4xl">{title}</h1>
        <div className="mt-4 text-smoke">{children}</div>
        <div className="mt-8">{action ?? <Link href="/agency" className={buttonClass("secondary")}>Return to Headquarters</Link>}</div>
      </div>
    </main>
  );
}

async function Desk({ params }: { params: Promise<{ caseId: string }> }) {
  const me = await requireInvestigator();
  const { caseId } = await params;
  const def = loadCase(caseId);
  if (!def) notFound();

  if (!isAdminConfigured) {
    return (
      <Notice title="Saving is not set up yet.">
        Investigations are saved on the server. Add <code className="font-mono text-paper">SUPABASE_SECRET_KEY</code> to{" "}
        <code className="font-mono text-paper">.env.local</code> and restart the server. See README.md.
      </Notice>
    );
  }

  const loaded = await findInvestigation(me.id, def.id);
  if (!loaded) redirect(`/agency/assignments/${def.id}`);

  const settings = await getSettings(me.id);
  return (
    <main id="main">
      <InvestigationShell
        caseId={def.id}
        homeLocation={def.startLocation}
        initial={respond(def, normalizeState(def, loaded.state)).view}
        prefs={{
          reducedMotion: settings?.reduced_motion ?? false,
          masterVolume: settings?.master_volume ?? 80,
          musicVolume: settings?.music_volume ?? 70,
          dialogueVolume: settings?.dialogue_volume ?? 90,
        }}
      />
    </main>
  );
}
