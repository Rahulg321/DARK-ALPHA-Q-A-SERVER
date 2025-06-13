import { Router, type Request, type Response } from "express";
import { streamText } from "ai";
import { openaiProvider } from "../lib/ai/providers";
import authenticateToken from "../middleware/authenticate-token";
import { compareResourcesInfomationTool } from "../lib/ai/tools/compare-resources-infomation-tool";

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
  }

  console.log("prompt", prompt);

  try {
    const result = streamText({
      model: openaiProvider("gpt-4.1"),
      system:
        "You are a helpful assistant that compares resources from our company knowledge base based on the user's prompt. You will be given a prompt and you will need to compare the resources based on the promp. Only call the tool if you need to compare the resources and only one not multiple times unncessarily. Once you get the comparison results back from the tool call, make your complete analysis and return the results in a nice and clean manner",
      maxSteps: 5,
      prompt,
      tools: {
        compareResource: compareResourcesInfomationTool,
      },
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const part of result.fullStream) {
      switch (part.type) {
        case "text-delta": {
          console.log("text-delta", part.textDelta);
          res.write(part.textDelta);
          break;
        }
        case "reasoning": {
          console.log("reasoning", part.textDelta);
          res.write(part.textDelta);
          break;
        }

        case "tool-call": {
          console.log("tool-call", part.toolName);
          res.write(part.toolName);
          break;
        }
        // case "tool-result": {
        //   switch (part.toolName) {
        //     case "compareResource": {
        //       console.log("tool-result", part.result);
        //       res.write(JSON.stringify(part.result));
        //       break;
        //     }
        //   }
        //   break;
        // }
      }
    }

    res.end();
  } catch (error) {
    console.error("Error processing stream", error);
    res.status(500).json({ error: "Error processing stream" });
  }
});

export default router;
