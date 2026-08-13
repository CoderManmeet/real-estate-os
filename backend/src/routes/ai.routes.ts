import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { search, summary } from '../controllers/ai.controller';

const router = Router();

router.use(authMiddleware);

router.post('/search', search);
router.post('/summary/:propertyId', summary);

export default router;