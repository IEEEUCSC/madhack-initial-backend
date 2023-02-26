import {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi from "joi";
import AppUser from "../models/AppUser";
import {addUserToDB} from "../shared/helper";
import db from "../db";
import {QueryResult} from "pg";

export interface TeamCount {
  count: number;
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId, firstName, lastName, email, password, contactNo, avatarUrl} = req.body;

    const schema = Joi.object({
      userId: Joi.string().lowercase().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      contactNo: Joi.string().required(),
      avatarUrl: Joi.string().required().allow(null),
    });

    const {error} = schema.validate({userId, firstName, lastName, email, password, contactNo, avatarUrl});
    if (error)
      return next(createError(400, error.details[0].message));

    const teamId = req.get("X-API-Key") || "";

    const countResult: QueryResult<TeamCount> = await db.query('SELECT COUNT(*) AS count from app_user WHERE team_id=$1 AND email=$2', [teamId, email]);
    if (countResult.rowCount == 0)
      return next(createError(500, "Error registering user"));

    if (countResult.rows[0].count > 0)
      return next(createError(409, "Email already exists"));

    if (await addUserToDB({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        contact_no: contactNo,
        avatar_url: avatarUrl,
        team_id: teamId
      }
    ))
      return res.status(201).json({"message": "User registered successfully"});
    return next(createError(500, "Error registering user"));
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const {email, password} = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const {error} = schema.validate({email, password});
    if (error)
      return next(createError(400, error.details[0].message));

    const teamId = req.get("X-API-Key");

    const result: QueryResult<AppUser> = await db.query('SELECT * from app_user WHERE team_id=$1 AND email=$2', [teamId, email]);
    if (result.rowCount == 0 || result.rows.length == 0)
      return next(createError(401, "Invalid credentials"));

    const user: AppUser = result.rows[0];
    const user_id = user.user_id;
    const match = (await bcrypt.compare(password, user.password))
    if (match) {
      const token = jwt.sign({"userId": user_id}, process.env.JWT_SECRET || 'secret');
      return res.status(200).json({"message": "User logged in successfully", "token": token});
    }
    return next(createError(401, "Invalid credentials"));

  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.status(200).json({message: 'User logged out'});
};
