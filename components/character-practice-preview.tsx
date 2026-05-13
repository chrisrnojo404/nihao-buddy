"use client";

import { useEffect, useId, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";

export type StrokeName = {
  name: string;
  pinyin: string;
};

export const strokeNamesByCharacter: Record<string, StrokeName[]> = {
  "\u4f60": [
    { name: "Left-falling", pinyin: "pie" },
    { name: "Vertical", pinyin: "shu" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal hook", pinyin: "heng gou" },
    { name: "Vertical hook", pinyin: "shu gou" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Dot", pinyin: "dian" },
  ],
  "\u5b66": [
    { name: "Dot", pinyin: "dian" },
    { name: "Dot", pinyin: "dian" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Dot", pinyin: "dian" },
    { name: "Horizontal hook", pinyin: "heng gou" },
    { name: "Horizontal hook", pinyin: "heng gou" },
    { name: "Vertical hook", pinyin: "shu gou" },
    { name: "Horizontal", pinyin: "heng" },
  ],
};

type CharacterPracticePreviewProps = {
  character: string;
  strokeNames?: StrokeName[];
};

export function CharacterPracticePreview({
  character,
  strokeNames = strokeNamesByCharacter[character] ?? [],
}: CharacterPracticePreviewProps) {
  const writerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    // React Strict Mode may mount effects twice in development, so reset the
    // target node before creating a new writer instance.
    container.innerHTML = "";

    const writer = HanziWriter.create(writerId, character, {
      width: 220,
      height: 220,
      padding: 12,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 180,
      outlineColor: "#fecaca",
      strokeColor: "#7f1d1d",
      radicalColor: "#dc2626",
    });

    let cancelled = false;

    function pause(duration: number) {
      return new Promise<void>((resolve) => {
        window.setTimeout(resolve, duration);
      });
    }

    async function animateOnLoop() {
      while (!cancelled) {
        writer.hideCharacter();

        if (strokeNames.length === 0) {
          setActiveStrokeIndex(0);
          await writer.animateCharacter();
        } else {
          for (let index = 0; index < strokeNames.length; index += 1) {
            if (cancelled) {
              return;
            }

            setActiveStrokeIndex(index);
            await writer.animateStroke(index);
            await pause(220);
          }
        }

        await pause(900);
      }
    }

    animateOnLoop();

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [character, strokeNames.length, writerId]);

  const activeStroke = strokeNames[activeStrokeIndex];

  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50/75 p-4">
      <div
        ref={containerRef}
        id={writerId}
        className="mx-auto h-[220px] w-[220px]"
      />
      {strokeNames.length > 0 ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-red-100 bg-white/75 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-red-700/70">
              Current stroke
            </p>
            <p className="mt-1 text-lg font-semibold text-red-950">
              {activeStroke?.name}
            </p>
            <p className="text-sm text-red-700">{activeStroke?.pinyin}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {strokeNames.map((stroke, index) => (
              <div
                key={`${stroke.name}-${index}`}
                className={`rounded-2xl border px-3 py-2 text-sm transition-colors ${
                  index === activeStrokeIndex
                    ? "border-red-300 bg-red-100 text-red-950"
                    : "border-red-100 bg-white/65 text-red-950/65"
                }`}
              >
                <span className="font-semibold">{index + 1}. </span>
                <span>{stroke.name}</span>
                <span className="ml-1 text-xs uppercase tracking-[0.12em]">
                  {stroke.pinyin}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
