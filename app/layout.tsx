import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "nihao buddy",
  description:
    "nihao buddy is a beginner-friendly Mandarin learning workspace for translation, vocabulary building, character writing, and review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--color-page)] text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
