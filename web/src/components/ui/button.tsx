"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary-dark" | "primary-light" | "secondary-dark" | "secondary-light" | "ghost";
type Size = "lg" | "md" | "sm";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
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

const sizeStyles: Record<Size, string> = {
  lg: "h-14 px-7 text-[15px]",
  md: "h-11 px-5 text-[14px]",
  sm: "h-9 px-4 text-[13px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary-light",
      size = "lg",
      loading = false,
      showArrow = false,
      asAnchor,
      href,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2 rounded-[14px] font-medium font-sans",
      sizeStyles[size],
      variant !== "ghost" && "whitespace-nowrap",
      variantStyles[variant],
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className,
    );

    const content = loading ? (
      <span
        className="inline-block size-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
    ) : (
      <>
        {children}
        {showArrow && <ArrowRight className="size-4 shrink-0" aria-hidden />}
      </>
    );

    if (asAnchor && href) {
      return (
        <a
          href={href}
          className={cn(baseClasses, isDisabled && "opacity-50 pointer-events-none")}
          aria-disabled={isDisabled || undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} className={baseClasses} disabled={isDisabled} {...props}>
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";
