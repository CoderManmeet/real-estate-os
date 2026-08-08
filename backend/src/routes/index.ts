import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import builderRoutes from './builder.routes';
import projectRoutes from './project.routes';
import clientRoutes from './client.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/builders', builderRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);

export default router;