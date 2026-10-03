import type { VocabularyWord } from "../types";

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;

export function isDueForReview(word: VocabularyWord, now = new Date()): boolean {
  if (!word.next_review_at) return true;
  return new Date(word.next_review_at).getTime() <= now.getTime();
}

export function applySrs(word: VocabularyWord, isCorrect: boolean, now = new Date()): Partial<VocabularyWord> {
  const ease = word.ease_factor ?? 2.5;
  const interval = word.interval_days ?? 0;
  const reviewCount = (word.review_count || 0) + 1;

  let nextEase = ease;
  let nextInterval = interval;
  let proficiency = word.proficiency || 1;

  if (isCorrect) {
    if (interval <= 0) nextInterval = 1;
    else if (interval === 1) nextInterval = 3;
    else nextInterval = Math.max(4, Math.round(interval * ease));
    nextEase = Math.min(MAX_EASE, ease + 0.1);
    proficiency = Math.min(5, proficiency + 1);
  } else {
    nextInterval = 0;
    nextEase = Math.max(MIN_EASE, ease - 0.2);
    proficiency = Math.max(1, proficiency - 1);
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + nextInterval);

  return {
    review_count: reviewCount,
    last_reviewed_at: now.toISOString(),
    proficiency,
    ease_factor: Number(nextEase.toFixed(2)),
    interval_days: nextInterval,
    next_review_at: nextReview.toISOString(),
  };
}

export function sortReviewQueue(words: VocabularyWord[]): VocabularyWord[] {
  const now = Date.now();
  return [...words].sort((a, b) => {
    const aDue = a.next_review_at ? new Date(a.next_review_at).getTime() : 0;
    const bDue = b.next_review_at ? new Date(b.next_review_at).getTime() : 0;
    const aOverdue = aDue - now;
    const bOverdue = bDue - now;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    if (a.proficiency !== b.proficiency) return a.proficiency - b.proficiency;
    return a.review_count - b.review_count;
  });
}
