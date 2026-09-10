// src/routes/payment.routes.ts
import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', paymentController.list);
router.post('/', paymentController.create);
router.patch('/:id', paymentController.update);
router.delete('/:id', paymentController.remove);

export default router;