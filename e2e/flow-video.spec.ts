import { copyFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { E2E_ANSWERS, E2E_EXPECTED_SCORE } from "../src/lib/test-fixtures";
import { PRESET_IDS } from "../src/components/sections/Sandbox/presets";
import { DICTS, SHOTS_DIR } from "./helpers";

const PAUSE = 900;

async function slowScrollTo(page: Page, selector: string) {
  await page.evaluate(async (target) => {
    const element = document.querySelector(target);
    if (!element) return;
    const goal = element.getBoundingClientRect().top + window.scrollY - 88;
    const start = window.scrollY;
    const steps = 40;
    for (let index = 1; index <= steps; index += 1) {
      window.scrollTo({ top: start + ((goal - start) * index) / steps, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }, selector);
  await page.waitForTimeout(PAUSE);
}

/** Main flow on video: land -> diagnostic -> score -> sandbox -> offers -> book. */
test("main flow video (desktop, FR)", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop", "one video is enough");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: "test-results/video", size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  const copy = DICTS.fr;
  await page.goto("/fr", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.locator('[data-consent="refuse"]').click();
  await page.waitForTimeout(PAUSE);
  await page.getByRole("link", { name: copy.hero.primaryCta }).click();
  await page.waitForTimeout(1800);
  const next = page.locator("[data-calculator-next]");
  for (const choice of [E2E_ANSWERS.headcount_band, E2E_ANSWERS.vertical]) {
    await page.locator(`[data-choice="${choice}"]`).click();
    await page.waitForTimeout(500);
    await next.click();
  }
  for (const item of E2E_ANSWERS.ai_stack) await page.locator(`[data-choice="${item}"]`).click();
  await next.click();
  for (const [key, value] of Object.entries(E2E_ANSWERS.controls)) {
    await page.locator(`[data-control="${key}"][data-answer="${value ? "yes" : "no"}"]`).locator("..").click();
    await page.waitForTimeout(250);
  }
  await next.click();
  await page.locator('input[name="full_name"]').first().pressSequentially("Marie Tremblay", { delay: 30 });
  await page.locator('input[name="company"]').first().pressSequentially("Groupe Exemple inc.", { delay: 30 });
  await page.locator('input[name="work_email"]').first().pressSequentially("marie@groupe-exemple.ca", { delay: 30 });
  await page.locator('input[name="consent_contact"]').first().check();
  await next.click();
  await expect(page.locator("[data-score-value]")).toHaveText(String(E2E_EXPECTED_SCORE), { timeout: 5000 });
  await page.waitForTimeout(2500);
  await slowScrollTo(page, "#sandbox");
  for (const preset of PRESET_IDS) {
    await page.locator(`[data-preset="${preset}"]`).click();
    await page.waitForTimeout(2400);
  }
  for (const panel of ["0", "1", "2"]) await slowScrollTo(page, `[data-tier-panel="${panel}"]`);
  await slowScrollTo(page, "#diagnostic");
  const book = page.locator("[data-book]");
  if (await book.count()) {
    await book.click();
    await page.waitForTimeout(2500);
  }
  const video = page.video();
  await context.close();
  if (video) copyFileSync(await video.path(), `${SHOTS_DIR}/main-flow.webm`);
});
