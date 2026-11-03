import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { C001_GARAGE } from "@/game/walk/c001-garage";
import { WalkViewer } from "@/game/walk/walk-viewer";

export const metadata: Metadata = { title: "Testing Zone" };

/** The walkable (WASD) garage. Owner only; everyone else gets a 404. */
export default function WalkGaragePage() {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <Walk />
    </Suspense>
  );
}

async function Walk() {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  return <WalkViewer house={C001_GARAGE} title="The Whitmore File (walk)" />;
}
