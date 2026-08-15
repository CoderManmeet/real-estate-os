// import { Router } from 'express';
// import { register, login, refresh, logout, me } from '../controllers/auth.controller';
// import { authMiddleware } from '../middlewares/auth.middleware';

// const router = Router();

// router.post('/register', register);
// router.post('/login', login);
// router.post('/refresh', refresh);
// router.post('/logout', logout);
// router.get('/me', authMiddleware, me);

// export default router;


import { Router } from 'express';
import { register, login, refresh, logout, me, updateMe, changeMyPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateMe);
router.post('/change-password', authMiddleware, changeMyPassword);

export default router;