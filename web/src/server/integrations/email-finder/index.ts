export type EmailFinderQuery = {
  firstName: string;
  lastName: string;
  domain: string;
};

// `confidence` is a provider-agnostic tri-state. Findymail (current sole
// adapter) doesn't grade results, so it returns "high" on every found. The
// `medium`/`low` branches exist for future adapters that do grade (e.g.
// Hunter.io's confidence score); keeping the union shape stable means a
// provider swap doesn't ripple into call sites.
export type EmailFinderResult =
  | { found: true; email: string; confidence: "high" | "medium" | "low"; costUsd: number; raw: unknown }
  | { found: false; costUsd: number; raw: unknown };

export class EmailFinderUnavailableError extends Error {
  constructor() {
    super("Email finder unavailable");
    this.name = "EmailFinderUnavailableError";
  }
}

export interface EmailFinder {
  readonly provider: string;
  findEmail(query: EmailFinderQuery): Promise<EmailFinderResult>;
}
