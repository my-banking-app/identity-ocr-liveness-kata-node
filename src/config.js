const fs = require('node:fs');
const path = require('node:path');

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) return;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function buildConfig() {
  loadDotEnv();
  return {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-signing-key',
    auditKeyHex:
      process.env.AUDIT_LOG_KEY || 'b962f1e0b962f1e0b962f1e0b962f1e0b962f1e0b962f1e0b962f1e0b962f1e0',
    allowPublicRoutes: ['/health', '/auth/demo-token'],
  };
}

module.exports = { buildConfig };
