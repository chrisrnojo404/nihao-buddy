import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const now = new Date();
const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const addMinutes = (minutes) => new Date(now.getTime() + minutes * 60 * 1000);

const demoAccounts = [
  {
    name: "Alicia Tjong",
    email: "alicia@nihaobuddy.demo",
    password: "DemoPass123!",
    progress: {
      totalReviewed: 12,
      masteredCount: 2,
      streakDays: 4,
      lastPracticedAt: new Date(),
    },
    vocabulary: [
      {
        englishText: "hello",
        chineseText: "你好",
        pinyin: "nǐ hǎo",
        notes: "A basic greeting for everyday conversation.",
        mastered: true,
        reviewCount: 5,
        easeFactor: 2.7,
        intervalDays: 9,
        nextReviewAt: addDays(-1),
        lastReviewedAt: addDays(-10),
      },
      {
        englishText: "thank you",
        chineseText: "谢谢",
        pinyin: "xiè xie",
        notes: "Useful after receiving help or a gift.",
        mastered: true,
        reviewCount: 4,
        easeFactor: 2.6,
        intervalDays: 7,
        nextReviewAt: addMinutes(20),
        lastReviewedAt: addDays(-7),
      },
      {
        englishText: "good morning",
        chineseText: "早上好",
        pinyin: "zǎo shang hǎo",
        notes: "Great for polite morning greetings.",
        mastered: false,
        reviewCount: 3,
        easeFactor: 2.4,
        intervalDays: 1,
        nextReviewAt: addDays(-2),
        lastReviewedAt: addDays(-3),
      },
    ],
  },
  {
    name: "Ravi Bhola",
    email: "ravi@nihaobuddy.demo",
    password: "DemoPass123!",
    progress: {
      totalReviewed: 7,
      masteredCount: 1,
      streakDays: 2,
      lastPracticedAt: new Date(),
    },
    vocabulary: [
      {
        englishText: "student",
        chineseText: "学生",
        pinyin: "xué shēng",
        notes: "Helpful when introducing yourself at school.",
        mastered: false,
        reviewCount: 2,
        easeFactor: 2.3,
        intervalDays: 1,
        nextReviewAt: addMinutes(-30),
        lastReviewedAt: addDays(-1),
      },
      {
        englishText: "teacher",
        chineseText: "老师",
        pinyin: "lǎo shī",
        notes: "Common school vocabulary.",
        mastered: true,
        reviewCount: 3,
        easeFactor: 2.55,
        intervalDays: 6,
        nextReviewAt: addDays(1),
        lastReviewedAt: addDays(-6),
      },
      {
        englishText: "friend",
        chineseText: "朋友",
        pinyin: "péng yǒu",
        notes: "Good word for social introductions.",
        mastered: false,
        reviewCount: 2,
        easeFactor: 2.4,
        intervalDays: 0,
        nextReviewAt: addMinutes(-10),
        lastReviewedAt: addDays(-2),
      },
    ],
  },
];

async function seedAccount(account) {
  const passwordHash = await bcrypt.hash(account.password, 12);

  await prisma.user.upsert({
    where: { email: account.email },
    update: {
      name: account.name,
      passwordHash,
      vocabulary: {
        deleteMany: {},
        create: account.vocabulary,
      },
      progress: {
        upsert: {
          update: {
            totalSaved: account.vocabulary.length,
            totalReviewed: account.progress.totalReviewed,
            masteredCount: account.progress.masteredCount,
            streakDays: account.progress.streakDays,
            lastPracticedAt: account.progress.lastPracticedAt,
          },
          create: {
            totalSaved: account.vocabulary.length,
            totalReviewed: account.progress.totalReviewed,
            masteredCount: account.progress.masteredCount,
            streakDays: account.progress.streakDays,
            lastPracticedAt: account.progress.lastPracticedAt,
          },
        },
      },
      reviewLogs: {
        deleteMany: {},
      },
      writingSessions: {
        deleteMany: {},
      },
    },
    create: {
      name: account.name,
      email: account.email,
      passwordHash,
      vocabulary: {
        create: account.vocabulary,
      },
      progress: {
        create: {
          totalSaved: account.vocabulary.length,
          totalReviewed: account.progress.totalReviewed,
          masteredCount: account.progress.masteredCount,
          streakDays: account.progress.streakDays,
          lastPracticedAt: account.progress.lastPracticedAt,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { email: account.email },
    select: {
      id: true,
      vocabulary: {
        select: {
          id: true,
          englishText: true,
          chineseText: true,
          easeFactor: true,
          intervalDays: true,
        },
      },
    },
  });

  if (!user) {
    return;
  }

  const reviewLogData = user.vocabulary.flatMap((item, index) => {
    const baseTime = addMinutes(-(index + 1) * 40);

    return [
      {
        userId: user.id,
        vocabularyId: item.id,
        rating: index % 3 === 0 ? "again" : "good",
        previousInterval: Math.max(0, item.intervalDays - 1),
        nextInterval: item.intervalDays,
        previousEaseFactor: Math.max(1.3, item.easeFactor - 0.1),
        nextEaseFactor: item.easeFactor,
        reviewedAt: baseTime,
      },
      {
        userId: user.id,
        vocabularyId: item.id,
        rating: index % 2 === 0 ? "hard" : "easy",
        previousInterval: Math.max(0, item.intervalDays - 2),
        nextInterval: item.intervalDays,
        previousEaseFactor: Math.max(1.3, item.easeFactor - 0.2),
        nextEaseFactor: item.easeFactor,
        reviewedAt: addMinutes(-(index + 1) * 90),
      },
    ];
  });

  if (reviewLogData.length > 0) {
    await prisma.reviewLog.createMany({
      data: reviewLogData,
    });
  }

  const writingSessionData = user.vocabulary.flatMap((item, index) => {
    const characterCount = Array.from(item.chineseText)
      .filter((character) => character.trim())
      .length;

    return [
      {
        userId: user.id,
        vocabularyId: item.id,
        practicedCharacters: Math.max(characterCount, 1),
        practicedAt: addMinutes(-(index + 1) * 55),
      },
      {
        userId: user.id,
        vocabularyId: item.id,
        practicedCharacters: Math.max(characterCount, 1),
        practicedAt: addMinutes(-(index + 1) * 135),
      },
    ];
  });

  if (writingSessionData.length > 0 && "writingSession" in prisma) {
    await prisma.writingSession.createMany({
      data: writingSessionData,
    });
  }
}

async function main() {
  for (const account of demoAccounts) {
    await seedAccount(account);
  }

  console.log("Demo accounts created:");
  for (const account of demoAccounts) {
    console.log(`- ${account.email} / ${account.password}`);
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed demo accounts.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
