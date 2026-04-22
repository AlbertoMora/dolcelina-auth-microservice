jest.mock('geoip-lite', () => ({
    lookup: jest.fn(),
}));

const geoip = require('geoip-lite');
const { getLocationPattern } = require('../../../dist/utils/geo-helper');

describe('getLocationPattern', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns Unknown when geoip does not resolve data', () => {
        geoip.lookup.mockReturnValue(null);

        expect(getLocationPattern('1.1.1.1')).toBe('Unknown');
    });

    it('returns a normalized location string when geoip resolves data', () => {
        geoip.lookup.mockReturnValue({
            country: 'US',
            area: 'CA',
            city: 'San Jose',
            range: [0, 1],
        });

        expect(getLocationPattern('1.1.1.1')).toBe('US-CA-San Jose-0,1');
    });
});
