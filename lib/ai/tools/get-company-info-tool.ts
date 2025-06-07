import { tool } from "ai";
import { z } from "zod";
import { getCompanyInfo } from "../ai-calls/company-info";

/**
 * Get information about a company
 * @returns The information about the company
 */
export const getCompanyInfoTool = tool({
  description: "Get information about a company",
  parameters: z.object({
    companyName: z.string(),
  }),
  execute: async ({ companyName }) => {
    return await getCompanyInfo(companyName);
  },
});
