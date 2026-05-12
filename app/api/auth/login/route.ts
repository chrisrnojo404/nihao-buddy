import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { comparePassword } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid login data.", 400, parsed.error.flatten());
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return apiError("Invalid email or password.", 401);
    }

    const isValidPassword = await comparePassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return apiError("Invalid email or password.", 401);
    }

    const token = signAuthToken({ sub: user.id, email: user.email });
    const response = apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return apiError("Unable to log in right now.", 500, {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
