"use server";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { MODELS } from "@/server/integrations/ai";
import { extractJsonObject } from "@/server/integrations/ai/json";
import { buildToolPrompt, type ToolMode, type ToolInputs } from "@/server/integrations/ai/prompts/tool-generator";
import { addToAudience, getEmailSender } from "@/server/integrations/email/resend";

const FROM = process.env.EMAIL_FROM_TRANSACTIONAL ?? "Cheatjob <notifications@cheatjob.com>";

type GenResult = { ok: true; subject: string; body: string } | { ok: false; error: "blocked" | "rate_limited" | "generation_failed" };

export async function generateToolEmail(args: { mode: ToolMode; inputs: ToolInputs; honeypot?: string }): Promise<GenResult> {
  if (args.honeypot) return { ok: false, error: "blocked" };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { data: allowed, error: rlErr } = await getServiceClient().rpc("tool_consume", { p_ip: ip, p_cap: 5 });
  if (rlErr || allowed === false) return { ok: false, error: "rate_limited" };
  try {
    const { text } = await getAIProvider().complete(MODELS.tool, buildToolPrompt(args.mode, args.inputs));
    const parsed = extractJsonObject(text) as { subject?: unknown; body?: unknown };
    if (typeof parsed?.subject !== "string" || typeof parsed?.body !== "string") return { ok: false, error: "generation_failed" };
    return { ok: true, subject: parsed.subject, body: parsed.body };
  } catch {
    return { ok: false, error: "generation_failed" };
  }
}

export async function captureToolLead(args: { email: string; mode: ToolMode; locale: string; subject: string; body: string }): Promise<{ ok: boolean }> {
  const email = args.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false };
  try { await addToAudience(email); } catch (e) { console.error("addToAudience failed", e); }
  try {
    await getEmailSender().send({
      to: email,
      from: FROM,
      subject: args.subject,
      html: `<pre style="font:inherit;white-space:pre-wrap">${args.body}</pre><p><a href="https://www.cheatjob.com/${args.locale}/sign-up?from=outils">Crée ton compte Cheatjob</a></p>`,
    });
  } catch (e) { console.error("sendEmail failed", e); }
  return { ok: true };
}
