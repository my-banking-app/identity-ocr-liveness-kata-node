import request from 'supertest';
import app from '../../../src/app';

describe('Validation Routes', () => {
  let accessToken: string;

  beforeAll(async () => {
    const email = 'val@example.com';
    const password = 'secret123';
    const name = 'Val';
    await request(app).post('/api/auth/register').send({ email, password, name });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    accessToken = login.body.accessToken;
  });

  it('cedula should validate format and return result', async () => {
    const res = await request(app).post('/api/validation/cedula')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentNumber: '1234567' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isValid');
  });

  it('blacklist-check should return not blacklisted', async () => {
    const res = await request(app).post('/api/validation/blacklist-check')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentNumber: '1234567' });
    expect(res.status).toBe(200);
    expect(res.body.blacklisted).toBe(false);
  });

  it('status should return UNKNOWN for non-existing', async () => {
    const res = await request(app).get('/api/validation/status/000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  it('cross-check should return result', async () => {
    const res = await request(app).post('/api/validation/cross-check')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentNumber: '1234567', type: 'cedula', name: 'VAL', issueDate: '2010-05-20' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('crossCheck');
  });
});

