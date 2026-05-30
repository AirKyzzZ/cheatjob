import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/admin";
import {
  claimDueFollowUps,
  markScheduledEmailSent,
  markScheduledEmailCancelled,
  markScheduledEmailFailed,
} from "@/lib/db/scheduled-emails";
import { getCandidature } from "@/lib/db/candidatures";
import { getProfile } from "@/lib/db/profiles";
import { getEmailSender } from "@/server/integrations/email/resend";
import { renderFollowUpReminder } from "@/server/integrations/email/templates/follow-up-reminder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.SITE_URL ?? "https://www.cheatjob.com").replace(/\/$/, "");
const FROM = process.env.EMAIL_FROM_TRANSACTIONAL ?? "Cheatjob <notifications@cheatjob.com>";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const authorized =
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  if (!authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const service = getServiceClient();
  const due = await claimDueFollowUps(service, new Date().toISOString());

  let sent = 0;
  let cancelled = 0;
  let failed = 0;

  for (const row of due) {
    try {
      if (!row.candidature_id) {
        await markScheduledEmailFailed(service, row.id, "missing candidature_id", row.attempts);
        failed++;
        continue;
      }

      const candidature = await getCandidature(service, row.candidature_id);
      if (!candidature) {
        await markScheduledEmailCancelled(service, row.id);
        cancelled++;
        continue;
      }

      // Defense-in-depth: never email a user a link to someone else's candidature.
      if (candidature.user_id !== row.user_id) {
        await markScheduledEmailCancelled(service, row.id);
        cancelled++;
        continue;
      }

      // Only nag while the candidature is still awaiting a reply. If the user
      // already marked it replied/closed, cancel the reminder silently.
      if (candidature.status !== "sent") {
        await markScheduledEmailCancelled(service, row.id);
        cancelled++;
        continue;
      }

      const profile = await getProfile(service, row.user_id);
      const locale = profile?.locale ?? "fr";

      const { data: userRes } = await service.auth.admin.getUserById(row.user_id);
      const to = userRes?.user?.email;
      if (!to) {
        await markScheduledEmailFailed(service, row.id, "no recipient email", row.attempts);
        failed++;
        continue;
      }

      const { subject, html, text } = renderFollowUpReminder({
        recruiterName: candidature.manager_first_name,
        companyName: candidature.company_name,
        candidatureUrl: `${SITE_URL}/${locale}/dashboard/candidatures/${row.candidature_id}`,
        locale,
      });

      await getEmailSender().send({
        to,
        from: FROM,
        subject,
        html,
        text,
        idempotencyKey: `scheduled-email/${row.id}`,
      });
      await markScheduledEmailSent(service, row.id);
      sent++;
    } catch (err) {
      await markScheduledEmailFailed(
        service,
        row.id,
        err instanceof Error ? err.message : "unknown",
        row.attempts,
      ).catch(() => {});
      failed++;
    }
  }

  return NextResponse.json({ processed: due.length, sent, cancelled, failed });
}
