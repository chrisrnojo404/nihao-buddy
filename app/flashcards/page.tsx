import { AppShell } from "@/components/app-shell";
import { FlashcardReview } from "@/components/flashcard-review";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FlashcardsPage() {
  const user = await requirePageUser();
  const [vocabulary, progress] = await Promise.all([
    prisma.vocabulary.findMany({
      where: { userId: user.id },
      orderBy: [{ mastered: "asc" }, { createdAt: "desc" }],
      take: 12,
    }),
    prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    }),
  ]);

  return (
    <AppShell>
      <FlashcardReview
        vocabulary={vocabulary}
        initialProgress={{
          totalReviewed: progress.totalReviewed,
          streakDays: progress.streakDays,
          masteredCount: progress.masteredCount,
        }}
      />
    </AppShell>
  );
}
