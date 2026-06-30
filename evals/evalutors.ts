import type { EvalTarget, SingleTurnResult } from "./type.js";

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
