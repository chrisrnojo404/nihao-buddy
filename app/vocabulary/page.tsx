import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleVocabulary } from "@/lib/content";

export default function VocabularyPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Vocabulary
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Saved phrases and review queue
          </h1>
        </div>

        <div className="grid gap-4">
          {sampleVocabulary.map((item) => (
            <Card
              key={item.english}
              className="border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    {item.english}
                  </p>
                  <CardTitle className="mt-2 text-3xl text-slate-950">
                    {item.chinese}
                  </CardTitle>
                </div>
                <p className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  {item.pinyin}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">
                  The vocabulary CRUD API routes are scaffolded and protected by
                  the JWT helper foundation.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
