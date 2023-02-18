import sql, {IResult} from "mssql";
import {NextFunction, Request, Response} from "express";
import createError from "http-errors";

interface TeamCount {
    count: number;
}

export const registerUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        let request = new sql.Request();

        // Team Token from header - also the team id
        const teamToken = req.get("Team-Token");
        request.input("team_token", teamToken);
        request.input("email", req.body["email"]);
        request.query('SELECT COUNT(*) AS count from app_user WHERE team_id=@team_token AND email=@email', (err: Error | undefined, recordset: IResult<TeamCount> | undefined) => {
            if (err || !recordset) {
                console.log(err);
                // TODO throw separate error for invalid requests
                next(createError());
            } else if (recordset.recordsets[0][0].count <= 0) {
                let request = new sql.Request();
                request.input("first_name", req.body["firstName"]);
                request.input("last_name", req.body["lastName"]);
                request.input("email", req.body["email"]);
                request.input("password", req.body["password"]);
                request.input("contact_no", req.body["contactNo"]);
                request.input("team_id", teamToken);
                request.input("user_id", req.body["userId"]);

                // TODO add profile picture
                request.query('INSERT INTO app_user (first_name, last_name, email, password, contact_no, team_id, user_id) VALUES (@first_name, @last_name, @email, @password, @contact_no, @team_id, @user_id)',
                    (err: Error | undefined, recordset) => {
                        if (err) {
                            console.log(err);
                            next(createError());
                        } else {
                            res.status(200).json({"message": "User registered successfully"});
                        }
                    });
            } else {
                res.status(400).json({"message": "User already exists"});
            }
        });
    } catch (error) {
        console.log(error);
    }
};
