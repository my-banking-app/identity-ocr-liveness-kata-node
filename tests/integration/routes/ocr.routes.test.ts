import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../src/app';
import { config } from '../../../src/config/env';
import { OCRService } from '../../../src/services/ocr.service';
import { ImagePreprocessingService } from '../../../src/services/imagePreprocessing.service';
import path from 'path';

// Mock OCR Service and ImagePreprocessingService
jest.mock('../../../src/services/ocr.service');
jest.mock('../../../src/services/imagePreprocessing.service');

describe('OCR Routes', () => {
  let token: string;

  beforeAll(() => {
    // Generate a valid token
    token = jwt.sign(
      { id: 'test-user-id', username: 'testuser', role: 'user' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  it('should reject requests without token', async () => {
    await request(app)
      .post('/api/ocr/analyze')
      .expect(401);
  });

  it('should process an uploaded image', async () => {
    // Mock implementation
    (OCRService.processImage as jest.Mock).mockResolvedValue({
      text: 'MOCKED OCR TEXT',
      confidence: 95,
      data: { name: 'JOHN DOE' }
    });

    (ImagePreprocessingService.validateQuality as jest.Mock).mockResolvedValue({
      valid: true
    });

    const res = await request(app)
      .post('/api/ocr/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('document', Buffer.from('fake-image-content'), 'test-image.jpg');

    if (res.status !== 200) {
      console.log('OCR Test Error Response:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text', 'MOCKED OCR TEXT');
    expect(res.body).toHaveProperty('confidence', 95);
  });
});
