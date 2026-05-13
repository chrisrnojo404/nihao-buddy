import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writingSessionSchema } from "@/lib/validations/writing-session";

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!("writingSession" in prisma) || !prisma.writingSession) {
    return apiError("Writing session tracking is not ready yet. Update Prisma and try again.", 503);
  }

  const body = await parseJson(request);
  const parsed = writingSessionSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid writing session payload.", 400, parsed.error.flatten());
  }

  const vocabulary = await prisma.vocabulary.findFirst({
    where: {
      id: parsed.data.vocabularyId,
      userId: auth.userId,
    },
    select: {
      id: true,
      englishText: true,
      chineseText: true,
      pinyin: true,
    },
  });

  if (!vocabulary) {
    return apiError("Vocabulary item not found.", 404);
  }

  const [session, progress] = await prisma.$transaction([
    prisma.writingSession.create({
      data: {
        userId: auth.userId,
        vocabularyId: vocabulary.id,
        practicedCharacters: parsed.data.practicedCharacters,
      },
      include: {
        vocabulary: {
          select: {
            englishText: true,
            chineseText: true,
            pinyin: true,
          },
        },
      },
    }),
    prisma.progress.upsert({
      where: { userId: auth.userId },
      update: {
        lastPracticedAt: new Date(),
      },
      create: {
        userId: auth.userId,
        lastPracticedAt: new Date(),
      },
    }),
  ]);

  return apiSuccess({ session, progress }, 201);
}
