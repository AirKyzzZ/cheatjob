"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CvDropzone } from "./cv-dropzone";
import { deleteCv } from "@/server/actions/profile";

export function CvCard({
  cvStoragePath,
  cvUploadedAt,
  downloadUrl,
  locale,
}: {
  cvStoragePath: string | null;
  cvUploadedAt: string | null;
  downloadUrl: string | null;
  locale: string;
}) {
  const t = useTranslations("app.profile.cv");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!cvStoragePath) {
    return (
      <Card>
        <CardHeader className="mb-4">
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CvDropzone onUploaded={() => router.refresh()} />
      </Card>
    );
  }

  const formattedDate = cvUploadedAt
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(cvUploadedAt))
    : "";

  const ext = cvStoragePath.endsWith(".docx") ? "DOCX" : "PDF";

  return (
    <Card>
      <CardHeader className="mb-5">
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-border-subtle bg-cream">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-none size-12 rounded-lg bg-burgundy-soft text-burgundy font-sans font-semibold text-[12px] flex items-center justify-center tracking-wider">
            {ext}
          </div>
          <div className="min-w-0">
            <p className="font-sans text-[15px] text-ink truncate">
              {t("filename", { ext: ext.toLowerCase() })}
            </p>
            <p className="font-sans text-[13px] text-muted-soft">
              {t("uploadedAt", { date: formattedDate })}
            </p>
          </div>
        </div>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none"
          >
            <Button variant="secondary-light" size="sm">
              {t("download")}
            </Button>
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center gap-5">
        <CvDropzone variant="replace" onUploaded={() => router.refresh()} />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await deleteCv();
              router.refresh();
            })
          }
          disabled={pending}
          className="text-[13px] font-sans text-destructive hover:underline underline-offset-4 disabled:opacity-50 transition-all"
        >
          {pending ? "..." : t("delete")}
        </button>
      </div>
    </Card>
  );
}
