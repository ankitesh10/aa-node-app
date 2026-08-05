import { sql } from "drizzle-orm";
import { db } from "../db/client.ts";
import { rate_limit_windows } from "../db/schema/rate-limit-windows.ts";
import { hashIdentity } from "../lib/util.ts";

const SESSION_RATE_LIMIT = [
  { scope: "session-hour", durationMs: 60 * 60_000, maxHits: 20 },
] as const;

export async function sessionAbuseGateSync(req, res, next) {
  const hashedIP = hashIdentity("ip", req.ip);
  const now = Date.now();

  const windows = SESSION_RATE_LIMIT.map((limit) => ({
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

  console.log("counters", counters);

  const exceededLimit = SESSION_RATE_LIMIT.filter((session) => {
    const counter = counters.find((counter) => counter.scope === session.scope);

    return (counter.hits ?? 0) > session.maxHits;
  });

  if (exceededLimit.length > 0) {
    return res.status(429).json({
      message: `Too many requests, limit is ${exceededLimit[0].maxHits} in ${exceededLimit[0].scope}`,
      limit: exceededLimit[0].maxHits,
      window: exceededLimit[0].scope,
    });
  }

  next();
}
