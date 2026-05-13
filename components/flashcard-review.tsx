"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VocabularyItem = {
  id: string;
  englishText: string;
  chineseText: string;
  pinyin: string;
  notes: string | null;
  mastered: boolean;
  reviewCount: number;
};

type FlashcardReviewProps = {
  vocabulary: VocabularyItem[];
  initialProgress: {
    totalReviewed: number;
    streakDays: number;
    masteredCount: number;
  };
};

export function FlashcardReview({
  vocabulary,
  initialProgress,
}: FlashcardReviewProps) {
  const [cards, setCards] = useState(vocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  const currentCard = cards[currentIndex] ?? null;
  const completionRatio = useMemo(() => {
    if (!cards.length) {
      return 0;
    }

    return Math.round((progress.masteredCount / cards.length) * 100);
  }, [cards.length, progress.masteredCount]);

  function goToNextCard() {
    setRevealed(false);
    setCurrentIndex((index) => (index + 1) % cards.length);
  }

  async function recordReview(markMastered: boolean) {
    if (!currentCard) {
      return;
    }

    setIsUpdating(true);
    setError("");

    const nextReviewCount = currentCard.reviewCount + 1;
    const nextTotalReviewed = progress.totalReviewed + 1;

    try {
      const vocabularyResponse = await fetch(`/api/vocabulary/${currentCard.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewCount: nextReviewCount,
          mastered: markMastered ? true : currentCard.mastered,
        }),
      });

      const vocabularyPayload = (await vocabularyResponse.json()) as {
        error?: string;
        data?: {
          vocabulary: VocabularyItem;
        };
      };

      if (!vocabularyResponse.ok || !vocabularyPayload.data) {
        setError(vocabularyPayload.error ?? "Unable to update this flashcard.");
        return;
      }

      const progressResponse = await fetch("/api/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalReviewed: nextTotalReviewed,
          lastPracticedAt: new Date().toISOString(),
        }),
      });

      const progressPayload = (await progressResponse.json()) as {
        error?: string;
      };

      if (!progressResponse.ok) {
        setError(progressPayload.error ?? "Unable to update progress.");
        return;
      }

      const updatedCard = vocabularyPayload.data.vocabulary;
      setCards((current) =>
        current.map((item) => (item.id === updatedCard.id ? updatedCard : item)),
      );
      setProgress((current) => ({
        ...current,
        totalReviewed: nextTotalReviewed,
        masteredCount:
          markMastered && !currentCard.mastered
            ? current.masteredCount + 1
            : current.masteredCount,
      }));
      goToNextCard();
    } catch {
      setError("Unable to save your flashcard progress right now.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (!cards.length) {
    return (
      <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardContent className="py-10 text-center text-sm leading-7 text-red-950/70">
          Save a few translated phrases first, then your flashcards will show up here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Flashcards
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Review saved Mandarin with a live progress loop
          </h1>
        </div>
        <div className="rounded-[28px] border border-red-100 bg-white/85 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_40px_rgba(185,28,28,0.08)]">
          <p>
            <span className="font-semibold text-red-800">{progress.totalReviewed}</span> total
            reviews
          </p>
          <p>
            <span className="font-semibold text-red-800">{completionRatio}%</span> of saved
            cards mastered
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.28em] text-red-600">
            Card {currentIndex + 1} of {cards.length}
          </p>
          <CardTitle className="mt-2 text-3xl text-red-950">
            {currentCard?.englishText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[28px] border border-red-100 bg-white/85 p-8 text-center shadow-[0_16px_40px_rgba(185,28,28,0.06)]">
            <p className="text-sm uppercase tracking-[0.2em] text-red-700/75">
              Prompt
            </p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">
              {currentCard?.englishText}
            </p>
            {revealed ? (
              <div className="mt-6 space-y-2">
                <p className="text-5xl font-semibold text-red-950">
                  {currentCard?.chineseText}
                </p>
                <p className="text-lg text-red-700">{currentCard?.pinyin}</p>
                {currentCard?.notes ? (
                  <p className="mx-auto max-w-xl text-sm leading-7 text-red-950/70">
                    {currentCard.notes}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 text-sm text-red-950/55">
                Reveal the answer when you&apos;re ready.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setRevealed((current) => !current)}>
              {revealed ? "Hide answer" : "Reveal answer"}
            </Button>
            <Button type="button" variant="outline" onClick={goToNextCard}>
              Next card
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" disabled={isUpdating} onClick={() => recordReview(false)}>
              {isUpdating ? "Saving..." : "Mark reviewed"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating || currentCard?.mastered}
              onClick={() => recordReview(true)}
            >
              {currentCard?.mastered ? "Already mastered" : "Mark mastered"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
