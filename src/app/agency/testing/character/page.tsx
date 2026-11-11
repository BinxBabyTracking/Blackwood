import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { loadCase } from "@/game/registry";
import { liveCharacterUrl } from "@/lib/art-studio";
import { CharacterTest } from "@/game/walk/character-test";

export const metadata: Metadata = { title: "Testing Zone" };

/** One 3D character on a small stage, talking in their own voice: /agency/testing/character?case=CHR001&id=aldric. Owner only. */
export default function CharacterTestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <Stage searchParams={searchParams} />
    </Suspense>
  );
}

async function Stage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const caseId = (one(q.case) ?? "CHR001").toUpperCase();
  const id = one(q.id) ?? "aldric";
  const def = loadCase(caseId);
  const person = def?.characters.find((c) => c.id === id);
  if (!def || !person) notFound();
  const url = await liveCharacterUrl(`${caseId.toLowerCase()}_${id}`);
  return <CharacterTest caseId={def.id} id={person.id} name={person.name} url={url} />;
}
