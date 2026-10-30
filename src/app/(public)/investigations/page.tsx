import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageIntro } from "@/components/page-intro";
import { SetupNotice } from "@/components/setup-notice";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { SeriesShelf } from "@/components/series-shelf";
import { getCatalog } from "@/lib/catalog";
import { viewerCaseStates, viewerFailures } from "@/lib/viewer-cases";
import { inSeason } from "@/lib/season";

export const metadata: Metadata = { title: "Available Investigations" };

export default function InvestigationsPage() {
  return (
    <>
      <PageIntro title="Available Investigations" kicker="The case archive">
        Every file the agency is preparing for assignment. Sealed files are previews of what is coming and cannot be
        accepted yet.
      </PageIntro>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog />
        </Suspense>
      </section>
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
      <CatalogBrowser cases={catalog.data.filter((c) => !c.series_id)} hrefBase="/investigations" leaderboards mine={mine} failed={failed} featured={featured} />
      <SeriesShelf catalog={series} hrefBase="/investigations" />
    </>
  );
}
