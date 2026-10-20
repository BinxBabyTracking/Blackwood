import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <div>
        <h2>What we collect</h2>
        <p>
          Your email address and password (stored by our authentication provider), the detective display name, photo and
          investigation preference you choose, your settings, and records of the cases you play.
        </p>
      </div>
      <div>
        <h2>How it is used</h2>
        <p>
          To sign you in, show your personnel file and service record, save your progress and, if you opt in, send agency
          announcements and joint investigation invitations.
        </p>
      </div>
      <div>
        <h2>Where it is stored</h2>
        <p>Account and game data are stored with Supabase. Access to your records is restricted to your own account.</p>
      </div>
      <div>
        <h2>Your choices</h2>
        <p>You can change your profile and notification preferences at any time from Agency Settings.</p>
      </div>
    </LegalPage>
  );
}
