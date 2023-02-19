import {ErrorRequestHandler, Request, Response} from "express";

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response) => {
  res.status(err.status || 500).json({"error": err.message});
};
