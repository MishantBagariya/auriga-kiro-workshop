import { Request, Response, NextFunction } from 'express'
import { taskService } from '../services/task.service.js'
import type { TaskQueryInput } from 'shared'

export const taskController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as TaskQueryInput
      const tasks = await taskService.findAll(query)
      res.json({ data: tasks })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.params.id)
      if (!task) {
        return res.status(404).json({
          error: { message: 'Task not found', code: 'NOT_FOUND' },
        })
      }
      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.body)
      res.status(201).json({ data: task })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id, req.body)
      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateStatus(req.params.id, req.body.status)
      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
