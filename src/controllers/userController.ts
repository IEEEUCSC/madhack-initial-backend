import {NextFunction, Request, Response} from "express";
import multer from 'multer';
import {v1 as uuid_v1} from 'uuid';
import createError from "http-errors";
import Joi from "joi";
import AppUser from "../models/AppUser";
import joiConf from "../shared/joiConf";
import {QueryResult} from "pg";
import db from "../db";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;
    const teamToken = req.get("X-API-Key") || "";

    const result: QueryResult<AppUser> = await db.query('SELECT * FROM app_user WHERE team_id=$1 AND user_id=$2', [teamToken, userId]);
    if (result.rowCount == 0 || result.rows.length > 0) {
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

// TODO: write to S3 bucket
export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: CallableFunction) => {
      cb(null, 'uploads/user-avatars/');
    },
    filename: (req, file, cb) => {
      const extension = file.originalname.split('.').pop()
      cb(null, uuid_v1() + '.' + extension?.toLowerCase());
    }
  });

  const upload = multer({storage: storage, limits: {fileSize: 1024 * 1024}});

  upload.single('file')(req, res, (err) => {
    if (err) {
      next(createError(500, err.message));
    } else if (!req.file) {
      next(createError(400, "No avatar uploaded"));
    } else {
      res.status(200).json({message: "Image uploaded successfully", avatarUrl: req.file.path});
    }
  });
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.body.user.userId;

    const {firstName, lastName, email, password, contactNo, avatarUrl} = req.body;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      contactNo: Joi.string().required(),
      avatarUrl: Joi.string().required().allow(null),
    });

    const {error} = schema.validate({firstName, lastName, email, password, contactNo, avatarUrl}, joiConf);
    if (error)
      createError(error.details[0].message);

    const teamId = req.get("X-API-Key") || "";

    const params = [firstName, lastName, email, contactNo, avatarUrl, userId, teamId];
    const result: QueryResult<AppUser> = await db.query('UPDATE app_user SET first_name=$1, last_name=$2, email=$3, password=$4, contact_no=$5, avatar_url=$6 WHERE user_id=$7 AND team_id=$8', params);

    if (result.rowCount == 0 || result.rows.length > 0)
      createError(500, "Error updating user");

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
      createError(500, "Error deleting user");

    res.status(200).json({"message": "User deleted successfully"});
  } catch (error) {
    next(error);
  }
}
