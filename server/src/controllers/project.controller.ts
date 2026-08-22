import { Request, Response, NextFunction } from 'express'
import { projectService } from '../services/project.service.js'

export const projectController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.findAll()
      res.json({ data: projects })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.findById(req.params.id)
      if (!project) {
        return res.status(404).json({
          error: { message: 'Project not found', code: 'NOT_FOUND' },
        })
      }
      res.json({ data: project })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.create(req.body)
      res.status(201).json({ data: project })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.update(req.params.id, req.body)
      res.json({ data: project })
    } catch (error) {
      next(error)
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
