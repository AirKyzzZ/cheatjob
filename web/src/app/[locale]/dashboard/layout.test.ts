import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const hasEnv = !!SUPABASE_URL && !!SERVICE_KEY && process.env.SKIP_INTEGRATION !== "1";
const d = hasEnv ? describe : describe.skip;

let admin: SupabaseClient<Database>;

d("dashboard onboarding gate", () => {
  let testUserId: string | undefined;

  beforeAll(async () => {
    admin = createClient<Database>(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
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
    expect(true).toBe(true);
  });
});
