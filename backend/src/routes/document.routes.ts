import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/property/:propertyId', documentController.listByProperty);
router.delete('/:id', documentController.remove);

export default router;