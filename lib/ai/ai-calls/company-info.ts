import { generateObject, generateText, Output, tool } from "ai";
import { exaProvider, openaiProvider, perplexityProvider } from "../providers";
import { companyInfoPrompt } from "../prompts";
import { z } from "zod";

/**
 * Fetch company info with Perplexity
 * @param company - The company to fetch info for
 * @returns The company info
 */
export const fetchCompanyInfoWithPerplexity = async (company: string) => {
  console.log("fetching company info with Perplexity", company);

  const { text: description, sources } = await generateText({
    model: perplexityProvider("sonar"),
    prompt: companyInfoPrompt(company),
  });
  return { description, sources };
};

/**
 * Fetch company info from the web
 * @param company - The company to fetch info for
 * @returns The company info
 */
export const fetchCompanyInfoFromWeb = async (company: string) => {
  const { experimental_output: object } = await generateText({
    model: openaiProvider("gpt-4o"),
    prompt: companyInfoPrompt(company),
    tools: {
      searchWeb: tool({
        description: "Search the web for information about a company",
        parameters: z.object({
          query: z.string().min(1).max(100).describe("The search query"),
        }),
        execute: async ({ query }) => {
          const { results } = await exaProvider.searchAndContents(query, {
            livecrawl: "always",
            numResults: 5,
          });
          return { results };
        },
      }),
    },
    maxSteps: 3,
    experimental_output: Output.object({
      schema: z.object({
        description: z.string(),
        products: z
          .array(z.string())
          .describe("The products offered by the company"),
      }),
    }),
  });
  return object;
};

/**
 * Get comprehensive company info
 * @param company - The company to fetch info for
 * @returns The company info
 */
export const getCompanyInfo = async (company: string) => {
  const results = await Promise.all([
    await fetchCompanyInfoWithPerplexity(company),
    await fetchCompanyInfoFromWeb(company),
  ]);

  console.log("generating comprehensive company info");

  const { object } = await generateObject({
    model: openaiProvider("gpt-4o"),
    prompt: `The user has asked for a detailed overview of ${company}.
    Synthesize from the following sources:\n${JSON.stringify(results)}`,
    schema: z.object({
      description: z.string(),
      products: z
        .array(z.string())
        .describe("The products offered by the company"),
      sources: z.array(z.string()).describe("The sources used"),
    }),
  });
  return object;
};
