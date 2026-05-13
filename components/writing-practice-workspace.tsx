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

type WritingPracticeWorkspaceProps = {
  vocabulary: VocabularyItem[];
};

export function WritingPracticeWorkspace({
  vocabulary,
}: WritingPracticeWorkspaceProps) {
  const [selectedPhraseId, setSelectedPhraseId] = useState(vocabulary[0]?.id ?? "");
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);

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

  function choosePhrase(id: string) {
    setSelectedPhraseId(id);
    setSelectedCharacterIndex(0);
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
          <CharacterPracticePreview
            character={selectedCharacter}
            strokeNames={strokeNamesByCharacter[selectedCharacter] ?? []}
          />
          <div className="flex flex-wrap gap-2">
            {characters.map((character, index) => (
              <Button
                key={`${selectedPhrase?.id}-${character}-${index}`}
                type="button"
                variant={index === selectedCharacterIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCharacterIndex(index)}
              >
                {character}
              </Button>
            ))}
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
