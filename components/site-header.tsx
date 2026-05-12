import Link from "next/link";

import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-red-100/80 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-700 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(185,28,28,0.24)]">
            朋
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-700">
              nihao buddy
            </p>
            <p className="text-sm text-red-950/75">
              Learn, save, write, review
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-red-950/70 transition-colors hover:text-red-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
