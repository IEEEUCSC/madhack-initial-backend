import {NextFunction, Request, Response} from "express";
import Category from "../models/Category";
import createError from "http-errors";
import db from "../db";
import {QueryResult} from "pg";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.get("X-API-Key") || "";

    const result: QueryResult<Category> = await db.query("SELECT * FROM category", []);

    if (result.rowCount == 0 || result.rows.length == 0)
      return next(createError(404, "No categories found"));

    res.status(200).json(result.rows.map((row: Category) => ({
        categoryId: row.category_id,
        categoryName: row.category_name
      }))
    );

  } catch (error) {
    next(error);
  }
}