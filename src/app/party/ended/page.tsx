import type { Metadata } from "next";
import Link from "next/link";
import { PartyFrame } from "../party-ui";

export const metadata: Metadata = { title: "Investigation ended", robots: { index: false } };

export default function EndedPage() {
  return (
    <PartyFrame title="The joint investigation has ended.">
      <p>The host closed it. Everything you found stays in their case file.</p>
      <Link href="/" className="inline-block text-sm text-brass underline-offset-4 hover:underline">
        Blackwood Investigations
      </Link>
    </PartyFrame>
  );
}
