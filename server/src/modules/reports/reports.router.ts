import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as ctrl from './reports.controller';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/pdf', ctrl.generatePdf);
router.get('/excel', ctrl.generateExcel);

export default router;
