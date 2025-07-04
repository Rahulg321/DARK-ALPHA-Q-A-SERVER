import { Router } from "express";
import fs from "fs";
import { generateReport } from "../lib/ai/ai-calls/generate-report";
import { deepResearch } from "../lib/ai/ai-calls/deep-research";
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

  console.log("generating search");
  const research = await deepResearch(prompt);
  console.log("research completed");

  console.log("generating report");
  const report = await generateReport(research);
  console.log("report generated");
  res.json({ research, report });
});

export default router;
