import {NextFunction, Request, Response} from "express";
import Category from "../models/Category";
import createError from "http-errors";
import db from "../db";
import {QueryResult} from "pg";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  const {userId} = req.query;

  try {
    const teamId = req.get("X-API-Key") || "";

    const result: QueryResult<Category> = await db.query("SELECT * FROM category WHERE user_id=$1 AND team_id=$2", [teamId, userId]);

    if (result.rowCount == 0 || result.rows.length == 0)
      createError(404, "No categories found");

    res.status(200).json(result.rows.map((row: Category) => ({
        categoryId: row.category_id,
        categoryName: row.category_name
      }))
    );

  } catch (error) {
    next(error);
  }
}