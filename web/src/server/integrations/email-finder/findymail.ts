import {
  type EmailFinder,
  type EmailFinderQuery,
  type EmailFinderResult,
  EmailFinderUnavailableError,
} from "./index";

// Verified against https://app.findymail.com/docs/ — POST /api/search/name
// Body: { name: string, domain: string }; response: { contact: { name, email, domain } | null }
const ENDPOINT = "https://app.findymail.com/api/search/name";
const TIMEOUT_MS = 8000;
const COST_PER_FOUND_USD = 0.02;

export class FindymailAdapter implements EmailFinder {
  readonly provider = "findymail";

  constructor(private readonly apiKey: string) {}

  async findEmail(query: EmailFinderQuery): Promise<EmailFinderResult> {
    if (process.env.E2E_MOCK === "1") {
      const last = query.lastName.toLowerCase();
      if (last.includes("notfound")) return { found: false, costUsd: 0, raw: { mock: true } };
      if (last.includes("unavailable")) throw new EmailFinderUnavailableError();
      return {
        found: true,
        email: `${query.firstName.toLowerCase()}.${query.lastName.toLowerCase()}@${query.domain}`,
        confidence: "high",
        costUsd: 0,
        raw: { mock: true },
      };
    }

    const body = JSON.stringify({
      name: `${query.firstName} ${query.lastName}`,
      domain: query.domain,
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
          },
          body,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.status >= 500) {
          if (attempt === 0) continue;
          throw new EmailFinderUnavailableError();
        }
        if (!res.ok) {
          return { found: false, costUsd: 0, raw: { status: res.status } };
        }

        const json = (await res.json()) as { contact?: { email?: string } | null };
        const email = json.contact?.email;
        if (email) {
          return { found: true, email, confidence: "high", costUsd: COST_PER_FOUND_USD, raw: json };
        }
        return { found: false, costUsd: 0, raw: json };
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof EmailFinderUnavailableError) throw err;
        if (attempt === 0) continue;
        throw new EmailFinderUnavailableError();
      }
    }
    throw new EmailFinderUnavailableError();
  }
}

export function getEmailFinder(): EmailFinder {
  if (process.env.E2E_MOCK === "1") return new FindymailAdapter("e2e-mock");
  const key = process.env.FINDYMAIL_API_KEY;
  if (!key) throw new Error("FINDYMAIL_API_KEY is not set");
  return new FindymailAdapter(key);
}
