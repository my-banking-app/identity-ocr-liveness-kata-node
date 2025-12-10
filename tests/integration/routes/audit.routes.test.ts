jest.mock('../../../src/middleware/auth.middleware', () => ({ authenticateToken: (req: any, res: any, next: any) => { req.user = { userId: 'test-user' }; next(); } }));
import request from 'supertest';
import app from '../../../src/app';
import fs from 'node:fs';
import path from 'node:path';
import { CryptoService } from '../../../src/services/crypto.service';

const mkLogs = () => {
  const dir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return dir;
};

describe('Audit Routes', () => {
  let token: string;
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'x', name: 'A' });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'x' });
    token = res.body.accessToken;
  });

  it('should return decrypted application logs', async () => {
    const dir = mkLogs();
    const file = path.join(dir, `application-zzzz.log`);
    const encMsg = CryptoService.encrypt('hello');
    const encDetails = CryptoService.encrypt(JSON.stringify({ x: 1 }));
    const line = JSON.stringify({ message: `[ENCRYPTED] ${encMsg}`, details: `[ENCRYPTED] ${encDetails}` });
    fs.writeFileSync(file, `${line}\n`);
    const res = await request(app).get('/api/audit/logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.logs[0].message).toBe('hello');
    expect(res.body.logs[0].details).toEqual({ x: 1 });
  });

  it('should return decrypted security logs', async () => {
    const dir = mkLogs();
    const file = path.join(dir, `security-zzzz.log`);
    const encMsg = CryptoService.encrypt('sec');
    const line = JSON.stringify({ message: `[ENCRYPTED] ${encMsg}` });
    fs.writeFileSync(file, `${line}\n`);
    const res = await request(app).get('/api/audit/security-logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.logs[0].message).toBe('sec');
  });
});
