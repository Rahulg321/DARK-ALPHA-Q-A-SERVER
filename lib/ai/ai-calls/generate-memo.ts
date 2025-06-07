import { generateText } from "ai";
import { GENERATE_MEMO_SYSTEM_PROMPT } from "../prompts";
import { openaiProvider } from "../providers";

export const generateMemo = async (company: string, research: unknown) => {
  const { text: report } = await generateText({
    system: GENERATE_MEMO_SYSTEM_PROMPT,
    prompt:
      "Generate an investment memo for " +
      company +
      " from the perspective of a venture capitalist.\n\n" +
      research,
    model: openaiProvider("o3-mini"),
  });

  return report;
};
