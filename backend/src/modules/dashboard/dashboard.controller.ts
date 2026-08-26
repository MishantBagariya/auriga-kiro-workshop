import type { Request, Response } from 'express';
import * as dashboardService from './dashboard.service.js';

export async function summary(req: Request, res: Response): Promise<void> {
  const recentLimit = req.query.recentLimit ? Number(req.query.recentLimit) : undefined;
  const upcomingLimit = req.query.upcomingLimit ? Number(req.query.upcomingLimit) : undefined;
  const data = await dashboardService.getDashboardSummary({ recentLimit, upcomingLimit });
  res.status(200).json({ data });
}
