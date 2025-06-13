import { Router } from "express";
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
});

export default router;
