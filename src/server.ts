import express from "express";
import cors from "cors";
import morgan from "morgan";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import z from "zod";
import { findRelevantContent } from "./lib/ai/embedding.ts";
import { db } from "./db/client.ts";
import { sql } from "drizzle-orm";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import "dotenv/config";
import { SYSTEM_PROMPT } from "./lib/ai/constant.ts";
import { createChatSession } from "./lib/api/chat.ts";
import { chat_messages } from "./db/schema/chat-message.ts";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

Laminar.initialize({
  projectApiKey: process.env.LMNR_PROJECT_API_KEY,
});

app.get("/", (req, res) => {
  console.log("hello from server");
  res.status(200);
  res.json({ message: "hello" });
  res.end();
});

app.post("/bot", async (req, res) => {
  const { messages, sessionId } = req.body;

  console.log("messages", JSON.stringify(messages));

  try {
    const userMessage = messages[messages.length - 1].parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

    await db.insert(chat_messages).values({
      sessionId,
      role: "user",
      message: userMessage,
    });

    let usageForDb: unknown;
    let message: string;

    const result = streamText({
      model: openai("gpt-5.4-mini"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      onFinish: async ({ totalUsage, text, finishReason }) => {
        console.log("Total tokens used:", totalUsage, text, finishReason);

        usageForDb = {
          totalUsage,
          finishReason,
        };

        message = text;

        await Laminar.flush();
      },
      tools: {
        getInformation: tool({
          description: `this contains all info about Ankitesh Arora, get the info from here`,
          inputSchema: z.object({
            question: z.string().describe("the users question"),
          }),
          execute: async ({ question }) => findRelevantContent(question),
        }),
      },
      experimental_telemetry: {
        isEnabled: true,
        tracer: getTracer(),
      },
    });

    result.pipeUIMessageStreamToResponse(res, {
      onFinish: async (response) => {
        console.log("Assistant message:", response);

        await db.insert(chat_messages).values({
          sessionId,
          role: response.responseMessage.role,
          message,
          parts: response.responseMessage.parts,
          metadata: {
            usage: usageForDb,
          },
        });
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "up",
      database: {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

app.get("/health", async (req, res) => {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: "up",
      database: {
        status: "up",
        latency: `${Date.now() - start}ms`,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "up",
      database: {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

app.get("/create_chat_session", async (req, res) => {
  try {
    const resource = await createChatSession();

    res.status(200).json({
      resource,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unkown error",
    });
  }
});

export default app;
