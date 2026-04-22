jest.mock('../../../dist/routes/authentication.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../dist/routes/oauth.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../dist/routes/authorization.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../dist/routes/users.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const { setRoutesConfig } = require('../../../dist/config/route-config');

describe('setRoutesConfig', () => {
    it('mounts all route modules under v1 prefixes', () => {
        const app = { use: jest.fn() };

        setRoutesConfig(app);

        expect(app.use).toHaveBeenCalledTimes(4);
        expect(app.use).toHaveBeenCalledWith('/v1/authentication/', expect.any(Function));
        expect(app.use).toHaveBeenCalledWith('/v1/oauth/', expect.any(Function));
        expect(app.use).toHaveBeenCalledWith('/v1/authorization/', expect.any(Function));
        expect(app.use).toHaveBeenCalledWith('/v1/users/', expect.any(Function));
    });
});
