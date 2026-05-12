import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateVocabularySchema } from "@/lib/validations/vocabulary";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = await parseJson(request);
  const parsed = updateVocabularySchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid vocabulary update.", 400, parsed.error.flatten());
  }

  const existing = await prisma.vocabulary.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return apiError("Vocabulary item not found.", 404);
  }

  const vocabulary = await prisma.vocabulary.update({
    where: { id },
    data: parsed.data,
  });

  return apiSuccess({ vocabulary });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const existing = await prisma.vocabulary.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return apiError("Vocabulary item not found.", 404);
  }

  await prisma.vocabulary.delete({
    where: { id },
  });

  await prisma.progress.upsert({
    where: { userId: auth.userId },
    update: {
      totalSaved: {
        decrement: 1,
      },
    },
    create: {
      userId: auth.userId,
      totalSaved: 0,
    },
  });

  return apiSuccess({ deleted: true });
}
