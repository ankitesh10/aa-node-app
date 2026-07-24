import { sql } from "drizzle-orm";
import { db } from "../db/client.ts";
import { rate_limit_windows } from "../db/schema/rate-limit-windows.ts";
import { hashIdentity } from "../lib/util.ts";

const BOT_RATE_LIMITS = [
  { scope: "bot-minute", durationMs: 60_000, maxHits: 10 },
  { scope: "bot-hour", durationMs: 60 * 60_000, maxHits: 100 },
  { scope: "bot-day", durationMs: 24 * 60 * 60_000, maxHits: 500 },
] as const;

export async function botAbuseGate(req, res, next) {
  const hashedIP = hashIdentity("ip", req.ip);
  const now = Date.now();

  const windows = BOT_RATE_LIMITS.map((limit) => ({
    identityHash: hashedIP,
    scope: limit.scope,
    windowStart: Math.floor(now / limit.durationMs).toString(),
  }));

  const counters = await db
    .insert(rate_limit_windows)
    .values(windows)
    .onConflictDoUpdate({
      target: [
        rate_limit_windows.identityHash,
        rate_limit_windows.scope,
        rate_limit_windows.windowStart,
      ],
      set: {
        hits: sql`${rate_limit_windows.hits} + 1`,
      },
    })
    .returning({
      scope: rate_limit_windows.scope,
      hits: rate_limit_windows.hits,
    });

  const exceededLimit = BOT_RATE_LIMITS.filter((limit) => {
    const counter = counters.find((item) => item.scope === limit.scope);

    return (counter.hits ?? 0) > limit.maxHits;
  });

  if (exceededLimit.length > 0) {
    return res.status(429).json({
      error: "Too many requests",
      limit: exceededLimit[0].maxHits,
      window: exceededLimit[0].scope,
    });
  }

  next();
}
