import { AppShell } from "@/components/app-shell";
import { CharacterPracticePreview } from "@/components/character-practice-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WritingPage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Hanzi Writer
            </p>
            <CardTitle className="mt-2 text-3xl text-slate-950">
              Character-by-character writing drills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CharacterPracticePreview character="学" />
          </CardContent>
        </Card>

        <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-red-600">
              Practice Flow
            </p>
            <CardTitle className="mt-2 text-3xl">
              Split a full sentence into individual learning targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-red-950/70">
            <p>
              The shared translation helpers already expose per-character arrays
              so the writing experience can cycle through each hanzi in order.
            </p>
            <div className="rounded-2xl border border-red-100 bg-white/75 p-4">
              <p className="text-sm text-red-950/55">Example sentence</p>
              <p className="mt-2 text-4xl font-semibold">谢谢朋友</p>
              <p className="mt-3 text-sm text-red-700">谢 · 谢 · 朋 · 友</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
