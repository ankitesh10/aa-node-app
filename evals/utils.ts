import { tool, type ModelMessage, type ToolSet } from "ai";
import type { EvalData, MultiTurnEvalData } from "./type.js";
import { SYSTEM_PROMPT } from "../src/lib/ai/constant.js";
import z from "zod";

export function buildPrompt(data: EvalData | Omit<EvalData, "tools">): {
  instructions: string;
  messages: ModelMessage[];
} {
  const systemPrompt = data.systemPrompt ?? SYSTEM_PROMPT;

  return {
    instructions: systemPrompt,
    messages: [{ role: "user", content: data.prompt! }],
  };
}

export const buildMockedTools = (
  mockTools: MultiTurnEvalData["mockTools"],
): ToolSet => {
  const tools: ToolSet = {};

  for (const [name, config] of Object.entries(mockTools)) {
    // Build parameter schema dynamically
    const paramSchema: Record<string, z.ZodString> = {};
    for (const paramName of Object.keys(config.parameters)) {
      paramSchema[paramName] = z.string();
    }

    tools[name] = tool({
      description: config.description,
      inputSchema: z.object(paramSchema),
      execute: async () => config.mockReturn,
    });
  }

  return tools;
};
