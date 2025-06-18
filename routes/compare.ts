import { Router, type Request, type Response } from "express";
import { generateText } from "ai";
import { openaiProvider } from "../lib/ai/providers";
import authenticateToken from "../middleware/authenticate-token";
import { compareResourcesInfomationTool } from "../lib/ai/tools/compare-resources-infomation-tool";

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ message: "Prompt is required" });
    return;
  }

  try {
    const result = await generateText({
      model: openaiProvider("o3-mini"),
      system:
        "You are a helpful assistant that compares resources from our company knowledge base based on the user's prompt. You will be given a prompt and you will need to compare the resources based on the prompt. Only call the tool if you need to compare the resources and only one not multiple times unnecessarily. Once you get the comparison results back from the tool call, make your complete analysis and return the results in a nice and clean manner",
      maxSteps: 5,
      prompt,
      tools: {
        compareResource: compareResourcesInfomationTool,
      },
    });
    res.json({ result: result.text });
  } catch (error) {
    console.error("Error generating text", error);

    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;
