"use client";

import { Children, useEffect, useState } from "react";

/**
 * Shows one featured assignment at a time and moves to the next every few
 * seconds (paused while the pointer or focus is on it), with dots to pick one.
 * The slides are rendered on the server and passed in as children.
 */
export function FeaturedRotator({ children, labels, interval = 9000 }: { children: React.ReactNode; labels: string[]; interval?: number }) {
  const slides = Children.toArray(children);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, paused, interval]);
  if (slides.length === 0) return null;
  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, n) => (
        <div key={n} hidden={n !== i} aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}: ${labels[n] ?? ""}`} className={n === i ? "game-fade" : ""}>
          {s}
        </div>
      ))}
      {slides.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Show ${labels[n] ?? `assignment ${n + 1}`}`}
              aria-current={n === i}
              onClick={() => setI(n)}
              className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-brass" : "w-2 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
