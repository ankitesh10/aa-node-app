import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { nanoid } from "../../lib/util.ts";
import { sql } from "drizzle-orm";
import { chat_sessions } from "./chat-session.ts";
import { chatMessageRoleEnum } from "../enums/chat.enum.js";

export const chat_messages = pgTable("chat_messages", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  sessionId: varchar("session_id", { length: 191 })
    .references(() => chat_sessions.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => sql`now()`),
  parts: jsonb("parts"),
  role: chatMessageRoleEnum("role").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
});
