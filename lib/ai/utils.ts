import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { embeddings } from "../db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "../db/queries";
import { embeddings as embeddingsTable } from "../db/schema";
import { encoding_for_model } from "tiktoken";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  console.log("Generating embeddings for value:", value);
  const chunks = generateChunks(value);
  console.log("Chunks generated:", chunks);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i]!, embedding: e }));
};

export const generateEmbeddingsFromChunks = async (
  chunks: string[]
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const encoder = encoding_for_model("text-embedding-3-small");
  const maxTokens = 300000;
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentTokenCount = 0;

  for (const chunk of chunks) {
    const tokens = encoder.encode(chunk);
    if (
      currentTokenCount + tokens.length > maxTokens &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentTokenCount = 0;
    }
    currentBatch.push(chunk);
    currentTokenCount += tokens.length;
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  let allEmbeddings: Array<{ embedding: number[]; content: string }> = [];
  for (const batch of batches) {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch,
    });
    allEmbeddings = allEmbeddings.concat(
      embeddings.map((e, i) => ({ content: batch[i]!, embedding: e }))
    );
  }
  encoder.free();
  return allEmbeddings;
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  console.log("Generating embedding for value:", value);
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export function cosineSimilarity(a: number[], b: number[]) {
  if (
    !Array.isArray(a) ||
    !Array.isArray(b) ||
    a.length !== b.length ||
    a.length === 0
  )
    return 0;
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    if (typeof a[i] !== "number" || typeof b[i] !== "number") return 0;
    dot += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
