import { Router } from 'express';
import * as communicationController from '../controllers/communication.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', communicationController.list);
router.post('/', communicationController.create);
router.patch('/:id', communicationController.update);
router.delete('/:id', communicationController.remove);

export default router;