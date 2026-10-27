import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortalHeading } from "@/components/portal/heading";
import { RollingBoard } from "@/components/series/rolling-board";
import { ButtonLink, EmptyFile, LoadingFile } from "@/components/ui";
import { requireInvestigator } from "@/lib/investigator";
import { SERIES } from "@/series";
import { loadSeries } from "@/series/server";

export const metadata: Metadata = { title: "Rolling board" };

/** A series' rolling board, outside any one case: open once the series' first case is solved. */
export default function SeriesBoardPage({ params }: PageProps<"/agency/series/[seriesId]">) {
  return (
    <Suspense fallback={<LoadingFile label="Wheeling in the board" />}>
      <Board params={params} />
    </Suspense>
  );
}

async function Board({ params }: { params: Promise<{ seriesId: string }> }) {
  const seriesId = (await params).seriesId.toUpperCase();
  if (!SERIES.some((x) => x.id === seriesId)) notFound();
  const me = await requireInvestigator();
  const view = await loadSeries(me.id, seriesId);
  if (!view) notFound();
  if (!view.open) {
    const first = SERIES.find((x) => x.id === seriesId)?.cases[0];
    return (
      <>
        <PortalHeading title={`Rolling board: ${view.title}`} />
        <EmptyFile
          title="The rolling board arrives after the first case."
          action={<ButtonLink href={first ? `/agency/assignments/${first.caseId}` : "/agency/assignments"}>Go to {first?.label ?? "the first case"}</ButtonLink>}
        >
          Solve {first?.label ?? "the first case"}, {first?.title ?? ""}, and a second cork board on wheels joins your office. It carries whatever you choose to keep from one case of the series to the next.
        </EmptyFile>
      </>
    );
  }
  return <RollingBoard initial={view} closeHref="/agency/assignments" />;
}
