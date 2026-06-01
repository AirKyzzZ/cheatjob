"use server";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { MODELS } from "@/server/integrations/ai";
import { buildToolPrompt, parseToolEmail, type ToolMode, type ToolInputs } from "@/server/integrations/ai/prompts/tool-generator";
import { addToAudience } from "@/server/integrations/email/resend";

type GenResult = { ok: true; subject: string; body: string } | { ok: false; error: "blocked" | "rate_limited" | "generation_failed" };

export async function generateToolEmail(args: { mode: ToolMode; inputs: ToolInputs; honeypot?: string }): Promise<GenResult> {
  if (args.honeypot) return { ok: false, error: "blocked" };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { data: allowed, error: rlErr } = await getServiceClient().rpc("tool_consume", { p_ip: ip, p_cap: 5 });
  if (rlErr || allowed === false) return { ok: false, error: "rate_limited" };
  try {
    const { text } = await getAIProvider().complete(MODELS.tool, buildToolPrompt(args.mode, args.inputs));
    const parsed = parseToolEmail(text);
    if (!parsed) return { ok: false, error: "generation_failed" };
    return { ok: true, subject: parsed.subject, body: parsed.body };
  } catch {
    return { ok: false, error: "generation_failed" };
  }
}

export async function captureToolLead(args: { email: string }): Promise<{ ok: boolean }> {
  const email = args.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false };
  // Per-IP/day rate limit so this can't mass-add arbitrary addresses to the
  // audience. Deliberately sends NO mail: emailing client-supplied content (or
  // to a client-supplied recipient) from our domain would be an open relay.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { data: allowed } = await getServiceClient().rpc("tool_consume", { p_ip: ip, p_cap: 10 });
  if (allowed === false) return { ok: false };
  try {
    await addToAudience(email);
  } catch (e) {
    console.error("addToAudience failed", e);
  }
  return { ok: true };
}
