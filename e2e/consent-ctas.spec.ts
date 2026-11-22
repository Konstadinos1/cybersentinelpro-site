import { expect, test } from "@playwright/test";
import { E2E_ANSWERS } from "../src/lib/test-fixtures";
import { PRESET_IDS } from "../src/components/sections/Sandbox/presets";
import { DICTS, dismissConsent, note, shotPath } from "./helpers";

const ANALYTICS_HOSTS = ["plausible.io", "/_vercel/insights"];
const isAnalytics = (url: string) => ANALYTICS_HOSTS.some((host) => url.includes(host));

test.describe("desktop-only checks", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "same DOM on mobile"));

  test("E6 no analytics before opt-in, none after refusal, loads after accept", async ({ browser }, info) => {
    for (const choice of ["refuse", "accept"] as const) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const hits: string[] = [];
      page.on("request", (request) => isAnalytics(request.url()) && hits.push(request.url()));
      await page.goto("/fr", { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      const before = { requests: hits.length, plausibleDefined: await page.evaluate(() => typeof window.plausible) };
      expect(before.requests).toBe(0);
      await page.locator(`[data-consent="${choice}"]`).click();
      await page.waitForTimeout(2000);
      const after = { requests: [...hits], scriptTag: await page.locator("#csp-analytics").count() };
      note(info, { choice, before, after });
      if (choice === "refuse") expect(after.requests).toEqual([]);
      else expect(after.scriptTag + after.requests.length).toBeGreaterThan(0);
      await context.close();
    }
  });

  test("E6 consent settings panel offers the same choice", async ({ page }, info) => {
    await page.goto("/fr");
    await page.getByRole("button", { name: DICTS.fr.consent.settings, exact: true }).click();
    await expect(page.locator("[data-consent-banner] input[type=checkbox]")).not.toBeChecked();
    await page.screenshot({ path: shotPath(info, "fr", "edge-consent-settings") });
  });

  test("E7 every link and button on the home page resolves", async ({ page, request }, info) => {
    for (const locale of ["fr", "en"] as const) {
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      const anchors = await page.$$eval("a[href]", (links) => links.map((link) => link.getAttribute("href") ?? ""));
      const problems: string[] = [];
      for (const href of anchors) {
        if (href === "#" || href === "") problems.push(`empty href "${href}"`);
        else if (href.startsWith("mailto:")) continue;
        else if (href.includes("#")) {
          const id = href.split("#")[1] ?? "";
          if ((await page.locator(`[id="${id}"]`).count()) === 0) problems.push(`missing anchor ${href}`);
        } else if ((await request.get(href)).status() >= 400) problems.push(`broken link ${href}`);
      }
      const unnamed = await page.$$eval("button", (buttons) => buttons.filter((b) => !(b.textContent?.trim() || b.getAttribute("aria-label"))).length);
      note(info, { locale, anchors: anchors.length, unnamedButtons: unnamed, problems });
      expect(problems).toEqual([]);
      expect(unnamed).toBe(0);
    }
  });

  test("E7 every button does something visible", async ({ page }) => {
    await page.goto("/en");
    await dismissConsent(page, "en");
    await page.locator("[data-partner-open]").click();
    await expect(page.locator("[data-partner-drawer]")).toBeVisible();
    await page.keyboard.press("Escape");
    for (const preset of PRESET_IDS) {
      await page.locator(`[data-preset="${preset}"]`).click();
      await expect(page.locator(`[data-preset="${preset}"]`)).toHaveAttribute("aria-pressed", "true");
    }
    await page.locator(`[data-choice="${E2E_ANSWERS.headcount_band}"]`).click();
    await page.locator("[data-calculator-next]").click();
    await expect(page.locator("[data-step-title]")).toHaveText(DICTS.en.calculator.vertical.title);
  });
});
