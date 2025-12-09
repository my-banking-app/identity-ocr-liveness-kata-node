const http = require('node:http');
const { authenticateRequest, createDemoToken } = require('./middleware/auth');
const { extractText } = require('./services/ocrService');
const { verifyDocument } = require('./services/documentRepository');
const { blinkAnalysis, proximityCheck } = require('./services/livenessService');
const { logEvent } = require('./services/auditLogger');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Cuerpo inválido, se esperaba JSON'));
      }
    });
  });
}

async function handleRequest(req, res) {
  try {
    const authResult = authenticateRequest(req);
    if (!authResult.ok) {
      return sendJson(res, authResult.status, { error: authResult.message });
    }

    if (req.method === 'GET' && req.url.startsWith('/health')) {
      return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
    }

    if (req.method === 'GET' && req.url.startsWith('/auth/demo-token')) {
      return sendJson(res, 200, { token: createDemoToken() });
    }

    if (req.method === 'POST' && req.url.startsWith('/api/ocr/extract')) {
      const body = await parseBody(req);
      const result = extractText(body.imageBase64);
      logEvent('ocr', { route: '/api/ocr/extract', resultMeta: result.quality });
      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && req.url.startsWith('/api/liveness/blink')) {
      const body = await parseBody(req);
      const result = blinkAnalysis(body.frames);
      logEvent('liveness', { route: '/api/liveness/blink', result });
      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && req.url.startsWith('/api/liveness/proximity')) {
      const body = await parseBody(req);
      const result = proximityCheck(body.faceBox, body.frame);
      logEvent('liveness', { route: '/api/liveness/proximity', result });
      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && req.url.startsWith('/api/documents/verify')) {
      const body = await parseBody(req);
      const result = verifyDocument(body);
      logEvent('document', { route: '/api/documents/verify', result });
      return sendJson(res, 200, result);
    }

    return sendJson(res, 404, { error: 'Ruta no encontrada' });
  } catch (err) {
    return sendJson(res, 400, { error: err.message || 'Solicitud inválida' });
  }
}

function createServer() {
  return http.createServer(handleRequest);
}

module.exports = { createServer };
