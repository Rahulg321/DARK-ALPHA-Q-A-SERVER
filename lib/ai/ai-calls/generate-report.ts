import { generateText } from "ai";
import { openaiProvider } from "../providers";
import { type Research } from "../../types";
import { DEEP_RESEARCH_SYSTEM_PROMPT } from "../prompts";

export const generateReport = async (research: Research) => {
  const { text } = await generateText({
    model: openaiProvider("o3-mini"),
    system: DEEP_RESEARCH_SYSTEM_PROMPT,
    prompt:
      "Generate a report based on the following research data:\n\n" +
      JSON.stringify(research, null, 2),
  });
  return text;
};
