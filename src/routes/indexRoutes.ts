import express from "express";
import {home} from "../controllers/indexController";

const router = express.Router();

router.route("/").get(home);

export default router;