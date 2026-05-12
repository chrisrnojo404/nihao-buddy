import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-red-700 text-white hover:bg-red-600 shadow-[0_12px_30px_rgba(185,28,28,0.2)]",
  outline:
    "border border-red-200 bg-white/90 text-red-900 hover:bg-red-50",
  ghost: "text-red-900 hover:bg-red-50",
};

const buttonSizes = {
  default: "h-11 px-5 py-2",
  lg: "h-12 px-6 py-3",
  sm: "h-9 px-4 py-2 text-sm",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
