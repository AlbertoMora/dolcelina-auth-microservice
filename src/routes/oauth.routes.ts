import { Router } from 'express';
import {
    checkGoogleSessionInfoAction,
    getGoogleClientIdAction,
} from '../controllers/oauth.controller';

const router = Router();

router.get('/google/key', getGoogleClientIdAction);
router.post('/google/callback', checkGoogleSessionInfoAction);

export default router;
