import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { SeriesShelf } from "@/components/series-shelf";
import { PortalHeading } from "@/components/portal/heading";
import { SetupNotice } from "@/components/setup-notice";
import { getCatalog } from "@/lib/catalog";
import { viewerCaseStates } from "@/lib/viewer-cases";

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
    </>
  );
}

async function Catalog() {
  const [catalog, mine] = await Promise.all([getCatalog(), viewerCaseStates().catch(() => ({}))]);
  if (!catalog.ok) return <SetupNotice reason={catalog.reason} message={catalog.message} />;
  // Series cases are shown in their series, in order, rather than as loose cards.
  const series = catalog.data.filter((c) => c.series_id);
  return (
    <>
      <CatalogBrowser cases={catalog.data.filter((c) => !c.series_id)} hrefBase="/agency/assignments" leaderboards mine={mine} />
      <SeriesShelf catalog={series} hrefBase="/agency/assignments" boardLink />
    </>
  );
}
