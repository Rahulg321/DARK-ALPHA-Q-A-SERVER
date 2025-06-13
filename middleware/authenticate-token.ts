import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ message: "Not Authenticated" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authorization token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET as string);
    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "invalid token" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export default authenticateToken;
