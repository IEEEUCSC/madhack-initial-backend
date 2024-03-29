import {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import Joi from "joi";
import AppUser from "../models/AppUser";
import joiConf from "../shared/joiConf";
import {QueryResult} from "pg";
import db from "../db";
import {TeamCount} from "./authController";
import {uploadToS3} from "../shared/imageUpload";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;
    const teamToken = req.get("X-API-Key") || "";

    const result: QueryResult<AppUser> = await db.query('SELECT * FROM app_user WHERE team_id=$1 AND user_id=$2', [teamToken, userId]);
    if (result.rowCount == 0 || result.rows.length == 0) {
      return res.status(404).json({"message": "User not found"});
    }
    const user: AppUser = result.rows[0];
    res.status(200).json({
      "userId": user.user_id,
      "firstName": user.first_name,
      "lastName": user.last_name,
      "email": user.email,
      "contactNo": user.contact_no,
      "avatarUrl": user.avatar_url ?? null,
    })
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.body.user.userId;

    const {firstName, lastName, email, contactNo, avatarUrl} = req.body;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      contactNo: Joi.string().required(),
      avatarUrl: Joi.string().required().allow(null),
    });

    const {error} = schema.validate({firstName, lastName, email, contactNo, avatarUrl}, joiConf);
    if (error)
      next(createError(error.details[0].message));

    const teamId = req.get("X-API-Key") || "";

    const countResult: QueryResult<TeamCount> = await db.query('SELECT COUNT(*) AS count from app_user WHERE team_id=$1 AND email=$2', [teamId, email]);
    if (countResult.rowCount == 0)
      return next(createError(500, "Error registering user"));

    if (countResult.rows[0].count > 0)
      return next(createError(409, "Email already exists"));

    const params = [firstName, lastName, email, contactNo, avatarUrl, userId, teamId];
    const result: QueryResult<AppUser> = await db.query('UPDATE app_user SET first_name=$1, last_name=$2, email=$3, contact_no=$5, avatar_url=$6 WHERE user_id=$7 AND team_id=$8', params);

    if (result.rowCount == 0 || result.rows.length > 0)
      next(createError(500, "Error updating user"));

    res.status(200).json({"message": "User updated successfully"});

  } catch (error) {
    next(error);
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;
    const teamId = req.get("X-API-Key") || "";

    const result: QueryResult<AppUser> = await db.query('DELETE FROM app_user WHERE user_id=$1 AND team_id=$2', [userId, teamId]);

    if (result.rowCount == 0 || result.rows.length > 0)
      next(createError(500, "Error deleting user"));

    res.status(200).json({"message": "User deleted successfully"});
  } catch (error) {
    next(error);
  }
}

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    uploadToS3(req, res, next);

  } catch (error) {
    next(error);
  }
}
