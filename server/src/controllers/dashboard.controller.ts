import { Request, Response, NextFunction } from 'express'
import { dashboardService } from '../services/dashboard.service.js'

export const dashboardController = {
  async getData(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDashboardData()
      res.json({ data })
    } catch (error) {
      next(error)
    }
  },
}
