import { controllerHandler } from '@amora95/commons';
import { Router } from 'express';
import {
    banUserAction,
    deleteUserAction,
    getUserByIdAction,
    getUsersByName,
    toggleAdminAction,
    updatePasswordAction,
    updateUserAction,
} from '../controllers/users.controller';

const router = Router();

router.put('/password', controllerHandler(updatePasswordAction));
router.get('/', controllerHandler(getUsersByName));
router.get('/:id', controllerHandler(getUserByIdAction));
router.put('/:id', controllerHandler(updateUserAction));
router.put('/:id/toggle-admin', controllerHandler(toggleAdminAction));
router.delete('/:id', controllerHandler(deleteUserAction));
router.delete('/:id/ban', controllerHandler(banUserAction));

export default router;
