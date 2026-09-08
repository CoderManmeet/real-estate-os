import { Router } from 'express';
import * as followUpController from '../controllers/followup.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', followUpController.list);
router.post('/', followUpController.create);
router.patch('/:id', followUpController.update);
router.delete('/:id', followUpController.remove);

export default router;