import { evaluate } from "@lmnr-ai/lmnr";

import dataset from "./data/aa-bot-tools.json" with { type: "json" };
import { EvalData } from "./type";
import { singleTurnExecuter } from "./executer";
import { toolSelectionScore } from "./evalutors";

async function executor(data: EvalData) {
  return singleTurnExecuter(data);
}

evaluate({
  data: dataset,
  executor,
  evaluators: {
    selectionScore: (output: any, target: any) => {
      if (target?.category === "secondary") return 1;

      return toolSelectionScore(output, target);
    },
  },
  groupName: "aa-bot-tools",
});
