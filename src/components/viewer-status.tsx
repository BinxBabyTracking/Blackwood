import { STATUS_LABELS } from "@/lib/format";
import type { CatalogCase } from "@/lib/types";
import { viewerCaseStates } from "@/lib/viewer-cases";
import { StatusTag } from "./case-card";

const WORDS = { available: "Available", open: "Open", solved: "Solved" } as const;

/** The case's status tag as the signed-in investigator sees it. Reads the session, so render inside <Suspense> with a plain <StatusTag> fallback. */
export async function ViewerStatusTag({ c }: { c: CatalogCase }) {
  const mine = (await viewerCaseStates().catch(() => ({})) as Record<string, keyof typeof WORDS>)[c.id];
  return <StatusTag c={c} mine={mine} />;
}

/** The Availability line on a case page, as the signed-in investigator sees it. */
export async function ViewerAvailability({ c }: { c: CatalogCase }) {
  if (c.is_preview) return <>Preview only</>;
  const mine = (await viewerCaseStates().catch(() => ({})) as Record<string, keyof typeof WORDS>)[c.id];
  return <>{mine ? WORDS[mine] : STATUS_LABELS[c.status]}</>;
}
