import { Router } from 'express';
import * as portalController from '../controllers/portal.controller';

// Deliberately NOT behind authMiddleware — the portal token itself is the
// credential. Anyone with the exact link can view/act on that one client's data.
const router = Router();

router.get('/:token', portalController.getPortal);
router.post('/:token/favorites', portalController.addFavorite);
router.delete('/:token/favorites/:propertyId', portalController.removeFavorite);
router.post('/:token/site-visits/:visitId/confirm', portalController.confirmVisit);

export default router;