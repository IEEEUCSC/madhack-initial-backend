import {Request, Response} from "express";

export const home = (req: Request, res: Response) =>
    res.json({"message": "Hello world! Welcome to the initial round of MADHack"});
