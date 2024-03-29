import createError from "http-errors";
import {NextFunction, Request, Response} from "express";

import {tokensList} from "../shared/variables";

export const verifyTeamId = (req: Request, res: Response, next: NextFunction) => {
  let token = req.get("X-API-Key");
  if (token) {
    if (tokensList.includes(token)) {
      next();
    } else {
      next(createError(403, "Invalid team access token"));
    }
  } else {
    next(createError(401, "API access denied! No team access token provided"));
  }
}
