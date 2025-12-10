import { OCRController } from '../../../src/controllers/ocr.controller';

jest.mock('../../../src/services/ocr.service', () => ({
  OCRService: { processImage: jest.fn(async () => ({ text: 'X', confidence: 0.9, data: { documentNumber: '123456' } })) }
}));
jest.mock('../../../src/services/ocrQueue.service', () => ({
  ocrQueue: {
    add: jest.fn(async () => ({ id: 'job-1' })),
    getJob: jest.fn(async () => ({ id: 'job-1', getState: jest.fn(async () => 'completed'), returnvalue: { text: 'X' }, failedReason: null })),
  }
}));
jest.mock('../../../src/services/imagePreprocessing.service', () => ({
  ImagePreprocessingService: { validateQuality: jest.fn(async () => ({ valid: true })) }
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('OCRController', () => {
  it('analyzeDocument should return result when file', async () => {
    const req = { file: { path: 'doc.jpg' }, user: { userId: 'u1' } } as any;
    const res = mockRes();
    await OCRController.analyzeDocument(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ confidence: expect.any(Number) }));
  });

  it('analyzeDocument should 400 when no file', async () => {
    const res = mockRes();
    await OCRController.analyzeDocument({} as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('queueAnalysis should enqueue and return 202', async () => {
    const req = { file: { path: 'doc.jpg' }, user: { userId: 'u1' } } as any;
    const res = mockRes();
    await OCRController.queueAnalysis(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('getJobStatus should return job data', async () => {
    const res = mockRes();
    await OCRController.getJobStatus({ params: { id: 'job-1' } } as any, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'job-1', state: 'completed' }));
  });
});
