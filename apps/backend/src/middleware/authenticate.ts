import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {

   if (!req.cookies.token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
   }

    const userId = verifyToken(req.cookies.token);

    if (!userId) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }

    req.userId = userId;

   next();
};