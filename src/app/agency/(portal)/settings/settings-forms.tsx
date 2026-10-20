"use client";

import { useActionState, useState } from "react";
import { changeEmail, changePassword, saveSettings } from "@/app/actions/settings";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";
import type { UserSettings } from "@/lib/types";

export function EmailForm({ current }: { current: string | null }) {
  const [state, action] = useActionState(changeEmail, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={current ?? ""} error={errors.email} />
      <FormMessage state={state} />
      <SubmitButton pending="Sending confirmation" variant="secondary">
        Change email
      </SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="New password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password} />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} />
      <FormMessage state={state} />
      <SubmitButton pending="Updating password" variant="secondary">
        Update password
      </SubmitButton>
    </form>
  );
}

function Slider({ name, label, initial }: { name: keyof UserSettings; label: string; initial: number }) {
  const [v, setV] = useState(initial);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={`s-${name}`}>{label}</label>
        <output htmlFor={`s-${name}`} className="font-mono text-smoke">
          {v}
        </output>
      </div>
      <input
        id={`s-${name}`}
        type="range"
        name={name}
        min={0}
        max={100}
        step={5}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="dial mt-2"
      />
    </div>
  );
}

function Toggle({ name, label, hint, initial }: { name: keyof UserSettings; label: string; hint?: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-3">
      <span>
        <span className="block text-sm">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-smoke">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" name={name} checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full border border-rule bg-ink transition-colors peer-checked:border-brass peer-checked:bg-brass/25 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-smoke transition-transform peer-checked:translate-x-5 peer-checked:bg-brass" />
      </span>
    </label>
  );
}

function SettingsForm({ section, children }: { section: string; children: React.ReactNode }) {
  const [state, action] = useActionState(saveSettings, IDLE);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="section" value={section} />
      {children}
      <FormMessage state={state} />
      <SubmitButton pending="Saving" variant="secondary">
        Save {section}
      </SubmitButton>
    </form>
  );
}

export function AudioForm({ settings: s }: { settings: UserSettings }) {
  return (
    <SettingsForm section="audio">
      <Slider name="master_volume" label="Master volume" initial={s.master_volume} />
      <Slider name="music_volume" label="Music volume" initial={s.music_volume} />
      <Slider name="dialogue_volume" label="Dialogue volume" initial={s.dialogue_volume} />
      <Slider name="sfx_volume" label="Sound effects volume" initial={s.sfx_volume} />
    </SettingsForm>
  );
}

function Choice({ name, label, initial, options }: { name: string; label: string; initial: string; options: [string, string][] }) {
  const [v, setV] = useState(initial);
  return (
    <label className="block text-sm">
      {label}
      <select name={name} value={v} onChange={(e) => setV(e.target.value)} className="field mt-1.5">
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AccessibilityForm({ settings: s }: { settings: UserSettings }) {
  return (
    <SettingsForm section="accessibility">
      <div className="divide-y divide-rule border-y border-rule">
        <Toggle name="subtitles" label="Subtitles" hint="Show text for all spoken dialogue in investigations." initial={s.subtitles} />
        <Toggle name="reduced_motion" label="Reduced motion" hint="Turns off ambient animation and slide transitions." initial={s.reduced_motion} />
        <Toggle name="high_contrast" label="High contrast" hint="Brighter secondary text, stronger borders, no film grain." initial={s.high_contrast} />
      </div>
      <Choice
        name="text_size"
        label="Text size"
        initial={s.text_size}
        options={[
          ["standard", "Standard"],
          ["large", "Large"],
          ["x_large", "Extra large"],
        ]}
      />
      <Choice
        name="color_vision"
        label="Colour accessibility"
        initial={s.color_vision}
        options={[
          ["default", "Default colours"],
          ["protanopia", "Protanopia (red-weak)"],
          ["deuteranopia", "Deuteranopia (green-weak)"],
          ["tritanopia", "Tritanopia (blue-weak)"],
        ]}
      />
    </SettingsForm>
  );
}

export function NotificationsForm({ settings: s }: { settings: UserSettings }) {
  return (
    <SettingsForm section="notifications">
      <div className="divide-y divide-rule border-y border-rule">
        <Toggle name="notify_announcements" label="Agency announcements" initial={s.notify_announcements} />
        <Toggle name="notify_new_assignments" label="New assignments" initial={s.notify_new_assignments} />
        <Toggle name="notify_joint_invites" label="Joint investigation invitations" initial={s.notify_joint_invites} />
      </div>
      <p className="text-xs text-smoke">These preferences are stored with your account. Email delivery of notices is not switched on yet.</p>
    </SettingsForm>
  );
}
