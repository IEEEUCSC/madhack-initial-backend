import express from "express";
import {getUser, uploadAvatar} from "../controllers/userController";
const router = express.Router();

router.route("/").get(getUser);
router.route("/upload-avatar").post(uploadAvatar);

export default router;
