import { DeepfakeDetectionService } from '../../../src/ml/services/deepfakeDetection.service';
import sharp from 'sharp';
import path from 'path';

// Mock sharp
jest.mock('sharp');

// Mock logger to avoid clutter
jest.mock('../../../src/utils/logger');

describe('DeepfakeDetectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should run without error', async () => {
      await expect(DeepfakeDetectionService.initialize()).resolves.not.toThrow();
    });
  });

  describe('analyzeImage', () => {
    it('should detect potential fake (low variance)', async () => {
      // Create a buffer with low variance (all same value)
      const lowVarianceData = Buffer.alloc(224 * 224 * 3, 100); 
      
      (sharp as unknown as jest.Mock).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        removeAlpha: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: lowVarianceData,
          info: {}
        })
      });

      const result = await DeepfakeDetectionService.analyzeImage(Buffer.from('dummy'));
      
      expect(result.isReal).toBe(false);
      expect(result.score).toBe(0.4);
      expect(result.artifacts).toContain('Low variance (potential blur/screen)');
    });

    it('should detect real image (high variance)', async () => {
      // Create a buffer with high variance (random noise)
      const highVarianceData = Buffer.alloc(224 * 224 * 3);
      for (let i = 0; i < highVarianceData.length; i++) {
        highVarianceData[i] = Math.floor(Math.random() * 255);
      }

      (sharp as unknown as jest.Mock).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        removeAlpha: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: highVarianceData,
          info: {}
        })
      });

      const result = await DeepfakeDetectionService.analyzeImage(Buffer.from('dummy'));
      
      expect(result.isReal).toBe(true);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.artifacts).toHaveLength(0);
    });

    it('should handle errors', async () => {
      (sharp as unknown as jest.Mock).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        removeAlpha: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error('Sharp error'))
      });

      await expect(DeepfakeDetectionService.analyzeImage(Buffer.from('dummy')))
        .rejects.toThrow('Deepfake analysis failed: Sharp error');
    });
  });
});
