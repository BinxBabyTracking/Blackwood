import type { Metadata } from "next";
import Link from "next/link";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Join the Agency" };

export default function JoinPage() {
  return (
    <>
      <h1 className="font-display text-4xl">Join the Agency</h1>
      <p className="mt-3 text-smoke">Create your account. You will set up your detective profile next.</p>
      {!isSupabaseConfigured ? (
        <div className="mt-8">
          <SetupNotice compact />
        </div>
      ) : null}
      <JoinForm />
      <p className="mt-8 text-sm text-smoke">
        Already with the agency?{" "}
        <Link href="/login" className="text-brass underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
