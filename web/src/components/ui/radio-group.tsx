"use client";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
};

export function RadioGroup({ name, value, onChange, options, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "h-11 px-4 rounded-md border cursor-pointer inline-flex items-center text-[14px] font-sans transition-colors",
              selected
                ? "bg-burgundy text-cream border-burgundy"
                : "bg-cream-soft text-ink border-border-subtle hover:border-border-strong",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
