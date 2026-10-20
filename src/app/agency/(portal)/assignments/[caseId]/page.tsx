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

const ACCEPT_ERRORS: Record<string, string> = {
  accept_failed: "The assignment could not be accepted. Check that the case is open and that SUPABASE_SECRET_KEY is set on the server.",
  not_playable: "This case does not have an investigation desk yet.",
  error: "Something went wrong accepting the assignment. Try again.",
};

export default function AssignmentPage({ params, searchParams }: PageProps<"/agency/assignments/[caseId]">) {
  return (
    <Suspense fallback={<LoadingFile label="Retrieving case file" />}>
      <Loader params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Loader({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ caseId }, query] = await Promise.all([params, searchParams]);
  const acceptError = typeof query.error === "string" ? ACCEPT_ERRORS[query.error] : undefined;
  const result = await getCase(caseId);
  if (!result.ok) return <SetupNotice reason={result.reason} message={result.message} />;
  if (!result.data) notFound();
  return (
    <>
      <Link href="/agency/assignments" className="mb-6 inline-block text-sm text-brass underline-offset-4 hover:underline">
        Back to Available Assignments
      </Link>
      {acceptError ? (
        <p role="alert" className="mb-6 rounded-[var(--radius-file)] border border-fault/60 bg-fault/10 px-4 py-3 text-sm">
          {acceptError}
        </p>
      ) : null}
      <div className="-mx-4 overflow-hidden border-y border-rule sm:mx-0 sm:rounded-[var(--radius-file)] sm:border">
        <CaseFile c={result.data} topPadding={false} />
      </div>
    </>
  );
}
