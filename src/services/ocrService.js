const crypto = require('node:crypto');

function normalizeBase64(data) {
  if (!data) throw new Error('Imagen requerida');
  const cleaned = data.replace(/^data:image\/(png|jpeg);base64,/, '');
  return Buffer.from(cleaned, 'base64');
}

function calculateQualityMetrics(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 2048));
  const mean = sample.reduce((acc, val) => acc + val, 0) / sample.length || 0;
  const variance =
    sample.reduce((acc, val) => {
      const diff = val - mean;
      return acc + diff * diff;
    }, 0) / sample.length || 0;
  const clarity = Math.min(1, variance / 5000);
  const brightnessScore = mean / 255;
  const glareRisk = brightnessScore > 0.85 ? 'alto' : brightnessScore > 0.65 ? 'medio' : 'bajo';
  return { brightnessScore, clarity, glareRisk };
}

function extractText(base64) {
  const buffer = normalizeBase64(base64);
  const hash = crypto.createHash('sha1').update(buffer).digest('hex');
  const simulatedText = `ID-${hash.slice(0, 8)}`;
  const quality = calculateQualityMetrics(buffer);
  return {
    text: simulatedText,
    confidence: Number((0.7 + quality.clarity * 0.3).toFixed(2)),
    quality,
  };
}

module.exports = { extractText, calculateQualityMetrics };
