import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { C001_MARGARET_HOUSE } from "@/game/walk/c001-margaret";
import { WalkViewer } from "@/game/walk/walk-viewer";

export const metadata: Metadata = { title: "Testing Zone" };

/** The walkable (WASD) Margaret house. Owner only; everyone else gets a 404. */
export default function WalkMargaretPage() {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <Walk />
    </Suspense>
  );
}

async function Walk() {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  return <WalkViewer house={C001_MARGARET_HOUSE} title="The Whitmore File (walk)" />;
}
