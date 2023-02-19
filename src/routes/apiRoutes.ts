import express from 'express';
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import todoRoutes from "./todoRoutes";
import {verifyAuthToken} from "../middleware/authTokenChecker";
import categoryRoutes from "./categoryRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", verifyAuthToken, userRoutes);
router.use("/todos", verifyAuthToken, todoRoutes);
router.use("/categories", categoryRoutes);

export default router;
