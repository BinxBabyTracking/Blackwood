import type { ReactNode } from "react";

export function PortalHeading({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
      <div>
        <h1 className="font-display text-4xl leading-tight sm:text-[2.75rem]">{title}</h1>
        {children ? <div className="mt-2 max-w-[62ch] text-smoke">{children}</div> : null}
      </div>
      {actions}
    </div>
  );
}

/** Ruled ledger of figures. Reads like a record sheet rather than a row of tiles. */
export function Ledger({ items, cols = 4 }: { items: { label: string; value: ReactNode; note?: string }[]; cols?: 3 | 4 }) {
  return (
    <dl className={`grid grid-cols-2 gap-px border-y border-rule bg-rule ${cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {items.map((it) => (
        <div key={it.label} className="bg-ink px-1 py-5 sm:px-5">
          <dt className="text-xs text-smoke">{it.label}</dt>
          <dd className="mt-2 font-serif text-2xl text-paper">{it.value}</dd>
          {it.note ? <dd className="mt-1 text-xs text-smoke">{it.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
