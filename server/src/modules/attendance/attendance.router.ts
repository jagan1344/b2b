import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as ctrl from './attendance.controller';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', ctrl.getAttendance);
router.post('/', ctrl.submitAttendance);
router.patch('/:recordId', ctrl.updateAttendance);
router.get('/summary', ctrl.getAttendanceSummary);

export default router;
