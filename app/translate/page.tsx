import { AppShell } from "@/components/app-shell";
import { TranslateWorkspace } from "@/components/translate-workspace";
import { requirePageUser } from "@/lib/auth";

export default async function TranslatePage() {
  await requirePageUser();

  return (
    <AppShell>
      <TranslateWorkspace />
    </AppShell>
  );
}
