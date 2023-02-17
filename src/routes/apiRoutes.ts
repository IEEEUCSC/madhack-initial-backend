import express from 'express';
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import {home} from "../controllers/indexController";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

router.route("/").get(home);

export default router;
