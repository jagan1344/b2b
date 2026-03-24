import { Router } from 'express';
import { authMiddleware, principalOnly } from '../../middleware/auth';
import * as ctrl from './course.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.getCourses);
router.get('/:courseId', ctrl.getCourseById);
router.post('/', principalOnly, ctrl.createCourse);
router.post('/:courseId/assign-teacher', principalOnly, ctrl.assignTeacher);
router.post('/:courseId/subjects', ctrl.addSubject);

export default router;
