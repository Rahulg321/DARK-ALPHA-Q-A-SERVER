import express from "express";
import cors from "cors"; // Even this could be temporarily removed for absolute minimal test
import { openaiProvider } from "./lib/providers";
import { generateText } from "ai";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/login", (req, res) => {
  res.send("login");
});

app.get("/register", (req, res) => {
  res.send("register");
});

app.get("/response", async (req, res) => {
  const result = await generateText({
    model: openaiProvider("gpt-4o-mini"),
    prompt: "When is the AI Engineer summit?",
  });

  res.json({
    message: "Response received",
    data: result.text,
    apiKey: process.env.AI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.0", environment: process.env.NODE_ENV });
});

app.post("/api/echo", (req, res) => {
  res.json({
    message: "Echo received",
    data: req.body,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
  });
});

const port = parseInt(process.env.PORT || "8080");

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(`PORT env var: ${process.env.PORT}`); // Add this for explicit check
});
