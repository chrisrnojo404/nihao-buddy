import { z } from "zod";

export const progressSchema = z.object({
  totalSaved: z.number().int().min(0).optional(),
  totalReviewed: z.number().int().min(0).optional(),
  masteredCount: z.number().int().min(0).optional(),
  streakDays: z.number().int().min(0).optional(),
  dailyCharacterGoal: z.number().int().min(1).max(50).optional(),
  lastPracticedAt: z.coerce.date().optional(),
});
