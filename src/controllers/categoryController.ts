import {NextFunction, Request, Response} from "express";
import sql, {IResult} from "mssql";
import Category from "../models/Category";
import createError from "http-errors";

export const getCategories = (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.query;

    try {
        const teamToken = req.get("Team-Token") || "";

        let request = new sql.Request();
        request.input("team_token", teamToken);
        request.input("user_id", userId);
        request.query('SELECT * FROM category WHERE user_id=@user_id AND team_id=@team_token', async (err: Error | undefined, recordset: IResult<Category> | undefined) => {
            if (recordset && !err) {
                res.status(200).json(recordset.recordsets[0]);
            } else {
                res.status(500).json({"message": "Error getting categories"});
            }
        });
    } catch (e) {
        next(createError());
    }
}