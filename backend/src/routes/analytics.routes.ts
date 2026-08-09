import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/overview', analyticsController.overview);
router.get('/inventory', analyticsController.inventory);
router.get('/lead-funnel', analyticsController.leadFunnel);
router.get('/revenue-by-month', analyticsController.revenueByMonth);
router.get('/builder-performance', analyticsController.builderPerformance);
router.get('/conversion-rate', analyticsController.conversionRate);

export default router;