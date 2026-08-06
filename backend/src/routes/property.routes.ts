import { Router } from 'express';
import { create, list, getOne, update, remove } from '../controllers/property.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:id', getOne);
router.post('/', requireRole('ADMIN', 'MANAGER', 'AGENT'), create);
router.patch('/:id', requireRole('ADMIN', 'MANAGER', 'AGENT'), update);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), remove);

export default router;