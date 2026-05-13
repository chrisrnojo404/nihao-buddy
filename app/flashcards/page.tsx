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
      take: 20,
    }),
    prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    }),
  ]);
  const sortedVocabulary = [...vocabulary].sort((left, right) => {
    const leftDue = left.nextReviewAt ? new Date(left.nextReviewAt).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.nextReviewAt ? new Date(right.nextReviewAt).getTime() : Number.POSITIVE_INFINITY;

    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    if (left.mastered !== right.mastered) {
      return Number(left.mastered) - Number(right.mastered);
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  return (
    <AppShell>
      <FlashcardReview
        vocabulary={sortedVocabulary}
        initialProgress={{
          totalReviewed: progress.totalReviewed,
          streakDays: progress.streakDays,
          masteredCount: progress.masteredCount,
        }}
      />
    </AppShell>
  );
}
