import { openai } from "@ai-sdk/openai";
import { Laminar } from "@lmnr-ai/lmnr";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { nanoid } from "nanoid";
import z from "zod";
import { db } from "../db/client.ts";
import { chat_messages } from "../db/schema/chat-message.ts";
import { SYSTEM_PROMPT } from "../lib/ai/constant.ts";
import { findRelevantContent } from "../lib/ai/embedding.ts";
import { WORK_TIMELINE } from "../lib/ai/work-timeline.ts";

type CreateBotStreamInput = {
  sessionId: string;
  messages: UIMessage[];
  userMessage: string;
};

export const createBotStream = async ({
  sessionId,
  messages,
  userMessage,
}: CreateBotStreamInput) => {
  await db.insert(chat_messages).values({
    role: "user",
    message: userMessage,
    sessionId,
  });

  let usageForDb: unknown;
  let message = "";

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    onEnd: async ({ usage, text, finishReason }) => {
      usageForDb = {
        usage,
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
      getWorkTimeline: tool({
        description:
          "Get Ankitesh Arora's chronological work history, including employers, role dates, career progression, and key achievements.",
        inputSchema: z.object({
          question: z
            .string()
            .describe("the user question about work experience"),
        }),
        execute: async () => WORK_TIMELINE,
      }),
    },
  });

  return toUIMessageStream({
    stream: result.stream,
    originalMessages: messages,
    generateMessageId: nanoid,
    onEnd: async ({ responseMessage }) => {
      await db.insert(chat_messages).values({
        sessionId,
        role: responseMessage.role,
        message,
        parts: responseMessage.parts,
        metadata: {
          usage: usageForDb,
        },
      });
    },
  });
};
