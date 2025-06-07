import { exaProvider } from "../providers";
import { type SearchResult } from "../../types";

/**
 * Search the web for a given query using Exa.
 * @param query - The query to search for
 * @returns The search results
 */
export const searchWeb = async (query: string) => {
  const { results } = await exaProvider.searchAndContents(query, {
    numResults: 1,
    livecrawl: "always",
  });
  return results.map(
    (r) =>
      ({
        title: r.title,
        url: r.url,
        content: r.text,
      } as SearchResult)
  );
};
