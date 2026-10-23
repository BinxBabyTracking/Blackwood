import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortalHeading } from "@/components/portal/heading";
import { LoadingFile } from "@/components/ui";
import { loadCase } from "@/game/registry";
import { hasReviewed } from "@/lib/feedback";
import { getCaseFiles, requireInvestigator } from "@/lib/investigator";
import { CaseReview } from "./case-review";

export const metadata: Metadata = { title: "Case Review" };

export default function ReviewPage({ params }: PageProps<"/agency/review/[caseId]">) {
  return (
    <Suspense fallback={<LoadingFile label="Opening the file" />}>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({ params }: { params: Promise<{ caseId: string }> }) {
  const me = await requireInvestigator();
  const { caseId } = await params;
  const def = loadCase(caseId);
  if (!def) notFound();
  const [files, reviewed] = await Promise.all([getCaseFiles(me.id), hasReviewed(me.id, def.id)]);
  const closed = files.some((f) => f.case_id === def.id && f.status === "closed");
  return (
    <>
      <PortalHeading title="File your case review">
        <span className="font-mono text-brass">{def.id}</span> {def.title}
      </PortalHeading>
      {!closed ? (
        <p className="text-smoke">You can review a case once you have closed it.</p>
      ) : reviewed ? (
        <p className="text-smoke">
          You have already reviewed this case. Thank you.{" "}
          <Link href="/agency/cases" className="text-brass underline-offset-4 hover:underline">
            Back to My Case Files
          </Link>
        </p>
      ) : (
        <div className="max-w-xl">
          <CaseReview caseId={def.id} />
        </div>
      )}
    </>
  );
}
