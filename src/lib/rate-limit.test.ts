import { beforeEach, describe, expect, it } from "vitest";
import { consumeRateLimit, MAX_REQUESTS_PER_WINDOW, resetRateLimitForTests, WINDOW_MS } from "./rate-limit";

const START = 1_000;

function fillWindow(clientKey: string, at: number): void {
  for (let request = 0; request < MAX_REQUESTS_PER_WINDOW; request += 1) consumeRateLimit(clientKey, at);
}

describe("lead rate limiter (SPEC §10)", () => {
  beforeEach(() => resetRateLimitForTests());

  it("allows five requests per minute and refuses the sixth", () => {
    const results = Array.from({ length: MAX_REQUESTS_PER_WINDOW + 1 }, (_, index) => consumeRateLimit("203.0.113.7", START + index));
    expect(results).toEqual([true, true, true, true, true, false]);
  });

  it("keeps a separate window per client", () => {
    fillWindow("client-a", START);
    expect(consumeRateLimit("client-a", START)).toBe(false);
    expect(consumeRateLimit("client-b", START)).toBe(true);
  });

  it("lets a client back in once the window has passed", () => {
    fillWindow("client-a", START);
    expect(consumeRateLimit("client-a", START + WINDOW_MS - 1)).toBe(false);
    expect(consumeRateLimit("client-a", START + WINDOW_MS)).toBe(true);
  });
});
