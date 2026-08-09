import { Router } from 'express';
import * as siteVisitController from '../controllers/siteVisit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', siteVisitController.list);
router.post('/', siteVisitController.create);
router.get('/:id', siteVisitController.getOne);
router.patch('/:id', siteVisitController.update);
router.delete('/:id', siteVisitController.remove);

router.post('/:id/confirm-client', siteVisitController.confirmClient);
router.post('/:id/confirm-builder', siteVisitController.confirmBuilder);

export default router;