import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getCompanyInfoTool } from "../lib/ai/tools/get-company-info-tool";
import { getCompetitorsTool } from "../lib/ai/tools/get-competitors-tool";
import { getPersonInfoTool } from "../lib/ai/tools/get-person-info-tool";
import { assessFounderMarketfitTool } from "../lib/ai/tools/assess-founder-marketfit-tool";
import { getFinancialInformationTool } from "../lib/ai/tools/get-financial-information-tool";
import { generatePitchTool } from "../lib/ai/tools/generate-pitch-tool";
import { Router } from "express";
import fs from "fs";
import { generateReport } from "../lib/ai/ai-calls/generate-report";
import { deepResearch } from "../lib/ai/ai-calls/deep-research";

const router = Router();

router.post("/", async (req, res) => {
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

  console.log("generating search");
  const research = await deepResearch(prompt);
  console.log("research completed");

  console.log("generating report");
  const report = await generateReport(research);
  console.log("report generated");
  fs.writeFileSync("report.md", report);
  res.json({ research, report });
});

export default router;
