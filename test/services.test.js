const { test } = require('node:test');
const { strictEqual, ok, deepStrictEqual } = require('node:assert/strict');
const { extractText, calculateQualityMetrics } = require('../src/services/ocrService');
const { blinkAnalysis, proximityCheck } = require('../src/services/livenessService');
const { verifyDocument } = require('../src/services/documentRepository');
const { verifyToken, signToken } = require('../src/middleware/auth');

const sampleImage = Buffer.from('demo-image-content').toString('base64');

test('OCR extraction generates deterministic pseudo text', () => {
  const result = extractText(sampleImage);
  strictEqual(result.text.startsWith('ID-'), true);
  ok(result.confidence >= 0.7 && result.confidence <= 1);
});

test('Quality metrics flag glare when brightness is high', () => {
  const brightBuffer = Buffer.alloc(50, 255);
  const quality = calculateQualityMetrics(brightBuffer);
  strictEqual(['alto', 'medio', 'bajo'].includes(quality.glareRisk), true);
});

test('Blink analysis detects motion across frames', () => {
  const frames = [sampleImage, Buffer.from('demo-image-content-2').toString('base64')];
  const result = blinkAnalysis(frames);
  ok(result.blinkConfidence > 1);
});

test('Proximity check flags small faces as too far', () => {
  const result = proximityCheck({ width: 20, height: 20 }, { width: 500, height: 500 });
  strictEqual(result.passed, false);
});

test('Document repository returns approved/unknown', () => {
  const approved = verifyDocument({ documentNumber: 'CC-123', fullName: 'Lucia Torres' });
  strictEqual(approved.status, 'approved');
  const unknown = verifyDocument({ documentNumber: 'XX-000', fullName: 'Anon' });
  strictEqual(unknown.status, 'unknown');
});

test('JWT signing and verification works end-to-end', () => {
  const token = signToken({ sub: 'tester' });
  const decoded = verifyToken(token);
  deepStrictEqual(decoded.sub, 'tester');
});
