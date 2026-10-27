"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Props for a modal's dimmed backdrop: clicking or tapping it, off the panel,
 * closes the modal. Only a press that starts and ends on the backdrop counts,
 * so selecting text inside the panel and releasing outside does not close it.
 */
export function useBackdropClose(onClose: () => void) {
  const down = useRef(false);
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      down.current = e.target === e.currentTarget;
    },
    onClick: (e: { target: EventTarget; currentTarget: EventTarget }) => {
      if (down.current && e.target === e.currentTarget) onClose();
      down.current = false;
    },
  };
}

/**
 * Modal layer used by every in-case panel. Traps focus loosely (focuses the
 * panel on open), closes on Escape, and keeps the scene visible but dimmed.
 */
export function Overlay({
  title,
  onClose,
  children,
  wide = false,
  tone = "dark",
  closeLabel = "Return to scene",
  full = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  tone?: "dark" | "paper";
  closeLabel?: string;
  full?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const backdrop = useBackdropClose(onClose);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-3 backdrop-blur-[2px] sm:p-6 game-fade" {...backdrop}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-panel={tone}
        className={`bw-panel relative flex max-h-full w-full flex-col overflow-hidden outline-none ${
          full ? "h-full max-w-none" : wide ? "max-w-5xl" : "max-w-2xl"
        } ${tone === "paper" ? "bg-[#ebe2cd] text-[#2a241c] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" : "border border-white/10 bg-[#161b20]/95 text-paper"}`}
      >
        <div className={`flex items-center justify-between gap-4 border-b px-5 py-3 ${tone === "paper" ? "border-[#2a241c]/20" : "border-white/10"}`}>
          <h2 className={`truncate ${tone === "paper" ? "font-mono text-sm font-bold tracking-[0.08em]" : "font-serif text-lg"}`}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 text-sm underline-offset-4 hover:underline ${tone === "paper" ? "text-[#2a241c]/70" : "text-smoke"}`}
          >
            {closeLabel}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function GameButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "paper";
  className?: string;
  type?: "button" | "submit";
}) {
  const v =
    variant === "primary"
      ? "bg-brass text-ink hover:bg-[#d4b585]"
      : variant === "paper"
        ? "border border-[#2a241c]/40 text-[#2a241c] hover:bg-[#2a241c] hover:text-[#ebe2cd]"
        : "border border-white/20 text-paper hover:border-brass hover:text-brass";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[2px] px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`}
    >
      {children}
    </button>
  );
}
