import { getTranslations } from "next-intl/server";
import type { Candidature } from "@/lib/db/candidatures";

type Props = { candidatures: Candidature[] };

export async function StatsStrip({ candidatures }: Props) {
  const t = await getTranslations("app.candidatures.list");

  const total = candidatures.length;
  const sent = candidatures.filter((c) =>
    ["sent", "replied", "closed"].includes(c.status),
  ).length;
  const draft = candidatures.filter((c) => c.status === "draft").length;

  const stats = [
    { label: t("statTotal"), value: total },
    { label: t("statSent"), value: sent },
    { label: t("statDraft"), value: draft },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-ink/8 bg-white px-6 py-5 flex flex-col gap-1"
        >
          <span className="font-serif text-[40px] leading-none tracking-[-0.03em] text-ink">
            {value}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] font-sans font-medium text-muted-soft">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
