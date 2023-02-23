import {ErrorRequestHandler, NextFunction, Request, Response} from "express";
import {HttpError} from "http-errors";

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({"error": err.message});
  } else {
    res.status(err.status || 500).json({"error": err.message || "Internal Server Error"});
  }
};
