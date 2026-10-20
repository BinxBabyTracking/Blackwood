"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/app/actions/profile";
import { FormMessage, IDLE, SubmitButton } from "@/components/form";
import { ProfileFields } from "@/components/portal/profile-fields";

export function OnboardingForm() {
  const [state, action] = useActionState(completeOnboarding, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-8" noValidate>
      <ProfileFields defaults={{ display_name: null, avatar_url: null, investigation_preference: null }} errors={errors} />
      <FormMessage state={state} />
      <SubmitButton pending="Filing your paperwork">Report to Headquarters</SubmitButton>
    </form>
  );
}
