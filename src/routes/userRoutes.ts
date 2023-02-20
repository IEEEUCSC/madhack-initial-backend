import express from "express";
import {deleteUser, getUser, updateUser, uploadAvatar} from "../controllers/userController";

const router = express.Router();

router.route("/").get(getUser).put(updateUser).delete(deleteUser);
router.route("/upload-avatar").post(uploadAvatar);

export default router;
