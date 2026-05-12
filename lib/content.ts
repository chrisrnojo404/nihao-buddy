import {
  BookOpen,
  Languages,
  PencilLine,
  Sparkles,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/translate", label: "Translate" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/writing", label: "Writing" },
  { href: "/flashcards", label: "Flashcards" },
];

export const coreFeatures = [
  {
    title: "Translate fast",
    description:
      "A clean English-to-Mandarin workflow with mock dictionary support ready for API upgrades.",
    icon: Languages,
  },
  {
    title: "Save vocabulary",
    description:
      "JWT-protected vocabulary routes are scaffolded for personal study lists and review history.",
    icon: BookOpen,
  },
  {
    title: "Practice writing",
    description:
      "Character splitting and Hanzi Writer previews prepare the app for guided stroke-order drills.",
    icon: PencilLine,
  },
  {
    title: "Review smarter",
    description:
      "Flashcard and progress structures are in place so we can add lightweight spaced repetition next.",
    icon: Sparkles,
  },
];

export const sampleVocabulary = [
  { english: "hello", chinese: "你好", pinyin: "nǐ hǎo" },
  { english: "thank you", chinese: "谢谢", pinyin: "xiè xie" },
  { english: "teacher", chinese: "老师", pinyin: "lǎo shī" },
];

export const sampleTranslation = {
  english: "good morning",
  chinese: "早上好",
  pinyin: "zǎo shang hǎo",
};

export const dashboardMetrics = [
  {
    label: "Saved words",
    value: "24",
    description: "Vocabulary total will come from the protected `/api/vocabulary` route.",
  },
  {
    label: "Review streak",
    value: "6 days",
    description: "Progress records already support streak and recent practice timestamps.",
  },
  {
    label: "Mastered",
    value: "8",
    description: "Flashcard outcomes can roll up into mastery stats with the existing schema.",
  },
];

export const learningPath = [
  "Connect the register and login forms to the JWT auth routes.",
  "Add client-side translation flow with browser speech playback.",
  "Wire vocabulary CRUD into the dashboard and flashcard review pages.",
  "Use progress updates to track reviewed items and mastered phrases.",
];
