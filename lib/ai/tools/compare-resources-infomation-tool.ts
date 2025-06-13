import { tool } from "ai";
import { z } from "zod";
import compareResourcesInfomation from "../ai-calls/compare-resources-information";

export const compareResourcesInfomationTool = tool({
  description:
    "Compare the infomation of two or more resources from the knowledge base. When you are asked to compare the resources, you should use this tool. This tool accepts an array of resources with their resourceId, name and description and returns information from the resource",
  parameters: z.object({
    userQuery: z
      .string()
      .describe("The custom user query to compare the resources"),
    resources: z.array(
      z.object({
        resourceId: z.string(),
        name: z.string(),
        description: z.string().nullable(),
      })
    ),
  }),
  execute: async ({ userQuery, resources }) => {
    console.log("inside tool call for compare resources", userQuery, resources);
    return await compareResourcesInfomation(userQuery, resources);
  },
});
