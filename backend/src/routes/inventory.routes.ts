import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/bulk-update', inventoryController.bulkUpdateStatus);
router.get('/projects/:id', inventoryController.projectInventory);

export default router;