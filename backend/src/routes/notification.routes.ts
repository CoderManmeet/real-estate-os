import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;