import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-100",
        className,
      )}
      {...props}
    />
  );
}
