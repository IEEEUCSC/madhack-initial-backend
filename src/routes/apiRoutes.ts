import express from 'express';
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import todoRoutes from "./todoRoutes";
import {verifyAuthToken} from "../middleware/authTokenChecker";
import categoryRoutes from "./categoryRoutes";
import indexRoutes from "./indexRoutes";

const router = express.Router();

router.use("/", indexRoutes);
router.use("/auth", authRoutes);
router.use("/user", verifyAuthToken, userRoutes);
router.use("/todo", verifyAuthToken, todoRoutes);
router.use("/category", categoryRoutes);

export default router;
