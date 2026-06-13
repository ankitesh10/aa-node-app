import {
  insertResourceSchema,
  type NewResourceParams,
  resources,
} from "../../db/schema/resource.ts";
import { generateEmbeddings } from "../ai/embedding.ts";
import { embeddings as embeddingsTable } from "../../db/schema/embedding.ts";
import { db } from "../../db/client.ts";

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const embeddings = await generateEmbeddings(content);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    await db.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );

    return "Resource successfully created and embedded.";
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};
