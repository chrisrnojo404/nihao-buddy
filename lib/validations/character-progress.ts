import { z } from "zod";

export const characterProgressSchema = z.object({
  vocabularyId: z.string().min(1),
  character: z.string().min(1).max(2),
  characterIndex: z.number().int().min(0).max(63),
  action: z.enum(["practice", "complete"]),
});
