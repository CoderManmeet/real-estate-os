import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', collectionController.list);
router.post('/', collectionController.create);
router.get('/:id', collectionController.getOne);
router.patch('/:id', collectionController.update);
router.post('/:id/properties', collectionController.addProperty);
router.delete('/:id/properties/:propertyId', collectionController.removeProperty);
router.post('/:id/revoke', collectionController.revoke);
router.post('/:id/regenerate', collectionController.regenerate);

export default router;