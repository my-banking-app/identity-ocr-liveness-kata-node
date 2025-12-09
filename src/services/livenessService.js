function computeDifferenceScore(frameA, frameB) {
  const maxLength = Math.max(frameA.length, frameB.length);
  let diff = 0;
  for (let i = 0; i < maxLength; i += 1) {
    const a = frameA[i] || 0;
    const b = frameB[i] || 0;
    diff += Math.abs(a - b);
  }
  const normalized = diff / (maxLength || 1) / 64; // escala reforzada para señales pequeñas
  return Number(Math.min(1, normalized).toFixed(3));
}

function blinkAnalysis(frames) {
  if (!Array.isArray(frames) || frames.length < 2) {
    throw new Error('Se requieren al menos dos frames para la prueba de parpadeo');
  }
  const buffers = frames.map((f) => Buffer.from(f.replace(/^data:image\/(png|jpeg);base64,/, ''), 'base64'));
  const score = computeDifferenceScore(buffers[0], buffers[1]);
  const passed = score > 0.02;
  return { passed, blinkConfidence: Number((score * 100).toFixed(2)) };
}

function proximityCheck(faceBox, frame) {
  if (!faceBox || !frame || !frame.width || !frame.height) {
    throw new Error('Dimensiones del frame requeridas');
  }
  const areaRatio = (faceBox.width * faceBox.height) / (frame.width * frame.height);
  const proximityScore = Math.min(1, areaRatio * 3);
  const passed = proximityScore > 0.18;
  return { passed, proximityScore: Number((proximityScore * 100).toFixed(2)) };
}

module.exports = { blinkAnalysis, proximityCheck };
