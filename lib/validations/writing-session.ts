import { z } from "zod";

export const writingSessionSchema = z.object({
  vocabularyId: z.string().min(1),
  practicedCharacters: z.number().int().min(1).max(64),
});
