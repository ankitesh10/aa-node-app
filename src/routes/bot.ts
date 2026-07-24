import { Router } from "express";
import { pipeUIMessageStreamToResponse, safeValidateUIMessages } from "ai";
import { botRequestSchema } from "../lib/api/bot-schema.ts";
import { createBotStream } from "../services/bot.ts";
import { botAbuseGate } from "../middleware/bot-rate-limit.ts";

const botRouter = Router();

botRouter.post("/bot", botAbuseGate, async (req, res) => {
  const request = botRequestSchema.safeParse(req.body);

  if (!request.success) {
    return res.status(400).json({
      error: "Invalid request",
      issues: request.error.issues.map(({ path, message }) => ({
        path: path.join("."),
        message,
      })),
    });
  }

  const validatedMessages = await safeValidateUIMessages({
    messages: request.data.messages,
  });

  if (!validatedMessages.success) {
    return res.status(400).json({
      error: "Invalid request",
      issues: [
        {
          path: "messages",
          message: "Messages contain invalid parts",
        },
      ],
    });
  }

  const { sessionId } = request.data;
  const messages = validatedMessages.data;
  const latestMessage = messages[messages.length - 1];
  const userMessage = latestMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();

  if (latestMessage.role !== "user" || userMessage.length === 0) {
    return res.status(400).json({
      error: "Invalid request",
      issues: [
        {
          path: `messages.${messages.length - 1}`,
          message: "The latest message must be a non-empty user text message",
        },
      ],
    });
  }

  try {
    const stream = await createBotStream({
      sessionId,
      messages,
      userMessage,
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default botRouter;
