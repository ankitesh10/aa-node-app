import {
  insertResourceSchema,
  NewResourceParams,
  resources,
} from "../../db/schema/resource.ts";
import { db } from "../../index.ts";
import { generateEmbeddings } from "../ai/embedding.ts";
import { embeddings as embeddingsTable } from "../../db/schema/embedding.ts";

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const embeddings = await generateEmbeddings(content);

    await db.transaction(async (tx) => {
      const [resource] = await tx
        .insert(resources)
        .values({ content })
        .returning();

      await tx.insert(embeddingsTable).values(
        embeddings.map((embedding) => ({
          resourceId: resource.id,
          ...embedding,
        })),
      );
    });

    return "Resource successfully created and embedded.";
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};
