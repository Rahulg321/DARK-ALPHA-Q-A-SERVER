import { generateObject } from "ai";
import { z } from "zod";
import { type SearchResult } from "../../types";
import { openaiProvider } from "../providers";

/**
 * Generate learnings and follow-up questions from a search result.
 * @param query - The query to generate learnings and follow-up questions for
 * @param searchResult - The search result to generate learnings and follow-up questions from
 * @returns The generated learnings and follow-up questions
 */
export const generateLearnings = async (
  query: string,
  searchResult: SearchResult
) => {
  const { object } = await generateObject({
    model: openaiProvider("gpt-4o"),
    prompt: `The user is researching "${query}". The following search result were deemed relevant.
    Generate a learning and a follow-up question from the following search result:
 
    <search_result>
    ${JSON.stringify(searchResult)}
    </search_result>
    `,
    schema: z.object({
      learning: z.string(),
      followUpQuestions: z.array(z.string()),
    }),
  });
  return object;
};
