import { Router, type Request, type Response } from "express";
import { streamText } from "ai";
import { openaiProvider } from "../lib/ai/providers";
import authenticateToken from "../middleware/authenticate-token";

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
  }

  console.log("prompt", prompt);

  try {
    const { fullStream, toolResults } = await streamText({
      model: openaiProvider("gpt-4o"),
      prompt,
    });

    console.log("toolResults", toolResults);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        console.log("text delta", delta.textDelta);
        res.write(delta.textDelta);
      }
    }

    res.end();
  } catch (error) {
    console.error("Error processing stream", error);
    res.status(500).json({ error: "Error processing stream" });
  }
});

export default router;
