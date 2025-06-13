import { Router } from "express";

import { streamText } from "ai";
import { getCompanyInfoTool } from "../lib/ai/tools/get-company-info-tool";
import { getCompetitorsTool } from "../lib/ai/tools/get-competitors-tool";
import { getPersonInfoTool } from "../lib/ai/tools/get-person-info-tool";
import { assessFounderMarketfitTool } from "../lib/ai/tools/assess-founder-marketfit-tool";
import { getFinancialInformationTool } from "../lib/ai/tools/get-financial-information-tool";
import { generatePitchTool } from "../lib/ai/tools/generate-pitch-tool";
import { openaiProvider } from "../lib/ai/providers";
import authenticateToken from "../middleware/authenticate-token";

const router = Router();

router.post("/", authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
  }

  if (typeof prompt !== "string") {
    res.status(400).json({ error: "Prompt must be a string" });
  }

  if (prompt.length < 10) {
    res.status(400).json({ error: "Prompt must be at least 10 characters" });
  }

  console.log("query recieved", prompt);

  const { fullStream } = await streamText({
    model: openaiProvider("gpt-4o"),
    prompt,
    maxSteps: 10,
    tools: {
      getCompanyInfo: getCompanyInfoTool,
      getCompetitors: getCompetitorsTool,
      getPersonInfo: getPersonInfoTool,
      assessFounderMarketfit: assessFounderMarketfitTool,
      getFinancialInformation: getFinancialInformationTool,
      generatePitch: generatePitchTool,
    },
  });

  for await (const delta of fullStream) {
    if (delta.type === "tool-call") {
      console.log(delta);
    }
    if (delta.type === "tool-result") {
      console.log(delta.result);
    }
    if (delta.type === "text-delta") {
      process.stdout.write(delta.textDelta);
    }
  }

  res.json({ message: "Deep research completed" });
});

export default router;
