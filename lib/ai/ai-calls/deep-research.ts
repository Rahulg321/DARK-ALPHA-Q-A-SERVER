import generateSearchQueries from "./generate-search-queries";
import { searchAndProcess } from "./search-process";
import { generateLearnings } from "./generate-learnings";
import { accumulatedResearch } from "../../types";

/**
 * Deep research into a given prompt.
 * @param prompt - The prompt to research into
 * @param depth - The depth of the research
 * @param breadth - The breadth of the research
 * @returns The accumulated research
 */
export const deepResearch = async (
  prompt: string,
  depth: number = 1,
  breadth: number = 3
) => {
  if (!accumulatedResearch.query) {
    accumulatedResearch.query = prompt;
  }
  const queries = await generateSearchQueries(prompt);

  accumulatedResearch.queries = queries;

  for (const query of queries) {
    console.log(`Searching the web for: ${query}`);
    const searchResults = await searchAndProcess(
      query,
      accumulatedResearch.searchResults
    );
    accumulatedResearch.searchResults.push(...searchResults);
    for (const searchResult of searchResults) {
      console.log(`Processing search result: ${searchResult.url}`);
      const learnings = await generateLearnings(query, searchResult);
      // call deepResearch recursively with decrementing depth and breadth
      accumulatedResearch.learnings.push(learnings);
      accumulatedResearch.completedQueries.push(query);

      const newQuery = `Overall research goal: ${prompt}
        Previous search queries: ${accumulatedResearch.completedQueries.join(
          ", "
        )}
        Follow-up questions: ${learnings.followUpQuestions.join(", ")}
        `;

      await deepResearch(newQuery, depth - 1, Math.ceil(breadth / 2));
    }
  }

  return accumulatedResearch;
};
