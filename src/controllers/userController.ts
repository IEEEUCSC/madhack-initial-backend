import {NextFunction, Request, Response} from "express";
import multer from 'multer';
import {v1 as uuid_v1} from 'uuid';
import createError from "http-errors";
import Joi from "joi";
import sql, {IResult} from "mssql";
import AppUser from "../models/AppUser";
import joiConf from "../shared/joiConf";

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  try {
    const teamToken = req.get("X-API-Key") || "";

    let request = new sql.Request();
    request.input("team_token", teamToken);
    request.input("user_id", userId);
    request.query('SELECT * FROM app_user WHERE team_id=@team_token AND user_id=@user_id', async (err: Error | undefined, recordset: IResult<AppUser> | undefined) => {
      if (recordset && !err) {
        const user = recordset.recordset[0];
        res.status(200).json({
          "userId": user.user_id,
          "firstName": user.first_name,
          "lastName": user.last_name,
          "email": user.email,
          "contactNo": user.contact_no,
          "avatarUrl": user.avatar_url,
        });
      } else {
        res.status(500).json({"message": "Error retrieving user"});
      }
    });
  } catch (e) {
    next(createError());
  }
};

// TODO: write to S3 bucket
export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
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
      // Return the URL of the uploaded avatar in S3 bucket
      res.status(200).json({message: "Image uploaded successfully", avatarUrl: req.file.path});
    }
  });
}

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
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
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamId = req.get("X-API-Key") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("user_id", userId);
    request.input("first_name", firstName);
    request.input("last_name", lastName);
    request.input("email", email);
    request.input("password", password);
    request.input("contact_no", contactNo);
    request.input("avatar_url", avatarUrl);
    request.input("team_id", teamId);
    request.query('UPDATE app_user SET first_name=@first_name, last_name=@last_name, email=@email, password=@password, contact_no=@contact_no, avatar_url=@avatar_url WHERE user_id=@user_id AND team_id=@team_id', async (err: Error | undefined, recordset: IResult<AppUser> | undefined) => {
      if (recordset && !err) {
        res.status(200).json({"message": "User updated successfully"});
      } else {
        res.status(500).json({"message": "Error updating user"});
      }
    });
  } catch (e) {
    next(createError());
  }
}

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  try {
    const teamId = req.get("X-API-Key") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("user_id", userId);
    request.query('DELETE FROM app_user WHERE user_id=@user_id AND team_id=@team_id', async (err: Error | undefined, recordset: IResult<AppUser> | undefined) => {
      if (recordset && !err) {
        res.status(200).json({"message": "User deleted successfully"});
      } else {
        res.status(500).json({"message": "Error deleting user"});
      }
    });
  } catch (e) {
    next(createError());
  }
}
