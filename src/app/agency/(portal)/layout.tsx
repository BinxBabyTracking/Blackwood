import Link from "next/link";
import { Suspense } from "react";
import { MobileNav, SideNav } from "@/components/portal/nav";
import { NoticesMenu } from "@/components/portal/notices-menu";
import { PreferenceApplier } from "@/components/portal/preferences";
import { Avatar } from "@/components/portal/avatar";
import { getNotices } from "@/lib/catalog";
import { getSettings, requireInvestigator } from "@/lib/investigator";
import { FullScreenButton } from "@/game/ui/full-screen";
import { TermsGate } from "@/components/portal/terms-gate";
import { LEGAL_UPDATED, LEGAL_VERSION, MIN_AGE } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";

export default function PortalLayout({ children }: LayoutProps<"/agency">) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <header className="sticky top-0 z-30 border-b border-rule bg-ink/90 backdrop-blur-md">
          <div className="relative flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
            {/* Full screen: in the middle of the bar on wide screens, an icon beside the others on narrower ones. */}
            <FullScreenButton className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:inline-flex" />
            <div className="flex min-w-0 items-center gap-3">
              <MobileNav />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-display text-[0.8rem] tracking-[0.12em] text-paper sm:text-base sm:tracking-[0.16em]">BLACKWOOD<span className="hidden sm:inline"> INVESTIGATIONS</span></p>
                <p className="hidden text-xs text-smoke sm:block">Private Investigative Services | Est. 1978</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <FullScreenButton compact className="hidden sm:inline-flex xl:hidden" />
              <Suspense fallback={<NoticesMenu notices={[]} />}>
                <Notices />
              </Suspense>
              <Suspense fallback={<span className="mx-2 h-8 w-8 rounded-[2px] bg-card" aria-hidden />}>
                <ProfileChip />
              </Suspense>
              <Link href="/agency/settings" className="hidden rounded-[2px] p-2 text-smoke hover:text-paper sm:inline-flex">
                <span className="sr-only">Agency Settings</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
                </svg>
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="ml-1 whitespace-nowrap rounded-[2px] border border-rule px-2.5 py-1.5 text-xs text-smoke hover:border-brass hover:text-brass">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <Suspense fallback={null}>
          <Preferences />
        </Suspense>
        <Suspense fallback={null}>
          <Terms />
        </Suspense>
      </div>
    </div>
  );
}

async function Notices() {
  const notices = await getNotices();
  return <NoticesMenu notices={notices.ok ? notices.data : []} unavailable={!notices.ok} />;
}

async function ProfileChip() {
  // Also the portal's onboarding gate: recruits without a personnel file are sent to intake.
  const me = await requireInvestigator();
  return (
    <Link href="/agency/personnel" className="flex items-center gap-2.5 rounded-[2px] px-2 py-1 hover:bg-card">
      <Avatar name={me.profile.display_name} url={me.profile.avatar_url} size={30} />
      <span className="hidden max-w-[10rem] truncate text-sm text-paper md:inline">{me.profile.display_name ?? "Detective"}</span>
      <span className="sr-only md:hidden">Personnel File</span>
    </Link>
  );
}

async function Preferences() {
  const me = await requireInvestigator(true);
  const settings = await getSettings(me.id);
  return <PreferenceApplier prefs={settings} />;
}

/** Asks an account that hasn't accepted the current terms to accept them. */
async function Terms() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return null;
  const accepted = (user.user_metadata as { terms_version?: string } | null)?.terms_version;
  if (accepted === LEGAL_VERSION) return null;
  return <TermsGate minAge={MIN_AGE} updated={LEGAL_UPDATED} changed={Boolean(accepted)} />;
}
