import express from "express";
import {getUser, updateUser, uploadAvatar} from "../controllers/userController";
const router = express.Router();

router.route("/:id").get(getUser).put(updateUser);
router.route("/upload-avatar").post(uploadAvatar);

export default router;
