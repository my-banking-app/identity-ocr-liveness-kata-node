const crypto = require('node:crypto');
const { buildConfig } = require('../config');

const config = buildConfig();

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const signature = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [encHeader, encPayload, signature] = token.split('.');
  if (!encHeader || !encPayload || !signature) return null;
  const data = `${encHeader}.${encPayload}`;
  const expected = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (expected !== signature) return null;
  try {
    return JSON.parse(Buffer.from(encPayload, 'base64').toString('utf8'));
  } catch (err) {
    return null;
  }
}

function authenticateRequest(req) {
  const path = req.url.split('?')[0];
  if (config.allowPublicRoutes.includes(path)) {
    return { ok: true };
  }
  const header = req.headers['authorization'] || '';
  const token = header.replace('Bearer ', '').trim();
  const payload = verifyToken(token);
  if (!payload) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }
  req.user = payload;
  return { ok: true };
}

function createDemoToken() {
  return signToken({ sub: 'demo-user', roles: ['analyst'], iat: Math.floor(Date.now() / 1000) });
}

module.exports = {
  authenticateRequest,
  signToken,
  verifyToken,
  createDemoToken,
};
