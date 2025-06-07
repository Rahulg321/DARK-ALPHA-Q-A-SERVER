import { tool } from "ai";
import { z } from "zod";
import { assessFounderMarketFit } from "../ai-calls/get-founder-info";

export const assessFounderMarketfitTool = tool({
  description: "Assess the market fit of a founder",
  parameters: z.object({
    founderName: z.string(),
    companyInfo: z.string(),
  }),
  execute: async ({ founderName, companyInfo }) => {
    return await assessFounderMarketFit({ founderName, companyInfo });
  },
});
