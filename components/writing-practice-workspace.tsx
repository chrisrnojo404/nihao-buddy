"use client";

import { useMemo, useState } from "react";

import {
  CharacterPracticePreview,
  strokeNamesByCharacter,
} from "@/components/character-practice-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VocabularyItem = {
  id: string;
  englishText: string;
  chineseText: string;
  pinyin: string;
  notes: string | null;
};

type CharacterProgressItem = {
  id: string;
  vocabularyId: string;
  character: string;
  characterIndex: number;
  practiceCount: number;
  completedCount: number;
  mastered: boolean;
  lastPracticedAt?: string | Date | null;
};

type WritingPracticeWorkspaceProps = {
  vocabulary: VocabularyItem[];
  initialPhraseId?: string;
  initialCharacterProgress: CharacterProgressItem[];
  initialDailyCharacterGoal: number;
  initialTodayCharacterCount: number;
  initialGoalStreak: number;
};

const CHARACTER_MASTERY_TARGET = 3;

export function WritingPracticeWorkspace({
  vocabulary,
  initialPhraseId,
  initialCharacterProgress,
  initialDailyCharacterGoal,
  initialTodayCharacterCount,
  initialGoalStreak,
}: WritingPracticeWorkspaceProps) {
  const [selectedPhraseId, setSelectedPhraseId] = useState(
    initialPhraseId && vocabulary.some((item) => item.id === initialPhraseId)
      ? initialPhraseId
      : (vocabulary[0]?.id ?? ""),
  );
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);
  const [characterProgress, setCharacterProgress] = useState(initialCharacterProgress);
  const [dailyCharacterGoal] = useState(initialDailyCharacterGoal);
  const [todayCharacterCount, setTodayCharacterCount] = useState(initialTodayCharacterCount);
  const [goalStreak, setGoalStreak] = useState(initialGoalStreak);

  const selectedPhrase =
    vocabulary.find((item) => item.id === selectedPhraseId) ?? vocabulary[0] ?? null;

  const characters = useMemo(
    () =>
      selectedPhrase
        ? Array.from(selectedPhrase.chineseText).filter((character) => character.trim())
        : [],
    [selectedPhrase],
  );

  const selectedCharacter = characters[selectedCharacterIndex] ?? characters[0] ?? "";
  const activeCharacterProgress =
    characterProgress.find(
      (entry) =>
        entry.vocabularyId === selectedPhrase?.id &&
        entry.characterIndex === selectedCharacterIndex,
    ) ?? null;
  const masteredCharactersCount = characterProgress.filter(
    (entry) => entry.vocabularyId === selectedPhrase?.id && entry.mastered,
  ).length;
  const completedCharactersCount = characterProgress.filter(
    (entry) =>
      entry.vocabularyId === selectedPhrase?.id && entry.completedCount > 0,
  ).length;
  const phraseCompletionStreak = characters.reduce((streak, _, index) => {
    const progress = characterProgress.find(
      (entry) =>
        entry.vocabularyId === selectedPhrase?.id &&
        entry.characterIndex === index &&
        entry.completedCount > 0,
    );

    if (!progress || streak !== index) {
      return streak;
    }

    return streak + 1;
  }, 0);
  const dailyGoalRemaining = Math.max(dailyCharacterGoal - todayCharacterCount, 0);
  const dailyGoalMet = todayCharacterCount >= dailyCharacterGoal;

  function choosePhrase(id: string) {
    setSelectedPhraseId(id);
    setSelectedCharacterIndex(0);
    setStatusMessage("");
    setErrorMessage("");
  }

  async function updateCharacterProgress(action: "practice" | "complete") {
    if (!selectedPhrase || !selectedCharacter) {
      return;
    }

    setIsSavingCharacter(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/progress/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vocabularyId: selectedPhrase.id,
          character: selectedCharacter,
          characterIndex: selectedCharacterIndex,
          action,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        data?: {
          characterProgress: CharacterProgressItem;
          masteryTarget: number;
        };
      };

      if (!response.ok || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to save character progress.");
        return;
      }

      const updatedCharacterProgress = payload.data.characterProgress;
      setCharacterProgress((current) => {
        const existingIndex = current.findIndex(
          (entry) =>
            entry.vocabularyId === updatedCharacterProgress.vocabularyId &&
            entry.characterIndex === updatedCharacterProgress.characterIndex,
        );

        if (existingIndex === -1) {
          return [...current, updatedCharacterProgress];
        }

        return current.map((entry, index) =>
          index === existingIndex ? updatedCharacterProgress : entry,
        );
      });

      const completedLabel =
        action === "complete"
          ? `Marked ${selectedCharacter} complete. ${updatedCharacterProgress.completedCount}/${payload.data.masteryTarget} completions toward mastery.`
          : `Logged extra practice for ${selectedCharacter}. Practice count is now ${updatedCharacterProgress.practiceCount}.`;
      setStatusMessage(completedLabel);
    } catch {
      setErrorMessage("Unable to save character progress right now.");
    } finally {
      setIsSavingCharacter(false);
    }
  }

  async function logWritingSession() {
    if (!selectedPhrase) {
      return;
    }

    setIsSavingSession(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/progress/writing-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vocabularyId: selectedPhrase.id,
          practicedCharacters: Math.max(characters.length, 1),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to record this writing session.");
        return;
      }

      const practicedCharacters = Math.max(characters.length, 1);
      setTodayCharacterCount((current) => {
        const next = current + practicedCharacters;

        if (current < dailyCharacterGoal && next >= dailyCharacterGoal) {
          setGoalStreak((streak) => streak + 1);
        }

        return next;
      });
      setSessionCount((current) => current + 1);
      setStatusMessage(
        `Saved a writing session for ${selectedPhrase.chineseText}. Dashboard analytics will reflect it now.`,
      );
    } catch {
      setErrorMessage("Unable to record this writing session right now.");
    } finally {
      setIsSavingSession(false);
    }
  }

  if (!vocabulary.length) {
    return (
      <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardContent className="py-10 text-center text-sm leading-7 text-red-950/70">
          Save a few translated phrases first, then they&apos;ll appear here for
          character-by-character writing practice.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Hanzi Writer
          </p>
          <CardTitle className="mt-2 text-3xl text-slate-950">
            Practice saved vocabulary one character at a time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-red-100 bg-red-50/55 px-4 py-3">
            <p className="text-sm uppercase tracking-[0.2em] text-red-700/80">
              Active phrase
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {selectedPhrase?.englishText}
            </p>
            <p className="text-4xl font-semibold text-red-900">
              {selectedPhrase?.chineseText}
            </p>
            <p className="text-sm text-red-700">{selectedPhrase?.pinyin}</p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-red-100 bg-white/75 px-4 py-4 text-sm text-slate-600 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-medium text-red-900">
                Practice summary
              </p>
              <p>
                {characters.length} character{characters.length === 1 ? "" : "s"} in
                this phrase. Sessions logged this visit: {sessionCount}
              </p>
              <p>
                {masteredCharactersCount}/{characters.length} characters mastered for this phrase
              </p>
            </div>
            <Button
              type="button"
              disabled={isSavingSession || !selectedPhrase}
              onClick={logWritingSession}
            >
              {isSavingSession ? "Saving..." : "Log practice session"}
            </Button>
          </div>
          <div className="grid gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-4 py-4 text-sm text-red-950/75 md:grid-cols-2">
            <p>
              Daily Hanzi target:{" "}
              <span className="font-semibold text-red-900">
                {todayCharacterCount}/{dailyCharacterGoal}
              </span>
            </p>
            <p>
              Goal streak:{" "}
              <span className="font-semibold text-red-900">
                {goalStreak} day{goalStreak === 1 ? "" : "s"}
              </span>
            </p>
            <p>
              {dailyGoalMet
                ? "You hit today’s writing target."
                : `${dailyGoalRemaining} more character${dailyGoalRemaining === 1 ? "" : "s"} to reach today’s goal.`}
            </p>
            <p>
              Phrase completion streak:{" "}
              <span className="font-semibold text-red-900">
                {phraseCompletionStreak}/{characters.length}
              </span>
            </p>
          </div>
          {statusMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <CharacterPracticePreview
            character={selectedCharacter}
            strokeNames={strokeNamesByCharacter[selectedCharacter] ?? []}
          />
          <div className="grid gap-3 rounded-2xl border border-red-100 bg-white/75 px-4 py-4 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              Practice count:{" "}
              <span className="font-semibold text-red-900">
                {activeCharacterProgress?.practiceCount ?? 0}
              </span>
            </p>
            <p>
              Completion marks:{" "}
              <span className="font-semibold text-red-900">
                {activeCharacterProgress?.completedCount ?? 0}/{CHARACTER_MASTERY_TARGET}
              </span>
            </p>
            <p>
              Phrase progress:{" "}
              <span className="font-semibold text-red-900">
                {completedCharactersCount}/{characters.length} characters started
              </span>
            </p>
            <p>
              Mastery state:{" "}
              <span className="font-semibold text-red-900">
                {activeCharacterProgress?.mastered ? "Mastered" : "Learning"}
              </span>
            </p>
            <p>
              Last practiced:{" "}
              <span className="font-semibold text-red-900">
                {activeCharacterProgress?.lastPracticedAt
                  ? new Date(activeCharacterProgress.lastPracticedAt).toLocaleDateString()
                  : "Not yet"}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isSavingCharacter || !selectedCharacter}
              onClick={() => updateCharacterProgress("practice")}
            >
              {isSavingCharacter ? "Saving..." : "Log extra practice"}
            </Button>
            <Button
              type="button"
              disabled={isSavingCharacter || !selectedCharacter}
              onClick={() => updateCharacterProgress("complete")}
            >
              {isSavingCharacter ? "Saving..." : "Mark character complete"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {characters.map((character, index) => {
              const progress =
                characterProgress.find(
                  (entry) =>
                    entry.vocabularyId === selectedPhrase?.id &&
                    entry.characterIndex === index,
                ) ?? null;

              const label = progress?.mastered
                ? `${character} mastered`
                : progress?.completedCount
                  ? `${character} ${progress.completedCount}/${CHARACTER_MASTERY_TARGET}`
                  : character;

              return (
                <Button
                  key={`${selectedPhrase?.id}-${character}-${index}`}
                  type="button"
                  variant={index === selectedCharacterIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCharacterIndex(index)}
                  className={
                    progress?.mastered && index !== selectedCharacterIndex
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : undefined
                  }
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,242,242,0.95))] text-red-950 shadow-[0_24px_80px_rgba(185,28,28,0.12)]">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.28em] text-red-600">
            Practice Queue
          </p>
          <CardTitle className="mt-2 text-3xl">
            Switch between saved phrases and split them into study targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-red-950/70">
          <p>
            Pick a phrase below to break it into individual hanzi. This keeps writing
            practice aligned with the vocabulary you&apos;ve already saved.
          </p>
          <div className="grid gap-3">
            {vocabulary.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choosePhrase(item.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                  item.id === selectedPhrase?.id
                    ? "border-red-300 bg-red-100/80"
                    : "border-red-100 bg-white/75 hover:bg-red-50"
                }`}
              >
                <p className="text-sm uppercase tracking-[0.18em] text-red-700/75">
                  {item.englishText}
                </p>
                <p className="mt-1 text-2xl font-semibold text-red-950">
                  {item.chineseText}
                </p>
                <p className="text-sm text-red-700">{item.pinyin}</p>
                <p className="mt-2 text-xs tracking-[0.12em] text-red-950/60">
                  {Array.from(item.chineseText)
                    .filter((character) => character.trim())
                    .join(" · ")}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
