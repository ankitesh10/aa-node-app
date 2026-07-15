import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "../../lib/util.ts";
import { sql } from "drizzle-orm";
import { chatStatusEnum } from "../enums/chat.enum.ts";

export const chat_sessions = pgTable("chat_sessions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar("title", { length: 50 }),
  status: chatStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => sql`now()`),
  metadata: jsonb("metadata"),
});
