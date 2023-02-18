import express from 'express';
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import {verifyAuthToken} from "../middleware/authTokenChecker";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", verifyAuthToken, userRoutes);

export default router;
