import express from 'express';
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
