import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { getCandidature } from "@/lib/db/candidatures";
import { getLatestMessage } from "@/lib/db/messages";
import { DraftEditor } from "./_components/draft-editor";
import { SendBlock } from "./_components/send-block";
import { StatusActions } from "./_components/status-actions";

function confidenceBadgeClass(confidence: string): string {
  if (confidence === "high") return "bg-emerald-100 text-emerald-800";
  if (confidence === "medium") return "bg-amber-100 text-amber-800";
  return "bg-muted text-muted-soft";
}

function statusPillClass(status: string): string {
  if (status === "sent") return "bg-blue-100 text-blue-800";
  if (status === "replied") return "bg-emerald-100 text-emerald-800";
  if (status === "closed") return "bg-ink/10 text-ink/60";
  if (status === "ready") return "bg-amber-100 text-amber-800";
  return "bg-ink/5 text-muted";
}

function statusLabel(status: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    draft: t("statusDraft"),
    ready: t("statusReady"),
    sent: t("statusSent"),
    replied: t("statusReplied"),
    closed: t("statusClosed"),
  };
  return map[status] ?? status;
}

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/sign-in`);

  const candidature = await getCandidature(supabase, id);
  if (!candidature || candidature.user_id !== user.id) notFound();

  const message = await getLatestMessage(supabase, id);
  const t = await getTranslations("app.candidatures.detail");
  const tw = await getTranslations("app.candidatures.wizard");

  const managerName = [candidature.manager_first_name, candidature.manager_last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-[36px] md:text-[44px] leading-tight tracking-[-0.02em] text-ink">
            {candidature.company_name}
          </h1>
          <span
            className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-sans shrink-0 ${statusPillClass(candidature.status)}`}
          >
            {statusLabel(candidature.status, t)}
          </span>
        </div>

        {candidature.target_role && (
          <p className="font-sans text-[14px] text-muted">
            {candidature.target_role}
          </p>
        )}

        {managerName && (
          <div className="rounded-xl border border-ink/10 bg-white p-4 space-y-1.5">
            <p className="font-sans text-[13px] font-medium text-ink">{managerName}</p>
            {candidature.manager_role && (
              <p className="font-sans text-[12px] text-muted">{candidature.manager_role}</p>
            )}
            {candidature.manager_email && (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="font-sans text-[13px] text-ink">{candidature.manager_email}</span>
                {candidature.manager_email_confidence && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-sans ${confidenceBadgeClass(candidature.manager_email_confidence)}`}
                  >
                    {candidature.manager_email_confidence === "high"
                      ? tw("confidenceHigh")
                      : candidature.manager_email_confidence === "medium"
                        ? tw("confidenceMedium")
                        : candidature.manager_email_confidence === "low"
                          ? tw("confidenceLow")
                          : tw("confidenceManual")}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!message ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-6 space-y-4">
          <p className="font-serif italic text-[15px] text-burgundy leading-snug">
            {t("noDraftYet")}
          </p>
          <Link
            href={`/${locale}/dashboard/candidatures/new?c=${id}`}
            className="inline-flex h-11 items-center px-6 rounded-xl bg-ink text-cream font-sans text-[14px] font-medium transition-opacity hover:opacity-80"
          >
            {t("continueDraft")}
          </Link>
        </div>
      ) : (
        <>
          <DraftEditor
            candidatureId={id}
            initialSubject={message.subject}
            initialBody={message.user_edited_body ?? message.body}
          />
          {candidature.status === "ready" && (
            <SendBlock
              candidatureId={id}
              email={candidature.manager_email ?? ""}
              subject={message.subject}
              body={message.user_edited_body ?? message.body}
            />
          )}
        </>
      )}

      <StatusActions candidatureId={id} status={candidature.status} />
    </div>
  );
}
