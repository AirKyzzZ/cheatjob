"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function CvCard(props: {
  cvStoragePath: string | null;
  cvUploadedAt: string | null;
  downloadUrl: string | null;
  locale: string;
}) {
  const t = useTranslations("app.profile.cv");
  void props;
  return (
    <Card>
      <CardHeader className="mb-4">
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <div className="border border-dashed border-border-subtle rounded-xl p-10 text-center">
        <p className="font-sans text-[14px] text-muted-soft italic">
          {t("comingInTask12")}
        </p>
      </div>
    </Card>
  );
}
