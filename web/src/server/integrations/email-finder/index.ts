export type EmailFinderQuery = {
  firstName: string;
  lastName: string;
  domain: string;
};

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
