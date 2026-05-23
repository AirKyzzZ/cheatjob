import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync } from "node:fs";

/**
 * Phase 1b — Candidature wizard E2E journey.
 *
 * Mocking strategy: sentinel-driven server-side test doubles.
 *
 * Server Actions (findEmail, generateMessage) make HTTP calls from the
 * Next.js server process — page.route cannot intercept those. Instead, when
 * the dev server is started with E2E_MOCK=1 (set by playwright.config.ts
 * webServer.env), the Findymail and OpenRouter adapters short-circuit and
 * return canned responses based on the recruiter's lastName:
 *   - lastName contains "notfound"   → EmailFinderResult { found: false }
 *   - lastName contains "unavailable" → EmailFinderUnavailableError
 *   - any other lastName             → found result with generated email
 * OpenRouter always returns { subject: "Test subject", body: "Test body for E2E mock." }.
 *
 * Auth: admin-created confirmed user (same pattern as phase1a-auth.spec.ts).
 * Each test that needs a seeded state creates its own candidature via
 * the service-role admin client rather than relying on UI state from another test.
 */

const SHOTS = "e2e/screenshots/phase1b";
mkdirSync(SHOTS, { recursive: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TS = Date.now();
const TEST_EMAIL = `e2e-phase1b-${TS}@cheatjob-e2e.test`;
const TEST_PASSWORD = "Cheatjob-Phase1b-E2E-9!";

let admin: SupabaseClient;
let createdUserId: string | null = null;
const createdUserIds: string[] = [];

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function signIn(page: Page) {
  await page.goto("/fr/sign-in", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/fr\/(onboarding|dashboard)/, { timeout: 20_000 });

  if (page.url().includes("/onboarding")) {
    const inputs = page.locator('input[type="text"], input:not([type]):not([name="email"]):not([name="password"])');
    await inputs.nth(0).fill("Journey Test Student");
    await inputs.nth(1).fill("Test University");
    await page.getByText("M2", { exact: true }).click();
    await page.getByText("FR", { exact: true }).click();
    await page.getByRole("button", { name: "Commencer" }).click();
    await page.waitForURL(/\/fr\/dashboard/, { timeout: 20_000 });
  }
}

// ---------------------------------------------------------------------------
// Setup: create + confirm one shared user for all tests
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  expect(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL missing").toBeTruthy();
  expect(SERVICE_ROLE, "SUPABASE_SERVICE_ROLE_KEY missing").toBeTruthy();
  expect(ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY missing").toBeTruthy();

  admin = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { locale: "fr" },
  });

  expect(error, `admin.createUser failed: ${error?.message ?? ""}`).toBeNull();
  expect(data.user?.id, "admin.createUser returned no id").toBeTruthy();
  createdUserId = data.user!.id;
  createdUserIds.push(createdUserId);

  let profile = null;
  for (let i = 0; i < 10; i++) {
    const { data: p } = await admin
      .from("profiles")
      .select("user_id, onboarded_at")
      .eq("user_id", createdUserId)
      .maybeSingle();
    if (p) {
      profile = p;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  expect(profile, "profiles trigger did not fire for admin-created user").not.toBeNull();
});

test.afterAll(async () => {
  if (!admin) return;
  for (const id of createdUserIds) {
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// Journey 1: Full wizard (email found) → detail page → mark sent
// ---------------------------------------------------------------------------

test("J1. full wizard: company → recruiter → email found → offer → generate → detail → mark sent", async ({
  page,
}) => {
  test.setTimeout(180_000);

  await signIn(page);
  await page.screenshot({ path: `${SHOTS}/j1_dashboard.png` });

  // Navigate to "Créer une candidature"
  await page.goto("/fr/dashboard/candidatures/new", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/fr\/dashboard\/candidatures\/new/);

  // --- Step 1: Cible (company)
  await expect(page.getByText("Étape 1 sur 5")).toBeVisible({ timeout: 10_000 });
  await page.locator('input').first().fill("Acme Corp");
  // Optional website
  await page.locator('input[type="url"]').first().fill("https://acme.com");
  await page.screenshot({ path: `${SHOTS}/j1_step1.png` });
  await page.getByRole("button", { name: "Continuer" }).click();

  // --- Step 2: Recruteur (recruiter)
  await expect(page.getByText("Étape 2 sur 5")).toBeVisible({ timeout: 10_000 });
  const inputs = page.locator('input[type="text"], input:not([type]):not([name="email"]):not([name="password"]):not([type="url"])');
  await inputs.nth(0).fill("Thomas");
  await inputs.nth(1).fill("Dupont");
  await inputs.nth(2).fill("Engineering Manager");
  await page.screenshot({ path: `${SHOTS}/j1_step2.png` });
  await page.getByRole("button", { name: "Continuer" }).click();

  // --- Step 3: Email finder (mocked — found)
  await expect(page.getByText("Étape 3 sur 5")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Trouver l'email" }).click();
  await expect(page.getByText("thomas.dupont@acme.com")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Haute confiance")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/j1_step3_found.png` });
  await page.getByRole("button", { name: "Continuer" }).click();

  // --- Step 4: Offer context
  await expect(page.getByText("Étape 4 sur 5")).toBeVisible({ timeout: 10_000 });
  const textarea = page.locator("textarea");
  await textarea.fill("Stage Software Engineer chez Acme — collaboration avec l'équipe produit sur la plateforme de données.");
  await page.screenshot({ path: `${SHOTS}/j1_step4.png` });
  await page.getByRole("button", { name: "Continuer" }).click();

  // --- Step 5: Generate (mocked OpenRouter)
  await expect(page.getByText("Étape 5 sur 5")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Générer mon message" }).click();
  await expect(page.getByText("Test subject")).toBeVisible({ timeout: 20_000 });
  await page.screenshot({ path: `${SHOTS}/j1_step5_generated.png` });

  // Navigate to candidature detail
  await page.getByRole("button", { name: "Voir ma candidature" }).click();
  await page.waitForURL(/\/fr\/dashboard\/candidatures\/[a-z0-9-]+$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Status pill should show "Prêt à envoyer" (ready)
  await expect(page.getByText("Prêt à envoyer")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/j1_detail_ready.png` });

  // Mark as sent: open Gmail → confirm sent
  await page.getByRole("button", { name: "Ouvrir dans Gmail" }).click();
  // After clicking Gmail, the confirm prompt appears (sentConfirmPrompt)
  await expect(page.getByText("Tu as envoyé ce message ?")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Oui, envoyé" }).click();
  // Status should flip to "Envoyé" after the server action + refresh
  await expect(page.getByText("Envoyé")).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}/j1_detail_sent.png` });

  // Back to dashboard: candidature appears in the list
  await page.goto("/fr/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Acme Corp")).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// Journey 2: Email not found → manual email entry → advance to step 4
// ---------------------------------------------------------------------------

test("J2. email not found → manual entry → wizard advances to step 4", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await signIn(page);
  await page.goto("/fr/dashboard/candidatures/new", { waitUntil: "domcontentloaded" });

  // Step 1
  await expect(page.getByText("Étape 1 sur 5")).toBeVisible({ timeout: 10_000 });
  await page.locator('input').first().fill("Gamma Ltd");
  await page.getByRole("button", { name: "Continuer" }).click();

  // Step 2 — lastName "Notfound" triggers the E2E_MOCK not-found branch
  await expect(page.getByText("Étape 2 sur 5")).toBeVisible({ timeout: 10_000 });
  const inputs = page.locator('input[type="text"], input:not([type]):not([name="email"]):not([name="password"]):not([type="url"])');
  await inputs.nth(0).fill("Marie");
  await inputs.nth(1).fill("Notfound");
  await inputs.nth(2).fill("CTO");
  await page.getByRole("button", { name: "Continuer" }).click();

  // Step 3: trigger lookup → not found → manual field appears
  await expect(page.getByText("Étape 3 sur 5")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Trouver l'email" }).click();
  await expect(page.getByText("On n'a pas trouvé l'email.")).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}/j2_step3_not_found.png` });

  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible();
  await emailInput.fill("marie.martin@gamma.com");
  await page.getByRole("button", { name: "Enregistrer l'email" }).click();

  // After saving, email is confirmed as "found" (confidence=manual)
  await expect(page.getByText("marie.martin@gamma.com")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Saisi manuellement")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/j2_step3_manual_saved.png` });

  // Wizard can advance to step 4
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText("Étape 4 sur 5")).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// Journey 3: Resume wizard at step 2 (abandon then reload with ?c=<id>)
// ---------------------------------------------------------------------------

test("J3. resume: abandon at step 2, reload with ?c=<id> → resumes at step 2 with values", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await signIn(page);

  // Create a candidature via admin and seed it to wizard_step=2
  const { data: cand, error: candErr } = await admin
    .from("candidatures")
    .insert({
      user_id: createdUserId!,
      company_name: "Resume Corp",
      company_website: "https://resumecorp.com",
      company_domain: "resumecorp.com",
      status: "draft",
      wizard_step: 2,
      manager_first_name: "Jean",
      manager_last_name: "Lefebvre",
      manager_role: "Product Manager",
    })
    .select("id")
    .single();

  expect(candErr, `failed to seed candidature: ${candErr?.message ?? ""}`).toBeNull();
  const candidatureId = cand!.id;

  // Navigate with ?c=<id> — wizard should resume at step 2
  await page.goto(`/fr/dashboard/candidatures/new?c=${candidatureId}`, {
    waitUntil: "domcontentloaded",
  });

  // The wizard initializes at wizard_step=2 (Recruteur)
  await expect(page.getByText("Étape 2 sur 5")).toBeVisible({ timeout: 10_000 });

  // Pre-populated fields from the seeded row
  const firstNameInput = page.locator('input').first();
  await expect(firstNameInput).toHaveValue("Jean");
  await page.screenshot({ path: `${SHOTS}/j3_resume_step2.png` });

  // Clean up the seeded candidature
  await admin.from("candidatures").delete().eq("id", candidatureId);
});

// ---------------------------------------------------------------------------
// Journey 4: Quota exhaustion — step 3 shows upgrade gate
// ---------------------------------------------------------------------------

test("J4. quota exhausted: step 3 shows upgrade link instead of find-email button", async ({
  page,
}) => {
  test.setTimeout(120_000);

  // Exhaust the quota for the shared test user
  const { error: updateErr } = await admin
    .from("profiles")
    .update({ quota_used: 3, quota_total: 3 })
    .eq("user_id", createdUserId!);
  expect(updateErr, `quota exhaustion seed failed: ${updateErr?.message ?? ""}`).toBeNull();

  await signIn(page);

  // Create a candidature seeded to step 2 so we can reach step 3
  const { data: cand, error: candErr } = await admin
    .from("candidatures")
    .insert({
      user_id: createdUserId!,
      company_name: "Quota Corp",
      company_domain: "quotacorp.com",
      status: "draft",
      wizard_step: 2,
      manager_first_name: "Sophie",
      manager_last_name: "Bernard",
      manager_role: "Hiring Manager",
    })
    .select("id")
    .single();
  expect(candErr, `candidature seed failed: ${candErr?.message ?? ""}`).toBeNull();
  const candidatureId = cand!.id;

  // Navigate to the wizard at step 2, then continue to step 3
  await page.goto(`/fr/dashboard/candidatures/new?c=${candidatureId}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByText("Étape 2 sur 5")).toBeVisible({ timeout: 10_000 });

  // Values are pre-populated; submit step 2 to advance to step 3
  await page.getByRole("button", { name: "Continuer" }).click();

  // Step 3 with quota exhausted: upgrade link shown, not the find-email button
  await expect(page.getByText("Étape 3 sur 5")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Tu as utilisé tes 3 candidatures gratuites.")).toBeVisible({
    timeout: 10_000,
  });
  const upgradeLink = page.getByRole("link", { name: "Passer à l'offre supérieure" });
  await expect(upgradeLink).toBeVisible();
  await expect(upgradeLink).toHaveAttribute("href", /dashboard\/upgrade/);
  await page.screenshot({ path: `${SHOTS}/j4_quota_exhausted.png` });

  // Clean up
  await admin.from("candidatures").delete().eq("id", candidatureId);
  // Restore quota so other tests running after this one are not affected
  await admin
    .from("profiles")
    .update({ quota_used: 0, quota_total: 3 })
    .eq("user_id", createdUserId!);
});
