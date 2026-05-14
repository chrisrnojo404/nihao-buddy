import { AppShell } from "@/components/app-shell";
import { WritingPracticeWorkspace } from "@/components/writing-practice-workspace";
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

export default async function WritingPage({
  searchParams,
}: PageProps<"/writing">) {
  const user = await requirePageUser();
  const { phrase } = await searchParams;
  const [vocabulary, characterProgress, progress, writingSessions] = await Promise.all([
    prisma.vocabulary.findMany({
      where: { userId: user.id },
      orderBy: [{ mastered: "asc" }, { createdAt: "desc" }],
    }),
    "characterProgress" in prisma && prisma.characterProgress
      ? prisma.characterProgress.findMany({
          where: { userId: user.id },
          orderBy: [{ updatedAt: "desc" }],
        })
      : Promise.resolve([]),
    prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    }),
    "writingSession" in prisma && prisma.writingSession
      ? prisma.writingSession.findMany({
          where: { userId: user.id },
          orderBy: [{ practicedAt: "desc" }],
          take: 90,
        })
      : Promise.resolve([]),
  ]);
  const initialPhraseId = typeof phrase === "string" ? phrase : undefined;
  const dailyCharacterGoal = progress.dailyCharacterGoal ?? 5;
  const today = new Date();
  const initialTodayCharacterCount = writingSessions
    .filter((entry) => {
      const practicedAt = toValidDate(entry.practicedAt);

      if (!practicedAt) {
        return false;
      }

      return (
        practicedAt.getFullYear() === today.getFullYear() &&
        practicedAt.getMonth() === today.getMonth() &&
        practicedAt.getDate() === today.getDate()
      );
    })
    .reduce((total, entry) => total + entry.practicedCharacters, 0);

  const writingDaysByDate = new Map<string, number>();
  for (const session of writingSessions) {
    const practicedAt = toValidDate(session.practicedAt);

    if (!practicedAt) {
      continue;
    }

    const dateKey = practicedAt.toISOString().slice(0, 10);
    writingDaysByDate.set(
      dateKey,
      (writingDaysByDate.get(dateKey) ?? 0) + session.practicedCharacters,
    );
  }

  let initialGoalStreak = 0;
  const cursor = new Date(today);
  while (!Number.isNaN(cursor.getTime()) && initialGoalStreak < 365) {
    const key = cursor.toISOString().slice(0, 10);
    const practiced = writingDaysByDate.get(key) ?? 0;

    if (practiced < dailyCharacterGoal) {
      break;
    }

    initialGoalStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return (
    <AppShell>
      <WritingPracticeWorkspace
        vocabulary={vocabulary}
        initialPhraseId={initialPhraseId}
        initialCharacterProgress={characterProgress}
        initialDailyCharacterGoal={dailyCharacterGoal}
        initialTodayCharacterCount={initialTodayCharacterCount}
        initialGoalStreak={initialGoalStreak}
      />
    </AppShell>
  );
}
