import sharp from 'sharp';
import { ImagePreprocessingService } from '../../../src/services/imagePreprocessing.service';

jest.mock('sharp');

describe('ImagePreprocessingService', () => {
  const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('buf'));
  const mockResize = jest.fn().mockReturnThis();
  const mockGrayscale = jest.fn().mockReturnThis();
  const mockNormalize = jest.fn().mockReturnThis();
  const mockSharpen = jest.fn().mockReturnThis();

  beforeEach(() => {
    (sharp as any).mockImplementation(() => ({
      metadata: jest.fn().mockResolvedValue({ width: 2500, height: 1800 }),
      resize: mockResize,
      grayscale: mockGrayscale,
      normalize: mockNormalize,
      sharpen: mockSharpen,
      toBuffer: mockToBuffer,
    }));
  });

  it('preprocess should chain operations and resize if large', async () => {
    const buf = await ImagePreprocessingService.preprocess('file.jpg');
    expect(buf).toBeInstanceOf(Buffer);
    expect(mockResize).toHaveBeenCalled();
    expect(mockGrayscale).toHaveBeenCalled();
    expect(mockNormalize).toHaveBeenCalled();
    expect(mockSharpen).toHaveBeenCalled();
  });

  it('validateQuality should return invalid if resolution too low', async () => {
    (sharp as any).mockImplementation(() => ({ metadata: jest.fn().mockResolvedValue({ width: 700, height: 500 }) }));
    const res = await ImagePreprocessingService.validateQuality('low.jpg');
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('Resolution too low');
  });

  it('validateQuality should return valid for good images', async () => {
    (sharp as any).mockImplementation(() => ({ metadata: jest.fn().mockResolvedValue({ width: 1200, height: 1000 }) }));
    const res = await ImagePreprocessingService.validateQuality('ok.jpg');
    expect(res.valid).toBe(true);
  });
});

