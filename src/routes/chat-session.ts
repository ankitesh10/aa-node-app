import { Router } from "express";
import { createChatSession } from "../lib/api/chat.ts";

const chatSessionRouter = Router();

chatSessionRouter.get("/create_chat_session", async (req, res) => {
  try {
    const resource = await createChatSession();

    res.status(200).json({
      resource,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default chatSessionRouter;
