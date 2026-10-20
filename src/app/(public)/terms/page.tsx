import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <div>
        <h2>Fictional entertainment</h2>
        <p>
          Blackwood Investigations is interactive fiction. It is not a licensed private investigation agency and provides
          no investigative, legal or security services. Names, characters and events are invented.
        </p>
      </div>
      <div>
        <h2>Your account</h2>
        <p>Keep your sign-in details private. You are responsible for activity on your account.</p>
      </div>
      <div>
        <h2>Conduct</h2>
        <p>Choose a display name and photo that are appropriate for other investigators to see in joint investigations.</p>
      </div>
      <div>
        <h2>Purchases</h2>
        <p>Paid cases are not on sale yet. Terms for purchases will be added before any payment is taken.</p>
      </div>
    </LegalPage>
  );
}
