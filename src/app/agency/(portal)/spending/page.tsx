import { redirect } from "next/navigation";

/** The Spending page now lives on the Admin page. */
export default function SpendingRedirect() {
  redirect("/agency/admin");
}
