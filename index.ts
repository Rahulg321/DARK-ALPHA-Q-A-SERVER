import express from "express";
import cors from "cors"; // Even this could be temporarily removed for absolute minimal test

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
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
