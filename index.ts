import express from "express";
import cors from "cors"; // Even this could be temporarily removed for absolute minimal test
import { openaiProvider } from "./lib/ai/providers";
import { generateText } from "ai";
import generateSearchQueries from "./lib/ai/ai-calls/generate-search-queries";
import { searchAndProcess } from "./lib/ai/ai-calls/search-process";
import { generateLearnings } from "./lib/ai/ai-calls/generate-learnings";
import { deepResearch } from "./lib/ai/ai-calls/deep-research";
import { generateReport } from "./lib/ai/ai-calls/generate-report";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/deep-research", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Query is required" });
  }

  if (typeof prompt !== "string") {
    res.status(400).json({ error: "Query must be a string" });
  }

  if (prompt.length < 10) {
    res.status(400).json({ error: "Query must be at least 10 characters" });
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

const port = parseInt(process.env.PORT || "8080");

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(`PORT env var: ${process.env.PORT}`); // Add this for explicit check
});
