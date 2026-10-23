"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReviewForm } from "@/game/ui/feedback-forms";

export function CaseReview({ caseId }: { caseId: string }) {
  const [sent, setSent] = useState(false);
  const router = useRouter();
  if (sent)
    return (
      <div role="status">
        <p className="font-serif text-2xl">Review filed. Thank you.</p>
        <Link href="/agency/cases" className="mt-4 inline-block text-brass underline-offset-4 hover:underline">
          Back to My Case Files
        </Link>
      </div>
    );
  return <ReviewForm caseId={caseId} onDone={() => setSent(true)} onSkip={() => router.push("/agency/cases")} skipLabel="Cancel" />;
}
