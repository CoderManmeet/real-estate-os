// src/routes/deal.routes.ts
import { Router } from 'express';
import * as dealController from '../controllers/deal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', dealController.list);
router.post('/', dealController.create);
router.get('/:id', dealController.getOne);
router.patch('/:id', dealController.update);
router.patch('/:id/stage', dealController.transition);
router.delete('/:id', dealController.remove);

export default router;