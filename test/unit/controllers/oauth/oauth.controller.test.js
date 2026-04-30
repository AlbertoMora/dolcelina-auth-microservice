const mockGetSecret = jest.fn();

jest.mock('axios', () => ({
    post: jest.fn(),
}));

jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: {
        getInstance: jest.fn(),
    },
}));

jest.mock('../../../../dist/models/mongoose/Session', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

jest.mock('../../../../dist/utils/geo-helper', () => ({
    getLocationPattern: jest.fn(() => 'US-CA-San Jose-0,1'),
}));

jest.mock('../../../../dist/controllers/authentication.controller', () => ({
    sendLoginTokens: jest.fn(),
}));

jest.mock('../../../../dist/utils/webclient-helper', () => ({
    getBasicWebData: jest.fn(() => ({
        userIp: '127.0.0.1',
        userOs: 'test-os',
        userAgent: 'test-agent',
    })),
}));

jest.mock('@amora95/commons', () => ({
    dbConstants: { status: { pending: 'pending' } },
    getTokenData: jest.fn(),
    httpCodes: { not_found: 404, bad_request: 400 },
    OpenbaoVaultClient: {
        getInstance: jest.fn(() => ({
            getSecret: mockGetSecret,
        })),
    },
    responseCodes: { serverError: 'SERVER_ERROR' },
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    sendServerError: jest.fn(),
    webConstants: { commonValues: { unknown: 'unknown' } },
    webErrors: { srv01: { code: 'srv01' }, auth03: { code: 'auth03' } },
}));

const axios = require('axios');
const { sendLoginTokens } = require('../../../../dist/controllers/authentication.controller');
const Session = require('../../../../dist/models/mongoose/Session').default;
const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const {
    checkGoogleSessionInfoAction,
    getGoogleClientIdAction,
} = require('../../../../dist/controllers/oauth.controller');
const {
    getTokenData,
    httpCodes,
    sendClientError,
    sendOkResponse,
    sendServerError,
    webErrors,
} = require('@amora95/commons');

describe('oauth.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSecret.mockReset();
    });

    it('getGoogleClientIdAction returns configured client id', async () => {
        mockGetSecret.mockResolvedValue({ clientId: 'google-client-id' });

        const req = {};
        const res = {};

        await getGoogleClientIdAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                clientId: 'google-client-id',
            },
            res,
        );
    });

    it('getGoogleClientIdAction returns not found when client id is missing', async () => {
        mockGetSecret.mockResolvedValue({ clientId: '' });

        const req = {};
        const res = {};

        await getGoogleClientIdAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found, {
            status: 'SERVER_ERROR',
        });
    });

    it('getGoogleClientIdAction delegates errors to sendServerError', async () => {
        const err = new Error('vault unavailable');
        mockGetSecret.mockRejectedValue(err);

        const req = {};
        const res = {};

        await getGoogleClientIdAction(req, res);

        expect(sendServerError).toHaveBeenCalledWith(err, res, webErrors.srv01);
    });

    it('checkGoogleSessionInfoAction returns ok when code is test', async () => {
        mockGetSecret.mockResolvedValue({
            clientId: 'client',
            secretKey: 'secret',
        });

        const req = { body: { code: 'test' } };
        const res = {};

        await checkGoogleSessionInfoAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith({}, res);
    });

    it('checkGoogleSessionInfoAction returns auth03 when google token payload has no id_token', async () => {
        mockGetSecret.mockResolvedValue({
            clientId: 'client',
            secretKey: 'secret',
        });
        axios.post.mockResolvedValue({ data: {} });

        const req = { body: { code: 'google-code' } };
        const res = {};

        await checkGoogleSessionInfoAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth03, res, httpCodes.bad_request);
    });

    it('checkGoogleSessionInfoAction reuses an existing user and sends login tokens', async () => {
        const foundUser = { id: 'user-1', email: 'user@test.com' };
        const session = { id: 'session-1' };

        mockGetSecret.mockResolvedValue({
            clientId: 'client',
            secretKey: 'secret',
        });
        axios.post.mockResolvedValue({ data: { id_token: 'google-id-token' } });
        getTokenData.mockReturnValue({
            email: 'user@test.com',
            family_name: 'Test',
            given_name: 'User',
            picture: 'avatar.png',
        });
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue(foundUser),
                    create: jest.fn(),
                },
            },
        });
        Session.create.mockResolvedValue(session);

        const req = { body: { code: 'google-code' } };
        const res = {};

        await checkGoogleSessionInfoAction(req, res);

        expect(Session.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-1',
                location: 'US-CA-San Jose-0,1',
            }),
        );
        expect(sendLoginTokens).toHaveBeenCalledWith(session, foundUser, res);
    });

    it('checkGoogleSessionInfoAction creates a new user when none exists', async () => {
        const createdUser = { id: 'user-2', email: 'new@test.com' };
        const createUser = jest.fn().mockResolvedValue(createdUser);

        mockGetSecret.mockResolvedValue({
            clientId: 'client',
            secretKey: 'secret',
        });
        axios.post.mockResolvedValue({ data: { id_token: 'google-id-token' } });
        getTokenData.mockReturnValue({
            email: 'new@test.com',
            family_name: 'New',
            given_name: 'User',
            picture: 'avatar.png',
        });
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findOne: jest.fn().mockResolvedValue(null),
                    create: createUser,
                },
            },
        });
        Session.create.mockResolvedValue({ id: 'session-2' });

        const req = { body: { code: 'google-code' } };
        const res = {};

        await checkGoogleSessionInfoAction(req, res);

        expect(createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'new@test.com',
                password: 'pending',
                name: 'User',
                lastname: 'New',
            }),
        );
        expect(sendLoginTokens).toHaveBeenCalledWith({ id: 'session-2' }, createdUser, res);
    });
});
