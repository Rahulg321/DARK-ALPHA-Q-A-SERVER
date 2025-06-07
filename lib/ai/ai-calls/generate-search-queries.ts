import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { openaiProvider } from "../providers";

/**
 * Generate search queries for a given query using AI.
 * * @param query - The query to generate search queries for
 * @param n - The number of search queries to generate
 * @returns The generated search queries
 */
const generateSearchQueries = async (query: string, n: number = 3) => {
  const {
    object: { queries },
  } = await generateObject({
    model: openaiProvider("gpt-4o"),
    prompt: `Generate ${n} search queries for the following query: ${query}`,
    schema: z.object({
      queries: z.array(z.string()).min(1).max(5),
    }),
  });
  return queries;
};

export default generateSearchQueries;
