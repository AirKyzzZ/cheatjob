"use client";

import { Button } from "@/components/ui/button";

type WizardShellProps = {
  step: number;
  title: string;
  stepLabel: string;
  quotaLabel: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  busy?: boolean;
  backLabel: string;
};

export function WizardShell({
  step,
  title,
  stepLabel,
  quotaLabel,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  busy = false,
  backLabel,
}: WizardShellProps) {
  const totalSteps = 5;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-4">
          {stepLabel}
        </p>

        <div className="flex gap-1.5 mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={[
                "h-0.5 flex-1 rounded-full transition-all duration-300",
                i < step ? "bg-ink" : i === step - 1 ? "bg-ink" : "bg-ink/15",
              ].join(" ")}
            />
          ))}
        </div>

        <h1 className="font-serif text-[36px] md:text-[44px] leading-tight tracking-[-0.02em] text-ink mb-2">
          {title}
        </h1>

        <p className="font-sans text-[13px] text-muted-soft">
          {quotaLabel}
        </p>
      </div>

      <div className="mb-10">{children}</div>

      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="secondary-light"
            size="md"
            onClick={onBack}
            disabled={busy}
            type="button"
          >
            {backLabel}
          </Button>
        )}
        {onNext && (
          <Button
            variant="primary-light"
            size="md"
            onClick={onNext}
            disabled={nextDisabled || busy}
            loading={busy}
            type="button"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
