import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createVocabularySchema } from "@/lib/validations/vocabulary";

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess({ vocabulary });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseJson(request);
  const parsed = createVocabularySchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid vocabulary payload.", 400, parsed.error.flatten());
  }

  const vocabulary = await prisma.vocabulary.create({
    data: {
      ...parsed.data,
      userId: auth.userId,
    },
  });

  await prisma.progress.upsert({
    where: { userId: auth.userId },
    update: {
      totalSaved: {
        increment: 1,
      },
      masteredCount: parsed.data.mastered
        ? {
            increment: 1,
          }
        : undefined,
    },
    create: {
      userId: auth.userId,
      totalSaved: 1,
      masteredCount: parsed.data.mastered ? 1 : 0,
    },
  });

  return apiSuccess({ vocabulary }, 201);
}
