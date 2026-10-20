"use client";

import { useEffect, useState } from "react";
import { Field } from "../form";
import { Avatar } from "./avatar";
import type { InvestigationPreference } from "@/lib/types";

export function ProfileFields({
  defaults,
  errors,
  allowRemove = false,
}: {
  defaults: { display_name: string | null; avatar_url: string | null; investigation_preference: InvestigationPreference | null };
  errors: Record<string, string>;
  allowRemove?: boolean;
}) {
  const [name, setName] = useState(defaults.display_name ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [pref, setPref] = useState<InvestigationPreference | null>(defaults.investigation_preference);

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const shown = preview ?? (remove ? null : defaults.avatar_url);

  return (
    <div className="space-y-7">
      <Field
        label="Detective display name"
        name="display_name"
        required
        minLength={2}
        maxLength={40}
        autoComplete="nickname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        hint="Shown on your personnel file and to other investigators in joint investigations."
        error={errors.display_name}
      />

      <div>
        <p className="text-sm text-paper">
          Photo <span className="text-smoke">(optional)</span>
        </p>
        <div className="mt-2 flex items-center gap-4">
          <Avatar name={name || null} url={shown} size={64} />
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center rounded-[var(--radius-file)] border border-rule px-3 py-1.5 text-sm hover:border-brass hover:text-brass focus-within:outline focus-within:outline-2 focus-within:outline-brass">
              Choose image
              <input
                type="file"
                name="avatar"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                aria-describedby="avatar-hint"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : null);
                  if (f) setRemove(false);
                }}
              />
            </label>
            {allowRemove && defaults.avatar_url && !preview ? (
              <label className="flex items-center gap-2 text-xs text-smoke">
                <input type="checkbox" name="remove_avatar" checked={remove} onChange={(e) => setRemove(e.target.checked)} className="accent-[var(--color-brass)]" />
                Remove current photo
              </label>
            ) : null}
            <p id="avatar-hint" className="text-xs text-smoke">
              PNG, JPEG or WebP, up to 2 MB.
            </p>
          </div>
        </div>
        {errors.avatar ? <p className="mt-1.5 text-xs text-[#e2a7a2]">{errors.avatar}</p> : null}
      </div>

      <fieldset>
        <legend className="text-sm text-paper">Preferred investigation style</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["solo", "Solo", "You work the file alone, at your own pace."],
              ["collaborative", "Collaborative", "You prefer joint investigations with other investigators."],
            ] as const
          ).map(([value, title, body]) => (
            <label
              key={value}
              className="relative flex cursor-pointer flex-col rounded-[var(--radius-file)] border border-rule bg-ink p-4 transition-colors hover:border-smoke has-[:checked]:border-brass has-[:checked]:bg-card has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass"
            >
              <input
                type="radio"
                name="investigation_preference"
                value={value}
                checked={pref === value}
                onChange={() => setPref(value)}
                className="peer sr-only"
                required
              />
              <span className="font-serif text-lg">{title}</span>
              <span className="mt-1 text-sm text-smoke">{body}</span>
              <span aria-hidden className="absolute right-4 top-4 h-3 w-3 rounded-full border border-rule peer-checked:border-brass peer-checked:bg-brass" />
            </label>
          ))}
        </div>
        {errors.investigation_preference ? <p className="mt-1.5 text-xs text-[#e2a7a2]">{errors.investigation_preference}</p> : null}
      </fieldset>
    </div>
  );
}
