import express from "express";
import cors from "cors";
import morgan from "morgan";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createResource } from "./lib/api/resource.ts";
import z from "zod";
import { findRelevantContent } from "./lib/ai/embedding.ts";
import { db } from "./db/client.ts";
import { sql } from "drizzle-orm";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import "dotenv/config";
import { SYSTEM_PROMPT } from "./lib/ai/constant.ts";

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
  const { messages } = req.body;

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
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

  await Laminar.flush();

  result.pipeUIMessageStreamToResponse(res);
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

export default app;
