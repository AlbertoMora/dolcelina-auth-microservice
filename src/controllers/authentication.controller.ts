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
import { device } from '../models/mariadb/device';
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

    const isPassOk = await argon.verify(user.pass, password);

    if (!isPassOk) return sendClientError(webErrors.auth02, res, httpCodes.bad_request);

    const ipGeo = getLocationPattern(userIp);

    const currentSession = await Session.create({
        _id: new Types.ObjectId(),
        userId: user.id,
        deviceId: dbConstants.status.pending,
        deviceOS: userOs === webConstants.commonValues.unknown ? userAgent : userOs,
        sessionIP: userIp,
        isActive: false,
        location: ipGeo,
        signedInSince: moment().toDate(),
    });
    await currentSession.save();

    const nonce = `${Math.random()}||${moment().add(1, 'minute').unix()}`;
    await redisClient.set(currentSession.id.toString(), nonce);

    return sendOkResponse(
        {
            status: responseCodes.ok,
            nonce,
            sessionId: currentSession.id,
        },
        res
    );
};

export const checkLoginChallengeAction = async (
    req: Request<{}, {}, ICheckChallengeViewModel, {}>,
    res: Response
) => {
    const {
        signedNonce,
        deviceId,
        deviceBrand,
        deviceModel,
        deviceName,
        deviceType,
        rsaPubKey,
        sessionId,
    } = req.body;

    const currentSession = await Session.findById(sessionId);

    if (!currentSession) return sendClientError(webErrors.auth14, res, httpCodes.bad_request);

    const sequelize = await SequelizeService.getInstance();
    const user = await sequelize.db.user.findByPk(currentSession.userId);

    if (!user) return sendClientError(webErrors.auth14, res, httpCodes.bad_request);

    const device = await getDeviceByIdOrCreate({
        deviceId,
        deviceBrand,
        deviceModel,
        deviceName,
        deviceType,
        rsaPubKey,
        user: user,
    });

    const isChallengeOk = await checkChallengeInfo(currentSession, signedNonce, device, req);

    if (!isChallengeOk) return sendClientError(webErrors.auth14, res, httpCodes.bad_request);

    currentSession.deviceId = device.serial_number ?? '';
    currentSession?.save();

    if (device?.dataValues.status === deviceConstants.deviceStatus.activeSafe) {
        await sendLoginTokens(currentSession, user, res);
    } else {
        await sendMfaResponse(user, res, sessionId, device);
    }
};

export const checkMfaAction = async (req: Request<{}, {}, IMFAViewModel, {}>, res: Response) => {
    const { code, sessionId, shouldDeviceSafe } = req.body;
    const attempts = await getCurrentMfaAttempt(sessionId);

    const session = await Session.findById(sessionId);
    if (!session)
        return sendClientError(webErrors.auth14, res, httpCodes.bad_request, { attempts });
    const sequelize = await SequelizeService.getInstance();
    const device = await sequelize.db.device.findOne({
        where: { serial_number: session.deviceId },
    });
    if (!device || device.status === deviceConstants.deviceStatus.banned)
        return sendClientError(webErrors.auth14, res, httpCodes.bad_request, { attempts });
    const mfa = await MfaModel.findOne({
        sessionId: session.id,
        deviceId: device.id,
        used: false,
        dueDate: { $gt: moment().toDate() },
    });
    if (!mfa)
        return sendClientError({ ...webErrors.auth14 }, res, httpCodes.bad_request, { attempts });

    const isCodeOk = await argon.verify(mfa.code, code);

    if (isCodeOk) {
        MfaTokenSendOkResponse(session, res, device, shouldDeviceSafe);
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
        pass,
        isactive: 1,
        creation_date: moment().utc().toDate(),
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

    if (!user?.isactive || !currentSession?.isActive)
        return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const isBanned = await isUserBanned(user.id);

    if (isBanned) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    return sendOkResponse({ status: responseCodes.ok }, res);
};

export const refreshSessionAction = async (req: Request, res: Response) => {
    const { userIp, userAgent, userOs } = getBasicWebData(req);
    const location = getLocationPattern(userIp);
    const sequelize = await SequelizeService.getInstance();

    const [, refreshToken] = req.headers.authorization?.split(' ') ?? [];
    if (!refreshToken) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const tokenData = (await getTokenInfo(refreshToken)) as IRefreshToken;

    const user = await sequelize.db.user.findByPk(tokenData.userId);
    const isBanned = await isUserBanned(tokenData.userId);

    if (!user || isBanned) return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    const currentSession = await Session.findById(tokenData.sessionId);
    const device = await sequelize.db.device.findOne({
        where: { serial_number: currentSession?.deviceId },
    });

    if (!checkSessionInfo(currentSession, userOs, userAgent ?? '', location, device))
        return sendClientError(webErrors.auth05, res, httpCodes.bad_request);

    currentSession?.isActive && (currentSession.isActive = false);

    const newSession = await Session.create({
        _id: new Types.ObjectId(),
        userId: user.id,
        deviceId: currentSession?.deviceId,
        deviceOS: userOs ?? webConstants.commonValues.unknown,
        sessionIP: userIp,
        isActive: true,
        location,
        signedInSince: moment().toDate(),
    });
    await newSession.save();

    return sendLoginTokens(newSession, user, res);
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

    if (!lastBanCase?.banned_until) {
        return false;
    } else {
        return lastBanCase.banned_until > moment(moment.now()).toDate();
    }
};

const getDeviceByIdOrCreate = async ({
    deviceId,
    deviceBrand,
    deviceName,
    deviceType,
    deviceModel,
    user,
    location,
    rsaPubKey,
}: IDeviceParams) => {
    const sequelize = await SequelizeService.getInstance();
    let device = await sequelize.db.device.findOne({
        where: {
            serial_number: deviceId,
        },
    });

    if (!device) {
        device = await sequelize.db.device.create({
            id: uuid(),
            brand: deviceBrand,
            devicePass: 'null',
            device_name: deviceName,
            device_type: deviceType,
            model: deviceModel,
            serial_number: deviceId,
            status: deviceConstants.deviceStatus.activeNoSafe,
            user_id: user.dataValues.id,
            rsa_pub_key: rsaPubKey,
            location,
        });
        if (device && !device.rsa_pub_key) device.rsa_pub_key = rsaPubKey;

        device?.save();
    }
    return device;
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
        res
    );
};

const getLoginTokens = async (user: user, sessionId: string) => {
    const { pass, name, lastname, creation_date, last_modified, email, ...userForToken } =
        user.dataValues;

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

const getUserContactData = (user: user) => {
    if (!user) {
        return null;
    }

    return { email: user.dataValues.email ?? null };
};

const sendMfaResponse = async (
    user: user,
    res: Response,
    sessionId: string,
    device: device,
    currentMfa?: IMfa
) => {
    const { email } = getUserContactData(user) ?? {};

    if (!email) return sendClientError(webErrors.auth13, res, httpCodes.bad_request);

    const currentCode = getNewCode();
    const hashedCode = await argon.hash(currentCode);
    console.log(currentCode);
    //replace literals with json object fields in constants
    // await sendEmail(
    //     'Verificación de Inicio de Sesión',
    //     `<p>Tu código de verificación es: ${currentCode}</p>`,
    //     { mail: 'auregames7@trial-7dnvo4d5x7rl5r86.mlsender.net', name: 'Aure Games' },
    //     [{ mail: 'adewcalkx55@gmail.com', name: 'Adew' }]
    // );

    if (currentMfa) {
        currentMfa.used = true;
        await currentMfa.save();
    } else {
        const dueDate = moment().add(1, 'minute').toDate();
        const newMfa = await MfaModel.create({
            _id: new Types.ObjectId(),
            code: hashedCode,
            sessionId: sessionId,
            userId: user.dataValues.id,
            deviceId: device.dataValues.id,
            used: false,
            dueDate,
        });

        await newMfa.save();
    }

    sendOkResponse(
        {
            status: responseCodes.ok,
            shouldVerifySession: true,
            sendTo: getSafeMail(email),
        },
        res
    );
};

const MfaTokenSendOkResponse = async (
    session: ISession,
    res: Response,
    device: device,
    shouldDeviceSafe: boolean
) => {
    const sequelize = await SequelizeService.getInstance();
    const user = await sequelize.db.user.findByPk(session.userId);
    if (!user) return sendClientError(webErrors.auth14, res, httpCodes.bad_request);
    device.status = shouldDeviceSafe
        ? deviceConstants.deviceStatus.activeSafe
        : deviceConstants.deviceStatus.activeNoSafe;
    sendLoginTokens(session, user, res);
};

const checkChallengeInfo = async (
    currentSession: ISession,
    signedNonce: string,
    device: device,
    req: Request
) => {
    const { userIp, userOs, userAgent } = getBasicWebData(req);
    const location = getLocationPattern(userIp);

    if (!checkSessionInfo(currentSession, userOs, userAgent ?? '', location, device, true))
        return false;

    const cachedNonce = await redisClient.getDel(currentSession.id?.toString());

    if (!cachedNonce) return false;

    const isNonceOk = verifySpkiSignature(
        device?.rsa_pub_key ?? '',
        cachedNonce ?? '',
        signedNonce
    );
    const nonceDate = moment.unix(parseInt(cachedNonce?.split('||')[1] ?? '0')).unix();
    const currentDate = moment().unix();

    if (!isNonceOk || nonceDate <= currentDate) return false;

    return true;
};

const checkSessionInfo = (
    session: ISession | null,
    userOs: string,
    userAgent: string,
    location: string,
    device: device | null,
    omitSession?: boolean
) => {
    return (
        (session?.deviceOS === userOs || session?.deviceOS === userAgent) &&
        location === session.location &&
        (session?.isActive || omitSession) &&
        !!device
    );
};

const getCurrentMfaAttempt = async (sessionId: string) => {
    const mfaAttemptsKey = `sessionMfaAttempts__${sessionId}`;
    let attempts = parseInt((await redisClient.get(mfaAttemptsKey)) ?? '-1');
    if (attempts === -1) {
        attempts = 1;
    } else {
        attempts += 1;
    }
    await redisClient.set(mfaAttemptsKey, attempts);
    return attempts;
};

interface IDeviceParams {
    deviceId: string;
    deviceBrand: string;
    deviceName: string;
    deviceType: string;
    deviceModel: string;
    user: user;
    location?: string;
    rsaPubKey?: string;
}
