import {
    dbConstants,
    getTokenData,
    httpCodes,
    IGoogleOAuthClientSecrets,
    OpenbaoVaultClient,
    responseCodes,
    sendClientError,
    sendOkResponse,
    sendServerError,
    webConstants,
    webErrors,
} from '@aure/commons';
import { Request, Response } from 'express';
import {
    IGoogleOAuthResponse,
    IGoogleOAuthTokenInfo,
    IGoogleSessionViewModel,
} from '../viewmodels/oauth.viewmodels';
import axios from 'axios';
import { user } from '../models/mariadb/user';
import { SequelizeService } from '../services/sequelize-service';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { getBasicWebData } from '../utils/webclient-helper';
import Session from '../models/mongoose/Session';
import { Types } from 'mongoose';
import { sendLoginTokens } from './authentication.controller';
import { getLocationPattern } from '../utils/geo-helper';
import { googleOauthKey } from '../constants/secrets-contants';

const googleApiUrl = 'https://oauth2.googleapis.com/';
const defaultCallbackUri = 'http://localhost:3000/auth/google/callback';

export const getGoogleClientIdAction = async (req: Request, res: Response) => {
    try {
        const secretsManager = OpenbaoVaultClient.getInstance();
        const googleOAuthSecrets =
            await secretsManager.getSecret<IGoogleOAuthClientSecrets>(googleOauthKey);
        if (!googleOAuthSecrets.clientId)
            return sendClientError(webErrors.srv01, res, httpCodes.not_found, {
                status: responseCodes.serverError,
            });

        return sendOkResponse(
            {
                clientId: googleOAuthSecrets.clientId,
            },
            res,
        );
    } catch (e) {
        return sendServerError(e, res, webErrors.srv01);
    }
};

export const checkGoogleSessionInfoAction = async (
    req: Request<{}, {}, IGoogleSessionViewModel, {}>,
    res: Response,
) => {
    const { code } = req.body;
    const { userIp, userOs, userAgent } = getBasicWebData(req);
    try {
        const secretsManager = OpenbaoVaultClient.getInstance();
        const googleOAuthSecrets =
            await secretsManager.getSecret<IGoogleOAuthClientSecrets>(googleOauthKey);
        if (code === 'test') return sendOkResponse({}, res);
        const { data } = await axios.post<IGoogleOAuthResponse>(`${googleApiUrl}/token`, {
            code,
            client_id: googleOAuthSecrets.clientId,
            client_secret: googleOAuthSecrets.secretKey,
            redirect_uri: defaultCallbackUri,
            grant_type: 'authorization_code',
        });

        if (!data?.id_token) return sendClientError(webErrors.auth03, res, httpCodes.bad_request);

        const info = getTokenData<IGoogleOAuthTokenInfo>(data.id_token);

        const newUser = await findOrCreateUser(info);
        const session = await createUserSession(newUser, userIp, userOs, userAgent);

        return sendLoginTokens(session, newUser, res);
    } catch (e) {
        return sendServerError(e, res, webErrors.srv01);
    }
};

const findOrCreateUser = async (info: IGoogleOAuthTokenInfo): Promise<user> => {
    const { email, family_name, given_name, picture } = info;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findOne({ where: { email } });

    if (foundUser) return foundUser;

    const base = email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
    const username = `${base}${uuid().split('-')[0]}`;
    const newUser = await sequelize.db.user.create({
        id: uuid(),
        email,
        username,
        name: given_name,
        lastname: family_name,
        password: dbConstants.status.pending,
        prof_pic: picture,
        is_active: 1,
        created_at: moment().utc().toDate(),
        last_modified: moment().utc().toDate(),
    });
    return newUser;
};

const createUserSession = async (user: user, ip?: string, os?: string, agent?: string) => {
    const location = getLocationPattern(ip);
    const currentSession = await Session.create({
        _id: new Types.ObjectId(),
        userId: user.id,
        deviceId: dbConstants.status.pending,
        deviceOS: os === webConstants.commonValues.unknown ? agent : os,
        sessionIP: ip,
        isActive: true,
        location: location,
        signedInSince: moment().toDate(),
    });
    return currentSession;
};
