// src/routes/dealDocument.routes.ts
import { Router } from 'express';
import * as dealDocumentController from '../controllers/dealDocument.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), dealDocumentController.upload);
router.get('/deal/:dealId', dealDocumentController.listByDeal);
router.delete('/:id', dealDocumentController.remove);

export default router;