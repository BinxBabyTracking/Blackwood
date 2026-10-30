import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { CURRENT_TEST } from "@/game/testing/current-test";
import { PanoramaViewer } from "@/game/testing/panorama-viewer";

export const metadata: Metadata = { title: "Testing Zone" };

/** The current 360° test room. Only the owner's account can open it; everyone else gets a 404. */
export default function TestRoomPage() {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <Room />
    </Suspense>
  );
}

async function Room() {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  return <PanoramaViewer rooms={CURRENT_TEST.rooms} start={CURRENT_TEST.start} title={CURRENT_TEST.title} />;
}
