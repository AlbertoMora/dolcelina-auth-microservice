jest.mock('../../../../dist/config/db-config', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: {
        getInstance: jest.fn(),
    },
}));

jest.mock('../../../../dist/models/mongoose/Session', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('../../../../dist/models/mongoose/MFA', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock('../../../../dist/utils/webclient-helper', () => ({
    getBasicWebData: jest.fn(() => ({
        userIp: '127.0.0.1',
        userOs: 'test-os',
        userAgent: 'test-agent',
    })),
}));

jest.mock('../../../../dist/utils/geo-helper', () => ({
    getLocationPattern: jest.fn(() => 'US-CA-San Jose-0,1'),
}));

jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'generated-user-id'),
}));

jest.mock('@amora95/commons', () => ({
    createJWT: jest.fn(),
    dbConstants: { status: { pending: 'pending' } },
    getTokenData: jest.fn(),
    getTokenInfo: jest.fn(),
    httpCodes: { bad_request: 400 },
    responseCodes: { ok: 'OK' },
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    webConstants: { commonValues: { unknown: 'unknown' } },
    webErrors: {
        auth02: { code: 'auth02' },
        auth05: { code: 'auth05' },
        auth08: { code: 'auth08' },
        auth14: { code: 'auth14' },
        auth15: { code: 'auth15' },
    },
}));

const {
    checkMfaAction,
    checkAccessTokenAction,
    loginAction,
    refreshSessionAction,
    signUpAction,
    signOutAction,
} = require('../../../../dist/controllers/authentication.controller');
const argon = require('argon2');
const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const MfaModel = require('../../../../dist/models/mongoose/MFA').default;
const Session = require('../../../../dist/models/mongoose/Session').default;
const {
    createJWT,
    getTokenData,
    getTokenInfo,
    httpCodes,
    sendClientError,
    sendOkResponse,
    webErrors,
} = require('@amora95/commons');

describe('authentication.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loginAction returns auth02 when user does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = { body: { username: 'missing', password: 'secret' } };
        const res = {};

        await loginAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth02, res, httpCodes.bad_request);
    });

    it('loginAction returns auth08 when user is banned', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue({ id: 'user-1', password: 'hash' }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue({
                        banned_until: new Date(Date.now() + 60_000),
                    }),
                },
            },
        });

        const req = { body: { username: 'user-1', password: 'secret' } };
        const res = {};

        await loginAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth08, res, httpCodes.bad_request);
    });

    it('loginAction returns auth02 when password is invalid', async () => {
        argon.verify.mockResolvedValue(false);

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue({ id: 'user-1', password: 'hash' }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = { body: { username: 'user-1', password: 'wrong' } };
        const res = {};

        await loginAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth02, res, httpCodes.bad_request);
    });

    it('loginAction creates a session and returns tokens when credentials are valid', async () => {
        argon.verify.mockResolvedValue(true);
        createJWT.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue({
                        id: 'user-1',
                        password: 'hash',
                        dataValues: {
                            id: 'user-1',
                            username: 'user-1',
                            password: 'hash',
                            created_at: new Date(),
                            last_modified: new Date(),
                        },
                    }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });

        Session.create.mockResolvedValue({
            id: 'session-1',
            isActive: true,
            save: jest.fn().mockResolvedValue(undefined),
        });

        const req = { body: { username: 'user-1', password: 'secret' } };
        const res = {};

        await loginAction(req, res);

        expect(Session.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-1',
                location: 'US-CA-San Jose-0,1',
                deviceOS: 'test-os',
            }),
        );
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            },
            res,
        );
    });

    it('loginAction uses userAgent when userOs is unknown', async () => {
        argon.verify.mockResolvedValue(true);
        createJWT.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue({
                        id: 'user-1',
                        password: 'hash',
                        dataValues: {
                            id: 'user-1',
                            username: 'user-1',
                            password: 'hash',
                            created_at: new Date(),
                            last_modified: new Date(),
                        },
                    }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });

        Session.create.mockResolvedValue({
            id: 'session-1',
            isActive: true,
            save: jest.fn().mockResolvedValue(undefined),
        });

        const { getBasicWebData } = require('../../../../dist/utils/webclient-helper');
        getBasicWebData.mockReturnValue({
            userIp: '127.0.0.1',
            userOs: 'unknown',
            userAgent: 'fallback-agent',
        });

        const req = { body: { username: 'user-1', password: 'secret' } };
        const res = {};

        await loginAction(req, res);

        expect(Session.create).toHaveBeenCalledWith(
            expect.objectContaining({
                deviceOS: 'fallback-agent',
            }),
        );
    });

    it('checkMfaAction returns auth14 when session does not exist', async () => {
        const { redisClient } = require('../../../../dist/config/db-config');
        redisClient.get.mockResolvedValue(null);
        Session.findById.mockResolvedValue(null);

        const req = { body: { code: '123456', sessionId: 'session-1' } };
        const res = {};

        await checkMfaAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth14, res, httpCodes.bad_request, {
            attempts: 1,
        });
    });

    it('checkMfaAction returns auth14 when mfa record is missing', async () => {
        const { redisClient } = require('../../../../dist/config/db-config');
        redisClient.get.mockResolvedValue('1');
        Session.findById.mockResolvedValue({ id: 'session-1' });
        MfaModel.findOne.mockResolvedValue(null);

        const req = { body: { code: '123456', sessionId: 'session-1' } };
        const res = {};

        await checkMfaAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(
            { ...webErrors.auth14 },
            res,
            httpCodes.bad_request,
            { attempts: 2 },
        );
    });

    it('checkMfaAction returns auth14 when code is invalid', async () => {
        const { redisClient } = require('../../../../dist/config/db-config');
        redisClient.get.mockResolvedValue('0');
        Session.findById.mockResolvedValue({ id: 'session-1' });
        MfaModel.findOne.mockResolvedValue({ code: 'hashed-code' });
        argon.verify.mockResolvedValue(false);

        const req = { body: { code: '123456', sessionId: 'session-1' } };
        const res = {};

        await checkMfaAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth14, res, httpCodes.bad_request, {
            attempts: 1,
        });
    });

    it('checkMfaAction sends login tokens when code is valid', async () => {
        const { redisClient } = require('../../../../dist/config/db-config');
        const save = jest.fn().mockResolvedValue(undefined);

        redisClient.get.mockResolvedValue('2');
        Session.findById.mockResolvedValue({
            id: 'session-1',
            userId: 'user-1',
            save,
            isActive: false,
        });
        MfaModel.findOne.mockResolvedValue({ code: 'hashed-code' });
        argon.verify.mockResolvedValue(true);
        createJWT.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({
                        id: 'user-1',
                        dataValues: {
                            id: 'user-1',
                            username: 'user-1',
                            password: 'hash',
                            created_at: new Date(),
                            last_modified: new Date(),
                        },
                    }),
                },
            },
        });

        const req = { body: { code: '123456', sessionId: 'session-1' } };
        const res = {};

        await checkMfaAction(req, res);
        await new Promise(resolve => setImmediate(resolve));

        expect(save).toHaveBeenCalled();
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                shouldVerifySession: false,
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            },
            res,
        );
    });

    it('signUpAction creates a user session and returns login tokens', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const createdUser = {
            id: 'generated-user-id',
            dataValues: {
                id: 'generated-user-id',
                username: 'new-user',
                password: 'hashed-password',
                created_at: new Date(),
                last_modified: new Date(),
            },
            save,
        };

        argon.hash.mockResolvedValue('hashed-password');
        createJWT.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    create: jest.fn().mockResolvedValue(createdUser),
                },
            },
        });
        Session.create.mockResolvedValue({
            id: 'session-1',
            userId: 'generated-user-id',
            isActive: false,
            save: jest.fn().mockResolvedValue(undefined),
        });

        const req = {
            body: {
                name: 'New',
                lastname: 'User',
                username: 'new-user',
                password: 'secret',
                email: 'new@user.com',
            },
        };
        const res = {};

        await signUpAction(req, res);
        await new Promise(resolve => setImmediate(resolve));

        expect(argon.hash).toHaveBeenCalledWith('secret');
        expect(save).toHaveBeenCalled();
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                shouldVerifySession: false,
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            },
            res,
        );
    });

    it('checkAccessTokenAction returns auth05 when token is missing', async () => {
        const req = { headers: {} };
        const res = {};

        await checkAccessTokenAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth05, res, httpCodes.bad_request);
    });

    it('checkAccessTokenAction returns auth05 when token payload is invalid', async () => {
        getTokenInfo.mockResolvedValue(undefined);

        const req = { headers: { authorization: 'Bearer invalid-token' } };
        const res = {};

        await checkAccessTokenAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth05, res, httpCodes.bad_request);
    });

    it('checkAccessTokenAction returns ok when session is active and user is not banned', async () => {
        getTokenInfo.mockResolvedValue({
            user: { id: 'user-1' },
            sessionId: 'session-1',
        });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ id: 'user-1' }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });
        Session.findById.mockResolvedValue({ isActive: true });

        const req = { headers: { authorization: 'Bearer valid-token' } };
        const res = {};

        await checkAccessTokenAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
    });

    it('refreshSessionAction returns auth05 when token is missing', async () => {
        const req = { headers: {} };
        const res = {};

        await refreshSessionAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth05, res, httpCodes.bad_request);
    });

    it('refreshSessionAction returns auth05 when user is banned', async () => {
        getTokenInfo.mockResolvedValue({ userId: 'user-1', sessionId: 'session-1' });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ id: 'user-1' }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue({
                        banned_until: new Date(Date.now() + 60_000),
                    }),
                },
            },
        });

        const req = { headers: { authorization: 'Bearer refresh-token' } };
        const res = {};

        await refreshSessionAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth05, res, httpCodes.bad_request);
    });

    it('refreshSessionAction returns auth05 when session is inactive', async () => {
        getTokenInfo.mockResolvedValue({ userId: 'user-1', sessionId: 'session-1' });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({
                        id: 'user-1',
                        dataValues: {
                            id: 'user-1',
                            username: 'user-1',
                            password: 'hash',
                            created_at: new Date(),
                            last_modified: new Date(),
                        },
                    }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });
        Session.findById.mockResolvedValue({ isActive: false });

        const req = { headers: { authorization: 'Bearer refresh-token' } };
        const res = {};

        await refreshSessionAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth05, res, httpCodes.bad_request);
    });

    it('refreshSessionAction returns new tokens for an active session', async () => {
        const save = jest.fn().mockResolvedValue(undefined);

        getTokenInfo.mockResolvedValue({ userId: 'user-1', sessionId: 'session-1' });
        createJWT
            .mockResolvedValueOnce('new-access-token')
            .mockResolvedValueOnce('new-refresh-token');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({
                        id: 'user-1',
                        dataValues: {
                            id: 'user-1',
                            username: 'user-1',
                            password: 'hash',
                            created_at: new Date(),
                            last_modified: new Date(),
                        },
                    }),
                },
                ban_case: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });
        Session.findById.mockResolvedValue({ id: 'session-1', isActive: true, save });

        const req = { headers: { authorization: 'Bearer refresh-token' } };
        const res = {};

        await refreshSessionAction(req, res);

        expect(save).toHaveBeenCalled();
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                shouldVerifySession: false,
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            },
            res,
        );
    });

    it('signOutAction returns auth15 when token is missing', async () => {
        const req = { headers: {} };
        const res = {};

        await signOutAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth15, res, httpCodes.bad_request);
    });

    it('signOutAction returns auth15 when token cannot be decoded', async () => {
        getTokenData.mockReturnValue(undefined);

        const req = { headers: { authorization: 'Bearer invalid-token' } };
        const res = {};

        await signOutAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth15, res, httpCodes.bad_request);
    });

    it('signOutAction returns auth15 when session is not found', async () => {
        getTokenData.mockReturnValue({ sessionId: 'missing-session' });
        Session.findById.mockResolvedValue(null);

        const req = { headers: { authorization: 'Bearer token' } };
        const res = {};

        await signOutAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth15, res, httpCodes.bad_request);
    });

    it('signOutAction deactivates session and returns ok', async () => {
        const save = jest.fn().mockResolvedValue(undefined);

        getTokenData.mockReturnValue({ sessionId: 'session-1' });
        Session.findById.mockResolvedValue({
            isActive: true,
            save,
        });

        const req = { headers: { authorization: 'Bearer token' } };
        const res = {};

        await signOutAction(req, res);

        expect(save).toHaveBeenCalled();
        expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
    });
});
