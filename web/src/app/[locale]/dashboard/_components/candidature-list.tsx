"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Candidature } from "@/lib/db/candidatures";

type Status = Candidature["status"];

type Props = {
  candidatures: Candidature[];
  locale: string;
};

function statusPillClass(status: string): string {
  if (status === "sent") return "bg-blue-100 text-blue-800";
  if (status === "replied") return "bg-emerald-100 text-emerald-800";
  if (status === "closed") return "bg-ink/10 text-ink/60";
  if (status === "ready") return "bg-amber-100 text-amber-800";
  return "bg-ink/5 text-muted";
}

const ALL_FILTER = "__all__" as const;
type Filter = typeof ALL_FILTER | Status;

const FILTER_ORDER: Filter[] = [
  ALL_FILTER,
  "draft",
  "ready",
  "sent",
  "replied",
  "closed",
];

export function CandidatureList({ candidatures, locale }: Props) {
  const t = useTranslations("app.candidatures.list");
  const td = useTranslations("app.candidatures.detail");
  const [filter, setFilter] = useState<Filter>(ALL_FILTER);

  const statusLabel = (status: string): string => {
    const map: Record<string, string> = {
      draft: td("statusDraft"),
      ready: td("statusReady"),
      sent: td("statusSent"),
      replied: td("statusReplied"),
      closed: td("statusClosed"),
    };
    return map[status] ?? status;
  };

  const filterLabel = (f: Filter): string => {
    if (f === ALL_FILTER) return t("filterAll");
    return statusLabel(f);
  };

  const visible = filter === ALL_FILTER
    ? candidatures
    : candidatures.filter((c) => c.status === filter);

  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const presentFilters = FILTER_ORDER.filter(
    (f) => f === ALL_FILTER || candidatures.some((c) => c.status === f),
  );

  return (
    <div className="space-y-4">
      {presentFilters.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {presentFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-sans font-medium transition-colors",
                filter === f
                  ? "bg-ink text-cream"
                  : "bg-ink/5 text-muted hover:bg-ink/10 hover:text-ink",
              )}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white overflow-hidden">
        {visible.length === 0 ? (
          <p className="px-6 py-8 font-serif italic text-[15px] text-muted text-center">
            {td("noDraftYet")}
          </p>
        ) : (
          visible.map((c) => {
            const isDraft = c.status === "draft";
            const actionLabel = isDraft ? t("resume") : t("view");
            const actionHref = isDraft
              ? `/${locale}/dashboard/candidatures/new?c=${c.id}`
              : `/${locale}/dashboard/candidatures/${c.id}`;

            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-ink/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-sans text-[14px] font-medium text-ink truncate">
                    {c.company_name}
                  </p>
                  {c.target_role && (
                    <p className="font-sans text-[13px] text-muted truncate">
                      {c.target_role}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-sans",
                      statusPillClass(c.status),
                    )}
                  >
                    {statusLabel(c.status)}
                  </span>

                  <span className="hidden sm:block text-[12px] font-sans text-muted-soft whitespace-nowrap">
                    {formatDate(c.created_at)}
                  </span>

                  <Link
                    href={actionHref}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-ink/5 text-ink text-[12px] font-sans font-medium hover:bg-ink/10 transition-colors whitespace-nowrap"
                  >
                    {actionLabel}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
