import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requirePageUser();
  const [progress, vocabularyCount] = await Promise.all([
    prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    }),
    prisma.vocabulary.count({
      where: { userId: user.id },
    }),
  ]);

  const dashboardMetrics = [
    {
      label: "Saved words",
      value: String(vocabularyCount),
      description: "Vocabulary total is now coming from your saved study list.",
    },
    {
      label: "Review streak",
      value: `${progress.streakDays} days`,
      description: "Streaks are stored on your progress record and ready for review flows.",
    },
    {
      label: "Mastered",
      value: String(progress.masteredCount),
      description: "Marking vocabulary as mastered now updates your dashboard totals.",
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

        <section className="grid gap-4 md:grid-cols-3">
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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
