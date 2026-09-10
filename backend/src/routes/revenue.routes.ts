// src/routes/revenue.routes.ts
import { Router } from 'express';
import * as revenueController from '../controllers/revenue.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Company-wide revenue is ADMIN/MANAGER only (D7).
router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/summary', revenueController.summary);
router.get('/commissions', revenueController.commissions);
router.get('/pending-payments', revenueController.pendingPayments);

export default router;