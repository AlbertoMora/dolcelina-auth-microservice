const { serviceConstants } = require('../../../dist/constants/service-constants');

describe('serviceConstants', () => {
    it('exposes unknown literal used by the service', () => {
        expect(serviceConstants.unknown).toBe('unknown');
    });
});
