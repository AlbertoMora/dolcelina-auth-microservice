import { controllerHandler } from '@aure/commons';
import { Router } from 'express';
import {
    banUserAction,
    deleteUserAction,
    getUserByIdAction,
    getUsersByName,
    updateUserAction,
} from '../controllers/users.controller';

const router = Router();

router.get('/', controllerHandler(getUsersByName));
router.get('/:id', controllerHandler(getUserByIdAction));
router.put('/:id', controllerHandler(updateUserAction));
router.delete('/:id', controllerHandler(deleteUserAction));
router.delete('/:id/ban', controllerHandler(banUserAction));

export default router;
