import { OCRService } from '../../../src/services/ocr.service';
import { ImagePreprocessingService } from '../../../src/services/imagePreprocessing.service';

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    recognize: jest.fn(async () => ({ data: { text: 'C.C. 1.022.954.370\nNAME: JUAN PEREZ', confidence: 0.93 } })),
    terminate: jest.fn(async () => {}),
  }))
}));

jest.mock('../../../src/services/imagePreprocessing.service');

describe('OCRService', () => {
  it('processImage should return text, confidence and extracted data', async () => {
    (ImagePreprocessingService.preprocess as jest.Mock).mockResolvedValue(Buffer.from('preprocessed'));
    const res = await OCRService.processImage('doc.jpg');
    expect(res.text).toContain('C.C.');
    expect(res.confidence).toBeGreaterThan(0.5);
    expect(res.data.documentNumber).toBeDefined();
  });
});

