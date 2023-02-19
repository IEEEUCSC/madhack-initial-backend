import rateLimit from "express-rate-limit";

export const limitRequests = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {"message": "Too many requests from this IP, please try again after 10 minutes"}
});