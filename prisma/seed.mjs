import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      },
      {
        englishText: "thank you",
        chineseText: "谢谢",
        pinyin: "xiè xie",
        notes: "Useful after receiving help or a gift.",
        mastered: true,
        reviewCount: 4,
      },
      {
        englishText: "good morning",
        chineseText: "早上好",
        pinyin: "zǎo shang hǎo",
        notes: "Great for polite morning greetings.",
        mastered: false,
        reviewCount: 3,
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
      },
      {
        englishText: "teacher",
        chineseText: "老师",
        pinyin: "lǎo shī",
        notes: "Common school vocabulary.",
        mastered: true,
        reviewCount: 3,
      },
      {
        englishText: "friend",
        chineseText: "朋友",
        pinyin: "péng yǒu",
        notes: "Good word for social introductions.",
        mastered: false,
        reviewCount: 2,
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
