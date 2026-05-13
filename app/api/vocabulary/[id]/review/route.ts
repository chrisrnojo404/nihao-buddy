import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextSchedule, getUpdatedStreakDays } from "@/lib/spaced-repetition";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.enum(["again", "hard", "good", "easy"]),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = await parseJson(request);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid review rating.", 400, parsed.error.flatten());
  }

  const vocabulary = await prisma.vocabulary.findFirst({
    where: {
      id,
      userId: auth.userId,
    },
  });

  if (!vocabulary) {
    return apiError("Vocabulary item not found.", 404);
  }

  const progress = await prisma.progress.upsert({
    where: { userId: auth.userId },
    update: {},
    create: { userId: auth.userId },
  });

  const schedule = getNextSchedule({
    easeFactor: vocabulary.easeFactor,
    intervalDays: vocabulary.intervalDays,
    reviewCount: vocabulary.reviewCount,
    rating: parsed.data.rating,
  });

  const updatedVocabulary = await prisma.vocabulary.update({
    where: { id },
    data: {
      reviewCount: schedule.reviewCount,
      easeFactor: schedule.easeFactor,
      intervalDays: schedule.intervalDays,
      nextReviewAt: schedule.nextReviewAt,
      lastReviewedAt: schedule.lastReviewedAt,
      mastered: schedule.mastered,
    },
  });

  const streakUpdate = getUpdatedStreakDays(progress.lastPracticedAt);
  const masteredDelta =
    schedule.mastered === vocabulary.mastered ? 0 : schedule.mastered ? 1 : -1;

  const updatedProgress = await prisma.progress.update({
    where: { userId: auth.userId },
    data: {
      totalReviewed: {
        increment: 1,
      },
      masteredCount:
        masteredDelta !== 0
          ? {
              increment: masteredDelta,
            }
          : undefined,
      streakDays:
        streakUpdate === "increment"
          ? {
              increment: 1,
            }
          : streakUpdate === null
            ? undefined
            : streakUpdate,
      lastPracticedAt: schedule.lastReviewedAt,
    },
  });

  return apiSuccess({
    vocabulary: updatedVocabulary,
    progress: updatedProgress,
  });
}
