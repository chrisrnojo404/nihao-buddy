import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toValidDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

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
  let recentWritingSessions: Array<{
    id: string;
    vocabularyId: string;
    practicedCharacters: number;
    practicedAt: Date;
    vocabulary: {
      englishText: string;
      chineseText: string;
    };
  }> = [];
  let recentCharacterProgress: Array<{
    id: string;
    vocabularyId: string;
    character: string;
    characterIndex: number;
    practiceCount: number;
    completedCount: number;
    mastered: boolean;
    updatedAt: Date;
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
  if ("writingSession" in prisma && prisma.writingSession) {
    recentWritingSessions = await prisma.writingSession.findMany({
      where: { userId: user.id },
      orderBy: {
        practicedAt: "desc",
      },
      take: 120,
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
  if ("characterProgress" in prisma && prisma.characterProgress) {
    recentCharacterProgress = await prisma.characterProgress.findMany({
      where: { userId: user.id },
      orderBy: {
        updatedAt: "desc",
      },
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
  const dailyCharacterGoal = progress.dailyCharacterGoal ?? 5;
  const vocabularyCount = vocabulary.length;
  const dueCards = vocabulary.filter((item) => {
    const nextReviewAt = toValidDate(item.nextReviewAt);

    if (!nextReviewAt) {
      return false;
    }

    return nextReviewAt.getTime() <= now;
  });
  const upcomingCards = vocabulary.filter((item) => {
    const nextReviewAt = toValidDate(item.nextReviewAt);

    if (!nextReviewAt) {
      return false;
    }

    return nextReviewAt.getTime() > now;
  });
  const nextDueCard = [...vocabulary]
    .filter((item) => toValidDate(item.nextReviewAt))
    .sort(
      (left, right) =>
        (toValidDate(left.nextReviewAt)?.getTime() ?? Number.POSITIVE_INFINITY) -
        (toValidDate(right.nextReviewAt)?.getTime() ?? Number.POSITIVE_INFINITY),
    )[0];
  const reviewsToday = recentReviews.filter((entry) => {
    const reviewedAt = toValidDate(entry.reviewedAt);
    const today = new Date();

    if (!reviewedAt) {
      return false;
    }

    return (
      reviewedAt.getFullYear() === today.getFullYear() &&
      reviewedAt.getMonth() === today.getMonth() &&
      reviewedAt.getDate() === today.getDate()
    );
  }).length;
  const writingSessionsToday = recentWritingSessions.filter((entry) => {
    const practicedAt = toValidDate(entry.practicedAt);
    const today = new Date();

    if (!practicedAt) {
      return false;
    }

    return (
      practicedAt.getFullYear() === today.getFullYear() &&
      practicedAt.getMonth() === today.getMonth() &&
      practicedAt.getDate() === today.getDate()
    );
  });
  const writingCharactersToday = writingSessionsToday.reduce(
    (total, entry) => total + entry.practicedCharacters,
    0,
  );
  const writingDaysByDate = new Map<string, number>();
  for (const entry of recentWritingSessions) {
    const practicedAt = toValidDate(entry.practicedAt);

    if (!practicedAt) {
      continue;
    }

    const dateKey = practicedAt.toISOString().slice(0, 10);
    writingDaysByDate.set(
      dateKey,
      (writingDaysByDate.get(dateKey) ?? 0) + entry.practicedCharacters,
    );
  }
  let dailyGoalStreak = 0;
  const streakCursor = new Date();
  while (!Number.isNaN(streakCursor.getTime()) && dailyGoalStreak < 365) {
    const key = streakCursor.toISOString().slice(0, 10);
    const practicedCharacters = writingDaysByDate.get(key) ?? 0;

    if (practicedCharacters < dailyCharacterGoal) {
      break;
    }

    dailyGoalStreak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }
  const charactersCompletedToday = recentCharacterProgress.filter((entry) => {
    const updatedAt = toValidDate(entry.updatedAt);
    const today = new Date();

    if (!updatedAt) {
      return false;
    }

    return (
      updatedAt.getFullYear() === today.getFullYear() &&
      updatedAt.getMonth() === today.getMonth() &&
      updatedAt.getDate() === today.getDate() &&
      entry.completedCount > 0
    );
  }).length;
  const masteredCharactersTotal = recentCharacterProgress.filter(
    (entry) => entry.mastered,
  ).length;
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
  const mostPracticedWritingPhrases = Object.values(
    recentWritingSessions.reduce<Record<string, {
      englishText: string;
      chineseText: string;
      sessions: number;
      practicedCharacters: number;
    }>>((accumulator, entry) => {
      const key = entry.vocabularyId;

      if (!accumulator[key]) {
        accumulator[key] = {
          englishText: entry.vocabulary.englishText,
          chineseText: entry.vocabulary.chineseText,
          sessions: 0,
          practicedCharacters: 0,
        };
      }

      accumulator[key].sessions += 1;
      accumulator[key].practicedCharacters += entry.practicedCharacters;

      return accumulator;
    }, {}),
  )
    .sort(
      (left, right) =>
        right.sessions - left.sessions ||
        right.practicedCharacters - left.practicedCharacters,
    )
    .slice(0, 3);
  const mostPracticedCharacters = Object.values(
    recentCharacterProgress.reduce<Record<string, {
      character: string;
      practiceCount: number;
      completedCount: number;
      masteredInstances: number;
    }>>((accumulator, entry) => {
      const key = entry.character;

      if (!accumulator[key]) {
        accumulator[key] = {
          character: entry.character,
          practiceCount: 0,
          completedCount: 0,
          masteredInstances: 0,
        };
      }

      accumulator[key].practiceCount += entry.practiceCount;
      accumulator[key].completedCount += entry.completedCount;
      accumulator[key].masteredInstances += entry.mastered ? 1 : 0;

      return accumulator;
    }, {}),
  )
    .sort(
      (left, right) =>
        right.practiceCount - left.practiceCount ||
        right.completedCount - left.completedCount,
    )
    .slice(0, 5);
  const phraseWritingStreaks = vocabulary
    .map((item) => {
      const itemCharacters = Array.from(item.chineseText).filter((character) => character.trim());
      const progressByIndex = new Map(
        recentCharacterProgress
          .filter((entry) => entry.vocabularyId === item.id)
          .map((entry) => [entry.characterIndex, entry] as const),
      );
      const completedCharacters = itemCharacters.filter((_, index) => {
        const entry = progressByIndex.get(index);
        return Boolean(entry && entry.completedCount > 0);
      }).length;
      const masteredCharacters = itemCharacters.filter((_, index) => {
        const entry = progressByIndex.get(index);
        return Boolean(entry?.mastered);
      }).length;
      const completionStreak = itemCharacters.reduce((streak, _, index) => {
        const entry = progressByIndex.get(index);

        if (!entry || entry.completedCount <= 0 || streak !== index) {
          return streak;
        }

        return streak + 1;
      }, 0);

      return {
        id: item.id,
        englishText: item.englishText,
        chineseText: item.chineseText,
        totalCharacters: itemCharacters.length,
        completedCharacters,
        masteredCharacters,
        completionStreak,
      };
    })
    .filter((item) => item.totalCharacters > 0)
    .sort(
      (left, right) =>
        right.completionStreak - left.completionStreak ||
        right.masteredCharacters - left.masteredCharacters ||
        right.completedCharacters - left.completedCharacters,
    )
    .slice(0, 4);

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
      label: "Mastered words",
      value: String(progress.masteredCount),
      description: "Longer review intervals now drive vocabulary mastery instead of a manual toggle alone.",
    },
    {
      label: "Writing today",
      value: String(writingSessionsToday.length),
      description: "Phrase practice sessions from Hanzi Writer now show up in your progress story.",
    },
    {
      label: "Goal streak",
      value: String(dailyGoalStreak),
      description: `You are targeting ${dailyCharacterGoal} characters per day in the writing studio.`,
    },
    {
      label: "Mastered Hanzi",
      value: String(masteredCharactersTotal),
      description: "Character mastery now grows separately from phrase-level writing sessions.",
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
            <p>Review decisions today: {reviewsToday}</p>
            <p>Characters practiced today: {writingCharactersToday}</p>
            <p>Characters completed today: {charactersCompletedToday}</p>
            <p>Mastered Hanzi tracked: {masteredCharactersTotal}</p>
            <p>Daily Hanzi goal: {dailyCharacterGoal}</p>
            <p>Writing goal streak: {dailyGoalStreak} day(s)</p>
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

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Writing Sessions
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Your latest Hanzi practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentWritingSessions.length ? (
                recentWritingSessions.slice(0, 6).map((entry) => (
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
                      <p className="text-sm font-semibold text-red-700">
                        {entry.practicedCharacters} character{entry.practicedCharacters === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.practicedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Log a writing practice session from the writing page and it will appear here.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Writing Focus
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Phrases you practice the most
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mostPracticedWritingPhrases.length ? (
                mostPracticedWritingPhrases.map((entry) => (
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
                      {entry.sessions} writing session(s), {entry.practicedCharacters} characters practiced
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Your most-practiced writing phrases will show up after a few logged sessions.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Character Progress
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Your latest Hanzi completions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCharacterProgress.length ? (
                recentCharacterProgress.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-2xl font-semibold text-slate-950">
                        {entry.character}
                      </p>
                      <p className="text-sm text-slate-500">
                        {entry.vocabulary.englishText} · {entry.vocabulary.chineseText}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-700">
                        {entry.completedCount} completion{entry.completedCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.mastered ? "Mastered" : `${entry.practiceCount} total practice logs`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Mark characters complete from the writing page and they&apos;ll show up here.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Most Practiced Hanzi
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">
                Characters getting the most repetition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mostPracticedCharacters.length ? (
                mostPracticedCharacters.map((entry) => (
                  <div
                    key={entry.character}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  >
                    <p className="text-3xl font-semibold text-slate-950">
                      {entry.character}
                    </p>
                    <p className="text-sm text-slate-500">
                      {entry.practiceCount} practice log(s), {entry.completedCount} completion mark(s)
                    </p>
                    <p className="text-sm text-slate-500">
                      Mastered in {entry.masteredInstances} phrase position{entry.masteredInstances === 1 ? "" : "s"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Your most-practiced characters will appear after a few writing updates.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Phrase Streaks
            </p>
            <CardTitle className="mt-2 text-3xl text-slate-950">
              Saved phrases closest to full writing completion
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {phraseWritingStreaks.length ? (
              phraseWritingStreaks.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {entry.englishText}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {entry.chineseText}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Completion streak: {entry.completionStreak}/{entry.totalCharacters}
                  </p>
                  <p className="text-sm text-slate-500">
                    Started: {entry.completedCharacters}/{entry.totalCharacters} characters
                  </p>
                  <p className="text-sm text-slate-500">
                    Mastered: {entry.masteredCharacters}/{entry.totalCharacters} characters
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-500 md:col-span-2 xl:col-span-4">
                Start marking characters complete in the writing studio and your phrase streaks will show up here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
