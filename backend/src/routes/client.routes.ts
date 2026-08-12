import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
// import * as clientController from '../controllers/client.controller';


const router = Router();

router.use(authMiddleware);

router.get('/', clientController.list);
router.post('/', clientController.create);
router.get('/:id', clientController.getOne);
router.patch('/:id', clientController.update);
router.delete('/:id', clientController.remove);

router.post('/:id/requirements', clientController.addRequirement);
router.post('/:id/notes', clientController.addNote);
router.post('/:id/timeline', clientController.addTimelineEvent);

router.post('/:id/favorites', clientController.addFavorite);
router.delete('/:id/favorites/:propertyId', clientController.removeFavorite);

router.post('/:id/shared-properties', clientController.shareProperty);
router.get('/:id/portal-link', clientController.getPortalLink);

export default router;