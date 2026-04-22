jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: {
        getInstance: jest.fn(),
    },
}));

jest.mock('argon2', () => ({
    hash: jest.fn(),
}));

jest.mock('@aure/commons', () => ({
    avoidNanParseInt: jest.fn(v => v),
    httpCodes: { not_found: 404, bad_request: 400 },
    responseCodes: { ok: 'OK' },
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    webErrors: {
        srv01: { code: 'srv01' },
        auth04: { code: 'auth04' },
    },
}));

const { Op } = require('sequelize');
const argon = require('argon2');
const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const {
    banUserAction,
    deleteUserAction,
    getUserByIdAction,
    getUsersByName,
    updateUserAction,
} = require('../../../../dist/controllers/users.controller');
const {
    avoidNanParseInt,
    httpCodes,
    sendClientError,
    sendOkResponse,
    webErrors,
} = require('@aure/commons');

describe('users.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getUserByIdAction returns not found when user does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = { params: { id: 'missing-user' } };
        const res = {};

        await getUserByIdAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found);
    });

    it('getUsersByName returns paginated users', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findAndCountAll: jest.fn().mockResolvedValue({
                        count: 2,
                        rows: [{ id: 'u1' }, { id: 'u2' }],
                    }),
                },
            },
        });

        const req = {
            query: {
                username: 'al',
                page: '0',
                limit: '10',
            },
        };
        const res = {};

        await getUsersByName(req, res);

        expect(avoidNanParseInt).toHaveBeenCalledWith('10');
        expect(avoidNanParseInt).toHaveBeenCalledWith('0');
        expect(sendOkResponse).toHaveBeenCalledWith(
            { status: 'OK', count: 2, users: [{ id: 'u1' }, { id: 'u2' }] },
            res,
        );
    });

    it('getUsersByName returns users without a filter when username is missing', async () => {
        const findAndCountAll = jest.fn().mockResolvedValue({
            count: 1,
            rows: [{ id: 'u1' }],
        });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findAndCountAll,
                },
            },
        });

        const req = {
            query: {},
        };
        const res = {};

        await getUsersByName(req, res);

        expect(findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: undefined,
            }),
        );
        expect(sendOkResponse).toHaveBeenCalledWith(
            { status: 'OK', count: 1, users: [{ id: 'u1' }] },
            res,
        );
    });

    it('getUserByIdAction returns user when it exists', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ id: 'user-1' }),
                },
            },
        });

        const req = { params: { id: 'user-1' } };
        const res = {};

        await getUserByIdAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', user: { id: 'user-1' } }, res);
    });

    it('updateUserAction returns auth04 when username or email already exists', async () => {
        const foundUser = { id: 'user-1' };

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue(foundUser),
                    findOne: jest.fn().mockResolvedValue({ id: 'duplicate' }),
                },
            },
        });

        const req = {
            params: { id: 'user-1' },
            body: {
                username: 'existing-user',
            },
        };
        const res = {};

        await updateUserAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.auth04, res, httpCodes.bad_request);
    });

    it('updateUserAction returns not found when user does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = {
            params: { id: 'missing-user' },
            body: {
                name: 'Nobody',
            },
        };
        const res = {};

        await updateUserAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found);
    });

    it('updateUserAction updates user and strips password from response', async () => {
        const update = jest.fn().mockResolvedValue({
            dataValues: {
                id: 'user-1',
                name: 'Alice',
                password: 'hashed-secret',
            },
        });
        argon.hash.mockResolvedValue('hashed-secret');

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ update }),
                    findOne: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = {
            params: { id: 'user-1' },
            body: {
                name: 'Alice',
                password: 'plain-pass',
            },
        };
        const res = {};

        await updateUserAction(req, res);

        expect(argon.hash).toHaveBeenCalledWith('plain-pass');
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                user: {
                    id: 'user-1',
                    name: 'Alice',
                },
            },
            res,
        );
    });

    it('updateUserAction updates every optional field and maps is_active false to 0', async () => {
        const update = jest.fn().mockResolvedValue({
            dataValues: {
                id: 'user-1',
                name: 'Alice',
                lastname: 'Smith',
                email: 'alice@test.com',
                username: 'alice',
                country_code: 57,
                telephone: 123456,
                prof_pic: 'avatar.png',
                is_active: 0,
                password: 'stored-secret',
            },
        });
        const findOne = jest.fn().mockResolvedValue(null);

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ update }),
                    findOne,
                },
            },
        });

        const req = {
            params: { id: 'user-1' },
            body: {
                name: 'Alice',
                lastname: 'Smith',
                email: 'alice@test.com',
                username: 'alice',
                country_code: 57,
                telephone: 123456,
                prof_pic: 'avatar.png',
                is_active: false,
            },
        };
        const res = {};

        await updateUserAction(req, res);

        expect(findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    [Op.or]: [{ username: 'alice' }, { email: 'alice@test.com' }],
                }),
            }),
        );
        expect(update).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Alice',
                lastname: 'Smith',
                email: 'alice@test.com',
                username: 'alice',
                country_code: 57,
                telephone: 123456,
                prof_pic: 'avatar.png',
                is_active: 0,
            }),
        );
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                user: {
                    id: 'user-1',
                    name: 'Alice',
                    lastname: 'Smith',
                    email: 'alice@test.com',
                    username: 'alice',
                    country_code: 57,
                    telephone: 123456,
                    prof_pic: 'avatar.png',
                    is_active: 0,
                },
            },
            res,
        );
    });

    it('updateUserAction skips duplicate lookup when username and email are absent', async () => {
        const findOne = jest.fn();
        const update = jest.fn().mockResolvedValue({
            dataValues: {
                id: 'user-1',
                is_active: 1,
                password: 'stored-secret',
            },
        });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ update }),
                    findOne,
                },
            },
        });

        const req = {
            params: { id: 'user-1' },
            body: {
                is_active: true,
            },
        };
        const res = {};

        await updateUserAction(req, res);

        expect(findOne).not.toHaveBeenCalled();
        expect(update).toHaveBeenCalledWith(
            expect.objectContaining({
                is_active: 1,
            }),
        );
    });

    it('deleteUserAction returns not found when user does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = { params: { id: 'missing-user' } };
        const res = {};

        await deleteUserAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found);
    });

    it('deleteUserAction soft deletes user and returns sanitized payload', async () => {
        const update = jest.fn().mockResolvedValue({
            dataValues: {
                id: 'user-1',
                is_active: 0,
                password: 'hashed-secret',
            },
        });

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ update }),
                },
            },
        });

        const req = { params: { id: 'user-1' } };
        const res = {};

        await deleteUserAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                user: {
                    id: 'user-1',
                    is_active: 0,
                },
            },
            res,
        );
    });

    it('banUserAction creates ban case and deactivates user', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const update = jest.fn().mockResolvedValue({
            dataValues: {
                id: 'user-1',
                is_active: 0,
                password: 'hashed-secret',
            },
        });
        const banCase = {
            id: 'ban-1',
            save,
        };

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue({ update }),
                },
                ban_case: {
                    create: jest.fn().mockResolvedValue(banCase),
                },
            },
        });

        const req = { params: { id: 'user-1' } };
        const res = {};

        await banUserAction(req, res);

        expect(save).toHaveBeenCalled();
        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                user: {
                    id: 'user-1',
                    is_active: 0,
                },
                banCase,
            },
            res,
        );
    });

    it('banUserAction returns not found when user does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                user: {
                    findByPk: jest.fn().mockResolvedValue(null),
                },
            },
        });

        const req = { params: { id: 'missing-user' } };
        const res = {};

        await banUserAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found);
    });
});
