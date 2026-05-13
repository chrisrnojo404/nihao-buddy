import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import { apiError } from "@/lib/api";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireUser(request: NextRequest) {
  const rawToken =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!rawToken) {
    return {
      ok: false as const,
      response: apiError("Authentication required.", 401),
    };
  }

  const payload = verifyAuthToken(rawToken);

  if (!payload?.sub) {
    return {
      ok: false as const,
      response: apiError("Invalid or expired session.", 401),
    };
  }

  return {
    ok: true as const,
    userId: payload.sub,
    email: payload.email,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const payload = verifyAuthToken(rawToken);

  if (!payload?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function requirePageUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }
}
