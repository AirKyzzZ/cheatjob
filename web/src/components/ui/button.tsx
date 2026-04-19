"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary-dark" | "primary-light" | "secondary-dark" | "secondary-light" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  showArrow?: boolean;
  asAnchor?: boolean;
  href?: string;
};

const variantStyles: Record<Variant, string> = {
  "primary-dark":
    "bg-cream text-ink hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-300",
  "primary-light":
    "bg-burgundy text-cream hover:bg-burgundy-deep transition-colors",
  "secondary-dark":
    "liquid-glass text-cream hover:bg-white/10 transition-colors",
  "secondary-light":
    "border border-ink/15 text-ink hover:bg-ink/[0.04] transition-colors",
  ghost: "text-ink hover:opacity-80 underline-offset-4 hover:underline transition-all",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary-light", showArrow = false, asAnchor, href, ...props }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2 h-14 px-7 rounded-[14px] font-medium text-[15px] font-sans",
      variant !== "ghost" && "whitespace-nowrap",
      variantStyles[variant],
      className
    );

    const content = (
      <>
        {children}
        {showArrow && <ArrowRight className="size-4 shrink-0" aria-hidden />}
      </>
    );

    if (asAnchor && href) {
      return (
        <a href={href} className={baseClasses}>
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";
