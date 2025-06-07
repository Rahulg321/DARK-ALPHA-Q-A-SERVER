import { tool } from "ai";
import { z } from "zod";
import { getFounderInfo } from "../ai-calls/get-founder-info";

export const getPersonInfoTool = tool({
  description:
    "Get information (tweets, blog posts, linkedin profile) about a person",
  parameters: z.object({
    name: z.string(),
  }),
  execute: async ({ name: founderName }) => {
    return await getFounderInfo(founderName);
  },
});
