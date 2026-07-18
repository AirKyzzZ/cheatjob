import { defineConfig, devices } from "@playwright/test";

// PORT lets the e2e dev server coexist with another local app on 3000.
const PORT = process.env.PORT ?? "3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    screenshot: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { ...process.env, E2E_MOCK: "1", PORT },
  },
});
