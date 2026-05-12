import { pinyin } from "pinyin-pro";

const dictionary: Record<string, string> = {
  hello: "你好",
  "good morning": "早上好",
  "thank you": "谢谢",
  goodbye: "再见",
  yes: "是",
  no: "不",
  water: "水",
  food: "食物",
  school: "学校",
  student: "学生",
  teacher: "老师",
  friend: "朋友",
  family: "家人",
  china: "中国",
  suriname: "苏里南",
};

function normalizeText(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
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

export function translateToMandarin(input: string) {
  const normalized = normalizeText(input);

  if (!normalized) {
    return null;
  }

  const directMatch = dictionary[normalized];
  const chineseText = directMatch
    ? directMatch
    : normalized
        .split(" ")
        .map((segment) => dictionary[segment] ?? segment)
        .join("");

  if (!directMatch && chineseText === normalized.replace(/\s+/g, "")) {
    return null;
  }

  return {
    english: normalized,
    chinese: chineseText,
    pinyin: generatePinyin(chineseText),
    characters: splitCharacters(chineseText),
  };
}
