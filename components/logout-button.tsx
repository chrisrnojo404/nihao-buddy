"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="hidden sm:inline-flex"
      disabled={isPending}
      onClick={handleLogout}
    >
      {isPending ? "Signing out..." : "Log out"}
    </Button>
  );
}
