import { Router } from 'express';
import { getStats, getRecentTasks, getUpcomingTasks } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getStats);
router.get('/recent', getRecentTasks);
router.get('/upcoming', getUpcomingTasks);

export default router;
