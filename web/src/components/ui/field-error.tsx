import { cn } from "@/lib/utils";

export function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return <p className={cn("mt-2 text-[13px] text-destructive font-sans", className)}>{message}</p>;
}
