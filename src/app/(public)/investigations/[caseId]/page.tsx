import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaseFile } from "@/components/case-file";
import { SetupNotice } from "@/components/setup-notice";
import { LoadingFile } from "@/components/ui";
import { getCase } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/investigations/[caseId]">) {
  const { caseId } = await params;
  const result = await getCase(caseId);
  const c = result.ok ? result.data : null;
  return { title: c ? `${c.id}: ${c.title}` : "Case file" };
}

export default function CaseFilePage({ params }: PageProps<"/investigations/[caseId]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-40 sm:px-8">
          <LoadingFile label="Retrieving case file" />
        </div>
      }
    >
      <CaseFileLoader params={params} />
    </Suspense>
  );
}

async function CaseFileLoader({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const result = await getCase(caseId);
  if (!result.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-40 sm:px-8">
        <SetupNotice reason={result.reason} message={result.message} />
      </div>
    );
  }
  if (!result.data) notFound();
  return (
    <>
      <CaseFile c={result.data} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <Link href="/investigations" className="text-sm text-brass underline-offset-4 hover:underline">
          Back to Available Investigations
        </Link>
      </div>
    </>
  );
}
