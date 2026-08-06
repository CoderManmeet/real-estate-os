import { Router } from 'express';
import { create, list, getOne, update, remove } from '../controllers/builder.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:id', getOne);
router.post('/', requireRole('ADMIN', 'MANAGER'), create);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), update);
router.delete('/:id', requireRole('ADMIN'), remove);

export default router;