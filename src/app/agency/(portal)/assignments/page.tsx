import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { PortalHeading } from "@/components/portal/heading";
import { SetupNotice } from "@/components/setup-notice";
import { getCatalog } from "@/lib/catalog";

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
  const catalog = await getCatalog();
  if (!catalog.ok) return <SetupNotice reason={catalog.reason} message={catalog.message} />;
  return <CatalogBrowser cases={catalog.data} hrefBase="/agency/assignments" />;
}
