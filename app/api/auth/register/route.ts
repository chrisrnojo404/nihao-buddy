import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  hashPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid registration data.", 400, parsed.error.flatten());
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (existingUser) {
      return apiError("An account with that email already exists.", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
        progress: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = signAuthToken({ sub: user.id, email: user.email });
    const response = apiSuccess({ user }, 201);
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    return apiError("Unable to register right now.", 500, {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
