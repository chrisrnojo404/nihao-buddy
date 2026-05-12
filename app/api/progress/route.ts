import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { progressSchema } from "@/lib/validations/progress";

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const progress = await prisma.progress.upsert({
    where: { userId: auth.userId },
    update: {},
    create: {
      userId: auth.userId,
    },
  });

  return apiSuccess({ progress });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseJson(request);
  const parsed = progressSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid progress payload.", 400, parsed.error.flatten());
  }

  const progress = await prisma.progress.upsert({
    where: { userId: auth.userId },
    update: parsed.data,
    create: {
      userId: auth.userId,
      ...parsed.data,
    },
  });

  return apiSuccess({ progress });
}
