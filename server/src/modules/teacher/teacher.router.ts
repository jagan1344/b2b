import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as ctrl from './teacher.controller';

const router = Router();
router.use(authMiddleware);

router.get('/me', ctrl.getMe);
router.patch('/me', ctrl.updateMe);
router.get('/all', ctrl.getAllTeachers); // principal only for assigning

export default router;
