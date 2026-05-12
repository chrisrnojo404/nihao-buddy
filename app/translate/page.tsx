import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sampleTranslation } from "@/lib/content";

export default function TranslatePage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Translator
            </p>
            <CardTitle className="mt-2 text-3xl text-slate-950">
              English to Mandarin input flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="english">
                English phrase
              </label>
              <Input id="english" placeholder="Type hello, school, or thank you" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="notes">
                Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Optional usage notes, memory hooks, or sentence ideas."
              />
            </div>
            <Button className="w-full">Translate and generate pinyin</Button>
          </CardContent>
        </Card>

        <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.28em] text-red-600">
              Mock Dictionary Output
            </p>
            <CardTitle className="mt-2 text-3xl">
              API route scaffolding is ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-red-100 bg-white/75 p-4">
              <p className="text-sm text-red-950/55">{sampleTranslation.english}</p>
              <p className="mt-2 text-5xl font-semibold">{sampleTranslation.chinese}</p>
              <p className="mt-2 text-lg text-red-700">
                {sampleTranslation.pinyin}
              </p>
            </div>
            <p className="text-sm leading-7 text-red-950/70">
              `POST /api/translate` validates input with zod, looks up the mock
              dictionary, and returns Chinese text plus generated pinyin.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
