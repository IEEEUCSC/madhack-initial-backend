import express from "express";
import indexRoutes from "./indexRoutes.js";

const router = express.Router();

router.use("/", indexRoutes);

export default router;
