import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const middleware: RequestHandler = (req, res, next): void => {
  const token = req.headers["authorization"] ?? "";

  // Check if token is missing
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.userId = decoded.userId as string;
      next();
    } else {
      res.status(403).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    res.status(403).json({ message: "Unauthorized" });
  }
};
