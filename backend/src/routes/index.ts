import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import builderRoutes from './builder.routes';
import projectRoutes from './project.routes';
import clientRoutes from './client.routes';
import leadRoutes from './lead.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/builders', builderRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/leads', leadRoutes);
router.use('/users', userRoutes);

export default router;