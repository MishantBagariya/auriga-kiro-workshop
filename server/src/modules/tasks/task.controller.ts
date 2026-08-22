import { RequestHandler } from "express";
import * as taskService from "./task.service";
import { TaskQueryInput } from "./task.schema";

export const listTasks: RequestHandler = async (req, res, next) => {
  try {
    const query = (req as any).validatedQuery as TaskQueryInput;
    const tasks = await taskService.listTasks(query);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
