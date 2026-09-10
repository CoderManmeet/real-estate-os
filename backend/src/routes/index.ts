import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import builderRoutes from './builder.routes';
import projectRoutes from './project.routes';
import clientRoutes from './client.routes';
import leadRoutes from './lead.routes';
import followUpRoutes from './followup.routes';
import userRoutes from './user.routes';
import siteVisitRoutes from './siteVisit.routes';
import notificationRoutes from './notification.routes';
import documentRoutes from './document.routes';
import invoiceRoutes from './invoice.routes';
import analyticsRoutes from './analytics.routes';
import portalRoutes from './portal.routes';
import inventoryRoutes from './inventory.routes';
import aiRoutes from './ai.routes';
import collectionRoutes from './collection.routes';
import searchRoutes from './search.routes';
import bulkRoutes from './bulk.routes';
import savedViewRoutes from './savedview.routes';
import communicationRoutes from './communication.routes';
import ownerRoutes from './owner.routes';
import offerRoutes from './offer.routes';
import dealRoutes from './deal.routes';
import paymentRoutes from './payment.routes';
import commissionRoutes from './commission.routes';
import dealDocumentRoutes from './dealDocument.routes';
import revenueRoutes from './revenue.routes';




const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/builders', builderRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/leads', leadRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/users', userRoutes);
router.use('/site-visits', siteVisitRoutes);
router.use('/notifications', notificationRoutes);
router.use('/documents', documentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/portal', portalRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/search', searchRoutes);
router.use('/bulk', bulkRoutes);
router.use('/saved-views', savedViewRoutes);
router.use('/communications', communicationRoutes);
router.use('/owners', ownerRoutes);
router.use('/offers', offerRoutes);
router.use('/deals', dealRoutes);
router.use('/payments', paymentRoutes);
router.use('/commissions', commissionRoutes);
router.use('/deal-documents', dealDocumentRoutes);
router.use('/revenue', revenueRoutes);
router.use('/ai', aiRoutes);
router.use('/collections', collectionRoutes);


export default router;