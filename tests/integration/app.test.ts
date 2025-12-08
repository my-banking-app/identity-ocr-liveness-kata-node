import request from 'supertest';
import app from '../../src/app';

describe('App General Routes', () => {
  it('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'UP' });
  });

  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version');
  });
});
