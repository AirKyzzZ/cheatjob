"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { signUpWithPassword } from "@/server/actions/auth";

export function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signUp");
  const tErrors = useTranslations("auth.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  if (submittedEmail) {
    return (
      <div className="space-y-3">
        <h2 className="font-serif text-[24px] tracking-[-0.02em] text-ink">
          {t("checkEmailTitle")}
        </h2>
        <p className="font-sans text-[15px] text-muted">
          {t("checkEmailBody", { email: submittedEmail })}
        </p>
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
        const password = String(formData.get("password") ?? "");
        if (password.length < 8) {
          setError(tErrors("passwordTooShort"));
          return;
        }
        startTransition(async () => {
          try {
            await signUpWithPassword({ email, password, locale });
            setSubmittedEmail(email);
          } catch (err) {
            setError(err instanceof Error ? err.message : tErrors("generic"));
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
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("passwordLabel")}
        </label>
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        {t("submit")}
      </Button>
      <FieldError message={error ?? undefined} />
    </form>
  );
}
