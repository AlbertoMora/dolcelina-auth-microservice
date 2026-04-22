const mockAuthenticate = jest.fn();
const mockClose = jest.fn();
const mockInitModels = jest.fn();
const mockGetSecret = jest.fn();
const mockReadFileSync = jest.fn(() => 'ca-cert');
const mockSequelizeCtor = jest.fn().mockImplementation(() => ({
    authenticate: mockAuthenticate,
    close: mockClose,
}));

jest.mock('sequelize', () => ({
    Sequelize: mockSequelizeCtor,
}));

jest.mock('node:fs', () => ({
    readFileSync: mockReadFileSync,
}));

jest.mock('@aure/commons', () => ({
    OpenbaoVaultClient: {
        getInstance: jest.fn(() => ({
            getSecret: mockGetSecret,
        })),
    },
}));

jest.mock('../../../dist/models/mariadb/init-models', () => ({
    initModels: mockInitModels,
}));

describe('SequelizeService', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        delete process.env.DB_HOST;
        delete process.env.DB_PORT;
        delete process.env.NODE_ENV;
        mockAuthenticate.mockResolvedValue(undefined);
        mockClose.mockResolvedValue(undefined);
        mockGetSecret.mockResolvedValue({
            dbName: 'db-name',
            dbUser: 'db-user',
            dbPassword: 'db-password',
        });
        mockInitModels.mockReturnValue({ user: {}, ban_case: {} });
    });

    it('getStatus returns default host and port before initialization', () => {
        const { SequelizeService } = require('../../../dist/services/sequelize-service');
        const service = Object.create(SequelizeService.prototype);

        service.isReady = false;
        service.host = 'localhost';
        service.port = 3306;

        expect(service.getStatus()).toEqual({
            isReady: false,
            host: 'localhost',
            port: 3306,
        });
    });

    it('getInstance initializes the singleton only once', async () => {
        process.env.DB_HOST = 'db-host';
        process.env.DB_PORT = '3307';

        const { SequelizeService } = require('../../../dist/services/sequelize-service');

        const first = await SequelizeService.getInstance();
        const second = await SequelizeService.getInstance();

        expect(first).toBe(second);
        expect(mockSequelizeCtor).toHaveBeenCalledTimes(1);
        expect(mockAuthenticate).toHaveBeenCalledTimes(1);
        expect(first.getStatus()).toEqual({
            isReady: true,
            host: 'db-host',
            port: 3307,
        });
    });

    it('initialize loads ssl certificate in production', async () => {
        process.env.NODE_ENV = 'production';

        const { SequelizeService } = require('../../../dist/services/sequelize-service');
        const service = await SequelizeService.getInstance();

        expect(mockReadFileSync).toHaveBeenCalled();
        expect(mockSequelizeCtor).toHaveBeenCalledWith(
            'db-name',
            'db-user',
            'db-password',
            expect.objectContaining({
                dialectOptions: {
                    ssl: {
                        ca: 'ca-cert',
                    },
                },
            }),
        );
        expect(service.db).toEqual({ user: {}, ban_case: {} });
    });

    it('close shuts down the sequelize connection and updates readiness', async () => {
        const { SequelizeService } = require('../../../dist/services/sequelize-service');
        const service = await SequelizeService.getInstance();

        await service.close();

        expect(mockClose).toHaveBeenCalled();
        expect(service.getStatus().isReady).toBe(false);
    });

    it('getInstance rethrows connection errors and allows a later retry', async () => {
        const failure = new Error('db down');
        mockAuthenticate.mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);

        const { SequelizeService } = require('../../../dist/services/sequelize-service');

        await expect(SequelizeService.getInstance()).rejects.toThrow('db down');

        const service = await SequelizeService.getInstance();

        expect(service.getStatus().isReady).toBe(true);
        expect(mockAuthenticate).toHaveBeenCalledTimes(2);
    });
});
