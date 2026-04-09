import { Request, Response } from 'express';
import { UserViewModel } from '../viewmodels/user.viewmodel';
import { v4 as uuid } from 'uuid';
import argon from 'argon2';
import { redisClient } from '../config/db-config';
import {
    createJWT,
    dbConstants,
    getNewCode,
    getSafeMail,
    getTokenData,
    getTokenInfo,
    httpCodes,
    responseCodes,
    sendClientError,
    sendOkResponse,
    verifySpkiSignature,
    webConstants,
    webErrors,
} from '@aure/commons';
import moment from 'moment';
import { user } from '../models/mariadb/user';
import { deviceConstants } from '../constants/device-constants';
import Session, { ISession } from '../models/mongoose/Session';
import { Op } from 'sequelize';
import { Types } from 'mongoose';
import { getBasicWebData } from '../utils/webclient-helper';
import { getLocationPattern } from '../utils/geo-helper';
import { ICheckChallengeViewModel } from '../viewmodels/login.viewmodel';
import MfaModel, { IMfa } from '../models/mongoose/MFA';
import { IMFAViewModel } from '../viewmodels/mfa.viewmodel';
import { IUserSession } from '../types/commons.types';
import { IRefreshToken } from '../types/web-types';
import { SequelizeService } from '../services/sequelize-service';

export const loginAction = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { userIp, userOs, userAgent } = getBasicWebData(req);

    const sequelize = await SequelizeService.getInstance();
    const user = await sequelize.db.user.findOne({
        where: {
            [Op.or]: {
                username: username,
                email: username,
            },
        },
    });
    if (!user) return sendClientError(webErrors.auth02, res, httpCodes.bad_request);

    if (await isUserBanned(user.id))
        return sendClientError(webErrors.auth08, res, httpCodes.bad_request);

    const isPassOk = await argon.verify(user.password, password);

    if (!isPassOk) return sendClientError(webErrors.auth02, res, httpCodes.bad_request);

    const currentSession = await Session.create({
        _id: new Types.ObjectId(),
        userId: user.id,
        deviceId: dbConstants.status.pending,
        deviceOS: userOs === webConstants.commonValues.unknown ? userAgent : userOs,
        sessionIP: userIp,
        isActive: true,
        location: location,
        signedInSince: moment().toDate(),
    });

    const tokens = await getLoginTokens(user, currentSession.id);

    if (!tokens) return sendClientError(webErrors.auth02, res, httpCodes.bad_request);

    sendOkResponse({ status: responseCodes.ok, ...tokens }, res);
};

export const checkMfaAction = async (req: Request<{}, {}, IMFAViewModel, {}>, res: Response) => {
    const { code, sessionId, shouldDeviceSafe } = req.body;
    const attempts = await getCurrentMfaAttempt(sessionId);

    const session = await Session.findById(sessionId);
    if (!session)
        return sendClientError(webErrors.auth14, res, httpCodes.bad_request, { attempts });

    const mfa = await MfaModel.findOne({
        sessionId: session.id,
        used: false,
        dueDate: { $gt: moment().toDate() },
    });
    if (!mfa)
        return sendClientError({ ...webErrors.auth14 }, res, httpCodes.bad_request, { attempts });

    const isCodeOk = await argon.verify(mfa.code, code);

    if (isCodeOk) {
        MfaTokenSendOkResponse(session, res);
    } else {
        sendClientError(webErrors.auth14, res, httpCodes.bad_request, { attempts });
    }
};

export const signUpAction = async (req: Request<{}, {}, UserViewModel, {}>, res: Response) => {
    const { name, lastname, username, password, email } = req.body;
    const { userIp, userOs, userAgent } = getBasicWebData(req);
    const location = getLocationPattern(userIp);
    const id = uuid();
    const pass = await argon.hash(password);

    const sequelize = await SequelizeService.getInstance();
    const newUser = await sequelize.db.user.create({
        id,
        name,
        lastname,
        username,
        email,
        password: pass,
        is_active: 1,
        created_at: moment().utc().toDate(),
        last_modified: moment().utc().toDate(),
    });
    const currentSession = await Session.create({
        _id: new Types.ObjectId(),
        userId: newUser.id,
        deviceId: dbConstants.status.pending,
        deviceOS: userOs === webConstants.commonValues.unknown ? userAgent : userOs,
        sessionIP: userIp,
        isActive: true,
        location: location,
        signedInSince: moment().toDate(),
    });
    await newUser.save();

    sendLoginTokens(currentSession, newUser, res);
};

export const checkAccessTokenAction = async (req: Request, res: Response) => {
    const [, accessToken] = req.headers.authorization?.split(' ') ?? [];
    if (!accessToken) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);
    const tokenData = (await getTokenInfo(accessToken)) as IUserSession | undefined;

    if (!tokenData) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const sequelize = await SequelizeService.getInstance();
    const user = await sequelize.db.user.findByPk(tokenData.user.id);
    const currentSession = await Session.findById(tokenData.sessionId);

    if (!user || !currentSession?.isActive)
        return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const isBanned = await isUserBanned(user.id);

    if (isBanned) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    return sendOkResponse({ status: responseCodes.ok }, res);
};

export const refreshSessionAction = async (req: Request, res: Response) => {
    const { userIp, userOs } = getBasicWebData(req);
    const location = getLocationPattern(userIp);
    const sequelize = await SequelizeService.getInstance();

    const [, refreshToken] = req.headers.authorization?.split(' ') ?? [];
    if (!refreshToken) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const tokenData = (await getTokenInfo(refreshToken)) as IRefreshToken;

    const user = await sequelize.db.user.findByPk(tokenData.userId);
    const isBanned = await isUserBanned(tokenData.userId);

    if (!user || isBanned) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const currentSession = await Session.findById(tokenData.sessionId);

    if (!currentSession?.isActive)
        return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    return sendLoginTokens(currentSession, user, res);
};

export const signOutAction = async (req: Request, res: Response) => {
    const [, accessToken] = req.headers.authorization?.split(' ') ?? [];
    if (!accessToken) return sendClientError(webErrors.auth15, res, httpCodes.bad_request);

    const tokenData = getTokenData<IUserSession>(accessToken);
    if (!tokenData) return sendClientError(webErrors.auth15, res, httpCodes.bad_request);

    const currentSession = await Session.findById(tokenData.sessionId);

    if (!currentSession) return sendClientError(webErrors.auth15, res, httpCodes.bad_request);

    currentSession.isActive = false;
    await currentSession.save();

    return sendOkResponse({ status: responseCodes.ok }, res);
};

const isUserBanned = async (playerId: string) => {
    const sequelize = await SequelizeService.getInstance();
    const lastBanCase = await sequelize.db.ban_case.findOne({
        where: {
            banned_player_id: playerId,
            is_player_banned: true,
        },
        order: [['resolved_at', 'DESC']],
    });

    if (lastBanCase?.banned_until) {
        return lastBanCase.banned_until > moment(moment.now()).toDate();
    }
    return false;
};

export const sendLoginTokens = async (currentSession: ISession, user: user, res: Response) => {
    currentSession.isActive = true;
    await currentSession.save();
    const { accessToken, refreshToken } = await getLoginTokens(user, currentSession.id);
    sendOkResponse(
        {
            status: responseCodes.ok,
            shouldVerifySession: false,
            accessToken,
            refreshToken,
        },
        res,
    );
};

const getLoginTokens = async (user: user, sessionId: string) => {
    const { password, created_at, last_modified, ...userForToken } = user.dataValues;

    const accessToken = await createJWT({
        user: { ...userForToken },
        sessionId,
        exp: moment().add(24, 'hours').unix(),
    });

    const refreshToken = await createJWT({
        userId: userForToken.id,
        sessionId,
        exp: moment().add(30, 'days').unix(),
    });

    return { accessToken, refreshToken };
};

// const getUserContactData = (user: user) => {
//     if (!user) {
//         return null;
//     }

//     return { email: user.dataValues.email ?? null };
// };

// const sendMfaResponse = async (
//     user: user,
//     res: Response,
//     sessionId: string,
//     device: device,
//     currentMfa?: IMfa
// ) => {
//     const { email } = getUserContactData(user) ?? {};

//     if (!email) return sendClientError(webErrors.auth13, res, httpCodes.bad_request);

//     const currentCode = getNewCode();
//     const hashedCode = await argon.hash(currentCode);
//     console.log(currentCode);
//     //replace literals with json object fields in constants
//     // await sendEmail(
//     //     'Verificación de Inicio de Sesión',
//     //     `<p>Tu código de verificación es: ${currentCode}</p>`,
//     //     { mail: 'auregames7@trial-7dnvo4d5x7rl5r86.mlsender.net', name: 'Aure Games' },
//     //     [{ mail: 'adewcalkx55@gmail.com', name: 'Adew' }]
//     // );

//     if (currentMfa) {
//         currentMfa.used = true;
//         await currentMfa.save();
//     } else {
//         const dueDate = moment().add(1, 'minute').toDate();
//         const newMfa = await MfaModel.create({
//             _id: new Types.ObjectId(),
//             code: hashedCode,
//             sessionId: sessionId,
//             userId: user.dataValues.id,
//             deviceId: device.dataValues.id,
//             used: false,
//             dueDate,
//         });

//         await newMfa.save();
//     }

//     sendOkResponse(
//         {
//             status: responseCodes.ok,
//             shouldVerifySession: true,
//             sendTo: getSafeMail(email),
//         },
//         res
//     );
// };

const MfaTokenSendOkResponse = async (session: ISession, res: Response) => {
    const sequelize = await SequelizeService.getInstance();
    const user = await sequelize.db.user.findByPk(session.userId);
    if (!user) return sendClientError(webErrors.auth14, res, httpCodes.bad_request);
    sendLoginTokens(session, user, res);
};

const getCurrentMfaAttempt = async (sessionId: string) => {
    const mfaAttemptsKey = `sessionMfaAttempts__${sessionId}`;
    let attempts = Number.parseInt((await redisClient.get(mfaAttemptsKey)) ?? '-1');
    if (attempts === -1) {
        attempts = 1;
    } else {
        attempts += 1;
    }
    await redisClient.set(mfaAttemptsKey, attempts);
    return attempts;
};
