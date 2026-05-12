import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

import { apiError } from "@/lib/api";
import { verifyAuthToken } from "@/lib/jwt";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireUser(request: NextRequest) {
  const rawToken =
    request.cookies.get("token")?.value ??
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
