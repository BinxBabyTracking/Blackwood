import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-4xl">Sign In</h1>
      <p className="mt-3 text-smoke">Report to Agency Headquarters.</p>
      {!isSupabaseConfigured ? (
        <div className="mt-8">
          <SetupNotice compact />
        </div>
      ) : null}
      <Suspense fallback={<div className="mt-8 h-72" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-sm text-smoke">
        New to the agency?{" "}
        <Link href="/join" className="text-brass underline-offset-4 hover:underline">
          Join the Agency
        </Link>
      </p>
    </>
  );
}
