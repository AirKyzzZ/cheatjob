import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Full authenticated end-to-end test for Phase 1a.
 *
 * Strategy: create a pre-confirmed user via the Supabase Admin API (service
 * role) so no email inbox is needed. Then drive the real UI:
 *   sign-in -> onboarding gate -> complete onboarding -> dashboard
 *   -> profile -> sign-out.
 *
 * Each precondition failure is surfaced as a precise, actionable assertion
 * message so a red test reads like a remediation checklist.
 */

const SHOTS = "e2e/screenshots";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TEST_EMAIL = `e2e-phase1a-${Date.now()}@cheatjob-e2e.test`;
const TEST_PASSWORD = "Cheatjob-E2E-Test-1234";

let admin: SupabaseClient;
let createdUserId: string | null = null;

test.beforeAll(async () => {
  expect(
    SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL missing from web/.env (test harness did not source env)",
  ).toBeTruthy();
  expect(
    SERVICE_ROLE,
    "SUPABASE_SERVICE_ROLE_KEY missing from web/.env -> cannot admin-create test user",
  ).toBeTruthy();
  expect(
    ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY missing from web/.env",
  ).toBeTruthy();

  admin = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pre-confirmed user: email_confirm:true bypasses the email-confirmation gate.
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { locale: "en" },
  });

  expect(
    error,
    `admin.createUser failed: ${error?.message ?? ""} -> check SUPABASE_SERVICE_ROLE_KEY validity / Auth enabled`,
  ).toBeNull();
  expect(data.user?.id, "admin.createUser returned no user id").toBeTruthy();
  createdUserId = data.user!.id;

  // The signup trigger (tg_create_profile_on_signup) fires on auth.users
  // INSERT and creates a profiles row. admin.createUser inserts directly,
  // so the trigger must be present for the profile to exist. Verify it.
  // Poll briefly: trigger is synchronous but be defensive.
  let profile: { onboarded_at: string | null } | null = null;
  for (let i = 0; i < 10; i++) {
    const { data: p, error: pErr } = await admin
      .from("profiles")
      .select("user_id, onboarded_at")
      .eq("user_id", createdUserId)
      .maybeSingle();

    if (pErr) {
      // Most diagnostic failure: column / table missing.
      expect(
        pErr.message,
        `Querying profiles failed -> likely migration 1 not applied (onboarded_at column / profiles table). Raw: ${pErr.message}`,
      ).toBe("__SHOULD_NOT_HAPPEN__");
    }
    if (p) {
      profile = p as { onboarded_at: string | null };
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  expect(
    profile,
    "No profiles row created for admin-created user -> trigger tg_create_profile_on_signup on auth.users NOT applied (migration 1)",
  ).not.toBeNull();
  expect(
    profile!.onboarded_at,
    "Fresh user already has onboarded_at set -> seed/test data contamination",
  ).toBeNull();
});

test.afterAll(async () => {
  if (createdUserId && admin) {
    // Storage objects under cv-files/<uid>/ would block nothing here (none
    // uploaded in this flow), but delete user cascades profiles via FK.
    await admin.auth.admin.deleteUser(createdUserId).catch(() => {});
  }
});

async function signIn(page: Page) {
  await page.goto("/en/sign-in", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("auth flow: sign-in -> onboarding -> dashboard -> profile -> sign-out", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // --- 1. Sign in. Fresh user is not onboarded -> must land on onboarding.
  await signIn(page);
  await page.waitForURL(/\/en\/(onboarding|dashboard)/, { timeout: 20_000 });
  await expect(
    page,
    "post-signin redirect: fresh (not-onboarded) user must hit /onboarding, not /dashboard (onboarding gate broken)",
  ).toHaveURL(/\/en\/onboarding/);

  await expect(
    page.getByRole("heading", { level: 1, name: "Welcome. Let us get to know you." }),
  ).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/auth_onboarding.png`, fullPage: true });

  // --- 2. Complete onboarding.
  await page.locator("input").first().fill("E2E Test Student");
  // School is the 2nd text input.
  const inputs = page.locator('input[type="text"], input:not([type])');
  await inputs.nth(1).fill("Test University");
  // Study level + locale are radio groups; pick by visible label.
  await page.getByText("M2", { exact: true }).click();
  await page.getByText("EN", { exact: true }).click();

  await page.getByRole("button", { name: "Get started" }).click();

  await page.waitForURL(/\/en\/dashboard/, { timeout: 20_000 });
  await expect(
    page,
    "post-onboarding redirect: should land on /dashboard (completeOnboarding did not set onboarded_at or redirect failed)",
  ).toHaveURL(/\/en\/dashboard$/);

  // --- 3. Dashboard: authenticated empty state renders.
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "You have not contacted anyone yet.",
    }),
  ).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/auth_dashboard.png`, fullPage: true });

  // Onboarding gate now reversed: visiting /onboarding redirects to dashboard.
  await page.goto("/en/onboarding", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/en\/dashboard/, { timeout: 15_000 });
  await expect(
    page,
    "onboarded user visiting /onboarding must be bounced to /dashboard (reverse gate broken)",
  ).toHaveURL(/\/en\/dashboard$/);

  // --- 4. Profile page renders identity from the persisted profile.
  await page.goto("/en/dashboard/profile", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: "Your profile" }),
  ).toBeVisible();
  await expect(
    page.getByText("E2E Test Student"),
    "Profile identity must show the full_name persisted during onboarding",
  ).toBeVisible();
  await expect(
    page.getByText("Test University"),
    "Profile identity must show the school persisted during onboarding",
  ).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/auth_profile.png`, fullPage: true });

  // --- 5. Sign out -> back to public, dashboard is gated again.
  // The profile page renders two "Sign out" affordances (sidebar nav +
  // danger-zone button). Target the danger-zone one explicitly to avoid a
  // strict-mode ambiguity.
  await page
    .getByRole("main")
    .getByRole("button", { name: "Sign out" })
    .click();
  await page.waitForURL(/\/en(\/)?$/, { timeout: 15_000 });

  await page.goto("/en/dashboard", { waitUntil: "domcontentloaded" });
  await expect(
    page,
    "after sign-out, /dashboard must redirect to /sign-in (session not cleared)",
  ).toHaveURL(/\/en\/sign-in/);
});

test("db: onboarding persisted full_name, school, study_level, onboarded_at", async () => {
  const { data, error } = await admin
    .from("profiles")
    .select("user_id, full_name, school, study_level, onboarded_at, locale")
    .eq("user_id", createdUserId!)
    .single();

  // Surface the raw persisted row so a mismatch reads like a diff, not a guess.
  console.log(
    `[db readback] createdUserId=${createdUserId} row=${JSON.stringify(data)} err=${error?.message ?? "none"}`,
  );

  expect(error, `profiles read-back failed: ${error?.message ?? ""}`).toBeNull();
  expect(data!.full_name, "full_name not persisted by completeOnboarding").toBe(
    "E2E Test Student",
  );
  expect(data!.school, "school not persisted by completeOnboarding").toBe(
    "Test University",
  );
  expect(
    data!.study_level,
    "study_level not persisted by completeOnboarding",
  ).toBe("M2");
  expect(
    data!.onboarded_at,
    "onboarded_at still null after onboarding -> markOnboarded not called / column missing",
  ).not.toBeNull();
});
