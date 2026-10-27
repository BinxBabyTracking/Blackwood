"use server";

import type { SeriesAction } from "@/series/board";
import { actOnSeries, loadSeries, SeriesError, type SeriesView } from "@/series/server";
import { createClient } from "@/lib/supabase/server";

const MOVES = new Set<SeriesAction["type"]>(["boardAdd", "boardMove", "boardRemove", "connect", "disconnect"]);

async function signedIn() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** The rolling board, fresh from the server. */
export async function seriesBoard(seriesId: string): Promise<{ view: SeriesView } | { error: string }> {
  const userId = await signedIn();
  if (!userId) return { error: "Sign in to see your series board." };
  try {
    const view = await loadSeries(userId, seriesId);
    return view ? { view } : { error: "No such series." };
  } catch (e) {
    return { error: e instanceof SeriesError ? e.message : "The series board could not be loaded." };
  }
}

/** One move on the rolling board. */
export async function seriesBoardAction(
  seriesId: string,
  action: SeriesAction,
): Promise<{ view: SeriesView; made: { id: string; title: string; text: string } | null } | { error: string }> {
  const userId = await signedIn();
  if (!userId) return { error: "Sign in to use the series board." };
  if (!action || !MOVES.has(action.type)) return { error: "That isn't something the board can do." };
  try {
    return await actOnSeries(userId, seriesId, action);
  } catch (e) {
    return { error: e instanceof SeriesError ? e.message : "The board could not be saved. Try again." };
  }
}
