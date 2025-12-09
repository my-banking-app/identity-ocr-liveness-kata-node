import { DocumentAlgorithms } from '../../../src/utils/validation/documentAlgorithms.utils';

describe('DocumentAlgorithms', () => {
  it('validateCedulaColombia should accept 6-10 digits', () => {
    expect(DocumentAlgorithms.validateCedulaColombia('123456')).toBe(true);
    expect(DocumentAlgorithms.validateCedulaColombia('1234567890')).toBe(true);
    expect(DocumentAlgorithms.validateCedulaColombia('12345')).toBe(false);
    expect(DocumentAlgorithms.validateCedulaColombia('12345678901')).toBe(false);
    expect(DocumentAlgorithms.validateCedulaColombia('12A456')).toBe(false);
  });

  it('validateLicense should mirror cedula format', () => {
    expect(DocumentAlgorithms.validateLicense('123456')).toBe(true);
    expect(DocumentAlgorithms.validateLicense('ABC123')).toBe(false);
  });

  it('validateMRZ should accept 44-char lines or fallback patterns', () => {
    const td3 = 'P<COLOMBIA' + '<'.repeat(35);
    const td3Line2 = 'ABCDEFGHIJKL0123456789<<<<<<<<<<<<<<<';
    const line2Padded = td3Line2.padEnd(44, '<');
    expect(DocumentAlgorithms.validateMRZ(`${td3}\n${line2Padded}`)).toBe(true);

    const bad = 'BAD\nFORMAT';
    expect(DocumentAlgorithms.validateMRZ(bad)).toBe(false);
  });

  it('luhnCheck should validate known sequences', () => {
    expect(DocumentAlgorithms.luhnCheck('79927398713')).toBe(true);
    expect(DocumentAlgorithms.luhnCheck('79927398714')).toBe(false);
  });
});

