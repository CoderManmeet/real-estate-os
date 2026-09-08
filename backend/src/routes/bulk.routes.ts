import { Router } from 'express';
import * as bulkController from '../controllers/bulk.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.post('/leads', bulkController.bulkLeads);
router.post('/clients', bulkController.bulkClients);

export default router;