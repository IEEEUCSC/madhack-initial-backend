import {NextFunction, Request, Response} from "express";
import sql, {IResult} from "mssql";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi from "joi";
import AppUser from "../models/AppUser";
import {addUserToDB} from "../shared/helper";

export interface TeamCount {
    count: number;
}

export const registerUser = (req: Request, res: Response, next: NextFunction) => {
    const {userId, firstName, lastName, email, password, contactNo} = req.body;

    // validate request body with joi
    const schema = Joi.object({
        userId: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        contactNo: Joi.string().required(),
    });

    const {error} = schema.validate({userId, firstName, lastName, email, password, contactNo});
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }

    try {
        const teamToken = req.get("Team-Token") || "";

        let request = new sql.Request();
        request.input("team_token", teamToken);
        request.input("email", email);
        request.query('SELECT COUNT(*) AS count from app_user WHERE team_id=@team_token AND email=@email', async (err: Error | undefined, recordset: IResult<TeamCount> | undefined) => {

            if (recordset && !err) {
                if (recordset.recordsets[0][0].count <= 0) {
                    if (await addUserToDB({
                        user_id: userId,
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        password: password,
                        contact_no: contactNo,
                        team_id: teamToken
                    })) {
                        res.status(201).json({"message": "User registered successfully"});
                    } else {
                        res.status(500).json({"message": "Error registering user"});
                    }

                } else {
                    res.status(400).json({"message": "User already exists"});
                }

            } else {
                console.log(err);
                next(createError());
            }
        });

    } catch (error) {
        console.log(error);
    }
};

export const loginUser = (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;

    // validate request body with joi
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    const {error} = schema.validate({email, password});
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }

    try {
        let request = new sql.Request();
        const teamToken = req.get("Team-Token");
        request.input("team_token", teamToken);
        request.input("email", email);
        request.query('SELECT * from app_user WHERE team_id=@team_token AND email=@email', async (err: Error | undefined, recordset: IResult<AppUser> | undefined) => {

            if (recordset && !err) {
                if (recordset.recordsets[0].length > 0) {
                    const user: AppUser = recordset.recordsets[0][0];
                    const user_id = user.user_id;
                    if (await bcrypt.compare(password, user.password)) {

                        // If the credentials are valid, create a JWT and return it to the client
                        const token = jwt.sign({"userId": user_id}, process.env.JWT_SECRET || 'secret', {expiresIn: '1h'});
                        res.status(200).json({"message": "User logged in successfully", "token": token});

                    } else {
                        res.status(400).json({"message": "Invalid credentials"});
                    }
                } else {
                    res.status(400).json({"message": "Invalid credentials"});
                }

            } else {
                console.log(err);
                next(createError());
            }
        });

    } catch (error) {
        console.log(error);
    }
};

export const logoutUser = (req: Request, res: Response) => {
    res.status(200).json({message: 'User logged out'});
};
