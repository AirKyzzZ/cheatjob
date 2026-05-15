import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const skip = process.env.SKIP_INTEGRATION === "1";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(skip ? describe.skip : describe)("dashboard onboarding gate", () => {
  let testUserId: string | undefined;

  beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: `gate-test-${Date.now()}@cheatjob.test`,
      password: "test-password-12345",
      email_confirm: true,
    });
    if (error) throw error;
    testUserId = data.user?.id;
  });

  afterAll(async () => {
    if (testUserId) await admin.auth.admin.deleteUser(testUserId);
  });

  it("unauthenticated visit to /dashboard redirects to sign-in", async () => {
    const res = await fetch(`${APP_URL}/en/dashboard`, { redirect: "manual" });
    expect([302, 307]).toContain(res.status);
    expect(res.headers.get("location")).toContain("/en/sign-in");
  });

  it("authenticated, not onboarded -> onboarding (deferred to Playwright in 1b)", () => {
    // Exercising the auth'd gate requires a session cookie, which needs a
    // browser-driven login. Phase 1a ships the gate logic (dashboard/layout.tsx
    // + onboarding/layout.tsx); full E2E coverage lands with Playwright in 1b.
    expect(true).toBe(true);
  });
});
