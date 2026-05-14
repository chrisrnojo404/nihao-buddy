import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { characterProgressSchema } from "@/lib/validations/character-progress";

const CHARACTER_MASTERY_TARGET = 3;

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!("characterProgress" in prisma) || !prisma.characterProgress) {
    return apiError("Character progress tracking is not ready yet. Update Prisma and try again.", 503);
  }

  const body = await parseJson(request);
  const parsed = characterProgressSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid character progress payload.", 400, parsed.error.flatten());
  }

  const vocabulary = await prisma.vocabulary.findFirst({
    where: {
      id: parsed.data.vocabularyId,
      userId: auth.userId,
    },
    select: {
      id: true,
      chineseText: true,
    },
  });

  if (!vocabulary) {
    return apiError("Vocabulary item not found.", 404);
  }

  const characters = Array.from(vocabulary.chineseText).filter((character) => character.trim());
  const expectedCharacter = characters[parsed.data.characterIndex];

  if (!expectedCharacter || expectedCharacter !== parsed.data.character) {
    return apiError("Character selection does not match the saved phrase.", 400);
  }

  const existing = await prisma.characterProgress.findUnique({
    where: {
      userId_vocabularyId_characterIndex: {
        userId: auth.userId,
        vocabularyId: parsed.data.vocabularyId,
        characterIndex: parsed.data.characterIndex,
      },
    },
  });

  const nextPracticeCount = (existing?.practiceCount ?? 0) + 1;
  const nextCompletedCount =
    (existing?.completedCount ?? 0) + (parsed.data.action === "complete" ? 1 : 0);
  const nextMastered = nextCompletedCount >= CHARACTER_MASTERY_TARGET;
  const now = new Date();

  const [characterProgress, progress] = await prisma.$transaction([
    prisma.characterProgress.upsert({
      where: {
        userId_vocabularyId_characterIndex: {
          userId: auth.userId,
          vocabularyId: parsed.data.vocabularyId,
          characterIndex: parsed.data.characterIndex,
        },
      },
      update: {
        character: parsed.data.character,
        practiceCount: nextPracticeCount,
        completedCount: nextCompletedCount,
        mastered: nextMastered,
        lastPracticedAt: now,
      },
      create: {
        userId: auth.userId,
        vocabularyId: parsed.data.vocabularyId,
        character: parsed.data.character,
        characterIndex: parsed.data.characterIndex,
        practiceCount: nextPracticeCount,
        completedCount: nextCompletedCount,
        mastered: nextMastered,
        lastPracticedAt: now,
      },
    }),
    prisma.progress.upsert({
      where: { userId: auth.userId },
      update: {
        lastPracticedAt: now,
      },
      create: {
        userId: auth.userId,
        lastPracticedAt: now,
      },
    }),
  ]);

  return apiSuccess({
    characterProgress,
    progress,
    masteryTarget: CHARACTER_MASTERY_TARGET,
  });
}
