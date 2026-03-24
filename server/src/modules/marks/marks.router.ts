import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as ctrl from './marks.controller';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', ctrl.getMarks);
router.post('/', ctrl.addMark);
router.patch('/:markId', ctrl.updateMark);
router.delete('/:markId', ctrl.deleteMark);

export default router;
