import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: "http://localhost:5173", trace: "on-first-retry" },
  webServer: [
    {
      command: "npm run build && npm run start:prod",
      cwd: "../backend",
      url: "http://localhost:3000/api/v1/auth/csrf-token",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run build && npm run start",
      cwd: ".",
      url: "http://localhost:5173/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
