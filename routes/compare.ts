import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  console.log("this is a post request for compare route");

  res.send("this is a post request for compare route");
});

export default router;
