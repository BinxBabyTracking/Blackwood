import type { Metadata } from "next";
import Link from "next/link";
import { leaveParty } from "@/app/actions/party";
import { buttonClass } from "@/components/ui";
import { PartyFrame } from "../party-ui";

export const metadata: Metadata = { title: "Leave the investigation", robots: { index: false } };

export default function LeavePage() {
  return (
    <PartyFrame title="Leave the joint investigation?">
      <p>Everything you found stays in the host&apos;s case file. You can scan the code again to rejoin.</p>
      <form action={leaveParty}>
        <button type="submit" className={buttonClass("primary", "w-full justify-center")}>
          Leave
        </button>
      </form>
      <Link href="/party/play" className="inline-block text-sm underline-offset-4 hover:text-paper hover:underline">
        Back to the investigation
      </Link>
    </PartyFrame>
  );
}
