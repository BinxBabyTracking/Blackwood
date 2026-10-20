import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageIntro } from "@/components/page-intro";
import { SetupNotice } from "@/components/setup-notice";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { getCatalog } from "@/lib/catalog";

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
  const catalog = await getCatalog();
  if (!catalog.ok) return <SetupNotice reason={catalog.reason} message={catalog.message} />;
  return <CatalogBrowser cases={catalog.data} hrefBase="/investigations" />;
}
