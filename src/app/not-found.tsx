import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm tracking-[0.14em] text-brass">FILE NOT FOUND</p>
        <h1 className="mt-4 font-display text-5xl">No record of that file.</h1>
        <p className="mt-4 text-smoke">The page you asked for is not in the archive. Check the address or return to the front desk.</p>
        <Link href="/" className={buttonClass("secondary", "mt-8")}>
          Return home
        </Link>
      </div>
    </main>
  );
}
