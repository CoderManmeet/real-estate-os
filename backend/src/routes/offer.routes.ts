// src/routes/offer.routes.ts
import { Router } from 'express';
import * as offerController from '../controllers/offer.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', offerController.list);
router.post('/', offerController.create);
router.get('/:id', offerController.getOne);
router.patch('/:id', offerController.update);
router.delete('/:id', offerController.remove);

export default router;