import express from "express";
import cors from "cors";
import { openaiProvider } from "./lib/providers";
import { generateText } from "ai";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/response", async (req, res) => {
  const result = await generateText({
    model: openaiProvider("gpt-4o-mini"),
    prompt: "When is the AI Engineer summit?",
  });
  console.log(result.text);
  res.send(result.text);
});

app.get("/login", (req, res) => {
  res.send("login");
});

app.get("/register", (req, res) => {
  res.send("register");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
