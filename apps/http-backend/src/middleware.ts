import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

declare module "express"{
    interface Request{
        userId?: string;
    }
}

interface DecodedToken{
    userId: string;
}


export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"] ?? "";

  const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

  if (decoded) {
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
