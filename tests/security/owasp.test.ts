import request from 'supertest';
import app from '../../src/app';

describe('OWASP Security Headers', () => {
  it('should have security headers configured', async () => {
    const res = await request(app).get('/health');
    
    // Helmet headers
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('strict-transport-security');
    expect(res.headers).toHaveProperty('x-download-options');
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers).toHaveProperty('x-xss-protection');
    
    // CORS
    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });

  it('should include rate limiting headers', async () => {
    const res = await request(app).get('/health');
    
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
    expect(res.headers).toHaveProperty('ratelimit-reset');
  });

  it('should not expose server information', async () => {
    const res = await request(app).get('/health');
    expect(res.headers).not.toHaveProperty('x-powered-by');
  });
});
