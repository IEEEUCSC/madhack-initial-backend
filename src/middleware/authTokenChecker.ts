import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization)?.split(' ')[1];

  if (!token) {
    return res.status(401).json({message: 'No auth token provided'});
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
    if (decoded && !err) {
      req.body.user = decoded;
      next();
    } else {
      return res.status(401).json({message: 'Invalid auth token'});
    }
  });
}
