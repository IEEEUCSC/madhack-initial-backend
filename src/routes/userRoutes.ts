import express from "express";
import {getUser} from "../controllers/userController";
const router = express.Router();

router.route("/get").get(getUser);

export default router;
