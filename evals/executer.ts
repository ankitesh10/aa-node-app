import z from "zod";
import type { EvalData } from "./type.js";
import { buildPrompt } from "./utils.js";
import { generateText, isStepCount, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";

const TOOL_DEFINATION = {
  getInformation: {
    description: `this contains all info about Ankitesh Arora, get the info from here`,
    inputSchema: z.object({
      question: z.string().describe("the users question"),
    }),
  },
  getWorkTimeline: {
    description:
      "Get Ankitesh Arora's chronological work history, including employers, role dates, career progression, and key achievements.",
    inputSchema: z.object({
      question: z.string().describe("the user question about work experience"),
    }),
  },
};

type ToolName = keyof typeof TOOL_DEFINATION;

function isToolName(toolName: string): toolName is ToolName {
  return Object.hasOwn(TOOL_DEFINATION, toolName);
}

export async function singleTurnExecuter(data: EvalData) {
  const { instructions, messages } = buildPrompt(data);

  const tools: ToolSet = {};

  for (const toolName of data.tools) {
    if (isToolName(toolName)) {
      const def = TOOL_DEFINATION[toolName];

      tools[toolName] = tool({
        description: def.description,
        inputSchema: def.inputSchema,
      });
    }
  }

  const { toolCalls } = await generateText({
    model: openai(data.config?.model ?? "gpt-5.4-mini"),
    instructions,
    messages,
    tools,
    stopWhen: isStepCount(1),
    temperature: data.config?.temperature,
  });

  const toolNames = toolCalls.map((tc) => tc.toolName);

  return {
    toolCalls,
    toolNames,
    selectedAny: toolNames.length > 0,
  };
}
