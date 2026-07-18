import { chat_sessions } from "../../db/schema/chat-session.ts";
import { db } from "../../db/client.ts";

export const createChatSession = async () => {
  const [chatSession] = await db.insert(chat_sessions).values({}).returning();

  return chatSession;
};
