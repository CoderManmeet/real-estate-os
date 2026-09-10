// src/routes/owner.routes.ts
import { Router } from 'express';
import * as ownerController from '../controllers/owner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ownerController.list);
router.post('/', ownerController.create);
router.get('/:id', ownerController.getOne);
router.patch('/:id', ownerController.update);
router.delete('/:id', ownerController.remove);
router.post('/:id/properties', ownerController.linkProperty);
router.delete('/:id/properties/:propertyId', ownerController.unlinkProperty);

export default router;