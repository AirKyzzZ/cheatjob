"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { track, EVENTS } from "@/lib/analytics/events";
import { generateToolEmail } from "@/server/actions/tool-generator";
import { TOOL_CONTENT } from "../_content";
import type { ToolMode, ToolInputs } from "@/server/integrations/ai/prompts/tool-generator";
import { LeadCapture } from "./lead-capture";

type FieldKey = keyof ToolInputs;

const LABEL_KEY: Record<FieldKey, string> = {
  targetRole: "fieldTargetRole",
  targetCompany: "fieldTargetCompany",
  recruiterName: "fieldRecruiterName",
  you: "fieldYou",
  whyCompany: "fieldWhyCompany",
  originalContext: "fieldOriginalContext",
  offerContext: "fieldOfferContext",
};

const MULTILINE: ReadonlySet<FieldKey> = new Set([
  "you",
  "whyCompany",
  "originalContext",
  "offerContext",
]);

const OPTIONAL: ReadonlySet<FieldKey> = new Set(["recruiterName"]);

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-muted-soft/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 transition-colors";

export function ToolGenerator({ mode, locale }: { mode: ToolMode; locale: string }) {
  const t = useTranslations("tools");
  const fields = TOOL_CONTENT[mode].fields;

  const [values, setValues] = useState<ToolInputs>({
    targetRole: "",
    targetCompany: "",
    you: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [pending, startTransition] = useTransition();

  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [errorKind, setErrorKind] = useState<"rate_limited" | "failed" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track(EVENTS.ToolViewed, { tool: mode });
  }, []);

  function setField(key: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track(EVENTS.ToolGenerated, { tool: mode });
    setErrorKind(null);
    startTransition(async () => {
      const res = await generateToolEmail({ mode, inputs: values, honeypot });
      if (res.ok) {
        setResult({ subject: res.subject, body: res.body });
        return;
      }
      setResult(null);
      if (res.error === "rate_limited") {
        setErrorKind("rate_limited");
        track(EVENTS.ToolRateLimited, { tool: mode });
      } else {
        setErrorKind("failed");
      }
    });
  }

  async function onCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const signupHref = `/${locale}/sign-up?from=outils-${mode}`;

  function SignupCta({ className }: { className?: string }) {
    return (
      <a
        href={signupHref}
        onClick={() => track(EVENTS.ToolSignupClicked, { tool: mode })}
        className={
          className ??
          "inline-flex h-11 items-center justify-center rounded-xl bg-burgundy px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-burgundy-deep"
        }
      >
        {t("signupCta")}
      </a>
    );
  }

  return (
    <div className="mt-10">
      <form onSubmit={onSubmit} className="grid gap-5">
        {fields.map((key) => {
          const id = `tool-${key}`;
          const optional = OPTIONAL.has(key);
          const label = (
            <label
              htmlFor={id}
              className="mb-2 block font-sans text-[13px] font-medium text-ink"
            >
              {t(LABEL_KEY[key])}
              {optional && (
                <span className="ml-2 font-normal text-muted-soft">(optionnel)</span>
              )}
            </label>
          );
          return (
            <div key={key}>
              {label}
              {MULTILINE.has(key) ? (
                <textarea
                  id={id}
                  required={!optional}
                  rows={4}
                  value={(values[key] as string) ?? ""}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={key === "you" ? t("fieldYouPlaceholder") : undefined}
                  className={`${inputClass} resize-none`}
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  required={!optional}
                  value={(values[key] as string) ?? ""}
                  onChange={(e) => setField(key, e.target.value)}
                  className={inputClass}
                />
              )}
            </div>
          );
        })}

        <div className="absolute left-[-9999px] top-[-9999px] h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-sans text-[15px] font-medium text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? t("generating") : result ? t("regenerate") : t("generate")}
          </button>
        </div>
      </form>

      {errorKind === "failed" && (
        <p className="mt-6 font-sans text-[14px] text-burgundy">{t("errorFailed")}</p>
      )}

      {errorKind === "rate_limited" && (
        <div className="mt-6 rounded-xl border border-burgundy/20 bg-burgundy/[0.04] p-5">
          <p className="font-sans text-[14px] leading-relaxed text-ink">
            {t("errorRateLimited")}
          </p>
          <SignupCta className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-burgundy px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-burgundy-deep" />
        </div>
      )}

      {result && (
        <div className="mt-10">
          <div className="rounded-2xl border border-ink/10 bg-white p-7">
            <div className="flex items-start justify-between gap-4">
              <p className="font-serif text-[22px] leading-snug text-ink">
                {t("resultTitle")}
              </p>
              <button
                type="button"
                onClick={onCopy}
                className="shrink-0 rounded-lg border border-ink/15 px-4 py-2 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04]"
              >
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <p className="mt-5 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-muted-soft">
              {result.subject}
            </p>
            <div className="mt-3 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-ink">
              {result.body}
            </div>
          </div>

          <LeadCapture tool={mode} />
        </div>
      )}
    </div>
  );
}
