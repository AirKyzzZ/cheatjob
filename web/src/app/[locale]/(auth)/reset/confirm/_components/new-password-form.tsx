"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { updatePassword } from "@/server/actions/auth";
import { authErrorKey } from "@/lib/auth-error-message";

function isRedirect(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function NewPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.reset");
  const tErrors = useTranslations("auth.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const password = String(formData.get("password") ?? "");
        if (password.length < 8) {
          setError(tErrors("passwordTooShort"));
          return;
        }
        startTransition(async () => {
          try {
            await updatePassword({ password }, locale);
          } catch (err) {
            if (isRedirect(err)) throw err;
            setError(tErrors(authErrorKey(err)));
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
          {t("newPasswordLabel")}
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
        {t("savePassword")}
      </Button>
      <FieldError message={error ?? undefined} />
    </form>
  );
}
