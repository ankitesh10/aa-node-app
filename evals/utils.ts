import type { ModelMessage } from "ai";
import type { EvalData } from "./type.js";
import { SYSTEM_PROMPT } from "../src/lib/ai/constant.js";

export function buildPrompt(
  data: EvalData | Omit<EvalData, "tools">,
): { system: string; messages: ModelMessage[] } {
  const systemPrompt = data.systemPrompt ?? SYSTEM_PROMPT;

  return {
    system: systemPrompt,
    messages: [{ role: "user", content: data.prompt! }],
  };
}
