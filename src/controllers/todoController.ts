import {NextFunction, Request, Response} from "express";
import Joi from "joi";
import Todo from "../models/Todo";
import createError from "http-errors";
import joiConf from "../shared/joiConf";
import db from "../db";
import moment from "moment";
import {QueryResult} from "pg";

export const getTodos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;

    const teamId = req.get("X-API-Key") || "";

    const result = await db.query('SELECT * FROM todo WHERE user_id=$1 AND team_id=$2', [userId, teamId]);
    if (result.rowCount === 0 || result.rows.length === 0)
      return res.status(200).json([]);

    const todos = result.rows.map((todo: Todo) => ({
      "todoId": todo.todo_id,
      "title": todo.title,
      "notes": todo.notes,
      "createdDt": moment(todo.created_dt).format("YYYY-MM-DD HH:mm:ss"),
      "dueDt": moment(todo.due_dt).format("YYYY-MM-DD HH:mm:ss"),
      "isReminderEnabled": todo.is_reminder_enabled,
      "isCompleted": todo.is_completed,
      "lastModifiedDt": moment(todo.last_modified_dt).format("YYYY-MM-DD HH:mm:ss"),
      "categoryId": todo.category_id,
      "userId": todo.user_id,
    }));

    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
}

export const getTodoById = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.body.user.userId;
    const {todoId} = req.params;

    const schema = Joi.object({
      todoId: Joi.string().required()
    });

    const {error} = schema.validate({todoId}, joiConf);
    if (error)
      return next(createError(400, error.details[0].message));

    const teamId = req.get("X-API-Key") || "";
    const result: QueryResult<Todo> = await db.query('SELECT * FROM todo WHERE todo_id=$1 AND team_id=$2 AND user_id=$3', [todoId, teamId, userId]);

    if (result.rowCount === 0 || result.rows.length === 0)
      return next(createError(404, "Todo not found"));

    const todo = result.rows[0];
    res.status(200).json({
      "todoId": todo.todo_id,
      "title": todo.title,
      "notes": todo.notes,
      "createdDt": moment(todo.created_dt).format("YYYY-MM-DD HH:mm:ss"),
      "dueDt": moment(todo.due_dt).format("YYYY-MM-DD HH:mm:ss"),
      "isReminderEnabled": todo.is_reminder_enabled,
      "isCompleted": todo.is_completed,
      "lastModifiedDt": moment(todo.last_modified_dt).format("YYYY-MM-DD HH:mm:ss"),
      "categoryId": todo.category_id
    });

  } catch (error) {
    next(error);
  }
}


export const createTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;

    const {
      todoId,
      title,
      notes,
      createdDt,
      dueDt,
      isReminderEnabled,
      isCompleted,
      lastModifiedDt,
      categoryId
    } = req.body;

    const schema = Joi.object({
      todoId: Joi.string().lowercase().required(),
      title: Joi.string().required(),
      notes: Joi.string(),
      createdDt: Joi.string().required(),
      dueDt: Joi.string(),
      isReminderEnabled: Joi.boolean().required(),
      isCompleted: Joi.boolean().required(),
      lastModifiedDt: Joi.string().required(),
      categoryId: Joi.string().lowercase().required(),
    });

    const {error} = schema.validate({
        todoId,
        title,
        notes,
        createdDt,
        dueDt,
        isReminderEnabled,
        isCompleted,
        lastModifiedDt,
        categoryId
      },
      joiConf);
    if (error)
      return next(createError(400, error.details[0].message));

    const teamId = req.get("X-API-Key") || "";

    const params = [todoId, title, notes, createdDt, dueDt, isReminderEnabled, isCompleted, lastModifiedDt, userId, categoryId, teamId];
    const result: QueryResult<Todo> = await db.query("INSERT INTO todo (todo_id, title, notes, created_dt, due_dt, is_reminder_enabled, is_completed, last_modified_dt, user_id, category_id, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", params);

    if (result.rowCount === 0)
      return next(createError(500, "Error creating todo"));

    res.status(201).json({"message": "Todo added successfully"});

  } catch (error) {
    next(error);
  }
}

export const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.user.userId;
    const {todoId} = req.params;

    const {title, notes, createdDt, dueDt, isReminderEnabled, isCompleted, lastModifiedDt, categoryId} = req.body;

    const schema = Joi.object({
      title: Joi.string().required(),
      notes: Joi.string(),
      createdDt: Joi.string().required(),
      dueDt: Joi.string(),
      isReminderEnabled: Joi.boolean().required(),
      isCompleted: Joi.boolean().required(),
      lastModifiedDt: Joi.string().required(),
      categoryId: Joi.string().lowercase().required(),
      todoId: Joi.string().lowercase().required()
    });

    const {error} = schema.validate({
      title,
      notes,
      createdDt,
      dueDt,
      isReminderEnabled,
      isCompleted,
      lastModifiedDt,
      categoryId,
      todoId,
    }, joiConf);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const teamId = req.get("X-API-Key") || "";

    const params = [title, notes, createdDt, dueDt, isReminderEnabled, isCompleted, lastModifiedDt, categoryId, todoId, teamId, userId];
    const result: QueryResult<Todo> = await db.query('UPDATE todo SET title=$1, notes=$2, created_dt=$3, due_dt=$4, is_reminder_enabled=$5, is_completed=$6, last_modified_dt=$7, category_id=$8 WHERE todo_id=$9 AND team_id=$10 AND user_id=$11', params);
    if (result.rowCount === 0)
      return next(createError(404, "Todo not found"));

    res.status(200).json({"message": "Todo updated successfully"});

  } catch (error) {
    next(error);
  }
}

export const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {todoId} = req.params;
    const userId = req.body.user.userId;
    const teamId = req.get("X-API-Key") || "";

    const schema = Joi.object({
      todoId: Joi.string().lowercase().required()
    });

    const {error} = schema.validate({todoId}, joiConf);
    if (error)
      return next(createError(400, error.details[0].message));

    const result: QueryResult<Todo> = await db.query('DELETE FROM todo WHERE todo_id=$1 AND team_id=$2 AND user_id=$3', [todoId, teamId, userId]);
    if (result.rowCount === 0)
      return next(createError(404, "Todo not found"));

    res.status(200).json({"message": "Todo deleted successfully"});
  } catch (error) {
    next(error);
  }
}

export const updateTodoStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {todoId} = req.params;
    const {isCompleted} = req.body;
    const userId = req.body.user.userId;

    const schema = Joi.object({
      todoId: Joi.string().lowercase().required(),
      isCompleted: Joi.boolean().required()
    });

    const {error} = schema.validate({todoId, isCompleted}, joiConf);
    if (error)
      return next(createError(error.details[0].message));

    const teamId = req.get("X-API-Key") || "";

    const result: QueryResult<Todo> = await db.query('UPDATE todo SET is_completed=$1 WHERE todo_id=$2 AND team_id=$3 AND user_id=$4', [isCompleted, todoId, teamId, userId]);
    if (result.rowCount === 0)
      return next(createError(404, "Todo not found"));

    res.status(200).json({"message": "Todo status updated successfully"});
  } catch (error) {
    next(error);
  }
}

