import {NextFunction, Request, Response} from "express";
import Joi from "joi";
import createError from "http-errors";
import sql, {IResult} from "mssql";
import AppUser from "../models/AppUser";

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement get user details
};

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  const {firstName, lastName, email, password, contactNo} = req.body;

  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    contactNo: Joi.string().required(),
  });

  const {error} = schema.validate({firstName, lastName, email, password, contactNo});
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamToken = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_token", teamToken);
    request.input("user_id", userId);
    request.input("first_name", firstName);
    request.input("last_name", lastName);
    request.input("email", email);
    request.input("password", password);
    request.input("contact_no", contactNo);
    request.input("team_id", teamToken);
    request.query('UPDATE user SET first_name=@first_name, last_name=@last_name, email=@email, password=@password, contact_no=@contact_no WHERE user_id=@user_id AND team_id=@team_id', async (err: Error | undefined, recordset: IResult<AppUser> | undefined) => {
      if (recordset && !err) {
        res.status(200).json(recordset.recordsets[0]);
      } else {
        res.status(500).json({"message": "Error updating user"});
      }
    });
  } catch (e) {
    next(createError());
  }
}
