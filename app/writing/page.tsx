import { AppShell } from "@/components/app-shell";
import { WritingPracticeWorkspace } from "@/components/writing-practice-workspace";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WritingPage() {
  const user = await requirePageUser();
  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId: user.id },
    orderBy: [{ mastered: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  return (
    <AppShell>
      <WritingPracticeWorkspace vocabulary={vocabulary} />
    </AppShell>
  );
}
