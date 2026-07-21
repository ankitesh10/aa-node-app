import z from "zod";
import type { EvalData, MultiTurnEvalData } from "./type.js";
import { buildMockedTools, buildPrompt } from "./utils.js";
import {
  generateText,
  isStepCount,
  ModelMessage,
  stepCountIs,
  tool,
  type ToolSet,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "../src/lib/ai/constant.js";

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

export async function multiTurnWithMocks(data: MultiTurnEvalData) {
  const tools = buildMockedTools(data.mockTools);

  const messages: ModelMessage[] = data.messages ?? [
    { role: "user", content: data.prompt! },
  ];

  const result = await generateText({
    model: openai(data.config?.model ?? "gpt-5.4-mini"),
    instructions: data.messages ? undefined : SYSTEM_PROMPT,
    messages,
    tools,
    stopWhen: stepCountIs(data.config?.maxSteps ?? 20),
  });

  const allTools: string[] = [];

  const steps = result.steps.map((step) => {
    const stepToolCalls = (step.toolCalls ?? []).map((tc) => {
      allTools.push(tc.toolName);

      return {
        toolName: tc.toolName,
        args: "args" in tc ? tc.args : {},
      };
    });

    const stepToolResults = (step.staticToolCalls ?? []).map((tr) => ({
      toolName: tr.toolName,
      result: "results" in tr ? tr.results : tr,
    }));

    return {
      toolCalls: stepToolCalls?.length > 0 ? stepToolCalls : undefined,
      stepToolResults: stepToolResults.length > 0 ? stepToolResults : undefined,
      text: step.text || undefined,
    };
  });

  const toolsUsed = [new Set(allTools)];

  return {
    text: result.text,
    steps,
    toolsUsed,
    toolCallOrder: allTools,
  };
}
