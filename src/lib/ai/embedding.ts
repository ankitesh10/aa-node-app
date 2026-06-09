import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { generateChunks } from "../util.ts";

const embeddingModel = openai.embedding("text-embedding-3-small");

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};
