import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

export function Eyebrow({ children, tone = "light", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[12px] font-medium uppercase font-sans",
        "tracking-[0.18em]",
        tone === "light" ? "text-burgundy" : "text-cream/70",
        className
      )}
    >
      <span
        className={cn(
          "h-px w-6 shrink-0",
          tone === "light" ? "bg-burgundy" : "bg-cream/30"
        )}
        aria-hidden
      />
      {children}
    </span>
  );
}
