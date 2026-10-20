"use client";

import { useSyncExternalStore } from "react";

function partOfDay(h: number) {
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const noop = () => () => {};

/** Greets by the investigator's own local time, so the salutation is computed in the browser. */
export function Greeting({ name }: { name: string | null }) {
  const salutation = useSyncExternalStore(
    noop,
    () => partOfDay(new Date().getHours()),
    () => null,
  );
  const who = name ? `Detective ${name}` : "Detective";
  return (
    <h1 className="font-display text-4xl leading-tight sm:text-5xl">
      {salutation ? `${salutation}, ${who}.` : `Welcome back, ${who}.`}
    </h1>
  );
}
