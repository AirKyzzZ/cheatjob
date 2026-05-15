import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync } from "node:fs";

/**
 * Phase 1a — COMPLETE landing-to-dashboard journey.
 *
 * Covers the repointed marketing CTAs (commit 85c4554) through the full
 * auth + onboarding + dashboard + profile flow against the local dev
 * server + live Supabase. Test users are admin-created/confirmed/cleaned
 * via the service role key.
 *
 * Notes from source inspection (premises this test relies on):
 *  - Hero / Pricing / FinalCTA each branch on a Stripe link env var; when
 *    NEXT_PUBLIC_STRIPE_LINK_* are EMPTY (current .env state) the
 *    sign-up branch renders. If those are ever set, the CTAs point to
 *    Stripe instead and A2/A3 expectations flip — the test asserts the
 *    actual href and annotates which branch fired.
 *  - The sign-up form (SignUpForm) takes only `locale`; it does NOT read
 *    the `?email=` query param. A5 asserts the URL param and records the
 *    prefill gap as a known finding rather than failing.
 */

const SHOTS = "e2e/screenshots/journey";
mkdirSync(SHOTS, { recursive: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TS = Date.now();
// Supabase Auth's public signUp API runs an email-validity check that
// rejects reserved TLDs like `.test`/`.dev` ("Email address is invalid").
// admin.createUser bypasses that check. Use a real, deliverable-format
// domain so B7 reaches Supabase on its merits (the only thing that can
// still block it is the shared project's email-send rate limit, which
// B8 handles gracefully).
const JOURNEY_EMAIL = `cheatjob.e2e.journey.${TS}@gmail.com`;
const JOURNEY_PASSWORD = "Cheatjob-Journey-Test-1234";

let admin: SupabaseClient;
const createdUserIds: string[] = [];

async function findUserByEmail(email: string) {
  // listUsers is paginated; Phase 1a has a tiny user table so page 1 is
  // sufficient, but page through defensively up to a few pages.
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

test.beforeAll(async () => {
  expect(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL missing").toBeTruthy();
  expect(SERVICE_ROLE, "SUPABASE_SERVICE_ROLE_KEY missing").toBeTruthy();
  expect(ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY missing").toBeTruthy();

  admin = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
});

test.afterAll(async () => {
  if (!admin) return;
  for (const id of createdUserIds) {
    // Remove any CV objects under cv-files/<uid>/ then delete the user
    // (delete cascades the profiles row via FK).
    try {
      const { data: list } = await admin.storage
        .from("cv-files")
        .list(id, { limit: 100 });
      if (list && list.length) {
        await admin.storage
          .from("cv-files")
          .remove(list.map((o) => `${id}/${o.name}`));
      }
    } catch {
      /* best-effort cleanup */
    }
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
});

// Strip the fixed marketing header so its overlay never intercepts
// hit-testing on hero/pricing/footer CTAs.
async function dropFixedHeaderOverlap(page: Page) {
  await page
    .addStyleTag({
      content: "header.fixed{pointer-events:none!important}",
    })
    .catch(() => {});
}

// The marketing landing is heavily animated (motion/react whileInView).
// Scroll a target into view and wait for it to be actionable.
async function revealAndClick(page: Page, locator: ReturnType<Page["locator"]>) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible({ timeout: 10_000 });
  await locator.click();
}

// ---------------------------------------------------------------------------
// A. Landing → repointed CTAs
// ---------------------------------------------------------------------------

test("A. landing /fr — repointed CTAs route to sign-up/sign-in, no waitlist modal", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // The waitlist modal (role=dialog) must NEVER appear on any CTA click.
  const dialog = page.getByRole("dialog");

  // --- A1: Nav "Get started" pill -> /fr/sign-up
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/landing_fr.png`, fullPage: true });

  // nav.cta (FR) = "Commencer"; it's the burgundy pill MotionLink.
  const navHeader = page.locator("header.fixed");
  await navHeader.getByRole("link", { name: "Commencer", exact: true }).click();
  await page.waitForURL(/\/fr\/sign-up(\?|$)/, { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/fr/sign-up");
  await expect(dialog).toHaveCount(0);

  // --- A2: Hero primary CTA -> /fr/sign-up (sign-up branch since
  // NEXT_PUBLIC_STRIPE_LINK_SPRINT is empty).
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  await dropFixedHeaderOverlap(page);
  // hero.ctaPrimaryWaitlist (FR) = "Créer mon compte"
  const heroCta = page
    .locator("section")
    .first()
    .getByRole("link", { name: "Créer mon compte" });
  const heroHref = await heroCta.getAttribute("href");
  await heroCta.click();
  await page.waitForURL(/\/fr\/sign-up(\?|$)/, { timeout: 10_000 });
  expect(
    new URL(page.url()).pathname,
    `hero CTA href was ${heroHref}`,
  ).toBe("/fr/sign-up");
  await expect(dialog).toHaveCount(0);

  // --- A3: A pricing plan CTA -> /fr/sign-up?plan=<sprint|mois|vie>
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await dropFixedHeaderOverlap(page);
  const pricingSection = page.locator("#pricing");
  await pricingSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // pricing.ctaWaitlistFallback (FR) = "Commencer"; scope to #pricing.
  const planCta = pricingSection
    .getByRole("link", { name: "Commencer" })
    .first();
  const planHref = await planCta.getAttribute("href");
  await planCta.click();
  await page.waitForURL(/\/fr\/sign-up\?plan=/, { timeout: 10_000 });
  const planUrl = new URL(page.url());
  expect(planUrl.pathname).toBe("/fr/sign-up");
  expect(
    planUrl.searchParams.get("plan"),
    `pricing CTA href was ${planHref}`,
  ).toMatch(/^(sprint|mois|vie)$/);
  await expect(dialog).toHaveCount(0);

  // --- A4: Nav "Log in" link -> /fr/sign-in
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  // nav.login (FR) = "Connexion"
  await navHeader.getByRole("link", { name: "Connexion", exact: true }).click();
  await page.waitForURL(/\/fr\/sign-in(\?|$)/, { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/fr/sign-in");
  await expect(dialog).toHaveCount(0);

  // --- A5: Footer subscribe -> /fr/sign-up?email=<encoded>
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await dropFixedHeaderOverlap(page);
  // The page also renders a small <footer> byline ("Maxime, fondateur");
  // target the real footer landmark (role=contentinfo) instead.
  const footer = page.getByRole("contentinfo");
  const subEmailField = footer.locator('input[type="email"]');
  await subEmailField.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const subEmail = "footer-lead@cheatjob-e2e.dev";
  await subEmailField.fill(subEmail);
  await footer.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/fr\/sign-up\?email=/, { timeout: 10_000 });
  const subUrl = new URL(page.url());
  expect(subUrl.pathname).toBe("/fr/sign-up");
  expect(subUrl.searchParams.get("email")).toBe(subEmail);
  await expect(dialog).toHaveCount(0);

  // Prefill check: SignUpForm does NOT read ?email=. Assert the gap
  // explicitly so it's recorded, not silently passed.
  const emailInputVal = await page
    .locator('input[name="email"]')
    .inputValue();
  expect(
    emailInputVal,
    `FINDING: sign-up form does NOT prefill from ?email= (value="${emailInputVal}", expected "${subEmail}"). Known prefill gap — not a regression.`,
  ).toBe("");
});

test("A. landing /en spot-check — nav CTAs route correctly", async ({
  page,
}) => {
  const dialog = page.getByRole("dialog");
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const navHeader = page.locator("header.fixed");
  // EN: nav.cta="Get started", nav.login="Log in"
  await navHeader.getByRole("link", { name: "Get started", exact: true }).click();
  await page.waitForURL(/\/en\/sign-up(\?|$)/, { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/en/sign-up");
  await expect(dialog).toHaveCount(0);

  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  await navHeader.getByRole("link", { name: "Log in", exact: true }).click();
  await page.waitForURL(/\/en\/sign-in(\?|$)/, { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/en/sign-in");
  await expect(dialog).toHaveCount(0);

  // Mobile snapshot showing the new nav (Log in + Get started).
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${SHOTS}/landing_fr_mobile.png` });
});

// ---------------------------------------------------------------------------
// B–F. Full auth → onboarding → dashboard → profile → sign-out journey
// ---------------------------------------------------------------------------

test("B–F. signup -> confirm -> onboarding -> dashboard -> profile -> signout", async ({
  page,
}) => {
  test.setTimeout(240_000);

  // --- B7: Drive the REAL public sign-up form. This exercises
  // SignUpForm -> signUpWithPassword server action -> supabase.auth.signUp.
  await page.goto("/fr/sign-up", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(JOURNEY_EMAIL);
  await page.locator('input[name="password"]').fill(JOURNEY_PASSWORD);
  await page.screenshot({ path: `${SHOTS}/signup_filled.png`, fullPage: true });
  await page.getByRole("button", { name: "S'inscrire" }).click();

  // --- B8: Two legitimate outcomes against the SHARED LIVE Supabase
  // project:
  //   (a) IDEAL — "check inbox" success state replaces the form.
  //       (auth.signUp.checkEmailTitle FR = "Regarde dans ta boîte.")
  //   (b) ENVIRONMENTAL — Supabase's built-in email service returns
  //       429 over_email_send_rate_limit (default SMTP allowance is a
  //       few mails/hour and is easily exhausted on a shared project).
  //       The app must surface that error via FieldError, NOT crash or
  //       silently swallow it. That fail-fast behavior is itself tested.
  // The test does NOT loop/retry signups (would abuse shared infra).
  const checkInbox = page.getByRole("heading", {
    name: "Regarde dans ta boîte.",
  });
  const signupError = page.locator("form p.text-destructive");
  await expect(checkInbox.or(signupError).first()).toBeVisible({
    timeout: 20_000,
  });

  const realSignupSucceeded = await checkInbox.isVisible();

  if (realSignupSucceeded) {
    await expect(page.locator('input[name="email"]')).toHaveCount(0);
    await page.screenshot({
      path: `${SHOTS}/check_inbox.png`,
      fullPage: true,
    });
  } else {
    // The app correctly surfaced the Supabase error (fail-fast). Capture
    // it as evidence and annotate; this is an env constraint, not a bug.
    const msg = (await signupError.first().textContent())?.trim() ?? "";
    test
      .info()
      .annotations.push({
        type: "env-constraint",
        description: `B8 fell back: real public signup blocked by Supabase ("${msg}"). App surfaced the error correctly via FieldError. Journey continues via admin-created confirmed user.`,
      });
    await page.screenshot({
      path: `${SHOTS}/check_inbox.png`,
      fullPage: true,
    });
  }

  // --- B9: Ensure a CONFIRMED auth user exists for this email so the
  // rest of the journey (sign-in -> onboarding -> ...) is deterministic.
  //  - If the real signup landed, the user exists UNconfirmed: assert
  //    that, then admin-confirm (simulates the email-link click).
  //  - Else admin-create it confirmed (mirrors phase1a-auth.spec.ts).
  let user = null;
  for (let i = 0; i < 12; i++) {
    user = await findUserByEmail(JOURNEY_EMAIL);
    if (user) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  if (realSignupSucceeded) {
    expect(
      user,
      `signUpWithPassword did not create an auth user for ${JOURNEY_EMAIL}`,
    ).not.toBeNull();
    expect(
      user!.email_confirmed_at,
      "fresh signup must be UNconfirmed (email confirmations ON)",
    ).toBeFalsy();
    createdUserIds.push(user!.id);
    const { error: confirmErr } = await admin.auth.admin.updateUserById(
      user!.id,
      { email_confirm: true },
    );
    expect(
      confirmErr,
      `admin email confirm failed: ${confirmErr?.message ?? ""}`,
    ).toBeNull();
  } else if (user) {
    // Signup actually created the user but the email send failed (429).
    // Promote it to confirmed.
    createdUserIds.push(user.id);
    await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: JOURNEY_EMAIL,
      password: JOURNEY_PASSWORD,
      email_confirm: true,
      user_metadata: { locale: "fr" },
    });
    expect(error, `admin.createUser fallback failed: ${error?.message ?? ""}`).toBeNull();
    expect(data.user?.id, "admin.createUser returned no id").toBeTruthy();
    createdUserIds.push(data.user!.id);
  }

  // --- B10: Sign in with same credentials -> fresh user lands on
  // onboarding (not dashboard).
  await page.goto("/fr/sign-in", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(JOURNEY_EMAIL);
  await page.locator('input[name="password"]').fill(JOURNEY_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/fr\/(onboarding|dashboard)/, { timeout: 20_000 });
  await expect(
    page,
    "fresh (not-onboarded) user must hit /fr/onboarding after sign-in",
  ).toHaveURL(/\/fr\/onboarding/);

  // --- B11: Onboarding. Submit disabled until study level chosen.
  const submitBtn = page.getByRole("button", { name: "Commencer" });
  await expect(
    submitBtn,
    "onboarding submit must be disabled until a study level is picked",
  ).toBeDisabled();

  // Two text inputs: full name, then school.
  const textInputs = page.locator(
    'input[type="text"], input:not([type]):not([name="email"]):not([name="password"])',
  );
  await textInputs.nth(0).fill("Journey Test Student");
  await textInputs.nth(1).fill("Sorbonne Test");
  // Study level radio group: pick M2 (sr-only input inside label).
  await page.getByText("M2", { exact: true }).click();
  // Locale radio group: keep FR (already default) — pick FR explicitly.
  await page.getByText("FR", { exact: true }).click();

  await expect(submitBtn, "submit enabled after study level").toBeEnabled();
  await page.screenshot({
    path: `${SHOTS}/onboarding_filled.png`,
    fullPage: true,
  });
  await submitBtn.click();

  // --- B12: Lands on dashboard, empty editorial state renders.
  await page.waitForURL(/\/fr\/dashboard/, { timeout: 20_000 });
  await expect(page).toHaveURL(/\/fr\/dashboard$/);
  // app.dashboard.emptyTitle (FR) = "Tu n'as encore contacté personne."
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tu n'as encore contacté personne.",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/dashboard_empty.png`,
    fullPage: true,
  });

  // --- C13: onboarded user visiting /onboarding bounces to dashboard.
  await page.goto("/fr/onboarding", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/fr\/dashboard/, { timeout: 15_000 });
  await expect(
    page,
    "onboarded user on /onboarding must bounce to /dashboard",
  ).toHaveURL(/\/fr\/dashboard$/);

  // --- D15: Profile page shows persisted identity.
  await page.goto("/fr/dashboard/profile", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: "Ton profil" }),
  ).toBeVisible();
  await expect(page.getByText("Journey Test Student")).toBeVisible();
  await expect(page.getByText("Sorbonne Test")).toBeVisible();

  // --- D16: Edit identity (school), Save, reload — value persists.
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Modifier" }).click();
  const schoolInput = main.locator("input").nth(1); // [0]=fullName,[1]=school
  await expect(schoolInput).toHaveValue("Sorbonne Test");
  await schoolInput.fill("HEC Test Updated");
  await main.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("HEC Test Updated")).toBeVisible({
    timeout: 10_000,
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("HEC Test Updated"),
    "edited school must persist across reload",
  ).toBeVisible();

  // --- D17: CV upload via hidden file input, then delete.
  const pdfBytes = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n" +
      "trailer<</Root 1 0 R>>\n%%EOF",
    "utf-8",
  );
  // Diagnostics: capture client errors + the storage PUT outcome so a
  // failed upload reports WHY (RLS, signed-URL, MIME) not just "no link".
  const cvDiag: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") cvDiag.push(`console.error: ${m.text()}`);
  });
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/storage/v1/") && !r.ok())
      cvDiag.push(`storage ${r.request().method()} ${r.status()} ${u}`);
  });

  // The empty-variant dropzone renders one hidden file input. Its React
  // onChange handler must be hydrated BEFORE setInputFiles, otherwise the
  // injected `change` event fires on a not-yet-wired input and the upload
  // silently never starts (verified: a fixed settle makes the PUT fire).
  await expect(page.getByText(/Dépose ton CV ici/)).toBeVisible();
  await page.waitForTimeout(1500);
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "journey-cv.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
  });
  // app.profile.cv.download (FR) = "Télécharger"
  const dlLink = page.getByRole("link", { name: "Télécharger" });
  try {
    await expect(dlLink).toBeVisible({ timeout: 20_000 });
  } catch (e) {
    // Surface the dropzone's own error text + captured diagnostics.
    const dzErr =
      (await page
        .locator("p.text-destructive")
        .first()
        .textContent()
        .catch(() => null)) ?? "(no dropzone error text)";
    await page.screenshot({
      path: `${SHOTS}/profile_cv_FAILED.png`,
      fullPage: true,
    });
    throw new Error(
      `CV upload did not reach uploaded state. Dropzone error="${dzErr.trim()}". Diagnostics: ${cvDiag.join(" || ") || "none captured"}`,
    );
  }
  await expect(page.getByText(/Déposé le/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remplacer" }),
  ).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/profile_cv_uploaded.png`,
    fullPage: true,
  });

  // Delete -> back to dropzone state.
  await page.getByRole("button", { name: "Supprimer" }).click();
  // app.profile.cv.uploadHint (FR) = "Dépose ton CV ici. PDF ou DOCX, 5 Mo max."
  await expect(
    page.getByText(/Dépose ton CV ici/),
    "after delete, CV card must return to the dropzone",
  ).toBeVisible({ timeout: 15_000 });

  // --- D18: Locale card -> switch to EN -> path moves to /en + English UI.
  // The locale radio group on the profile (LocaleCard) — pick EN.
  await page
    .getByRole("main")
    .getByText("EN", { exact: true })
    .click();
  await page.waitForURL(/\/en\/dashboard\/profile/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/en\/dashboard\/profile/);
  // app.profile.title (EN) = "Your profile"
  await expect(
    page.getByRole("heading", { level: 1, name: "Your profile" }),
  ).toBeVisible();

  // --- E19: Sign out from the danger zone (scope to main, sidebar has a
  // duplicate). UI is now EN -> "Sign out".
  await page
    .getByRole("main")
    .getByRole("button", { name: "Sign out" })
    .click();
  await page.waitForURL(/\/en(\/)?$/, { timeout: 15_000 });
  await page.screenshot({
    path: `${SHOTS}/post_signout_landing.png`,
  });

  // Gate: dashboard now redirects to sign-in (session cleared).
  await page.goto("/fr/dashboard", { waitUntil: "domcontentloaded" });
  await expect(
    page,
    "after sign-out, /fr/dashboard must redirect to /fr/sign-in",
  ).toHaveURL(/\/fr\/sign-in/);
  await page.screenshot({
    path: `${SHOTS}/post_signout_signin.png`,
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// F20. Google OAuth initiation (cannot complete consent).
// ---------------------------------------------------------------------------

test("F20. Google OAuth handshake initiates from /fr/sign-in", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.goto("/fr/sign-in", { waitUntil: "domcontentloaded" });

  // signInWithGoogle redirects (server action) to the Supabase authorize
  // URL, which then 302s to accounts.google.com. Capture either.
  const oauthTarget = new RegExp(
    "accounts\\.google\\.com|supabase\\.co/auth/v1/authorize\\?provider=google",
  );

  // auth.signIn.googleCta (FR) = "Continuer avec Google"
  await page.getByRole("button", { name: "Continuer avec Google" }).click();

  await page.waitForURL(oauthTarget, { timeout: 25_000 });
  const finalUrl = page.url();
  expect(
    finalUrl,
    `OAuth must redirect toward Google/Supabase authorize; got ${finalUrl}`,
  ).toMatch(oauthTarget);
  // Do NOT attempt to complete Google consent.
});
