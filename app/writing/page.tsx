import { AppShell } from "@/components/app-shell";
import { WritingPracticeWorkspace } from "@/components/writing-practice-workspace";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WritingPage({
  searchParams,
}: PageProps<"/writing">) {
  const user = await requirePageUser();
  const { phrase } = await searchParams;
  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId: user.id },
    orderBy: [{ mastered: "asc" }, { createdAt: "desc" }],
  });
  const initialPhraseId = typeof phrase === "string" ? phrase : undefined;

  return (
    <AppShell>
      <WritingPracticeWorkspace
        vocabulary={vocabulary}
        initialPhraseId={initialPhraseId}
      />
    </AppShell>
  );
}
