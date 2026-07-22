import { evaluate, Laminar } from "@lmnr-ai/lmnr";
import { multiTurnWithMocks } from "./executer";
import { MultiTurnEvalData, MultiTurnResult, MultiTurnTarget } from "./type";
import dataset from "./data/agent-multi-turn.json" with { type: "json" };
import { llmJudge } from "./evalutors";

async function executor(data: MultiTurnEvalData): Promise<MultiTurnResult> {
  return multiTurnWithMocks(data);
}

evaluate({
  data: dataset as unknown as Array<{
    data: MultiTurnEvalData;
    target: MultiTurnTarget;
  }>,
  executor,
  evaluators: {
    outputQuality: async (output, target) => {
      if (!target) return 1;
      const result = await llmJudge(output, target);

      Laminar.setTraceMetadata({
        output_quality_reason: result.reason,
      });

      return result.score;
    },
  },
  config: {
    projectApiKey: process.env.LMNR_API_KEY,
  },
  groupName: "agent-multiturn",
});
