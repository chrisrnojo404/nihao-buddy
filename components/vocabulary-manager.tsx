"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type VocabularyItem = {
  id: string;
  englishText: string;
  chineseText: string;
  pinyin: string;
  notes: string | null;
  mastered: boolean;
  reviewCount: number;
  intervalDays?: number;
  easeFactor?: number;
  nextReviewAt?: string | Date;
  lastReviewedAt?: string | Date | null;
  createdAt: string | Date;
};

type VocabularyManagerProps = {
  initialVocabulary: VocabularyItem[];
};

type FilterKey = "all" | "due" | "learning" | "mastered" | "recent";
type SortKey = "newest" | "nextReview" | "mostReviewed" | "hardest";

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  due: "Due now",
  learning: "Learning",
  mastered: "Mastered",
  recent: "Recent",
};

export function VocabularyManager({
  initialVocabulary,
}: VocabularyManagerProps) {
  const [items, setItems] = useState(initialVocabulary);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [renderedAt] = useState(() => Date.now());

  const masteredCount = useMemo(
    () => items.filter((item) => item.mastered).length,
    [items],
  );

  function getReviewSnapshot(item: VocabularyItem) {
    return {
      reviewCount: item.reviewCount ?? 0,
      intervalDays: item.intervalDays ?? 0,
      easeFactor: item.easeFactor ?? 2.5,
      createdAtTimestamp: new Date(item.createdAt).getTime(),
      lastReviewedTimestamp: item.lastReviewedAt
        ? new Date(item.lastReviewedAt).getTime()
        : 0,
      nextReviewLabel: item.nextReviewAt
        ? new Date(item.nextReviewAt).toLocaleDateString()
        : "Not scheduled",
      nextReviewTimestamp: item.nextReviewAt
        ? new Date(item.nextReviewAt).getTime()
        : Number.POSITIVE_INFINITY,
    };
  }

  const dueCount = useMemo(
    () =>
      items.filter(
        (item) => getReviewSnapshot(item).nextReviewTimestamp <= renderedAt,
      ).length,
    [items, renderedAt],
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const recentCutoff = renderedAt - 1000 * 60 * 60 * 24 * 7;

    return [...items]
      .filter((item) => {
        const review = getReviewSnapshot(item);
        const matchesQuery =
          !normalizedQuery ||
          item.englishText.toLowerCase().includes(normalizedQuery) ||
          item.chineseText.toLowerCase().includes(normalizedQuery) ||
          item.pinyin.toLowerCase().includes(normalizedQuery) ||
          item.notes?.toLowerCase().includes(normalizedQuery);

        if (!matchesQuery) {
          return false;
        }

        switch (activeFilter) {
          case "due":
            return review.nextReviewTimestamp <= renderedAt;
          case "learning":
            return !item.mastered;
          case "mastered":
            return item.mastered;
          case "recent":
            return review.createdAtTimestamp >= recentCutoff;
          case "all":
          default:
            return true;
        }
      })
      .sort((left, right) => {
        const leftReview = getReviewSnapshot(left);
        const rightReview = getReviewSnapshot(right);

        switch (sortKey) {
          case "nextReview":
            return leftReview.nextReviewTimestamp - rightReview.nextReviewTimestamp;
          case "mostReviewed":
            if (rightReview.reviewCount !== leftReview.reviewCount) {
              return rightReview.reviewCount - leftReview.reviewCount;
            }
            return rightReview.lastReviewedTimestamp - leftReview.lastReviewedTimestamp;
          case "hardest":
            if (leftReview.easeFactor !== rightReview.easeFactor) {
              return leftReview.easeFactor - rightReview.easeFactor;
            }
            return rightReview.reviewCount - leftReview.reviewCount;
          case "newest":
          default:
            return rightReview.createdAtTimestamp - leftReview.createdAtTimestamp;
        }
      });
  }, [activeFilter, items, query, renderedAt, sortKey]);

  async function removeItem(id: string) {
    setBusyId(id);
    setError("");

    const response = await fetch(`/api/vocabulary/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Unable to delete vocabulary item.");
      setBusyId(null);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setBusyId(null);
  }

  async function toggleMastered(item: VocabularyItem) {
    setBusyId(item.id);
    setError("");

    const response = await fetch(`/api/vocabulary/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mastered: !item.mastered,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      data?: {
        vocabulary: VocabularyItem;
      };
    };

    if (!response.ok || !payload.data) {
      setError(payload.error ?? "Unable to update vocabulary item.");
      setBusyId(null);
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? payload.data!.vocabulary : entry,
      ),
    );
    setBusyId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Vocabulary
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Saved phrases and review queue
          </h1>
        </div>
        <div className="rounded-[28px] border border-red-100 bg-white/85 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_40px_rgba(185,28,28,0.08)]">
          <p>
            <span className="font-semibold text-red-800">{items.length}</span> saved
            items
          </p>
          <p>
            <span className="font-semibold text-red-800">{masteredCount}</span> marked
            mastered
          </p>
          <p>
            <span className="font-semibold text-red-800">{dueCount}</span> due now
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {items.length ? (
        <>
          <Card className="border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search English, Chinese, pinyin, or notes"
                  aria-label="Search vocabulary"
                />
                <label className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-slate-600">
                  <span className="font-medium text-red-900">Sort</span>
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as SortKey)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="nextReview">Next review first</option>
                    <option value="mostReviewed">Most reviewed</option>
                    <option value="hardest">Hardest first</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(FILTER_LABELS) as FilterKey[]).map((filterKey) => (
                  <Button
                    key={filterKey}
                    type="button"
                    size="sm"
                    variant={activeFilter === filterKey ? "default" : "outline"}
                    onClick={() => setActiveFilter(filterKey)}
                  >
                    {FILTER_LABELS[filterKey]}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing <span className="font-semibold text-red-800">{visibleItems.length}</span>{" "}
                  of <span className="font-semibold text-red-800">{items.length}</span> saved items
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/flashcards">Study all cards</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/flashcards?mode=due">Study due cards</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {visibleItems.length ? (
        <div className="grid gap-4">
          {visibleItems.map((item) => {
            const review = getReviewSnapshot(item);

            return (
            <Card
              key={item.id}
              className="border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    {item.englishText}
                  </p>
                  <CardTitle className="mt-2 text-3xl text-slate-950">
                    {item.chineseText}
                  </CardTitle>
                </div>
                <p className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  {item.pinyin}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.notes ? (
                  <p className="text-sm leading-7 text-slate-600">{item.notes}</p>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    No notes added yet.
                  </p>
                )}
                <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                  <p>Reviews: {review.reviewCount}</p>
                  <p>Interval: {review.intervalDays} day(s)</p>
                  <p>Ease factor: {review.easeFactor.toFixed(2)}</p>
                  <p>Next due: {review.nextReviewLabel}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild type="button" variant="outline">
                    <Link href={`/writing?phrase=${item.id}`}>Practice this phrase</Link>
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link href={`/flashcards?focus=${item.id}`}>Review this card</Link>
                  </Button>
                  <Button
                    type="button"
                    variant={item.mastered ? "outline" : "default"}
                    disabled={busyId === item.id}
                    onClick={() => toggleMastered(item)}
                  >
                    {busyId === item.id
                      ? "Updating..."
                      : item.mastered
                        ? "Mark as learning"
                        : "Mark as mastered"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyId === item.id}
                    onClick={() => removeItem(item.id)}
                  >
                    {busyId === item.id ? "Working..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
          ) : (
            <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
              <CardContent className="py-10">
                <p className="text-center text-sm leading-7 text-red-950/70">
                  No vocabulary matches this search and filter combination yet.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
          <CardContent className="py-10">
            <p className="text-center text-sm leading-7 text-red-950/70">
              Your vocabulary list is empty right now. Save a translated phrase
              from the translate page to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
