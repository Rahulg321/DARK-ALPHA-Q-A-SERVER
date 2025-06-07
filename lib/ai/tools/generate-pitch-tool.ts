import { tool } from "ai";
import { z } from "zod";
import { generateReport } from "../ai-calls/generate-report";
import { generateMemo } from "../ai-calls/generate-memo";

/**
 * Generate an investment pitch for a company
 * @param companyName - The name of the company to generate a pitch for
 * @param companyInfo - The information about the company
 * @param competitors - The competitors of the company
 * @param founderInfo - The information about the founder
 * @param financialInfo - The financial information about the company
 * @returns The investment pitch
 */
export const generatePitchTool = tool({
  description: "Generate an investment pitch for a company",
  parameters: z.object({
    companyName: z.string(),
    companyInfo: z.string(),
    competitors: z.array(z.string()),
    founderInfo: z.string(),
    financialInfo: z.string(),
  }),
  execute: async ({
    companyName,
    companyInfo,
    competitors,
    founderInfo,
    financialInfo,
  }) => {
    return await generateMemo(
      companyName,
      JSON.stringify({
        companyInfo,
        competitors,
        founderInfo,
        financialInfo,
      })
    );
  },
});
