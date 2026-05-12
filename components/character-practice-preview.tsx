"use client";

import { useEffect, useId, useRef } from "react";
import HanziWriter from "hanzi-writer";

type CharacterPracticePreviewProps = {
  character: string;
};

export function CharacterPracticePreview({
  character,
}: CharacterPracticePreviewProps) {
  const writerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);

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

    writer.animateCharacter();

    return () => {
      container.innerHTML = "";
    };
  }, [character, writerId]);

  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50/75 p-4">
      <div
        ref={containerRef}
        id={writerId}
        className="mx-auto h-[220px] w-[220px]"
      />
    </div>
  );
}
