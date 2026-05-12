import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-6">
        <p className="inline-flex rounded-full border border-red-200 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.28em] text-red-700">
          Production-ready MVP foundation
        </p>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Learn Mandarin with translation, writing practice, and a vocabulary loop that sticks.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            nihao buddy is designed for beginners who want clear Chinese
            characters, instant pinyin, speech playback, saved phrases, and
            lightweight progress tracking in one calm study space.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">Start learning</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/translate">View translator shell</Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-red-600">
              Today&apos;s phrase
            </p>
            <p className="text-5xl font-semibold">谢谢</p>
            <p className="text-lg text-red-700">xiè xie</p>
            <p className="text-sm leading-7 text-red-950/70">
              Beginner-friendly translation scaffolding is already connected to
              automatic pinyin generation with `pinyin-pro`.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-white/75 p-4">
              <p className="text-sm text-red-950/55">Vocabulary target</p>
              <p className="mt-2 text-3xl font-semibold">24 words</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white/75 p-4">
              <p className="text-sm text-red-950/55">Writing practice</p>
              <p className="mt-2 text-3xl font-semibold">4 hanzi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
