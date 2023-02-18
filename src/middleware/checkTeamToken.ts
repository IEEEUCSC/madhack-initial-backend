import createError from "http-errors";
import {NextFunction, Request, Response} from "express";
import {tokensList} from "../shared/variables";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.get("Team-Token");
    if (token) {
        if (tokensList.includes(token.toUpperCase())) {
            next();
        } else {
            next(createError(403, "Invalid team access token"));
        }
    } else {
        next(createError(401, "Access denied! Team access token not provided"));
    }
}
