import { generateEmbedding, cosineSimilarity } from "../utils";
import { embeddings as embeddingsTable } from "../../db/schema";
import { db } from "../../db/queries";
import { cosineDistance, sql, inArray } from "drizzle-orm";

export interface ComparisonResult {
  resourceId: string;
  name: string;
  description: string | null;
  content: string;
  similarity: number;
}

export default async function compareResourcesInfomation(
  userQuery: string,
  resources: { resourceId: string; name: string; description: string | null }[]
) {
  console.log(
    "Comparing user query against specific resource",
    resources.map((r) => r.name)
  );

  const userQueryEmbedding = await generateEmbedding(userQuery);
  const resourceIds = resources.map((r) => r.resourceId);
  console.log("resourceIds", resourceIds);

  let rows: any[] = [];

  try {
    rows = await db
      .select({
        resourceId: embeddingsTable.resourceId,
        content: embeddingsTable.content,
        embedding: embeddingsTable.embedding,
      })
      .from(embeddingsTable)
      .where(inArray(embeddingsTable.resourceId, resourceIds));
  } catch (error) {
    console.log("error fetching rows", error);
    return [];
  }

  const results: ComparisonResult[] = rows.map((row) => {
    //@ts-ignore
    const similarity = cosineSimilarity(row.embedding, userQueryEmbedding);
    const meta = resources.find((r) => r.resourceId === row.resourceId)!;

    return {
      resourceId: row.resourceId,
      name: meta.name,
      description: meta.description,
      content: row.content,
      similarity,
    };
  });

  console.log("results", results);

  // Filter and sort
  const filtered = results
    .filter((r) => r.similarity > 0.4)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, resources.length);

  console.log("Comparison results:", filtered);
  return filtered;
}
