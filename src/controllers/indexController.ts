import {Request, Response} from "express";

export const home = (req: Request, res: Response) =>
    res.json({"message": "Hello World! Welcome to MADHack"});
