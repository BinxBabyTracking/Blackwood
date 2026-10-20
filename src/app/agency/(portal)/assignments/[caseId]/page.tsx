import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaseFile } from "@/components/case-file";
import { SetupNotice } from "@/components/setup-notice";
import { LoadingFile } from "@/components/ui";
import { getCase } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/agency/assignments/[caseId]">) {
  const { caseId } = await params;
  const result = await getCase(caseId);
  const c = result.ok ? result.data : null;
  return { title: c ? `${c.id}: ${c.title}` : "Assignment" };
}

export default function AssignmentPage({ params }: PageProps<"/agency/assignments/[caseId]">) {
  return (
    <Suspense fallback={<LoadingFile label="Retrieving case file" />}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const result = await getCase(caseId);
  if (!result.ok) return <SetupNotice reason={result.reason} message={result.message} />;
  if (!result.data) notFound();
  return (
    <>
      <Link href="/agency/assignments" className="mb-6 inline-block text-sm text-brass underline-offset-4 hover:underline">
        Back to Available Assignments
      </Link>
      <div className="-mx-4 overflow-hidden border-y border-rule sm:mx-0 sm:rounded-[var(--radius-file)] sm:border">
        <CaseFile c={result.data} topPadding={false} />
      </div>
    </>
  );
}
