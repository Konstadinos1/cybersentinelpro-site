import { mkdirSync, writeFileSync } from "node:fs";
import type { Page, TestInfo } from "@playwright/test";
import { en } from "../src/i18n/dictionaries/en";
import { fr } from "../src/i18n/dictionaries/fr";

export const SHOTS_DIR = "qa-screenshots";
export const DICTS = { fr, en } as const;
export type TestLocale = keyof typeof DICTS;
export const SCENE_SETTLE_MS = 1400;

mkdirSync(SHOTS_DIR, { recursive: true });

export function shotPath(info: TestInfo, locale: TestLocale, name: string): string {
  return `${SHOTS_DIR}/${info.project.name}-${locale}-${name}.png`;
}

/** Records console errors and uncaught exceptions for E1. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

/** Accepting nothing: dismisses the banner with "Refuse" so it does not cover section shots. */
export async function dismissConsent(page: Page, locale: TestLocale): Promise<void> {
  const refuse = page.getByRole("button", { name: DICTS[locale].consent.refuse, exact: true });
  if (await refuse.isVisible().catch(() => false)) await refuse.click();
}

export async function scrollToSection(page: Page, selector: string): Promise<void> {
  await page.evaluate((target) => {
    const element = document.querySelector(target);
    if (!element) throw new Error(`missing section ${target}`);
    const top = element.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "instant" });
  }, selector);
  await page.waitForTimeout(SCENE_SETTLE_MS);
}

export async function readSceneState(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-scene="sentinel"]');
    return {
      canvas: canvas !== null,
      tier: canvas?.dataset.tier ?? null,
      quality: document.documentElement.dataset.quality ?? null,
      sceneReady: document.documentElement.dataset.sceneReady ?? null,
    };
  });
}

/** Appends one line per observation so the report can quote exact values. */
export function note(info: TestInfo, entry: Record<string, unknown>): void {
  const line = JSON.stringify({ project: info.project.name, test: info.title, ...entry });
  writeFileSync(`${SHOTS_DIR}/observations.jsonl`, `${line}\n`, { flag: "a" });
}
