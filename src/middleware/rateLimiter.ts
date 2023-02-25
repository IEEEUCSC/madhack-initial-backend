import {Request, Response} from 'express';
import rateLimit from "express-rate-limit";

export const limitRequests = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each team to 100 requests per window
  message: {"message": "Too many requests from this team, please try again after 10 minutes"},
  keyGenerator: (req: Request, res: Response) => req.get("X-API-Key") || "",
  standardHeaders: true,
  legacyHeaders: false
});
