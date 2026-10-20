"use client";

import { useEffect } from "react";
import type { UserSettings } from "@/lib/types";

type Prefs = Pick<UserSettings, "text_size" | "reduced_motion" | "high_contrast" | "color_vision">;

export function applyPreferences(p: Prefs) {
  const el = document.documentElement;
  el.dataset.textSize = p.text_size;
  el.dataset.motion = p.reduced_motion ? "reduced" : "full";
  el.dataset.contrast = p.high_contrast ? "high" : "standard";
  el.dataset.vision = p.color_vision;
}

/** Applies the investigator's saved accessibility settings to the page. */
export function PreferenceApplier({ prefs }: { prefs: Prefs | null }) {
  useEffect(() => {
    if (prefs) applyPreferences(prefs);
  }, [prefs]);
  return null;
}
