export interface EvalData {
  prompt: string;
  systemPrompt?: string;
  tools: string[];
  config?: {
    model?: string;
    temperature?: number;
  };
}

export interface SingleTurnResult {
  toolCalls: Array<{ toolName: string }>;
  toolNames: string[];
  selectedAny: boolean;
}

export interface EvalTarget {
  expectedTools?: string[];
  forbiddenTools?: string[];
  category: "golden" | "secondary" | "negative";
}
