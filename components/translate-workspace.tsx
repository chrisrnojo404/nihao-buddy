"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TranslationResult = {
  english: string;
  chinese: string;
  pinyin: string;
  characters: string[];
  matchedBy: "exact" | "combined" | "template";
  category: "word" | "phrase";
};

type TranslationSuggestion = {
  english: string;
  chinese: string;
  pinyin: string;
};

export function TranslateWorkspace() {
  const [english, setEnglish] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canSpeak = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  async function handleTranslate() {
    setIsTranslating(true);
    setError("");
    setSaveMessage("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: english }),
      });

      const payload = (await response.json()) as {
        data?: TranslationResult;
        error?: string;
        details?: {
          suggestions?: TranslationSuggestion[];
        };
      };

      if (!response.ok || !payload.data) {
        setResult(null);
        setError(payload.error ?? "Unable to translate that phrase.");
        setSuggestions(payload.details?.suggestions ?? []);
        return;
      }

      setResult(payload.data);
    } catch {
      setResult(null);
      setError("Unable to reach the translation service.");
      setSuggestions([]);
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleSave() {
    if (!result) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          englishText: result.english,
          chineseText: result.chinese,
          pinyin: result.pinyin,
          notes,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save vocabulary.");
        return;
      }

      setSaveMessage("Saved to your vocabulary list.");
    } catch {
      setError("Unable to save this phrase right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function speakChinese() {
    if (!result || !canSpeak) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(result.chinese);
    utterance.lang = "zh-CN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Translator
          </p>
          <CardTitle className="mt-2 text-3xl text-slate-950">
            Translate and save beginner Mandarin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="english">
              English phrase
            </label>
            <Input
              id="english"
              placeholder="Type hello, school, or thank you"
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="notes">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Optional usage notes, memory hooks, or sentence ideas."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          {error ? (
            <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              {suggestions.length ? (
                <div className="space-y-2">
                  <p className="font-medium text-red-800">Try one of these instead:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.english}-${suggestion.chinese}`}
                        type="button"
                        onClick={() => {
                          setEnglish(suggestion.english);
                          setError("");
                        }}
                        className="rounded-full border border-red-200 bg-white/90 px-3 py-2 text-left text-xs font-medium text-red-800 transition hover:bg-red-100"
                      >
                        {suggestion.english}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {saveMessage ? (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {saveMessage}
            </p>
          ) : null}
          <Button className="w-full" disabled={isTranslating || !english.trim()} onClick={handleTranslate}>
            {isTranslating ? "Translating..." : "Translate and generate pinyin"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.28em] text-red-600">
            Translation Result
          </p>
          <CardTitle className="mt-2 text-3xl">
            {result ? "Your live translation" : "Ready for your first phrase"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="rounded-2xl border border-red-100 bg-white/75 p-4">
                <p className="text-sm text-red-950/55">{result.english}</p>
                <p className="mt-2 text-5xl font-semibold">{result.chinese}</p>
                <p className="mt-2 text-lg text-red-700">{result.pinyin}</p>
                <p className="mt-3 text-sm text-red-950/60">
                  {result.matchedBy === "exact"
                    ? `Matched as a beginner ${result.category}.`
                    : result.matchedBy === "template"
                      ? "Built from a reusable beginner phrase pattern."
                      : "Built from multiple beginner dictionary words."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.characters.map((character) => (
                  <span
                    key={`${result.chinese}-${character}`}
                    className="rounded-full border border-red-200 bg-white/80 px-3 py-2 text-lg font-medium text-red-800"
                  >
                    {character}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save to vocabulary"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={speakChinese}
                  disabled={!canSpeak}
                >
                  {canSpeak ? "Play Mandarin audio" : "Speech not available"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm leading-7 text-red-950/70">
              Try beginner words and phrases like hello, how are you, thank you,
              good evening, i am from suriname, where is the school, i want tea,
              family, school, teacher, friend, china, and suriname.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
