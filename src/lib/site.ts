import "server-only";
import { headers } from "next/headers";

/** Absolute origin used to build auth email links. */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only allow same-site relative redirects. */
export function safeNext(value: unknown, fallback = "/agency") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
