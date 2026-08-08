import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/sources', leadController.listSources);
router.post('/sources', leadController.createSource);

router.get('/board', leadController.board);

router.get('/', leadController.list);
router.post('/', leadController.create);
router.get('/:id', leadController.getOne);
router.patch('/:id', leadController.update);
router.delete('/:id', leadController.remove);

router.post('/:id/activities', leadController.addActivity);
router.post('/:id/tasks', leadController.addTask);
router.patch('/:id/tasks/:taskId', leadController.updateTask);
router.delete('/:id/tasks/:taskId', leadController.deleteTask);

export default router;