import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as ctrl from './student.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', ctrl.getStudents);
router.post('/', ctrl.addStudent);
router.delete('/:studentId', ctrl.removeStudent);
router.post('/upload', upload.single('file'), ctrl.bulkUpload);

export default router;
