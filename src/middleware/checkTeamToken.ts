import sql, {IResult} from "mssql";
import createError from "http-errors";
import {NextFunction, Request, Response} from "express";

import Team from "../models/Team";

let tokensList: String[];

export const fetchTokensFromDB = () => {
    let request = new sql.Request();

    request.query('SELECT * from team', (err: Error | undefined, recordset: IResult<Team> | undefined) => {
        if (err || !recordset) {
            console.log(err);
        } else {
            tokensList = recordset.recordsets[0].map((team: Team) => team.team_token);
        }
    });
}

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
