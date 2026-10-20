import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-file)] px-5 py-2.5 text-sm font-semibold tracking-[0.01em] transition-[background-color,border-color,color] duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brass text-ink hover:bg-[#d4b585] active:bg-brass-dim",
  secondary: "border border-rule text-paper hover:border-brass hover:text-brass",
  quiet: "px-0 py-0 text-brass underline-offset-4 hover:underline",
  danger: "border border-fault/70 text-[#e2a7a2] hover:bg-fault/15",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}

/** Case numbers, timestamps and evidence identifiers. */
export function Ref({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-[0.8125rem] tracking-wide text-smoke ${className}`}>{children}</span>;
}

export function SectionHeading({
  title,
  intro,
  as: Tag = "h2",
  className = "",
}: {
  title: string;
  intro?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={className}>
      <Tag className="font-display text-3xl leading-tight text-paper sm:text-4xl">{title}</Tag>
      {intro ? <p className="mt-3 max-w-[60ch] text-smoke">{intro}</p> : null}
    </div>
  );
}

const tone = {
  ok: "text-[color:var(--color-ok)] border-[color:var(--color-ok)]",
  caution: "text-caution border-caution",
  fault: "text-fault border-fault",
  muted: "text-smoke border-rule",
  brass: "text-brass border-brass/60",
} as const;

export function Tag({ children, tone: t = "muted" }: { children: ReactNode; tone?: keyof typeof tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 text-xs font-medium ${tone[t]}`}>
      {children}
    </span>
  );
}

/** Polished empty state: tells the investigator what to do next. */
export function EmptyFile({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-file)] border border-dashed border-rule bg-ink-2/60 px-6 py-10 sm:px-10">
      <div className="max-w-[52ch]">
        <p className="font-serif text-xl text-paper">{title}</p>
        <div className="mt-2 text-smoke">{children}</div>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
      <svg aria-hidden className="absolute -right-6 -bottom-8 hidden h-40 w-40 text-rule/60 sm:block" viewBox="0 0 100 100" fill="none">
        <path d="M10 30h28l6 6h46v50H10z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 42h80" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-file)] border border-rule bg-ink-2 ${className}`}>{children}</section>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-[2px] bg-card ${className}`} />;
}

export function LoadingFile({ label = "Retrieving file" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
