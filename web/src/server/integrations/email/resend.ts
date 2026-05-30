import {
  type EmailSender,
  type SendEmailInput,
  type SendEmailResult,
  EmailSendError,
} from "./index";

// Resend REST API — no SDK (mirrors FindymailAdapter / OpenRouterAdapter).
const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10000;

export class ResendAdapter implements EmailSender {
  readonly provider = "resend";

  constructor(private readonly apiKey: string) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (process.env.E2E_MOCK === "1") {
      return { id: "e2e-mock-email" };
    }

    const body = JSON.stringify({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
          },
          body,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.status >= 500) {
          if (attempt === 0) continue;
          throw new EmailSendError(`Resend ${res.status}`);
        }
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new EmailSendError(`Resend ${res.status}: ${detail.slice(0, 200)}`);
        }

        const json = (await res.json()) as { id?: string };
        if (!json.id) throw new EmailSendError("Resend response missing id");
        return { id: json.id };
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof EmailSendError) throw err;
        if (attempt === 0) continue;
        throw new EmailSendError(err instanceof Error ? err.message : "unknown");
      }
    }
    throw new EmailSendError("unreachable");
  }
}

export function getEmailSender(): EmailSender {
  if (process.env.E2E_MOCK === "1") return new ResendAdapter("e2e-mock");
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new ResendAdapter(key);
}
