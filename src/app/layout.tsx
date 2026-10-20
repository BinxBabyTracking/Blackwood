import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Blackwood Investigations",
    template: "%s | Blackwood Investigations",
  },
  description:
    "Every case has a truth. Join Blackwood Investigations, a fictional private investigative agency, and work through unsolved cases as a newly recruited investigator.",
};

export const viewport: Viewport = {
  themeColor: "#12171D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
