import { pgEnum } from "drizzle-orm/pg-core";

export const chatMessageRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const chatStatusEnum = pgEnum("chat_satus", ["active", "inactive"]);
