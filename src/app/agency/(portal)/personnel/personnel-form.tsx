"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { FormMessage, IDLE, SubmitButton } from "@/components/form";
import { ProfileFields } from "@/components/portal/profile-fields";
import type { InvestigationPreference } from "@/lib/types";

export function PersonnelForm({
  defaults,
}: {
  defaults: { display_name: string | null; avatar_url: string | null; investigation_preference: InvestigationPreference | null };
}) {
  const [state, action] = useActionState(updateProfile, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-8" noValidate>
      <ProfileFields key={defaults.avatar_url ?? "none"} defaults={defaults} errors={errors} allowRemove />
      <FormMessage state={state} />
      <SubmitButton pending="Saving">Save changes</SubmitButton>
    </form>
  );
}
