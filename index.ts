import express from "express";
import cors from "cors";
import compareRouter from "./routes/compare";
import deepResearchRouter from "./routes/deep-research";
import companyDeepResearchRouter from "./routes/company-deep-research";
import resourceSearchRouter from "./routes/resource-search";
import { db } from "./lib/db/queries";
import { comparisonQuestions } from "./lib/db/schema";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  const questions = await db.select().from(comparisonQuestions);
  console.log("questions", questions);
  res.send(JSON.stringify(questions));
});

app.use("/compare", compareRouter);
app.use("/deep-research", deepResearchRouter);
app.use("/company-deep-research", companyDeepResearchRouter);
app.use("/resource-search", resourceSearchRouter);

const port = parseInt(process.env.PORT || "8080");

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(`PORT env var: ${process.env.PORT}`);
});
