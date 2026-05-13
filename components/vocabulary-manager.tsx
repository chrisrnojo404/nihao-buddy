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
  createdAt: string | Date;
};

type VocabularyManagerProps = {
  initialVocabulary: VocabularyItem[];
};

export function VocabularyManager({
  initialVocabulary,
}: VocabularyManagerProps) {
  const [items, setItems] = useState(initialVocabulary);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const masteredCount = useMemo(
    () => items.filter((item) => item.mastered).length,
    [items],
  );

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
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {items.length ? (
        <div className="grid gap-4">
          {items.map((item) => (
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
                <div className="flex flex-col gap-3 sm:flex-row">
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
          ))}
        </div>
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
