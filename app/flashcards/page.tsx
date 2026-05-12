import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleVocabulary } from "@/lib/content";

export default function FlashcardsPage() {
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
          {sampleVocabulary.map((item) => (
            <Card
              key={item.english}
              className="border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <CardHeader>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Prompt
                </p>
                <CardTitle className="mt-2 text-2xl text-slate-950">
                  {item.english}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-4xl font-semibold text-slate-950">
                  {item.chinese}
                </p>
                <p className="text-sm font-medium text-red-700">
                  {item.pinyin}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
