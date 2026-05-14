"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full px-4 rounded-md bg-cream-soft border border-border-subtle text-ink placeholder:text-muted-soft font-sans text-[14px]",
        "focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20",
        invalid && "border-destructive focus:border-destructive focus:ring-destructive/20",
        className,
      )}
      {...rest}
    />
  );
});
