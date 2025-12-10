import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { config } from '../../src/config/env';
import { OCRService } from '../../src/services/ocr.service';
import { ImagePreprocessingService } from '../../src/services/imagePreprocessing.service';

// Mock services
jest.mock('../../src/services/ocr.service');
jest.mock('../../src/services/imagePreprocessing.service');

describe('File Upload Security', () => {
  let token: string;

  beforeAll(() => {
    token = jwt.sign(
      { id: 'test-user-id', username: 'testuser', role: 'user' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  it('should reject files that are too large', async () => {
    // 11MB buffer (limit is 10MB)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    
    const res = await request(app)
      .post('/api/ocr/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('document', largeBuffer, 'large-image.jpg');

    // Multer throws error, likely 500 without custom handler, but definitely not 200
    expect(res.status).not.toBe(200);
    // Usually Multer errors are 500 unless caught
  }, 20000); // Increase timeout for large buffer handling

  it('should reject invalid mime types', async () => {
    const res = await request(app)
      .post('/api/ocr/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('document', Buffer.from('fake-exe-content'), 'malware.exe');

    expect(res.status).not.toBe(200);
    // Should be caught by fileFilter
  });

  it('should pass valid image files', async () => {
    (OCRService.processImage as jest.Mock).mockResolvedValue({
      text: 'MOCKED',
      confidence: 100,
      data: {}
    });

    (ImagePreprocessingService.validateQuality as jest.Mock).mockResolvedValue({
      valid: true
    });

    const res = await request(app)
      .post('/api/ocr/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('document', Buffer.from('fake-image-content'), 'valid.jpg');

    expect(res.status).toBe(200);
  });
});
