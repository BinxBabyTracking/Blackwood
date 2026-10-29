import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/legal-page";
import { MIN_AGE, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <div>
        <p>
          This policy explains what personal information Blackwood Investigations (&quot;Blackwood&quot;, &quot;we&quot;), operated by {OPERATOR}, collects, why, who
          it is shared with, and the choices you have. We collect only what we need to run the game. We do not sell your personal information and we do not
          use it for advertising.
        </p>
      </div>

      <div>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> your email address and password. Passwords are stored only in scrambled (hashed) form by our sign-in provider; nobody at
            Blackwood can see them.
          </li>
          <li>
            <strong>Profile and settings:</strong> the display name, photo and play style you choose, your rank and awards, notification choices, sound and
            accessibility settings, and, if you give one, a separate address for new-case emails.
          </li>
          <li>
            <strong>Play:</strong> your progress in each case, including the questions you ask characters, your notes, your murder board and report answers,
            when you played and for how long.
          </li>
          <li>
            <strong>Voice questions:</strong> if you hold the microphone button, that short recording is sent to be turned into text. We keep the text as one
            of your questions; we do not keep the recording.
          </li>
          <li>
            <strong>What you send us:</strong> reviews, feedback and bug reports. A bug report includes where you were in the case and the last few lines of
            your most recent interview, so we can find the problem.
          </li>
          <li>
            <strong>Purchases:</strong> what you bought and when. Card details are entered with our payment processor and never reach or are stored by
            Blackwood.
          </li>
          <li>
            <strong>Joint investigations:</strong> the name a guest types to join. Guests do not give an email address.
          </li>
          <li>
            <strong>Technical:</strong> what your browser and our servers record to run and secure the site, such as IP address, device and browser type, and
            error logs. We do not use advertising or tracking cookies.
          </li>
        </ul>
      </div>

      <div>
        <h2>How we use it</h2>
        <ul>
          <li>to create your account, sign you in and keep it secure;</li>
          <li>to run the game: save progress, answer your questions in character, and keep the cost of each playthrough in check;</li>
          <li>to show your name on leaderboards and in joint investigations, when you choose to;</li>
          <li>to process purchases and early access requests;</li>
          <li>to send account emails (confirmations, password resets) and, only if you opt in, agency announcements and new-case emails;</li>
          <li>to screen names other players can see for offensive language;</li>
          <li>to fix problems and improve cases, using feedback and overall play patterns.</li>
        </ul>
      </div>

      <div>
        <h2>Who we share it with</h2>
        <p>Only the services that run Blackwood for us, each limited to what it needs:</p>
        <ul>
          <li><strong>Supabase:</strong> sign-in, the database that stores accounts and saves, and file storage.</li>
          <li><strong>Vercel:</strong> hosting the website.</li>
          <li>
            <strong>Anthropic (Claude):</strong> the questions you ask characters, with the case details they need, to write in-character answers; names
            entered for screening. Answers to common questions may be saved and reused for other players, without anything that identifies you.
          </li>
          <li><strong>ElevenLabs:</strong> turning your voice questions into text, and generating character voices.</li>
          <li><strong>Our payment processor:</strong> taking payment when you buy something.</li>
          <li><strong>Our email provider:</strong> sending account and opt-in emails.</li>
        </ul>
        <p>
          Other players see only what you choose to show them: your display name and photo in joint investigations, and the name you put on a leaderboard. We
          may also share information if the law requires it, to protect people from harm, or as part of a transfer of Blackwood to a new owner, who would be
          bound by this policy.
        </p>
      </div>

      <div>
        <h2>Cookies and local storage</h2>
        <p>
          We use cookies only to keep you signed in and secure. Your browser also stores small settings on your device, such as volume, whether you have seen a
          tip, and how your desk is arranged. None of these are used to track you across other sites.
        </p>
      </div>

      <div>
        <h2>How long we keep it</h2>
        <p>
          We keep your account and play history while your account is open. When you ask us to delete your account, we delete it and your saves within 30
          days, except for records we must keep for tax, payment or legal reasons, and anonymous usage totals. Feedback may be kept without your name attached.
        </p>
      </div>

      <div>
        <h2>Your choices and rights</h2>
        <ul>
          <li>Change your profile, notifications and new-case emails at any time in Agency Settings.</li>
          <li>Remove your name from any leaderboard from that leaderboard.</li>
          <li>
            Ask for a copy of your information, for a correction, or for your account to be deleted: <ContactLine />. We will answer within 30 days.
          </li>
        </ul>
        <p>
          Depending on where you live (for example California or the European Union), you may have further rights under privacy law, such as to object to or
          limit how we use your information or to complain to a regulator. We will honor them; contact us as above.
        </p>
      </div>

      <div>
        <h2>Age</h2>
        <p>
          Blackwood is for people aged {MIN_AGE} and over. We do not knowingly collect information from anyone younger. If you believe a child under {MIN_AGE}{" "}
          has an account, contact us and we will delete it.
        </p>
      </div>

      <div>
        <h2>Security and location</h2>
        <p>
          Your information is stored and processed in the United States. We use encrypted connections, restricted access and hashed passwords to protect it,
          but no system is perfectly secure; keep your password private and unique.
        </p>
      </div>

      <div>
        <h2>Changes</h2>
        <p>
          If we change this policy in a significant way, we will update the date above and ask you to accept the new version the next time you sign in.
        </p>
      </div>

      <div>
        <h2>Contact</h2>
        <p>
          Questions or requests about your privacy? <ContactLine />.
        </p>
      </div>
    </LegalPage>
  );
}
