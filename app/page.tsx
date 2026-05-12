import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CharacterPracticePreview } from "@/components/character-practice-preview";
import { FeatureCard } from "@/components/feature-card";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coreFeatures, learningPath, sampleVocabulary } from "@/lib/content";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-10">
        <HeroSection />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                  Vocabulary Preview
                </p>
                <CardTitle className="mt-2 text-2xl text-slate-900">
                  Beginner phrases you can save and review
                </CardTitle>
              </div>
              <Button asChild variant="outline">
                <Link href="/translate">Open translator</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {sampleVocabulary.map((item) => (
                <div
                  key={item.english}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-slate-500">{item.english}</p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {item.chinese}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-red-700">
                    {item.pinyin}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Writing Practice
              </p>
              <CardTitle className="mt-2 text-2xl text-slate-900">
                Practice strokes one character at a time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CharacterPracticePreview character="你" />
              <p className="text-sm leading-7 text-slate-600">
                The writing studio will split full Mandarin phrases into single
                characters so learners can practice stroke order with Hanzi
                Writer.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-red-600">
                Phase 1 Delivered
              </p>
              <CardTitle className="mt-2 text-3xl">
                Architecture ready for auth, vocabulary, and review workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-red-950/70">
              <p>
                This first pass sets up the project structure, Prisma schema,
                JWT helpers, zod validation, the translation dictionary, and
                the core pages we&apos;ll keep building on.
              </p>
              <Button asChild className="bg-red-600 text-white hover:bg-red-500">
                <Link href="/dashboard">Explore the dashboard shell</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                Build Path
              </p>
              <CardTitle className="mt-2 text-2xl text-slate-900">
                What the MVP is designed to support next
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {learningPath.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl border border-slate-200/80 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
