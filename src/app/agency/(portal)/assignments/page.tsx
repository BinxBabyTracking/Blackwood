import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { CatalogBrowser } from "@/components/catalog-browser";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { SeriesShelf } from "@/components/series-shelf";
import { PortalHeading } from "@/components/portal/heading";
import { SetupNotice } from "@/components/setup-notice";
import { TestingZone } from "@/components/testing-zone";
import { getCatalog } from "@/lib/catalog";
import { viewerCaseStates, viewerFailures } from "@/lib/viewer-cases";
import { inSeason } from "@/lib/season";

export const metadata: Metadata = { title: "Available Assignments" };

export default function AssignmentsPage() {
  return (
    <>
      <PortalHeading title="Available Assignments">
        Files cleared for assignment, plus sealed previews of cases still being prepared by the archive.
      </PortalHeading>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
      <Suspense fallback={null}>
        <TestingZone />
      </Suspense>
    </>
  );
}

async function Catalog() {
  const [catalog, mine, failed] = await Promise.all([getCatalog(), viewerCaseStates().catch(() => ({})), viewerFailures().catch(() => ({}))]);
  if (!catalog.ok) return <SetupNotice reason={catalog.reason} message={catalog.message} />;
  // Series cases are shown in their series, in order, rather than as loose cards.
  const series = catalog.data.filter((c) => c.series_id);
  // A seasonal case in its month (HALLOW001 in October) is featured at the top. Today's date is read at request time.
  await connection();
  const featured = catalog.data.filter((c) => !c.series_id && c.available_month && inSeason(c)).map((c) => c.id);
  return (
    <>
      <CatalogBrowser cases={catalog.data.filter((c) => !c.series_id)} hrefBase="/agency/assignments" leaderboards mine={mine} failed={failed} featured={featured} />
      <SeriesShelf catalog={series} hrefBase="/agency/assignments" boardLink />
    </>
  );
}
