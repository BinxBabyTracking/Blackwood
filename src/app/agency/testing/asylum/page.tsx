import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { ASYLUM_TEST } from "@/game/testing/asylum";
import { PanoramaViewer } from "@/game/testing/panorama-viewer";

export const metadata: Metadata = { title: "Testing Zone" };

/** The 360° asylum prototype. Only the owner's account can open it; everyone else gets a 404. */
export default function AsylumTestPage() {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <Room />
    </Suspense>
  );
}

async function Room() {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  return <PanoramaViewer rooms={ASYLUM_TEST.rooms} start={ASYLUM_TEST.start} title={ASYLUM_TEST.title} />;
}
