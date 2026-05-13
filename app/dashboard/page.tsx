import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requirePageUser();
  const now = new Date().getTime();
  const [progress, vocabulary] = await Promise.all([
    prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    }),
    prisma.vocabulary.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  let recentReviews: Array<{
    id: string;
    vocabularyId: string;
    rating: string;
    reviewedAt: Date;
    vocabulary: {
      englishText: string;
      chineseText: string;
    };
  }> = [];

  if ("reviewLog" in prisma && prisma.reviewLog) {
    recentReviews = await prisma.reviewLog.findMany({
      where: { userId: user.id },
      orderBy: {
        reviewedAt: "desc",
      },
      take: 12,
      include: {
        vocabulary: {
          select: {
            englishText: true,
            chineseText: true,
          },
        },
      },
    });
  }
  const vocabularyCount = vocabulary.length;
  const dueCards = vocabulary.filter((item) => {
    if (!item.nextReviewAt) {
      return false;
    }

    return new Date(item.nextReviewAt).getTime() <= now;
  });
  const upcomingCards = vocabulary.filter((item) => {
    if (!item.nextReviewAt) {
      return false;
    }

    return new Date(item.nextReviewAt).getTime() > now;
  });
  const nextDueCard = [...vocabulary]
    .filter((item) => item.nextReviewAt)
    .sort(
      (left, right) =>
        new Date(left.nextReviewAt as Date | string).getTime() -
        new Date(right.nextReviewAt as Date | string).getTime(),
    )[0];
  const reviewsToday = recentReviews.filter((entry) => {
    const reviewedAt = new Date(entry.reviewedAt);
    const today = new Date();

    return (
      reviewedAt.getFullYear() === today.getFullYear() &&
      reviewedAt.getMonth() === today.getMonth() &&
      reviewedAt.getDate() === today.getDate()
    );
  }).length;
  const hardestWords = Object.values(
    recentReviews.reduce<Record<string, {
      englishText: string;
      chineseText: string;
      difficulty: number;
      reviews: number;
    }>>((accumulator, entry) => {
      const key = entry.vocabularyId;
      const score =
        entry.rating === "again" ? 3 : entry.rating === "hard" ? 2 : 0;

      if (!accumulator[key]) {
        accumulator[key] = {
          englishText: entry.vocabulary.englishText,
          chineseText: entry.vocabulary.chineseText,
          difficulty: 0,
          reviews: 0,
        };
      }

      accumulator[key].difficulty += score;
      accumulator[key].reviews += 1;

      return accumulator;
    }, {}),
  )
    .filter((entry) => entry.difficulty > 0)
    .sort((left, right) => right.difficulty - left.difficulty || right.reviews - left.reviews)
    .slice(0, 3);

  const dashboardMetrics = [
    {
      label: "Saved words",
      value: String(vocabularyCount),
      description: "Vocabulary total is now coming from your saved study list.",
    },
    {
      label: "Due now",
      value: String(dueCards.length),
      description: "Cards due for review right now are ordered first in flashcard study.",
    },
    {
      label: "Mastered",
      value: String(progress.masteredCount),
      description: "Longer review intervals now drive mastery rather than a manual toggle alone.",
    },
    {
      label: "Reviewed today",
      value: String(reviewsToday),
      description: "Recent flashcard sessions now feed directly into your daily activity analytics.",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Track your Mandarin momentum
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Welcome back, {user.name}. Your dashboard now reflects live progress
            and vocabulary data from the database.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            >
              <CardHeader>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  {metric.label}
                </p>
                <CardTitle className="mt-2 text-4xl text-slate-950">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-red-600">
              Progress Snapshot
            </p>
            <CardTitle className="mt-2 text-3xl text-red-950">
              Your account is fully connected now
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-red-950/70 md:grid-cols-2">
            <p>Total reviewed: {progress.totalReviewed}</p>
            <p>Last practiced: {progress.lastPracticedAt?.toLocaleDateString() ?? "Not yet"}</p>
            <p>Upcoming cards: {upcomingCards.length}</p>
            <p>
              Next scheduled review:{" "}
              {nextDueCard?.nextReviewAt
                ? new Date(nextDueCard.nextReviewAt).toLocaleString()
                : "No cards yet"}
            </p>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Recent Activity
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Your last review decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReviews.length ? (
                recentReviews.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {entry.vocabulary.englishText}
                      </p>
                      <p className="text-sm text-slate-500">
                        {entry.vocabulary.chineseText}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold uppercase text-red-700">
                        {entry.rating}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  No review history yet. Complete a flashcard session to start building analytics.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Hardest Words
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Phrases that need more attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hardestWords.length ? (
                hardestWords.map((entry) => (
                  <div
                    key={`${entry.englishText}-${entry.chineseText}`}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {entry.englishText}
                    </p>
                    <p className="text-2xl font-semibold text-slate-950">
                      {entry.chineseText}
                    </p>
                    <p className="text-sm text-slate-500">
                      {entry.reviews} tracked review(s), difficulty score {entry.difficulty}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Once you rate cards as Again or Hard, they&apos;ll show up here.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
