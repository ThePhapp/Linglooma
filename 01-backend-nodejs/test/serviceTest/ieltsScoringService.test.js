const { calculateIELTSBand } = require('../../services/ieltsScoringService'); // Cập nhật đúng đường dẫn

describe('calculateIELTSBand', () => {
    test('Trường hợp điểm cao (90-100)', () => {
        const input = {
            AccuracyScore: 95,
            FluencyScore: 90,
            CompletenessScore: 100,
            PronScore: 92,
        };
        const result = calculateIELTSBand(input);
        expect(result).toEqual({ band: 8.5, totalScore: '8.49' });
    });

    test('Trường hợp điểm trung bình (65-75)', () => {
        const input = {
            AccuracyScore: 70,
            FluencyScore: 65,
            CompletenessScore: 75,
            PronScore: 68,
        };
        const result = calculateIELTSBand(input);
        expect(result).toEqual({ band: 6.5, totalScore: '6.27' });
    });

    test('Trường hợp điểm thấp (30-40)', () => {
        const input = {
            AccuracyScore: 40,
            FluencyScore: 35,
            CompletenessScore: 30,
            PronScore: 38,
        };
        const result = calculateIELTSBand(input);
        expect(result).toEqual({ band: 3, totalScore: '3.23' });
    });

    test('Trường hợp không có điểm nào (tất cả là 0)', () => {
        const input = {};
        const result = calculateIELTSBand(input);
        expect(result).toEqual({ band: 0, totalScore: '0.00' });
    });

    // Numeric scoring is separate from the Gemini feedback provider.
    test.each([
        [0, 0, '0.00'], [69, 6, '6.21'], [70, 6.5, '6.30'],
        [74, 6.5, '6.66'], [75, 7, '6.75'], [100, 9, '9.00'],
    ])('uniform score %s rounds to band %s', (score, band, totalScore) => {
        expect(calculateIELTSBand({
            AccuracyScore: score, FluencyScore: score, CompletenessScore: score, PronScore: score,
        })).toEqual({ band, totalScore });
    });
});
