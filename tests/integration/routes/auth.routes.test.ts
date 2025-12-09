import request from 'supertest';
import app from '../../../src/app';

describe('Auth Routes', () => {
  const email = 'int@example.com';
  const password = 'secret123';
  const name = 'Tester';
  let refreshToken: string;
  let accessToken: string;

  it('register should create user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
  });

  it('login should return tokens', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  });

  it('me should return profile with token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it('refresh should return new access token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('logout should revoke refresh token', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(res.status).toBe(200);
    const fail = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(fail.status).toBe(403);
  });
});

