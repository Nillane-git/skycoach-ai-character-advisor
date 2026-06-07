interface WindowState {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets. 0 when allowed. */
  retryAfter: number;
}

const buckets = new Map<string, WindowState>();

const DEFAULT_OPTS: RateLimitOptions = { windowMs: 60_000, max: 20 };

export function rateLimit(ip: string, opts: RateLimitOptions = DEFAULT_OPTS): RateLimitResult {
  const { windowMs, max } = opts;
  const now = Date.now();

  let state = buckets.get(ip);
  if (!state || now >= state.resetAt) {
    state = { count: 0, resetAt: now + windowMs };
    buckets.set(ip, state);
  }

  if (state.count >= max) {
    return { ok: false, retryAfter: Math.max(0, Math.ceil((state.resetAt - now) / 1000)) };
  }

  state.count += 1;
  return { ok: true, retryAfter: 0 };
}
