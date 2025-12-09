import { MLController } from '../../../src/controllers/ml.controller';
import fs from 'fs';

jest.mock('../../../src/ml/services/deepfakeDetection.service', () => ({
  DeepfakeDetectionService: {
    initialize: jest.fn(async () => {}),
    analyzeImage: jest.fn(async () => ({ isReal: true, score: 0.9, confidence: 0.95, artifacts: [], processingTimeMs: 5 })),
  }
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('MLController', () => {
  it('should return analysis result when image provided', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('img'));
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined as any);
    const req = { file: { path: '/tmp/img.png', filename: 'img.png' }, user: { userId: 'u1' } } as any;
    const res = mockRes();
    await MLController.detectDeepfake(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isReal: true }));
  });

  it('should return 400 when no image provided', async () => {
    const res = mockRes();
    await MLController.detectDeepfake({} as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
