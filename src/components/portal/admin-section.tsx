"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A collapsible Admin section. Click the heading to open or close it; each
 * section remembers whether it was open on this device.
 */
export function AdminSection({
  id,
  title,
  defaultOpen = false,
  className = "",
  children,
}: {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const key = `bw-admin-${id}`;
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDetailsElement>(null);
  // Restore the saved choice after the first render, so the server and browser agree on the initial page.
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v !== null) setOpen(v === "1");
    } catch {
      /* storage unavailable: use the default */
    }
  }, [key]);

  return (
    <details
      ref={ref}
      open={open}
      onToggle={(e) => {
        const now = (e.currentTarget as HTMLDetailsElement).open;
        if (now === open) return;
        setOpen(now);
        try {
          localStorage.setItem(key, now ? "1" : "0");
        } catch {
          /* not remembered */
        }
      }}
      className="group border-t border-rule pt-4"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 font-serif text-xl text-smoke hover:text-paper [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block w-3 font-mono text-sm text-brass transition-transform group-open:rotate-90">
          ›
        </span>
        <h2 id={id} className="font-serif text-xl">
          {title}
        </h2>
      </summary>
      <div className={`mt-3 ${className}`}>{children}</div>
    </details>
  );
}
