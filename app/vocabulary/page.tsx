import { AppShell } from "@/components/app-shell";
import { VocabularyManager } from "@/components/vocabulary-manager";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VocabularyPage() {
  const user = await requirePageUser();
  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <VocabularyManager initialVocabulary={vocabulary} />
    </AppShell>
  );
}
