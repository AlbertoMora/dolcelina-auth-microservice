import { controllerHandler } from '@aure/commons';
import { Router } from 'express';
import { getUsersByName } from '../controllers/users.controller';

const router = Router();

router.get('/', controllerHandler(getUsersByName));

export default router;
