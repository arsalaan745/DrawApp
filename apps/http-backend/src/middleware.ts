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
  const authHeader = req.headers["authorization"];

  //Checking if the token is missing
  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  // extracting the token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

    //token might be undefind so checking for it
  if (!token) {
    res.status(401).json({ message: "Invalid token format" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      req.userId = (decoded as JwtPayload).userId as string;
      next();
    } else {
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }
  } catch (err) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
};
