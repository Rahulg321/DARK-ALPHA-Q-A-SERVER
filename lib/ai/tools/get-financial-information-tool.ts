import { tool } from "ai";
import { z } from "zod";
import { getCompanyFinancials } from "../ai-calls/get-financials";

export const getFinancialInformationTool = tool({
  description: "Get financial information about a company",
  parameters: z.object({
    companyName: z.string(),
  }),
  execute: async ({ companyName }) => {
    return await getCompanyFinancials(companyName);
  },
});
