// src/routes/commission.routes.ts
import { Router } from 'express';
import * as commissionController from '../controllers/commission.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Commission figures are company financials: ADMIN/MANAGER only (D7).
router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/', commissionController.list);
router.post('/', commissionController.upsert);
router.get('/deal/:dealId', commissionController.getByDeal);
router.patch('/:id', commissionController.update);
router.delete('/:id', commissionController.remove);

export default router;