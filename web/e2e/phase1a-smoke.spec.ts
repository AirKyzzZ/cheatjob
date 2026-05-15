import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";

const SHOTS = "e2e/screenshots";

/**
 * Benign console noise we deliberately ignore. Auth + DB are not configured
 * yet (Supabase Auth provider + migrations pending), so the unauthenticated
 * surfaces will emit predictable network failures that are NOT app bugs.
 */
function isBenign(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("favicon") ||
    t.includes("posthog") ||
    t.includes("/i.posthog.com") ||
    t.includes("us.i.posthog.com") ||
    t.includes("supabase.co") ||
    t.includes("/auth/v1/") ||
    t.includes("401") ||
    t.includes("403") ||
    t.includes("net::err_") ||
    t.includes("failed to load resource") ||
    // next-intl dev warning noise, not a runtime error
    t.includes("missing message")
  );
}

type Collected = { errors: string[]; pageErrors: string[] };

function attachConsole(page: Page): Collected {
  const collected: Collected = { errors: [], pageErrors: [] };
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!isBenign(text)) collected.errors.push(text);
    }
  });
  page.on("pageerror", (err: Error) => {
    const text = err.message;
    if (!isBenign(text)) collected.pageErrors.push(text);
  });
  return collected;
}

function assertClean(c: Collected, route: string) {
  expect(
    c.pageErrors,
    `pageerror (runtime/hydration) on ${route}: ${c.pageErrors.join(" | ")}`,
  ).toEqual([]);
  expect(
    c.errors,
    `console.error on ${route}: ${c.errors.join(" | ")}`,
  ).toEqual([]);
}

// ---------------------------------------------------------------------------
// A. Page render + console-error checks (EN + FR)
// ---------------------------------------------------------------------------

const renderCases: { route: string; heading: RegExp }[] = [
  { route: "/en/sign-in", heading: /^Sign in$/ },
  { route: "/fr/sign-in", heading: /^Connexion$/ },
  { route: "/en/sign-up", heading: /^Create your account$/ },
  { route: "/fr/sign-up", heading: /^Crée ton compte$/ },
  { route: "/en/reset", heading: /^Reset your password$/ },
  { route: "/fr/reset", heading: /^Réinitialiser ton mot de passe$/ },
  { route: "/en/reset/confirm", heading: /^Set a new password$/ },
];

for (const { route, heading } of renderCases) {
  test(`render: ${route}`, async ({ page }) => {
    const c = attachConsole(page);
    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(resp?.status(), `HTTP status for ${route}`).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
    // give client components a beat to hydrate / throw
    await page.waitForTimeout(800);
    assertClean(c, route);
  });
}

// ---------------------------------------------------------------------------
// B. Gate / redirect checks (unauthenticated)
// ---------------------------------------------------------------------------

// Note: /en/dashboard/profile is wrapped by the dashboard layout, whose
// unauth redirect hardcodes next=/en/dashboard (layout-level gate fires
// before the sub-route). That is correct app behavior, hence expectNext.
const gateCases = [
  { from: "/en/dashboard", expectNext: "/en/dashboard" },
  { from: "/en/dashboard/profile", expectNext: "/en/dashboard" },
  { from: "/en/onboarding", expectNext: "/en/onboarding" },
];

for (const { from, expectNext } of gateCases) {
  test(`gate: ${from} -> sign-in (unauth)`, async ({ page }) => {
    await page.goto(from, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/sign-in/);
    const url = new URL(page.url());
    expect(
      url.searchParams.get("next"),
      `?next= param after redirect from ${from}`,
    ).toBe(expectNext);
  });
}

// ---------------------------------------------------------------------------
// C. Form validation (client-side)
// ---------------------------------------------------------------------------

test("validation: sign-up short password shows localized error", async ({
  page,
}) => {
  await page.goto("/en/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox").first().fill("test@example.com");

  const pwd = page.locator('input[name="password"]');
  await pwd.fill("short");
  // The password input carries minLength=8, which would block native submit
  // before the form's JS handler runs. Strip it so we exercise the JS
  // length guard that renders the localized auth.errors.passwordTooShort.
  await pwd.evaluate((el) => el.removeAttribute("minlength"));

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(
    page.getByText("Password must be at least 8 characters."),
  ).toBeVisible();
});

test("validation: sign-in empty form blocked by HTML5 required", async ({
  page,
}) => {
  await page.goto("/en/sign-in", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign in" }).click();

  const emailValid = await page
    .locator('input[name="email"]')
    .evaluate((el: HTMLInputElement) => el.validity.valid);
  expect(emailValid, "empty required email should be invalid").toBe(false);

  // Still on sign-in (native validation blocked the submit / no nav).
  await expect(page).toHaveURL(/\/en\/sign-in/);
});

// ---------------------------------------------------------------------------
// D. Responsive + visual snapshots
// ---------------------------------------------------------------------------

test("visual: desktop 1280x900 snapshots", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const route of [
    "/en/sign-in",
    "/en/sign-up",
    "/en/onboarding",
    "/en/dashboard",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    const slug = route.replace(/\//g, "_").replace(/^_/, "");
    await page.screenshot({
      path: `${SHOTS}/desktop_${slug}.png`,
      fullPage: true,
    });
  }
});

test("visual: mobile 390x844 snapshots + no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/en/sign-in", "/en/sign-up"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    const slug = route.replace(/\//g, "_").replace(/^_/, "");
    await page.screenshot({
      path: `${SHOTS}/mobile_${slug}.png`,
      fullPage: true,
    });
    const noOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    expect(noOverflow, `horizontal overflow at 390px on ${route}`).toBe(true);
  }
});
