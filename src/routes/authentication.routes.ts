import { Router } from 'express';
// import {
//     checkAccessTokenAction,
//     checkLoginChallengeAction,
//     checkMfaAction,
//     loginAction,
//     refreshSessionAction,
//     signUpAction,
//     signOutAction,
// } from '../controllers/authentication.controller';
import { controllerHandler } from '@aure/commons';

const router = Router();

// router.post('/login', controllerHandler(loginAction));
// router.post('/login-challenge', controllerHandler(checkLoginChallengeAction));
// router.post('/check-mfa', controllerHandler(checkMfaAction));
// router.post('/signup', controllerHandler(signUpAction));
// router.post('/check-session-token', controllerHandler(checkAccessTokenAction));
// router.post('/refresh-session', controllerHandler(refreshSessionAction));
// router.delete('/signout', signOutAction);

export default router;
