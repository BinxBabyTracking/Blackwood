// Shapes of the rows the platform reads. Kept by hand to match
// supabase/migrations. Regenerate with `supabase gen types` once linked.

export type CaseStatus = "in_development" | "coming_soon" | "available" | "retired";

export interface PricingTier {
  id: string;
  label: string;
  duration_label: string;
  min_minutes: number;
  max_minutes: number;
  price_cents: number;
  currency: string;
  sort_order: number;
}

export interface CaseRecord {
  id: string;
  case_number: string;
  title: string;
  classification: string;
  location: string | null;
  year: number | null;
  synopsis: string;
  summary: string;
  difficulty: number | null;
  tier_id: string;
  est_minutes: number;
  min_investigators: number;
  max_investigators: number;
  status: CaseStatus;
  is_preview: boolean;
  is_introductory: boolean;
  cover_image_url: string | null;
  hero_image_url: string | null;
  released_at: string | null;
  catalog_order: number;
  created_at: string;
}

export interface CatalogCase extends CaseRecord {
  tier: PricingTier;
}

export interface AgencyRank {
  level: number;
  title: string;
  description: string;
  min_cases_closed: number | null;
  min_accuracy: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  criteria: string;
  sort_order: number;
}

export interface AgencyNotice {
  id: string;
  category: "assignment" | "archive" | "announcement";
  title: string;
  body: string;
  published_at: string;
}

export type InvestigationPreference = "solo" | "collaborative";

export interface DetectiveProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  investigation_preference: InvestigationPreference | null;
  rank_level: number;
  onboarded_at: string | null;
  created_at: string;
}

export interface ServiceRecord {
  user_id: string;
  cases_closed: number;
  cases_investigated: number;
  total_investigation_seconds: number;
  accuracy: number | null;
}

export interface UserSettings {
  master_volume: number;
  music_volume: number;
  dialogue_volume: number;
  sfx_volume: number;
  subtitles: boolean;
  text_size: "standard" | "large" | "x_large";
  reduced_motion: boolean;
  high_contrast: boolean;
  color_vision: "default" | "protanopia" | "deuteranopia" | "tritanopia";
  notify_announcements: boolean;
  notify_new_assignments: boolean;
  notify_joint_invites: boolean;
}

export type SessionStatus = "forming" | "active" | "closed" | "archived" | "abandoned";

export interface InvestigationSession {
  id: string;
  case_id: string;
  host_user_id: string;
  mode: "solo" | "joint";
  status: SessionStatus;
  invite_code: string | null;
  max_participants: number;
  progress: number;
  started_at: string | null;
  last_activity_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Participant {
  session_id: string;
  user_id: string;
  role: "host" | "investigator";
  is_ready: boolean;
  joined_at: string;
  profile: Pick<DetectiveProfile, "display_name" | "avatar_url"> | null;
}

/** Result shape returned by every server action that a form renders. */
export type ActionResult =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };
