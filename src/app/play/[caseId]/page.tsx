import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonClass, LoadingFile } from "@/components/ui";
import { Seal } from "@/components/wordmark";
import { getCase } from "@/lib/catalog";

export const metadata: Metadata = { title: "Investigation desk" };

/**
 * Reserved for the Phase 2 investigation engine. Gameplay lives in its own
 * route tree so it never mixes with the platform dashboard.
 */
export default function PlayPage({ params }: PageProps<"/play/[caseId]">) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-6">
      <Suspense fallback={<LoadingFile label="Opening investigation desk" />}>
        <Desk params={params} />
      </Suspense>
    </main>
  );
}

async function Desk({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const result = await getCase(caseId);
  const c = result.ok ? result.data : null;
  return (
    <div className="max-w-lg text-center">
      <Seal className="mx-auto h-14 w-14 text-brass" />
      <p className="mt-6 font-mono text-sm tracking-[0.14em] text-brass">{c ? `${c.id} / ${c.title.toUpperCase()}` : caseId.toUpperCase()}</p>
      <h1 className="mt-3 font-display text-4xl">The investigation desk is not open yet.</h1>
      <p className="mt-4 text-smoke">
        Crime scenes, evidence and interviews arrive with the investigation engine in the next phase. Nothing has been
        started or saved for this case.
      </p>
      <Link href="/agency" className={buttonClass("secondary", "mt-8")}>
        Return to Headquarters
      </Link>
    </div>
  );
}
