import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', invoiceController.list);
router.post('/', invoiceController.create);
router.get('/:id', invoiceController.getOne);
router.patch('/:id', invoiceController.update);
router.delete('/:id', invoiceController.remove);

export default router;