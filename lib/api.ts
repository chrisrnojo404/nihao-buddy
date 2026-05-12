import { NextRequest, NextResponse } from "next/server";

export async function parseJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function apiError(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status },
  );
}
