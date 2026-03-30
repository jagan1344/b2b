import { Router } from 'express';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register/init', ctrl.registerInit);
router.post('/register/verify', ctrl.registerVerify);
router.post('/register/direct', ctrl.registerDirect); // New endpoint bypassing OTP
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

export default router;
