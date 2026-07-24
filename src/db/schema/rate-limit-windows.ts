import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { rateLimitEnum } from "../enums/rate-limit.enum.ts";

export const rate_limit_windows = pgTable(
  "rate_limit_windows",
  {
    identityHash: varchar("identity_hash", { length: 64 }).notNull(),
    scope: rateLimitEnum("scope").notNull(),
    windowStart: varchar("window_start", { length: 10 }).notNull(),
    hits: integer("hits").default(1),
  },
  (table) => [
    primaryKey({
      columns: [table.identityHash, table.scope, table.windowStart],
    }),
  ],
);
