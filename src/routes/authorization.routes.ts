import { Router } from 'express';
import { checkTokenMiddleware, controllerHandler } from '@amora95/commons';
import { checkPermissionAction } from '../controllers/authorization.controller';

const router = Router();

router.post('/check-permission', checkTokenMiddleware, controllerHandler(checkPermissionAction));

export default router;
