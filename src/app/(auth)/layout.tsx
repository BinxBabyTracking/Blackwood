import { Seal, Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(28rem,36rem)]">
      <aside className="relative hidden overflow-hidden border-r border-rule lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_70%,rgba(198,164,114,0.22),transparent_70%),linear-gradient(160deg,#1f2831,#0e1217)]" />
        <div
          className="absolute -inset-[20%] opacity-[0.1]"
          style={{
            transform: "rotate(-14deg)",
            backgroundImage: "repeating-linear-gradient(180deg, #dfe4e8 0 22px, transparent 22px 44px)",
            maskImage: "radial-gradient(60% 50% at 40% 40%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(60% 50% at 40% 40%, black, transparent 75%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Wordmark />
          <div className="max-w-md">
            <Seal className="h-14 w-14 text-brass/70" />
            <p className="mt-8 font-display text-4xl leading-tight text-paper">Every Case Has a Truth.</p>
            <p className="mt-4 font-mono text-sm text-smoke">Private Investigative Services, est. 1978</p>
          </div>
        </div>
      </aside>
      <main id="main" className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="my-auto w-full max-w-sm py-12 lg:mx-auto">{children}</div>
        <p className="text-xs text-smoke">Blackwood Investigations is a fictional agency. Its cases are drawn from real investigations, with identities changed.</p>
      </main>
    </div>
  );
}
