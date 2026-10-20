import { Skeleton } from "./ui";

export function CatalogSkeleton() {
  return (
    <div className="space-y-6" role="status">
      <span className="sr-only">Loading the case archive</span>
      <Skeleton className="h-20" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  );
}
