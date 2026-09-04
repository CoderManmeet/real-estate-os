import { Router } from 'express';
import * as portalController from '../controllers/portal.controller';

// Deliberately NOT behind authMiddleware -- the portal token itself is the
// credential. Anyone with the exact link can view/act on that one client's data.
// Expiry/revocation is enforced inside portal.service.ts.
const router = Router();

// Collection portal (read). Two-segment path -- declared before "/:token" so the
// single-segment param route below never captures "collection".
router.get('/collection/:token', portalController.getCollection);

// Legacy client-token portal (read).
router.get('/:token', portalController.getPortal);

// Actions -- ":token" here accepts a client portalToken OR a collection accessToken.
router.post('/:token/favorites', portalController.addFavorite);
router.delete('/:token/favorites/:propertyId', portalController.removeFavorite);
router.post('/:token/feedback', portalController.setFeedback);
router.post('/:token/comments', portalController.addComment);
router.post('/:token/track', portalController.track);
router.post('/:token/site-visit-requests', portalController.requestVisit);
router.post('/:token/site-visits/:visitId/confirm', portalController.confirmVisit);

export default router;