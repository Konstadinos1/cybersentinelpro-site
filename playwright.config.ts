import { defineConfig } from "@playwright/test";

/**
 * SPEC §15 browser verification. Set E2E_BASE_URL to test a deployed preview; otherwise the
 * production build is started locally. CHROME_PATH points at a system Chrome when the
 * Playwright-managed browser is not installed.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const chromeArgs = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  workers: 1,
  outputDir: "test-results",
  reporter: [["list"], ["json", { outputFile: "qa-screenshots/results.json" }]],
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.CHROME_PATH || undefined, args: chromeArgs },
    extraHTTPHeaders: process.env.E2E_BYPASS ? { "x-vercel-protection-bypass": process.env.E2E_BYPASS } : {},
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npx next start -p 3100", url: `${baseURL}/fr`, reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
