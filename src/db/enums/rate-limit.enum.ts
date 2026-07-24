import { pgEnum } from "drizzle-orm/pg-core";

export const rateLimitEnum = pgEnum("rate_limit_enum", [
  "bot-minute",
  "bot-hour",
  "bot-day",
  "session-hour",
]);
