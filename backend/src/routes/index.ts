import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import builderRoutes from './builder.routes';
import projectRoutes from './project.routes';
import clientRoutes from './client.routes';
import leadRoutes from './lead.routes';
import userRoutes from './user.routes';
import siteVisitRoutes from './siteVisit.routes';
import notificationRoutes from './notification.routes';
import documentRoutes from './document.routes';
import invoiceRoutes from './invoice.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/builders', builderRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/leads', leadRoutes);
router.use('/users', userRoutes);
router.use('/site-visits', siteVisitRoutes);
router.use('/notifications', notificationRoutes);
router.use('/documents', documentRoutes);
router.use('/invoices', invoiceRoutes);

export default router;