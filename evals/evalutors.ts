import { generateText, Output } from "ai";
import type {
  EvalTarget,
  MultiTurnResult,
  MultiTurnTarget,
  SingleTurnResult,
} from "./type.js";
import { openai } from "@ai-sdk/openai";
import z from "zod";

export function toolSelectionScore(
  output: SingleTurnResult,
  target: EvalTarget,
) {
  if (!target.expectedTools?.length) {
    return output.selectedAny ? 0.5 : 1;
  }

  const expected = new Set(target.expectedTools);
  const selected = new Set(output.toolNames);

  const hits = output.toolNames.filter((t) => expected.has(t)).length;

  const precision = selected.size > 0 ? hits / selected.size : 0;

  const recall = expected.size > 0 ? hits / expected.size : 0;

  // Simple F1-ish score
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

const judgeSchema = z.object({
  score: z
    .number()
    .min(1)
    .max(10)
    .describe("Scrore from 1-10 where 10 is perfect"),
  reason: z.string().describe("Brief explaination for score"),
});

export async function llmJudge(
  output: MultiTurnResult,
  target: MultiTurnTarget,
): Promise<{ score: number; reason: string }> {
  const result = await generateText({
    model: openai("gpt-5.6-terra"),
    instructions: `You are an evaluation judge. Score the agent's response on a scale of 1-10.

Scoring criteria:
- 10: Response fully addresses the task using tool results correctly
- 7-9: Response is mostly correct with minor issues
- 4-6: Response partially addresses the task
- 1-3: Response is mostly incorrect or irrelevant`,
    output: Output.object({
      name: "evaluation",
      description: "Evaluation of an AI agent response",
      schema: judgeSchema,
    }),
    providerOptions: {
      openai: {
        reasoningEffort: "high",
      },
    },
    messages: [
      {
        role: "user",
        content: `Task: ${target.originalTask}

Tools called: ${JSON.stringify(output.toolCallOrder)}
Tool results provided: ${JSON.stringify(target.mockToolResults)}

Agent's final response:
${output.text}

Evaluate if this response correctly uses the tool results to answer the task.`,
      },
    ],
  });

  return { score: result.output.score / 10, reason: result.output.reason };
}
