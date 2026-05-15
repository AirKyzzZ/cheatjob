"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { updateLocaleAction } from "@/server/actions/profile";
import { track, EVENTS } from "@/lib/analytics/events";

const LOCALES = ["fr", "en", "es", "de"] as const;

function isRedirect(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function LocaleCard({
  locale,
  currentLocale,
}: {
  locale: string;
  currentLocale: string;
}) {
  const t = useTranslations("app.profile.locale");
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="mb-4">
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <p className="text-[14px] font-sans text-muted mb-4">{t("description")}</p>
      <RadioGroup
        name="locale"
        value={currentLocale}
        onChange={(v) =>
          startTransition(async () => {
            try {
              track(EVENTS.ProfileUpdated, { field: "locale" });
              await updateLocaleAction({ locale: v }, locale);
            } catch (err) {
              if (isRedirect(err)) throw err;
            }
          })
        }
        options={LOCALES.map((v) => ({ value: v, label: v.toUpperCase() }))}
      />
      {pending && (
        <p className="mt-3 text-[13px] font-sans italic text-muted-soft">
          {t("saving")}
        </p>
      )}
    </Card>
  );
}
