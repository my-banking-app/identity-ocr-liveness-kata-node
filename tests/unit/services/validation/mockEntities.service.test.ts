import { MockEntitiesService } from '../../../../src/services/validation/mockEntities.service';

describe('MockEntitiesService', () => {
  it('consultRNEC should return NOT_FOUND when last digit is 2', async () => {
    const res = await MockEntitiesService.consultRNEC('123452');
    expect(res.status).toBe('NOT_FOUND');
  });

  it('consultRNEC should return CANCELLED when last digit is 8', async () => {
    const res = await MockEntitiesService.consultRNEC('123458');
    expect(res.status).toBe('CANCELLED');
  });

  it('consultRNEC should return VALID otherwise', async () => {
    const res = await MockEntitiesService.consultRNEC('123453');
    expect(res.status).toBe('VALID');
  });

  it('consultCancilleria should validate A00* passports', async () => {
    const ok = await MockEntitiesService.consultCancilleria('A0012345');
    expect(ok.status).toBe('VALID');
    const bad = await MockEntitiesService.consultCancilleria('B0012345');
    expect(bad.status).toBe('INVALID');
  });

  it('consultRUNT should return ACTIVE licenses', async () => {
    const res = await MockEntitiesService.consultRUNT('123456');
    expect(res.status).toBe('ACTIVE');
  });
});

