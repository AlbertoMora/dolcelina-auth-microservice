jest.mock('@aure/commons', () => ({
    getTokenData: jest.fn(),
}));

const { getTokenData } = require('@aure/commons');
const { getUserSession } = require('../../../dist/utils/session-helper');

describe('getUserSession', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('extracts bearer token and delegates to getTokenData', () => {
        getTokenData.mockReturnValue({ userId: 1 });

        const result = getUserSession('Bearer fake-token');

        expect(getTokenData).toHaveBeenCalledWith('fake-token');
        expect(result).toEqual({ userId: 1 });
    });
});
