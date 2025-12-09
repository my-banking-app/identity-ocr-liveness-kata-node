const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildConfig } = require('../config');

const config = buildConfig();
const logPath = path.join(process.cwd(), 'logs', 'audit.log');

function ensureLogDir() {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function encryptLogEntry(payload) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(config.auditKeyHex, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const serialized = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(serialized, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted.toString('hex'),
  };
}

function logEvent(eventType, details) {
  ensureLogDir();
  const entry = {
    timestamp: new Date().toISOString(),
    eventType,
    ...encryptLogEntry(details),
  };
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
  return entry;
}

module.exports = { logEvent, encryptLogEntry };
