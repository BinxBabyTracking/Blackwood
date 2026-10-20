/** Shown wherever live data is needed but the backend is not reachable. */
export function SetupNotice({
  reason = "not_configured",
  message,
  compact = false,
}: {
  reason?: "not_configured" | "error";
  message?: string;
  compact?: boolean;
}) {
  const configured = reason !== "not_configured";
  return (
    <div
      role="note"
      className={`rounded-[var(--radius-file)] border border-caution/60 bg-caution/10 text-paper ${compact ? "p-4 text-sm" : "p-6"}`}
    >
      <p className="font-semibold text-caution">
        {configured ? "The case archive could not be reached" : "Backend setup required"}
      </p>
      {configured ? (
        <p className="mt-1 text-smoke">
          Supabase returned an error{message ? `: ${message}` : "."} Check that both migrations in{" "}
          <code className="font-mono text-paper">supabase/migrations</code> have been run.
        </p>
      ) : (
        <p className="mt-1 text-smoke">
          Add <code className="font-mono text-paper">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-paper">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
          <code className="font-mono text-paper">.env.local</code>, run the SQL in{" "}
          <code className="font-mono text-paper">supabase/migrations</code>, then restart the server. See README.md.
        </p>
      )}
    </div>
  );
}
