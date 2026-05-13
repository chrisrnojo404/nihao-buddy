import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FlashcardsPage() {
  const user = await requirePageUser();
  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId: user.id },
    orderBy: [{ mastered: "asc" }, { createdAt: "desc" }],
    take: 12,
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Flashcards
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Review saved Mandarin with spaced repetition hooks
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vocabulary.map((item) => (
            <Card
              key={item.id}
              className="border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <CardHeader>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Prompt
                </p>
                <CardTitle className="mt-2 text-2xl text-slate-950">
                  {item.englishText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-4xl font-semibold text-slate-950">
                  {item.chineseText}
                </p>
                <p className="text-sm font-medium text-red-700">
                  {item.pinyin}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {!vocabulary.length ? (
          <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
            <CardContent className="py-10 text-center text-sm leading-7 text-red-950/70">
              Save a few translated phrases first, then your flashcards will show up here.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
