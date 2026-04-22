jest.mock('../../../../dist/config/openfga-config', () => ({
    fgaClient: {
        readAuthorizationModel: jest.fn().mockResolvedValue({
            authorization_model: { id: 'model-1' },
        }),
        check: jest.fn().mockResolvedValue({ allowed: true }),
    },
}));

jest.mock('../../../../dist/utils/session-helper', () => ({
    getUserSession: jest.fn().mockReturnValue({
        user: { id: 'user-1' },
    }),
}));

jest.mock('@aure/commons', () => ({
    responseCodes: { ok: 'OK' },
    sendOkResponse: jest.fn(),
}));

const { checkPermissionAction } = require('../../../../dist/controllers/authorization.controller');
const { sendOkResponse } = require('@aure/commons');

describe('authorization.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('checkPermissionAction returns allowed decision', async () => {
        const req = {
            body: {
                relation: 'read',
                objectName: 'document',
                objectId: 'doc-1',
            },
            headers: {
                authorization: 'Bearer token',
            },
        };
        const res = {};

        await checkPermissionAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith(
            {
                status: 'OK',
                isActionAllowed: true,
            },
            res,
        );
    });
});
