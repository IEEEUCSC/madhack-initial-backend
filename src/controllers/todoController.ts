import {NextFunction, Request, Response} from "express";
import Joi from "joi";
import sql, {IResult} from "mssql";
import Todo from "../models/Todo";
import createError from "http-errors";

export const getTodos = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  try {
    const teamId = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("user_id", userId);
    request.query('SELECT * FROM todo WHERE user_id=@user_id AND team_id=@team_id', async (err: Error | undefined, recordset: IResult<Todo> | undefined) => {
      if (recordset && !err) {
        res.status(200).json(recordset.recordsets[0]);
      } else {
        res.status(500).json({"message": "Error getting todos"});
      }
    });
  } catch (e) {
    next(createError());
  }
}

export const getTodoById = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;
  const {todoId} = req.query;

  const schema = Joi.object({
    todoId: Joi.string().required()
  });

  const {error} = schema.validate({todoId});
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamId = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("todo_id", todoId);
    request.input("user_id", userId);
    request.query('SELECT * FROM todo WHERE todo_id=@todo_id AND team_id=@team_id AND user_id=@user_id', async (err: Error | undefined, recordset: IResult<Todo> | undefined) => {
      if (recordset && !err) {
        res.status(200).json(recordset.recordsets[0]);
      } else {
        res.status(500).json({"message": "Error retrieving todo"});
      }
    });
  } catch (e) {
    next(createError());
  }
}


export const createTodo = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  const {todoId, title, notes, createdDt, dueDt, isCompleted, lastModifiedDt, categoryId} = req.body;

  const schema = Joi.object({
    todoId: Joi.string().required(),
    title: Joi.string().required(),
    notes: Joi.string().required(),
    createdDt: Joi.string().required(),
    dueDt: Joi.string().required(),
    isCompleted: Joi.string().required(),
    lastModifiedDt: Joi.string().required(),
    categoryId: Joi.string().required(),
  });

  const {error} = schema.validate({
    todoId,
    title,
    notes,
    createdDt,
    dueDt,
    isCompleted,
    lastModifiedDt,
    userId,
    categoryId
  });
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamId = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("todo_id", todoId);
    request.input("title", title);
    request.input("notes", notes);
    request.input("created_dt", createdDt);
    request.input("due_dt", dueDt);
    request.input("is_completed", isCompleted);
    request.input("last_modified_dt", lastModifiedDt);
    request.input("user_id", userId);
    request.input("category_id", categoryId);

    request.query('INSERT INTO todo (todo_id, title, notes, created_dt, due_dt, is_completed, last_modified_dt, user_id, category_id, team_id) VALUES (@todo_id, @title, @notes, @created_dt, @due_dt, @is_completed, @last_modified_dt, @user_id, @category_id, @team_id)', async (err: Error | undefined, recordset: IResult<Todo> | undefined) => {
      if (recordset && !err) {
        res.status(201).json({"message": "Todo added successfully"});
      } else {
        next(createError(500, "Error adding todo"));
      }
    });
  } catch (e) {
    next(createError());
  }
}

export const updateTodo = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.user.userId;

  const {todoId, title, notes, createdDt, dueDt, isCompleted, lastModifiedDt, categoryId} = req.body;

  const schema = Joi.object({
    todoId: Joi.string().required(),
    title: Joi.string().required(),
    notes: Joi.string().required(),
    createdDt: Joi.string().required(),
    dueDt: Joi.string().required(),
    isCompleted: Joi.string().required(),
    lastModifiedDt: Joi.string().required(),
    categoryId: Joi.string().required(),
  });

  const {error} = schema.validate({
    todoId,
    title,
    notes,
    createdDt,
    dueDt,
    isCompleted,
    lastModifiedDt,
    categoryId
  });
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamId = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("todo_id", todoId);
    request.input("title", title);
    request.input("notes", notes);
    request.input("created_dt", createdDt);
    request.input("due_dt", dueDt);
    request.input("is_completed", isCompleted);
    request.input("last_modified_dt", lastModifiedDt);
    request.input("user_id", userId);
    request.input("category_id", categoryId);

    request.query('UPDATE todo SET title=@title, notes=@notes, created_dt=@created_dt, due_dt=@due_dt, is_completed=@is_completed, last_modified_dt=@last_modified_dt, category_id=@category_id WHERE todo_id=@todo_id AND team_id=@team_id AND user_id=@user_id', async (err: Error | undefined, recordset: IResult<Todo> | undefined) => {
      if (recordset && !err) {
        res.status(200).json({"message": "Todo updated successfully"});
      } else {
        next(createError(500, "Error updating todo"));
      }
    });
  } catch (e) {
    next(createError());
  }
}

export const deleteTodo = (req: Request, res: Response, next: NextFunction) => {
  const {todoId} = req.query;
  const userId = req.body.user.userId;

  const schema = Joi.object({
    todoId: Joi.string().required()
  });

  const {error} = schema.validate({todoId});
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  try {
    const teamId = req.get("Team-Token") || "";

    let request = new sql.Request();
    request.input("team_id", teamId);
    request.input("todo_id", todoId);
    request.input("user_id", userId);
    request.query('DELETE FROM todo WHERE todo_id=@todo_id AND team_id=@team_id AND user_id=@user_id', async (err: Error | undefined, recordset: IResult<Todo> | undefined) => {
      if (recordset && !err) {
        res.status(200).json({"message": "Todo deleted successfully"});
      } else {
        next(createError(500, "Error deleting todo"));
      }
    });
  } catch (e) {
    next(createError());
  }
}
