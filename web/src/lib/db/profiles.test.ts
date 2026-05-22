import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getProfile, updateProfile, markOnboarded } from "./profiles";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasEnv = !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY;
const d = hasEnv ? describe : describe.skip;

let admin: SupabaseClient<Database>;
let testUserId: string;

d("lib/db/profiles", () => {
  beforeAll(async () => {
    admin = createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.createUser({
      email: `test-${Date.now()}@cheatjob.test`,
      password: "test-password-12345",
      email_confirm: true,
    });
    if (error) throw error;
    testUserId = data.user!.id;
  });

  it("getProfile returns null for nonexistent user", async () => {
    const result = await getProfile(admin, "00000000-0000-0000-0000-000000000000");
    expect(result).toBeNull();
  });

  it("getProfile returns row for existing user (created by trigger)", async () => {
    const result = await getProfile(admin, testUserId);
    expect(result).not.toBeNull();
    expect(result?.user_id).toBe(testUserId);
    expect(result?.onboarded_at).toBeNull();
  });

  it("updateProfile updates fields", async () => {
    await updateProfile(admin, testUserId, { full_name: "Test User", school: "ESSEC" });
    const result = await getProfile(admin, testUserId);
    expect(result?.full_name).toBe("Test User");
    expect(result?.school).toBe("ESSEC");
  });

  it("markOnboarded sets onboarded_at", async () => {
    await markOnboarded(admin, testUserId);
    const result = await getProfile(admin, testUserId);
    expect(result?.onboarded_at).not.toBeNull();
  });
});
