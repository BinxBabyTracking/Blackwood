import "server-only";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * The spending ledger (table api_usage). Every paid call is recorded with the
 * case, playthrough and character it belongs to: interview model tokens, voice
 * characters, transcription seconds. Reused answers and recordings are recorded
 * too, marked `saved`, so the Spending page can show what reuse saves.
 *
 * Recording happens after the response is sent and never fails a request.
 */

export type UsageEntry = {
  userId: string | null;
  sessionId?: string | null;
  caseId: string;
  characterId?: string | null;
  service: "claude" | "tts" | "stt";
  purpose: "interview" | "voice" | "narration" | "transcribe";
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  characters?: number;
  audioSeconds?: number;
  saved?: boolean;
};

const int = (n: number | undefined) => (Number.isFinite(n) ? Math.max(0, Math.round(n!)) : 0);

export function recordUsage(e: UsageEntry) {
  const db = createAdminClient();
  if (!db) return;
  const row = {
    user_id: e.userId,
    session_id: e.sessionId ?? null,
    case_id: e.caseId,
    character_id: e.characterId ?? null,
    service: e.service,
    purpose: e.purpose,
    model: e.model ?? null,
    input_tokens: int(e.inputTokens),
    output_tokens: int(e.outputTokens),
    characters: int(e.characters),
    audio_seconds: Math.min(600, Math.max(0, Number(e.audioSeconds) || 0)),
    saved: Boolean(e.saved),
  };
  try {
    after(async () => {
      const { error } = await db.from("api_usage").insert(row);
      if (error) console.error("usage", error.message);
    });
  } catch {
    /* outside a request (scripts): nothing to record */
  }
}
