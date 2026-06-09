import { test, expect } from "@playwright/test";

test.describe("shelf tools", () => {
  test("hub lists five tools", async ({ page }) => {
    await page.goto("/fr/outils");
    await expect(page.getByRole("link", { name: /lettre de motivation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Optimise ton CV/i })).toBeVisible();
  });

  test("lettre public page renders the generator", async ({ page }) => {
    await page.goto("/fr/outils/lettre-de-motivation");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("lettre de motivation", {
      ignoreCase: true,
    });
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("public CV analyzer returns an analysis under E2E mock", async ({ page }) => {
    await page.goto("/fr/outils/optimiser-son-cv");
    await page.locator("#cv-text").fill("x".repeat(300));
    await page.locator("#offer-text").fill("Offre CDI chef de projet ".repeat(5));
    await page.getByRole("button", { name: /Analyser mon CV/i }).click();
    await expect(page.getByText("/100")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Ce qui manque", { exact: true })).toBeVisible();
  });

  test("non-FR locales are noindexed", async ({ page }) => {
    await page.goto("/en/outils/optimiser-son-cv");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });
});
