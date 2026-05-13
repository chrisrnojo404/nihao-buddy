"use client";

import { useEffect, useId, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";

export type StrokeName = {
  name: string;
  pinyin: string;
};

type StrokePoint = {
  x: number;
  y: number;
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
  "\u597d": [
    { name: "Left-falling point", pinyin: "pie dian" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical hook", pinyin: "shu gou" },
    { name: "Rising", pinyin: "ti" },
    { name: "Vertical bend hook", pinyin: "shu wan gou" },
  ],
  "\u8c22": [
    { name: "Dot", pinyin: "dian" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical lift", pinyin: "shu ti" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Vertical hook", pinyin: "shu gou" },
    { name: "Dot", pinyin: "dian" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical", pinyin: "shu" },
    { name: "Left-falling", pinyin: "pie" },
  ],
  "\u65e9": [
    { name: "Vertical", pinyin: "shu" },
    { name: "Horizontal bend", pinyin: "heng zhe" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical", pinyin: "shu" },
  ],
  "\u4e0a": [
    { name: "Vertical", pinyin: "shu" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
  ],
  "\u751f": [
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical", pinyin: "shu" },
    { name: "Horizontal", pinyin: "heng" },
  ],
  "\u8001": [
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical", pinyin: "shu" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Vertical bend hook", pinyin: "shu wan gou" },
    { name: "Left-falling", pinyin: "pie" },
  ],
  "\u5e08": [
    { name: "Vertical", pinyin: "shu" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Vertical", pinyin: "shu" },
    { name: "Horizontal bend hook", pinyin: "heng zhe gou" },
    { name: "Vertical", pinyin: "shu" },
  ],
  "\u670b": [
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal bend hook", pinyin: "heng zhe gou" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal bend hook", pinyin: "heng zhe gou" },
    { name: "Horizontal", pinyin: "heng" },
    { name: "Horizontal", pinyin: "heng" },
  ],
  "\u53cb": [
    { name: "Horizontal", pinyin: "heng" },
    { name: "Left-falling", pinyin: "pie" },
    { name: "Horizontal bend", pinyin: "heng zhe" },
    { name: "Point", pinyin: "dian" },
  ],
};

function segmentLength(start: StrokePoint, end: StrokePoint) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return Math.hypot(dx, dy);
}

function classifySegment(start: StrokePoint, end: StrokePoint) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < 0.01 && absDy < 0.01) {
    return "dot";
  }

  if (absDx <= absDy * 0.35) {
    return dy >= 0 ? "vertical" : "vertical-up";
  }

  if (absDy <= absDx * 0.35) {
    return dx >= 0 ? "horizontal" : "horizontal-left";
  }

  if (dx >= 0 && dy >= 0) {
    return "right-falling";
  }

  if (dx < 0 && dy >= 0) {
    return "left-falling";
  }

  if (dx >= 0 && dy < 0) {
    return "rising";
  }

  return "hook";
}

function compressDirections(directions: string[]) {
  return directions.filter(
    (direction, index) => index === 0 || direction !== directions[index - 1],
  );
}

function detectStrokeName(points: StrokePoint[]): StrokeName {
  if (points.length < 2) {
    return {
      name: "Dot",
      pinyin: "dian",
    };
  }

  const segments = points
    .slice(1)
    .map((point, index) => ({
      start: points[index],
      end: point,
      length: segmentLength(points[index], point),
    }))
    .filter((segment) => segment.length > 1.5);

  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const directions = compressDirections(
    segments.map((segment) => classifySegment(segment.start, segment.end)),
  );

  if (totalLength < 18 || directions.length === 0) {
    return {
      name: "Dot",
      pinyin: "dian",
    };
  }

  if (directions.length === 1) {
    switch (directions[0]) {
      case "horizontal":
        return { name: "Horizontal", pinyin: "heng" };
      case "vertical":
        return { name: "Vertical", pinyin: "shu" };
      case "left-falling":
        return { name: "Left-falling", pinyin: "pie" };
      case "right-falling":
        return { name: "Right-falling", pinyin: "na" };
      case "rising":
        return { name: "Rising", pinyin: "ti" };
      default:
        return { name: "Dot", pinyin: "dian" };
    }
  }

  const [first, second, third] = directions;

  if (first === "horizontal" && second === "vertical") {
    return directions.length > 2 && third === "horizontal"
      ? { name: "Horizontal turn", pinyin: "heng zhe heng" }
      : { name: "Horizontal turn", pinyin: "heng zhe" };
  }

  if (first === "vertical" && second === "horizontal") {
    return directions.length > 2 && third === "vertical"
      ? { name: "Vertical turn", pinyin: "shu zhe shu" }
      : { name: "Vertical turn", pinyin: "shu zhe" };
  }

  if (first === "horizontal" && (second === "rising" || second === "vertical-up")) {
    return { name: "Horizontal hook", pinyin: "heng gou" };
  }

  if (
    first === "vertical" &&
    (second === "horizontal-left" ||
      second === "rising" ||
      second === "left-falling" ||
      second === "hook")
  ) {
    return { name: "Vertical hook", pinyin: "shu gou" };
  }

  if (first === "left-falling" && second === "dot") {
    return { name: "Left-falling dot", pinyin: "pie dian" };
  }

  return {
    name: "Turning stroke",
    pinyin: "zhe",
  };
}

function normalizeMedianPoints(rawMedian: unknown): StrokePoint[] {
  if (!Array.isArray(rawMedian)) {
    return [];
  }

  return rawMedian
    .map((point) => {
      if (
        Array.isArray(point) &&
        point.length >= 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number"
      ) {
        return {
          x: point[0],
          y: point[1],
        };
      }

      if (
        point &&
        typeof point === "object" &&
        "x" in point &&
        "y" in point &&
        typeof point.x === "number" &&
        typeof point.y === "number"
      ) {
        return {
          x: point.x,
          y: point.y,
        };
      }

      return null;
    })
    .filter((point): point is StrokePoint => point !== null);
}

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
  const [generatedStrokeData, setGeneratedStrokeData] = useState<{
    character: string;
    strokes: StrokeName[];
  }>({
    character: "",
    strokes: [],
  });

  useEffect(() => {
    let cancelled = false;

    if (strokeNames.length > 0) {
      return () => {
        cancelled = true;
      };
    }

    HanziWriter.loadCharacterData(character)
      .then((data) => {
        if (cancelled) {
          return;
        }

        const strokeCount =
          data && typeof data === "object" && "strokes" in data && Array.isArray(data.strokes)
            ? data.strokes.length
            : 0;

        if (strokeCount > 0) {
          setGeneratedStrokeData({
            character,
            strokes:
              data &&
              typeof data === "object" &&
              "medians" in data &&
              Array.isArray(data.medians)
                ? data.medians.map((median) =>
                    detectStrokeName(normalizeMedianPoints(median)),
                  )
                : Array.from({ length: strokeCount }, () => ({
                    name: "Stroke step",
                    pinyin: "auto",
                  })),
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGeneratedStrokeData({
            character,
            strokes: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [character, strokeNames]);

  const resolvedStrokeNames =
    strokeNames.length > 0
      ? strokeNames
      : generatedStrokeData.character === character
        ? generatedStrokeData.strokes
        : [];
  const strokeLabelSource =
    strokeNames.length > 0
      ? "custom"
      : resolvedStrokeNames.length > 0
        ? "generated"
        : "none";

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

        if (resolvedStrokeNames.length === 0) {
          setActiveStrokeIndex(0);
          await writer.animateCharacter();
        } else {
          for (let index = 0; index < resolvedStrokeNames.length; index += 1) {
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
  }, [character, resolvedStrokeNames.length, writerId]);

  const activeStroke = resolvedStrokeNames[activeStrokeIndex];

  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50/75 p-4">
      <div
        ref={containerRef}
        id={writerId}
        className="mx-auto h-[220px] w-[220px]"
      />
      {resolvedStrokeNames.length > 0 ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-red-100 bg-white/75 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-red-700/70">
              {strokeLabelSource === "generated" ? "Current stroke step" : "Current stroke"}
            </p>
            <p className="mt-1 text-lg font-semibold text-red-950">
              {activeStroke?.name}
            </p>
            <p className="text-sm text-red-700">
              {strokeLabelSource === "generated"
                ? activeStroke?.pinyin
                : activeStroke?.pinyin}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {resolvedStrokeNames.map((stroke, index) => (
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
                {strokeLabelSource === "custom" ? (
                  <span className="ml-1 text-xs uppercase tracking-[0.12em]">
                    {stroke.pinyin}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
