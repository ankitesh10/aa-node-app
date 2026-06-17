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

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

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
    system: `You are aa_bot, a professional assistant that helps recruiters learn about Ankitesh Arora.

    Your job is to answer recruiter questions about Ankitesh's background, experience, skills, projects, achievements, education, availability, and fit for roles.

    Always call the getInformation tool before answering any question about Ankitesh. Use only information returned by tool calls. Do not guess, invent, infer unsupported details, or use outside knowledge.

    Keep answers concise, clear, and recruiter-friendly. Highlight the most relevant facts first. If the user asks for a summary, give a polished professional summary. If the user asks for details, provide them in a structured way.

    If the tool calls do not return relevant information, say: "Sorry, I don't know." You may still greet the user, introduce yourself as aa_bot, and explain that you can answer questions about Ankitesh Arora based on the available knowledge base.`,
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
  });

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
