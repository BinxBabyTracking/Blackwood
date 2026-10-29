import "server-only";
import { headers } from "next/headers";

/** Absolute origin used to build auth email links. */
export async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  // A localhost address left in the live site's settings would send emailed links (password resets,
  // confirmations) to localhost: on a real host, use the address the request came in on instead.
  if (env && !(/\/\/(localhost|127\.)/.test(env) && !/^(localhost|127\.)/.test(host))) return env;
  return `${proto}://${host}`;
}

/** Only allow same-site relative redirects. */
export function safeNext(value: unknown, fallback = "/agency") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
