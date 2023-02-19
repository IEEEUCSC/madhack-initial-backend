import express from "express";
import {createTodo, deleteTodo, getTodoById, getTodos, updateTodo} from "../controllers/todoController";

const router = express.Router();

router.route("/").get(getTodos).post(createTodo);
router.route("/:todoId").get(getTodoById).put(updateTodo).delete(deleteTodo);

export default router;
