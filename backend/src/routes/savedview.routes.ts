import { Router } from 'express';
import * as savedViewController from '../controllers/savedview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', savedViewController.list);
router.post('/', savedViewController.create);
router.patch('/:id', savedViewController.update);
router.delete('/:id', savedViewController.remove);

export default router;