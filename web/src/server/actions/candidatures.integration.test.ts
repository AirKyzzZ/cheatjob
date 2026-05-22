import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createCandidature, getCandidature, updateCandidature } from "@/lib/db/candidatures";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY;
const d = hasEnv ? describe : describe.skip;

let admin: SupabaseClient<Database>;
let userAId: string;
let userBId: string;
const createdUserIds: string[] = [];

d("candidature integration — persistence, quota RPC, RLS isolation", () => {
  beforeAll(async () => {
    admin = createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const ts = Date.now();

    const { data: dataA, error: errA } = await admin.auth.admin.createUser({
      email: `cand-integ-a-${ts}@cheatjob.test`,
      password: "Test-Passw0rd-A!",
      email_confirm: true,
    });
    if (errA) throw errA;
    userAId = dataA.user!.id;
    createdUserIds.push(userAId);

    const { data: dataB, error: errB } = await admin.auth.admin.createUser({
      email: `cand-integ-b-${ts}@cheatjob.test`,
      password: "Test-Passw0rd-B!",
      email_confirm: true,
    });
    if (errB) throw errB;
    userBId = dataB.user!.id;
    createdUserIds.push(userBId);
  });

  afterAll(async () => {
    if (!admin) return;
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id).catch(() => {});
    }
  });

  // ---------------------------------------------------------------------------
  // Candidature persistence
  // ---------------------------------------------------------------------------

  it("createCandidature persists a row with expected defaults", async () => {
    const cand = await createCandidature(admin, {
      user_id: userAId,
      company_name: "Acme Corp",
      company_website: "https://acme.com",
      company_domain: "acme.com",
      status: "draft",
      wizard_step: 1,
    });

    expect(cand.id).toBeTruthy();
    expect(cand.company_name).toBe("Acme Corp");
    expect(cand.status).toBe("draft");
    expect(cand.wizard_step).toBe(1);
    expect(cand.user_id).toBe(userAId);
  });

  it("updateCandidature bumps wizard_step and persists manager fields", async () => {
    const cand = await createCandidature(admin, {
      user_id: userAId,
      company_name: "Beta Inc",
      status: "draft",
      wizard_step: 1,
    });

    const updated = await updateCandidature(admin, cand.id, {
      manager_first_name: "Alice",
      manager_last_name: "Durand",
      manager_role: "Engineering Manager",
      wizard_step: 2,
    });

    expect(updated.wizard_step).toBe(2);
    expect(updated.manager_first_name).toBe("Alice");
    expect(updated.manager_last_name).toBe("Durand");
    expect(updated.manager_role).toBe("Engineering Manager");

    const reRead = await getCandidature(admin, cand.id);
    expect(reRead?.wizard_step).toBe(2);
    expect(reRead?.manager_first_name).toBe("Alice");
  });

  it("getCandidature returns null for a non-existent id", async () => {
    const result = await getCandidature(admin, "00000000-0000-0000-0000-000000000000");
    expect(result).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // consume_quota RPC
  // ---------------------------------------------------------------------------

  it("consume_quota returns false when quota_used >= quota_total", async () => {
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ quota_used: 3, quota_total: 3 })
      .eq("user_id", userAId);
    expect(updateErr, `quota seed failed: ${updateErr?.message ?? ""}`).toBeNull();

    const { data, error } = await admin.rpc("consume_quota", { p_user_id: userAId });
    expect(error, `consume_quota RPC error: ${error?.message ?? ""}`).toBeNull();
    expect(data).toBe(false);

    const { data: profile } = await admin
      .from("profiles")
      .select("quota_used")
      .eq("user_id", userAId)
      .single();
    expect(profile?.quota_used).toBe(3);
  });

  it("consume_quota returns true and increments quota_used when headroom exists", async () => {
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ quota_used: 0, quota_total: 3 })
      .eq("user_id", userBId);
    expect(updateErr, `quota seed failed: ${updateErr?.message ?? ""}`).toBeNull();

    const { data, error } = await admin.rpc("consume_quota", { p_user_id: userBId });
    expect(error, `consume_quota RPC error: ${error?.message ?? ""}`).toBeNull();
    expect(data).toBe(true);

    const { data: profile } = await admin
      .from("profiles")
      .select("quota_used")
      .eq("user_id", userBId)
      .single();
    expect(profile?.quota_used).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // RLS isolation: user A's candidature must not be visible to user B
  // ---------------------------------------------------------------------------

  it("RLS: candidature owned by user A is invisible to an anon client", async () => {
    if (!ANON_KEY) {
      console.log("Skipping RLS test: NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
      return;
    }

    const cand = await createCandidature(admin, {
      user_id: userAId,
      company_name: "Secret Corp",
      status: "draft",
      wizard_step: 1,
    });

    const anon = createClient<Database>(SUPABASE_URL!, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await anon
      .from("candidatures")
      .select("*")
      .eq("id", cand.id)
      .maybeSingle();

    expect(error, `unexpected anon query error: ${error?.message ?? ""}`).toBeNull();
    expect(data).toBeNull();
  });

  it("RLS: candidature owned by user A is invisible to a signed-in user B", async () => {
    const cand = await createCandidature(admin, {
      user_id: userAId,
      company_name: "Secret Corp B",
      status: "draft",
      wizard_step: 1,
    });

    const ts = Date.now();
    const { data: signInData, error: signInErr } = await admin.auth.admin.createUser({
      email: `cand-rls-b-${ts}@cheatjob.test`,
      password: "Test-RLS-B-Pass1!",
      email_confirm: true,
    });
    if (signInErr) throw signInErr;
    const rlsUserId = signInData.user!.id;
    createdUserIds.push(rlsUserId);

    if (!ANON_KEY) {
      console.log("Skipping user-B RLS test: NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
      await admin.auth.admin.deleteUser(rlsUserId).catch(() => {});
      return;
    }

    const userBClient = createClient<Database>(SUPABASE_URL!, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authErr } = await userBClient.auth.signInWithPassword({
      email: `cand-rls-b-${ts}@cheatjob.test`,
      password: "Test-RLS-B-Pass1!",
    });
    expect(authErr, `user B sign-in failed: ${authErr?.message ?? ""}`).toBeNull();

    const { data, error } = await userBClient
      .from("candidatures")
      .select("*")
      .eq("id", cand.id)
      .maybeSingle();

    expect(error, `unexpected user-B query error: ${error?.message ?? ""}`).toBeNull();
    expect(data).toBeNull();
  });
});
