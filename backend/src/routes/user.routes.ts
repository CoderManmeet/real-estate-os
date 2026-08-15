// import { Router } from 'express';
// import { list } from '../controllers/user.controller';
// import { authMiddleware } from '../middlewares/auth.middleware';

// const router = Router();

// router.use(authMiddleware);
// router.get('/', list);

// export default router;

import { Router } from 'express';
import { list, updateRole, deactivate } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', list);
router.patch('/:id/role', requireRole('ADMIN'), updateRole);
router.delete('/:id', requireRole('ADMIN'), deactivate);

export default router;