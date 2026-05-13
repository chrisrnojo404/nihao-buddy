export type ReviewRating = "again" | "hard" | "good" | "easy";

type ScheduleInput = {
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
  rating: ReviewRating;
  now?: Date;
};

type ScheduleResult = {
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: Date;
  reviewCount: number;
  mastered: boolean;
  lastReviewedAt: Date;
};

function clampEaseFactor(value: number) {
  return Math.min(3.2, Math.max(1.3, Number(value.toFixed(2))));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getNextSchedule({
  easeFactor,
  intervalDays,
  reviewCount,
  rating,
  now = new Date(),
}: ScheduleInput): ScheduleResult {
  const currentEaseFactor = clampEaseFactor(easeFactor || 2.5);
  const currentIntervalDays = Math.max(0, intervalDays || 0);
  const nextReviewCount = reviewCount + 1;

  let nextEaseFactor = currentEaseFactor;
  let nextIntervalDays = currentIntervalDays;
  let nextReviewAt = now;

  switch (rating) {
    case "again":
      nextEaseFactor = clampEaseFactor(currentEaseFactor - 0.2);
      nextIntervalDays = 0;
      nextReviewAt = addMinutes(now, 10);
      break;
    case "hard":
      nextEaseFactor = clampEaseFactor(currentEaseFactor - 0.1);
      nextIntervalDays =
        currentIntervalDays <= 1 ? 1 : Math.max(1, Math.ceil(currentIntervalDays * 1.2));
      nextReviewAt = addDays(now, nextIntervalDays);
      break;
    case "good":
      nextEaseFactor = clampEaseFactor(currentEaseFactor + 0.05);
      nextIntervalDays =
        currentIntervalDays === 0
          ? 1
          : Math.max(1, Math.round(currentIntervalDays * currentEaseFactor));
      nextReviewAt = addDays(now, nextIntervalDays);
      break;
    case "easy":
      nextEaseFactor = clampEaseFactor(currentEaseFactor + 0.15);
      nextIntervalDays =
        currentIntervalDays === 0
          ? 3
          : Math.max(
              currentIntervalDays + 1,
              Math.round(currentIntervalDays * (currentEaseFactor + 0.35)),
            );
      nextReviewAt = addDays(now, nextIntervalDays);
      break;
  }

  return {
    easeFactor: nextEaseFactor,
    intervalDays: nextIntervalDays,
    nextReviewAt,
    reviewCount: nextReviewCount,
    mastered: nextIntervalDays >= 7,
    lastReviewedAt: now,
  };
}

export function getUpdatedStreakDays(lastPracticedAt: Date | null, now = new Date()) {
  if (!lastPracticedAt) {
    return 1;
  }

  const last = new Date(lastPracticedAt);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.round(
    (startOfNow.getTime() - startOfLast.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays <= 0) {
    return null;
  }

  if (diffDays === 1) {
    return "increment";
  }

  return 1;
}
