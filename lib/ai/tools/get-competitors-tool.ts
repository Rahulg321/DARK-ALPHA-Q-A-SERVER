import { tool } from "ai";
import { z } from "zod";
import { getCompetitors } from "../ai-calls/get-competitors";

/**
 * Get competitors of a company
 * @returns The competitors of the company
 */
export const getCompetitorsTool = tool({
  description: "Get competitors of a company",
  parameters: z.object({
    companyName: z.string(),
  }),
  execute: async ({ companyName }) => {
    return await getCompetitors(companyName);
  },
});
