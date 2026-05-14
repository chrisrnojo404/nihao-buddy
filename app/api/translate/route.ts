import { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { translateToMandarin } from "@/lib/dictionary";
import { translateSchema } from "@/lib/validations/translate";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);
  const parsed = translateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid translation request.", 400, parsed.error.flatten());
  }

  const translation = translateToMandarin(parsed.data.text);

  if (!translation || !translation.found) {
    return apiError("Translation not found in the beginner dictionary yet.", 404, {
      suggestions: translation?.suggestions ?? [],
    });
  }

  return apiSuccess(translation);
}
