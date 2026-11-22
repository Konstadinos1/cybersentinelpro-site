import { expect, test, type Page } from "@playwright/test";
import { PRIVACY_PATHS } from "../src/i18n/config";
import { E2E_ANSWERS, E2E_EXPECTED_SCORE } from "../src/lib/test-fixtures";
import { PRESET_IDS } from "../src/components/sections/Sandbox/presets";
import { DICTS, dismissConsent, note, readSceneState, scrollToSection, shotPath, watchErrors, type TestLocale } from "./helpers";

const LOCALES: TestLocale[] = ["fr", "en"];
const SECTIONS = [
  ["hero", "#top"],
  ["diagnostic", "#diagnostic"],
  ["sandbox", "#sandbox"],
  ["solutions", "#solutions"],
  ["solutions-t3", '[data-tier-panel="2"]'],
  ["moat", "#moat"],
  ["partners", "#partners"],
  ["footer", "footer"],
] as const;

async function answerCalculator(page: Page, locale: TestLocale) {
  const copy = DICTS[locale].calculator;
  const next = page.locator("[data-calculator-next]");
  await page.locator(`[data-choice="${E2E_ANSWERS.headcount_band}"]`).click();
  await next.click();
  await page.locator(`[data-choice="${E2E_ANSWERS.vertical}"]`).click();
  await next.click();
  for (const item of E2E_ANSWERS.ai_stack) await page.locator(`[data-choice="${item}"]`).click();
  await next.click();
  for (const [key, value] of Object.entries(E2E_ANSWERS.controls)) {
    await page.locator(`[data-control="${key}"][data-answer="${value ? "yes" : "no"}"]`).locator("..").click();
  }
  await next.click();
  await expect(page.locator("[data-step-title]")).toHaveText(copy.contact.title);
}

async function fillContact(page: Page, email: string) {
  await page.locator('input[name="full_name"]').first().fill("Marie Tremblay");
  await page.locator('input[name="company"]').first().fill("Groupe Exemple inc.");
  await page.locator('input[name="work_email"]').first().fill(email);
  await page.locator('input[name="consent_contact"]').first().check();
}

for (const locale of LOCALES) {
  test.describe(`${locale.toUpperCase()}`, () => {
    test(`E1 no console errors and no horizontal overflow (${locale})`, async ({ page }, info) => {
      const routes = [`/${locale}`, PRIVACY_PATHS[locale]];
      for (const route of routes) {
        const errors = watchErrors(page);
        await page.goto(route, { waitUntil: "networkidle" });
        await page.waitForTimeout(2500);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        note(info, { route, errors, overflow });
        expect(errors, `errors on ${route}`).toEqual([]);
        expect(overflow, `overflow on ${route}`).toBeLessThanOrEqual(0);
      }
    });

    test(`E2 WebGL scene mounts (${locale})`, async ({ page }, info) => {
      await page.goto(`/${locale}`);
      const canvas = page.locator('canvas[data-scene="sentinel"]');
      await expect(canvas).toBeAttached({ timeout: 15_000 });
      const hasContext = await canvas.evaluate((node: HTMLCanvasElement) => node.getContext("webgl2") !== null);
      expect(hasContext).toBe(true);
      await page.waitForTimeout(4000);
      note(info, { afterFourSeconds: await readSceneState(page) });
    });

    test(`E2 reduced motion renders the static hero (${locale})`, async ({ browser }, info) => {
      const context = await browser.newContext({ reducedMotion: "reduce", viewport: info.project.use.viewport ?? undefined });
      const page = await context.newPage();
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500);
      await expect(page.locator("canvas")).toHaveCount(0);
      await expect(page.locator("[data-hero-static]")).toBeAttached();
      await expect(page.locator("[data-hero-facets]")).toBeVisible();
      await page.screenshot({ path: shotPath(info, locale, "edge-reduced-motion") });
      await context.close();
    });

    test(`E3 locale switch round trip (${locale})`, async ({ page }) => {
      const other: TestLocale = locale === "fr" ? "en" : "fr";
      await page.goto(`/${locale}`);
      await dismissConsent(page, locale);
      for (const target of [other, locale]) {
        await page.locator(`[data-locale-switch="${target}"]`).click();
        await expect(page).toHaveURL(new RegExp(`/${target}$`));
        const dict = DICTS[target];
        await expect(page.locator("h1")).toHaveText(dict.hero.title);
        await expect(page.locator("header nav").first().locator("a").first()).toHaveText(dict.hud.nav.solutions);
        await expect(page.locator("header nav").first().locator("a").nth(2)).toHaveText(dict.hud.nav.diagnostic);
        await expect(page.locator("[data-step-title]")).toHaveText(dict.calculator.headcount.title);
      }
      await page.goto(PRIVACY_PATHS[locale]);
      await page.locator(`[data-locale-switch="${other}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${PRIVACY_PATHS[other]}$`));
      await expect(page.locator("h1")).toHaveText(DICTS[other].privacy.title);
      await page.locator(`[data-locale-switch="${locale}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${PRIVACY_PATHS[locale]}$`));
    });

    test(`E4 calculator score, invalid email and API failure (${locale})`, async ({ page, request }, info) => {
      await page.goto(`/${locale}#diagnostic`);
      await dismissConsent(page, locale);
      await answerCalculator(page, locale);
      await fillContact(page, "pas-un-courriel");
      const invalid = page.waitForResponse((r) => r.url().endsWith("/api/leads"));
      await page.locator("[data-calculator-next]").click();
      expect((await invalid).status()).toBe(400);
      await expect(page.locator('[data-field-error="work_email"]')).toHaveText(DICTS[locale].forms.errors.work_email);
      await page.locator("#diagnostic").screenshot({ path: shotPath(info, locale, "edge-invalid-email") });

      await page.route("**/api/leads", (route) => route.fulfill({ status: 500, contentType: "application/json", body: '{"ok":false,"error":"storage"}' }));
      await page.locator('input[name="work_email"]').first().fill("marie@groupe-exemple.ca");
      await page.locator("[data-calculator-next]").click();
      await expect(page.locator("[data-save-error]")).toBeVisible();
      await expect(page.locator("[data-calculator-result]")).toHaveAttribute("data-score", String(E2E_EXPECTED_SCORE));
      await page.waitForTimeout(1300);
      await page.locator("#diagnostic").screenshot({ path: shotPath(info, locale, "edge-api-500") });

      await page.unroute("**/api/leads");
      const saved = page.waitForResponse((r) => r.url().endsWith("/api/leads"));
      await page.locator("[data-save-error] button").click();
      const response = await saved;
      expect(response.status()).toBe(201);
      expect((await response.json()).score).toBe(E2E_EXPECTED_SCORE);
      await expect(page.locator("[data-save-error]")).toHaveCount(0);
      await expect(page.locator("[data-score-value]")).toHaveText(String(E2E_EXPECTED_SCORE), { timeout: 5000 });
      await page.locator("#diagnostic").screenshot({ path: shotPath(info, locale, "result") });

      const direct = await request.post("/api/leads", { data: { source: "calculator", locale, full_name: "A B", work_email: "nope", company: "Co", consent_contact: true, ...E2E_ANSWERS } });
      expect(direct.status()).toBe(400);
    });

    test(`E5 sandbox presets (${locale})`, async ({ page }, info) => {
      const copy = DICTS[locale].sandbox;
      await page.goto(`/${locale}#sandbox`);
      await dismissConsent(page, locale);
      for (const preset of PRESET_IDS) {
        await page.locator(`[data-preset="${preset}"]`).click();
        await expect(page.locator('[data-pane="unprotected"] [data-verdict="breach"]')).toHaveText(copy.breach);
        await expect(page.locator('[data-pane="guarded"] [data-verdict="blocked"]')).toHaveText(copy.blocked);
        await page.locator('[data-pane="guarded"] summary').click();
        const log = JSON.parse((await page.locator("[data-audit-json]").textContent()) ?? "{}");
        expect(log).toMatchObject({ preset, verdict: "BLOCKED", logged: true });
        note(info, { preset, rule: log.rule_id, owasp: log.owasp_ref, latency_ms: log.latency_ms });
        await page.locator('[data-pane="guarded"] summary').click();
      }
      await page.locator("#sandbox").screenshot({ path: shotPath(info, locale, "sandbox-tool-hijack") });
    });

    test(`screenshots of every section (${locale})`, async ({ page }, info) => {
      // Software WebGL drops to the static tier within seconds; pin it so the scenes are captured.
      const pin = info.project.name === "desktop" ? "high" : "mid";
      await page.goto(`/${locale}?quality=${pin}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: shotPath(info, locale, "edge-consent-banner") });
      await dismissConsent(page, locale);
      for (const [name, selector] of SECTIONS) {
        await scrollToSection(page, selector);
        await page.screenshot({ path: shotPath(info, locale, name) });
      }
      note(info, { locale, sceneAfterTour: await readSceneState(page) });
    });

    test(`partner drawer validation and success (${locale})`, async ({ page }, info) => {
      const copy = DICTS[locale];
      await page.goto(`/${locale}#partners`);
      await dismissConsent(page, locale);
      await page.locator("[data-partner-open]").click();
      const drawer = page.locator("[data-partner-drawer]");
      await expect(drawer).toBeVisible();
      await drawer.getByRole("button", { name: copy.partners.submit }).click();
      await expect(drawer.locator('[data-field-error="partner_type"]')).toHaveText(copy.forms.errors.partner_type);
      await expect(drawer.locator('[data-field-error="consent_contact"]')).toBeVisible();
      await page.waitForTimeout(400);
      await page.screenshot({ path: shotPath(info, locale, "edge-partner-errors") });
      await fillContact(page, "luc@cabinet-exemple.ca");
      await drawer.locator('select[name="partner_type"]').selectOption("accounting_firm");
      await drawer.getByRole("button", { name: copy.partners.submit }).click();
      await expect(drawer.locator("[data-partner-success]")).toHaveText(copy.partners.success);
      await page.screenshot({ path: shotPath(info, locale, "partner-success") });
      await page.keyboard.press("Escape");
      await expect(drawer).toHaveCount(0);
    });
  });
}

test("mobile menu opens and closes", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "mobile only");
  await page.goto("/fr");
  await dismissConsent(page, "fr");
  await page.getByRole("button", { name: DICTS.fr.hud.menu }).click();
  await expect(page.locator("header nav").last()).toBeVisible();
  await page.screenshot({ path: shotPath(info, "fr", "edge-menu-open") });
  await page.getByRole("button", { name: DICTS.fr.hud.closeMenu }).click();
});
