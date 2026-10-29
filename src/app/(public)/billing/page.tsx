import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/legal-page";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Billing and Refunds" };

export default function BillingPage() {
  return (
    <LegalPage title="Billing and Refunds">
      <div>
        <p>
          This policy covers what you can buy at Blackwood Investigations, operated by {OPERATOR}, and when we give refunds. It is part of the{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </div>

      <div>
        <h2>What you can buy</h2>
        <ul>
          <li>
            <strong>Cases.</strong> Some cases are free. Others are bought once, for a one-time price shown on the case. A bought case stays on your account
            for as long as Blackwood offers it; there is no subscription.
          </li>
          <li>
            <strong>Replays.</strong> You can play a case you own again at no charge for as long as you still have interview questions left for it.
          </li>
          <li>
            <strong>Fresh file.</strong> Restarting a case as new, with its interview question allowance restored, is a separate purchase, priced on the
            case.
          </li>
          <li>
            <strong>Interview questions in Hardcore mode.</strong> In Hardcore mode, extra questions with a character can be bought in packs. They are used up
            as you ask them, apply to the case they were bought for, and have no cash value.
          </li>
          <li>
            <strong>Early access.</strong> Some cases can be played before release by approved players. Early access is a privilege we grant, not a purchase,
            and may change as the case is finished.
          </li>
        </ul>
      </div>

      <div>
        <h2>Prices and payment</h2>
        <ul>
          <li>Prices are in US dollars and are shown before you pay. Any sales tax that applies is added at checkout.</li>
          <li>Payments are taken by our payment processor. Blackwood never sees or stores your full card details.</li>
          <li>You must be 18, or have a parent or guardian&apos;s permission, to make a purchase.</li>
          <li>We may change prices for future purchases. A price change never affects something you have already bought.</li>
          <li>Seasonal cases you own can be started during their season, and investigations already under way can always be finished.</li>
        </ul>
      </div>

      <div>
        <h2>Refunds</h2>
        <p>We want you to be happy with what you buy. We will refund a purchase when:</p>
        <ul>
          <li>you bought a case by mistake and ask within 14 days, before starting it;</li>
          <li>a case or item you bought cannot be played because of a fault on our side that we cannot fix within a reasonable time;</li>
          <li>you were charged twice or charged in error;</li>
          <li>the law where you live requires it.</li>
        </ul>
        <p>
          Interview questions that have been used, and a fresh file once the restarted case has been opened, cannot be refunded. To ask for a refund, <ContactLine />{" "}
          with the email on your account and what you bought. Approved refunds go back to the original payment method, usually within 5 to 10 business days.
        </p>
      </div>

      <div>
        <h2>Chargebacks</h2>
        <p>
          If something is wrong with a charge, please contact us first; we can usually fix it faster than your bank. If a payment is disputed or reversed, the
          content it paid for may be removed from your account while the dispute is open.
        </p>
      </div>

      <div>
        <h2>If Blackwood closes</h2>
        <p>
          If we ever close Blackwood or stop offering a case you bought, we will give reasonable notice where we can and, for a case bought within the previous
          90 days that you have not finished, offer a refund.
        </p>
      </div>
    </LegalPage>
  );
}
