import { pinyin } from "pinyin-pro";

import { dictionaryEntries, fillerWords, type DictionaryEntry } from "@/lib/dictionary-data";

type Suggestion = {
  english: string;
  chinese: string;
  pinyin: string;
};

type TranslationMatch = {
  found: true;
  english: string;
  chinese: string;
  pinyin: string;
  characters: string[];
  matchedBy: "exact" | "combined" | "template";
  category: "word" | "phrase";
  suggestions: Suggestion[];
};

type TranslationMiss = {
  found: false;
  english: string;
  suggestions: Suggestion[];
};

const dictionary = Object.fromEntries(
  dictionaryEntries.map((entry) => [entry.english, entry]),
) as Record<string, DictionaryEntry>;

function normalizeText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[?!,.;:]/g, " ")
    .replace(/\s+/g, " ");
}

function splitCharacters(text: string) {
  return Array.from(text).filter((character) => character.trim().length > 0);
}

function generatePinyin(text: string) {
  return pinyin(text, {
    toneType: "symbol",
    type: "array",
    nonZh: "consecutive",
  }).join(" ");
}

function scoreSuggestion(input: string, candidate: string) {
  if (candidate.includes(input) || input.includes(candidate)) {
    return 3;
  }

  const inputWords = new Set(input.split(" "));
  const candidateWords = candidate.split(" ");
  const overlap = candidateWords.filter((word) => inputWords.has(word)).length;

  return overlap;
}

function findSuggestions(normalized: string) {
  return dictionaryEntries
    .map((entry) => ({
      ...entry,
      score: scoreSuggestion(normalized, entry.english),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.english.length - right.english.length,
    )
    .slice(0, 5)
    .map(({ english, chinese }) => ({
      english,
      chinese,
      pinyin: generatePinyin(chinese),
    }));
}

function getWordEntry(rawWord: string) {
  const word = fillerWords.has(rawWord) ? "" : rawWord;

  if (!word) {
    return null;
  }

  const entry = dictionary[word];

  if (!entry || entry.category !== "word") {
    return null;
  }

  return entry;
}

function buildMatch(
  normalized: string,
  chineseText: string,
  matchedBy: TranslationMatch["matchedBy"],
  category: TranslationMatch["category"],
): TranslationMatch {
  return {
    found: true,
    english: normalized,
    chinese: chineseText,
    pinyin: generatePinyin(chineseText),
    characters: splitCharacters(chineseText),
    matchedBy,
    category,
    suggestions: [],
  };
}

function matchSegments(segments: string[]) {
  const matchedEntries: DictionaryEntry[] = [];

  for (const segment of segments) {
    const entry = getWordEntry(segment);

    if (!entry) {
      return null;
    }

    matchedEntries.push(entry);
  }

  return matchedEntries;
}

function matchTemplate(normalized: string) {
  const patterns: Array<{
    prefix: string;
    render: (entry: DictionaryEntry) => string;
  }> = [
    {
      prefix: "i am from ",
      render: (entry) => `我来自${entry.chinese}`,
    },
    {
      prefix: "i am ",
      render: (entry) => `我是${entry.chinese}`,
    },
    {
      prefix: "he is ",
      render: (entry) => `他是${entry.chinese}`,
    },
    {
      prefix: "she is ",
      render: (entry) => `她是${entry.chinese}`,
    },
    {
      prefix: "this is my ",
      render: (entry) => `这是我的${entry.chinese}`,
    },
    {
      prefix: "my ",
      render: (entry) => `我的${entry.chinese}`,
    },
    {
      prefix: "i want ",
      render: (entry) => `我要${entry.chinese}`,
    },
    {
      prefix: "where is ",
      render: (entry) => `${entry.chinese}在哪里`,
    },
    {
      prefix: "hello ",
      render: (entry) => `${entry.chinese}好`,
    },
    {
      prefix: "good morning ",
      render: (entry) => `${entry.chinese}早上好`,
    },
  ];

  for (const pattern of patterns) {
    if (!normalized.startsWith(pattern.prefix)) {
      continue;
    }

    const rawRemainder = normalized.slice(pattern.prefix.length).trim();
    const remainder = rawRemainder
      .split(" ")
      .filter((segment) => !fillerWords.has(segment))
      .join(" ");
    const entry = getWordEntry(remainder);

    if (!entry) {
      continue;
    }

    return buildMatch(normalized, pattern.render(entry), "template", "phrase");
  }

  return null;
}

export function translateToMandarin(input: string): TranslationMatch | TranslationMiss | null {
  const normalized = normalizeText(input);

  if (!normalized) {
    return null;
  }

  const directMatch = dictionary[normalized];

  if (directMatch) {
    return buildMatch(normalized, directMatch.chinese, "exact", directMatch.category);
  }

  const templateMatch = matchTemplate(normalized);

  if (templateMatch) {
    return templateMatch;
  }

  const segments = normalized.split(" ");
  const matchedSegments = matchSegments(segments);

  if (matchedSegments) {
    const chineseText = matchedSegments.map((entry) => entry.chinese).join("");

    return buildMatch(
      normalized,
      chineseText,
      "combined",
      matchedSegments.every((entry) => entry.category === "word") ? "word" : "phrase",
    );
  }

  return {
    found: false,
    english: normalized,
    suggestions: findSuggestions(normalized),
  };
}
