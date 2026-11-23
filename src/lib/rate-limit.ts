/**
 * Best-effort in-memory limiter (SPEC §10). Each serverless instance keeps its own window,
 * so this slows down scripted abuse but is not a hard global limit.
 */
export const WINDOW_MS = 60_000;
export const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_CLIENTS = 5_000;

const requestLog = new Map<string, number[]>();

function pruneOldestClients(): void {
  const excess = requestLog.size - MAX_TRACKED_CLIENTS;
  if (excess <= 0) return;
  const keys = requestLog.keys();
  for (let index = 0; index < excess; index += 1) {
    const key = keys.next().value;
    if (key !== undefined) requestLog.delete(key);
  }
}

/** Returns true when the client may proceed. The key is never persisted. */
export function consumeRateLimit(clientKey: string, now: number = Date.now()): boolean {
  const recent = (requestLog.get(clientKey) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientKey, recent);
    return false;
  }
  recent.push(now);
  requestLog.delete(clientKey);
  requestLog.set(clientKey, recent);
  pruneOldestClients();
  return true;
}

export function resetRateLimitForTests(): void {
  requestLog.clear();
}
