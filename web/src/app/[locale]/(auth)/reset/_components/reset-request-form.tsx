"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { requestPasswordReset } from "@/server/actions/auth";
import { authErrorKey } from "@/lib/auth-error-message";

export function ResetRequestForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.reset");
  const tErrors = useTranslations("auth.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="space-y-3">
        <h2 className="font-serif text-[24px] tracking-[-0.02em] text-ink">
          {t("sentTitle")}
        </h2>
        <p className="font-sans text-[15px] text-muted">{t("sentBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") ?? "");
        startTransition(async () => {
          try {
            await requestPasswordReset({ email, locale });
            setSent(true);
          } catch (err) {
            setError(tErrors(authErrorKey(err)));
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("emailLabel")}
        </label>
        <Input name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        {t("submit")}
      </Button>
      <FieldError message={error ?? undefined} />
    </form>
  );
}
