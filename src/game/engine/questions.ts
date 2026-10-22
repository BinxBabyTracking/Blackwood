import { check } from "./rules";
import type { CaseDefinition, CharacterBudget, CharacterDef, InvestigationState, QuestionBudget, QuestionFund } from "./types";

/*
 * The interview question economy, for every case.
 *
 * Each interviewee answers a limited number of questions (20 by default).
 * Their allowance has four parts, spent in this order:
 *   1. base questions
 *   2. re-interview questions, granted once per authored discovery
 *   3. bonus questions, bought with expense credits (standard mode)
 *   4. purchased questions (hardcore mode, real money; not available yet)
 *
 * Standard mode earns one expense credit for every three distinct authored
 * answers heard for the first time on base or re-interview questions. Five
 * credits (an in-world $5) buy five more questions with one person. Questions
 * paid for with credits or money never earn credits.
 *
 * Everything lives in the saved state and changes only inside the reducer,
 * so a refresh, a retry or a second device cannot duplicate anything.
 */

export const DEFAULT_QUESTION_LIMIT = 20;
export const REINTERVIEW_QUESTIONS = 5;
export const ANSWERS_PER_CREDIT = 3;
export const EXTENSION_COST = 5;
export const EXTENSION_QUESTIONS = 5;
/** Questions left when the character first shows impatience, and when they give a last warning. */
export const WARN_AT = 5;
export const LAST_AT = 2;

const empty = (): CharacterBudget => ({
  baseUsed: 0,
  reinterviewGranted: 0,
  reinterviewUsed: 0,
  bonusGranted: 0,
  bonusUsed: 0,
  purchasedGranted: 0,
  purchasedUsed: 0,
});

export function newBudget(): QuestionBudget {
  return { mode: "standard", characters: {}, qualifying: [], grants: [], redeemed: 0, redemptions: [], purchases: [] };
}

export function budgetOf(s: InvestigationState): QuestionBudget {
  s.budget ??= newBudget();
  return s.budget;
}

function charBudget(s: InvestigationState, characterId: string) {
  const b = budgetOf(s);
  return (b.characters[characterId] ??= empty());
}

/** The base allowance for a character, or null when they have no limit. */
export function limitOf(def: CaseDefinition, c: CharacterDef | undefined): number | null {
  if (!c) return null;
  if (c.questionLimit === null) return null;
  return c.questionLimit ?? def.questionLimit ?? DEFAULT_QUESTION_LIMIT;
}

/** Questions left with a character right now, split by source; null when unlimited. */
export function allowance(def: CaseDefinition, s: InvestigationState, characterId: string) {
  const limit = limitOf(def, def.characters.find((c) => c.id === characterId));
  if (limit === null) return null;
  const c = s.budget?.characters[characterId] ?? empty();
  const parts = {
    base: Math.max(0, limit - c.baseUsed),
    reinterview: Math.max(0, c.reinterviewGranted - c.reinterviewUsed),
    bonus: Math.max(0, c.bonusGranted - c.bonusUsed),
    purchased: Math.max(0, c.purchasedGranted - c.purchasedUsed),
  };
  return { ...parts, left: parts.base + parts.reinterview + parts.bonus + parts.purchased };
}

export function questionsLeft(def: CaseDefinition, s: InvestigationState, characterId: string): number | null {
  return allowance(def, s, characterId)?.left ?? null;
}

/**
 * Spends one question with a character and says which allowance paid for it.
 * Returns null for characters without a limit. Never goes below zero: the
 * caller checks `questionsLeft` first and refuses the question when it is 0.
 */
export function spendQuestion(def: CaseDefinition, s: InvestigationState, characterId: string): QuestionFund | null {
  const a = allowance(def, s, characterId);
  if (!a) return null;
  const c = charBudget(s, characterId);
  if (a.base > 0) {
    c.baseUsed++;
    return "base";
  }
  if (a.reinterview > 0) {
    c.reinterviewUsed++;
    return "reinterview";
  }
  if (a.bonus > 0) {
    c.bonusUsed++;
    return "bonus";
  }
  if (a.purchased > 0) {
    c.purchasedUsed++;
    return "purchased";
  }
  return null;
}

/** Expense credits: earned from distinct authored answers (standard mode only), less what has been spent. */
export function credits(s: InvestigationState) {
  const b = s.budget ?? newBudget();
  const earned = b.mode === "standard" ? Math.floor(b.qualifying.length / ANSWERS_PER_CREDIT) : 0;
  return { earned, redeemed: b.redeemed, balance: Math.max(0, earned - b.redeemed) };
}

/**
 * Records the first delivery of an authored answer toward expense credits.
 * Only answers paid for by base or re-interview questions (or with no limit)
 * count, each unique id once, and never in hardcore mode.
 */
export function noteAuthoredAnswer(s: InvestigationState, answerId: string, fund: QuestionFund | null) {
  const b = budgetOf(s);
  if (b.mode !== "standard") return;
  if (fund === "bonus" || fund === "purchased") return;
  if (!b.qualifying.includes(answerId)) b.qualifying.push(answerId);
}

/** Awards any re-interview grants whose condition now holds. Returns the notes to show. */
export function runReinterviews(def: CaseDefinition, s: InvestigationState): string[] {
  const out: string[] = [];
  for (const g of def.reinterviews ?? []) {
    const b = budgetOf(s);
    if (b.grants.includes(g.id) || !check(g.when, s)) continue;
    b.grants.push(g.id);
    if (limitOf(def, def.characters.find((c) => c.id === g.characterId)) === null) continue;
    charBudget(s, g.characterId).reinterviewGranted += g.questions ?? REINTERVIEW_QUESTIONS;
    out.push(g.note);
  }
  return out;
}

/**
 * Five credits for five more questions with one person. Returns false (and
 * changes nothing) when the same request was already processed.
 */
export function redeemCredits(s: InvestigationState, characterId: string, requestId: string, now: number) {
  const b = budgetOf(s);
  if (b.redemptions.some((r) => r.id === requestId)) return false;
  b.redeemed += EXTENSION_COST;
  b.redemptions.push({ id: requestId, characterId, credits: EXTENSION_COST, at: now });
  charBudget(s, characterId).bonusGranted += EXTENSION_QUESTIONS;
  return true;
}
