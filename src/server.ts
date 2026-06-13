import express from "express";
import cors from "cors";
import morgan from "morgan";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createResource } from "./lib/api/resource.ts";
import z from "zod";
import { findRelevantContent } from "./lib/ai/embedding.ts";

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
  console.log("hello", req.body);

  const { messages } = req.body;

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    system: `You are a helpful assistant for Ankitesh Arora called aa_bot. 
    Check your knowledge base which contains info about Ankitesh Arora before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, 
    "Sorry, I don't know." But you can greet the user and tell about yourself if asked.`,
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

export default app;
