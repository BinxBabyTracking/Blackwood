import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalHeading } from "@/components/portal/heading";
import { EmptyFile, LoadingFile } from "@/components/ui";
import { getSettings, requireInvestigator } from "@/lib/investigator";
import { AccessibilityForm, AudioForm, EmailForm, NotificationsForm, PasswordForm } from "./settings-forms";

export const metadata: Metadata = { title: "Agency Settings" };

export default function SettingsPage() {
  return (
    <>
      <PortalHeading title="Agency Settings">Account, sound, accessibility and notices. Each section saves on its own.</PortalHeading>
      <Suspense fallback={<LoadingFile label="Retrieving settings" />}>
        <Settings />
      </Suspense>
    </>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-rule py-10 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_1fr]">
      <div>
        <h2 id={id} className="font-serif text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-smoke">{intro}</p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

async function Settings() {
  const me = await requireInvestigator();
  const settings = await getSettings(me.id);

  return (
    <div>
      <Section id="account" title="Account" intro="Your sign-in email and password. Profile details live in your Personnel File.">
        <div className="space-y-10">
          <EmailForm current={me.email} />
          <PasswordForm />
          <p className="text-sm text-smoke">
            Display name, photo and investigation preference are edited in your{" "}
            <a href="/agency/personnel" className="text-brass underline-offset-4 hover:underline">
              Personnel File
            </a>
            .
          </p>
        </div>
      </Section>

      {settings ? (
        <>
          <Section id="audio" title="Audio" intro="Levels for investigations. They take effect when the investigation desk opens.">
            <AudioForm settings={settings} />
          </Section>
          <Section id="accessibility" title="Accessibility" intro="Applied across the agency portal as soon as you save.">
            <AccessibilityForm settings={settings} />
          </Section>
          <Section id="notifications" title="Notifications" intro="Choose which agency messages you want to receive.">
            <NotificationsForm settings={settings} />
          </Section>
        </>
      ) : (
        <EmptyFile title="No settings record exists for this account.">
          Settings are created when an account is registered. Run the database migrations, then create a new account, or
          insert a row into <code className="font-mono">user_settings</code> for this user.
        </EmptyFile>
      )}
    </div>
  );
}
