import {ErrorRequestHandler, NextFunction, Request, Response} from "express";

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({"error": err.message || "Internal Server Error"});
};
