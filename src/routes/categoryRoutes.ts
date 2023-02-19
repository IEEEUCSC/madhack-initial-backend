import express from "express";
import {getCategories} from "../controllers/categoryController";

const router = express.Router();

router.route("/").get(getCategories);

export default router;