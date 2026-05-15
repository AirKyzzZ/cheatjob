"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { signInWithPassword } from "@/server/actions/auth";
import { track, EVENTS } from "@/lib/analytics/events";
import { authErrorKey } from "@/lib/auth-error-message";

function isRedirect(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function SignInForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signIn");
  const tErrors = useTranslations("auth.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            track(EVENTS.AuthSigninAttempted, { method: "password" });
            await signInWithPassword(
              {
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
              },
              locale,
            );
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
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        {t("submit")}
      </Button>
      <FieldError message={error ?? undefined} />
    </form>
  );
}
