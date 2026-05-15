"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getCvUploadUrl, finalizeCvUpload } from "@/server/actions/profile";
import { track, EVENTS } from "@/lib/analytics/events";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type AllowedMime = (typeof ALLOWED)[number];

export function CvDropzone({
  onUploaded,
  variant = "empty",
}: {
  onUploaded: () => void;
  variant?: "empty" | "replace";
}) {
  const t = useTranslations("app.profile.cv");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);

    if (!ALLOWED.includes(file.type as AllowedMime)) {
      setError(t("wrongType"));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("tooLarge"));
      return;
    }

    setUploading(true);
    track(EVENTS.CvUploadStarted);
    try {
      const { uploadUrl, path } = await getCvUploadUrl({
        filename: file.name,
        mimeType: file.type as AllowedMime,
      });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      await finalizeCvUpload({ storagePath: path, mimeType: file.type });
      track(EVENTS.CvUploadCompleted);
      onUploaded();
    } catch (e) {
      track(EVENTS.CvUploadFailed, {
        reason: e instanceof Error ? e.message : "unknown",
      });
      setError(e instanceof Error ? e.message : t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  if (variant === "replace") {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[13px] font-sans text-burgundy hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? "..." : t("replace")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={onChange}
        />
        {error && (
          <p className="mt-2 text-[13px] font-sans text-destructive">{error}</p>
        )}
      </>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-2xl px-6 py-12 text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:ring-offset-2 focus:ring-offset-cream-soft",
          uploading && "cursor-wait pointer-events-none",
          dragging
            ? "border-burgundy bg-burgundy-soft scale-[1.01]"
            : "border-border-subtle hover:border-burgundy/40 hover:bg-cream",
        )}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="inline-block size-6 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-[14px] text-muted">{t("uploading")}</p>
          </div>
        ) : (
          <>
            <p className="font-serif text-[18px] text-ink">{t("uploadHint")}</p>
            <p className="mt-2 text-[12px] uppercase tracking-[0.18em] font-sans text-muted-soft">
              {t("clickOrDrop")}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={onChange}
        />
      </div>
      {error && (
        <p className="mt-3 text-[13px] font-sans text-destructive">{error}</p>
      )}
    </div>
  );
}
