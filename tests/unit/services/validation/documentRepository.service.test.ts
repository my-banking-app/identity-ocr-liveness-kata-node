import { DocumentRepositoryService } from '../../../../src/services/validation/documentRepository.service';

jest.mock('../../../../src/database/models/document.model', () => ({
  Document: {
    findOne: jest.fn(),
    create: jest.fn(async (d) => ({ id: 1, ...d })),
  }
}));

jest.mock('../../../../src/database/models/blacklist.model', () => ({
  Blacklist: {
    findOne: jest.fn(),
  }
}));

jest.mock('../../../../src/services/validation/mockEntities.service', () => ({
  MockEntitiesService: {
    consultRNEC: jest.fn(async () => ({ status: 'VALID', names: 'CIUDADANO EJEMPLAR', issueDate: '2010-05-20' })),
    consultCancilleria: jest.fn(async () => ({ status: 'VALID', type: 'Ordinario', expiry: '2030-01-01' })),
    consultRUNT: jest.fn(async () => ({ status: 'ACTIVE', categories: ['B1'] })),
  }
}));

describe('DocumentRepositoryService', () => {
  const { Document } = require('../../../../src/database/models/document.model');
  const { Blacklist } = require('../../../../src/database/models/blacklist.model');

  it('should return invalid for wrong format', async () => {
    const res = await DocumentRepositoryService.validateDocument('ABC', 'cedula');
    expect(res.isValid).toBe(false);
    expect(res.source).toBe('LOCAL_DB');
  });

  it('should return blacklisted if in blacklist', async () => {
    (Blacklist.findOne as jest.Mock).mockResolvedValue({ reason: 'fraud', createdAt: new Date(), isActive: true });
    const res = await DocumentRepositoryService.validateDocument('123456', 'cedula');
    expect(res.isValid).toBe(false);
    expect(res.source).toBe('BLACKLIST');
    (Blacklist.findOne as jest.Mock).mockResolvedValue(null);
  });

  it('should return local valid when document exists valid', async () => {
    (Document.findOne as jest.Mock).mockResolvedValue({ status: 'valid' });
    const res = await DocumentRepositoryService.validateDocument('123457', 'cedula');
    expect(res.isValid).toBe(true);
    expect(res.source).toBe('LOCAL_DB');
    (Document.findOne as jest.Mock).mockResolvedValue(null);
  });

  it('should fallback to external entities and cache', async () => {
    const res = await DocumentRepositoryService.validateDocument('123459', 'license');
    expect(res.isValid).toBe(true);
    expect(res.source).toBe('EXTERNAL_ENTITY');
  });

  it('getDocumentStatus should report UNKNOWN when not found', async () => {
    (Blacklist.findOne as jest.Mock).mockResolvedValue(null);
    const { Document } = require('../../../../src/database/models/document.model');
    (Document.findOne as jest.Mock).mockResolvedValue(null);
    const res = await DocumentRepositoryService.getDocumentStatus('000');
    expect(res.status).toBe('UNKNOWN');
  });
});

