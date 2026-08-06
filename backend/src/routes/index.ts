import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);

export default router;