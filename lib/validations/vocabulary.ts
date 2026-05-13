import { z } from "zod";

export const createVocabularySchema = z.object({
  englishText: z.string().trim().min(1).max(120),
  chineseText: z.string().trim().min(1).max(120),
  pinyin: z.string().trim().min(1).max(160),
  notes: z.string().trim().max(300).optional(),
  mastered: z.boolean().optional(),
});

export const updateVocabularySchema = createVocabularySchema
  .partial()
  .extend({
    reviewCount: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");
